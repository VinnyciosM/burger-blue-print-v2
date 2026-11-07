<template>
  <aside class="print-settings-sidebar">
    
    <!-- Botão de Voltar -->
    <button @click="$emit('back-to-edit')" class="btn-back">
      <Icon name="arrow-left" :size="14" /> Voltar para edição
    </button>

    <header class="sidebar-header">
      <h3 class="sidebar-title">CONFIGURAÇÕES DE IMPRESSÃO</h3>
    </header>

    <div class="settings-content">
      
      <!-- Papel -->
      <div class="setting-group">
        <label class="setting-label">Papel</label>
        <div class="select-wrapper">
          <span class="select-icon"><Icon name="portrait" :size="16" /></span>
          <select v-model="settings.paper" class="dark-select" disabled title="Por enquanto apenas A4">
            <option value="a4">A4 (210 x 297 mm)</option>
          </select>
        </div>
      </div>

      <!-- Orientação -->
      <div class="setting-group">
        <label class="setting-label">Orientação</label>
        <div class="toggle-group">
          <button 
            class="toggle-btn" 
            :class="{ active: settings.orientation === 'portrait' }"
            @click="settings.orientation = 'portrait'"
          >
            <Icon name="portrait" :size="15" /> Retrato
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: settings.orientation === 'landscape' }"
            @click="settings.orientation = 'landscape'"
          >
            <Icon name="landscape" :size="15" /> Paisagem
          </button>
        </div>
      </div>

      <!-- Guias por folha -->
      <div class="setting-group">
        <label class="setting-label">Guias por folha</label>
        <div class="grid-buttons">
          <button 
            v-for="num in [1, 2, 3]" 
            :key="num"
            class="grid-btn"
            :class="{ active: settings.itemsPerPage === num, disabled: isBlocked(num) }"
            :disabled="isBlocked(num)"
            :title="isBlocked(num) ? 'Em retrato só cabem 2 guias por folha' : ''"
            @click="settings.itemsPerPage = num"
          >
            {{ num }}
          </button>
        </div>
        <p class="setting-help">{{ snackCount }} {{ snackCount === 1 ? 'lanche' : 'lanches' }} em {{ sheetCount }} {{ sheetCount === 1 ? 'folha' : 'folhas' }}. Cada guia ocupa 1/3 da folha e fica centralizado.</p>
      </div>

      <!-- Margens -->
      <div class="setting-group">
        <label class="setting-label">Margens (mm)</label>
        <div class="margins-grid">
          <div class="margin-input">
            <label>Superior</label>
            <input type="number" v-model="settings.margins.top" class="dark-input" />
          </div>
          <div class="margin-input">
            <label>Inferior</label>
            <input type="number" v-model="settings.margins.bottom" class="dark-input" />
          </div>
          <div class="margin-input">
            <label>Esquerda</label>
            <input type="number" v-model="settings.margins.left" class="dark-input" />
          </div>
          <div class="margin-input">
            <label>Direita</label>
            <input type="number" v-model="settings.margins.right" class="dark-input" />
          </div>
        </div>
      </div>

      <!-- Espaçamento -->
      <div class="setting-group">
        <label class="setting-label">Espaçamento entre guias (mm)</label>
        <div class="slider-group">
          <input 
            type="range" 
            min="0" max="20" 
            v-model="settings.spacing" 
            class="orange-slider"
          />
          <div class="slider-value-box">
            {{ settings.spacing }}
          </div>
        </div>
      </div>

      <!-- Linhas de corte -->
      <div class="setting-group switch-group">
        <div class="switch-texts">
          <label class="setting-label">Serrilhado de corte</label>
          <p class="setting-help">Mostra a borda pontilhada de cada guia</p>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="settings.showCutLines">
          <span class="slider round"></span>
        </label>
      </div>

    </div>

    <!-- Rodapé -->
    <div class="sidebar-footer">
      <button @click="$emit('generate-pdf')" class="btn-generate-pdf">
        <Icon name="download" :size="16" /> GERAR PDF
      </button>
      
      <div class="info-box">
        <span class="info-icon"><Icon name="info" :size="16" /></span>
        <p>Na janela de impressão que abrir, escolha “Salvar como PDF” como destino. Em “Mais definições”, deixe as margens em “Nenhuma”.</p>
      </div>
    </div>

  </aside>
</template>

<script setup>
import Icon from './Icon.vue'
import { reactive, watch, computed } from 'vue'

const props = defineProps({
  snackCount: { type: Number, default: 0 }
})

const emit = defineEmits(['update-settings', 'back-to-edit', 'generate-pdf']) //[cite: 6]

const settings = reactive({
  paper: 'a4',
  orientation: 'landscape',
  itemsPerPage: 3,
  margins: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
  },
  spacing: 8,
  showCutLines: true
})

const sheetCount = computed(() => Math.max(1, Math.ceil(props.snackCount / Number(settings.itemsPerPage || 3))))

// Em retrato só cabem 2 guias por folha: o botão "3" fica bloqueado
const isBlocked = (num) => num === 3 && settings.orientation === 'portrait'

// Cada orientação guarda as suas próprias margens: ao trocar, as margens da outra são restauradas
const MARGINS = {
  landscape: { top: 10, bottom: 10, left: 10, right: 10 },
  portrait: { top: 15, bottom: 15, left: 12, right: 12 }
}
const savedMargins = { landscape: { ...MARGINS.landscape }, portrait: { ...MARGINS.portrait } }

watch(() => settings.orientation, (next, previous) => {
  savedMargins[previous] = { ...settings.margins }
  Object.assign(settings.margins, savedMargins[next])
})

watch(() => settings.orientation, (orientation) => {
  if (orientation === 'portrait' && Number(settings.itemsPerPage) > 2) settings.itemsPerPage = 2
})

watch(settings, (newSettings) => {
  emit('update-settings', newSettings) //[cite: 6]
}, { deep: true })

</script>

<style scoped>
.print-settings-sidebar {
  display: flex;
  flex-direction: column;
  width: 350px;
  height: 100%;
  background-color: var(--surface);
  color: var(--text);
  padding: 24px 20px;
  box-sizing: border-box;
  font-family: var(--font);
  border-left: 1px solid var(--border);
  overflow-y: auto;
}

.print-settings-sidebar::-webkit-scrollbar { width: 6px;}
.print-settings-sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px;}

.btn-back {
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
  margin-bottom: 24px;
  transition: all 0.2s;
  width: fit-content;
}

.btn-back:hover {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border-strong);
}

.sidebar-header { margin-bottom: 24px;}

.sidebar-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex-grow: 1;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
}

.setting-help {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0 12px;
}

.select-icon { margin-right: 8px; font-size: 1rem;}

.dark-select {
  flex-grow: 1;
  background: transparent;
  border: none;
  color: var(--text);
  padding: 12px 0;
  outline: none;
  font-size: 0.85rem;
  cursor: pointer;
  appearance: auto;
}

.toggle-group {
  display: flex;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.toggle-btn {
  flex: 1;
  background-color: var(--surface);
  border: none;
  border-right: 1px solid var(--border);
  color: var(--text-muted);
  padding: 10px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.toggle-btn:last-child { border-right: none;}
.toggle-btn.active {
  background-color: var(--surface);
  color: var(--accent);
  border-bottom: 2px solid var(--accent);
}

.grid-buttons { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;}

.grid-btn {
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 10px 0;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.grid-btn:disabled, .grid-btn.disabled { opacity: 0.35; cursor: not-allowed; }
.grid-btn.active { border-color: var(--accent); color: var(--accent);}

.margins-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.margin-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.margin-input label { font-size: 0.65rem; color: var(--text-muted);}

.dark-input {
  width: 100%;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 10px 8px;
  box-sizing: border-box;
  font-size: 0.85rem;
  text-align: center;
  outline: none;
}

.dark-input:focus { border-color: var(--accent);}

.slider-group {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}

.orange-slider {
  flex-grow: 1;
  -webkit-appearance: none;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  outline: none;
}

.orange-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--surface);
}

.slider-value-box {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  min-width: 24px;
  text-align: center;
}

.switch-group {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.switch-texts {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.switch input { opacity: 0; width: 0; height: 0;}

.slider.round {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--border);
  transition: .4s;
  border-radius: 24px;
}

.slider.round:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background-color: var(--text-faint);
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider.round { background-color: var(--accent);}
input:checked + .slider.round:before {
  transform: translateX(20px);
  background-color: #fff;
}

.sidebar-footer {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-generate-pdf {
  background-color: var(--accent);
  color: var(--on-accent);
  border: none;
  padding: 14px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-generate-pdf:hover { background-color: var(--accent-hover);}
.btn-generate-pdf:active { transform: scale(0.98);}

.info-box {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-icon { font-size: 1.1rem;}

.info-box p {
  margin: 0;
  font-size: 0.7rem;
  color: var(--text-muted);
  line-height: 1.4;
}
</style>