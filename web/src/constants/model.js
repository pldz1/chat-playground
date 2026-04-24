function cloneJson(data) {
  return JSON.parse(JSON.stringify(data));
}

export const defModelType = {
  name: "",
  apiType: "",
  baseURL: "",
  endpoint: "",
  apiKey: "",
  modelType: "",
  model: "",
  deployment: "",
  apiVersion: "",
  chatParamDefs: [],
};

export const apiTypeList = [
  { value: "OpenAI", name: "OpenAI" },
  { value: "Azure OpenAI", name: "Azure OpenAI" },
  { value: "DeepSeek", name: "DeepSeek" },
];

export const chatModelTypeList = [
  { value: "gpt-5.4", name: "gpt-5.4", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-5.4-mini", name: "gpt-5.4-mini", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-5.4-nano", name: "gpt-5.4-nano", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-5", name: "gpt-5", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-5-mini", name: "gpt-5-mini", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-5-nano", name: "gpt-5-nano", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-4.1", name: "gpt-4.1", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-4.1-mini", name: "gpt-4.1-mini", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-4.1-nano", name: "gpt-4.1-nano", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-4o", name: "gpt-4o", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "gpt-4o-mini", name: "gpt-4o-mini", isReasonModel: false, msgTypeVersion: "v2" },
  { value: "o1", name: "o1", isReasonModel: true, msgTypeVersion: "v1" },
  { value: "o3", name: "o3", isReasonModel: true, msgTypeVersion: "v1" },
  { value: "o3-mini", name: "o3-mini", isReasonModel: true, msgTypeVersion: "v1" },
  { value: "o4-mini", name: "o4-mini", isReasonModel: true, msgTypeVersion: "v1" },
  { value: "deepseek-v3", name: "deepseek-v3", isReasonModel: false, msgTypeVersion: "v1" },
  { value: "deepseek-r1", name: "deepseek-r1", isReasonModel: true, msgTypeVersion: "v1" },
];

export function getChatModelInfo(modelType = "", apiType = "") {
  const normalizedType = (modelType || "").trim().toLowerCase();
  const normalizedApiType = (apiType || "").trim().toLowerCase();

  const exactMatch = chatModelTypeList.find((item) => item.value === normalizedType);
  if (exactMatch) return exactMatch;

  if (/^(o1|o3|o4)(-|$)/.test(normalizedType) || normalizedType.includes("deepseek-r1")) {
    return { value: modelType, name: modelType, isReasonModel: true, msgTypeVersion: "v2" };
  }

  if (normalizedApiType === "deepseek") {
    return { value: modelType, name: modelType, isReasonModel: false, msgTypeVersion: "v2" };
  }

  if (/^gpt-3\.5/.test(normalizedType)) {
    return { value: modelType, name: modelType, isReasonModel: false, msgTypeVersion: "v1" };
  }

  return { value: modelType, name: modelType, isReasonModel: false, msgTypeVersion: "v2" };
}

export const chatParamTypeList = [
  { value: "number", name: "Number" },
  { value: "string", name: "String" },
  { value: "array", name: "Array" },
  { value: "boolean", name: "Boolean" },
];

export const chatParamPresetList = [
  {
    key: "max_tokens",
    label: "max_tokens",
    type: "number",
    descriptionKey: "chat.maxTokensTip",
    defaultValue: 2000,
    min: 0,
    max: 12800,
    step: 1,
  },
  {
    key: "max_completion_tokens",
    label: "max_completion_tokens",
    type: "number",
    description: "限制单次补全文本的输出长度。",
    defaultValue: 2000,
    min: 0,
    max: 12800,
    step: 1,
  },
  {
    key: "temperature",
    label: "temperature",
    type: "number",
    descriptionKey: "chat.temperatureTip",
    defaultValue: 0.7,
    min: 0,
    max: 2,
    step: 0.01,
  },
  {
    key: "top_p",
    label: "top_p",
    type: "number",
    descriptionKey: "chat.topPTip",
    defaultValue: 0.95,
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "frequency_penalty",
    label: "frequency_penalty",
    type: "number",
    descriptionKey: "chat.frequencyPenaltyTip",
    defaultValue: 0,
    min: -2,
    max: 2,
    step: 0.01,
  },
  {
    key: "presence_penalty",
    label: "presence_penalty",
    type: "number",
    descriptionKey: "chat.presencePenaltyTip",
    defaultValue: 0,
    min: -2,
    max: 2,
    step: 0.01,
  },
  {
    key: "stop",
    label: "stop",
    type: "array",
    descriptionKey: "chat.stopTip",
    defaultValue: [],
    placeholder: '["END", "STOP"]',
  },
  {
    key: "reasoning_effort",
    label: "reasoning_effort",
    type: "string",
    description: "推理力度，例如 low / medium / high。",
    defaultValue: "medium",
    placeholder: "low / medium / high",
  },
];

export const defChatModelSettings = {
  passedMsgLen: 10,
  prompts: [{ role: "system", content: [{ type: "text", text: "As an AI assistant, please make your responses more engaging by including lively emojis." }] }],
};

function getChatParamPreset(key = "") {
  return chatParamPresetList.find((item) => item.key === key) || null;
}

export function parseChatParamValue(type = "string", value = undefined, fallback = undefined) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (type === "number") {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
  }

  if (type === "boolean") {
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return fallback;
  }

  if (type === "array") {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : fallback;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }

  return String(value);
}

export function normalizeChatParamDef(def = {}) {
  const preset = getChatParamPreset(def.key);
  const nextType = def.type || preset?.type || "string";
  const nextDefaultValue = parseChatParamValue(nextType, def.defaultValue, cloneJson(preset?.defaultValue ?? ""));

  return {
    key: String(def.key || preset?.key || "").trim(),
    label: String(def.label || preset?.label || def.key || "").trim(),
    type: nextType,
    description: String(def.description || preset?.description || "").trim(),
    descriptionKey: String(def.descriptionKey || preset?.descriptionKey || "").trim(),
    placeholder: String(def.placeholder || preset?.placeholder || "").trim(),
    defaultValue: nextDefaultValue,
    min: parseChatParamValue("number", def.min, preset?.min ?? 0),
    max: parseChatParamValue("number", def.max, preset?.max ?? 1),
    step: parseChatParamValue("number", def.step, preset?.step ?? 1),
  };
}

export function getDefaultChatParamDefs(modelType = "", apiType = "") {
  const normalizedType = (modelType || "").trim().toLowerCase();
  const modelInfo = getChatModelInfo(modelType, apiType);

  const keys = ["temperature", "top_p", "frequency_penalty", "presence_penalty", "stop"];

  if (
    /^gpt-4\.1/.test(normalizedType) ||
    /^gpt-4o/.test(normalizedType) ||
    /^gpt-3\.5/.test(normalizedType) ||
    normalizedType.startsWith("deepseek-v3") ||
    (apiType || "").trim().toLowerCase() === "azure openai"
  ) {
    keys.unshift("max_tokens");
  }

  if (/^gpt-5(\.|-|$)/.test(normalizedType) || modelInfo.isReasonModel) {
    return keys.filter((key) => key !== "max_tokens").map((key) => normalizeChatParamDef({ key }));
  }

  return keys.map((key) => normalizeChatParamDef({ key }));
}

export function getModelChatParamDefs(model = {}) {
  const defs = Array.isArray(model?.chatParamDefs) && model.chatParamDefs.length > 0 ? model.chatParamDefs : getDefaultChatParamDefs(model?.modelType, model?.apiType);
  const seen = new Set();

  return defs
    .map((item) => normalizeChatParamDef(item))
    .filter((item) => item.key && !seen.has(item.key) && (seen.add(item.key), true));
}

export function buildDefaultChatSettings(model = null) {
  const settings = cloneJson(defChatModelSettings);
  const defs = getModelChatParamDefs(model || {});

  defs.forEach((item) => {
    settings[item.key] = cloneJson(item.defaultValue);
  });

  return settings;
}

export function mergeChatSettingsWithModel(model = null, settings = {}) {
  const mergedSettings = {
    ...buildDefaultChatSettings(model),
    ...(settings || {}),
  };

  const defs = getModelChatParamDefs(model || {});
  defs.forEach((item) => {
    mergedSettings[item.key] = parseChatParamValue(item.type, mergedSettings[item.key], cloneJson(item.defaultValue));
  });

  if (!Array.isArray(mergedSettings.prompts)) {
    mergedSettings.prompts = cloneJson(defChatModelSettings.prompts);
  }

  if (!Number.isFinite(Number(mergedSettings.passedMsgLen))) {
    mergedSettings.passedMsgLen = defChatModelSettings.passedMsgLen;
  } else {
    mergedSettings.passedMsgLen = Number(mergedSettings.passedMsgLen);
  }

  return mergedSettings;
}

export function buildChatCompletionParams(model = null, settings = {}) {
  const defs = getModelChatParamDefs(model || {});
  const mergedSettings = mergeChatSettingsWithModel(model, settings);
  const params = {};

  defs.forEach((item) => {
    const value = parseChatParamValue(item.type, mergedSettings[item.key], cloneJson(item.defaultValue));

    if (value === undefined || value === null) return;
    if (item.type === "string" && value === "") return;
    if (item.type === "array" && !Array.isArray(value)) return;

    params[item.key] = value;
  });

  return {
    ...params,
    stream: true,
    stream_options: { include_usage: true },
  };
}

export const imageModelTypeList = [
  { value: "gpt-image-1.5", name: "gpt-image-1.5" },
  { value: "gpt-image-1", name: "gpt-image-1" },
  { value: "gpt-image-1-mini", name: "gpt-image-1-mini" },
  { value: "chatgpt-image-latest", name: "chatgpt-image-latest" },
  { value: "dall-e-2", name: "dall-e-2" },
  { value: "dall-e-3", name: "dall-e-3" },
];

export const defImageModelSeting = {
  model: null,
  prompt: "",
  size: "1024x1024",
  quality: "",
  mask: null,
  image: null,
  n: 1,
};

export const imageModelSize = [
  { name: "1024x1024", value: "1024x1024" },
  { name: "1024x1792", value: "1024x1792" },
  { name: "1792x1024", value: "1792x1024" },
];

export const rtaudioModelTypeList = [
  { value: "gpt-4o-realtime-preview", name: "gpt-4o-realtime-preview" },
  { value: "gpt-4o-mini-realtime-preview", name: "gpt-4o-mini-realtime-preview" },
];
