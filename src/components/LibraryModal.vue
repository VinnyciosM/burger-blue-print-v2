<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <section class="library" role="dialog" aria-label="Biblioteca de ingredientes">
      <header class="top">
        <div>
          <h2>Biblioteca de ingredientes</h2>
          <p class="sub">{{ libraryItems.length }} ingredientes cadastrados</p>
        </div>
        <button class="close" aria-label="Fechar" @click="$emit('close')">✕</button>
      </header>

      <div class="toolbar">
        <input v-model="search" class="search" type="text" placeholder="Buscar ingrediente..." />
        <select v-model="categoryFilter" class="select">
          <option :value="null">Todas as categorias</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <button class="btn primary" @click="startNew">+ Cadastrar novo</button>
      </div>

      <p v-if="notice" class="notice">{{ notice }}</p>

      <div class="list">
        <p v-if="visible.length === 0" class="empty">Nenhum ingrediente encontrado.</p>

        <div v-for="item in visible" :key="item.id" class="row">
          <span class="thumb">
            <img v-if="item.imagem" :src="item.imagem" :alt="item.nome" loading="lazy" />
            <span v-else aria-hidden="true">🍔</span>
          </span>
          <div class="info">
            <span class="name">{{ item.nome }}</span>
            <span class="meta">
              {{ labelFor(item.categoria) }}
              <em v-if="item.custom" class="tag">meu</em>
            </span>
          </div>
          <button class="btn small" @click="editing = item">Editar</button>
          <button class="btn small danger" @click="remove(item)">Apagar</button>
        </div>
      </div>

      <footer class="bottom">
        <div class="file-actions">
          <button class="btn small" title="Baixa o ingredientes.json com todas as suas mudanças" @click="doDownload">
            ⬇ Baixar ingredientes.json
          </button>
          <button class="btn small" @click="fileInput.click()">⬆ Importar</button>
          <button class="btn small danger" :disabled="!hasLibraryChanges" @click="doReset">
            ↺ Voltar à biblioteca original
          </button>
          <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="doImport" />
        </div>
        <p class="hint">
          Errou algo? Importe o ingredientes.json original de novo ou volte à biblioteca original.
        </p>
      </footer>
    </section>

    <AddIngredientModal v-if="creating || editing" :editing="editing" @close="closeForm" @added="onAdded"
      @saved="say('Ingrediente atualizado.')" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  libraryItems, hasLibraryChanges, deleteIngredient, labelFor,
  downloadLibrary, importLibrary, resetLibrary
} from '../customIngredients.js'
import AddIngredientModal from './AddIngredientModal.vue'

const emit = defineEmits(['close'])

const search = ref('')
const categoryFilter = ref(null)
const creating = ref(false)
const editing = ref(null)
const notice = ref('')
const fileInput = ref(null)
let noticeTimer = null

const say = (text) => {
  notice.value = text
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 5000)
}

const categories = computed(() => {
  const ids = []
  for (const i of libraryItems.value) if (!ids.includes(i.categoria)) ids.push(i.categoria)
  return ids.map(id => ({ id, name: labelFor(id) }))
})

const visible = computed(() => {
  const term = search.value.toLowerCase().trim()
  return libraryItems.value
    .filter(i => categoryFilter.value === null || i.categoria === categoryFilter.value)
    .filter(i => !term || i.nome.toLowerCase().includes(term))
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
})

function startNew() {
  editing.value = null
  creating.value = true
}

function closeForm() {
  creating.value = false
  editing.value = null
}

function onAdded(item) {
  say(`"${item.nome}" cadastrado.`)
}

function remove(item) {
  if (window.confirm(`Apagar "${item.nome}" da biblioteca? Os lanches que já usam esse ingrediente não mudam.`)) {
    deleteIngredient(item.id)
    say(`"${item.nome}" apagado.`)
  }
}

function doDownload() {
  downloadLibrary()
  say('ingredientes.json baixado com as suas mudanças.')
}

async function doImport(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  try {
    const count = await importLibrary(file)
    say(count ? `${count} ingrediente(s) importado(s).` : 'Nenhum ingrediente novo no arquivo.')
  } catch (e) {
    say(e.message)
  }
}

function doReset() {
  if (window.confirm('Desfazer tudo (cadastrados, editados e apagados) e voltar à biblioteca original? Baixe o ingredientes.json antes se quiser guardar.')) {
    resetLibrary()
    say('Biblioteca original restaurada.')
  }
}

const onKey = (e) => {
  // O Esc fecha primeiro o formulário (se aberto); só depois a biblioteca
  if (e.key === 'Escape' && !creating.value && !editing.value) emit('close')
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  font-family: var(--font);
}

.library {
  display: flex;
  flex-direction: column;
  width: 720px;
  max-width: calc(100vw - 32px);
  height: min(720px, calc(100vh - 48px));
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  color: var(--text);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

h2 {
  margin: 0;
  font-size: 1.15rem;
}

.sub {
  margin: 3px 0 0;
  font-size: 0.75rem;
  color: var(--text-faint);
}

.close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
}

.close:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.search,
.select {
  height: 38px;
  padding: 0 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.82rem;
  outline: none;
}

.search {
  flex: 1;
  min-width: 0;
}

.search:focus,
.select:focus {
  border-color: var(--accent);
}

.notice {
  margin: 0 0 10px;
  padding: 7px 10px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 8px;
  font-size: 0.76rem;
}

.list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.list::-webkit-scrollbar {
  width: 6px;
}

.list::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 10px;
}

.empty {
  padding: 40px 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-faint);
}

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  margin-bottom: 6px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.thumb {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 52px;
  height: 40px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.name {
  overflow: hidden;
  font-size: 0.85rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  font-size: 0.7rem;
  color: var(--text-faint);
}

.tag {
  margin-left: 6px;
  padding: 1px 7px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  font-size: 0.6rem;
  font-style: normal;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--accent);
}

.btn {
  padding: 9px 16px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s;
}

.btn:hover:not(:disabled) {
  color: var(--text);
  border-color: var(--border-strong);
}

.btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.btn.small {
  padding: 6px 12px;
  font-size: 0.74rem;
}

.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.btn.primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  color: var(--on-accent);
}

.btn.danger {
  color: #ff6b6b;
}

.btn.danger:hover:not(:disabled) {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.bottom {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.file-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hint {
  margin: 8px 0 0;
  font-size: 0.7rem;
  color: var(--text-faint);
}
</style>
