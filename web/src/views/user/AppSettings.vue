<template>
  <div class="settings-section">
    <div class="section-header">
      <div>
        <h2>{{ t("user.app.title") }}</h2>
        <p>{{ t("user.app.description") }}</p>
      </div>
    </div>

    <div class="app-settings-grid">
      <section class="app-settings-card">
        <h3>{{ t("user.app.connection") }}</h3>
        <p>{{ t("user.app.connectionDescription") }}</p>
        <div class="app-settings-field">
          <label>{{ t("user.app.serverHost") }}</label>
          <input type="text" class="input input-bordered w-full" :placeholder="t('input.hostUrlPlaceholder')" :value="props.hostUrl" @input="emit('update:hostUrl', $event.target.value)" />
        </div>
      </section>

      <section class="app-settings-card">
        <h3>{{ t("user.app.importExport") }}</h3>
        <p>{{ t("user.app.importExportDescription") }}</p>
        <div class="app-settings-actions">
          <button class="btn btn-outline" @click="emit('export-settings')">{{ t("user.app.export") }}</button>
          <button class="btn btn-outline" @click="emit('import-settings')">{{ t("user.app.import") }}</button>
        </div>
      </section>

      <section class="app-settings-card">
        <h3>{{ t("user.app.resources") }}</h3>
        <p>{{ t("user.app.resourcesDescription") }}</p>
        <div class="app-settings-actions">
          <a class="btn btn-outline" href="https://github.com/pldz1/chat-playground/releases" target="_blank" rel="noopener noreferrer">{{ t("user.app.releases") }}</a>
        </div>
      </section>

      <section class="app-settings-card app-settings-card-danger">
        <h3>{{ t("user.app.session") }}</h3>
        <p>{{ t("user.app.sessionDescription") }}</p>
        <div class="app-settings-actions">
          <button class="btn btn-error" @click="emit('logout')">{{ t("user.app.logout") }}</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const props = defineProps({
  hostUrl: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:hostUrl", "import-settings", "export-settings", "logout"]);
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.section-header {
  h2 {
    font-size: 20px;
    line-height: 1.1;
    font-weight: 700;
  }

  p {
    margin-top: 4px;
    color: oklch(var(--bc) / 0.65);
    font-size: 12px;
  }
}

.app-settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  overflow-y: auto;
  padding-right: 4px;
}

.app-settings-card {
  border: 1px solid oklch(var(--b3) / 0.6);
  border-radius: 24px;
  background:
    linear-gradient(180deg, oklch(var(--b1)) 0%, oklch(var(--b2) / 0.75) 100%);
  padding: 24px;
  box-shadow:
    inset 0 1px 0 oklch(var(--b1) / 0.9),
    0 10px 26px oklch(var(--n) / 0.04);

  h3 {
    font-size: 18px;
    font-weight: 700;
  }

  p {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: oklch(var(--bc) / 0.65);
  }
}

.app-settings-card-danger {
  border-color: oklch(var(--er) / 0.35);
}

.app-settings-field {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 12px;
    font-weight: 600;
  }
}

.app-settings-actions {
  margin-top: 18px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .btn {
    min-height: 42px;
  }
}

@media (max-width: 1100px) {
  .app-settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
