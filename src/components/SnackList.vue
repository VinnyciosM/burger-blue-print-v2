<template>
  <section class="snack-list">
    <header class="list-header">
      <div>
        <h3 class="list-title">Lanches</h3>
        <p class="list-subtitle">{{ snacks.length }} no manual · arraste para reordenar</p>
      </div>
      <button class="icon-btn" :class="{ active: isSortVisible }" title="Ordenar automaticamente"
        @click="isSortVisible = !isSortVisible">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18M6 12h12M10 18h4" />
        </svg>
      </button>
    </header>

    <div v-if="isSortVisible" class="sort-card">
      <div class="sort-controls">
        <select v-model="sortBy" class="select">
          <option value="name">Nome</option>
          <option value="id">Criação</option>
        </select>
        <select v-model="sortDirection" class="select">
          <option value="asc">{{ sortBy === 'name' ? 'A → Z' : 'Mais antigo primeiro' }}</option>
          <option value="desc">{{ sortBy === 'name' ? 'Z → A' : 'Mais novo primeiro' }}</option>
        </select>
        <button class="btn-small primary" @click="applySort">Ordenar</button>
      </div>
      <div class="sort-footer">
        <span>Reescreve a ordem atual do manual.</span>
        <button v-if="previousOrder" class="link-btn" @click="restoreOrder">Restaurar anterior</button>
      </div>
    </div>

    <div v-if="snacks.length > 5" class="search">
      <input v-model="search" type="text" placeholder="Buscar lanche..." />
      <button v-if="search" class="search-clear" aria-label="Limpar busca" @click="search = ''">✕</button>
    </div>

    <div class="items">
      <VueDraggable v-model="localSnacks" handle=".drag-handle" ghost-class="ghost" :animation="200"
        :disabled="!!search.trim()">
        <div v-for="snack in visibleSnacks" :key="snack.id" class="item"
          :class="{ active: snack.id === activeSnackId }" @click="$emit('select-snack', snack.id)">
          <span class="drag-handle" title="Segure para arrastar" @click.stop>⋮⋮</span>

          <span class="index">{{ String(indexOf(snack) + 1).padStart(2, '0') }}</span>

          <div class="info">
            <span class="name">{{ snack.name || 'Sem nome' }}</span>
            <span class="meta" :class="{ empty: !snack.ingredients.length }">
              {{ snack.ingredients.length
                ? `${snack.ingredients.length} ${snack.ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}`
                : 'Sem ingredientes' }}
            </span>
          </div>

          <div class="thumbs" aria-hidden="true">
            <template v-for="ing in snack.ingredients.slice(0, 3)" :key="ing.id">
              <img v-if="ing.image" :src="ing.image" alt="" />
            </template>
          </div>

          <div class="actions">
            <button class="action-btn" title="Duplicar lanche" @click.stop="$emit('duplicate-snack', snack.id)">⧉</button>
            <button class="action-btn danger" title="Excluir lanche" @click.stop="$emit('delete-snack', snack.id)">✕</button>
          </div>
        </div>
      </VueDraggable>

      <p v-if="search && visibleSnacks.length === 0" class="no-results">Nenhum lanche encontrado.</p>
    </div>

    <button class="add-btn" @click="$emit('add-snack')">+ Adicionar lanche</button>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

const props = defineProps({
  snacks: { type: Array, required: true },
  activeSnackId: { type: Number, default: null }
})

const emit = defineEmits(['update:snacks', 'select-snack', 'add-snack', 'duplicate-snack', 'delete-snack'])

const localSnacks = computed({
  get: () => props.snacks,
  set: (val) => emit('update:snacks', val)
})

const search = ref('')

const visibleSnacks = computed(() => {
  const term = search.value.toLowerCase().trim()
  if (!term) return props.snacks
  return props.snacks.filter(s => (s.name || '').toLowerCase().includes(term))
})

const indexOf = (snack) => props.snacks.indexOf(snack)

// --- Ordenação automática (com opção de restaurar a ordem anterior) ---
const isSortVisible = ref(false)
const sortBy = ref('name')
const sortDirection = ref('asc')
const previousOrder = ref(null)

const applySort = () => {
  previousOrder.value = props.snacks.map(s => s.id)
  const dir = sortDirection.value === 'asc' ? 1 : -1
  const sorted = [...props.snacks].sort((a, b) =>
    sortBy.value === 'name'
      ? dir * (a.name || '').localeCompare(b.name || '', 'pt-BR')
      : dir * ((a.id || 0) - (b.id || 0))
  )
  emit('update:snacks', sorted)
}

const restoreOrder = () => {
  if (!previousOrder.value) return
  const order = previousOrder.value
  // Lanches criados depois da ordenação vão para o final
  const position = (s) => (order.includes(s.id) ? order.indexOf(s.id) : order.length)
  emit('update:snacks', [...props.snacks].sort((a, b) => position(a) - position(b)))
  previousOrder.value = null
}
</script>

<style scoped>
.snack-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  flex: 1;
  font-family: var(--font);
  color: var(--text);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.list-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

.list-subtitle {
  margin: 3px 0 0;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.icon-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.icon-btn:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.icon-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.sort-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.sort-controls {
  display: flex;
  gap: 6px;
}

.select {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 0.75rem;
  outline: none;
}

.btn-small {
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-small.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.sort-footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.68rem;
  color: var(--text-faint);
}

.link-btn {
  padding: 0;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.68rem;
  font-weight: 700;
  cursor: pointer;
}

.search {
  position: relative;
}

.search input {
  width: 100%;
  height: 34px;
  padding: 0 30px 0 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.8rem;
  outline: none;
}

.search input:focus {
  border-color: var(--accent);
}

.search-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: var(--border);
  color: var(--text-muted);
  font-size: 0.6rem;
  cursor: pointer;
}

.items {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.items::-webkit-scrollbar {
  width: 6px;
}

.items::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 10px;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 6px 8px 4px;
  margin-bottom: 6px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.item:hover {
  border-color: var(--border-strong);
}

.item.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.ghost {
  opacity: 0.4;
}

.drag-handle {
  padding: 4px 2px;
  color: var(--text-faint);
  font-size: 0.8rem;
  letter-spacing: -2px;
  cursor: grab;
  user-select: none;
}

.index {
  min-width: 22px;
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--accent);
}

.info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.name {
  overflow: hidden;
  font-size: 0.8rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  font-size: 0.66rem;
  color: var(--text-faint);
}

.meta.empty {
  color: #d9a441;
}

.thumbs {
  display: flex;
}

.thumbs img {
  width: 22px;
  height: 22px;
  margin-left: -6px;
  object-fit: contain;
  background: #fff;
  border: 1px solid var(--bg);
  border-radius: 50%;
}

.actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s;
}

.item:hover .actions,
.item.active .actions {
  opacity: 1;
}

.action-btn {
  width: 26px;
  height: 26px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
}

.action-btn:hover {
  background: var(--border);
  color: var(--text);
}

.action-btn.danger:hover {
  background: rgba(204, 51, 51, 0.2);
  color: #ff6b6b;
}

.no-results {
  padding: 20px 0;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-faint);
}

.add-btn {
  flex-shrink: 0;
  padding: 10px;
  background: transparent;
  border: 1px dashed var(--border-strong);
  border-radius: 10px;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.add-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
