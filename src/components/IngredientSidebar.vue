<template>
  <aside class="ingredient-sidebar">
    <div class="sidebar-top">
      <div class="sidebar-header">
        <h2>Ingredientes</h2>
        <span class="total">{{ totalItems }} itens</span>
        <button class="lib-btn" title="Ver, editar e apagar todos os ingredientes" @click="showLibrary = true">
          📚 Biblioteca
        </button>
      </div>

      <div class="search">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="search" type="text" placeholder="Buscar ingrediente..." />
        <button v-if="search" class="search-clear" @click="search = ''" aria-label="Limpar busca">✕</button>
      </div>

      <div class="chips">
        <button class="chip" :class="{ active: activeCategory === null }" @click="activeCategory = null">
          Todos
        </button>
        <button v-for="category in categories" :key="category.id" class="chip"
          :class="{ active: activeCategory === category.id }" @click="activeCategory = category.id">
          {{ category.name }}
        </button>
      </div>
    </div>

    <div class="sidebar-scroll">
      <div v-if="isLoading" class="state-msg">Carregando ingredientes...</div>
      <div v-else-if="filteredCategories.length === 0" class="state-msg">
        Nenhum ingrediente encontrado.
      </div>

      <section v-for="category in filteredCategories" :key="category.id" class="category-block">
        <h3 class="category-title">
          {{ category.name }}
          <span class="category-count">{{ category.items.length }}</span>
        </h3>

        <div class="ingredient-grid">
          <button v-for="ingredient in category.items" :key="ingredient.id" class="ingredient-card" draggable="true"
            :title="`Adicionar ${ingredient.name}`" @dragstart="onDragStart(ingredient, $event)"
            @click="$emit('add-ingredient', ingredient)">
            <span class="ingredient-image">
              <img v-if="ingredient.image" :src="ingredient.image" :alt="ingredient.name" loading="lazy" />
              <span v-else class="no-image">🍔</span>
              <span class="add-badge">+</span>
              <span v-if="ingredient.custom" class="mine-badge" title="Ingrediente seu">meu</span>
            </span>
            <span class="ingredient-name">{{ ingredient.name }}</span>
          </button>
        </div>
      </section>
    </div>

    <LibraryModal v-if="showLibrary" @close="showLibrary = false" />
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import { libraryItems, labelFor } from '../customIngredients.js'
import LibraryModal from './LibraryModal.vue'

const emit = defineEmits(['add-ingredient'])
const search = ref('')
const activeCategory = ref(null)
const showLibrary = ref(false)
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
  return groups
})

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
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--surface);
  border-right: 1px solid var(--border);
  color: var(--text);
  font-family: var(--font);
}

.sidebar-top {
  flex-shrink: 0;
  padding: 18px 18px 12px;
  border-bottom: 1px solid var(--border);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

.total {
  margin-right: auto;
  font-size: 0.72rem;
  color: var(--text-faint);
}

.lib-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
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
  height: 38px;
  box-sizing: border-box;
  padding: 0 34px 0 36px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
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
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
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

.ingredient-card {
  display: flex;
  flex-direction: column;
  padding: 0;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  cursor: grab;
  font-family: inherit;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}

.ingredient-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
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
