#!/usr/bin/env python3
"""
医疗影像报告AI - 数据处理与训练流程
Medical Image Report AI - Data Processing & Training Pipeline

功能:
1. 数据格式自动检测与转换
2. 医疗文本清洗与结构化
3. 问答对生成
4. LoRA 微调训练
"""

import os
import json
import re
import argparse
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime

# ============== 配置 ==============
@dataclass
class Config:
    """医疗影像报告处理配置"""
    # 数据路径
    input_dir: str = "./data/raw"           # 原始数据目录
    output_dir: str = "./data/processed"    # 处理后数据目录

    # 模型配置
    base_model: str = "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext"
    model_name: str = "medical-report-ai"

    # LoRA 配置
    lora_r: int = 8
    lora_alpha: int = 16
    lora_dropout: float = 0.05
    lora_target_modules: List[str] = field(default_factory=lambda: ["query", "value"])

    # 训练配置
    batch_size: int = 4
    learning_rate: float = 3e-4
    num_epochs: int = 3
    warmup_steps: int = 100
    max_seq_length: int = 512

    # 医学专业术语库
    medical_terms: Dict[str, List[str]] = field(default_factory=lambda: {
        "modality": ["X-ray", "CT", "MRI", "Ultrasound", "PET", "SPECT"],
        "region": ["chest", "abdomen", "brain", "spine", "limb", "pelvis"],
        "finding": ["normal", "abnormal", "mass", "lesion", "fracture", "inflammation"],
        "severity": ["mild", "moderate", "severe", "critical"]
    })


# ============== 数据类型检测 ==============
class DataDetector:
    """自动检测数据格式"""

    SUPPORTED_FORMATS = {
        ".json": "json",
        ".jsonl": "jsonl",
        ".csv": "csv",
        ".xlsx": "excel",
        ".txt": "text",
        ".dcm": "dicom"
    }

    @classmethod
    def detect_format(cls, file_path: str) -> str:
        """检测文件格式"""
        ext = Path(file_path).suffix.lower()
        return cls.SUPPORTED_FORMATS.get(ext, "unknown")

    @classmethod
    def scan_directory(cls, directory: str) -> Dict[str, List[str]]:
        """扫描目录，返回格式分类的文件列表"""
        files_by_format = {}
        for root, _, files in os.walk(directory):
            for f in files:
                file_path = os.path.join(root, f)
                fmt = cls.detect_format(file_path)
                if fmt != "unknown":
                    files_by_format.setdefault(fmt, []).append(file_path)
        return files_by_format


# ============== 医疗文本处理器 ==============
class MedicalTextProcessor:
    """医疗文本清洗与标准化"""

    def __init__(self, config: Config):
        self.config = config
        self.terms = config.medical_terms

    def clean_text(self, text: str) -> str:
        """清洗医疗文本"""
        if not text:
            return ""

        # 移除多余空白
        text = re.sub(r'\s+', ' ', text)

        # 移除特殊字符（保留医疗符号）
        text = re.sub(r'[^\w\s\-\+\(\)\.\,%°]+', '', text)

        # 标准化术语
        text = self._normalize_terms(text)

        # 移除PHI信息（保护隐私）
        text = self._remove_phi(text)

        return text.strip()

    def _normalize_terms(self, text: str) -> str:
        """标准化医学术语"""
        text_lower = text.lower()

        # 标准化模态
        for modality in self.terms["modality"]:
            if modality.lower() in text_lower:
                text = re.sub(modality.lower(), modality, text, flags=re.IGNORECASE)

        # 标准化部位
        for region in self.terms["region"]:
            if region.lower() in text_lower:
                text = re.sub(region.lower(), region.capitalize(), text, flags=re.IGNORECASE)

        return text

    def _remove_phi(self, text: str) -> str:
        """移除受保护健康信息 (PHI)"""
        # 移除日期（患者检查日期等）
        patterns = [
            r'\d{4}[-/]\d{1,2}[-/]\d{1,2}',  # 2024-01-01
            r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}',  # 01/01/2024
            r'(Patient|Name|Patient Name)[\s:]+[A-Za-z]+',  # 患者姓名
            r'(ID|MRN|Accession)[\s:]+[\w\-]+',  # 病历号
        ]

        for pattern in patterns:
            text = re.sub(pattern, '[REDACTED]', text, flags=re.IGNORECASE)

        return text

    def extract_fields(self, text: str) -> Dict[str, str]:
        """从文本中提取关键字段"""
        fields = {
            "modality": "",
            "region": "",
            "findings": "",
            "impression": ""
        }

        text_lower = text.lower()

        # 提取模态
        for modality in self.terms["modality"]:
            if modality.lower() in text_lower:
                fields["modality"] = modality
                break

        # 提取部位
        for region in self.terms["region"]:
            if region.lower() in text_lower:
                fields["region"] = region
                break

        # 提取发现（通常在 "FINDINGS:" 或 "Finding:" 之后）
        finding_match = re.search(r'(?:findings|finding)[\s:]+(.+?)(?:\n|$)', text, re.IGNORECASE)
        if finding_match:
            fields["findings"] = finding_match.group(1)

        # 提取印象/结论（通常在 "IMPRESSION:" 或 "Conclusion:" 之后）
        impression_match = re.search(r'(?:impression|conclusion)[\s:]+(.+?)(?:\n|$)', text, re.IGNORECASE)
        if impression_match:
            fields["impression"] = impression_match.group(1)

        return fields


# ============== 问答对生成器 ==============
class QAGenerator:
    """生成医疗影像报告问答对"""

    TEMPLATES = {
        "modality": [
            ("这是什么类型的影像检查？", "{modality}"),
            ("影像检查方式是？", "{modality}"),
        ],
        "findings": [
            ("影像有什么发现？", "{findings}"),
            ("检查结果显示什么？", "{findings}"),
        ],
        "impression": [
            ("诊断意见是什么？", "{impression}"),
            ("最终结论是什么？", "{impression}"),
        ],
        "summary": [
            ("请总结这份影像报告", "检查类型: {modality}, 部位: {region}, 发现: {findings}, 意见: {impression}"),
            ("这份报告的主要结论是什么？", "{impression}"),
        ]
    }

    def __init__(self, config: Config):
        self.config = config
        self.processor = MedicalTextProcessor(config)

    def generate_qa_pairs(self, report_text: str, case_id: str = "") -> List[Dict]:
        """从报告文本生成问答对"""
        # 清洗并提取字段
        cleaned_text = self.processor.clean_text(report_text)
        fields = self.processor.extract_fields(cleaned_text)

        qa_pairs = []

        # 为每个字段生成问答对
        for field_name, templates in self.TEMPLATES.items():
            if fields.get(field_name):
                for question, answer_template in templates:
                    answer = answer_template.format(**fields)
                    qa_pairs.append({
                        "id": f"{case_id}_{field_name}_{len(qa_pairs)}",
                        "question": question,
                        "answer": answer,
                        "context": cleaned_text[:200],  # 保留上下文
                        "field": field_name
                    })

        # 添加摘要问答对
        if any(fields.values()):
            qa_pairs.extend(self._generate_summary_pairs(fields, case_id))

        return qa_pairs

    def _generate_summary_pairs(self, fields: Dict, case_id: str) -> List[Dict]:
        """生成摘要类问答对"""
        pairs = []
        for question, template in self.TEMPLATES["summary"]:
            answer = template.format(**{k: v or "未提及" for k, v in fields.items()})
            pairs.append({
                "id": f"{case_id}_summary_{len(pairs)}",
                "question": question,
                "answer": answer,
                "context": "",
                "field": "summary"
            })
        return pairs


# ============== 数据加载器 ==============
class MedicalReportLoader:
    """加载各种格式的医疗数据"""

    @staticmethod
    def load_json(file_path: str) -> List[Dict]:
        """加载 JSON 文件"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data if isinstance(data, list) else [data]

    @staticmethod
    def load_jsonl(file_path: str) -> List[Dict]:
        """加载 JSONL 文件"""
        data = []
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    data.append(json.loads(line))
        return data

    @staticmethod
    def load_csv(file_path: str) -> List[Dict]:
        """加载 CSV 文件"""
        import pandas as pd
        df = pd.read_csv(file_path)
        return df.to_dict('records')

    @staticmethod
    def load_text(file_path: str) -> List[Dict]:
        """加载文本文件，每行作为一个报告"""
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        return [{"text": line.strip(), "id": f"line_{i}"} for i, line in enumerate(lines) if line.strip()]


# ============== 数据集生成器 ==============
class DatasetGenerator:
    """生成训练数据集"""

    def __init__(self, config: Config):
        self.config = config
        self.processor = MedicalTextProcessor(config)
        self.qa_generator = QAGenerator(config)

    def process_directory(self, input_dir: str, output_dir: str) -> Tuple[int, int]:
        """处理整个目录的数据"""
        os.makedirs(output_dir, exist_ok=True)

        files_by_format = DataDetector.scan_directory(input_dir)
        all_reports = []
        all_qa_pairs = []

        # 加载所有文件
        for fmt, files in files_by_format.items():
            for file_path in files:
                try:
                    if fmt == "json":
                        records = MedicalReportLoader.load_json(file_path)
                    elif fmt == "jsonl":
                        records = MedicalReportLoader.load_jsonl(file_path)
                    elif fmt == "csv":
                        records = MedicalReportLoader.load_csv(file_path)
                    elif fmt == "text":
                        records = MedicalReportLoader.load_text(file_path)
                    else:
                        continue

                    for record in records:
                        report_text = self._extract_text_from_record(record)
                        if report_text:
                            all_reports.append({
                                "id": record.get("id", f"report_{len(all_reports)}"),
                                "text": report_text,
                                "source": file_path
                            })

                            # 生成问答对
                            case_id = record.get("id", f"report_{len(all_reports)}")
                            qa_pairs = self.qa_generator.generate_qa_pairs(report_text, case_id)
                            all_qa_pairs.extend(qa_pairs)

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

        # 保存处理后的数据
        self._save_processed_data(all_reports, all_qa_pairs, output_dir)

        return len(all_reports), len(all_qa_pairs)

    def _extract_text_from_record(self, record: Dict) -> str:
        """从记录中提取文本"""
        # 支持多种字段名
        text_fields = ["text", "report", "finding", "content", "description",
                       "finding_text", "report_text", "clinical_note"]

        for field in text_fields:
            if field in record and record[field]:
                return str(record[field])

        # 如果没有找到，尝试连接所有字符串字段
        text_parts = []
        for key, value in record.items():
            if isinstance(value, str) and len(value) > 20:  # 过滤短文本
                text_parts.append(value)

        return " ".join(text_parts) if text_parts else ""

    def _save_processed_data(self, reports: List[Dict], qa_pairs: List[Dict], output_dir: str):
        """保存处理后的数据"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # 保存报告
        reports_file = os.path.join(output_dir, f"reports_{timestamp}.json")
        with open(reports_file, 'w', encoding='utf-8') as f:
            json.dump(reports, f, ensure_ascii=False, indent=2)

        # 保存问答对
        qa_file = os.path.join(output_dir, f"qa_pairs_{timestamp}.json")
        with open(qa_file, 'w', encoding='utf-8') as f:
            json.dump(qa_pairs, f, ensure_ascii=False, indent=2)

        # 保存为训练友好的格式
        training_file = os.path.join(output_dir, "training_data.jsonl")
        with open(training_file, 'w', encoding='utf-8') as f:
            for qa in qa_pairs:
                # 格式化为训练数据
                formatted = {
                    "instruction": qa["question"],
                    "input": qa["context"],
                    "output": qa["answer"]
                }
                f.write(json.dumps(formatted, ensure_ascii=False) + "\n")

        print(f"✅ 数据已保存:")
        print(f"   - 报告数: {len(reports)}")
        print(f"   - 问答对: {len(qa_pairs)}")
        print(f"   - 训练文件: {training_file}")


# ============== 主函数 ==============
def main():
    parser = argparse.ArgumentParser(description="医疗影像报告数据处理")
    parser.add_argument("--input", "-i", default="./data/raw", help="原始数据目录")
    parser.add_argument("--output", "-o", default="./data/processed", help="输出目录")
    parser.add_argument("--model", "-m", default="microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext",
                        help="基础模型")
    parser.add_argument("--batch-size", "-b", type=int, default=4, help="批次大小")
    parser.add_argument("--epochs", "-e", type=int, default=3, help="训练轮数")

    args = parser.parse_args()

    # 创建配置
    config = Config(
        input_dir=args.input,
        output_dir=args.output,
        base_model=args.model,
        batch_size=args.batch_size,
        num_epochs=args.epochs
    )

    print("=" * 60)
    print("🏥 医疗影像报告AI - 数据处理流程")
    print("=" * 60)
    print(f"📁 输入目录: {config.input_dir}")
    print(f"📁 输出目录: {config.output_dir}")
    print(f"🤖 基础模型: {config.base_model}")
    print("=" * 60)

    # 生成数据集
    generator = DatasetGenerator(config)
    num_reports, num_qa_pairs = generator.process_directory(config.input_dir, config.output_dir)

    print("\n" + "=" * 60)
    print("✅ 数据处理完成!")
    print(f"   处理报告: {num_reports} 份")
    print(f"   生成问答对: {num_qa_pairs} 对")
    print("=" * 60)


if __name__ == "__main__":
    main()
