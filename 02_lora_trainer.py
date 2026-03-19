#!/usr/bin/env python3
"""
医疗影像报告AI - LoRA微调训练
Medical Image Report AI - LoRA Fine-tuning Script

基于 PEFT (Parameter-Efficient Fine-Tuning) 实现低成本医学模型微调
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict

import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
    EarlyStoppingCallback
)
from peft import (
    LoraConfig,
    get_peft_model,
    TaskType,
    prepare_model_for_kbit_training
)
from datasets import Dataset


# ============== 配置 ==============
class TrainingConfig:
    """LoRA训练配置"""

    # 基础模型选项
    MODEL_OPTIONS = {
        "pubmedbert": "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext",
        "biobert": "dmis-lab/biobert-base-cased-v1.2",
        "scibert": "allenai/scibert_scivocab_uncased",
        "qwen": "Qwen/Qwen2-7B-Instruct",
        "chatglm": "THUDM/chatglm3-6b",
    }

    DEFAULT_LORA_R = 8
    DEFAULT_LORA_ALPHA = 16
    DEFAULT_LORA_DROPOUT = 0.05
    DEFAULT_LORA_TARGET_MODULES = ["query", "value", "key"]
    DEFAULT_BATCH_SIZE = 4
    DEFAULT_LEARNING_RATE = 3e-4
    DEFAULT_NUM_EPOCHS = 3
    DEFAULT_WARMUP_STEPS = 100
    DEFAULT_MAX_SEQ_LENGTH = 512


# ============== 模型加载器 ==============
class ModelLoader:
    """加载预训练模型和分词器"""

    @staticmethod
    def load_tokenizer(model_name: str) -> AutoTokenizer:
        print(f"🔄 加载分词器: {model_name}")
        tokenizer = AutoTokenizer.from_pretrained(
            model_name,
            trust_remote_code=True,
            use_fast=False
        )
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        return tokenizer

    @staticmethod
    def load_model(
        model_name: str,
        use_quantization: bool = False,
        lora_config: Optional[LoraConfig] = None
    ) -> AutoModelForCausalLM:
        print(f"🔄 加载模型: {model_name}")
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"   设备: {device}")

        if use_quantization and device == "cuda":
            from transformers import BitsAndBytesConfig
            quantization_config = BitsAndBytesConfig(
                load_in_8bit=True,
                llm_int8_threshold=6.0,
                llm_int8_has_fp16_weight=False
            )
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                quantization_config=quantization_config,
                device_map="auto",
                trust_remote_code=True
            )
        else:
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                device_map="auto" if device == "cuda" else None,
                trust_remote_code=True
            )

        if lora_config:
            print(f"🔄 应用 LoRA 配置...")
            model = get_peft_model(model, lora_config)
            model.print_trainable_parameters()

        return model


# ============== 数据集处理 ==============
class DatasetProcessor:
    """处理训练数据"""

    @staticmethod
    def load_jsonl(file_path: str) -> List[Dict]:
        data = []
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    data.append(json.loads(line))
        return data

    @staticmethod
    def format_instruction_sample(sample: Dict, tokenizer: AutoTokenizer, max_length: int = 512) -> Dict:
        if sample.get("input"):
            prompt = f"""请根据以下信息回答问题。

信息: {sample['input']}

问题: {sample['instruction']}

回答: """
        else:
            prompt = f"""问题: {sample['instruction']}

回答: """

        encoded = tokenizer(
            prompt + sample["output"],
            truncation=True,
            max_length=max_length,
            padding="max_length",
            return_tensors=None
        )
        encoded["labels"] = encoded["input_ids"].copy()
        return encoded

    @staticmethod
    def prepare_dataset(
        data_file: str,
        tokenizer: AutoTokenizer,
        max_samples: Optional[int] = None,
        max_length: int = 512
    ) -> Dataset:
        raw_data = DatasetProcessor.load_jsonl(data_file)
        if max_samples and len(raw_data) > max_samples:
            raw_data = raw_data[:max_samples]
        print(f"📊 加载数据: {len(raw_data)} 条")
        dataset = Dataset.from_list(raw_data)

        def tokenize_fn(sample):
            return DatasetProcessor.format_instruction_sample(sample, tokenizer, max_length)

        dataset = dataset.map(
            tokenize_fn,
            remove_columns=dataset.column_names,
            desc="Tokenizing"
        )
        return dataset


# ============== 训练器 ==============
class MedicalReportTrainer:
    """医疗报告AI训练器"""

    def __init__(self, config: argparse.Namespace):
        self.config = config
        self.output_dir = config.output_dir or f"./outputs/{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    def setup_lora_config(self) -> LoraConfig:
        return LoraConfig(
            task_type=TaskType.CAUSAL_LM,
            r=self.config.lora_r or TrainingConfig.DEFAULT_LORA_R,
            lora_alpha=self.config.lora_alpha or TrainingConfig.DEFAULT_LORA_ALPHA,
            lora_dropout=self.config.lora_dropout or TrainingConfig.DEFAULT_LORA_DROPOUT,
            target_modules=self.config.lora_target_modules or TrainingConfig.DEFAULT_LORA_TARGET_MODULES,
            bias="none",
            inference_mode=False
        )

    def create_training_args(self) -> TrainingArguments:
        return TrainingArguments(
            output_dir=self.output_dir,
            num_train_epochs=self.config.epochs or TrainingConfig.DEFAULT_NUM_EPOCHS,
            per_device_train_batch_size=self.config.batch_size or TrainingConfig.DEFAULT_BATCH_SIZE,
            gradient_accumulation_steps=self.config.gradient_accumulation or 4,
            learning_rate=self.config.learning_rate or TrainingConfig.DEFAULT_LEARNING_RATE,
            warmup_steps=self.config.warmup_steps or TrainingConfig.DEFAULT_WARMUP_STEPS,
            logging_steps=10,
            save_steps=100,
            eval_steps=100,
            save_total_limit=3,
            load_best_model_at_end=True,
            metric_for_best_model="eval_loss",
            greater_is_better=False,
            fp16=self.config.fp16 and torch.cuda.is_available(),
            dataloader_num_workers=2,
            report_to="tensorboard",
            remove_unused_columns=False,
            optim="adamw_torch"
        )

    def train(self):
        print("=" * 60)
        print("🏥 医疗影像报告AI - LoRA微调训练")
        print("=" * 60)

        model_name = TrainingConfig.MODEL_OPTIONS.get(
            self.config.model.lower(),
            self.config.model
        )
        print(f"🤖 基础模型: {model_name}")

        tokenizer = ModelLoader.load_tokenizer(model_name)
        lora_config = self.setup_lora_config()
        model = ModelLoader.load_model(
            model_name,
            use_quantization=self.config.quantize,
            lora_config=lora_config
        )

        if not self.config.data:
            print("❌ 请指定训练数据文件 (--data)")
            sys.exit(1)

        dataset = DatasetProcessor.prepare_dataset(
            self.config.data,
            tokenizer,
            max_samples=self.config.max_samples
        )

        dataset = dataset.train_test_split(test_size=0.1, seed=42)
        train_dataset = dataset["train"]
        eval_dataset = dataset["test"]

        print(f"📊 训练集: {len(train_dataset)} 条")
        print(f"📊 验证集: {len(eval_dataset)} 条")

        training_args = self.create_training_args()
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=tokenizer,
            mlm=False
        )

        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            data_collator=data_collator,
            callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
        )

        print("\n🚀 开始训练...")
        trainer.train()

        print(f"\n💾 保存模型到: {self.output_dir}")
        trainer.save_model(self.output_dir)
        tokenizer.save_pretrained(self.output_dir)
        model.save_pretrained(self.output_dir)

        print("\n" + "=" * 60)
        print("✅ 训练完成!")
        print(f"📁 模型保存位置: {self.output_dir}")
        print("=" * 60)

        return self.output_dir


# ============== 主函数 ==============
def main():
    parser = argparse.ArgumentParser(description="医疗影像报告AI - LoRA微调")

    parser.add_argument("--model", "-m", default="pubmedbert",
                        choices=list(TrainingConfig.MODEL_OPTIONS.keys()),
                        help="基础模型")
    parser.add_argument("--data", "-d", required=True, help="训练数据文件 (JSONL格式)")
    parser.add_argument("--output", "-o", help="输出目录")
    parser.add_argument("--max-samples", type=int, default=None, help="最大样本数")
    parser.add_argument("--lora-r", type=int, default=TrainingConfig.DEFAULT_LORA_R, help="LoRA rank")
    parser.add_argument("--lora-alpha", type=int, default=TrainingConfig.DEFAULT_LORA_ALPHA, help="LoRA alpha")
    parser.add_argument("--lora-dropout", type=float, default=TrainingConfig.DEFAULT_LORA_DROPOUT, help="LoRA dropout")
    parser.add_argument("--epochs", "-e", type=int, default=TrainingConfig.DEFAULT_NUM_EPOCHS, help="训练轮数")
    parser.add_argument("--batch-size", "-b", type=int, default=TrainingConfig.DEFAULT_BATCH_SIZE, help="批次大小")
    parser.add_argument("--learning-rate", "-lr", type=float, default=TrainingConfig.DEFAULT_LEARNING_RATE, help="学习率")
    parser.add_argument("--warmup-steps", type=int, default=TrainingConfig.DEFAULT_WARMUP_STEPS, help="预热步数")
    parser.add_argument("--fp16", action="store_true", help="使用FP16混合精度")
    parser.add_argument("--quantize", action="store_true", help="使用8位量化")

    args = parser.parse_args()

    trainer = MedicalReportTrainer(args)
    trainer.train()


if __name__ == "__main__":
    main()
