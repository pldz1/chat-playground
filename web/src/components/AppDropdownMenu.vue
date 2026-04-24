<template>
  <div ref="triggerRef" class="app-dropdown-trigger">
    <slot name="trigger" :toggle="toggleOpen" :open="open" />
  </div>
  <Teleport to="body">
    <div v-if="open" ref="menuRef" class="app-dropdown-menu" :style="menuStyle">
      <slot v-if="$slots.default" :close="closeMenu" />
      <template v-else>
        <button
          v-for="item in items"
          :key="item.key"
          class="app-dropdown-item"
          :class="{ active: item.active, danger: item.danger }"
          @click="selectItem(item)"
        >
          {{ item.label }}
        </button>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  placement: {
    type: String,
    default: "bottom-start",
  },
  width: {
    type: Number,
    default: 160,
  },
});

const emit = defineEmits(["select"]);

const triggerRef = ref(null);
const menuRef = ref(null);
const open = ref(false);
const position = ref({ top: 0, left: 0 });

const menuStyle = computed(() => ({
  top: `${position.value.top}px`,
  left: `${position.value.left}px`,
  minWidth: `${props.width}px`,
}));

const updatePosition = () => {
  const triggerEl = triggerRef.value;
  if (!triggerEl) return;
  const rect = triggerEl.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  let top = rect.bottom + scrollY + 4;
  let left = rect.left + scrollX;

  if (props.placement.includes("end")) {
    left = rect.right + scrollX - props.width;
  }

  position.value = { top, left };
};

const onDocumentClick = (event) => {
  const triggerEl = triggerRef.value;
  const menuEl = menuRef.value;
  if (triggerEl?.contains(event.target) || menuEl?.contains(event.target)) return;
  closeMenu();
};

const bindViewportEvents = () => {
  document.addEventListener("click", onDocumentClick);
  window.addEventListener("scroll", updatePosition, true);
  window.addEventListener("resize", updatePosition);
};

const unbindViewportEvents = () => {
  document.removeEventListener("click", onDocumentClick);
  window.removeEventListener("scroll", updatePosition, true);
  window.removeEventListener("resize", updatePosition);
};

const openMenu = async () => {
  open.value = true;
  await nextTick();
  updatePosition();
  bindViewportEvents();
};

const closeMenu = () => {
  open.value = false;
  unbindViewportEvents();
};

const toggleOpen = async () => {
  if (open.value) {
    closeMenu();
    return;
  }
  await openMenu();
};

const selectItem = (item) => {
  emit("select", item);
  closeMenu();
};

onBeforeUnmount(() => {
  unbindViewportEvents();
});
</script>

<style scoped>
.app-dropdown-trigger {
  display: inline-flex;
}

.app-dropdown-menu {
  position: absolute;
  z-index: 5000;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
  border-radius: 12px;
  border: 1px solid oklch(var(--bc) / 0.12);
  background: oklch(var(--b1) / 0.985);
  box-shadow:
    0 12px 24px oklch(var(--bc) / 0.1),
    0 2px 6px oklch(var(--bc) / 0.04);
}

.app-dropdown-item {
  width: 100%;
  display: block;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: oklch(var(--bc) / 0.86);
  transition:
    background-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.app-dropdown-item:hover,
.app-dropdown-item.active {
  background: oklch(var(--b2) / 0.92);
  color: oklch(var(--bc));
}

.app-dropdown-item:hover {
  transform: translateX(1px);
}

.app-dropdown-item.danger {
  color: oklch(var(--er));
}
</style>
