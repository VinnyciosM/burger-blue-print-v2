<template>
  <aside class="guide-manager-panel">
    <SnackList :snacks="snacks" :activeSnackId="activeSnackId" @update:snacks="$emit('update:snacks', $event)"
      @select-snack="$emit('select-snack', $event)" @add-snack="$emit('add-snack')"
      @duplicate-snack="$emit('duplicate-snack', $event)" @delete-snack="$emit('delete-snack', $event)" />

    <div class="print-cta">
      <p class="cta-text">Pronto? Ajuste o layout e gere o manual.</p>
      <button class="primary-btn" @click="$emit('open-print-mode')">
        Gerar manual <span aria-hidden="true">→</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import SnackList from './SnackList.vue'

defineProps({
  snacks: { type: Array, required: true },
  activeSnackId: { type: Number, default: null }
})

defineEmits(['update:snacks', 'open-print-mode', 'add-snack', 'select-snack', 'duplicate-snack', 'delete-snack'])
</script>

<style scoped>
.guide-manager-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 340px;
  height: 100%;
  padding: 18px;
  background: var(--surface);
  border-left: 1px solid var(--border);
}

.print-cta {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.cta-text {
  margin: 0;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.primary-btn {
  padding: 13px;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  color: #1a1109;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: filter 0.15s, transform 0.1s;
}

.primary-btn:hover {
  filter: brightness(1.08);
}

.primary-btn:active {
  transform: scale(0.98);
}
</style>
