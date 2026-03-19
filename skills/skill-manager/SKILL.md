---
name: skill-manager
description: |
  技能调度器 - 遵循 s02 原理：加一个工具，只加一个 handler。
  动态 dispatch map，按需注册技能。
  基于"信息充分原则"优化：给AI的信息越充分，产出越好。
version: 3.0.0
---

# Skill Manager (技能管理器)

**遵循 s02 原理 + 文章优化原则**

> *"加一个工具, 只加一个 handler"*
> *"给AI的信息越充分，产出越好"*

## 核心功能

### 1. 智能分析 (skill-manager analyze)

自动分析用户输入，匹配关键词，调度技能：

```bash
skill-manager analyze "深度研究并优化 Learning 目录"
```

**输出：**
- 技能调度分析
- 推荐技能列表（含分类）
- 自动追踪到 skill-tracker

### 2. 技能追踪 (skill-manager track)

手动追踪指定技能：

```bash
skill-manager track "auto-pilot"
```

### 3. 历史记录 (skill-manager history)

查看最近调度历史：

```bash
skill-manager history
```

---

## Dispatch Map

### 🚀 工作流
| 关键词 | 技能 |
|--------|------|
| "自动"/"auto" | auto-pilot |
| "规划"/"计划" | project-planner |
| "后台"/"异步" | async-runner |
| "并行"/"同时" | parallel-worker |

### 🔬 科研
| 关键词 | 技能 |
|--------|------|
| "研究" | god-mode, parallel-worker |
| "论文" | pubmed-database, god-mode |
| "蛋白质" | alphafold-database |
| "基因"/"DNA" | biopython |

### 💻 编程
| 关键词 | 技能 |
|--------|------|
| "优化"/"简化" | simplify |
| "解释"/"这是啥" | gitnexus-assistant |
| "测试" | auto-test |

### 🎮 游戏
| 关键词 | 技能 |
|--------|------|
| "godot" | godot-test |
| ".gd"/".cs"/".tscn" | godot-test (自动) |

### 🧪 化学/量子
| 关键词 | 技能 |
|--------|------|
| "化学"/"分子" | rdkit |
| "量子" | qiskit, pennylane |

---

## 常驻技能

| 技能 | 说明 |
|------|------|
| `nopua` | 每次交互都用爱与尊重 |
| `skill-tracker` | 追踪技能调用 |
| `skill-manager` | 动态调度 |

---

## 设计原则

1. **Dispatch Map**: 关键词 → 技能
2. **动态注册**: 加技能不改循环
3. **按需激活**: 不用则不加载
4. **信息充分**: 收集足够上下文
5. **轻量优先**: 够用就好

---

*This skill follows s02 + 文章优化: 信息充分 + 测试优先 + 架构关注.*

