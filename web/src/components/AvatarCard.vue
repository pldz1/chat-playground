<template>
  <AppTooltip :text="t('tooltip.userSettings')" placement="bottom">
    <div class="avatar placeholder" :class="{ online: isLoggedIn, offline: !isLoggedIn }" @click="onShowUserSettingOverlay">
      <div class="avatar-shell">
        <span class="avatar-text">{{ username }}</span>
      </div>
    </div>
  </AppTooltip>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import AppTooltip from "@/components/AppTooltip.vue";

const store = useStore();
const { t } = useI18n();
const username = computed(() => (store.state.username ? store.state.username.slice(0, 2).toUpperCase() : t("common.guest")));
const isLoggedIn = computed(() => store.state.isLoggedIn);
</script>

<style scoped>
.avatar {
  height: 44px;
  width: 44px;
  min-height: 44px;
  cursor: pointer;
}

.avatar-shell {
  height: 44px;
  width: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, oklch(var(--a) / 0.18), transparent 44%), linear-gradient(180deg, oklch(var(--b1) / 0.96), oklch(var(--b2) / 0.92));
  color: oklch(var(--bc));
  border: 1px solid oklch(var(--bc) / 0.12);
  box-shadow:
    inset 0 1px 0 oklch(var(--b1) / 0.9),
    0 10px 22px oklch(var(--bc) / 0.1);
}

.avatar-text {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
</style>
