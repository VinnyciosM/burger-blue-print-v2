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
      <button v-if="search" class="search-clear" aria-label="Limpar busca" @click="search = ''"><Icon name="x" :size="11" stroke="2.5" /></button>
    </div>

    <div class="items">
      <VueDraggable v-model="localSnacks" filter="button" :prevent-on-filter="false" ghost-class="ghost" :animation="200"
        :disabled="!!search.trim()">
        <div v-for="snack in visibleSnacks" :key="snack.id" class="item"
          :class="{ active: snack.id === activeSnackId, 'is-hidden': snack.hidden }" @click="$emit('select-snack', snack.id)">
          <span class="index">{{ String(indexOf(snack) + 1).padStart(2, '0') }}</span>

          <div class="info">
            <span class="name">{{ snack.name || 'Sem nome' }}</span>
            <span class="meta" :class="{ empty: !snack.ingredients.length }">
              {{ snack.ingredients.length
                ? `${snack.ingredients.length} ${snack.ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}`
                : 'Sem ingredientes' }}
            </span>
          </div>

          <div class="actions">
            <template v-if="showLayerControls">
              <button class="action-btn" :class="{ on: snack.hidden }"
                :title="snack.hidden ? 'Mostrar no canvas' : 'Ocultar no canvas'"
                @click.stop="$emit('toggle-flag', snack.id, 'hidden')"><Icon :name="snack.hidden ? 'eye-off' : 'eye'" :size="15" /></button>
              <button class="action-btn" :class="{ on: snack.locked }"
                :title="snack.locked ? 'Desbloquear posição e tamanho' : 'Bloquear posição e tamanho'"
                @click.stop="$emit('toggle-flag', snack.id, 'locked')"><Icon :name="snack.locked ? 'lock' : 'unlock'" :size="15" /></button>
            </template>
            <button class="action-btn" title="Duplicar lanche" @click.stop="$emit('duplicate-snack', snack.id)"><Icon name="copy" :size="15" /></button>
            <button class="action-btn danger" title="Excluir lanche" @click.stop="$emit('delete-snack', snack.id)"><Icon name="x" :size="15" /></button>
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
import Icon from './Icon.vue'

const props = defineProps({
  snacks: { type: Array, required: true },
  activeSnackId: { type: Number, default: null },
  showLayerControls: { type: Boolean, default: false }
})

const emit = defineEmits(['update:snacks', 'select-snack', 'add-snack', 'duplicate-snack', 'delete-snack', 'toggle-flag'])

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
  padding: 10px 4px 0 10px;
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
  position: relative;
  padding: 10px 8px 10px 16px;
  cursor: grab;
  margin-bottom: 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}

.item:hover {
  border-color: var(--border-strong);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.item.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.ghost {
  opacity: 0.4;
}

.index {
  position: absolute;
  top: -8px;
  left: -8px;
  z-index: 1;
  min-width: 24px;
  padding: 2px 6px;
  text-align: center;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--on-accent);
  background: linear-gradient(160deg, var(--accent), var(--accent-hover));
  border-radius: 8px;
  pointer-events: none;
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
  display: flex;
  align-items: center;
  font-size: 0.66rem;
  color: var(--text-faint);
}

.meta.empty {
  color: #d9a441;
}

.actions {
  display: flex;
  gap: 2px;
}

.action-btn {
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
}

.item:hover .action-btn,
.item.active .action-btn,
.action-btn.on {
  opacity: 1;
}

.item.is-hidden .info {
  opacity: 0.45;
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
