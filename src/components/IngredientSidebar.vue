<template>
  <aside class="ingredient-sidebar">
    <div class="sidebar-header">
      <div class="title-row">
        <span class="icon">🥘</span>
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

    <div class="ingredient-grid">
      <div
        v-for="ingredient in filteredIngredients"
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
    
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'

const search = ref('')

const ingredients = ref([
  {
    id: 1,
    name: 'Pão Brioche',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 2,
    name: 'Carne 180g',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 3,
    name: 'Queijo Cheddar',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 4,
    name: 'Queijo Mussarela',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 5,
    name: 'Bacon',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 6,
    name: 'Alface',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 7,
    name: 'Tomate',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 8,
    name: 'Cebola Roxa',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 9,
    name: 'Molho Alasca',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 10,
    name: 'Picles',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 11,
    name: 'Ovo',
    image: 'https://placehold.co/300x220'
  },
  {
    id: 12,
    name: 'Molho Barbecue',
    image: 'https://placehold.co/300x220'
  }
])

const filteredIngredients = computed(() => {
  const term = search.value.toLowerCase().trim()

  if (!term) {
    return ingredients.value
  }

  return ingredients.value.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(term)
  )
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
.ingredient-sidebar {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;

  background: #101416;
  color: #fff;
  overflow-y: auto;
}

/* Header */

.sidebar-header {
  margin-bottom: 18px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-row .icon {
  font-size: 20px;
}

.title-row h2 {
  margin: 0;

  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.sidebar-header p {
  margin: 8px 0 0;

  color: #92989c;
  font-size: 12px;
}

/* Search */

.search {
  position: relative;
  margin-bottom: 18px;
}

.search input {
  width: 100%;
  height: 42px;

  box-sizing: border-box;
  padding: 0 42px 0 14px;

  background: #151a1d;

  color: #fff;
  outline: none;

  font-size: 13px;
}

.search input::placeholder {
  color: #777e82;
}

.search input:focus {
  border-color: #b88314;
}

.search-icon {
  position: absolute;
  right: 14px;
  top: 50%;

  transform: translateY(-50%);

  color: #aaa;
  font-size: 24px;
}

/* Grid */

.ingredient-grid {
  display: grid;

  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 10px;
}

/* Card */

.ingredient-card {
  min-width: 0;

  background: #151a1d;

  overflow: hidden;

  cursor: grab;

  transition:
    border-color 0.15s ease,
    transform 0.15s ease,
    background 0.15s ease;
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

/* Image */

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

/* Name */

.ingredient-name {
  min-height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 7px;

  box-sizing: border-box;

  border-top: 1px solid #2b3033;

  color: #e5e5e5;

  font-size: 12px;
  font-weight: 500;

  text-align: center;

  line-height: 1.2;
}

/* Scrollbar */

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

.ingredient-sidebar {
  width: 350px;
  height: 100%;
  box-sizing: border-box;

  padding: 20px;

  background: #101416;


  color: #fff;
  overflow-y: auto;
}

.layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

.ingredient-sidebar {
  flex: 0 0 500px;
}

.ingredient-sidebar {
  width: 100%;
  max-width: 350px;
  height: 100vh;

  box-sizing: border-box;
  padding: 20px;

  background: #101416;
  color: #fff;

  overflow-y: auto;
}

</style>