# Prompt Optimizer | 提示词优化器

一个本地可直接打开的静态网页工具，用来把自然语言需求、上下文、限制条件和输出要求整理成更清晰的 AI 提示词。

## 功能

- 输入原始需求与补充上下文
- 指定必须包含和避免出现的内容
- 选择输出风格、格式与任务类型
- 自动识别更偏写作、代码、分析、规划还是提示词工程
- 自动提示缺失信息
- 生成可直接复制给 ChatGPT、Claude、Gemini 等模型的优化提示词

## 文件结构

- `index.html`：页面结构
- `styles.css`：样式
- `script.js`：提示词生成逻辑

## 使用方式

不需要安装依赖，直接打开 `index.html` 即可。

如果想用本地静态服务运行：

```bash
cd /Users/huangpaopao/Documents/personal-team-site/prompt-optimizer
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`

## 适用场景

- 整理模糊需求
- 给 AI 补充上下文
- 把“人话”转换成可执行提示词
- 在正式调用模型前先标准化输入
