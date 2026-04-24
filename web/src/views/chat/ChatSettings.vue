<template>
  <dialog id="global_chat_model_settings" class="modal global-chat-model-settings">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="handleClose">✕</button>
      </form>
      <h3 class="text-lg font-bold">{{ t("chat.settingsTitle") }}</h3>
      <div class="gcms-container">
        <div class="gcms-setting-item">
          <div class="gcms-setting-label">
            <span>{{ t("chat.instructions") }}</span>
            <AppTooltip :text="t('chat.instructionsTip')" placement="bottom">
              <div v-html="info24"></div>
            </AppTooltip>
          </div>

          <div class="gcms-setting-content">
            <textarea class="textarea textarea-bordered" v-model="instrStr"></textarea>
          </div>
        </div>

        <div class="gcms-setting-item">
          <div class="gcms-setting-label">
            <span>{{ t("chat.historyCount") }}</span>
            <AppTooltip :text="t('chat.historyCountTip')" placement="bottom">
              <div v-html="info24"></div>
            </AppTooltip>
          </div>
          <div class="gcms-setting-content">
            <input type="range" min="1" max="20" class="range range-xs" v-model.number="modelSettings.passedMsgLen" />
            <input type="text" class="input input-bordered" v-model.number="modelSettings.passedMsgLen" />
          </div>
        </div>

        <div v-for="item in activeParamDefs" :key="item.key" class="gcms-setting-item">
          <div class="gcms-setting-label">
            <span>{{ item.label || item.key }}</span>
            <AppTooltip v-if="getParamDescription(item)" :text="getParamDescription(item)" placement="bottom">
              <div v-html="info24"></div>
            </AppTooltip>
          </div>
          <div class="gcms-setting-content">
            <template v-if="item.type === 'number'">
              <input type="range" :min="item.min" :max="item.max" :step="item.step" v-model.number="modelSettings[item.key]" class="range range-xs" />
              <input type="text" class="input input-bordered" v-model.number="modelSettings[item.key]" />
            </template>

            <template v-else-if="item.type === 'boolean'">
              <input type="checkbox" class="toggle toggle-primary" v-model="modelSettings[item.key]" />
            </template>

            <template v-else-if="item.type === 'array'">
              <textarea class="textarea textarea-bordered" :value="arrayFieldInputs[item.key] || '[]'" @input="arrayFieldInputs[item.key] = $event.target.value"></textarea>
            </template>

            <template v-else>
              <input type="text" class="input input-bordered gcms-input-full" v-model="modelSettings[item.key]" :placeholder="item.placeholder || item.key" />
            </template>
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { useStore } from "vuex";
import { computed, reactive, watch, ref } from "vue";
import { useI18n } from "vue-i18n";
import { info24 } from "@/assets/svg";
import { dsAlert } from "@/utils";
import { getModelChatParamDefs, mergeChatSettingsWithModel, parseChatParamValue } from "@/constants";
import { setChatSettings } from "@/services";
import AppTooltip from "@/components/AppTooltip.vue";

const store = useStore();
const { t } = useI18n();
const curChatModel = computed(() => store.state.curChatModel);
const curChatModelSettings = computed(() => store.state.curChatModelSettings);
const activeParamDefs = computed(() => getModelChatParamDefs(curChatModel.value));
const modelSettings = reactive({});
const instrStr = ref("");
const arrayFieldInputs = reactive({});

const getParamDescription = (item) => {
  if (item.descriptionKey) return t(item.descriptionKey);
  return item.description || "";
};

watch(
  () => [curChatModel.value, curChatModelSettings.value],
  ([model, newVal]) => {
    const mergedSettings = mergeChatSettingsWithModel(model, newVal);
    Object.keys(modelSettings).forEach((key) => {
      delete modelSettings[key];
    });
    Object.assign(modelSettings, mergedSettings);

    Object.keys(arrayFieldInputs).forEach((key) => {
      delete arrayFieldInputs[key];
    });
    activeParamDefs.value
      .filter((item) => item.type === "array")
      .forEach((item) => {
        arrayFieldInputs[item.key] = JSON.stringify(Array.isArray(mergedSettings[item.key]) ? mergedSettings[item.key] : item.defaultValue || []);
      });

    instrStr.value = mergedSettings.prompts?.[0]?.content?.[0]?.text || "";
  },
  { immediate: true, deep: true },
);

const handleClose = async () => {
  const nextSettings = mergeChatSettingsWithModel(curChatModel.value, { ...modelSettings });
  nextSettings.prompts[0].content[0].text = instrStr.value;

  activeParamDefs.value.forEach((item) => {
    if (item.type !== "array") return;
    const parsedValue = parseChatParamValue("array", arrayFieldInputs[item.key], null);
    if (parsedValue === null) {
      dsAlert({ type: "warn", message: t("chat.invalidArrayParam", { name: item.label || item.key }) });
      nextSettings[item.key] = Array.isArray(item.defaultValue) ? item.defaultValue : [];
      return;
    }
    nextSettings[item.key] = parsedValue;
  });

  store.dispatch("setCurChatModelSettings", nextSettings);
  await setChatSettings();
};
</script>

<style lang="scss" scoped>
.global-chat-model-settings {
  overflow: hidden;
  .modal-box {
    width: 600px;
    max-width: unset;
  }

  .gcms-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    max-height: 450px;
    padding: 8px;
    overflow-y: auto;
  }

  .gcms-setting-item {
    display: flex;
    flex-direction: row;
    width: 528px;
    max-width: 528px;
    align-items: center;
    gap: 16px;
  }

  .gcms-setting-label {
    width: 180px;
    max-width: 180px;
    font-size: 16px;
    text-align: right;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .gcms-setting-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 348px;
    gap: 8px;

    .textarea {
      width: 100%;
    }

    .input {
      width: 80px;
      max-width: 80px;
    }

    .gcms-input-full {
      width: 100%;
      max-width: none;
    }
  }
}
</style>
