<template>
  <div class="model-form-card">
    <div class="model-form-header">
      <div>
        <h3>{{ t(cardTitleKey) }}</h3>
        <p>{{ t(cardSubtitleKey) }}</p>
      </div>
      <div v-if="props.modelKind === 'chat' && localModel.modelType" class="model-behavior-chip">
        {{ modelBehaviorHint }}
      </div>
    </div>

    <section class="model-form-section">
      <div class="model-section-head">
        <h4>{{ t("user.modelCard.sections.connectionTitle") }}</h4>
        <p>{{ t("user.modelCard.sections.connectionDescription") }}</p>
      </div>

      <div class="model-form-grid">
        <div class="model-form-field">
          <label>{{ t("user.modelCard.fields.name") }}</label>
          <input type="text" class="input input-bordered w-full" v-model.trim="localModel.name" />
        </div>

        <div class="model-form-field">
          <label>{{ t("user.modelCard.fields.apiType") }}</label>
          <select class="select select-bordered w-full" v-model="localModel.apiType">
            <option v-for="ai in apiTypeList" :key="ai.value" :value="ai.value">
              {{ ai.name }}
            </option>
          </select>
        </div>

        <div v-if="isOpenAIStyle" class="model-form-field model-form-field-span">
          <label>{{ t("user.modelCard.fields.baseUrl") }}</label>
          <input type="text" class="input input-bordered w-full" v-model.trim="localModel.baseURL" />
        </div>

        <div v-if="isAzure" class="model-form-field model-form-field-span">
          <label>{{ t("user.modelCard.fields.endpoint") }}</label>
          <input type="text" class="input input-bordered w-full" v-model.trim="localModel.endpoint" />
        </div>

        <div class="model-form-field model-form-field-span">
          <label>{{ t("user.modelCard.fields.apiKey") }}</label>
          <label class="input input-bordered model-key-input">
            <input type="password" class="grow" v-model.trim="localModel.apiKey" />
            <button type="button" class="btn btn-ghost btn-sm" @click="copyApiKey">
              <div v-html="copy16"></div>
            </button>
          </label>
        </div>

        <div v-if="isAzure" class="model-form-field">
          <label>{{ t("user.modelCard.fields.apiVersion") }}</label>
          <input type="text" class="input input-bordered w-full" v-model.trim="localModel.apiVersion" />
        </div>

        <div v-if="isAzure" class="model-form-field">
          <label>{{ t("user.modelCard.fields.deployment") }}</label>
          <input type="text" class="input input-bordered w-full" v-model.trim="localModel.deployment" />
        </div>
      </div>
    </section>

    <section class="model-form-section">
      <div class="model-section-head">
        <h4>{{ t("user.modelCard.sections.identityTitle") }}</h4>
        <p>{{ t("user.modelCard.sections.identityDescription") }}</p>
      </div>

      <div class="model-form-grid">
        <div class="model-form-field model-form-field-span">
          <label>{{ t("user.modelCard.fields.modelId") }}</label>
          <input type="text" class="input input-bordered w-full" :placeholder="modelTypePlaceholder" v-model.trim="localModel.modelType" />
          <div class="model-field-help">
            {{ t("user.modelCard.modelIdHelp") }}
          </div>
          <div class="model-suggestion-list">
            <button
              v-for="item in visibleModelSuggestions"
              :key="item.value"
              type="button"
              class="btn btn-sm"
              :class="localModel.modelType === item.value ? 'btn-neutral' : 'btn-outline'"
              @click="applySuggestedModel(item.value)"
            >
              {{ item.name }}
            </button>
          </div>
        </div>

        <div v-if="isOpenAIStyle && resolvedModelId" class="model-form-field model-form-field-span">
          <label>{{ t("user.modelCard.fields.resolvedModel") }}</label>
          <div class="model-info-card">
            {{ t("user.modelCard.resolvedModelPrefix") }} <code>{{ resolvedModelId }}</code>
          </div>
        </div>
      </div>
    </section>

    <section v-if="props.modelKind === 'chat'" class="model-form-section model-form-section-accent">
      <div class="model-section-head">
        <h4>{{ t("user.modelCard.sections.chatParamsTitle") }}</h4>
        <p>{{ t("user.modelCard.sections.chatParamsDescription") }}</p>
      </div>

      <div class="model-form-field model-form-field-span">
        <label>{{ t("user.modelCard.fields.chatParameters") }}</label>
        <div class="model-field-help">
          {{ t("user.modelCard.chatParamsHelp") }}
        </div>

        <div class="model-suggestion-list">
          <button v-for="item in availableParamPresets" :key="item.key" type="button" class="btn btn-sm btn-outline" @click="addChatParamDef(item.key)">
            + {{ item.label }}
          </button>
          <button type="button" class="btn btn-sm btn-outline" @click="addChatParamDef()">
            + {{ t("user.modelCard.addCustomParam") }}
          </button>
        </div>

        <div v-if="localModel.chatParamDefs.length > 0" class="param-toolbar">
          <button type="button" class="btn btn-sm btn-outline" @click="expandAllParams">
            {{ t("user.modelCard.expandAllParams") }}
          </button>
          <button type="button" class="btn btn-sm btn-outline" @click="collapseAllParams">
            {{ t("user.modelCard.collapseAllParams") }}
          </button>
        </div>

        <div v-if="localModel.chatParamDefs.length === 0" class="model-info-card">
          {{ t("user.modelCard.noChatParams") }}
        </div>

        <div v-else class="param-definition-list">
          <div v-for="(item, index) in localModel.chatParamDefs" :key="getParamUiKey(item, index)" class="param-definition-card" :class="{ collapsed: !isParamExpanded(item, index) }">
            <div class="param-definition-summary">
              <div class="param-definition-summary-main">
                <div class="param-definition-summary-title">
                  {{ item.label || item.key || t("user.modelCard.untitledParam") }}
                </div>
                <div class="param-definition-summary-meta">
                  <span>{{ item.key || t("user.modelCard.fields.key") }}</span>
                  <span class="param-type-chip">{{ item.type }}</span>
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-ghost" @click="toggleParamExpanded(item, index)">
                {{ isParamExpanded(item, index) ? t("user.modelCard.collapseParam") : t("user.modelCard.expandParam") }}
              </button>
            </div>

            <div v-show="isParamExpanded(item, index)" class="param-definition-body">
              <div class="param-definition-grid">
                <div class="model-form-field">
                  <label>{{ t("user.modelCard.fields.key") }}</label>
                  <input type="text" class="input input-bordered w-full" v-model.trim="item.key" :placeholder="t('user.modelCard.placeholders.paramKey')" />
                </div>

                <div class="model-form-field">
                  <label>{{ t("user.modelCard.fields.type") }}</label>
                  <select class="select select-bordered w-full" v-model="item.type">
                    <option v-for="typeItem in chatParamTypeList" :key="typeItem.value" :value="typeItem.value">
                      {{ typeItem.name }}
                    </option>
                  </select>
                </div>

                <div class="model-form-field model-form-field-span">
                  <label>{{ t("user.modelCard.fields.label") }}</label>
                  <input type="text" class="input input-bordered w-full" v-model.trim="item.label" :placeholder="t('user.modelCard.placeholders.paramLabel')" />
                </div>

                <div class="model-form-field model-form-field-span">
                  <label>{{ t("user.modelCard.fields.description") }}</label>
                  <input type="text" class="input input-bordered w-full" v-model.trim="item.description" :placeholder="t('user.modelCard.placeholders.paramDescription')" />
                </div>

                <div class="model-form-field model-form-field-span">
                  <label>{{ t("user.modelCard.fields.defaultValue") }}</label>
                  <input v-if="item.type === 'number'" type="number" class="input input-bordered w-full" v-model.number="item.defaultValue" />
                  <input
                    v-else-if="item.type === 'string'"
                    type="text"
                    class="input input-bordered w-full"
                    v-model="item.defaultValue"
                    :placeholder="item.placeholder || t('user.modelCard.placeholders.defaultValue')"
                  />
                  <input v-else-if="item.type === 'boolean'" type="checkbox" class="toggle toggle-primary" v-model="item.defaultValue" />
                  <textarea
                    v-else
                    class="textarea textarea-bordered w-full"
                    :value="formatArrayParamValue(item.defaultValue)"
                    :placeholder="getArrayPlaceholder(item)"
                    @input="updateArrayParamDefault(index, $event.target.value)"
                  ></textarea>
                </div>

                <template v-if="item.type === 'number'">
                  <div class="model-form-field">
                    <label>{{ t("user.modelCard.fields.min") }}</label>
                    <input type="number" class="input input-bordered w-full" v-model.number="item.min" />
                  </div>

                  <div class="model-form-field">
                    <label>{{ t("user.modelCard.fields.max") }}</label>
                    <input type="number" class="input input-bordered w-full" v-model.number="item.max" />
                  </div>

                  <div class="model-form-field">
                    <label>{{ t("user.modelCard.fields.step") }}</label>
                    <input type="number" class="input input-bordered w-full" v-model.number="item.step" />
                  </div>
                </template>

                <div v-if="item.type !== 'number'" class="model-form-field model-form-field-span">
                  <label>{{ t("user.modelCard.fields.placeholder") }}</label>
                  <input type="text" class="input input-bordered w-full" v-model.trim="item.placeholder" :placeholder="t('user.modelCard.placeholders.inputHint')" />
                </div>
              </div>

              <div class="param-definition-actions">
                <button type="button" class="btn btn-sm btn-outline btn-error" @click="removeChatParamDef(index)">
                  {{ t("user.modelCard.removeParam") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { dsAlert } from "@/utils";
import { copy16 } from "@/assets/svg";
import { defModelType, apiTypeList, chatParamPresetList, chatParamTypeList, getChatModelInfo, getModelChatParamDefs, normalizeChatParamDef, parseChatParamValue } from "@/constants";

const props = defineProps({
  model: {
    type: Object,
    default: () => structuredClone(defModelType),
  },
  modelSuggestions: {
    type: Array,
    default: () => [],
  },
  modelKind: {
    type: String,
    default: "chat",
  },
});

const emit = defineEmits(["update:model"]);
const { t } = useI18n();
const localModel = reactive(structuredClone(defModelType));
const expandedParamKeys = ref([]);
let isSyncingFromProps = false;
let lastModelSnapshot = "";

const visibleModelSuggestions = computed(() => props.modelSuggestions.slice(0, 10));
const availableParamPresets = computed(() => {
  const existingKeys = new Set((localModel.chatParamDefs || []).map((item) => item.key).filter(Boolean));
  return chatParamPresetList.filter((item) => !existingKeys.has(item.key));
});
const isAzure = computed(() => localModel.apiType === "Azure OpenAI");
const isOpenAIStyle = computed(() => localModel.apiType === "OpenAI" || localModel.apiType === "DeepSeek");
const modelTypePlaceholder = computed(() => {
  return props.modelKind === "image" ? t("user.modelCard.placeholders.imageModelId") : t("user.modelCard.placeholders.chatModelId");
});
const resolvedModelId = computed(() => (localModel.model || localModel.modelType || "").trim());
const modelBehaviorHint = computed(() => {
  const modelInfo = getChatModelInfo(localModel.modelType, localModel.apiType);
  const modeText = modelInfo.isReasonModel ? t("user.modelCard.behavior.reasoning") : t("user.modelCard.behavior.chat");
  const formatText = modelInfo.msgTypeVersion === "v1" ? t("user.modelCard.behavior.v1") : t("user.modelCard.behavior.v2");
  return `${modeText} · ${formatText}`;
});
const cardTitleKey = computed(() => (props.modelKind === "image" ? "user.modelCard.imageTitle" : "user.modelCard.chatTitle"));
const cardSubtitleKey = computed(() => (props.modelKind === "image" ? "user.modelCard.imageSubtitle" : "user.modelCard.chatSubtitle"));

function normalizeModelFields() {
  if (!localModel.modelType && localModel.model) {
    localModel.modelType = localModel.model.trim();
  }

  if (isOpenAIStyle.value || props.modelKind === "image") {
    localModel.model = (localModel.modelType || localModel.model || "").trim();
  }
}

function createModelPayload() {
  normalizeModelFields();
  const payload = {
    ...JSON.parse(JSON.stringify(localModel)),
  };

  payload.chatParamDefs =
    props.modelKind === "chat" ? (localModel.chatParamDefs || []).map((item) => normalizeChatParamDef(item)).filter((item) => item.key) : [];

  return payload;
}

function syncFromProps(model) {
  isSyncingFromProps = true;
  Object.assign(localModel, structuredClone(defModelType), model || {});
  localModel.chatParamDefs = props.modelKind === "chat" ? getModelChatParamDefs(model || {}) : Array.isArray(model?.chatParamDefs) ? model.chatParamDefs : [];
  normalizeModelFields();
  syncExpandedParamKeys();
  lastModelSnapshot = JSON.stringify(createModelPayload());
  isSyncingFromProps = false;
}

function emitModelUpdate() {
  if (isSyncingFromProps) return;
  const nextModel = createModelPayload();
  const nextSnapshot = JSON.stringify(nextModel);
  if (nextSnapshot === lastModelSnapshot) return;
  lastModelSnapshot = nextSnapshot;
  emit("update:model", nextModel);
}

const applySuggestedModel = (value) => {
  localModel.modelType = value;
};

const addChatParamDef = (presetKey = "") => {
  const nextDef = normalizeChatParamDef(presetKey ? { key: presetKey } : { key: "", label: "", type: "string", defaultValue: "" });
  const nextDefs = [...(localModel.chatParamDefs || []), nextDef];
  localModel.chatParamDefs = nextDefs;
  expandedParamKeys.value = [...new Set([...expandedParamKeys.value, getParamUiKey(nextDef, nextDefs.length - 1)])];
};

const removeChatParamDef = (index) => {
  localModel.chatParamDefs = (localModel.chatParamDefs || []).filter((_, itemIndex) => itemIndex !== index);
  syncExpandedParamKeys();
};

const getParamUiKey = (item, index) => `${index}:${item?.key || "param"}`;

const syncExpandedParamKeys = () => {
  const currentKeys = (localModel.chatParamDefs || []).map((item, index) => getParamUiKey(item, index));
  expandedParamKeys.value = expandedParamKeys.value.filter((key) => currentKeys.includes(key));
};

const isParamExpanded = (item, index) => expandedParamKeys.value.includes(getParamUiKey(item, index));

const toggleParamExpanded = (item, index) => {
  const uiKey = getParamUiKey(item, index);
  expandedParamKeys.value = isParamExpanded(item, index) ? expandedParamKeys.value.filter((key) => key !== uiKey) : [...expandedParamKeys.value, uiKey];
};

const expandAllParams = () => {
  expandedParamKeys.value = (localModel.chatParamDefs || []).map((item, index) => getParamUiKey(item, index));
};

const collapseAllParams = () => {
  expandedParamKeys.value = [];
};

const formatArrayParamValue = (value) => {
  return Array.isArray(value) ? JSON.stringify(value) : "[]";
};

const getArrayPlaceholder = (item) => {
  return item?.placeholder || t("user.modelCard.placeholders.arrayValue");
};

const updateArrayParamDefault = (index, rawValue) => {
  const nextDefs = [...localModel.chatParamDefs];
  nextDefs[index] = {
    ...nextDefs[index],
    defaultValue: parseChatParamValue("array", rawValue, []),
  };
  localModel.chatParamDefs = nextDefs;
};

const copyApiKey = () => {
  navigator.clipboard
    .writeText(localModel.apiKey)
    .then(() => {
      dsAlert({ type: "success", message: t("toast.copyApiKeySuccess") });
    })
    .catch((err) => {
      dsAlert({ type: "error", message: t("toast.copyApiKeyFailed", { error: String(err) }) });
    });
};

watch(
  () => props.model,
  (newModel) => {
    syncFromProps(newModel);
  },
  { deep: true, immediate: true },
);

watch(
  () => JSON.stringify(localModel),
  () => {
    emitModelUpdate();
  },
);
</script>

<style lang="scss" scoped>
.model-form-card {
  border: 1px solid oklch(var(--b3) / 0.65);
  border-radius: 20px;
  background: linear-gradient(180deg, oklch(var(--b1)) 0%, oklch(var(--b2) / 0.65) 100%);
  padding: 24px;
  box-shadow:
    0 12px 32px oklch(var(--n) / 0.04),
    inset 0 1px 0 oklch(var(--b1) / 0.92);
}

.model-form-section {
  margin-top: 18px;
  border: 1px solid oklch(var(--b3) / 0.55);
  border-radius: 18px;
  padding: 18px;
  background: linear-gradient(180deg, oklch(var(--b1) / 0.88), oklch(var(--b2) / 0.68));
}

.model-form-section-accent {
  border-color: oklch(var(--p) / 0.22);
  box-shadow: inset 0 1px 0 oklch(var(--b1) / 0.9);
}

.model-section-head {
  margin-bottom: 14px;

  h4 {
    font-size: 14px;
    font-weight: 700;
    color: oklch(var(--bc) / 0.92);
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
    color: oklch(var(--bc) / 0.62);
  }
}

.model-form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;

  h3 {
    font-size: 18px;
    line-height: 1.15;
    font-weight: 700;
  }

  p {
    margin-top: 6px;
    font-size: 12px;
    color: oklch(var(--bc) / 0.65);
  }
}

.model-behavior-chip {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 7px 11px;
  background-color: oklch(var(--n) / 0.08);
  font-size: 11px;
  color: oklch(var(--bc) / 0.7);
}

.model-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
}

.model-form-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: oklch(var(--bc) / 0.85);
  }
}

.model-form-field-span {
  grid-column: 1 / -1;
}

.model-key-input {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 52px;

  input {
    flex: 1;
    min-width: 0;
  }

  .btn {
    margin-left: auto;
    flex-shrink: 0;
  }
}

.model-field-help {
  font-size: 11px;
  line-height: 1.5;
  color: oklch(var(--bc) / 0.62);
}

.model-suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .btn {
    min-height: 36px;
    padding-inline: 12px;
    border-radius: 999px;
    font-size: 12px;
  }
}

.model-info-card {
  border-radius: 14px;
  padding: 12px 14px;
  background-color: oklch(var(--n) / 0.07);
  font-size: 12px;
  line-height: 1.5;
  color: oklch(var(--bc) / 0.75);

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
}

.param-definition-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-definition-card {
  border: 1px solid oklch(var(--b3) / 0.6);
  border-radius: 14px;
  padding: 12px;
  background: linear-gradient(180deg, oklch(var(--b1) / 0.72), oklch(var(--b2) / 0.52));
  box-shadow: inset 0 1px 0 oklch(var(--b1) / 0.75);
}

.param-definition-card.collapsed {
  padding-bottom: 10px;
}

.param-definition-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 12px;
}

.param-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.param-definition-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.param-definition-summary-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-definition-summary-title {
  font-size: 13px;
  font-weight: 700;
  color: oklch(var(--bc) / 0.86);
}

.param-definition-summary-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
  color: oklch(var(--bc) / 0.58);
}

.param-type-chip {
  border-radius: 999px;
  padding: 2px 8px;
  background-color: oklch(var(--n) / 0.08);
  color: oklch(var(--bc) / 0.7);
}

.param-definition-body {
  margin-top: 12px;
}

.param-definition-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.param-definition-card :deep(.input),
.param-definition-card :deep(.select),
.param-definition-card :deep(.textarea) {
  min-height: 42px;
  font-size: 12px;
}

.param-definition-card :deep(.textarea) {
  min-height: 84px;
}

.param-definition-card .model-form-field {
  gap: 5px;
}

.param-definition-card .model-form-field label {
  font-size: 11px;
  font-weight: 600;
  color: oklch(var(--bc) / 0.72);
}

.param-definition-card .btn {
  min-height: 34px;
  font-size: 12px;
  padding-inline: 10px;
}

@media (max-width: 900px) {
  .model-form-grid {
    grid-template-columns: 1fr;
  }

  .model-form-header {
    flex-direction: column;
  }

  .param-definition-grid {
    grid-template-columns: 1fr;
  }
}
</style>
