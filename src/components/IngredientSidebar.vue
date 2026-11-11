<template>
  <aside class="ingredient-sidebar">
    <p v-if="locked" class="locked-banner" role="status">
      <Icon name="lock" :size="15" />
      <span>Lanche bloqueado. Desbloqueie na lista de lanches para adicionar ingredientes.</span>
    </p>

    <!-- Lanche bloqueado: busca, filtros e lista de ingredientes ficam inutilizáveis (inert) e em preto e branco.
         O cabeçalho (Personalizar) e o botão da Biblioteca não são afetados. -->
    <div class="sidebar-top">
      <div class="sidebar-header">
        <h2>Ingredientes</h2>
        <span class="total">{{ totalItems }} itens</span>
        <button class="lib-btn" title="Personalizar a biblioteca" @click="showCustomize = true">
          <Icon name="settings" :size="14" /> Personalizar
        </button>
      </div>

      <div class="search locked-body" :class="{ 'is-locked': locked }" :inert="locked">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="search" type="text" placeholder="Buscar ingrediente..." />
        <button v-if="search" class="search-clear" @click="search = ''" aria-label="Limpar busca"><Icon name="x" :size="11" stroke="2.5" /></button>
      </div>

      <div class="chips locked-body" :class="{ 'is-locked': locked }" :inert="locked">
        <button class="chip" :class="{ active: activeCategory === null }" @click="activeCategory = null">
          Todos
        </button>
        <button v-for="category in categories" :key="category.id" class="chip"
          :class="{ active: activeCategory === category.id }" @click="activeCategory = category.id">
          {{ category.name }}
        </button>
      </div>
    </div>

    <div class="sidebar-scroll locked-body" :class="{ 'is-locked': locked }" :inert="locked">
      <div v-if="isLoading" class="state-msg">Carregando ingredientes...</div>
      <div v-else-if="filteredCategories.length === 0" class="state-msg">
        Nenhum ingrediente encontrado.
      </div>

      <section v-for="category in filteredCategories" :key="category.id" class="category-block">
        <h3 class="category-title" :class="{ collapsible: canCollapse }">
          <button v-if="canCollapse" class="category-toggle" :aria-expanded="!isCollapsed(category.id)"
            @click="toggleCategory(category.id)">
            <Icon name="chevron-down" :size="13" class="chevron" :class="{ closed: isCollapsed(category.id) }" />
            {{ category.name }}
          </button>
          <template v-else>{{ category.name }}</template>
          <span v-if="librarySettings.showCount" class="category-count">{{ category.items.length }}</span>
        </h3>

        <div v-show="!canCollapse || !isCollapsed(category.id)" class="ingredient-grid"
          :class="`view-${librarySettings.view}`">
          <button v-for="ingredient in category.items" :key="ingredient.id" class="ingredient-card" draggable="true"
            :title="`Adicionar ${ingredient.name}`" @dragstart="onDragStart(ingredient, $event)"
            @click="$emit('add-ingredient', ingredient)">
            <span class="ingredient-image">
              <img v-if="ingredient.image" :src="ingredient.image" :alt="ingredient.name" loading="lazy" />
              <span v-else class="no-image"><Icon name="burger" :size="28" /></span>
              <span class="add-badge">+</span>
              <span v-if="ingredient.custom" class="mine-badge" title="Ingrediente seu">meu</span>
            </span>
            <span class="ingredient-name">{{ ingredient.name }}</span>
          </button>
        </div>
      </section>
    </div>

    <div class="sidebar-bottom">
      <button class="lib-btn full" title="Ver, editar e apagar todos os ingredientes" @click="showLibrary = true">
        <Icon name="book" :size="14" /> Biblioteca de ingredientes
      </button>
    </div>

    <LibraryModal v-if="showLibrary" @close="showLibrary = false" />
    <CustomizeModal v-if="showCustomize" @close="showCustomize = false" />
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import { libraryItems, labelFor } from '../customIngredients.js'
import LibraryModal from './LibraryModal.vue'
import CustomizeModal from './CustomizeModal.vue'
import { librarySettings, sortCategoryIds } from '../librarySettings.js'
import Icon from './Icon.vue'

defineProps({
  // Lanche atual bloqueado: não dá para adicionar ingredientes
  locked: { type: Boolean, default: false }
})

const emit = defineEmits(['add-ingredient'])
const search = ref('')
const activeCategory = ref(null)
const showLibrary = ref(false)
const showCustomize = ref(false)
const isLoading = ref(false)

// Biblioteca (arquivo + edições + cadastrados) agrupada por categoria
const categories = computed(() => {
  const groups = []
  for (const item of libraryItems.value) {
    let group = groups.find(c => c.id === item.categoria)
    if (!group) {
      group = { id: item.categoria, name: labelFor(item.categoria), items: [] }
      groups.push(group)
    }
    group.items.push({ id: item.id, name: item.nome, slug: item.slug, image: item.imagem, custom: item.custom })
  }
  const order = sortCategoryIds(groups.map(g => g.id))
  return order.map(id => groups.find(g => g.id === id))
})

// Recolher/expandir categorias (só vale quando a opção está ligada; durante a busca tudo fica aberto)
const collapsed = ref(new Set())
const canCollapse = computed(() => librarySettings.collapsible && !search.value.trim())
const isCollapsed = (id) => collapsed.value.has(id)
function toggleCategory(id) {
  const next = new Set(collapsed.value)
  next.has(id) ? next.delete(id) : next.add(id)
  collapsed.value = next
}

const totalItems = computed(() => categories.value.reduce((sum, c) => sum + c.items.length, 0))

// Filtro de busca + categoria
const filteredCategories = computed(() => {
  const term = search.value.toLowerCase().trim()

  return categories.value
    .filter(category => activeCategory.value === null || category.id === activeCategory.value)
    .map(category => ({
      ...category,
      items: term ? category.items.filter(i => i.name.toLowerCase().includes(term)) : category.items
    }))
    .filter(category => category.items.length > 0)
})

function onDragStart(ingredient, event) {
  event.dataTransfer.setData('ingredient', JSON.stringify(ingredient))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
.ingredient-sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-panel);
  overflow: hidden;
  color: var(--text);
  font-family: var(--font);
}

.sidebar-top {
  flex-shrink: 0;
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, var(--surface-2), var(--surface));
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.total {
  margin-right: auto;
  padding: 2px 8px;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg);
  border-radius: 999px;
}

.lib-btn {
  padding: 7px 13px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.lib-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.lib-btn.full {
  width: 100%;
  padding: 10px 13px;
  border-radius: 12px;
}

.sidebar-bottom {
  flex-shrink: 0;
  padding: 12px 18px;
  border-top: 1px solid var(--border);
}

.mine-badge {
  position: absolute;
  left: 5px;
  top: 5px;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.55rem;
  font-weight: 800;
  text-transform: uppercase;
}

.search {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-faint);
}

.search input {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  padding: 0 34px 0 38px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.15s;
}

.search input::placeholder {
  color: var(--text-faint);
}

.search input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: var(--border);
  color: var(--text-muted);
  font-size: 0.65rem;
  cursor: pointer;
}

.chips {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.chip {
  flex-shrink: 0;
  padding: 5px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.chip:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.sidebar-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 18px 24px;
}

.state-msg {
  text-align: center;
  color: var(--text-faint);
  padding: 40px 0;
  font-size: 0.82rem;
}

.category-block + .category-block {
  margin-top: 22px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.category-count {
  padding: 1px 7px;
  font-size: 0.65rem;
  color: var(--text-faint);
  background: var(--bg);
  border-radius: 999px;
}

.ingredient-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.category-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
}

.category-toggle:hover { color: var(--text); }
.chevron { transition: transform 0.15s; }
.chevron.closed { transform: rotate(-90deg); }

/* Estilos de exibição: lista e lista compacta */
.ingredient-grid.view-list,
.ingredient-grid.view-compact {
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
}

.view-list .ingredient-card,
.view-compact .ingredient-card {
  flex-direction: row;
  align-items: center;
}

.view-list .ingredient-image { width: 64px; flex-shrink: 0; }
.view-compact .ingredient-image { width: 40px; flex-shrink: 0; }

.view-list .ingredient-name,
.view-compact .ingredient-name {
  flex: 1;
  justify-content: flex-start;
  padding: 4px 12px;
  text-align: left;
  font-size: 0.78rem;
}

.view-compact .ingredient-name { min-height: 0; font-size: 0.72rem; }
.view-compact .add-badge { display: none; }
.view-list .add-badge { width: 16px; height: 16px; top: 3px; right: 3px; font-size: 0.75rem; }

.ingredient-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  cursor: grab;
  font-family: inherit;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}

.ingredient-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.3), 0 0 0 3px var(--accent-soft);
}

.ingredient-card:active {
  cursor: grabbing;
  transform: scale(0.97);
}

.ingredient-image {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 3;
  background: #ffffff;
}

.ingredient-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-image {
  font-size: 1.6rem;
  opacity: 0.5;
}

.add-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 0.15s, transform 0.15s;
}

.ingredient-card:hover .add-badge {
  opacity: 1;
  transform: scale(1);
}

.ingredient-name {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 4px 6px;
  box-sizing: border-box;
  color: var(--text);
  font-size: 0.66rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.15;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 6px;
}

.sidebar-scroll::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 10px;
}
</style>
