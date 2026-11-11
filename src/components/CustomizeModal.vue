<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <section class="customize" role="dialog" aria-label="Personalização da biblioteca">
      <header class="top">
        <h2>Personalização da biblioteca</h2>
        <button class="close" aria-label="Fechar" @click="$emit('close')"><Icon name="x" :size="16" /></button>
      </header>

      <div class="body">
        <!-- 1. Ordem das categorias -->
        <section class="block">
          <div class="block-head">
            <h3>Ordem das categorias</h3>
            <button class="link" :disabled="!librarySettings.order.length" @click="confirmingReset = true">Restaurar</button>
          </div>
          <p class="drag-hint">Arraste para mudar a ordem.</p>
          <VueDraggable v-model="orderedCategories" tag="ul" class="order-list" ghost-class="ghost" :animation="200">
            <li v-for="(cat, i) in orderedCategories" :key="cat.id" class="order-row">
              <Icon name="grip" :size="16" class="grip" />
              <span class="order-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="order-name">{{ cat.name }}</span>
            </li>
          </VueDraggable>
        </section>

        <!-- 2. Estilo de exibição -->
        <section class="block">
          <h3>Estilo de exibição</h3>
          <div class="options" role="radiogroup" aria-label="Estilo de exibição">
            <button v-for="v in VIEW_STYLES" :key="v.id" class="option" role="radio"
              :aria-checked="librarySettings.view === v.id" :class="{ active: librarySettings.view === v.id }"
              @click="librarySettings.view = v.id">
              <span class="option-title">{{ v.label }}</span>
              <span class="option-hint">{{ v.hint }}</span>
            </button>
          </div>
        </section>

        <!-- 3. Comportamento -->
        <section class="block">
          <h3>Comportamento</h3>
          <label class="switch-row">
            <span>
              <span class="switch-title">Permitir recolher e expandir categorias</span>
              <span class="switch-hint">Clique no título da categoria para esconder ou mostrar os itens</span>
            </span>
            <input v-model="librarySettings.collapsible" type="checkbox" role="switch" class="switch" />
          </label>
          <label class="switch-row">
            <span>
              <span class="switch-title">Mostrar quantidade de ingredientes</span>
              <span class="switch-hint">Número de itens ao lado do nome de cada categoria</span>
            </span>
            <input v-model="librarySettings.showCount" type="checkbox" role="switch" class="switch" />
          </label>
        </section>
      </div>
    </section>

    <ConfirmModal v-if="confirmingReset" title="Restaurar ordem das categorias?"
      message="A ordem que você escolheu será perdida e as categorias voltam à ordem original."
      confirm-label="Restaurar" @confirm="doReset" @cancel="confirmingReset = false" />
  </div>
</template>

<script setup>
import Icon from './Icon.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import ConfirmModal from './ConfirmModal.vue'
import { allCategoryIds, labelFor } from '../customIngredients.js'
import { VueDraggable } from 'vue-draggable-plus'
import { librarySettings, VIEW_STYLES, sortCategoryIds, resetCategoryOrder } from '../librarySettings.js'

const emit = defineEmits(['close'])

const orderedCategories = computed({
  get: () => sortCategoryIds(allCategoryIds.value).map(id => ({ id, name: labelFor(id) })),
  set: (list) => { librarySettings.order = list.map(c => c.id) }
})

const confirmingReset = ref(false)

function doReset() {
  resetCategoryOrder()
  confirmingReset.value = false
}

const onKey =(e) => { if (e.key === 'Escape') emit('close') }
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.55);
  font-family: var(--font);
}

.customize {
  display: flex;
  flex-direction: column;
  width: 560px;
  max-width: calc(100vw - 32px);
  height: min(800px, calc(100vh - 48px));
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  color: var(--text);
}

.top {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

h2 { margin: 0; font-size: 1.15rem; }

h3 {
  margin: 0 0 10px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
}
.close:hover { color: var(--text); border-color: var(--border-strong); }

.body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
}

.block + .block {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.block-head { display: flex; justify-content: space-between; align-items: baseline; }
.block-head h3 { margin-bottom: 10px; }

.link {
  background: none;
  border: none;
  padding: 0;
  color: var(--accent);
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
}
.link:disabled { color: var(--text-faint); cursor: default; }

.order-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }

.drag-hint { margin: -4px 0 10px; font-size: 0.7rem; color: var(--text-faint); }

.order-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: grab;
  user-select: none;
}
.order-row:active { cursor: grabbing; }
.order-row.ghost { opacity: 0.4; border-color: var(--accent); }
.grip { color: var(--text-faint); }
.order-num {
  min-width: 20px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
.order-name { flex: 1; font-size: 0.82rem; font-weight: 600; }

.options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }

.option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  text-align: left;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}
.option:hover { border-color: var(--border-strong); }
.option.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.option-title { font-size: 0.8rem; font-weight: 700; }
.option-hint { font-size: 0.66rem; color: var(--text-faint); line-height: 1.25; }

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  cursor: pointer;
}
.switch-title { display: block; font-size: 0.82rem; font-weight: 600; }
.switch-hint { display: block; margin-top: 2px; font-size: 0.7rem; color: var(--text-faint); }

.switch {
  appearance: none;
  flex-shrink: 0;
  position: relative;
  width: 38px;
  height: 22px;
  margin: 0;
  background: var(--border-strong);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s;
}
.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s;
}
.switch:checked { background: var(--accent); }
.switch:checked::after { transform: translateX(16px); }
.switch:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
</style>
