<template>
  <div class="settings-section">
    <div class="section-header">
      <div>
        <h2>{{ t("user.templates.title") }}</h2>
        <p>{{ t("user.templates.description") }}</p>
      </div>
      <div class="section-actions">
        <button class="btn btn-neutral" @click="addTemplate">
          {{ t("user.templates.add") }}
        </button>
      </div>
    </div>

    <div class="settings-workspace">
      <aside class="settings-list-panel">
        <button
          v-for="(template, index) in props.templates"
          :key="template.id"
          class="settings-list-item"
          :class="{ active: index === selectedIndex }"
          @click="selectIndex(index)"
        >
          <div class="settings-list-title">{{ template.name || t("common.unnamedTemplate") }}</div>
          <div class="settings-list-meta">
            {{ summarizeTemplate(template.value) }}
          </div>
        </button>
        <div v-if="props.templates.length === 0" class="settings-empty-list">
          {{ t("user.templates.emptyList") }}
        </div>
      </aside>

      <section class="settings-detail-panel">
        <template v-if="currentTemplate">
          <div class="detail-toolbar">
            <div>
              <h3>{{ currentTemplate.name || t("common.unnamedTemplate") }}</h3>
              <p>{{ t("user.templates.detailHint") }}</p>
            </div>
            <div class="detail-toolbar-actions">
              <button class="btn btn-outline" @click="duplicateTemplate">{{ t("user.templates.duplicate") }}</button>
              <button class="btn btn-outline btn-error" @click="deleteTemplate">{{ t("user.templates.delete") }}</button>
            </div>
          </div>

          <div class="template-form-card">
            <div class="template-form-field">
              <label>{{ t("user.templates.name") }}</label>
              <input type="text" class="input input-bordered w-full" :value="currentTemplate.name" @input="updateField('name', $event.target.value)" />
            </div>

            <div class="template-form-field">
              <label>{{ t("user.templates.instruction") }}</label>
              <textarea
                class="textarea textarea-bordered template-textarea"
                :value="currentTemplate.value"
                @input="updateField('value', $event.target.value)"
              ></textarea>
            </div>
          </div>
        </template>

        <div v-else class="settings-empty-detail">
          {{ t("user.templates.emptyDetail") }}
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { add24 } from "@/assets/svg";
import { append4Random, getUuid } from "@/utils";

const props = defineProps({
  templates: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:templates"]);
const { t } = useI18n();
const selectedIndex = ref(-1);

const currentTemplate = computed(() => {
  if (selectedIndex.value < 0 || selectedIndex.value >= props.templates.length) return null;
  return props.templates[selectedIndex.value];
});

const selectIndex = (index) => {
  selectedIndex.value = index;
};

const updateTemplates = (nextTemplates) => {
  emit("update:templates", nextTemplates);
};

const updateField = (field, value) => {
  if (selectedIndex.value < 0) return;
  const nextTemplates = props.templates.map((item, index) => {
    if (index !== selectedIndex.value) return item;
    return {
      ...item,
      [field]: value,
    };
  });
  updateTemplates(nextTemplates);
};

const addTemplate = () => {
  const nextTemplate = {
    id: getUuid("inst"),
    name: append4Random("提示词模板"),
    value: "",
  };
  const nextTemplates = [...props.templates, nextTemplate];
  updateTemplates(nextTemplates);
  selectedIndex.value = nextTemplates.length - 1;
};

const duplicateTemplate = () => {
  if (!currentTemplate.value) return;
  const duplicated = {
    ...structuredClone(currentTemplate.value),
    id: getUuid("inst"),
    name: `${currentTemplate.value.name || "提示词模板"}-copy`,
  };
  const nextTemplates = [...props.templates, duplicated];
  updateTemplates(nextTemplates);
  selectedIndex.value = nextTemplates.length - 1;
};

const deleteTemplate = () => {
  if (selectedIndex.value < 0) return;
  const nextTemplates = props.templates.filter((_, index) => index !== selectedIndex.value);
  updateTemplates(nextTemplates);
  if (nextTemplates.length === 0) {
    selectedIndex.value = -1;
  } else if (selectedIndex.value >= nextTemplates.length) {
    selectedIndex.value = nextTemplates.length - 1;
  }
};

const summarizeTemplate = (value) => {
  if (!value) return t("user.templates.emptyContent");
  return value.length > 64 ? `${value.slice(0, 64)}...` : value;
};

watch(
  () => props.templates.length,
  (newLength) => {
    if (newLength === 0) {
      selectedIndex.value = -1;
      return;
    }

    if (selectedIndex.value === -1) {
      selectedIndex.value = 0;
      return;
    }

    if (selectedIndex.value >= newLength) {
      selectedIndex.value = newLength - 1;
    }
  },
  { immediate: true },
);
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

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

.section-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .btn {
    min-height: 42px;
  }
}

.settings-workspace {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.settings-list-panel,
.settings-detail-panel {
  min-height: 0;
  border: 1px solid oklch(var(--b3) / 0.6);
  border-radius: 24px;
  background: linear-gradient(180deg, oklch(var(--b1)) 0%, oklch(var(--b2) / 0.75) 100%);
  box-shadow: inset 0 1px 0 oklch(var(--b1) / 0.9);
}

.settings-list-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
}

.settings-list-item {
  border: 1px solid oklch(var(--b3) / 0.45);
  border-radius: 18px;
  padding: 14px;
  text-align: left;
  background-color: oklch(var(--b1) / 0.8);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: oklch(var(--n) / 0.14);
    transform: translateY(-1px);
    box-shadow: 0 12px 24px oklch(var(--n) / 0.05);
  }

  &.active {
    border-color: oklch(var(--su) / 0.22);
    background: linear-gradient(180deg, oklch(var(--b1)) 0%, oklch(var(--su) / 0.07) 100%);
    box-shadow: 0 14px 28px oklch(var(--n) / 0.06);
  }
}

.settings-list-title {
  font-size: 14px;
  font-weight: 700;
}

.settings-list-meta {
  margin-top: 8px;
  font-size: 11px;
  color: oklch(var(--bc) / 0.65);
  line-height: 1.5;
}

.settings-empty-list,
.settings-empty-detail {
  border: 1px dashed oklch(var(--b3));
  border-radius: 18px;
  padding: 20px;
  color: oklch(var(--bc) / 0.62);
  font-size: 14px;
}

.settings-detail-panel {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.detail-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;

  h3 {
    font-size: 18px;
    font-weight: 700;
  }

  p {
    margin-top: 4px;
    font-size: 12px;
    color: oklch(var(--bc) / 0.65);
  }
}

.detail-toolbar-actions {
  display: flex;
  gap: 10px;
}

.template-form-card {
  border: 1px solid oklch(var(--b3) / 0.6);
  border-radius: 20px;
  background: linear-gradient(180deg, oklch(var(--b1)) 0%, oklch(var(--b2) / 0.65) 100%);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 10px 30px oklch(var(--n) / 0.04);
}

.template-form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 12px;
    font-weight: 600;
  }
}

.template-textarea {
  min-height: 280px;
  resize: vertical;
}

@media (max-width: 1100px) {
  .settings-workspace {
    grid-template-columns: 1fr;
  }

  .detail-toolbar {
    flex-direction: column;
  }
}
</style>
