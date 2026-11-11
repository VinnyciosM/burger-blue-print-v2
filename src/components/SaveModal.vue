<template>
  <div class="overlay" @mousedown.self="$emit('close')">
    <section class="modal" role="dialog" aria-label="Salvar manual">
      <header class="top">
        <h3>Salvar manual</h3>
        <button class="close" aria-label="Fechar" @click="$emit('close')"><Icon name="x" :size="16" /></button>
      </header>

      <div class="formats" role="tablist" aria-label="Formato">
        <button v-for="f in FORMATS" :key="f.id" role="tab" class="format" :aria-selected="format === f.id"
          :class="{ active: format === f.id }" @click="format = f.id">
          <span class="format-title">{{ f.label }}</span>
          <span class="format-hint">{{ f.hint }}</span>
        </button>
      </div>

      <!-- PDF -->
      <div v-if="format === 'pdf'" class="panel">
        <p class="text">
          Abre a janela de impressão do navegador. Escolha “Salvar como PDF” como destino e, em “Mais definições”,
          deixe as margens em “Nenhuma”.
        </p>
        <div class="actions">
          <button type="button" class="btn" @click="$emit('close')">Cancelar</button>
          <button type="button" class="btn primary" @click="$emit('generate-pdf')">
            <Icon name="download" :size="15" /> Gerar PDF
          </button>
        </div>
      </div>

      <!-- PNG -->
      <div v-else class="panel">
        <div class="png-head">
          <span class="label">Folhas a salvar</span>
          <span class="links">
            <button type="button" class="link" @click="selectedPages = null">Todas</button>
            <button type="button" class="link" @click="selectedPages = []">Nenhuma</button>
          </span>
        </div>

        <div class="pages" role="group" aria-label="Folhas a salvar">
          <button v-for="n in sheetCount" :key="n" type="button" class="page"
            :class="{ active: isSelected(n - 1) }" :aria-pressed="isSelected(n - 1)" :title="`Folha ${n}`"
            @click="toggle(n - 1)">{{ n }}</button>
        </div>

        <p v-if="pngState.busy" class="status">Gerando PNG {{ pngState.done }} de {{ pngState.total }}...</p>
        <p v-else-if="pngState.error" class="status error">{{ pngState.error }}</p>
        <p v-else class="status">
          Um arquivo por folha, em alta qualidade (300 DPI). O navegador pode pedir permissão para baixar vários arquivos.
        </p>

        <div class="actions">
          <button type="button" class="btn" :disabled="pngState.busy || chosen.length === 0"
            @click="$emit('export-png', chosen)">Salvar selecionadas ({{ chosen.length }})</button>
          <button type="button" class="btn primary" :disabled="pngState.busy" @click="$emit('export-png', all)">
            Salvar todas ({{ sheetCount }})
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  sheetCount: { type: Number, default: 1 },
  pngState: { type: Object, default: () => ({ busy: false, done: 0, total: 0, error: '' }) }
})
const emit = defineEmits(['close', 'generate-pdf', 'export-png'])

const FORMATS = [
  { id: 'pdf', label: 'PDF', hint: 'Um documento pronto para imprimir' },
  { id: 'png', label: 'PNG', hint: 'Uma imagem por folha' }
]
const format = ref('pdf')

// Folhas escolhidas (null = todas marcadas, que é o começo)
const selectedPages = ref(null)
const all = computed(() => Array.from({ length: props.sheetCount }, (_, i) => i))
const chosen = computed(() =>
  selectedPages.value === null ? all.value : selectedPages.value.filter(i => i < props.sheetCount).sort((a, b) => a - b)
)
const isSelected = (i) => chosen.value.includes(i)
const toggle = (i) => {
  selectedPages.value = isSelected(i) ? chosen.value.filter(x => x !== i) : [...chosen.value, i]
}

const onKey = (e) => { if (e.key === 'Escape') emit('close') }
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

.modal {
  width: 440px;
  max-width: calc(100vw - 32px);
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  color: var(--text);
}

.top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
h3 { margin: 0; font-size: 1.15rem; }

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

.formats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 18px; }

.format {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  text-align: left;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s;
}
.format:hover { border-color: var(--border-strong); }
.format.active { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.format-title { font-size: 0.9rem; font-weight: 800; }
.format-hint { font-size: 0.68rem; color: var(--text-faint); line-height: 1.25; }

.panel { display: flex; flex-direction: column; gap: 12px; }

.text, .status { margin: 0; font-size: 0.78rem; line-height: 1.45; color: var(--text-muted); }
.status { font-size: 0.72rem; }
.status.error { color: #ff6b6b; }

.png-head { display: flex; justify-content: space-between; align-items: baseline; }
.label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); }
.links { display: flex; gap: 12px; }

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

.pages { display: flex; flex-wrap: wrap; gap: 6px; max-height: 160px; overflow-y: auto; }

.page {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.page:hover { border-color: var(--border-strong); color: var(--text); }
.page.active { background: var(--accent-soft); border-color: var(--accent); color: var(--text); }

.actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}
.btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
.btn.primary:hover:not(:disabled) { color: var(--on-accent); filter: brightness(1.08); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
