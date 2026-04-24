<template>
  <span class="app-tooltip-host">
    <span
      ref="triggerRef"
      class="app-tooltip-trigger"
      v-bind="attrs"
      @mouseenter="showTooltip"
      @mouseleave="hideTooltip"
      @focusin="showTooltip"
      @focusout="hideTooltip"
    >
      <slot />
    </span>
    <Teleport to="body">
      <div v-if="visible" class="app-tooltip-bubble" :class="`is-${placement}`" :style="tooltipStyle">
        {{ text }}
      </div>
    </Teleport>
  </span>
</template>

<script setup>
defineOptions({ inheritAttrs: false });

import { computed, nextTick, onBeforeUnmount, ref, useAttrs } from "vue";

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  placement: {
    type: String,
    default: "top",
  },
});

const attrs = useAttrs();
const triggerRef = ref(null);
const visible = ref(false);
const position = ref({ top: 0, left: 0 });

const GAP = 10;

const tooltipStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
}));

const updatePosition = () => {
  const triggerEl = triggerRef.value;
  if (!triggerEl) return;
  const rect = triggerEl.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  switch (props.placement) {
    case "bottom":
      position.value = {
        top: rect.bottom + scrollY + GAP,
        left: rect.left + scrollX + rect.width / 2,
      };
      break;
    case "left":
      position.value = {
        top: rect.top + scrollY + rect.height / 2,
        left: rect.left + scrollX - GAP,
      };
      break;
    case "right":
      position.value = {
        top: rect.top + scrollY + rect.height / 2,
        left: rect.right + scrollX + GAP,
      };
      break;
    default:
      position.value = {
        top: rect.top + scrollY - GAP,
        left: rect.left + scrollX + rect.width / 2,
      };
  }
};

const bindViewportEvents = () => {
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);
};

const unbindViewportEvents = () => {
  window.removeEventListener("scroll", updatePosition, true);
  window.removeEventListener("resize", updatePosition);
};

const showTooltip = async () => {
  if (!props.text) return;
  visible.value = true;
  await nextTick();
  updatePosition();
  bindViewportEvents();
};

const hideTooltip = () => {
  visible.value = false;
  unbindViewportEvents();
};

onBeforeUnmount(() => {
  unbindViewportEvents();
});
</script>

<style scoped>
.app-tooltip-host {
  display: inline-flex;
}

.app-tooltip-trigger {
  display: inline-flex;
}

.app-tooltip-bubble {
  position: absolute;
  z-index: 5000;
  max-width: 260px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid oklch(var(--bc) / 0.12);
  background: oklch(var(--n) / 0.96);
  color: oklch(var(--nc));
  font-size: 12px;
  line-height: 1.45;
  box-shadow: 0 12px 28px oklch(var(--bc) / 0.16);
  pointer-events: none;
}

.app-tooltip-bubble.is-top {
  transform: translate(-50%, -100%);
}

.app-tooltip-bubble.is-bottom {
  transform: translate(-50%, 0);
}

.app-tooltip-bubble.is-left {
  transform: translate(-100%, -50%);
}

.app-tooltip-bubble.is-right {
  transform: translate(0, -50%);
}
</style>
