<template>
  <div class="settings-page-shell">
    <div class="settings-page-header">
      <HeaderBar />
    </div>
    <div class="settings-page-content">
      <UserSettings />
    </div>
  </div>
</template>

<script setup>
import HeaderBar from "@/components/HeaderBar.vue";
import UserSettings from "@/views/user/UserSettings.vue";
</script>

<style lang="scss" scoped>
.settings-page-shell {
  height: 100%;
  width: 100%;
}

.settings-page-header {
  height: 64px;
}

.settings-page-content {
  height: calc(100% - 64px);
}
</style>
