<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <input id="gloal-file-upload-input" type="file" style="display: none" />
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
#app {
  position: absolute;
  width: 100vw;
  height: 100vh;
  min-height: 400px;
  font-family:
    "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC",
    "Microsoft YaHei", sans-serif;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, oklch(var(--p) / 0.14), transparent 34%),
    radial-gradient(circle at top right, oklch(var(--a) / 0.12), transparent 28%),
    linear-gradient(180deg, oklch(var(--b1) / 0.98), oklch(var(--b2) / 0.96));
  color: oklch(var(--bc));
  /* 允许在webview中拷贝文字 */
  user-select: text;
}
</style>
