<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <section class="library" role="dialog" aria-label="Biblioteca de ingredientes">
      <header class="top">
        <div>
          <h2>Biblioteca de ingredientes</h2>
          <p class="sub">{{ libraryItems.length }} ingredientes cadastrados</p>
        </div>
        <button class="close" aria-label="Fechar" @click="$emit('close')"><Icon name="x" :size="16" /></button>
      </header>

      <div class="toolbar">
        <input v-model="search" class="search" type="text" placeholder="Buscar ingrediente..." />
        <select v-model="categoryFilter" class="select">
          <option :value="null">Todas as categorias</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <p v-if="notice" class="notice">{{ notice }}</p>

      <div class="list">
        <p v-if="groups.length === 0" class="empty">Nenhum ingrediente encontrado.</p>

        <section v-for="group in groups" :key="group.id" class="group">
          <button class="group-head" :aria-expanded="isOpen(group.id)" @click="toggleGroup(group.id)">
            <Icon name="chevron-down" :size="14" class="chevron" :class="{ closed: !isOpen(group.id) }" />
            <span class="group-name">{{ group.name }}</span>
            <span class="group-count">{{ group.items.length }}</span>
          </button>

          <template v-if="isOpen(group.id)">
            <p v-if="group.items.length === 0" class="group-empty">Nenhum ingrediente nesta categoria ainda.</p>
            <div v-for="item in group.items" :key="item.id" class="row">
              <span class="thumb">
                <img v-if="item.imagem" :src="item.imagem" :alt="item.nome" loading="lazy" />
                <Icon v-else name="burger" :size="20" />
              </span>
              <div class="info">
                <span class="name">{{ item.nome }}</span>
                <span v-if="item.custom" class="meta"><em class="tag">meu</em></span>
              </div>
              <button class="btn small" @click="editing = item">Editar</button>
              <button class="btn small danger" @click="remove(item)">Apagar</button>
            </div>
          </template>
        </section>
      </div>

      <footer class="bottom">
        <div class="footer-actions">
          <button class="btn" title="Criar uma categoria nova" @click="addingCategory = true">
            <Icon name="plus" :size="14" /> Nova categoria
          </button>
          <button class="btn primary" @click="startNew"><Icon name="plus" :size="14" /> Cadastrar novo ingrediente</button>
        </div>
      </footer>
    </section>

    <AddIngredientModal v-if="creating || editing" :editing="editing" @close="closeForm" @added="onAdded"
      @saved="say('Ingrediente atualizado.')" />
    <AddCategoryModal v-if="addingCategory" @close="addingCategory = false" @added="onCategoryAdded" />
  </div>
</template>

<script setup>
import Icon from './Icon.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  libraryItems, deleteIngredient, labelFor, allCategoryIds
} from '../customIngredients.js'
import AddIngredientModal from './AddIngredientModal.vue'
import AddCategoryModal from './AddCategoryModal.vue'
import { sortCategoryIds } from '../librarySettings.js'

const emit = defineEmits(['close'])

const search = ref('')
const categoryFilter = ref(null)
const creating = ref(false)
const editing = ref(null)
const notice = ref('')
let noticeTimer = null

const say = (text) => {
  notice.value = text
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 5000)
}

const categories = computed(() => allCategoryIds.value.map(id => ({ id, name: labelFor(id) })))

// Nova categoria
const addingCategory = ref(false)

function onCategoryAdded(id) {
  categoryFilter.value = id
  say(`Categoria "${labelFor(id)}" criada.`)
}

// Ingredientes agrupados por categoria (na mesma ordem da coluna de ingredientes)
const groups = computed(() => {
  const term = search.value.toLowerCase().trim()
  const sorted = libraryItems.value
    .filter(i => !term || i.nome.toLowerCase().includes(term))
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return sortCategoryIds(allCategoryIds.value)
    .filter(id => categoryFilter.value === null || id === categoryFilter.value)
    .map(id => ({ id, name: labelFor(id), items: sorted.filter(i => i.categoria === id) }))
    // categoria vazia só aparece fora da busca (para dar para ver as recém-criadas)
    .filter(g => g.items.length > 0 || !term)
})

// Recolher/expandir (durante a busca tudo fica aberto)
const closed = ref(new Set())
const isOpen = (id) => !!search.value.trim() || !closed.value.has(id)
function toggleGroup(id) {
  if (search.value.trim()) return
  const next = new Set(closed.value)
  next.has(id) ? next.delete(id) : next.add(id)
  closed.value = next
}

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

const onKey = (e) => {
  // O Esc fecha primeiro o formulário (se aberto); só depois a biblioteca
  if (e.key === 'Escape' && !creating.value && !editing.value && !addingCategory.value) emit('close')
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

.group + .group {
  margin-top: 14px;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 6px;
  padding: 6px 2px;
  background: none;
  border: none;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.group-head:hover { color: var(--text); }

.group-name {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.group-count {
  padding: 1px 7px;
  font-size: 0.65rem;
  color: var(--text-faint);
  background: var(--bg);
  border-radius: 999px;
}

.group-empty {
  margin: 8px 2px;
  font-size: 0.75rem;
  color: var(--text-faint);
}

.chevron { transition: transform 0.15s; }
.chevron.closed { transform: rotate(-90deg); }

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

.footer-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

</style>
