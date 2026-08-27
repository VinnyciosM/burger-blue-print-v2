<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import LoginScreen from './components/LoginScreen.vue';
import IngredientSidebar from './components/IngredientSidebar.vue';
import ProductEditor from './components/ProductEditor.vue';
import GuideManager from './components/GuideManager.vue';
import PrintCanvas from './components/PrintCanvas.vue';
import PrintSettingsSidebar from './components/PrintSettingsSidebar.vue';
import TopNavBar from './components/TopNavBar.vue';

// --- ESTADO DE NAVEGAÇÃO ---
const isAuthenticated = ref(false)
const isPrintMode = ref(false)

// --- ESTADO GLOBAL (FONTE DA VERDADE) ---
const snacks = ref([])
const activeSnackId = ref(null)

// --- CONFIGURAÇÕES DE IMPRESSÃO ---
const printSettings = ref({
  paper: 'a4',
  orientation: 'landscape',
  itemsPerPage: 4,
  margins: { top: 10, bottom: 10, left: 10, right: 10 },
  spacing: 8,
  showCutLines: true
})

const updatePrintSettings = (newSettings) => {
  printSettings.value = newSettings
}

// --- LOCAL STORAGE & INICIALIZAÇÃO ---
onMounted(() => {
  // Verifica se o usuário já estava logado
  const savedAuth = localStorage.getItem('keeta_auth')
  if (savedAuth === 'true') {
    isAuthenticated.value = true
  }

  const savedSnacks = localStorage.getItem('keeta_snacks')
  const savedActiveId = localStorage.getItem('keeta_active_id')

  if (savedSnacks) {
    snacks.value = JSON.parse(savedSnacks)
    activeSnackId.value = savedActiveId ? parseInt(savedActiveId) : (snacks.value[0]?.id || null)
  }

  if (snacks.value.length === 0) {
    createNewSnack()
  }
})

// Função acionada pelo LoginScreen
const handleLoginSuccess = () => {
  isAuthenticated.value = true
  localStorage.setItem('keeta_auth', 'true') // Salva o login no cache
}

watch(snacks, (newVal) => {
  localStorage.setItem('keeta_snacks', JSON.stringify(newVal))
}, { deep: true })

watch(activeSnackId, (newVal) => {
  if (newVal !== null) {
    localStorage.setItem('keeta_active_id', newVal.toString())
  }
})

// --- COMPUTED PROPERTIES ---
const currentSnack = computed(() => {
  return snacks.value.find(s => s.id === activeSnackId.value)
})

const currentSnackIndex = computed(() => {
  return snacks.value.findIndex(s => s.id === activeSnackId.value)
})

// --- AÇÕES DO GERENCIADOR ---
const createNewSnack = () => {
  const newId = Date.now()
  snacks.value.push({
    id: newId,
    name: `Novo Lanche`,
    ingredients: []
  })
  activeSnackId.value = newId
}

const selectSnack = (id) => {
  activeSnackId.value = id
}

const deleteSnack = (index) => {
  const deletedId = snacks.value[index].id
  snacks.value.splice(index, 1)

  if (snacks.value.length === 0) {
    createNewSnack()
  } else if (activeSnackId.value === deletedId) {
    activeSnackId.value = snacks.value[0].id
  }
}

// --- AÇÕES DE INGREDIENTES ---
const handleAddIngredient = (ingredient) => {
  if (currentSnack.value) {
    currentSnack.value.ingredients.push({
      id: Date.now(),
      name: ingredient.name,
      obs: '',
      image: ingredient.image
    })
  }
}
</script>

<template>

 <!--  <div>
    <LoginScreen />
  </div> -->

  <div v-if="!isPrintMode" class="app-container">
    <IngredientSidebar class="ingredient-sidebar" @add-ingredient="handleAddIngredient" />

    <ProductEditor v-if="currentSnack" class="product-editor" :snack="currentSnack" :snackIndex="currentSnackIndex" />

    <GuideManager class="guide-manager" v-model:snacks="snacks" :activeSnackId="activeSnackId"
      @open-print-mode="isPrintMode = true" @add-snack="createNewSnack" @select-snack="selectSnack"
      @delete-snack="deleteSnack" />
  </div>

  <div v-else class="print-container">
    <PrintCanvas :snacks="snacks" :settings="printSettings" />
    <PrintSettingsSidebar @back-to-edit="isPrintMode = false" @update-settings="updatePrintSettings" />
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #121212;
  color: #fff;
}

.app-container {
  display: flex;
  height: 100vh;
}

.print-container {
  display: flex;
  height: 100vh;
}

.ingredient-sidebar {
  width: 100%;
  max-width: 500px;
  min-width: 320px;
  flex-shrink: 1;
}

.product-editor {
  flex: 1;
}

.guide-manager {
  flex-shrink: 0;
}
</style>