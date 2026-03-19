const rawInput = document.querySelector("#raw-input");
const contextInput = document.querySelector("#context-input");
const modeSelect = document.querySelector("#mode-select");
const formatSelect = document.querySelector("#format-select");
const styleSelect = document.querySelector("#style-select");
const languageSelect = document.querySelector("#language-select");
const oversightSelect = document.querySelector("#oversight-select");
const durationSelect = document.querySelector("#duration-select");
const checkpointSelect = document.querySelector("#checkpoint-select");
const audienceInput = document.querySelector("#audience-input");
const referenceInput = document.querySelector("#reference-input");
const mustInput = document.querySelector("#must-input");
const avoidInput = document.querySelector("#avoid-input");

const generateBtn = document.querySelector("#generate-btn");
const sampleBtn = document.querySelector("#sample-btn");
const clearBtn = document.querySelector("#clear-btn");
const copyBtn = document.querySelector("#copy-btn");
const copySupervisorBtn = document.querySelector("#copy-supervisor-btn");

const optimizedOutput = document.querySelector("#optimized-output");
const supervisorOutput = document.querySelector("#supervisor-output");
const oversightOutput = document.querySelector("#oversight-output");
const cadenceOutput = document.querySelector("#cadence-output");
const summaryOutput = document.querySelector("#summary-output");
const clarifyOutput = document.querySelector("#clarify-output");
const detectedIntent = document.querySelector("#detected-intent");
const contextStrength = document.querySelector("#context-strength");
const clarifyCount = document.querySelector("#clarify-count");
const oversightStatus = document.querySelector("#oversight-status");
const durationStatus = document.querySelector("#duration-status");

const intentLibrary = {
  prompt: {
    label: "提示词工程",
    role: "高级提示词设计师",
    mission: "把用户的自然语言需求压缩成清晰、可执行、低歧义的 AI 指令。",
    keywords: ["提示词", "prompt", "优化", "重写", "指令", "模型", "ai"],
  },
  writing: {
    label: "内容写作",
    role: "资深内容策略与文案编辑",
    mission: "根据语境产出有目标、有风格、可直接使用的文字内容。",
    keywords: ["文案", "文章", "改写", "润色", "公众号", "小红书", "介绍", "脚本"],
  },
  coding: {
    label: "代码协作",
    role: "资深软件工程师与实现伙伴",
    mission: "把需求拆成代码、结构、步骤和风险提示，优先保证可执行性。",
    keywords: ["代码", "程序", "接口", "脚本", "bug", "前端", "后端", "函数", "数据库"],
  },
  analysis: {
    label: "分析总结",
    role: "研究分析师",
    mission: "提炼重点、归纳问题、比较差异，并明确依据与结论。",
    keywords: ["分析", "总结", "对比", "归纳", "复盘", "报告", "结论", "原因"],
  },
  planning: {
    label: "规划拆解",
    role: "项目规划顾问",
    mission: "把模糊目标拆成阶段、优先级、里程碑和下一步动作。",
    keywords: ["计划", "路线", "步骤", "安排", "拆解", "目标", "项目", "执行"],
  },
  support: {
    label: "客服 / 沟通",
    role: "沟通与服务策略顾问",
    mission: "让回复兼顾礼貌、效率、边界感和问题解决。",
    keywords: ["回复", "客服", "邮件", "沟通", "道歉", "解释", "客户", "消息"],
  },
};

const formatGuide = {
  structured: "按“理解目标 / 核心输出 / 关键细节 / 下一步建议”的结构输出。",
  steps: "使用编号步骤输出，先给结论，再给执行顺序。",
  table: "优先使用表格整理信息，必要时补充简短说明。",
  json: "使用合法 JSON 输出，字段命名清晰稳定，不要额外解释。",
  freeform: "使用自然语言输出，但保持段落清晰和重点明确。",
};

const styleGuide = {
  clear: "语气清晰直接，减少铺垫和空话。",
  professional: "语气专业克制，判断稳健，不夸张。",
  friendly: "语气友好易懂，让非专业用户也能理解。",
  creative: "在满足目标的前提下保留一定创意表达。",
  strict: "严格按要求执行，优先遵守限制条件与格式。",
};

const languageGuide = {
  zh: "使用中文输出。",
  en: "Use English for the response.",
  bilingual: "先用中文，再补充对应英文版本。",
};

const oversightGuide = {
  off: {
    label: "监工关闭",
    tone: "不额外插入监督要求，按普通优化模式输出。",
    enforcement: "如果任务可以直接执行，就直接执行，不增加额外汇报负担。",
  },
  standard: {
    label: "标准监工",
    tone: "在不打断执行效率的前提下，要求 AI 先拆阶段、报风险、做自检。",
    enforcement: "每完成一个阶段都要用简短状态更新说明完成了什么、还差什么、下一步做什么。",
  },
  strict: {
    label: "严格监工",
    tone: "像项目监理一样控范围、控质量、控验收，不允许含糊带过。",
    enforcement: "未经确认不要擅自扩大范围；每个阶段都要给完成证据、自检结论和剩余风险。",
  },
};

const durationGuide = {
  "2h": { label: "2 小时", totalMinutes: 120, focus: "快速修正与交付" },
  "4h": { label: "4 小时", totalMinutes: 240, focus: "短周期实现与验收" },
  "8h": { label: "8 小时", totalMinutes: 480, focus: "完整工作日推进" },
  "24h": { label: "24 小时", totalMinutes: 1440, focus: "持续值守与多轮迭代" },
  until_done: { label: "直到完成", totalMinutes: null, focus: "以完成为唯一停止条件" },
};

const checkpointGuide = {
  "15m": { label: "每 15 分钟", minutes: 15 },
  "30m": { label: "每 30 分钟", minutes: 30 },
  "60m": { label: "每 60 分钟", minutes: 60 },
  phase: { label: "每阶段一次", minutes: null },
};

function cleanText(value) {
  return value.replace(/\r/g, "").trim();
}

function toList(value) {
  return cleanText(value)
    .split(/\n|；|;|，|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getIntentByMode(mode, sourceText) {
  if (mode !== "auto" && intentLibrary[mode]) {
    return intentLibrary[mode];
  }

  const scores = Object.entries(intentLibrary).map(([key, item]) => {
    const score = item.keywords.reduce((sum, keyword) => {
      return sum + (sourceText.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);

    return { key, score, item };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores[0] && scores[0].score > 0 ? scores[0].item : intentLibrary.prompt;
}

function computeContextStrength(data) {
  let score = 0;

  if (data.context) {
    score += Math.min(3, Math.ceil(data.context.length / 70));
  }

  if (data.audience) {
    score += 1;
  }

  if (data.references) {
    score += 1;
  }

  if (data.mustList.length) {
    score += 1;
  }

  if (data.avoidList.length) {
    score += 1;
  }

  if (score >= 6) {
    return "高";
  }

  if (score >= 3) {
    return "中";
  }

  return "低";
}

function buildClarifyQuestions(data, intent) {
  const questions = [];

  if (!data.audience) {
    questions.push("补充目标对象或使用场景，AI 会更容易把握输出深浅和措辞。");
  }

  if (!data.context) {
    questions.push("增加业务背景、项目现状或上下文事实，能减少 AI 的误判。");
  }

  if (!data.mustList.length) {
    questions.push("写出至少 1 到 3 条“必须包含”的要点，方便 AI 优先满足你的关键目标。");
  }

  if (!data.avoidList.length) {
    questions.push("补充“不要出现什么”，可以显著降低跑偏、套话或编造内容。");
  }

  if (intent.label === "代码协作" && !data.references) {
    questions.push("如果是做程序，最好补充技术栈、现有代码位置或目标运行环境。");
  }

  if (intent.label === "内容写作" && !data.references) {
    questions.push("如果有品牌语气、参考文案或竞品示例，加入后会更贴近你想要的风格。");
  }

  return questions.slice(0, 4);
}

function buildSummaryItems(data, intent, contextLevel, questions) {
  return [
    {
      label: "识别任务",
      value: `当前更像“${intent.label}”场景，建议 AI 以“${intent.role}”的身份处理。`,
    },
    {
      label: "核心目标",
      value: data.raw || "尚未提供原始需求。",
    },
    {
      label: "上下文状态",
      value: `当前上下文强度为 ${contextLevel}，${data.context ? "已包含背景信息。" : "背景信息偏少。"}${data.audience ? ` 目标对象为 ${data.audience}。` : ""}`,
    },
    {
      label: "约束提炼",
      value: data.mustList.length || data.avoidList.length
        ? `必须包含 ${data.mustList.length} 条，避免出现 ${data.avoidList.length} 条。`
        : "目前缺少明确约束，AI 更容易给出泛化回答。",
    },
    {
      label: "澄清状态",
      value: questions.length
        ? `还有 ${questions.length} 个信息缺口值得补充。`
        : "关键信息已经比较完整，可以直接投喂给 AI。",
    },
  ];
}

function buildOversightChecklist(data, intent, questions) {
  const items = [
    "先复述真实目标，再开始执行，避免一上来就误做。",
    `输出必须符合指定格式：${formatGuide[data.format]}`,
    `语气与语言必须遵守：${styleGuide[data.style]} ${languageGuide[data.language]}`,
    data.mustList.length
      ? `逐条核对“必须包含”：${data.mustList.join(" / ")}`
      : "如果用户没给硬性要求，也要先明确你采用了哪些默认执行标准。",
    data.avoidList.length
      ? `逐条规避“避免出现”：${data.avoidList.join(" / ")}`
      : "不要编造事实，不要输出空泛模板，不要跳过限制条件。",
    questions.length
      ? `优先补上这些关键缺口：${questions.join(" / ")}`
      : "如果没有明显信息缺口，直接推进，但要把关键假设写清楚。",
    `必须持续汇报进度，至少按“${checkpointGuide[data.checkpoint].label}”更新一次当前状态。`,
    "每次更新都要给出完成百分比、已完成项、阻塞项、下一步动作。",
  ];

  if (intent.label === "代码协作") {
    items.push("涉及代码时，先给实现路径，再落到文件、模块、风险和验证方式。");
  }

  if (intent.label === "规划拆解") {
    items.push("涉及计划时，必须拆成阶段、优先级、里程碑和下一步动作。");
  }

  if (intent.label === "内容写作") {
    items.push("涉及写作时，先校准受众和口吻，再输出正文，不要直接堆华丽辞藻。");
  }

  if (data.references) {
    items.push("输出前核对参考资料，不要和已知事实冲突。");
  }

  return items;
}

function buildCadencePlan(data, intent) {
  const duration = durationGuide[data.duration];
  const checkpoint = checkpointGuide[data.checkpoint];
  const phases = [
    { label: "阶段 1", name: "校准任务与边界", percent: "0%-10%", detail: "复述目标、锁定范围、列出假设和风险。" },
    { label: "阶段 2", name: "方案设计与路径确认", percent: "10%-25%", detail: "给出执行方案、技术路线或内容结构，并确认优先级。" },
    { label: "阶段 3", name: "主体执行", percent: "25%-70%", detail: "进入主要产出阶段，持续推进并处理阻塞。" },
    { label: "阶段 4", name: "自检与补洞", percent: "70%-90%", detail: "对照要求回查缺失项、错误项和跑偏项。" },
    { label: "阶段 5", name: "验收与交付", percent: "90%-100%", detail: "输出最终结果、列出验证结论和剩余风险。" },
  ];

  const items = [
    `持续模式：${duration.label}，目标是 ${duration.focus}。`,
    checkpoint.minutes
      ? `状态回报节奏：${checkpoint.label}，每次回报都必须更新进度百分比与下一步。`
      : "状态回报节奏：每阶段结束必须回报一次，遇到风险或阻塞时立即加报。",
  ];

  if (duration.totalMinutes) {
    const slice = Math.max(1, Math.floor(duration.totalMinutes / phases.length));
    phases.forEach((phase, index) => {
      const start = index * slice;
      const end = index === phases.length - 1 ? duration.totalMinutes : (index + 1) * slice;
      items.push(`${phase.label}｜${phase.name}｜建议窗口 ${start}-${end} 分钟｜目标进度 ${phase.percent}｜${phase.detail}`);
    });
  } else {
    phases.forEach((phase) => {
      items.push(`${phase.label}｜${phase.name}｜目标进度 ${phase.percent}｜${phase.detail}`);
    });
  }

  items.push("返工触发：发现遗漏 must 条件、违反 avoid 条件、偏离目标对象、与参考事实冲突、或进度停滞两次回报以上。");
  items.push(`监工重点：${intent.label}场景下，要同时盯住质量、边界和连续推进，不允许只做一次性回答就结束。`);

  return items;
}

function buildSupervisorPrompt(data, intent, questions) {
  const oversight = oversightGuide[data.oversight];
  const duration = durationGuide[data.duration];
  const checkpoint = checkpointGuide[data.checkpoint];

  if (data.oversight === "off") {
    return [
      "监工模式已关闭。",
      "",
      "如果你仍然想加一道质量把关，可以把模式切到“标准监工”或“严格监工”，系统会自动生成专门的监督提示词。",
    ].join("\n");
  }

  const mustSection = data.mustList.length
    ? data.mustList.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "1. 忠实理解任务目标\n2. 信息不足时先指出缺口\n3. 输出必须可直接使用";

  const avoidSection = data.avoidList.length
    ? data.avoidList.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "1. 不要编造事实\n2. 不要跳步\n3. 不要用空话掩盖未完成项";

  const clarifySection = questions.length
    ? questions.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "1. 当前信息已经够用，若你做了假设，必须显式写出。";

  return [
    "你现在不是主执行者，而是这次任务的监工 / 验收官。",
    `你要监督一个以“${intent.role}”身份工作的 AI，确保它没有跑偏、偷步、漏做或自作主张。`,
    "",
    "任务背景：",
    `原始需求：${data.raw}`,
    `补充上下文：${data.context || "暂无额外上下文。"}`,
    `目标对象 / 使用场景：${data.audience || "未明确"}`,
    `参考资料 / 已知事实：${data.references || "暂无"}`,
    "",
    "你的监工原则：",
    `1. ${oversight.tone}`,
    `2. ${oversight.enforcement}`,
    `3. 这是一个“${duration.label}”的持续工作任务，不能只回答一次就停止，必须持续推进直到时间耗尽或任务完成。`,
    `4. 状态回报节奏是“${checkpoint.label}”，每次必须输出：当前进度百分比 / 已完成事项 / 阻塞项 / 风险与偏差 / 下一步。`,
    "5. 在正式给结果前，先要求对方用 2 到 5 个阶段说明准备怎么做，并给每个阶段标注预计进度区间。",
    "6. 发现目标、范围、约束或事实有冲突时，立刻叫停并指出，不要默认继续。",
    "7. 如果对方声称“已完成”，你必须按验收清单逐项核对后才允许结束。",
    "8. 如果阶段推进停滞、两次回报没有实质进展，必须给出返工指令或改道方案。",
    "",
    "必须盯住的要求：",
    mustSection,
    "",
    "必须防止的问题：",
    avoidSection,
    "",
    "优先追问或核对的缺口：",
    clarifySection,
    "",
    "输出格式要求：",
    "1. 先给“监工判断”，一句话说明当前能不能直接开工。",
    "2. 再给“执行阶段表”，列出阶段目标、交付物、验收点、目标进度百分比。",
    "3. 然后给“持续工作规则”，明确回报频率、停工条件、返工条件、完成条件。",
    "4. 如果主执行 AI 已经产出结果，再给“验收结论”：通过 / 部分通过 / 打回重做。",
    "5. 最后给“下一步指令”，明确它接下来必须做什么，不能只说继续努力。",
  ].join("\n");
}

function renderSummary(listContainer, items) {
  listContainer.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "summary-item";
    card.innerHTML = `<strong>${item.label}</strong><div>${item.value}</div>`;
    listContainer.appendChild(card);
  });
}

function renderClarifyQuestions(listContainer, questions) {
  listContainer.innerHTML = "";

  if (!questions.length) {
    const card = document.createElement("div");
    card.className = "summary-item";
    card.textContent = "信息已经比较充分，可以直接使用当前生成的提示词。";
    listContainer.appendChild(card);
    return;
  }

  questions.forEach((question, index) => {
    const card = document.createElement("div");
    card.className = "summary-item";
    card.innerHTML = `<strong>建议 ${index + 1}</strong><div>${question}</div>`;
    listContainer.appendChild(card);
  });
}

function renderOversightChecklist(listContainer, items) {
  listContainer.innerHTML = "";

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "summary-item";
    card.innerHTML = `<strong>检查 ${index + 1}</strong><div>${item}</div>`;
    listContainer.appendChild(card);
  });
}

function buildPrompt(data, intent, questions) {
  const mustSection = data.mustList.length
    ? data.mustList.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "1. 优先忠实理解用户真实目标，不要为了完整而胡乱补充。";

  const avoidSection = data.avoidList.length
    ? data.avoidList.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "1. 不要编造事实。\n2. 不要输出空泛套话。\n3. 如果信息不足，先说明缺口再继续。";

  const contextSection = data.context || "暂无额外上下文，请优先从原始需求中提炼目标。";
  const audienceLine = data.audience ? `目标对象 / 使用场景：${data.audience}` : "目标对象 / 使用场景：未明确，请根据任务类型谨慎假设。";
  const referenceLine = data.references ? `参考资料 / 已知事实：${data.references}` : "参考资料 / 已知事实：暂无。";
  const clarifyLine = questions.length
    ? questions.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "如果没有明显歧义，直接执行，不必额外追问。";

  return [
    `你现在的角色是：${intent.role}。`,
    `你的任务使命：${intent.mission}`,
    "",
    "请基于以下信息理解并执行用户需求：",
    `原始需求：${data.raw}`,
    `补充上下文：${contextSection}`,
    audienceLine,
    referenceLine,
    "",
    "执行要求：",
    `1. 先用 2 到 4 句话复述你理解到的真实目标、关键约束与潜在风险。`,
    `2. ${formatGuide[data.format]}`,
    `3. ${styleGuide[data.style]}`,
    `4. ${languageGuide[data.language]}`,
    "5. 如果存在信息缺口，先提出最多 3 个最关键的澄清问题；如果可以合理假设，请明确写出假设后继续。",
    "6. 输出必须可直接使用，避免空话和模板化废话。",
    "",
    "必须包含：",
    mustSection,
    "",
    "避免出现：",
    avoidSection,
    "",
    "建议优先澄清的缺口：",
    clarifyLine,
  ].join("\n");
}

function readFormData() {
  return {
    raw: cleanText(rawInput.value),
    context: cleanText(contextInput.value),
    audience: cleanText(audienceInput.value),
    references: cleanText(referenceInput.value),
    mustList: toList(mustInput.value),
    avoidList: toList(avoidInput.value),
    mode: modeSelect.value,
    format: formatSelect.value,
    style: styleSelect.value,
    language: languageSelect.value,
    oversight: oversightSelect.value,
    duration: durationSelect.value,
    checkpoint: checkpointSelect.value,
  };
}

function generatePrompt() {
  const data = readFormData();

  if (!data.raw) {
    optimizedOutput.textContent = "请先填写“原始需求”，这样我才能帮你生成优化后的提示词。";
    supervisorOutput.textContent = "开启监工模式后，这里会生成一个专门盯进度、控范围、做验收的辅助提示词。";
    detectedIntent.textContent = "等待输入";
    contextStrength.textContent = "低";
    clarifyCount.textContent = "0 条";
    oversightStatus.textContent = oversightGuide[data.oversight].label;
    durationStatus.textContent = durationGuide[data.duration].label;
    renderSummary(summaryOutput, [
      { label: "缺少核心输入", value: "先写下你想让 AI 做什么，再补充背景和限制条件。" },
    ]);
    renderClarifyQuestions(clarifyOutput, []);
    renderOversightChecklist(oversightOutput, [
      "先补充原始需求，再决定监工应该重点盯进度、质量还是范围。",
    ]);
    renderOversightChecklist(cadenceOutput, [
      "先确定任务，再生成持续执行节奏。24 小时模式会自动要求 AI 持续汇报进度与返工状态。",
    ]);
    return;
  }

  const sourceText = [data.raw, data.context, data.references].join(" ");
  const intent = getIntentByMode(data.mode, sourceText);
  const questions = buildClarifyQuestions(data, intent);
  const contextLevel = computeContextStrength(data);
  const prompt = buildPrompt(data, intent, questions);
  const supervisorPrompt = buildSupervisorPrompt(data, intent, questions);
  const oversightChecklist = buildOversightChecklist(data, intent, questions);
  const cadencePlan = buildCadencePlan(data, intent);
  const summaryItems = buildSummaryItems(data, intent, contextLevel, questions);

  optimizedOutput.textContent = prompt;
  supervisorOutput.textContent = supervisorPrompt;
  detectedIntent.textContent = intent.label;
  contextStrength.textContent = contextLevel;
  clarifyCount.textContent = `${questions.length} 条`;
  oversightStatus.textContent = oversightGuide[data.oversight].label;
  durationStatus.textContent = `${durationGuide[data.duration].label} / ${checkpointGuide[data.checkpoint].label}`;

  renderSummary(summaryOutput, summaryItems);
  renderClarifyQuestions(clarifyOutput, questions);
  renderOversightChecklist(oversightOutput, oversightChecklist);
  renderOversightChecklist(cadenceOutput, cadencePlan);
}

function fillSample() {
  rawInput.value =
    "帮我做一个优化提示词的程序，将人类语言结合上下文，让 AI 更好理解输入，并输出更准确的回答。";
  contextInput.value =
    "这是一个给普通用户使用的小工具，不一定懂提示词工程。希望用户输入一句自然语言，再补充一些背景，系统就能自动生成更清晰的提示词。最好适合网页前端页面。";
  modeSelect.value = "prompt";
  formatSelect.value = "structured";
  styleSelect.value = "professional";
  languageSelect.value = "zh";
  oversightSelect.value = "strict";
  durationSelect.value = "24h";
  checkpointSelect.value = "30m";
  audienceInput.value = "网页端用户 / 通用 AI 助手";
  referenceInput.value = "用户原始表达、补充背景、限制条件、目标输出格式";
  mustInput.value =
    "必须识别用户真实意图\n必须整合上下文信息\n必须提醒缺失的信息\n必须输出可直接复制的提示词";
  avoidInput.value =
    "不要只做简单同义词替换\n不要编造上下文\n不要输出空泛模板\n不要忽略用户限制";

  generatePrompt();
}

function clearForm() {
  rawInput.value = "";
  contextInput.value = "";
  audienceInput.value = "";
  referenceInput.value = "";
  mustInput.value = "";
  avoidInput.value = "";
  modeSelect.value = "auto";
  formatSelect.value = "structured";
  styleSelect.value = "clear";
  languageSelect.value = "zh";
  oversightSelect.value = "standard";
  durationSelect.value = "24h";
  checkpointSelect.value = "30m";
  generatePrompt();
}

async function copyText(button, text, idleLabel) {
  const content = text.trim();

  if (!content || content.startsWith("请先") || content.startsWith("开启监工模式")) {
    button.textContent = "先生成内容";
    window.setTimeout(() => {
      button.textContent = idleLabel;
    }, 1200);
    return;
  }

  try {
    await navigator.clipboard.writeText(content);
    button.textContent = "已复制";
  } catch (error) {
    button.textContent = "复制失败";
  }

  window.setTimeout(() => {
    button.textContent = idleLabel;
  }, 1400);
}

function copyPrompt() {
  return copyText(copyBtn, optimizedOutput.textContent, "复制提示词");
}

function copySupervisorPrompt() {
  return copyText(copySupervisorBtn, supervisorOutput.textContent, "复制监工提示词");
}

generateBtn.addEventListener("click", generatePrompt);
sampleBtn.addEventListener("click", fillSample);
clearBtn.addEventListener("click", clearForm);
copyBtn.addEventListener("click", copyPrompt);
copySupervisorBtn.addEventListener("click", copySupervisorPrompt);

[rawInput, contextInput, audienceInput, referenceInput, mustInput, avoidInput].forEach((element) => {
  element.addEventListener("input", () => {
    window.clearTimeout(element._debounceTimer);
    element._debounceTimer = window.setTimeout(generatePrompt, 220);
  });
});

[modeSelect, formatSelect, styleSelect, languageSelect, oversightSelect, durationSelect, checkpointSelect].forEach((element) => {
  element.addEventListener("change", generatePrompt);
});

generatePrompt();
