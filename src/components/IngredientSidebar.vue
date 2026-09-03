<template>
  <aside class="ingredient-sidebar">
    <div class="sidebar-header">
      <div class="title-row">
        <span class="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <h2>INGREDIENTES</h2>
      </div>
      <p>Clique ou arraste para a coluna ao lado</p>
    </div>

    <div class="search">
      <input v-model="search" type="text" placeholder="Buscar ingrediente..." />
    </div>

    <!-- Estado de Carregamento -->
    <div v-if="isLoading" class="loading-state">
      <p>Carregando ingredientes...</p>
    </div>

    <!-- Lista de Categorias Dinâmica -->
    <div v-else class="categories-list">
      <div v-for="category in filteredCategories" :key="category.id" class="category-block">
        <div class="category-header">
          <span class="category-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#f38b41" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <h3 class="category-title">{{ category.name }}</h3>
        </div>

        <div class="ingredient-grid">
          <div v-for="ingredient in category.items" :key="ingredient.id" class="ingredient-card" draggable="true"
            @dragstart="onDragStart(ingredient, $event)" @click="$emit('add-ingredient', ingredient)">
            <div class="ingredient-image">
              <img :src="ingredient.image" :alt="ingredient.name" />
            </div>
            <div class="ingredient-name">
              {{ ingredient.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
// Importa o arquivo JSON diretamente (o Vite faz o parse automático!)
import flatData from '../ingredientes.json'

const emit = defineEmits(['add-ingredient'])
const search = ref('')

// Estados Reativos
const categories = ref([])
const isLoading = ref(true)

onMounted(() => {
  try {
    // Como importamos direto, não precisamos de fetch ou await.
    // O flatData já é o array de ingredientes prontinho.

    // Agrupa a lista plana em Categorias
    const groupedData = flatData.reduce((acc, curr) => {
      let category = acc.find(c => c.id === curr.categoria)

      if (!category) {
        category = {
          id: curr.categoria,
          name: curr.categoria.toUpperCase(),
          items: []
        }
        acc.push(category)
      }

      category.items.push({
        id: curr.id,
        name: curr.nome,
        image: curr.url
      })

      return acc
    }, [])

    categories.value = groupedData
  } catch (error) {
    console.error('Erro ao processar ingredientes:', error)
  } finally {
    isLoading.value = false
  }
})

// Filtro de busca
const filteredCategories = computed(() => {
  const term = search.value.toLowerCase().trim()
  if (!term) return categories.value

  return categories.value.map(category => {
    const filteredItems = category.items.filter(ingredient =>
      ingredient.name.toLowerCase().includes(term)
    )
    return { ...category, items: filteredItems }
  }).filter(category => category.items.length > 0)
})

function onDragStart(ingredient, event) {
  event.dataTransfer.setData('ingredient', JSON.stringify(ingredient))
  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
.loading-state {
  text-align: center;
  color: #888;
  padding: 40px 0;
  font-size: 0.85rem;
  font-style: italic;
}

.ingredient-sidebar {
  box-sizing: border-box;
  padding: 20px;
  background: #101416;
  color: #fff;
  overflow-y: auto;
  font-family: sans-serif;
}

.sidebar-header {
  margin-bottom: 18px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f38b41;
}

.title-row .icon {
  display: flex;
  align-items: center;
}

.title-row h2 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.sidebar-header p {
  margin: 8px 0 0;
  color: #92989c;
  font-size: 12px;
}

.search {
  position: relative;
  margin-bottom: 24px;
}

.search input {
  width: 100%;
  height: 42px;
  box-sizing: border-box;
  padding: 0 42px 0 14px;
  background: #151a1d;
  border: 1px solid #2b3033;
  border-radius: 6px;
  color: #fff;
  outline: none;
  font-size: 13px;
  transition: border-color 0.2s;
}

.search input::placeholder {
  color: #777e82;
}

.search input:focus {
  border-color: #f38b41;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-icon {
  display: flex;
  align-items: center;
}

.category-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: #e5e5e5;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ingredient-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ingredient-card {
  width: 170px;
  height: 100px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #151a1d;
  border: 1px solid #2b3033;
  border-radius: 6px;
  overflow: hidden;
  cursor: grab;
  transition: border-color 0.15s ease, transform 0.15s ease, background 0.15s ease;
}

.ingredient-card:hover {
  background: #1b2023;
  border-color: #555c60;
  transform: translateY(-1px);
}

.ingredient-card:active {
  cursor: grabbing;
  transform: scale(0.98);
}

.ingredient-image {
  width: 100%;
  flex-grow: 1; 
  background: #ffffff; /* Fundo branco para mesclar com a imagem sem deixar faixas */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ingredient-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain; /* Garante que não corte a imagem */
  padding: 0; /* Removido para encostar na borda */
}

.ingredient-name {
  height: 32px; 
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  box-sizing: border-box;
  color: #e5e5e5;
  font-size: 0.7rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; 
}

.ingredient-sidebar::-webkit-scrollbar {
  width: 6px;
}

.ingredient-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.ingredient-sidebar::-webkit-scrollbar-thumb {
  background: #353b3e;
  border-radius: 10px;
}
</style>