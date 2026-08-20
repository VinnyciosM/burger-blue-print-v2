<template>
  <aside class="ingredient-sidebar">
    <div class="sidebar-header">
      <div class="title-row">
        <!-- Ícone SVG Placeholder -->
        <span class="icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <h2>INGREDIENTES</h2>
      </div>

      <p>Arraste os ingredientes para a coluna ao lado</p>
    </div>

    <div class="search">
      <input
        v-model="search"
        type="text"
        placeholder="Buscar ingrediente..."
      />
      <span class="search-icon">⌕</span>
    </div>

    <!-- Lista de Categorias -->
    <div class="categories-list">
      <div 
        v-for="category in filteredCategories" 
        :key="category.id" 
        class="category-block"
      >
        <!-- Cabeçalho da Categoria -->
        <div class="category-header">
          <span class="category-icon">
            <!-- Ícone SVG Placeholder - Substitua pelos originais -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#f38b41" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <h3 class="category-title">{{ category.name }}</h3>
        </div>

        <!-- Grid de Ingredientes da Categoria -->
        <div class="ingredient-grid">
          <div
            v-for="ingredient in category.items"
            :key="ingredient.id"
            class="ingredient-card"
            draggable="true"
            @dragstart="onDragStart(ingredient, $event)"
          >
            <div class="ingredient-image">
              <img
                :src="ingredient.image"
                :alt="ingredient.name"
              />
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
import { computed, ref } from 'vue'

const search = ref('')

// Estrutura atualizada dividida em categorias baseada na imagem[cite: 2]
const categories = ref([
  {
    id: 'paes',
    name: 'PÃES',
    items: [
      { id: 1, name: 'Pão Brioche', image: 'https://placehold.co/300x220' },
      { id: 2, name: 'Pão com Gergelim', image: 'https://placehold.co/300x220' },
      { id: 3, name: 'Pão Australiano', image: 'https://placehold.co/300x220' }
    ]
  },
  {
    id: 'carnes',
    name: 'CARNES',
    items: [
      { id: 4, name: 'Carne 180g', image: 'https://placehold.co/300x220' },
      { id: 5, name: 'Carne 150g', image: 'https://placehold.co/300x220' },
      { id: 6, name: 'Frango Crispy', image: 'https://placehold.co/300x220' }
    ]
  },
  {
    id: 'queijos',
    name: 'QUEIJOS',
    items: [
      { id: 7, name: 'Queijo Cheddar', image: 'https://placehold.co/300x220' },
      { id: 8, name: 'Queijo Mussarela', image: 'https://placehold.co/300x220' },
      { id: 9, name: 'Queijo Provolone', image: 'https://placehold.co/300x220' }
    ]
  },
  {
    id: 'acompanhamentos',
    name: 'ACOMPANHAMENTOS',
    items: [
      { id: 10, name: 'Bacon', image: 'https://placehold.co/300x220' },
      { id: 11, name: 'Alface', image: 'https://placehold.co/300x220' },
      { id: 12, name: 'Tomate', image: 'https://placehold.co/300x220' }
    ]
  },
  {
    id: 'molhos',
    name: 'MOLHOS',
    items: [
      { id: 13, name: 'Molho Alasca', image: 'https://placehold.co/300x220' },
      { id: 14, name: 'Molho Barbecue', image: 'https://placehold.co/300x220' },
      { id: 15, name: 'Molho Especial', image: 'https://placehold.co/300x220' }
    ]
  },
  {
    id: 'outros',
    name: 'OUTROS',
    items: [
      { id: 16, name: 'Picles', image: 'https://placehold.co/300x220' },
      { id: 17, name: 'Cebola Roxa', image: 'https://placehold.co/300x220' },
      { id: 18, name: 'Ovo', image: 'https://placehold.co/300x220' }
    ]
  }
])

// Computed property atualizada para filtrar dentro das categorias
const filteredCategories = computed(() => {
  const term = search.value.toLowerCase().trim()

  if (!term) {
    return categories.value
  }

  // Filtra os itens dentro de cada categoria. 
  // Se a categoria ficar vazia após o filtro, ela não é retornada.
  return categories.value.map(category => {
    const filteredItems = category.items.filter(ingredient => 
      ingredient.name.toLowerCase().includes(term)
    )
    return { ...category, items: filteredItems }
  }).filter(category => category.items.length > 0)
})

function onDragStart(ingredient, event) {
  event.dataTransfer.setData(
    'ingredient',
    JSON.stringify(ingredient)
  )

  event.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
/* Main Container */
.ingredient-sidebar {
  width: 100%;
  max-width: 350px;
  height: 100vh;
  box-sizing: border-box;
  padding: 20px;
  background: #101416;
  color: #fff;
  overflow-y: auto;
  font-family: sans-serif;
}

/* Header[cite: 2] */
.sidebar-header {
  margin-bottom: 18px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #f38b41; /* Cor laranja baseada na imagem */
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

/* Search[cite: 2] */
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
  border-color: #f38b41; /* Atualizado para o laranja do tema */
}

.search-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 20px;
}

/* Categorias */
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

/* Grid[cite: 2] */
.ingredient-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

/* Card[cite: 2] */
.ingredient-card {
  min-width: 0;
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

/* Image[cite: 2] */
.ingredient-image {
  width: 100%;
  aspect-ratio: 1.25;
  background: #111518;
  overflow: hidden;
}

.ingredient-image img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

/* Name[cite: 2] */
.ingredient-name {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  box-sizing: border-box;
  color: #e5e5e5;
  font-size: 0.7rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

/* Scrollbar[cite: 2] */
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