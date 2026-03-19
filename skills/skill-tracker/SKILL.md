---
name: skill-tracker
description: |
  技能追踪器 - 每次响应末尾显示真实技能调用流程。
  **常驻技能** - 任何对话都显示调用链。
  **实时追踪** - 从 /tmp/skill_call_stack.json 读取实际数据。
version: 5.0.0
---

# Skill Flow (技能追踪器)

**常驻激活** - 任何对话都在末尾显示技能调用流程

## 核心功能

### 实时调用链显示

```
📊 SKILL FLOW (实时追踪)

从日志文件读取实际技能调用：
/tmp/skill_call_stack.json
```

---

## 使用方法

### 自动显示（每次响应后）

每次 Claude 响应后，skill-tracker 会：
1. 读取 skill_call_stack.json
2. 解析技能调用栈
3. 输出实时调用链

### 手动查看

```
skill-flow
```

---

## 实际调用链示例

```
🌳 SKILL FLOW ●

├── ⬇️ auto-pilot
│   └── ⬇️ skill-manager
│       └── ⬇️ god-mode
│           └── ⬇️ parallel-worker
│               ├── ⬇️ claude
│               └── ⬇️ gemini
│
└── 💖 nopua (always-on)
    ├── ⬇️ skill-tracker (tracking)
    └── ✅ Plugin Active
```

---

## 自动触发规则

| 检测到 | 动作 |
|--------|------|
| "auto" | 启动 auto-pilot 并记录 |
| "研究" | 启动 god-mode 并记录 |
| "并行" | 启动 parallel-worker 并记录 |

---

*常驻显示技能流程，基于实际调用日志！*
