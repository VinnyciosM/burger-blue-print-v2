<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <form class="modal" role="dialog" aria-label="Nova categoria" @submit.prevent="save">
      <h3>Nova categoria</h3>
      <p class="sub">Depois de criar, escolha essa categoria ao cadastrar ou editar um ingrediente.</p>

      <label class="field">
        <span>Nome</span>
        <input ref="nameInput" v-model="name" type="text" maxlength="30" placeholder="Ex.: Bebidas"
          @input="error = ''" />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button type="button" class="btn" @click="$emit('close')">Cancelar</button>
        <button type="submit" class="btn primary">Criar</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { addCategory } from '../customIngredients.js'

const emit = defineEmits(['close', 'added'])

const name = ref('')
const error = ref('')
const nameInput = ref(null)

function save() {
  const result = addCategory(name.value)
  if (result.error) {
    error.value = result.error
    nameInput.value?.focus()
    return
  }
  emit('added', result.id)
  emit('close')
}

const onKey = (e) => { if (e.key === 'Escape') emit('close') }
onMounted(() => {
  nameInput.value?.focus()
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  font-family: var(--font);
}

.modal {
  width: 360px;
  max-width: calc(100vw - 32px);
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  color: var(--text);
}

h3 {
  margin: 0;
  font-size: 1.05rem;
}

.sub {
  margin: 4px 0 16px;
  font-size: 0.75rem;
  color: var(--text-faint);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field > span {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
}

input[type='text'] {
  height: 38px;
  padding: 0 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.85rem;
  outline: none;
}

input[type='text']:focus {
  border-color: var(--accent);
}

.error {
  margin: 0 0 12px;
  font-size: 0.78rem;
  color: #ff6b6b;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 9px 16px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.btn:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}
</style>
