<template>
  <!-- <LoginScreen v-if="!isAuthenticated" @login-success="handleLoginSuccess" /> -->

  <div v-if="!isPrintMode" class="app-container">
    <IngredientSidebar class="ingredient-sidebar" @add-ingredient="handleAddIngredient" />
    
    <ProductEditor v-if="currentSnack" class="product-editor" :snack="currentSnack" :snackIndex="currentSnackIndex" />
    
    <GuideManager class="guide-manager" v-model:snacks="snacks" :activeSnackId="activeSnackId"
      @open-print-mode="isPrintMode = true" @add-snack="createNewSnack" @select-snack="selectSnack"
      @delete-snack="deleteSnack" />
  </div>

  <div v-else class="print-container">
    
    <!-- O Canvas agora tem espaço de sobra na esquerda/centro -->
    <PrintCanvas :snacks="snacks" :settings="printSettings" class="print-canvas-area" />

    <!-- NOVA COLUNA UNIFICADA (Direita) -->
    <aside class="unified-sidebar">
      
      <!-- Cabeçalho Fixo: Botão de Voltar -->
      <div class="sidebar-global-header">
        <button @click="isPrintMode = false" class="btn-back-global">
          ← Voltar para edição
        </button>
      </div>

      <!-- Abas de Navegação -->
      <div class="sidebar-tabs">
        <button 
          @click="printTab = 'settings'" 
          class="tab-btn" 
          :class="{ active: printTab === 'settings' }"
        >
          ⚙️ Configurações
        </button>
        <button 
          @click="printTab = 'order'" 
          class="tab-btn" 
          :class="{ active: printTab === 'order' }"
        >
          📚 Ordem
        </button>
      </div>

      <!-- Área de Conteúdo (Alterna os componentes) -->
      <div class="sidebar-content">
        <PrintSettingsSidebar 
          v-if="printTab === 'settings'" 
          @back-to-edit="isPrintMode = false" 
          @update-settings="updatePrintSettings" 
          class="inner-sidebar"
        />

        <PrintOrderSidebar 
          v-else
          v-model:snacks="snacks" 
          :settings="printSettings" 
          @delete-snack="deleteSnack"
          @add-snack="createNewSnack" 
          class="inner-sidebar"
        />
      </div>

    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import LoginScreen from './components/LoginScreen.vue';
import IngredientSidebar from './components/IngredientSidebar.vue';
import ProductEditor from './components/ProductEditor.vue';
import GuideManager from './components/GuideManager.vue';
import PrintCanvas from './components/PrintCanvas.vue';
import PrintSettingsSidebar from './components/PrintSettingsSidebar.vue';
// import TopNavBar from './components/TopNavBar.vue';
import PrintOrderSidebar from './components/PrintOrderSidebar.vue';

const isAuthenticated = ref(false)
const isPrintMode = ref(false)

// NOVO: Estado que controla qual aba da impressão está aberta
const printTab = ref('settings') // Começa nas configurações

const snacks = ref([])
const activeSnackId = ref(null)

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

onMounted(() => {
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

const handleLoginSuccess = () => {
  isAuthenticated.value = true
  localStorage.setItem('keeta_auth', 'true')
}

watch(snacks, (newVal) => {
  localStorage.setItem('keeta_snacks', JSON.stringify(newVal))
}, { deep: true })

watch(activeSnackId, (newVal) => {
  if (newVal !== null) {
    localStorage.setItem('keeta_active_id', newVal.toString())
  }
})

const currentSnack = computed(() => {
  return snacks.value.find(s => s.id === activeSnackId.value)
})

const currentSnackIndex = computed(() => {
  return snacks.value.findIndex(s => s.id === activeSnackId.value)
})

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

<style>
body {
  margin: 0;
  background-color: #121212;
  color: #fff;
  overflow: hidden;
}

.app-container, .print-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

.ingredient-sidebar { width: 100%; max-width: 500px; min-width: 320px; flex-shrink: 1; }
.product-editor { flex: 1; }
.guide-manager { flex-shrink: 0; }

/* =========================================
   NOVO: ESTILOS DA COLUNA UNIFICADA
========================================= */

.print-canvas-area {
  flex: 1;
  min-width: 0; /* Garante que o canvas pode encolher se necessário */
}

.unified-sidebar {
  width: 380px; /* Levemente mais largo para acomodar bem as duas abas */
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #121212;
  border-left: 1px solid #222;
  flex-shrink: 0;
}

.sidebar-global-header {
  padding: 20px 20px 10px 20px;
  background-color: #1a1a1a;
}

.btn-back-global {
  background: transparent;
  border: 1px solid #333;
  color: #ccc;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  width: fit-content;
}

.btn-back-global:hover {
  background: #2a2a2a;
  color: #fff;
  border-color: #555;
}

.sidebar-tabs {
  display: flex;
  background-color: #1a1a1a;
  padding: 0 20px;
  gap: 8px;
  border-bottom: 1px solid #222;
}

.tab-btn {
  flex: 1;
  background-color: transparent;
  border: none;
  color: #888;
  padding: 12px 0;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.tab-btn:hover {
  color: #ccc;
}

.tab-btn.active {
  color: #f38b41;
  border-bottom-color: #f38b41;
}

.sidebar-content {
  flex-grow: 1;
  overflow: hidden;
  display: flex;
}

/* SOBRESCRITAS MÁGICAS: 
   Faz os componentes filhos se ajustarem ao novo container 
   sem precisar alterar o código interno deles! */
.inner-sidebar {
  width: 100% !important;
  height: 100% !important;
  border-left: none !important;
  padding-top: 20px !important;
}

/* Esconde o botão "Voltar" que estava dentro do PrintSettingsSidebar, 
   já que agora temos um global fixo no topo da aba */
.inner-sidebar .btn-back {
  display: none !important;
}
</style>