<template>
  <div class="chat-homepage-container">
    <!-- 头部 -->
    <div class="chpc-header">
      <HeaderBar></HeaderBar>
    </div>
    <!-- 对话内容 -->
    <div class="chpc-content">
      <!-- 对话侧边栏 -->
      <SidebarCard />
      <!-- 对话的主卡片 -->
      <ChatCard />
    </div>
  </div>
  <!-- 全局弹窗 -->
  <ImageModal />
</template>

<script setup>
import { watch, computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { dsAlert } from "@/utils";
import { getChatList, getChatInsTemplateList } from "@/services";

import SidebarCard from "@/views/chat/SidebarCard.vue";
import ChatCard from "@/views/chat/ChatCard.vue";
import HeaderBar from "@/components/HeaderBar.vue";
import ImageModal from "@/components/ImageModal.vue";

const store = useStore();
const { t } = useI18n();
const isLoggedIn = computed(() => store.state.isLoggedIn);
const curChatModel = computed(() => store.state.curChatModel);
const models = computed(() => store.state.models);

/**
 * 监听登录的状态, 来做页面的初始化
 */
watch(
  () => isLoggedIn.value,
  async () => {
    // 设置对话列表
    await getChatList();
    await getChatInsTemplateList();

    // 重置store的消息内容
    await store.dispatch("resetMessages");

    // 初始化获得一些用户对于对话模型的参数
    if (!isLoggedIn.value) {
      dsAlert({ type: "warn", message: t("common.loginHint") });
      return;
    }

    if (!curChatModel.value.apiKey && !curChatModel.value.name) {
      if (models.value.chat.length > 0) {
        await store.dispatch("setCurChatModel", models.value.chat[0]);
      }
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.chat-homepage-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top left, oklch(var(--p) / 0.08), transparent 26%),
    radial-gradient(circle at bottom right, oklch(var(--a) / 0.07), transparent 28%),
    linear-gradient(180deg, oklch(var(--b1) / 0.98), oklch(var(--b2) / 0.96));

  .chpc-header {
    height: 64px;
    flex: 0 0 auto;
  }

  .chpc-content {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: row;
    gap: 14px;
    padding: 14px;
  }
}
</style>
