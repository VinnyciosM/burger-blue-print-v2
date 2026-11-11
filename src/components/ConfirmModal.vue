<template>
  <div class="overlay" @mousedown.self="$emit('cancel')">
    <section class="confirm" role="alertdialog" :aria-label="title">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="actions">
        <button class="btn" @click="$emit('cancel')">{{ cancelLabel }}</button>
        <button class="btn primary" :class="{ danger }" autofocus @click="$emit('confirm')">{{ confirmLabel }}</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirmar' },
  cancelLabel: { type: String, default: 'Cancelar' },
  danger: { type: Boolean, default: false }
})
const emit = defineEmits(['confirm', 'cancel'])

const onKey = (e) => {
  if (e.key === 'Escape') { e.stopImmediatePropagation(); emit('cancel') }
}
// Captura: o Esc fecha só esta confirmação, não o pop-up que está por baixo
onMounted(() => document.addEventListener('keydown', onKey, true))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey, true))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  font-family: var(--font);
}

.confirm {
  width: 380px;
  max-width: calc(100vw - 32px);
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  color: var(--text);
}

h3 { margin: 0 0 8px; font-size: 1.05rem; }
p { margin: 0 0 20px; font-size: 0.82rem; line-height: 1.45; color: var(--text-muted); }

.actions { display: flex; justify-content: flex-end; gap: 8px; }

.btn {
  padding: 9px 16px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s, filter 0.15s;
}
.btn:hover { border-color: var(--border-strong); }

.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}
.btn.primary:hover { filter: brightness(1.08); }
</style>
