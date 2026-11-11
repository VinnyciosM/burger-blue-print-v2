<template>
  <div class="workspace">
    <!-- Palco: fundo pontilhado infinito. Arraste o fundo para mover, role para dar zoom -->
    <div ref="stage" class="stage" :style="stageStyle" @pointerdown="onPointerDown" @wheel.prevent="onWheel">
      <div class="world" :style="worldStyle">
        <div v-for="item in visibleItems" :key="item.snack.id" class="manual" :data-id="item.snack.id"
          :class="{ selected: isSelected(item.snack.id), locked: item.snack.locked, dimmed: item.snack.hidden }" :style="manualStyle(item)">

          <div class="manual-label">
            <span class="label-index">{{ String(item.index + 1).padStart(2, '0') }}</span>
            <span class="label-name">{{ item.snack.name || 'Sem nome' }}</span>
            <span v-if="item.snack.locked" class="label-lock" title="Bloqueado"><Icon name="lock" :size="11" /></span>
          </div>

          <!-- A página: mesmo visual de antes (título + ingredientes empilhados) -->
          <div class="manual-sheet">
            <h2 class="canvas-title">{{ item.snack.name }}</h2>
            <div class="canvas-content">
              <span v-if="item.snack.ingredients.length === 0" class="canvas-empty-text">VAZIO</span>
              <div v-else class="layers-list">
                <div v-for="ing in item.snack.ingredients" :key="ing.id" class="layer-item">
                  <img v-if="ing.image" :src="ing.image" class="ingredient-img-canvas" draggable="false" />
                  <div class="info">
                    <span class="layer-name">{{ ing.name }}</span>
                    <span v-if="ing.obs" class="layer-obs">{{ ing.obs }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span v-if="item.snack.locked" class="sheet-lock" title="Bloqueado"><Icon name="lock" :size="34" /></span>
        </div>

        <!-- Guias inteligentes: linhas vermelhas quando o manual arrastado alinha com outro -->
        <div v-for="(g, i) in guides" :key="i" class="guide" :style="guideStyle(g)"></div>
      </div>

      <p v-if="visibleItems.length === 0" class="empty-hint">Nenhum manual na prancheta.</p>
    </div>

    <!-- Barra flutuante: zoom e ações do manual selecionado -->
    <div class="toolbar" @pointerdown.stop>
      <button class="tb-btn" title="Diminuir zoom" @click="zoomBy(1 / 1.25)">−</button>
      <button class="tb-zoom" title="Voltar para 100%" @click="resetZoom">{{ Math.round(view.z * 100) }}%</button>
      <button class="tb-btn" title="Aumentar zoom" @click="zoomBy(1.25)">+</button>
      <button class="tb-text" title="Enquadrar todos os manuais" @click="fitAll">Enquadrar</button>
      <button class="tb-text" title="Selecionar todos os manuais (ou Shift+clique para somar à seleção)"
        @click="selectAll">Todos</button>
    </div>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { view } from '../workspace.js'

const props = defineProps({
  snacks: { type: Array, required: true },
  activeSnackId: { type: Number, default: null }
})
const emit = defineEmits(['select-snack'])

const MIN_ZOOM = 0.15
const MAX_ZOOM = 2.5

const stage = ref(null)

const activeSnack = computed(() => props.snacks.find(s => s.id === props.activeSnackId) || null)

// A ordem da lista é a ordem do manual impresso e também a ordem de empilhamento (o último fica por cima)
const visibleItems = computed(() =>
  props.snacks.map((snack, index) => ({ snack, index }))
)

const stageStyle = computed(() => ({
  backgroundSize: `${22 * view.z}px ${22 * view.z}px`,
  backgroundPosition: `${view.x}px ${view.y}px`
}))

const worldStyle = computed(() => ({
  transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
  '--inv': 1 / view.z
}))

const manualStyle = ({ snack, index }) => ({
  left: `${snack.x}px`,
  top: `${snack.y}px`,
  width: `${snack.w}px`,
  height: `${snack.h}px`,
  zIndex: snack.id === props.activeSnackId ? 1000 : index
})

// ---------- Zoom ----------
function zoomAt(factor, cx, cy) {
  const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.z * factor))
  const ratio = next / view.z
  view.x = cx - (cx - view.x) * ratio
  view.y = cy - (cy - view.y) * ratio
  view.z = next
}

function zoomBy(factor) {
  zoomAt(factor, stage.value.clientWidth / 2, stage.value.clientHeight / 2)
}

function resetZoom() {
  zoomAt(1 / view.z, stage.value.clientWidth / 2, stage.value.clientHeight / 2)
}

function onWheel(e) {
  const rect = stage.value.getBoundingClientRect()
  zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - rect.left, e.clientY - rect.top)
}

// ---------- Enquadrar / revelar ----------
function fitRect(rect, { maxZoom = 1.2, padding = 70 } = {}) {
  const w = stage.value.clientWidth
  const h = stage.value.clientHeight
  if (!w || !h) return
  const z = Math.min(maxZoom, Math.max(MIN_ZOOM, Math.min(w / (rect.w + padding * 2), h / (rect.h + padding * 2))))
  view.z = z
  view.x = w / 2 - (rect.x + rect.w / 2) * z
  view.y = h / 2 - (rect.y + rect.h / 2) * z
  view.ready = true
}

function fitAll() {
  const list = visibleItems.value.map(i => i.snack)
  if (!list.length) return
  const x1 = Math.min(...list.map(s => s.x))
  const y1 = Math.min(...list.map(s => s.y))
  const x2 = Math.max(...list.map(s => s.x + s.w))
  const y2 = Math.max(...list.map(s => s.y + s.h))
  fitRect({ x: x1, y: y1, w: x2 - x1, h: y2 - y1 })
}

// Se o manual selecionado (pela lista, por exemplo) estiver fora da tela, centraliza nele
function revealActive() {
  const s = activeSnack.value
  if (!s || !stage.value) return
  const w = stage.value.clientWidth
  const h = stage.value.clientHeight
  const left = s.x * view.z + view.x
  const top = s.y * view.z + view.y
  const inside = left >= 0 && top >= 0 && left + s.w * view.z <= w && top + s.h * view.z <= h
  if (inside) return
  view.x = w / 2 - (s.x + s.w / 2) * view.z
  view.y = h / 2 - (s.y + s.h / 2) * view.z
}

// ---------- Seleção (Shift/Ctrl+clique soma ou tira da seleção) ----------
const selectedIds = ref(props.activeSnackId != null ? [props.activeSnackId] : [])
const isSelected = (id) => selection.value.some(s => s.id === id)

const selection = computed(() => {
  const picked = props.snacks.filter(s => selectedIds.value.includes(s.id))
  if (picked.length) return picked
  return activeSnack.value ? [activeSnack.value] : []
})

// Manuais bloqueados não se movem nem alinham
const targets = computed(() => selection.value.filter(s => !s.locked))

function selectAll() {
  selectedIds.value = visibleItems.value.map(i => i.snack.id)
}

watch(() => props.activeSnackId, (id) => {
  if (!selectedIds.value.includes(id)) selectedIds.value = [id]
  nextTick(revealActive)
})

onMounted(() => {
  nextTick(() => {
    if (!view.ready) fitAll()
    else revealActive()
  })
})

// ---------- Arrastar manuais (todos os selecionados juntos) e mover o fundo ----------
let drag = null

// Guias inteligentes (snap): alinha bordas e centros com os outros manuais
const guides = ref([])
const SNAP_PX = 6

const guideStyle = (g) => g.axis === 'v'
  ? { left: `${g.pos}px`, top: `${g.from}px`, height: `${g.to - g.from}px`, width: 'calc(1px * var(--inv))' }
  : { top: `${g.pos}px`, left: `${g.from}px`, width: `${g.to - g.from}px`, height: 'calc(1px * var(--inv))' }

function snapMove(dx, dy) {
  const items = drag.items
  const group = new Set(items.map(i => i.s))
  const others = props.snacks.filter(s => !group.has(s))
  const box = (ox, oy) => ({
    x1: Math.min(...items.map(i => i.ox + ox)),
    x2: Math.max(...items.map(i => i.ox + i.s.w + ox)),
    y1: Math.min(...items.map(i => i.oy + oy)),
    y2: Math.max(...items.map(i => i.oy + i.s.h + oy))
  })
  const marks = (a, b) => [a, (a + b) / 2, b]

  const threshold = SNAP_PX / view.z
  const best = { x: null, y: null }
  const b = box(dx, dy)
  for (const o of others) {
    for (const m of marks(b.x1, b.x2)) for (const t of marks(o.x, o.x + o.w)) {
      const d = t - m
      if (Math.abs(d) <= threshold && (best.x === null || Math.abs(d) < Math.abs(best.x))) best.x = d
    }
    for (const m of marks(b.y1, b.y2)) for (const t of marks(o.y, o.y + o.h)) {
      const d = t - m
      if (Math.abs(d) <= threshold && (best.y === null || Math.abs(d) < Math.abs(best.y))) best.y = d
    }
  }

  const fx = Math.round(dx + (best.x ?? 0))
  const fy = Math.round(dy + (best.y ?? 0))
  const f = box(fx, fy)

  // linhas que realmente ficaram alinhadas
  const lines = []
  for (const o of others) {
    for (const m of marks(f.x1, f.x2)) for (const t of marks(o.x, o.x + o.w)) {
      if (Math.abs(t - m) < 1) lines.push({ axis: 'v', pos: t, from: Math.min(f.y1, o.y), to: Math.max(f.y2, o.y + o.h) })
    }
    for (const m of marks(f.y1, f.y2)) for (const t of marks(o.y, o.y + o.h)) {
      if (Math.abs(t - m) < 1) lines.push({ axis: 'h', pos: t, from: Math.min(f.x1, o.x), to: Math.max(f.x2, o.x + o.w) })
    }
  }
  guides.value = lines
  return { fx, fy }
}

function onPointerDown(e) {
  const manualEl = e.target.closest('.manual')

  // Fundo (ou botão do meio) = mover a câmera
  if (e.button === 1 || (e.button === 0 && !manualEl)) {
    e.preventDefault()
    drag = { type: 'pan', moved: false, sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y }
    attach()
    return
  }
  if (e.button !== 0 || !manualEl) return

  const snack = props.snacks.find(s => s.id === Number(manualEl.dataset.id))
  if (!snack) return
  const inSelection = isSelected(snack.id)

  // Shift/Ctrl/Cmd+clique: soma ou tira da seleção
  if (e.shiftKey || e.ctrlKey || e.metaKey) {
    e.preventDefault()
    if (inSelection) {
      selectedIds.value = selection.value.filter(s => s.id !== snack.id).map(s => s.id)
    } else {
      selectedIds.value = [...selection.value.map(s => s.id), snack.id]
      emit('select-snack', snack.id)
    }
    return
  }

  // Clique simples: seleciona só este (a menos que já faça parte de um grupo, para poder arrastar o grupo)
  if (!inSelection) {
    selectedIds.value = [snack.id]
    emit('select-snack', snack.id)
  } else if (props.activeSnackId !== snack.id) {
    emit('select-snack', snack.id)
  }

  e.preventDefault()
  drag = {
    type: 'move', moved: false, collapseTo: snack.id, sx: e.clientX, sy: e.clientY,
    items: targets.value.map(s => ({ s, ox: s.x, oy: s.y }))
  }
  attach()
}

function onPointerMove(e) {
  if (!drag) return
  const px = e.clientX - drag.sx
  const py = e.clientY - drag.sy
  if (!drag.moved && Math.hypot(px, py) < 3) return
  drag.moved = true

  if (drag.type === 'pan') {
    view.x = drag.ox + px
    view.y = drag.oy + py
    return
  }
  const { fx, fy } = snapMove(px / view.z, py / view.z)
  for (const { s, ox, oy } of drag.items) {
    s.x = ox + fx
    s.y = oy + fy
  }
}

function onPointerUp() {
  guides.value = []
  // Clique sem arrastar: sai do grupo e fica só com o manual clicado (ou o ativo, se clicou no fundo)
  if (drag && !drag.moved) {
    if (drag.type === 'move') selectedIds.value = [drag.collapseTo]
    else if (props.activeSnackId != null) selectedIds.value = [props.activeSnackId]
  }
  drag = null
  detach()
}

function attach() {
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}
function detach() {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}
onBeforeUnmount(detach)
</script>

<style scoped>
.workspace {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-panel);
  background-color: var(--canvas-bg);
}

/* Fundo pontilhado: acompanha a câmera (posição e escala) */
.stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
  user-select: none;
  background-image: radial-gradient(var(--border-strong) 1.2px, transparent 1.2px);
}

.stage:active { cursor: grabbing; }

.world {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  transform-origin: 0 0;
  will-change: transform;
}

.empty-hint {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-faint);
  pointer-events: none;
}

/* ---------- Manual (página) ---------- */
.manual {
  position: absolute;
  cursor: pointer;
}

.manual.selected { cursor: move; }
.manual.locked { cursor: default; }

.manual-label {
  position: absolute;
  left: 0;
  bottom: 100%;
  display: flex;
  align-items: center;
  gap: calc(6px * var(--inv));
  max-width: 100%;
  padding-bottom: calc(6px * var(--inv));
  font-size: calc(12px * var(--inv));
  font-weight: 700;
  color: var(--text-muted);
  white-space: nowrap;
  pointer-events: none;
}

.label-index { color: var(--accent); font-weight: 800; }
.label-name { overflow: hidden; text-overflow: ellipsis; }
.manual.selected .label-name { color: var(--text); }

.manual-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 12px 14px;
  background: #fffaf7;
  border-radius: 4px;
  box-shadow: inset 0 0 0 2px var(--accent), 0 10px 30px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.manual.dimmed .manual-sheet { opacity: 0.25; }

/* Cadeado no meio do manual bloqueado (fica fora da folha para não ser esmaecido) */
.sheet-lock {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
  border: 4px solid #fffaf7;
  pointer-events: none;
}
.manual.selected .manual-sheet {
  outline: calc(2px * var(--inv)) solid var(--accent);
  outline-offset: calc(4px * var(--inv));
}

/* Guias inteligentes de alinhamento */
.guide {
  position: absolute;
  z-index: 2000;
  background: #ff3b3b;
  pointer-events: none;
}

/* ---------- Conteúdo da página (igual ao canvas anterior) ---------- */
.canvas-title {
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 900;
  text-align: center;
  border-bottom: 2px solid var(--accent);
  padding-bottom: 12px;
  margin: 6px 0 8px;
  text-transform: uppercase;
  color: #111827;
  width: 100%;
}

.canvas-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.canvas-empty-text {
  margin: auto;
  color: #d1d5db;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.layers-list {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 2px;
  height: 100%;
  min-height: 0;
}

.layer-item {
  display: flex;
  align-items: center;
  flex: 1;
  min-height: 0;
  max-height: 84px;
  width: 100%;
}

.ingredient-img-canvas {
  max-width: 150px;
  height: 100%;
  width: auto;
  object-fit: contain;
  mix-blend-mode: multiply;
  flex-shrink: 1;
  pointer-events: none;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 12px;
  flex: 1;
  min-width: 0;
}

.layer-name {
  font-size: 13px;
  font-weight: 900;
  color: #374151;
  text-transform: uppercase;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.layer-obs {
  font-size: 11px;
  font-weight: 600;
  color: #cc3333;
  font-style: italic;
  margin-top: 2px;
}

/* ---------- Barra flutuante ---------- */
.toolbar {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  padding: 5px;
  width: max-content;
  max-width: calc(100% - 24px);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  font-family: var(--font);
}

.tb-btn, .tb-zoom, .tb-text {
  height: 30px;
  padding: 0 10px;
  background: transparent;
  border: none;
  border-radius: 999px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.tb-btn { width: 30px; padding: 0; font-size: 1rem; }
.tb-zoom { min-width: 52px; color: var(--text-muted); font-variant-numeric: tabular-nums; }

.tb-btn:hover:not(:disabled), .tb-zoom:hover, .tb-text:hover { background: var(--border); }
.tb-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.tb-text.on { background: var(--accent-soft); color: var(--accent); }

</style>
