<template>
  <div class="app-shell">
  <NavBar :printMode="isPrintMode" :snackCount="snacks.length" @set-mode="isPrintMode = $event === 'print'" />

  <div v-if="!isPrintMode" class="app-container">
    <IngredientSidebar class="ingredient-sidebar" @add-ingredient="handleAddIngredient" />
    
    <ProductEditor v-if="currentSnack" class="product-editor" :snack="currentSnack" :snackIndex="currentSnackIndex" />
    
    <GuideManager class="guide-manager" v-model:snacks="snacks" :activeSnackId="activeSnackId"
      @open-print-mode="isPrintMode = true" @add-snack="createNewSnack" @select-snack="selectSnack"
      @duplicate-snack="duplicateSnack" @delete-snack="deleteSnack" />
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
          📚 Lanches
        </button>
      </div>

      <!-- Área de Conteúdo (Alterna os componentes) -->
      <div class="sidebar-content">
        <PrintSettingsSidebar 
          v-show="printTab === 'settings'" 
          :snackCount="snacks.length"
          @back-to-edit="isPrintMode = false" 
          @update-settings="updatePrintSettings" 
          @generate-pdf="printManual" 
          class="inner-sidebar"
        />

        <div v-show="printTab === 'order'" class="inner-sidebar order-panel">
          <SnackList v-model:snacks="snacks" :activeSnackId="activeSnackId" @select-snack="selectSnack"
            @add-snack="createNewSnack" @duplicate-snack="duplicateSnack" @delete-snack="deleteSnack" />
        </div>
      </div>

    </aside>
  </div>

  <!-- Aviso com "Desfazer" após excluir um lanche -->
  <Transition name="toast">
    <div v-if="lastDeleted" class="toast" role="status">
      <span>Lanche "{{ lastDeleted.snack.name || 'Sem nome' }}" excluído</span>
      <button @click="undoDelete">Desfazer</button>
    </div>
  </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import IngredientSidebar from './components/IngredientSidebar.vue';
import ProductEditor from './components/ProductEditor.vue';
import GuideManager from './components/GuideManager.vue';
import PrintCanvas from './components/PrintCanvas.vue';
import PrintSettingsSidebar from './components/PrintSettingsSidebar.vue';
import SnackList from './components/SnackList.vue';
import NavBar from './components/NavBar.vue';
import { slugify, resolveImage } from './ingredientImages.js'
import { customImageFor } from './customIngredients.js'

const STORAGE_KEYS = {
  snacks: 'manualburger_snacks',
  activeId: 'manualburger_active_id'
}

const isPrintMode = ref(false)

// NOVO: Estado que controla qual aba da impressão está aberta
const printTab = ref('settings') // Começa nas configurações

const snacks = ref([])
const activeSnackId = ref(null)

const printSettings = ref({
  paper: 'a4',
  orientation: 'landscape',
  itemsPerPage: 3,
  margins: { top: 10, bottom: 10, left: 10, right: 10 },
  spacing: 8,
  showCutLines: true
})

const updatePrintSettings = (newSettings) => {
  printSettings.value = newSettings
}

onMounted(() => {
  // Migração única das chaves antigas (versões anteriores ao projeto público)
  for (const [oldKey, newKey] of [['keeta_snacks', STORAGE_KEYS.snacks], ['keeta_active_id', STORAGE_KEYS.activeId]]) {
    const oldValue = localStorage.getItem(oldKey)
    if (oldValue !== null && localStorage.getItem(newKey) === null) {
      localStorage.setItem(newKey, oldValue)
    }
    localStorage.removeItem(oldKey)
  }
  localStorage.removeItem('keeta_auth')

  const savedActiveId = localStorage.getItem(STORAGE_KEYS.activeId)

  try {
    const savedSnacks = localStorage.getItem(STORAGE_KEYS.snacks)
    if (savedSnacks) {
      const parsed = JSON.parse(savedSnacks)
      if (Array.isArray(parsed)) {
        // Reaponta as imagens para os arquivos locais (os caminhos mudam a cada build)
        for (const snack of parsed) {
          for (const ing of snack.ingredients || []) {
            ing.slug = ing.slug || slugify(ing.name)
            ing.image = resolveImage(ing.slug) || customImageFor(ing.slug)
          }
        }
        snacks.value = parsed
        activeSnackId.value = savedActiveId ? parseInt(savedActiveId) : (snacks.value[0]?.id || null)
      }
    }
  } catch (error) {
    console.error('Dados salvos inválidos, iniciando do zero:', error)
  }

  if (snacks.value.length === 0) {
    createNewSnack()
  }
})

watch(snacks, (newVal) => {
  localStorage.setItem(STORAGE_KEYS.snacks, JSON.stringify(newVal))
}, { deep: true })

watch(activeSnackId, (newVal) => {
  if (newVal !== null) {
    localStorage.setItem(STORAGE_KEYS.activeId, newVal.toString())
  }
})

const currentSnack = computed(() => {
  return snacks.value.find(s => s.id === activeSnackId.value)
})

const currentSnackIndex = computed(() => {
  return snacks.value.findIndex(s => s.id === activeSnackId.value)
})

let idCounter = 0
const uid = () => Date.now() * 1000 + (idCounter++ % 1000)

const createNewSnack = () => {
  const newId = uid()
  snacks.value.push({
    id: newId,
    name: `Novo Lanche`,
    ingredients: []
  })
  activeSnackId.value = newId
  return newId
}

const selectSnack = (id) => {
  activeSnackId.value = id
}

const duplicateSnack = (id) => {
  const index = snacks.value.findIndex(s => s.id === id)
  if (index === -1) return
  const original = snacks.value[index]
  const copy = {
    ...JSON.parse(JSON.stringify(original)),
    id: uid(),
    name: `${original.name || 'Lanche'} (cópia)`
  }
  copy.ingredients.forEach(ing => { ing.id = uid() })
  snacks.value.splice(index + 1, 0, copy)
  activeSnackId.value = copy.id
}

// --- Exclusão com desfazer ---
const lastDeleted = ref(null)
let undoTimer = null

const deleteSnack = (id) => {
  const index = snacks.value.findIndex(s => s.id === id)
  if (index === -1) return

  const [snack] = snacks.value.splice(index, 1)
  let placeholderId = null

  if (snacks.value.length === 0) {
    placeholderId = createNewSnack()
  } else if (activeSnackId.value === id) {
    activeSnackId.value = snacks.value[Math.min(index, snacks.value.length - 1)].id
  }

  lastDeleted.value = { snack, index, placeholderId }
  clearTimeout(undoTimer)
  undoTimer = setTimeout(() => { lastDeleted.value = null }, 6000)
}

const undoDelete = () => {
  if (!lastDeleted.value) return
  const { snack, index, placeholderId } = lastDeleted.value

  // Remove o lanche vazio criado automaticamente quando a lista ficou vazia
  if (placeholderId !== null) {
    const placeholder = snacks.value.find(s => s.id === placeholderId)
    if (placeholder && placeholder.ingredients.length === 0) {
      snacks.value.splice(snacks.value.indexOf(placeholder), 1)
    }
  }

  snacks.value.splice(Math.min(index, snacks.value.length), 0, snack)
  activeSnackId.value = snack.id
  lastDeleted.value = null
  clearTimeout(undoTimer)
}

// Gera o PDF usando a impressão do navegador ("Salvar como PDF"), sem dependências extras
const printManual = () => {
  const previousTitle = document.title
  document.title = 'Manual-Burger'
  const restore = () => { document.title = previousTitle; window.removeEventListener('afterprint', restore) }
  window.addEventListener('afterprint', restore)
  window.print()
}

const handleAddIngredient = (ingredient) => {
  if (currentSnack.value) {
    currentSnack.value.ingredients.push({
      id: uid(),
      name: ingredient.name,
      slug: ingredient.slug,
      obs: '',
      image: ingredient.image
    })
  }
}
</script>

<style>
/* Tokens de design (usados em todos os componentes) */
:root,
:root[data-theme="dark"] {
  --bg: #0e1113;
  --surface: #14181b;
  --surface-2: #181d21;
  --border: #242a2f;
  --border-strong: #38414a;
  --text: #f1f3f4;
  --text-muted: #9aa3a9;
  --text-faint: #69737a;
  --canvas-bg: #20252a;
  --accent: #f38b41;
  --accent-hover: #d17530;
  --accent-soft: rgba(243, 139, 65, 0.12);
  --accent-border: rgba(243, 139, 65, 0.35);
  --on-accent: #1a1109;
  --font: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  color-scheme: dark;
}

:root[data-theme="light"] {
  --bg: #f3f4f6;
  --surface: #ffffff;
  --surface-2: #f6f7f9;
  --border: #e1e4e8;
  --border-strong: #c5cbd3;
  --text: #1c2127;
  --text-muted: #566069;
  --text-faint: #8a939c;
  --canvas-bg: #d8d8dd;
  color-scheme: light;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font);
  overflow: hidden;
}

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.app-container, .print-container {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
}

/* 3 colunas de cards de 3 ingredientes cada: largura fixa confortável */
.ingredient-sidebar { width: 400px; flex-shrink: 0; }
.product-editor { flex: 1; min-width: 0; min-height: 0; }
.guide-manager { flex-shrink: 0; min-height: 0; }

/* =========================================
   NOVO: ESTILOS DA COLUNA UNIFICADA
========================================= */

.print-canvas-area {
  flex: 1;
  min-width: 0; /* Garante que o canvas pode encolher se necessário */
}

.unified-sidebar {
  width: 380px; /* Levemente mais largo para acomodar bem as duas abas */
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--surface);
  border-left: 1px solid var(--border);
  flex-shrink: 0;
}

.sidebar-global-header {
  padding: 20px 20px 10px 20px;
  background-color: var(--surface);
}

.btn-back-global {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
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
  background: var(--border);
  color: var(--text);
  border-color: var(--border-strong);
}

.sidebar-tabs {
  display: flex;
  background-color: var(--surface);
  padding: 0 20px;
  gap: 8px;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  background-color: transparent;
  border: none;
  color: var(--text-muted);
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
  color: var(--text);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
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

/* Aviso de exclusão */
.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px 10px 18px;
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-size: 0.82rem;
}

.toast button {
  padding: 6px 12px;
  background: var(--accent);
  border: none;
  border-radius: 8px;
  color: var(--on-accent);
  font-weight: 800;
  cursor: pointer;
}

.toast-enter-active, .toast-leave-active { transition: opacity 0.2s, transform 0.2s;}
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 10px);}

.order-panel { display: flex; flex-direction: column; padding: 0 20px 20px;}

/* =========================================
   IMPRESSÃO / PDF — apenas as folhas do manual
========================================= */
@media print {
  html, body {
    height: auto;
    overflow: visible;
    background: #fff;
  }

  .navbar, .unified-sidebar, .zoom-controls, .bottom-controls, .toast {
    display: none !important;
  }

  .app-shell, .print-container, .print-canvas-area,
  .print-canvas-wrapper, .pages-scroll-container {
    display: block !important;
    height: auto !important;
    width: auto !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
    background: #fff !important;
  }

  .paper-sheet {
    zoom: 1 !important;
    margin: 0 !important;
    box-shadow: none !important;
    break-after: page;
    page-break-after: always;
    break-inside: avoid;
    overflow: hidden;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .paper-sheet.last-sheet {
    break-after: auto;
    page-break-after: auto;
  }
}
</style>