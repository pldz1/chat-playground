<template>
  <div class="component-header-bar">
    <div class="comphb-left">
      <AppTooltip v-if="showMenu" :text="t('header.menu')" placement="bottom">
        <AppDropdownMenu :items="menuItems" placement="bottom-start" :width="156" @select="onSelectMenuItem">
          <template #trigger="{ toggle }">
            <button type="button" class="comphb-icon-button" @click="toggle" v-html="menu32"></button>
          </template>
        </AppDropdownMenu>
      </AppTooltip>
      <button class="comphb-brand" @click="onBackLogin">
        <div class="comphb-brand-mark" v-html="app32"></div>
        <div class="comphb-brand-copy">
          <span class="comphb-brand-kicker">Chat Playground</span>
        </div>
      </button>
    </div>
    <div class="comphb-actions">
      <LanguageController />
      <ThemeController class="comphb-theme-controller"></ThemeController>
      <AvatarCard class="comphb-avatar-pos" />
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { app32, menu32 } from "@/assets/svg";
import ThemeController from "@/components/ThemeController.vue";
import LanguageController from "@/components/LanguageController.vue";
import AvatarCard from "@/components/AvatarCard.vue";
import AppTooltip from "@/components/AppTooltip.vue";
import AppDropdownMenu from "@/components/AppDropdownMenu.vue";

const props = defineProps({
  showMenu: {
    type: Boolean,
    default: true,
  },
});

const store = useStore();
const router = useRouter();
const { t } = useI18n();

const showMenu = props.showMenu;
const menuItems = computed(() => [
  { key: "chat", label: t("header.chat") },
  { key: "image", label: t("header.image") },
  { key: "settings", label: t("header.settings") },
]);

/**
 * 回到主页
 */
const onBackLogin = () => {
  router.push({ path: "/" });
  store.dispatch("login", null);
};

/**
 * 跳转到对话页
 */
const onGoChat = async () => {
  router.push({ path: "/chat" });
};

/**
 * 跳转到图像页
 */
const onGoImage = async () => {
  router.push({ path: "/image" });
};

const onGoSettings = async () => {
  router.push({ path: "/settings" });
};

const onSelectMenuItem = async (item) => {
  if (item.key === "chat") await onGoChat();
  if (item.key === "image") await onGoImage();
  if (item.key === "settings") await onGoSettings();
};
</script>

<style lang="scss" scoped>
.component-header-bar {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 64px;
  padding: 10px 20px;
  border-bottom: 1px solid oklch(var(--bc) / 0.1);
  background: linear-gradient(180deg, oklch(var(--b1) / 0.92), oklch(var(--b2) / 0.9)), oklch(var(--b1) / 0.72);
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 40px oklch(var(--bc) / 0.06);
  z-index: 301;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: oklch(var(--bc));

  .comphb-left,
  .comphb-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .comphb-left {
    min-width: 0;
    flex: 1 1 0;
  }

  .comphb-actions {
    justify-content: flex-end;
    flex: 1 1 0;
  }

  .comphb-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: oklch(var(--bc));
    transition:
      transform 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background-color 0.18s ease;

    &:hover {
      transform: translateY(-1px);
      border-color: oklch(var(--p) / 0.3);
      box-shadow: 0 10px 24px oklch(var(--bc) / 0.1);
      background: oklch(var(--b1) / 0.96);
    }
  }

  .comphb-icon-button {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    cursor: pointer;
  }

  .comphb-brand {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 14px;
    border: none;
    border-radius: 18px;
    background: transparent;
    cursor: pointer;
    color: inherit;
  }

  .comphb-brand-mark {
    height: 42px;
    width: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .comphb-brand-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.1;
  }

  .comphb-brand-kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: oklch(var(--bc) / 0.62);
  }

  .comphb-avatar-trigger {
    border: none;
    background: transparent;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  @media (max-width: 960px) {
    padding: 10px 14px;

    .comphb-nav {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .comphb-brand-copy {
      display: none;
    }
  }
}
</style>
