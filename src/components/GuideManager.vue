<template>
  <aside class="guide-manager-panel">
    <SnackList :snacks="snacks" :activeSnackId="activeSnackId" @update:snacks="$emit('update:snacks', $event)"
      @select-snack="$emit('select-snack', $event)" @add-snack="$emit('add-snack')"
      @duplicate-snack="$emit('duplicate-snack', $event)" @delete-snack="$emit('delete-snack', $event)"
      @toggle-flag="(id, key) => $emit('toggle-flag', id, key)" show-layer-controls />
  </aside>
</template>

<script setup>
import SnackList from './SnackList.vue'

defineProps({
  snacks: { type: Array, required: true },
  activeSnackId: { type: Number, default: null }
})

defineEmits(['update:snacks', 'open-print-mode', 'add-snack', 'select-snack', 'duplicate-snack', 'delete-snack', 'toggle-flag'])
</script>

<style scoped>
.guide-manager-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 300px;
  height: 100%;
  padding: 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-panel);
}

</style>
