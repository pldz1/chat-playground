<template>
  <div class="aigc-playground-home">
    <div class="aiph-header">
      <HeaderBar :show-navigation="false" :show-menu="false" />
    </div>
    <div class="aiph-hero">
      <div class="aiph-copy">
        <span class="aiph-kicker">{{ t("home.kicker") }}</span>
        <h1>{{ t("home.title") }}</h1>
        <p>{{ t("home.description") }}</p>
      </div>
      <div class="aiph-grid">
        <article class="aiph-card aiph-card-chat">
          <div class="aiph-card-meta">{{ t("home.chatMeta") }}</div>
          <h2>{{ t("home.chatTitle") }}</h2>
          <p>{{ t("home.chatDescription") }}</p>
          <button class="aiph-action aiph-action-primary" @click="onGoChat">{{ t("home.chatAction") }}</button>
        </article>
        <article class="aiph-card aiph-card-image">
          <div class="aiph-card-meta">{{ t("home.imageMeta") }}</div>
          <h2>{{ t("home.imageTitle") }}</h2>
          <p>{{ t("home.imageDescription") }}</p>
          <button class="aiph-action" @click="onGoImage">{{ t("home.imageAction") }}</button>
        </article>
        <article class="aiph-card aiph-card-settings">
          <div class="aiph-card-meta">{{ t("home.settingsMeta") }}</div>
          <h2>{{ t("home.settingsTitle") }}</h2>
          <p>{{ t("home.settingsDescription") }}</p>
          <button class="aiph-action" @click="onGoSettings">{{ t("home.settingsAction") }}</button>
        </article>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import HeaderBar from "@/components/HeaderBar.vue";

const router = useRouter();
const { t } = useI18n();

const onGoChat = async () => {
  router.push({ path: "/chat" });
};

const onGoImage = async () => {
  router.push({ path: "/image" });
};

const onGoSettings = async () => {
  router.push({ path: "/settings" });
};
</script>
<style lang="scss" scoped>
.aigc-playground-home {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .aiph-header {
    flex: 0 0 auto;
    height: 64px;
  }

  .aiph-hero {
    flex: 1 1 auto;
    min-height: 0;
    position: relative;
    margin: 18px;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: 26px;
    padding: 34px;
    border: 1px solid oklch(var(--bc) / 0.12);
    border-radius: 32px;
    background:
      radial-gradient(circle at top left, oklch(var(--p) / 0.14), transparent 34%),
      linear-gradient(180deg, oklch(var(--b1) / 0.92), oklch(var(--b2) / 0.92));
    box-shadow: 0 26px 70px oklch(var(--bc) / 0.09);
  }

  .aiph-copy {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
    padding: 8px 4px;

    h1 {
      margin: 0;
      max-width: 620px;
      font-size: clamp(38px, 4.6vw, 60px);
      line-height: 1.04;
      font-weight: 800;
      letter-spacing: -0.045em;
      color: oklch(var(--bc));
    }

    p {
      max-width: 560px;
      font-size: 16px;
      line-height: 1.8;
      color: oklch(var(--bc) / 0.72);
    }
  }

  .aiph-kicker {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: oklch(var(--bc) / 0.62);
  }

  .aiph-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
    align-content: center;
  }

  .aiph-card {
    min-height: 220px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
    border-radius: 28px;
    border: 1px solid oklch(var(--bc) / 0.12);
    background: oklch(var(--b1) / 0.72);
    box-shadow: inset 0 1px 0 oklch(var(--b1) / 0.72);

    h2 {
      margin: 0;
      font-size: 34px;
      line-height: 1.08;
      font-weight: 800;
      color: oklch(var(--bc));
    }

    p {
      margin: 0;
      max-width: 420px;
      font-size: 15px;
      line-height: 1.7;
      color: oklch(var(--bc) / 0.7);
    }
  }

  .aiph-card-chat {
    grid-column: 1 / -1;
    min-height: 240px;
  }

  .aiph-card-chat {
    background:
      radial-gradient(circle at top right, oklch(var(--p) / 0.14), transparent 34%),
      oklch(var(--b1) / 0.84);
  }

  .aiph-card-image {
    background:
      radial-gradient(circle at bottom left, oklch(var(--a) / 0.16), transparent 32%),
      oklch(var(--b1) / 0.84);
  }

  .aiph-card-settings {
    background:
      radial-gradient(circle at top center, oklch(var(--n) / 0.08), transparent 34%),
      oklch(var(--b1) / 0.84);
  }

  .aiph-card-meta {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: oklch(var(--bc) / 0.6);
  }

  .aiph-action {
    align-self: flex-start;
    min-width: 172px;
    height: 50px;
    padding: 0 18px;
    border-radius: 16px;
    border: 1px solid oklch(var(--bc) / 0.12);
    background: oklch(var(--b1) / 0.82);
    color: oklch(var(--bc));
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      background-color 0.18s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px oklch(var(--bc) / 0.1);
    }
  }

  .aiph-action-primary {
    background: linear-gradient(180deg, oklch(var(--p)), oklch(var(--n)));
    color: oklch(var(--pc));
    box-shadow: 0 16px 26px oklch(var(--bc) / 0.14);
  }

  @media (max-width: 980px) {
    .aiph-hero {
      grid-template-columns: 1fr;
      padding: 24px;
      margin: 14px;
    }

    .aiph-grid {
      grid-template-columns: 1fr;
    }

    .aiph-card-chat {
      grid-column: auto;
      min-height: 220px;
    }
  }
}
</style>
