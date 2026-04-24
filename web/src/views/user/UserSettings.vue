<template>
  <div class="settings-page">
    <aside class="settings-sidebar">
      <div class="settings-tab-list">
        <button v-for="item in tabs" :key="item.key" class="settings-tab-button" :class="{ active: activeTab === item.key }" @click="activeTab = item.key">
          <span>{{ item.label }}</span>
          <small>{{ item.description }}</small>
        </button>
      </div>
    </aside>

    <main class="settings-main">
      <header class="settings-main-header">
        <div>
          <p class="settings-main-subtitle">{{ activeTabInfo.description }}</p>
        </div>

        <div class="settings-main-actions">
          <div class="settings-status" :class="statusClass">
            <span class="settings-status-dot"></span>
            <span>{{ statusLabel }}</span>
          </div>
        </div>
      </header>

      <section class="settings-main-content">
        <ChatInsTemplateList v-if="activeTab === 'templates'" :templates="draftTemplates" @update:templates="updateDraftTemplates" />

        <ChatModels v-if="activeTab === 'chat-models'" :models="draftModels.chat" @update:models="updateChatModels" />

        <ImageModels v-if="activeTab === 'image-models'" :models="draftModels.image" @update:models="updateImageModels" />

        <AppSettings
          v-if="activeTab === 'app'"
          :host-url="draftHostUrl"
          @update:host-url="updateDraftHostUrl"
          @export-settings="exportSettings"
          @import-settings="importSettings"
          @logout="logout"
        />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import ChatModels from "@/views/user/ChatModels.vue";
import ImageModels from "@/views/user/ImageModels.vue";
import ChatInsTemplateList from "@/views/user/ChatInsTemplateList.vue";
import AppSettings from "@/views/user/AppSettings.vue";
import ThemeController from "@/components/ThemeController.vue";
import LanguageController from "@/components/LanguageController.vue";
import { getModels, getChatInsTemplateList, setModels, setChatInsTemplateList } from "@/services";
import { uploadJsonFile, isValidModelSetting, getModelSettingValidationError, dsAlert } from "@/utils";

const store = useStore();
const router = useRouter();
const { t } = useI18n();

const tabs = computed(() => [
  { key: "templates", label: t("user.tabs.templates.label"), description: t("user.tabs.templates.description") },
  { key: "chat-models", label: t("user.tabs.chatModels.label"), description: t("user.tabs.chatModels.description") },
  { key: "image-models", label: t("user.tabs.imageModels.label"), description: t("user.tabs.imageModels.description") },
  { key: "app", label: t("user.tabs.app.label"), description: t("user.tabs.app.description") },
]);

const activeTab = ref("chat-models");
const draftModels = ref({ chat: [], image: [], rtaudio: [] });
const draftTemplates = ref([]);
const draftHostUrl = ref("");
const snapshot = ref("");
const autosaveState = ref("saved");
let autosaveTimer = null;
let isHydrating = false;
let isPersisting = false;

function clonePlainData(data) {
  return JSON.parse(JSON.stringify(data));
}

const activeTabInfo = computed(() => {
  return tabs.value.find((item) => item.key === activeTab.value) || tabs.value[0];
});

const hasUnsavedChanges = computed(() => {
  return getDraftSnapshot() !== snapshot.value;
});
const statusLabel = computed(() => {
  if (autosaveState.value === "saving") return t("common.saving");
  if (autosaveState.value === "error") return t("common.saveError");
  if (autosaveState.value === "dirty") return t("common.autosavePending");
  return t("common.saved");
});
const statusClass = computed(() => ({
  dirty: autosaveState.value === "dirty",
  saving: autosaveState.value === "saving",
  error: autosaveState.value === "error",
}));

function getDraftSnapshot() {
  return JSON.stringify({
    models: draftModels.value,
    templates: draftTemplates.value,
    hostUrl: draftHostUrl.value,
  });
}

function syncDraftFromStore() {
  isHydrating = true;
  draftModels.value = clonePlainData(store.state.models);
  draftTemplates.value = clonePlainData(store.state.chatInsTemplateList);
  draftHostUrl.value = store.state.hostUrl || "";
  snapshot.value = getDraftSnapshot();
  autosaveState.value = "saved";
  isHydrating = false;
}

function updateChatModels(nextModels) {
  draftModels.value = {
    ...draftModels.value,
    chat: nextModels,
  };
}

function updateImageModels(nextModels) {
  draftModels.value = {
    ...draftModels.value,
    image: nextModels,
  };
}

function updateDraftTemplates(nextTemplates) {
  draftTemplates.value = nextTemplates;
}

function updateDraftHostUrl(nextHostUrl) {
  draftHostUrl.value = nextHostUrl;
}

async function ensureLatestStoreData() {
  if (store.state.isLoggedIn && store.state.username) {
    await getModels();
    await getChatInsTemplateList();
  }
  syncDraftFromStore();
}

async function persistDraft() {
  if (isHydrating || isPersisting) return;
  if (!hasUnsavedChanges.value) {
    autosaveState.value = "saved";
    return;
  }

  const nextModels = clonePlainData(draftModels.value);
  const nextTemplates = clonePlainData(draftTemplates.value);
  const nextHostUrl = draftHostUrl.value;
  const nextSnapshot = JSON.stringify({
    models: nextModels,
    templates: nextTemplates,
    hostUrl: nextHostUrl,
  });

  isPersisting = true;
  autosaveState.value = "saving";
  try {
    await store.dispatch("setModels", nextModels);
    await store.dispatch("setChatInsTemplateList", nextTemplates);
    await store.dispatch("setHostUrl", nextHostUrl);

    const modelsSaved = await setModels();
    const templatesSaved = await setChatInsTemplateList(nextTemplates);

    if (modelsSaved === false || templatesSaved === false) {
      autosaveState.value = "error";
      return;
    }

    snapshot.value = nextSnapshot;
    autosaveState.value = "saved";
  } finally {
    isPersisting = false;
  }
}

async function exportSettings() {
  const jsonStr = JSON.stringify(draftModels.value, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aigc_mode_setting.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  dsAlert({ type: "success", message: t("user.exportSuccess") });
}

async function importSettings() {
  const jsonData = await uploadJsonFile();
  if (!jsonData) {
    dsAlert({ type: "error", message: t("user.importReadError") });
    return;
  }

  if (!isValidModelSetting(jsonData)) {
    const validationError = getModelSettingValidationError(jsonData);
    dsAlert({
      duration: 5000,
      type: "error",
      message: validationError ? `${t("user.importInvalid")} ${validationError}` : t("user.importInvalid"),
    });
    return;
  }

  draftModels.value = clonePlainData(jsonData);
  dsAlert({ type: "success", message: t("user.importSuccess") });
}

function logout() {
  router.push({ path: "/login" });
  store.dispatch("login", null);
}

function handleBeforeUnload(event) {
  if (autosaveState.value !== "saving" && !hasUnsavedChanges.value) return;
  event.preventDefault();
  event.returnValue = "";
}

function scheduleAutosave() {
  if (isHydrating || isPersisting) return;
  if (!hasUnsavedChanges.value) {
    autosaveState.value = "saved";
    return;
  }

  autosaveState.value = "dirty";
  window.clearTimeout(autosaveTimer);
  autosaveTimer = window.setTimeout(() => {
    persistDraft();
  }, 500);
}

onMounted(async () => {
  await ensureLatestStoreData();
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.clearTimeout(autosaveTimer);
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

watch(
  () => getDraftSnapshot(),
  () => {
    scheduleAutosave();
  },
);
</script>

<style lang="scss" scoped>
.settings-page {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  height: calc(100vh - 48px);
  overflow: hidden;
  font-family: "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif;
  background:
    radial-gradient(circle at top left, oklch(var(--p) / 0.07), transparent 24%), radial-gradient(circle at top right, oklch(var(--a) / 0.07), transparent 28%),
    linear-gradient(180deg, oklch(var(--b1)) 0%, oklch(var(--b2) / 0.82) 100%);
}

.settings-sidebar {
  padding: 28px 20px 24px;
  border-right: 1px solid oklch(var(--b3) / 0.9);
  background: linear-gradient(180deg, oklch(var(--b1) / 0.96) 0%, oklch(var(--b2) / 0.88) 100%);
  backdrop-filter: blur(16px);
  overflow-y: auto;
}

.settings-overline {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: oklch(var(--bc) / 0.45);
}

.settings-tab-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings-tab-button {
  border: 1px solid oklch(var(--b3) / 0.3);
  border-radius: 20px;
  padding: 13px 14px;
  text-align: left;
  background-color: oklch(var(--b1) / 0.56);
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: inset 0 1px 0 oklch(var(--b1) / 0.85);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  span {
    font-size: 14px;
    font-weight: 700;
  }

  small {
    font-size: 11px;
    line-height: 1.4;
    color: oklch(var(--bc) / 0.6);
  }

  &:hover {
    border-color: oklch(var(--n) / 0.12);
    background-color: oklch(var(--b1) / 0.92);
    transform: translateY(-1px);
    box-shadow: 0 10px 24px oklch(var(--n) / 0.05);
  }

  &.active {
    border-color: oklch(var(--su) / 0.22);
    background: linear-gradient(180deg, oklch(var(--b1)) 0%, oklch(var(--su) / 0.08) 100%);
    box-shadow:
      0 14px 28px oklch(var(--n) / 0.06),
      inset 0 1px 0 oklch(var(--b1) / 0.96);
  }
}

.settings-main {
  min-width: 0;
  padding: 28px 30px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow: hidden;
}

.settings-main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;

  h2 {
    margin-top: 2px;
    font-size: 30px;
    line-height: 1.08;
    font-weight: 700;
    letter-spacing: -0.03em;
  }
}

.settings-main-subtitle {
  margin-top: 10px;
  max-width: 36rem;
  font-size: 13px;
  line-height: 1.65;
  color: oklch(var(--bc) / 0.65);
}

.settings-main-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.settings-status {
  border-radius: 999px;
  padding: 8px 12px;
  background-color: oklch(var(--n) / 0.05);
  font-size: 12px;
  color: oklch(var(--bc) / 0.65);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid oklch(var(--b3) / 0.6);

  .settings-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background-color: oklch(var(--bc) / 0.35);
    flex-shrink: 0;
  }

  &.dirty {
    background-color: oklch(var(--wa) / 0.15);
    color: oklch(var(--bc) / 0.85);

    .settings-status-dot {
      background-color: oklch(var(--wa));
    }
  }

  &.saving {
    background-color: oklch(var(--p) / 0.12);
    color: oklch(var(--bc) / 0.82);

    .settings-status-dot {
      background-color: oklch(var(--p));
    }
  }

  &.error {
    background-color: oklch(var(--er) / 0.16);
    color: oklch(var(--bc) / 0.9);

    .settings-status-dot {
      background-color: oklch(var(--er));
    }
  }
}

.settings-main-content {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid oklch(var(--b3) / 0.55);
  border-radius: 30px;
  background: linear-gradient(180deg, oklch(var(--b1) / 0.92) 0%, oklch(var(--b2) / 0.85) 100%);
  box-shadow:
    0 18px 50px oklch(var(--n) / 0.06),
    inset 0 1px 0 oklch(var(--b1) / 0.95);
  padding: 20px;
}

@media (max-width: 1100px) {
  .settings-page {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    border-right: none;
    border-bottom: 1px solid oklch(var(--b3));
  }

  .settings-main-header {
    flex-direction: column;
  }

  .settings-main-actions {
    justify-content: flex-start;
  }
}
</style>
