<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <form class="modal" role="dialog" :aria-label="editing ? 'Editar ingrediente' : 'Novo ingrediente'"
      @submit.prevent="save">
      <h3>{{ editing ? 'Editar ingrediente' : 'Novo ingrediente' }}</h3>
      <p class="sub">
        {{ editing ? 'As mudanças valem para a lista de ingredientes e para os próximos lanches.'
          : 'Entra na lista de ingredientes. Pelo menu da Biblioteca você baixa o ingredientes.json atualizado.' }}
      </p>

      <label class="field">
        <span>Nome</span>
        <input ref="nameInput" v-model="name" type="text" maxlength="40" placeholder="Ex.: Gouda" />
      </label>

      <label class="field">
        <span>Categoria</span>
        <select v-model="category">
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>

      <div class="field">
        <span>Imagem <em>(opcional, PNG com fundo transparente fica melhor)</em></span>
        <label class="drop" :class="{ has: preview }">
          <input type="file" accept="image/*" @change="onFile" />
          <img v-if="preview" :src="preview" alt="Prévia" />
          <span v-else>Clique para escolher uma imagem</span>
        </label>
        <button v-if="preview" type="button" class="link" @click="preview = ''">Remover imagem</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button type="button" class="btn" @click="$emit('close')">Cancelar</button>
        <button type="submit" class="btn primary" :disabled="busy">{{ editing ? 'Salvar' : 'Adicionar' }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  libraryItems, allCategoryIds, addCustomIngredient, updateIngredient, fileToDataUrl, labelFor
} from '../customIngredients.js'

const props = defineProps({
  // Ingrediente da biblioteca em edição (se vazio, é um cadastro novo)
  editing: { type: Object, default: null }
})
const emit = defineEmits(['close', 'added', 'saved'])

const name = ref(props.editing?.nome ?? '')
const category = ref(props.editing?.categoria ?? 'outros')
const preview = ref(props.editing?.imagem ?? '')
const error = ref('')
const busy = ref(false)
const nameInput = ref(null)

// Categorias já existentes
const categories = computed(() => {
  const ids = [...allCategoryIds.value]
  if (!ids.includes('outros')) ids.push('outros')
  return ids.map(id => ({ id, name: labelFor(id) }))
})

async function onFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  error.value = ''
  busy.value = true
  try {
    preview.value = await fileToDataUrl(file)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
    event.target.value = ''
  }
}

function save() {
  const trimmed = name.value.trim()
  if (!trimmed) {
    error.value = 'Digite o nome do ingrediente.'
    nameInput.value?.focus()
    return
  }
  const exists = libraryItems.value.some(
    i => i.id !== props.editing?.id && i.nome.toLowerCase() === trimmed.toLowerCase()
  )
  if (exists) {
    error.value = 'Já existe um ingrediente com esse nome.'
    return
  }

  const data = { nome: trimmed, categoria: category.value, imagem: preview.value }
  if (props.editing) {
    updateIngredient(props.editing.id, data)
    emit('saved')
  } else {
    emit('added', addCustomIngredient(data))
  }
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

.field em {
  font-weight: 500;
  font-style: normal;
  color: var(--text-faint);
}

input[type='text'],
select {
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

input[type='text']:focus,
select:focus {
  border-color: var(--accent);
}

.drop {
  position: relative;
  display: grid;
  place-items: center;
  height: 120px;
  background: var(--bg);
  border: 1px dashed var(--border-strong);
  border-radius: 12px;
  color: var(--text-faint);
  font-size: 0.78rem;
  cursor: pointer;
  overflow: hidden;
}

.drop:hover {
  border-color: var(--accent);
}

.drop.has {
  background: #fff;
  border-style: solid;
}

.drop input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.drop img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.link {
  align-self: flex-start;
  padding: 0;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
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

.btn.primary:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
