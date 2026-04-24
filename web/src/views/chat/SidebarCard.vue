<template>
  <div class="chat-sidebar-container" :class="{ expanded: isShowChatScrollbar }">
    <div class="csdb-sidebar">
      <!-- 显示 对话(chat) 的列表的头部 -->
      <div class="csdb-chat-list">
        <!-- 展开或者折叠 对话(chat) 列表 -->
        <AppTooltip :text="t('chat.sidebarToggle')" placement="right">
          <button class="btn csdb-btn-wh1 csdb-btn-color1" @click="onShowSidebar">
            <div v-html="sildbar24"></div>
          </button>
        </AppTooltip>
        <!-- 新建一个 对话(chat) -->
        <AppTooltip :text="t('chat.newChat')" placement="right">
          <button class="btn csdb-btn-wh1 csdb-btn-color1" @click="onNewChat">
            <div v-html="new24"></div>
          </button>
        </AppTooltip>
      </div>
      <AppTooltip :text="t('chat.modelSettings')" placement="right">
        <button class="btn csdb-btn-wh1 csdb-btn-color1" @click="onShowModelSettings">
          <div v-html="setting24"></div>
        </button>
      </AppTooltip>
    </div>
    <!-- 具体下滑内容 -->
    <div class="csdb-chats" :class="{ expanded: isShowChatScrollbar }">
      <div v-if="chatList.length == 0" class="csdb-chats-container">
        <h2 class="font-bold">
          {{ t("chat.noChats") }}
          <br />
          <div v-html="wao128"></div>
        </h2>
      </div>
      <!-- chat history list -->
      <div v-else class="csdb-chats-container">
        <div v-for="item in chatList" :key="item">
          <input
            v-if="isShowOptionCid == item.cid && isEditChatName"
            v-model="editChatName"
            @blur="changeChatName"
            @keydown.enter="changeChatName"
            type="text"
            class="input input-bordered"
            ref="editChatNameInputElRef"
          />
          <!-- 对话的单元 -->
          <div v-else :class="['csdb-chat-item', { 'csdb-chat-item-active': cid === item.cid }]">
            <!-- 对话标签 -->
            <span class="csdb-chat-label" @click="onSelectChat(item)">
              {{ item.cname }}
            </span>
            <AppDropdownMenu placement="bottom-end" :width="156" class="csdb-chat-actions-menu">
              <template #trigger="{ toggle, open }">
                <div class="csdb-chat-dropdown">
                  <button
                    class="btn"
                    :class="{ open }"
                    :aria-label="t('chat.moreActions')"
                    @click.stop="toggle"
                  >
                    <div v-html="options24"></div>
                  </button>
                </div>
              </template>
              <template #default="{ close }">
                <button class="csdb-chat-option" @click="onEditChatName(item.cid, close)">
                  <div class="csdb-chat-option-copy">
                    <span>{{ t("chat.renameChat") }}</span>
                  </div>
                </button>
                <button class="csdb-chat-option csdb-chat-option-danger" @click="onDeleteChat(item.cid, close)">
                  <div class="csdb-chat-option-copy">
                    <span>{{ t("chat.deleteChat") }}</span>
                  </div>
                </button>
              </template>
            </AppDropdownMenu>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ChatSettings></ChatSettings>
</template>

<script setup>
import { useStore } from "vuex";
import { nextTick, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { options24, sildbar24, new24, setting24, wao128 } from "@/assets/svg";
import { deleteChat, renameChat, getChatSettings } from "@/services";
import { buildDefaultChatSettings } from "@/constants";
import ChatSettings from "@/views/chat/ChatSettings.vue";
import { dsAlert } from "@/utils";
import AppTooltip from "@/components/AppTooltip.vue";
import AppDropdownMenu from "@/components/AppDropdownMenu.vue";

const store = useStore();
const { t } = useI18n();
const cid = computed(() => store.state.curChatId);
const chatList = computed(() => {
  return [...store.state.chatList].reverse();
});

const isShowOptionCid = ref("");
const isEditChatName = ref(false);
const editChatName = ref("");
const editChatNameInputElRef = ref(null);
const isShowChatScrollbar = ref(false);
const curChatModel = computed(() => store.state.curChatModel);

/**
 * 回是否开关侧边栏的布尔量
 *  */
const onShowSidebar = () => {
  isShowChatScrollbar.value = !isShowChatScrollbar.value;
};

/**
 * 新建对话
 *  */
const onNewChat = async () => {
  store.dispatch("setCurChatModelSettings", buildDefaultChatSettings(curChatModel.value));
  await store.dispatch("setCurChatId", "");
  await store.dispatch("resetMessages");
};

/**
 * 打开模型设置界面
 */
const onShowModelSettings = () => {
  if (!curChatModel.value.name) {
    dsAlert({ type: "warn", message: t("chat.chooseModelFirst") });
    return;
  } else global_chat_model_settings.showModal();
};

/**
 * 选择对话
 */
const onSelectChat = async (item) => {
  if (item.cid == cid.value) return;
  await store.dispatch("setCurChatId", item.cid);
  await store.dispatch("resetMessages");
  await getChatSettings();
};

/**
 * 删除对话
 */
const onDeleteChat = async (chatId, closeMenu) => {
  if (closeMenu) closeMenu();
  if (chatId) await deleteChat(chatId);
  if (chatId == cid.value) {
    await store.dispatch("setCurChatId", "");
  }
  isShowOptionCid.value = "";
  editChatName.value = "";
};

/**
 * 修改对话名称
 */
const onEditChatName = async (chatId, closeMenu) => {
  if (closeMenu) closeMenu();
  isShowOptionCid.value = chatId;
  isEditChatName.value = true;
  editChatName.value = "";
  await nextTick();
  if (editChatNameInputElRef?.value[0]) editChatNameInputElRef.value[0].focus();
};

/**
 * 修改对话名称
 */
const changeChatName = async () => {
  if (editChatName.value) await renameChat(isShowOptionCid.value, editChatName.value);
  await nextTick();
  isEditChatName.value = false;
  editChatName.value = "";
  isShowOptionCid.value = "";
};
</script>

<style lang="scss" scoped>
.chat-sidebar-container {
  --sidebar-rail-width: 64px;
  --sidebar-panel-width: 272px;
  height: 100%;
  max-height: 100%;
  flex: 0 0 auto;
  width: var(--sidebar-rail-width);
  min-width: var(--sidebar-rail-width);
  max-width: var(--sidebar-rail-width);
  border: 1px solid oklch(var(--bc) / 0.12);
  border-radius: 28px;
  background:
    linear-gradient(180deg, oklch(var(--b1) / 0.88), oklch(var(--b2) / 0.84)),
    oklch(var(--b1) / 0.64);
  box-shadow: 0 20px 44px oklch(var(--bc) / 0.08);
  display: flex;
  flex-direction: row;
  overflow: hidden;
  contain: layout paint;
  will-change: width;
  transition: width 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  &.expanded {
    width: calc(var(--sidebar-rail-width) + var(--sidebar-panel-width));
    min-width: calc(var(--sidebar-rail-width) + var(--sidebar-panel-width));
    max-width: calc(var(--sidebar-rail-width) + var(--sidebar-panel-width));
  }

  .csdb-sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 14px 10px;
    width: 64px;
    max-width: 64px;
    background: oklch(var(--b2) / 0.62);
    transition: border-color 0.18s ease;

    .csdb-btn-color1 {
      background: oklch(var(--b1) / 0.78);
      box-shadow: none;
      border: 1px solid oklch(var(--bc) / 0.12);
      border-radius: 14px;
      color: oklch(var(--bc));
      transition:
        transform 0.18s ease,
        border-color 0.18s ease,
        box-shadow 0.18s ease;

      &:hover {
        transform: translateY(-1px);
        background-color: oklch(var(--b1) / 0.96);
        border-color: oklch(var(--p) / 0.18);
        box-shadow: 0 10px 20px oklch(var(--bc) / 0.1);
      }
    }

    .csdb-btn-wh1 {
      height: 40px;
      width: 40px;
      min-height: 40px;
    }

    .csdb-chat-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
  }

  &.expanded {
    .csdb-sidebar {
      border-right: 1px solid oklch(var(--bc) / 0.1);
    }
  }

  .csdb-chats {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 14px 12px;
    width: var(--sidebar-panel-width);
    max-width: var(--sidebar-panel-width);
    min-width: var(--sidebar-panel-width);
    overflow: hidden;
    opacity: 0;
    transform: translateX(-10px);
    pointer-events: none;
    will-change: opacity, transform;
    transition:
      opacity 0.16s ease,
      transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);

    &.expanded {
      opacity: 1;
      transform: translateX(0);
      pointer-events: auto;
    }

    .csdb-chats-container {
      background: oklch(var(--b1) / 0.42);
      height: 100%;
      width: 100%;
      text-align: center;
      max-height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      border-radius: 22px;
      padding: 10px;
      border: 1px solid oklch(var(--bc) / 0.1);

      h2 {
        display: flex;
        align-items: center;
        height: 100%;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }
    }

    .input {
      height: 40px;
      width: 100%;
      border-radius: 14px;
      border: 1px solid rgba(113, 130, 84, 0.16);
      background: rgba(255, 255, 255, 0.88);

      &:focus,
      &:focus-within {
        border-color: rgba(92, 114, 49, 0.42);
        outline: none;
      }
    }

    .csdb-chat-item-input {
      height: 36px;
      max-width: 208px;
      border: none;
      border-radius: 10px;
      background-color: transparent;
    }

    .csdb-chat-item {
      height: 44px;
      min-height: 44px;
      width: 100%;
      border: 1px solid transparent;
      border-radius: 14px;
      background-color: transparent;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      color: #20301b;
      margin-bottom: 6px;
      padding: 0 8px 0 12px;
      transition:
        background-color 0.18s ease,
        border-color 0.18s ease,
        transform 0.18s ease;

      &:hover {
        background-color: oklch(var(--b1) / 0.78);
        border-color: oklch(var(--bc) / 0.1);
        transform: translateY(-1px);
      }
    }

    .csdb-chat-item-active {
      background: linear-gradient(180deg, oklch(var(--p) / 0.1), oklch(var(--b1) / 0.9));
      border-color: oklch(var(--p) / 0.16);
      box-shadow: 0 10px 18px oklch(var(--bc) / 0.08);
      font-weight: 700;
    }

    .csdb-chat-label {
      width: 180px;
      text-align: left;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .csdb-chat-dropdown {
      display: inline-flex;

      .btn {
        height: 26px;
        width: 26px;
        min-height: 0px;
        min-width: 0px;
        background-color: transparent;
        border: none;
        box-shadow: initial;
        border-radius: 999px;
        color: oklch(var(--bc) / 0.64);
        transition:
          background-color 0.16s ease,
          color 0.16s ease,
          transform 0.16s ease,
          box-shadow 0.16s ease;

        &:hover,
        &.open {
          background: oklch(var(--b2) / 0.98);
          color: oklch(var(--bc));
          box-shadow: inset 0 0 0 1px oklch(var(--bc) / 0.08);
        }

        &:hover {
          transform: translateY(-1px) scale(1.02);
        }
      }
    }
  }

  .csdb-chat-option {
    width: 100%;
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border: none;
    border-radius: 10px;
    background: transparent;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: oklch(var(--bc) / 0.84);
    line-height: 1;
    transition:
      background-color 0.18s ease,
      color 0.18s ease,
      transform 0.18s ease;

    &:hover {
      background: oklch(var(--b2) / 0.9);
      color: oklch(var(--bc));
      transform: translateX(1px);
    }
  }

  .csdb-chat-option-copy {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1 1 auto;
  }

  .csdb-chat-option-copy span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .csdb-chat-option-danger {
    margin-top: 2px;
    padding-top: 10px;
    border-top: 1px solid oklch(var(--bc) / 0.08);
    color: oklch(var(--er));

    &:hover {
      background: oklch(var(--er) / 0.09);
      color: oklch(var(--er));
    }
  }
}
</style>
