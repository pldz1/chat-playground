<template>
  <div class="home-login-container">
    <div class="hlcc-backdrop"></div>
    <div class="hlcc-shell">
      <div class="hlcc-toolbar">
        <LanguageController />
        <ThemeController />
      </div>
      <section class="hlcc-intro">
        <span class="hlcc-kicker">AIGC Playground</span>
        <h1 class="hlcc-title">{{ t("login.title") }}</h1>
        <p class="hlcc-copy">{{ t("login.description") }}</p>
        <div class="hlcc-badges">
          <span>Chat</span>
          <span>Image</span>
          <span>Local Mock</span>
        </div>
      </section>
      <section class="hlcc-container">
        <div class="hlcc-header">
          <span class="hlcc-label">{{ t("login.signInLabel") }}</span>
          <h2>{{ t("login.signInTitle") }}</h2>
          <p>{{ t("login.signInDescription") }}</p>
          <p v-if="isUsingMockStorage" class="hlcc-warning">{{ t("login.mockWarning") }}</p>
        </div>
        <form class="hlcc-form">
          <div class="hlcc-form-group">
            <label class="hlcc-form-label">{{ t("login.username") }}</label>
            <input class="hlcc-form-input" autocomplete="username" v-model="username" required />
          </div>
          <div class="hlcc-form-group">
            <label class="hlcc-form-label">{{ t("login.password") }}</label>
            <input class="hlcc-form-input" autocomplete="current-password" type="password" v-model="password" required />
          </div>
        </form>
        <button class="hlcc-login-button" @click="onLogin">{{ t("login.loginAction") }}</button>
        <div class="hlcc-divider">
          <span>{{ t("login.divider") }}</span>
        </div>
        <a class="hlcc-a-tips" @click.prevent="onSignIn">{{ t("login.signUpHint") }}</a>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { login, getModels } from "@/services";
import { loginAPI } from "@/services/api/user-api.js";
import { dsAlert, dsLoading } from "@/utils";
import ThemeController from "@/components/ThemeController.vue";
import LanguageController from "@/components/LanguageController.vue";

const router = useRouter();
const { t } = useI18n();

const username = ref("admin");
const password = ref("admin");
const isUsingMockStorage = ref(false);

const probeBackendMode = async () => {
  const probe = await loginAPI("admin", "admin");
  isUsingMockStorage.value = probe?.__backendMode === "mock";
};

/** 判断用户身份然后登录到应用中，并存入全局的身份信息. */
const onLogin = async () => {
  // 限制操作
  dsLoading(true);
  const flag = await login(username.value, password.value);
  if (flag) {
    router.push({ path: "/home" });
    // 设置初始化的模型
    await getModels();
  }
  dsLoading(false);
};

const onSignIn = () => {
  dsAlert({
    type: "info",
    message: t("toast.signInPending"),
  });
};

const onExperience = () => {
  router.push({ path: "/home" });
};

onMounted(async () => {
  await probeBackendMode();
});
</script>

<style lang="scss" scoped>
.home-login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  padding: 32px;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, oklch(var(--p) / 0.2), transparent 28%),
    radial-gradient(circle at bottom right, oklch(var(--a) / 0.18), transparent 30%);

  .hlcc-backdrop {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, oklch(var(--b1) / 0.5), oklch(var(--b2) / 0.2)),
      repeating-linear-gradient(135deg, oklch(var(--bc) / 0.03), oklch(var(--bc) / 0.03) 2px, transparent 2px, transparent 16px);
    pointer-events: none;
  }

  .hlcc-shell {
    position: relative;
    width: min(1080px, 100%);
    min-height: 620px;
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(360px, 440px);
    border: 1px solid oklch(var(--bc) / 0.12);
    border-radius: 32px;
    overflow: hidden;
    background: oklch(var(--b1) / 0.82);
    box-shadow: 0 30px 90px oklch(var(--bc) / 0.12);
    backdrop-filter: blur(20px);
  }

  .hlcc-toolbar {
    position: absolute;
    right: 22px;
    top: 18px;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .hlcc-intro {
    padding: 56px 52px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
    background:
      radial-gradient(circle at top left, oklch(var(--p) / 0.14), transparent 38%), linear-gradient(180deg, oklch(var(--b2) / 0.84), oklch(var(--b1) / 0.62));
  }

  .hlcc-kicker {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: oklch(var(--bc) / 0.62);
  }

  .hlcc-title {
    max-width: 560px;
    font-size: clamp(40px, 5vw, 64px);
    line-height: 1.04;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: oklch(var(--bc));
  }

  .hlcc-copy {
    max-width: 520px;
    font-size: 16px;
    line-height: 1.75;
    color: oklch(var(--bc) / 0.74);
  }

  .hlcc-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    span {
      padding: 9px 14px;
      border-radius: 999px;
      border: 1px solid oklch(var(--bc) / 0.12);
      background: oklch(var(--b1) / 0.64);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: oklch(var(--bc) / 0.68);
    }
  }

  .hlcc-container {
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: oklch(var(--b1) / 0.7);
  }

  .hlcc-header {
    margin-bottom: 28px;

    .hlcc-label {
      display: inline-block;
      margin-bottom: 10px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: oklch(var(--bc) / 0.66);
    }

    h2 {
      margin: 0;
      font-size: 32px;
      line-height: 1.1;
      font-weight: 800;
      color: oklch(var(--bc));
    }

    p {
      margin-top: 10px;
      font-size: 14px;
      line-height: 1.7;
      color: oklch(var(--bc) / 0.72);
    }

    .hlcc-warning {
      margin-top: 12px;
      color: oklch(var(--er));
      font-size: 12px;
      font-weight: 600;
      line-height: 1.6;
    }
  }

  .hlcc-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .hlcc-form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .hlcc-form-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: oklch(var(--bc) / 0.64);
  }

  .hlcc-form-input {
    width: 100%;
    height: 54px;
    padding: 0 16px;
    border-radius: 18px;
    border: 1px solid oklch(var(--bc) / 0.12);
    background: oklch(var(--b1) / 0.9);
    font-size: 16px;
    color: oklch(var(--bc));
    box-sizing: border-box;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background-color 0.18s ease;

    &:focus {
      outline: none;
      border-color: oklch(var(--p) / 0.42);
      box-shadow: 0 0 0 4px oklch(var(--p) / 0.14);
      background: oklch(var(--b1) / 0.98);
    }
  }

  .hlcc-login-button,
  .hlcc-secondary-button {
    height: 54px;
    border-radius: 18px;
    border: 1px solid oklch(var(--bc) / 0.12);
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      border-color 0.18s ease,
      background-color 0.18s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .hlcc-login-button {
    margin-top: 24px;
    background: linear-gradient(180deg, oklch(var(--p)), oklch(var(--n)));
    color: oklch(var(--pc));
    box-shadow: 0 16px 28px oklch(var(--bc) / 0.18);
  }

  .hlcc-secondary-button {
    background: oklch(var(--b1) / 0.8);
    color: oklch(var(--bc));
  }

  .hlcc-divider {
    margin: 22px 0 16px;
    position: relative;
    text-align: center;

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      width: calc(50% - 22px);
      height: 1px;
      background: oklch(var(--bc) / 0.16);
    }

    &::before {
      left: 0;
    }

    &::after {
      right: 0;
    }

    span {
      position: relative;
      padding: 0 10px;
      font-size: 12px;
      color: oklch(var(--bc) / 0.58);
      background: oklch(var(--b1) / 0.88);
    }
  }

  .hlcc-a-tips {
    margin-top: 16px;
    font-size: 13px;
    color: oklch(var(--p));
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      cursor: pointer;
    }
  }

  @media (max-width: 960px) {
    padding: 18px;

    .hlcc-shell {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .hlcc-toolbar {
      right: 14px;
      top: 12px;
    }

    .hlcc-intro {
      padding: 40px 30px 24px;
    }

    .hlcc-container {
      padding: 28px 30px 36px;
    }
  }
}
</style>
