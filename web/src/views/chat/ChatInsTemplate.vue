<template>
  <div class="chat-template-display-card">
    <div class="ctdc-typewriter" ref="typewriterRef"></div>
    <div class="ctdc-templates">
      <div class="ctdc-templates-container">
        <button v-for="inst in insTemplateList" :key="inst.id" class="btn" @click="onSelectInst(inst.id)">
          {{ inst.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { chatInsTemplateList } from "@/constants";
import { addChat } from "@/services";
import { dsAlert, append4Random } from "@/utils";

const emit = defineEmits(["on-update"]);

const store = useStore();
const { t } = useI18n();
const curChatModelSettings = computed(() => store.state.curChatModelSettings);
const insTemplateList = computed(() => {
  return [...chatInsTemplateList, ...store.state.chatInsTemplateList];
});

const onSelectInst = async (id) => {
  const instObj = insTemplateList?.value?.find((inst) => inst.id === id);
  if (!instObj) {
    dsAlert({ type: "error", message: t("chat.invalidTemplate") });
    return;
  }

  const newVal = { ...curChatModelSettings.value };
  newVal.prompts[0].content[0].text = instObj.value;
  await store.dispatch("setCurChatModelSettings", newVal);

  const name = append4Random(instObj.name);
  await addChat(name);

  emit("on-update", [
    { role: "user", content: [{ type: "text", text: t("chat.repeatInstruction") }] },
    { role: "assistant", content: [{ type: "text", text: instObj.value }] },
  ]);
};
const typewriterRef = ref(null);
let repeatIntervalId = null;
let typingInProgress = false; // 防止重复启动

const blinkText = () => {
  const text = t("chat.welcomePrompt");
  const typeSpeed = 100;
  const repeatInterval = 30000;

  function typeWriter() {
    if (typingInProgress) return;
    typingInProgress = true;
    let i = 0;
    if (!typewriterRef.value) return;
    typewriterRef.value.innerHTML = "";
    const timer = setInterval(() => {
      i++;
      if (!typewriterRef.value) return;
      typewriterRef.value.innerHTML = text.slice(0, i) + '<span class="ctdc-typewriter-cursor"></span>';
      if (i === text.length) {
        clearInterval(timer);
        typingInProgress = false;
      }
    }, typeSpeed);
  }

  // 初次执行
  if (document.visibilityState === "visible") {
    typeWriter();
  }

  // 启动定时器
  repeatIntervalId = setInterval(() => {
    if (document.visibilityState === "visible") {
      typeWriter();
    }
  }, repeatInterval);
};

onMounted(() => {
  blinkText();
  // 监听页面可见性变化
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // 页面重新可见时重启动画
      blinkText();
    } else {
      // 隐藏时清除定时器，避免堆积
      if (repeatIntervalId) {
        clearInterval(repeatIntervalId);
      }
    }
  });
});

onUnmounted(() => {
  if (repeatIntervalId) {
    clearInterval(repeatIntervalId);
  }
});
</script>

<style lang="scss" scoped>
.chat-template-display-card {
  height: calc(100% - 128px);
  z-index: 200;
  background-color: transparent;
  padding: 20px;
  display: flex;
  overflow: hidden;

  .ctdc-typewriter {
    position: absolute;
    left: 20%;
    top: 30%;
    width: 60%;
    font-size: 2em;
    white-space: pre;
    color: oklch(var(--bc));
    text-align: center;
  }
  .ctdc-templates {
    position: relative;
    left: 15%;
    top: 55%;
    width: 70%;
    height: 30%;
    max-height: 30%;

    .ctdc-templates-container {
      position: relative;
      height: 100%;
      width: 100%;
      overflow-y: auto;

      .btn {
        margin: 4px;
        font-size: 1rem;
        height: 48px;
        max-height: 48px;
      }
    }
  }
}
</style>

<style>
.ctdc-typewriter-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background-color: oklch(var(--bc));
  animation: ctdc-typewriter-cursor-blink 1s step-end infinite;
}

@keyframes ctdc-typewriter-cursor-blink {
  50% {
    opacity: 0;
  }
}
</style>
