<template>
  <AppTooltip :text="t('language.tooltip')" placement="bottom">
    <AppDropdownMenu :items="localeOptions" placement="bottom-end" :width="140" @select="handleLocaleChange">
      <template #trigger="{ toggle }">
        <button type="button" class="btn m-1 controller-button" @click="toggle">
          {{ t("language.label") }}
          <svg width="12px" height="12px" class="inline-block h-2 w-2 fill-current opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
          </svg>
        </button>
      </template>
    </AppDropdownMenu>
  </AppTooltip>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { setAppLocale } from "@/i18n";
import AppTooltip from "@/components/AppTooltip.vue";
import AppDropdownMenu from "@/components/AppDropdownMenu.vue";

const { t, locale } = useI18n();

const localeOptions = computed(() => [
  { key: "zh-CN", value: "zh-CN", label: t("language.options.zh-CN"), active: locale.value === "zh-CN" },
  { key: "en-US", value: "en-US", label: t("language.options.en-US"), active: locale.value === "en-US" },
]);

const handleLocaleChange = (item) => {
  setAppLocale(item.value);
};
</script>

<style scoped>
.controller-button {
  background-color: transparent;
  box-shadow: initial;
  border-color: transparent;
}

.controller-button:hover {
  background-color: oklch(var(--nc) / 0.08);
}

</style>
