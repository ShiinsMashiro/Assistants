#!/usr/bin/env node
/**
 * Skill Manager - Real-time skill dispatch and tracking
 * Analyzes user input, matches keywords, logs to skill-tracker
 */

const fs = require('fs');
const path = require('path');

const SKILL_TRACKER = '/Users/huangpaopao/.claude/plugins/skill-tracker-plugin/1.0.0/src/skill-tracker.js';
const LOG_FILE = '/tmp/skill_dispatch_log.json';

// Dispatch map - keyword to skill mapping
const DISPATCH_MAP = {
  // Workflow
  '自动': ['auto-pilot'],
  'auto': ['auto-pilot'],
  '规划': ['project-planner'],
  '计划': ['project-planner'],
  '后台': ['async-runner'],
  '异步': ['async-runner'],
  '并行': ['parallel-worker'],
  '同时': ['parallel-worker'],

  // Research
  '研究': ['god-mode', 'parallel-worker'],
  '论文': ['pubmed-database', 'god-mode'],
  '学术': ['pubmed-database'],
  '蛋白质': ['alphafold-database'],
  '基因': ['biopython'],
  'DNA': ['biopython'],

  // Development
  '优化': ['simplify'],
  '简化': ['simplify'],
  '解释': ['gitnexus-assistant'],
  '这是啥': ['gitnexus-assistant'],
  '测试': ['auto-test'],
  '代码': ['gitnexus-assistant'],

  // Godot
  'godot': ['godot-test'],
  'test godot': ['godot-test'],
  '.gd': ['godot-test'],
  '.cs': ['godot-test'],
  '.tscn': ['godot-test'],
  'gdscript': ['godot-test'],

  // Learning
  '学习': ['skill-tracker', 'skill-manager'],
  '深度研究': ['god-mode', 'parallel-worker'],

  // File operations
  '保存': ['auto-commit'],
  '提交': ['auto-commit'],
  'push': ['auto-commit'],
  'commit': ['auto-commit'],

  // Scientific
  '化学': ['rdkit'],
  '分子': ['rdkit'],
  '量子': ['qiskit', 'pennylane'],
  '量子计算': ['qiskit', 'pennylane'],
};

// Skill categories for display
const SKILL_CATEGORIES = {
  '🚀 工作流': ['auto-pilot', 'project-planner', 'async-runner', 'parallel-worker'],
  '🔬 科研': ['god-mode', 'pubmed-database', 'alphafold-database', 'biopython'],
  '💻 编程': ['simplify', 'gitnexus-assistant', 'auto-test'],
  '🎮 游戏': ['godot-test', 'game-dev-loop'],
  '🧪 化学': ['rdkit', 'deepchem'],
  '⚛️ 量子': ['qiskit', 'pennylane', 'cirq'],
};

// Priority order for skills
const SKILL_PRIORITY = {
  'auto-pilot': 100,
  'god-mode': 90,
  'parallel-worker': 80,
  'skill-tracker': 70,
  'skill-manager': 70,
  'default': 50,
};

class SkillManager {
  constructor() {
    this.dispatchLog = LOG_FILE;
  }

  logDispatch(skills, input, reason) {
    try {
      let log = { dispatches: [], lastUpdate: Date.now() };
      if (fs.existsSync(this.dispatchLog)) {
        const data = fs.readFileSync(this.dispatchLog, 'utf8');
        log = JSON.parse(data);
      }

      log.dispatches.push({
        timestamp: Date.now(),
        skills,
        input: input.substring(0, 100),
        reason,
      });

      if (log.dispatches.length > 50) {
        log.dispatches = log.dispatches.slice(-50);
      }

      log.lastUpdate = Date.now();
      fs.writeFileSync(this.dispatchLog, JSON.stringify(log, null, 2));
    } catch (e) {
      // Ignore errors
    }
  }

  trackSkill(skillName, metadata = {}) {
    try {
      const { execSync } = require('child_process');
      execSync(`node "${SKILL_TRACKER}" push "${skillName}" '${JSON.stringify(metadata)}'`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } catch (e) {
      // Ignore errors
    }
  }

  analyze(input) {
    const lowerInput = input.toLowerCase();
    const matchedSkills = new Set();
    const matchReasons = [];

    // Check for file extensions
    const fileExtPatterns = [
      { pattern: /\.gd$/i, skill: 'godot-test' },
      { pattern: /\.cs$/i, skill: 'godot-test' },
      { pattern: /\.tscn$/i, skill: 'godot-test' },
    ];

    for (const { pattern, skill } of fileExtPatterns) {
      if (pattern.test(input)) {
        matchedSkills.add(skill);
        matchReasons.push(`文件扩展名: ${skill}`);
      }
    }

    // Check dispatch map
    for (const [keyword, skills] of Object.entries(DISPATCH_MAP)) {
      if (lowerInput.includes(keyword.toLowerCase())) {
        for (const skill of skills) {
          matchedSkills.add(skill);
        }
        matchReasons.push(`"${keyword}" → ${skills.join(', ')}`);
      }
    }

    // Always add resident skills
    matchedSkills.add('nopua');
    matchedSkills.add('skill-tracker');
    matchedSkills.add('skill-manager');  // Track self

    // Sort by priority
    const sortedSkills = Array.from(matchedSkills).sort((a, b) => {
      const priorityA = SKILL_PRIORITY[a] || SKILL_PRIORITY.default;
      const priorityB = SKILL_PRIORITY[b] || SKILL_PRIORITY.default;
      return priorityB - priorityA;
    });

    return {
      skills: sortedSkills,
      reasons: matchReasons,
      inputLength: input.length,
    };
  }

  trackAllSkills(analysis) {
    for (const skill of analysis.skills) {
      this.trackSkill(skill, { reason: 'dispatch' });
    }
  }

  formatOutput(analysis) {
    const lines = [];

    if (analysis.reasons.length > 0) {
      lines.push('**技能调度分析：**');
      for (const reason of analysis.reasons) {
        lines.push(`- ${reason}`);
      }
      lines.push('');
    }

    lines.push('**推荐技能：**');
    for (const skill of analysis.skills) {
      const category = Object.entries(SKILL_CATEGORIES)
        .find(([_, skills]) => skills.includes(skill));
      const catLabel = category ? ` [${category[0]}]` : '';
      lines.push(`- ${skill}${catLabel}`);
    }

    return lines.join('\n');
  }

  getHistory(count = 10) {
    try {
      if (fs.existsSync(this.dispatchLog)) {
        const data = fs.readFileSync(this.dispatchLog, 'utf8');
        const log = JSON.parse(data);
        return log.dispatches.slice(-count);
      }
    } catch (e) {
      // Ignore
    }
    return [];
  }
}

const manager = new SkillManager();
const action = process.argv[2];
const input = process.argv.slice(3).join(' ');

switch (action) {
  case 'analyze':
    if (!input) {
      console.error('Usage: skill-manager analyze <input>');
      process.exit(1);
    }
    const analysis = manager.analyze(input);
    manager.logDispatch(analysis.skills, input, analysis.reasons.join('; '));
    manager.trackAllSkills(analysis);
    console.log(manager.formatOutput(analysis));
    break;

  case 'track':
    if (!input) {
      console.error('Usage: skill-manager track <skill-name>');
      process.exit(1);
    }
    manager.trackSkill(input, { manual: true });
    console.log(`Tracked: ${input}`);
    break;

  case 'history':
    const history = manager.getHistory(10);
    console.log(JSON.stringify(history, null, 2));
    break;

  case 'list':
    console.log('**Available Skills:**\n');
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
      console.log(`${category}:`);
      for (const skill of skills) {
        console.log(`  - ${skill}`);
      }
      console.log('');
    }
    break;

  default:
    console.log('Skill Manager - analyze | track | history | list');
    process.exit(1);
}

module.exports = SkillManager;
