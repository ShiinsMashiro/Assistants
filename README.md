# 医疗影像报告AI (Medical Report AI)

基于**预训练-微调范式**的医疗影像报告智能分析系统，支持中英文医疗数据处理和模型微调训练。

## 功能特性

- 🏥 **医疗影像报告处理** - 自动解析CT/X-ray/MRI等影像报告
- 🔍 **PHI脱敏** - 自动移除患者隐私信息（姓名、日期、ID等）
- 💬 **问答对生成** - 从报告文本自动构建训练数据
- ⚡ **LoRA微调** - 参数高效微调，降低训练成本
- 🌐 **多语言支持** - 中文/英文医学文献

## 项目结构

```
medical_report_ai/
├── 01_data_processor.py       # 数据处理：格式检测、清洗、问答对生成
├── 02_lora_trainer.py        # LoRA微调训练脚本
├── 03_download_data.py       # 公开数据集下载脚本
├── requirements.txt          # Python依赖
├── README.md                  # 本文档
├── LICENSE                   # MIT许可证
│
├── data/                     # 数据目录
│   ├── raw/                  # 原始数据
│   │   ├── pubmed_qa.json           # PubMedQA医学问答
│   │   ├── medqa.json               # 医学考试题
│   │   ├── medical_rw.json          # 医学阅读理解
│   │   ├── medmcqa.json             # 医学多选题
│   │   └── chinese_medical_qa.json  # 中文医疗报告
│   │
│   └── processed/            # 处理后数据
│       ├── training_data.jsonl      # 训练数据
│       ├── reports_*.json           # 清洗报告
│       └── qa_pairs_*.json          # 问答对
│
└── outputs/                  # 模型输出目录
```

## 环境要求

### 硬件需求

| 组件 | 最低要求 | 推荐配置 |
|------|----------|----------|
| **GPU** | NVIDIA GPU + 8GB显存 | 24GB+ 显存 |
| **内存** | 16GB RAM | 32GB+ RAM |
| **存储** | 20GB 可用空间 | 50GB+ |

### 软件依赖

```bash
# Python >= 3.8
python --version

# CUDA (用于GPU训练)
nvcc --version  # 推荐 CUDA 11.8+
```

## 快速开始

### 1. 安装依赖

```bash
# 克隆项目
git clone https://github.com/ShiinsMashiro/Assistants.git
cd Assistants/medical_report_ai

# 创建虚拟环境 (推荐)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

### 2. 下载公开数据集

```bash
# 列出可用数据集
python 03_download_data.py --list

# 下载所有数据集
python 03_download_data.py --output ./data/raw

# 下载指定数据集
python 03_download_data.py --dataset pubmedqa chinese
```

### 3. 处理数据

```bash
python 01_data_processor.py \
    --input ./data/raw \
    --output ./data/processed
```

**输出文件说明**:
- `reports_*.json` - 清洗后的医疗报告
- `qa_pairs_*.json` - 生成的问答对
- `training_data.jsonl` - **训练数据**，直接用于模型微调

### 4. 训练模型

```bash
# PubMedBERT (英文医学，推荐)
python 02_lora_trainer.py \
    --model pubmedbert \
    --data ./data/processed/training_data.jsonl \
    --output ./outputs/medical-report-v1 \
    --epochs 3

# BioBERT (生物医学)
python 02_lora_trainer.py --model biobert --data ./data/processed/training_data.jsonl

# Qwen (中文)
python 02_lora_trainer.py --model qwen --data ./data/processed/training_data.jsonl

# ChatGLM (中文对话)
python 02_lora_trainer.py --model chatglm --data ./data/processed/training_data.jsonl
```

### 5. 低显存优化

```bash
# 8GB 显存以下使用量化
python 02_lora_trainer.py \
    --model pubmedbert \
    --data ./data/processed/training_data.jsonl \
    --quantize \
    --batch-size 2

# 使用更小的 LoRA rank
python 02_lora_trainer.py --lora-r 4
```

## 模型选择

| 模型 | 语言 | 适用场景 | 显存需求 | 推荐度 |
|------|------|----------|----------|--------|
| **PubMedBERT** | 英文 | 医学文献分析 | ~8GB | ⭐⭐⭐⭐⭐ |
| BioBERT | 英文 | 生物医学文本 | ~8GB | ⭐⭐⭐⭐ |
| SciBERT | 英文 | 科学文献 | ~8GB | ⭐⭐⭐ |
| **Qwen2-7B** | 中文 | 中文医疗问答 | ~14GB | ⭐⭐⭐⭐⭐ |
| ChatGLM3-6B | 中文 | 中文医疗对话 | ~12GB | ⭐⭐⭐⭐ |

## 无GPU训练方案

如果本地没有GPU，可以使用以下方案：

### 1. Google Colab (免费)

```bash
# 在Colab中运行
!git clone https://github.com/ShiinsMashiro/Assistants.git
%cd Assistants/medical_report_ai
!pip install -r requirements.txt
!python 02_lora_trainer.py --model pubmedbert --data ./data/processed/training_data.jsonl
```

### 2. 云GPU服务

| 服务 | 特点 | 链接 |
|------|------|------|
| **AutoDL** | 国产，便宜 | autodl.com |
| **Lambda Lab** | 国外，稳定 | lambdalabs.com |
| **Vast.ai** | 竞价实例 | vast.ai |
| **RunPod** | 按需计费 | runpod.io |

### 3. 模型API服务

直接调用预训练模型API，无需训练：

```python
# OpenAI API
import openai
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "分析这份CT报告..."}]
)

# Claude API
import anthropic
client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-3-sonnet",
    messages=[{"role": "user", "content": "分析这份CT报告..."}]
)
```

## 数据格式

### 支持的输入格式

#### JSON
```json
{
  "id": "report_001",
  "modality": "CT",
  "region": "chest",
  "finding": "双肺纹理清晰，未见明显异常密度影...",
  "impression": "胸部CT平扫未见明显异常"
}
```

#### CSV
```csv
id,modality,region,finding,impression
report_001,CT,chest,双肺纹理清晰,未见明显异常
report_002,X-ray,spine,椎体边缘骨质增生,退行性改变
```

#### 纯文本
```
CT chest report: 双肺纹理清晰，未见明显异常密度影。诊断意见: 未见明显异常。
```

### 输出训练数据格式 (JSONL)

```jsonl
{"instruction": "影像有什么发现？", "input": "CT胸部平扫...", "output": "双肺纹理清晰，未见明显异常..."}
{"instruction": "诊断意见是什么？", "input": "...", "output": "建议定期复查"}
```

## LoRA 参数说明

| 参数 | 默认值 | 说明 | 调优建议 |
|------|--------|------|----------|
| `--lora-r` | 8 | 低秩矩阵秩，越大越强 | 4-64 |
| `--lora-alpha` | 16 | 缩放因子 | 通常 r×2 |
| `--lora-dropout` | 0.05 | Dropout | 0.01-0.1 |
| `--batch-size` | 4 | 批次大小 | 根据显存调整 |

## 推理使用

### 加载微调后的模型

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

model_path = "./outputs/medical-report-v1"

tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    device_map="auto"
)

# 推理
prompt = """请分析以下医疗影像报告：

检查类型: CT胸部平扫
影像发现: 右肺上叶见一直径约1.2cm结节，边缘可见毛刺征
诊断意见: 建议进一步检查

问题: 这份报告的主要发现和建议是什么？"""

inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
outputs = model.generate(**inputs, max_new_tokens=256)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

### 合并LoRA权重（可选）

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM

base_model = AutoModelForCausalLM.from_pretrained("microsoft/BiomedNLP-PubMedBERT...")
lora_model = PeftModel.from_pretrained(base_model, "./outputs/medical-report-v1")
merged_model = lora_model.merge_and_unload()
merged_model.save_pretrained("./outputs/merged-model")
```

## 公开数据集

本项目附带以下公开数据集：

| 数据集 | 语言 | 数量 | 描述 |
|--------|------|------|------|
| PubMedQA | 英文 | ~1K | 基于PubMed摘要的医学问答 |
| MedQA | 中英 | ~10K | 医学考试问答 (USMLE/中医) |
| MedMCQA | 英文 | ~194K | 医学多选题 |
| Medical RW | 英文 | ~2K | 医学阅读理解 |
| Chinese Medical QA | 中文 | ~2K | 中文医疗问答 |

**注意**: 大规模数据需从原始来源下载，脚本仅生成示例数据。

## 注意事项

### 数据隐私

- 🔒 处理过程自动移除 PHI 信息
- ⚠️ 使用前请确保数据已脱敏
- 📋 遵守相关医疗数据法规 (HIPAA/GDPR)

### 医学准确性

- ⚠️ AI生成内容仅供参考
- 🏥 不能替代专业医生诊断
- ✅ 最终决策需由医疗专业人员确认

## 常见问题

**Q: 显存不足怎么办？**
```bash
# 使用量化 (8GB -> ~4GB)
python 02_lora_trainer.py --quantize --batch-size 2

# 或减小序列长度
python 02_lora_trainer.py --max-length 256
```

**Q: 训练中断如何恢复？**
```bash
# 训练会自动保存checkpoint，使用相同output目录即可恢复
python 02_lora_trainer.py --data ./data/processed/training_data.jsonl --output ./outputs/resume
```

**Q: 如何添加自定义医疗术语？**
编辑 `01_data_processor.py` 中的 `Config.medical_terms` 字典。

**Q: 支持哪些影像类型？**
- CT (计算机断层扫描)
- X-ray (X光片)
- MRI (磁共振成像)
- Ultrasound (超声)
- PET (正电子发射断层扫描)

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 引用

如果你在研究中使用了本项目，请引用：

```bibtex
@software{medical_report_ai,
  title = {Medical Report AI - Pretraining-Finetuning Pipeline},
  author = {ShiinsMashiro},
  year = {2026},
  url = {https://github.com/ShiinsMashiro/Assistants}
}
```

## 相关项目

- [BERT](https://arxiv.org/abs/1810.04805) - 预训练-微调范式奠基工作
- [LoRA](https://arxiv.org/abs/2106.09685) - 低秩适应高效微调
- [PubMedBERT](https://microsoft.github.io/BioLM/) - 医学领域预训练模型
- [PEFT](https://github.com/huggingface/peft) - 参数高效微调库

## 联系方式

- GitHub Issues: [https://github.com/ShiinsMashiro/Assistants/issues](https://github.com/ShiinsMashiro/Assistants/issues)
