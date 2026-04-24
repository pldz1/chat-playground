<template>
  <AppTooltip :text="t('theme.tooltip')" placement="bottom">
    <AppDropdownMenu :items="themeOptions" placement="bottom-end" :width="140" @select="handleThemeChange">
      <template #trigger="{ toggle }">
        <button type="button" class="btn m-1 btn-color1" @click="toggle">
          {{ t("theme.label") }}
          <svg width="12px" height="12px" class="inline-block h-2 w-2 fill-current opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
            <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
          </svg>
        </button>
      </template>
    </AppDropdownMenu>
  </AppTooltip>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { applyTheme, getStoredTheme } from "@/utils/theme";
import AppTooltip from "@/components/AppTooltip.vue";
import AppDropdownMenu from "@/components/AppDropdownMenu.vue";

const { t } = useI18n();
const currentTheme = ref(getStoredTheme());
const themeOptions = computed(() => [
  { key: "light", value: "light", label: t("theme.options.light"), active: currentTheme.value === "light" },
  { key: "dark", value: "dark", label: t("theme.options.dark"), active: currentTheme.value === "dark" },
  { key: "cupcake", value: "cupcake", label: t("theme.options.cupcake"), active: currentTheme.value === "cupcake" },
  { key: "acid", value: "acid", label: t("theme.options.acid"), active: currentTheme.value === "acid" },
  { key: "lemonade", value: "lemonade", label: t("theme.options.lemonade"), active: currentTheme.value === "lemonade" },
]);

/**
 * 当用户更改主题选择时，获取单选按钮的 value，
 * 然后将该值设置到 <html> 标签的 data-theme 属性上，
 * DaisyUI 会自动根据这个属性应用对应的主题样式。
 */
const handleThemeChange = (item) => {
  currentTheme.value = item.value;
  applyTheme(item.value);
};
</script>

<style lang="scss" scoped>
.btn-color1 {
  background-color: transparent;
  box-shadow: initial;
  border-color: transparent;

  &:hover {
    background-color: oklch(var(--nc) / 0.1);
  }
}
</style>
