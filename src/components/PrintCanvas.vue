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

        <!-- Linha de cartões: 1 a 3 lanches por folha, sempre centralizados -->
        <div class="cut-lines-grid" :class="{ 'show-cutlines': settings.showCutLines }">

          <!-- Cada cartão é igual ao canvas da tela "Montar lanches" e ocupa 1/3 da largura útil da folha -->
          <div v-for="snack in pageSnacks" :key="snack.id" class="snack-preview-card">

            <h4 class="snack-name">{{ snack.name }}</h4>

            <div class="card-body">
              <div v-if="snack.ingredients.length" class="ingredients-list-print">
                <div v-for="item in snack.ingredients" :key="item.id" class="ingredient-print-item">
                  <img v-if="item.image" :src="item.image" class="print-item-img" />
                  <div class="print-item-text">
                    <span class="print-item-name">{{ item.name }}</span>
                    <span v-if="item.obs" class="print-item-obs">{{ item.obs }}</span>
                  </div>
                </div>
              </div>
              <span v-else class="empty-snack">VAZIO</span>
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

// Agrupa os lanches em folhas: no máximo 3 por folha (cada cartão ocupa 1/3 da largura útil)
const MAX_PER_SHEET = 3
const perSheet = computed(() => {
  const n = Number(props.settings.itemsPerPage)
  return Math.min(MAX_PER_SHEET, Math.max(1, Number.isFinite(n) ? n : MAX_PER_SHEET))
})

const pages = computed(() => {
  const result = []
  for (let i = 0; i < props.snacks.length; i += perSheet.value) {
    result.push(props.snacks.slice(i, i + perSheet.value))
  }
  return result.length ? result : [[]] // Garante que pelo menos 1 folha em branco apareça
})

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
  const m = props.settings.margins
  const gap = Number(props.settings.spacing) || 0
  const inner = sheetWidthMm.value - (Number(m.left) || 0) - (Number(m.right) || 0)
  // Largura de cada cartão = 1/3 da largura útil (já descontado o espaço entre cartões)
  const slot = Math.max(10, (inner - gap * (MAX_PER_SHEET - 1)) / MAX_PER_SHEET)

  return {
    width: `${sheetWidthMm.value}mm`,
    height: `${sheetHeightMm.value}mm`,
    zoom: zoom.value,
    paddingTop: `${m.top}mm`,
    paddingBottom: `${m.bottom}mm`,
    paddingLeft: `${m.left}mm`,
    paddingRight: `${m.right}mm`,
    '--slot-w': `${slot}mm`,
    '--grid-gap': `${gap}mm`
  }
})
</script>

<style scoped>
.print-canvas-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: var(--canvas-bg);
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

/* Linha de cartões centralizada: 1, 2 ou 3 lanches mantêm sempre o mesmo tamanho (1/3 da largura útil) */
.cut-lines-grid {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: var(--grid-gap);
}

/* Cartão = mesmo visual do canvas da tela "Montar lanches" */
.snack-preview-card {
  flex: 0 0 var(--slot-w);
  width: var(--slot-w);
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 6px;
  background: transparent;
  overflow: hidden;
  box-sizing: border-box;
}

/* Serrilhado (pontilhado) mostrando a borda de cada guia, para recortar */
.cut-lines-grid.show-cutlines .snack-preview-card {
  outline: 1px dashed #8a8a8a;
  outline-offset: -1px;
}

.snack-name {
  flex-shrink: 0;
  margin: 4px 0 10px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f38b41;
  font-size: 19px;
  line-height: 1.15;
  font-weight: 900;
  text-align: center;
  text-transform: uppercase;
  color: #111827;
  overflow-wrap: anywhere;
}

.card-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Poucos itens ficam grandes (até o limite); muitos itens encolhem para caber */
.ingredients-list-print {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 2px;
  height: 100%;
  min-height: 0;
}

.ingredient-print-item {
  display: flex;
  align-items: center;
  flex: 1 1 0;
  min-height: 0;
  max-height: 104px;
  width: 100%;
}

.print-item-img {
  max-width: 48%;
  height: 100%;
  width: auto;
  object-fit: contain;
  mix-blend-mode: multiply;
  flex-shrink: 1;
}

.print-item-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
  padding-left: 14px;
}

.print-item-name {
  font-size: 15px;
  font-weight: 900;
  line-height: 1.2;
  text-transform: uppercase;
  color: #374151;
  overflow-wrap: anywhere;
}

.print-item-obs {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 600;
  font-style: italic;
  color: #cc3333;
}

.empty-snack {
  margin: auto;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 1px;
  color: #d1d5db;
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