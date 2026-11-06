<template>
  <div class="print-canvas-wrapper">

    <!-- Tamanho/orientação do papel usados pelo navegador ao imprimir ou salvar em PDF -->
    <component :is="'style'">@page { size: {{ pageSize }}; margin: 0; }</component>

    <!-- Controles de Zoom Flutuantes -->
    <div class="zoom-controls">
      <button class="zoom-btn" title="Aumentar zoom" @click="zoomIn">+</button>
      <button class="zoom-level" title="Ajustar à largura" @click="userZoomed = false; fitToWidth()">{{ Math.round(zoom * 100) }}%</button>
      <button class="zoom-btn" title="Diminuir zoom" @click="zoomOut">−</button>
    </div>

    <!-- Container de Rolagem com TODAS as Páginas -->
    <div ref="scrollEl" class="pages-scroll-container">

      <!-- Renderiza uma folha para cada página calculada -->
      <div v-for="(pageSnacks, pageIndex) in pages" :key="pageIndex" class="paper-sheet" :class="[settings.orientation, { 'last-sheet': pageIndex === pages.length - 1 }]"
        :style="dynamicStyles">

        <!-- Grid de Corte -->
        <div class="cut-lines-grid" :class="{ 'show-cutlines': settings.showCutLines }">

          <!-- Renderiza APENAS os lanches que pertencem a esta folha específica -->
          <div v-for="(snack, localIndex) in pageSnacks" :key="snack.id" class="snack-preview-card">

            <div class="card-header">
              <!-- Calcula o número geral do lanche para não zerar a cada página -->
              <span class="snack-number">{{ String(getGlobalIndex(pageIndex, localIndex)).padStart(2, '0') }}</span>
              <h4 class="snack-name">{{ snack.name }}</h4>
            </div>

            <div class="card-body">
              <div class="ingredients-list-print">
                <div v-for="item in snack.ingredients" :key="item.id" class="ingredient-print-item">
                  <img v-if="item.image" :src="item.image" class="print-item-img" />
                  <div class="print-item-text">
                    <span class="print-item-name">{{ item.name }}</span>
                    <span v-if="item.obs" class="print-item-obs">{{ item.obs }}</span>
                  </div>
                </div>
                <div v-if="snack.ingredients.length === 0" class="empty-snack">
                  Sem ingredientes.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- Aviso Inferior (Aparece no final do scroll) -->
      <div class="bottom-controls">
        <p class="disclaimer">
          Pré-visualização. Confira margens e tamanho do papel antes de imprimir.
        </p>
      </div>

    </div>

  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  snacks: {
    type: Array,
    required: true
  },
  settings: {
    type: Object,
    required: true
  }
})

// MÁGICA DO SCROLL: Agrupa os lanches em "Páginas" baseadas na configuração
const pages = computed(() => {
  if (props.settings.itemsPerPage === 'custom') {
    return [props.snacks] // Se for personalizado, joga tudo numa folha só
  }

  const itemsPerPage = props.settings.itemsPerPage
  const result = []

  for (let i = 0; i < props.snacks.length; i += itemsPerPage) {
    result.push(props.snacks.slice(i, i + itemsPerPage))
  }

  return result.length ? result : [[]] // Garante que pelo menos 1 folha em branco apareça
})

// Calcula o número real do lanche na sequência (01, 02, 03) ignorando a quebra de página
const getGlobalIndex = (pageIndex, localIndex) => {
  if (props.settings.itemsPerPage === 'custom') return localIndex + 1
  return (pageIndex * props.settings.itemsPerPage) + localIndex + 1
}

// Tamanhos reais de papel (mm) — a folha é desenhada em tamanho real e o zoom só escala a visualização,
// assim a pré-visualização é idêntica ao PDF.
const PAPERS = {
  a4: { w: 210, h: 297, css: 'A4' },
  letter: { w: 215.9, h: 279.4, css: 'Letter' }
}

const paper = computed(() => PAPERS[props.settings.paper] || PAPERS.a4)
const isLandscape = computed(() => props.settings.orientation === 'landscape')
const sheetWidthMm = computed(() => (isLandscape.value ? paper.value.h : paper.value.w))
const sheetHeightMm = computed(() => (isLandscape.value ? paper.value.w : paper.value.h))
const pageSize = computed(() => `${paper.value.css} ${isLandscape.value ? 'landscape' : 'portrait'}`)

// --- Zoom da visualização ---
const MM_TO_PX = 96 / 25.4
const scrollEl = ref(null)
const userZoomed = ref(false)
const zoom = ref(0.8)
const clampZoom = (v) => Math.min(2, Math.max(0.3, Math.round(v * 100) / 100))
const zoomIn = () => { userZoomed.value = true; zoom.value = clampZoom(zoom.value + 0.1) }
const zoomOut = () => { userZoomed.value = true; zoom.value = clampZoom(zoom.value - 0.1) }

const fitToWidth = () => {
  if (!scrollEl.value) return
  const available = scrollEl.value.clientWidth - 40
  zoom.value = clampZoom(Math.min(1, available / (sheetWidthMm.value * MM_TO_PX)))
}

let resizeObserver = null
onMounted(() => {
  fitToWidth()
  if (typeof ResizeObserver !== 'undefined' && scrollEl.value) {
    resizeObserver = new ResizeObserver(() => {
      // Só reajusta sozinho se o usuário não mexeu no zoom manualmente
      if (!userZoomed.value) fitToWidth()
    })
    resizeObserver.observe(scrollEl.value)
  }
})
onBeforeUnmount(() => resizeObserver?.disconnect())

// Trocar papel/orientação muda a largura da folha: reajusta se o zoom ainda é automático
watch(sheetWidthMm, () => { if (!userZoomed.value) fitToWidth() })

const dynamicStyles = computed(() => {
  let columns = props.settings.itemsPerPage === 'custom' ? props.snacks.length : props.settings.itemsPerPage
  if (columns === 0) columns = 1

  return {
    width: `${sheetWidthMm.value}mm`,
    height: `${sheetHeightMm.value}mm`,
    zoom: zoom.value,
    paddingTop: `${props.settings.margins.top}mm`,
    paddingBottom: `${props.settings.margins.bottom}mm`,
    paddingLeft: `${props.settings.margins.left}mm`,
    paddingRight: `${props.settings.margins.right}mm`,
    '--grid-columns': `repeat(${columns}, 1fr)`,
    '--grid-rows': '1fr', // Mantendo apenas 1 linha como combinamos antes
    '--grid-gap': `${props.settings.spacing}mm`
  }
})
</script>

<style scoped>
.print-canvas-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: #d8d8dd;
  flex-grow: 1;
  overflow: hidden;
  /* Odiamos scroll duplo, então o wrapper não tem scroll */
  font-family: sans-serif;
}

/* NOVO: Área onde as folhas vão rolar */
.pages-scroll-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: safe center;
  gap: 40px;
  /* Distância entre uma folha e outra */
  padding: 60px 20px;
  box-sizing: border-box;
}

/* Custom Scrollbar da área de visualização */
.pages-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.pages-scroll-container::-webkit-scrollbar-thumb {
  background: #b0b0b5;
  border-radius: 4px;
}

.pages-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.zoom-controls {
  position: absolute;
  top: 40px;
  /* Ajustado um pouco para cima */
  left: 20px;
  background-color: #222;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  z-index: 10;
  /* Garante que os botões fiquem em cima do scroll */
}

.zoom-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.zoom-btn:hover {
  background-color: #444;
}

.zoom-level {
  background: transparent;
  cursor: pointer;
  color: #ccc;
  font-size: 0.7rem;
  padding: 8px 4px;
  border-top: 1px solid #444;
  border-bottom: 1px solid #444;
  font-weight: bold;
}

/* Folha Base */
.paper-sheet {
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  position: relative;
  box-sizing: border-box;
  flex-shrink: 0;
  /* Impede a folha de ser esmagada; largura/altura (mm) e zoom vêm do estilo dinâmico */
}

/* Grid Injetado Dinamicamente */
.cut-lines-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: var(--grid-columns);
  grid-template-rows: var(--grid-rows);
  gap: var(--grid-gap);
  position: relative;
}

.cut-lines-grid.show-cutlines .snack-preview-card {
  border: 1px dashed #ccc;
}

.snack-preview-card {
  border: 1px solid transparent;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #fff;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid #f38b41;
  padding-bottom: 8px;
}

.snack-number {
  background: #111;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
}

.snack-name {
  margin: 0;
  font-size: 1.1rem;
  color: #111;
  font-weight: 900;
  flex-grow: 1;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-body {
  display: flex;
  flex-grow: 1;
  gap: 16px;
  align-items: flex-start;
  overflow: hidden;
}

.ingredients-list-print {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.ingredient-print-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.print-item-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.print-item-text {
  display: flex;
  flex-direction: column;
}

.print-item-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: #333;
}

.print-item-obs {
  font-size: 0.65rem;
  color: #cc3333;
  font-style: italic;
}

.empty-snack {
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
}

/* Controles Inferiores */
.bottom-controls {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.disclaimer {
  color: #777;
  font-size: 0.75rem;
  margin: 0;
}
</style>