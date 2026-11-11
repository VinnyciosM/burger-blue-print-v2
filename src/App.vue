<template>
  <div class="app-shell">
  <NavBar :printMode="isPrintMode" :snackCount="snacks.length" @set-mode="isPrintMode = $event === 'print'" />

  <div v-if="!isPrintMode" class="app-container">
    <IngredientSidebar class="ingredient-sidebar" :locked="!!currentSnack?.locked" @add-ingredient="handleAddIngredient" />
    
    <ProductEditor v-if="currentSnack" class="product-editor" :snack="currentSnack" :snackIndex="currentSnackIndex"
      :snacks="snacks" @select-snack="selectSnack" @move-snack="moveSnack" @toggle-flag="toggleFlag" />
    
    <GuideManager class="guide-manager" v-model:snacks="snacks" :activeSnackId="activeSnackId"
      @open-print-mode="isPrintMode = true" @add-snack="createNewSnack" @select-snack="selectSnack"
      @duplicate-snack="duplicateSnack" @delete-snack="deleteSnack" @toggle-flag="toggleFlag" />
  </div>

  <div v-else class="print-container">
    
    <!-- O Canvas agora tem espaço de sobra na esquerda/centro -->
    <PrintCanvas :snacks="printSnacks":settings="printSettings" class="print-canvas-area" />

    <!-- NOVA COLUNA UNIFICADA (Direita) -->
    <aside class="unified-sidebar">
      
      <!-- Cabeçalho Fixo: Botão de Voltar -->
      <div class="sidebar-global-header">
        <button @click="isPrintMode = false" class="btn-back-global">
          <Icon name="arrow-left" :size="14" /> Voltar para edição
        </button>
      </div>

      <!-- Abas de Navegação -->
      <div class="sidebar-tabs">
        <button 
          @click="printTab = 'settings'" 
          class="tab-btn" 
          :class="{ active: printTab === 'settings' }"
        >
          <Icon name="settings" :size="15" /> Configurações
        </button>
        <button 
          @click="printTab = 'order'" 
          class="tab-btn" 
          :class="{ active: printTab === 'order' }"
        >
          <Icon name="layers" :size="15" /> Lanches
        </button>
      </div>

      <!-- Área de Conteúdo (Alterna os componentes) -->
      <div class="sidebar-content">
        <PrintSettingsSidebar 
          v-show="printTab === 'settings'" 
          :snackCount="printSnacks.length"
          :pngState="pngState"
          @back-to-edit="isPrintMode = false"
          @update-settings="updatePrintSettings"
          @generate-pdf="printManual"
          @export-png="exportPng"
          class="inner-sidebar"
        />

        <div v-show="printTab === 'order'" class="inner-sidebar order-panel">
          <SnackList v-model:snacks="snacks" :activeSnackId="activeSnackId" @select-snack="selectSnack"
            @add-snack="createNewSnack" @duplicate-snack="duplicateSnack" @delete-snack="deleteSnack" />
        </div>
      </div>

    </aside>
  </div>

  <!-- Marca d'água do criador (não aparece na impressão) -->
  <a class="watermark" href="https://github.com/VinnyciosM" target="_blank" rel="noopener">
    Feito por <strong>Vinnycios Medeiros</strong> · © {{ new Date().getFullYear() }} · Licença AGPL-3.0
  </a>

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
import Icon from './components/Icon.vue';
import { slugify, resolveImage } from './ingredientImages.js'
import { customImageFor } from './customIngredients.js'
import { placeSnack, placeAll } from './workspace.js'
import { exportSheetsAsPng } from './exportPng.js'
import { reportStorageError, reportStorageOk } from './storageStatus.js'

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
        placeAll(snacks.value) // manuais antigos ganham posição na área de trabalho
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
  try {
    localStorage.setItem(STORAGE_KEYS.snacks, JSON.stringify(newVal))
    reportStorageOk()
  } catch (error) {
    reportStorageError(error) // normalmente: armazenamento do navegador cheio
  }
}, { deep: true })

watch(activeSnackId, (newVal) => {
  if (newVal !== null) {
    localStorage.setItem(STORAGE_KEYS.activeId, newVal.toString())
  }
})

// Lanches ocultos não entram na tela "Gerar manual" nem no PDF
const printSnacks = computed(() => snacks.value.filter(s => !s.hidden))

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
  const snack = { id: newId, name: `Novo Lanche`, ingredients: [] }
  snacks.value.push(snack)
  placeSnack(snacks.value[snacks.value.length - 1], snacks.value)
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
  // A cópia nasce ao lado do original, sem herdar a posição exata
  delete copy.x; delete copy.y
  copy.locked = false
  snacks.value.splice(index + 1, 0, copy)
  placeSnack(snacks.value[index + 1], snacks.value)
  activeSnackId.value = copy.id
}

// Muda a ordem do manual (a mesma ordem da lista e da impressão)
const moveSnack = (id, delta) => {
  const index = snacks.value.findIndex(s => s.id === id)
  const target = index + delta
  if (index === -1 || target < 0 || target >= snacks.value.length) return
  const [snack] = snacks.value.splice(index, 1)
  snacks.value.splice(target, 0, snack)
}

// Oculta ou bloqueia um manual na área de trabalho
const toggleFlag = (id, key) => {
  const snack = snacks.value.find(s => s.id === id)
  if (snack && (key === 'hidden' || key === 'locked')) snack[key] = !snack[key]
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

// Salva as folhas escolhidas como PNG (300 DPI, tamanho real da folha)
const pngState = ref({ busy: false, done: 0, total: 0, error: '' })

const exportPng = async (indexes) => {
  if (pngState.value.busy || !indexes.length) return
  const sheets = [...document.querySelectorAll('.paper-sheet')]
  pngState.value = { busy: true, done: 0, total: indexes.length, error: '' }
  try {
    await exportSheetsAsPng(sheets, indexes, (done) => { pngState.value.done = done })
    pngState.value.busy = false
  } catch (error) {
    console.error('Falha ao gerar PNG:', error)
    pngState.value = { busy: false, done: 0, total: 0, error: 'Não foi possível gerar o PNG. Tente de novo.' }
  }
}

const handleAddIngredient =(ingredient) => {
  // Lanche bloqueado não pode ser editado
  if (currentSnack.value && !currentSnack.value.locked) {
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
  --bg: #0a0c0f;
  --surface: #12161a;
  --surface-2: #181d22;
  --border: #212830;
  --border-strong: #35404b;
  --text: #f3f5f7;
  --text-muted: #9ba5ae;
  --text-faint: #6b757e;
  --canvas-bg: #1b2026;
  --radius: 14px;
  --radius-sm: 10px;
  --shadow-panel: 0 1px 0 rgba(255, 255, 255, 0.03) inset, 0 12px 32px rgba(0, 0, 0, 0.35);
  --glow-opacity: 1;
  --accent: #f38b41;
  --accent-hover: #d17530;
  --accent-soft: rgba(243, 139, 65, 0.12);
  --accent-border: rgba(243, 139, 65, 0.35);
  --on-accent: #1a1109;
  --font: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  color-scheme: dark;
}

:root[data-theme="light"] {
  --bg: #eceff3;
  --surface: #ffffff;
  --surface-2: #f7f8fa;
  --border: #e3e7ec;
  --border-strong: #c9d0d8;
  --text: #1a2028;
  --text-muted: #55606b;
  --text-faint: #8893a0;
  --canvas-bg: #dfe3e8;
  --shadow-panel: 0 1px 2px rgba(20, 30, 45, 0.05), 0 10px 28px rgba(20, 30, 45, 0.08);
  --glow-opacity: 0.7;
  color-scheme: light;
}

*, *::before, *::after { box-sizing: border-box; }

/* Botões com ícone SVG: ícone e texto alinhados */
button:has(> .icon), a:has(> .icon) { display: inline-flex; align-items: center; gap: 6px; }
button:has(> .icon:only-child) { justify-content: center; }

body {
  margin: 0;
  background-color: var(--bg);
  /* brilho suave da cor principal no topo */
  background-image: radial-gradient(900px 380px at 15% -80px, var(--accent-soft), transparent 70%);
  background-repeat: no-repeat;
  background-attachment: fixed;
  color: var(--text);
  font-family: var(--font);
  font-feature-settings: 'cv11', 'ss01';
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

/* Foco visível e moderno em todo o app */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

* { scrollbar-width: thin; scrollbar-color: var(--border-strong) transparent; }

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

/* Painéis flutuantes: cada coluna é um cartão com respiro entre eles */
.app-container, .print-container {
  display: flex;
  flex: 1;
  gap: 12px;
  padding: 4px 12px 26px;
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
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-panel);
  /* grade de pontos discreta, como uma mesa de trabalho */
  background-image: radial-gradient(var(--border-strong) 1px, transparent 1px);
  background-size: 22px 22px;
}

.unified-sidebar {
  width: 380px; /* Levemente mais largo para acomodar bem as duas abas */
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-panel);
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar-global-header {
  padding: 20px 20px 10px 20px;
  background-color: var(--surface);
}

.btn-back-global {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
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
  margin: 6px 20px 0;
  padding: 4px;
  gap: 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  background-color: transparent;
  border: none;
  color: var(--text-muted);
  padding: 8px 0;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: 9px;
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
  color: var(--text);
  background: var(--surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25), 0 0 0 1px var(--border);
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

/* Marca d'água do criador */
.watermark {
  position: fixed;
  right: 18px;
  bottom: 6px;
  z-index: 5;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: var(--text-faint);
  opacity: 0.7;
  text-decoration: none;
  transition: opacity 0.15s, color 0.15s;
}

.watermark strong { font-weight: 800; color: var(--text-muted); }

.watermark:hover { opacity: 1; color: var(--accent); }

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
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
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
/* Efeito de "lanche bloqueado" nas colunas laterais (um só lugar, para as duas ficarem iguais).
   Uso: o conteúdo ganha a classe locked-body (+ is-locked e inert quando bloqueado) e o aviso locked-banner. */
.locked-body {
  transition: opacity 0.2s, filter 0.2s;
}

.locked-body.is-locked {
  opacity: 0.4;
  filter: grayscale(1);
  user-select: none;
}

.locked-banner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 50;
  width: calc(100% - 36px);
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  /* fundo opaco (superfície + tom da cor principal), para cobrir o que está embaixo */
  background: linear-gradient(var(--accent-soft), var(--accent-soft)), var(--surface);
  border: 1px solid var(--accent);
  border-radius: 10px;
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.35;
}

.locked-banner .icon { margin-top: 1px; color: var(--accent); }

@media print {
  html, body {
    height: auto;
    overflow: visible;
    background: #fff;
  }

  .navbar, .unified-sidebar, .zoom-controls, .bottom-controls, .toast, .watermark {
    display: none !important;
  }

  /* Ferramentas do Vue DevTools (só existem no `npm run dev`, nunca na versão final) */
  #vue-inspector-container, #__vue-devtools-container__, .vue-devtools__anchor {
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
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
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