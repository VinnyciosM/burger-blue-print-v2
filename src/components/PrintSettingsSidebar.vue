<template>
  <aside class="print-settings-sidebar">
    
    <!-- Botão de Voltar -->
    <button @click="$emit('back-to-edit')" class="btn-back">
      ← Voltar para edição
    </button>

    <header class="sidebar-header">
      <h3 class="sidebar-title">CONFIGURAÇÕES DE IMPRESSÃO</h3>
    </header>

    <div class="settings-content">
      
      <!-- Papel -->
      <div class="setting-group">
        <label class="setting-label">Papel</label>
        <div class="select-wrapper">
          <span class="select-icon">📄</span>
          <select v-model="settings.paper" class="dark-select">
            <option value="a4">A4 (210 x 297 mm)</option>
            <option value="letter">Carta (216 x 279 mm)</option>
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
            📄 Retrato
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: settings.orientation === 'landscape' }"
            @click="settings.orientation = 'landscape'"
          >
            🖺 Paisagem
          </button>
        </div>
      </div>

      <!-- Guias por folha -->
      <div class="setting-group">
        <label class="setting-label">Guias por folha</label>
        <div class="grid-buttons">
          <button 
            v-for="num in [1, 2, 4, 6]" 
            :key="num"
            class="grid-btn"
            :class="{ active: settings.itemsPerPage === num }"
            @click="settings.itemsPerPage = num"
          >
            {{ num }}
          </button>
          <button 
            class="grid-btn"
            :class="{ active: settings.itemsPerPage === 'custom' }"
            @click="settings.itemsPerPage = 'custom'"
          >
            Personalizado
          </button>
        </div>
        <p class="setting-help">Escolha quantos guias serão impressos em cada folha.</p>
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
          <label class="setting-label">Linhas de corte</label>
          <p class="setting-help">Exibir linhas pontilhadas para corte</p>
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
        📥 GERAR PDF
      </button>
      
      <div class="info-box">
        <span class="info-icon">ℹ️</span>
        <p>Após ajustar as configurações, confira a pré-visualização e depois gere o PDF.</p>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { reactive, watch } from 'vue'

const emit = defineEmits(['update-settings', 'back-to-edit', 'generate-pdf']) //[cite: 6]

const settings = reactive({
  paper: 'a4',
  orientation: 'landscape',
  itemsPerPage: 4,
  margins: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
  },
  spacing: 8,
  showCutLines: true
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
  height: 100vh;
  background-color: #121212;
  color: #ffffff;
  padding: 24px 20px;
  box-sizing: border-box;
  font-family: sans-serif;
  border-left: 1px solid #222;
  overflow-y: auto;
}

.print-settings-sidebar::-webkit-scrollbar { width: 6px; }
.print-settings-sidebar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

.btn-back {
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
  margin-bottom: 24px;
  transition: all 0.2s;
  width: fit-content;
}

.btn-back:hover {
  background: #1e1e1e;
  color: #fff;
  border-color: #555;
}

.sidebar-header { margin-bottom: 24px; }

.sidebar-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: #e5e5e5;
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
  color: #e5e5e5;
}

.setting-help {
  font-size: 0.7rem;
  color: #888;
  margin: 0;
  line-height: 1.4;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 0 12px;
}

.select-icon { margin-right: 8px; font-size: 1rem; }

.dark-select {
  flex-grow: 1;
  background: transparent;
  border: none;
  color: #fff;
  padding: 12px 0;
  outline: none;
  font-size: 0.85rem;
  cursor: pointer;
  appearance: auto;
}

.toggle-group {
  display: flex;
  gap: 0;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
}

.toggle-btn {
  flex: 1;
  background-color: #1e1e1e;
  border: none;
  border-right: 1px solid #333;
  color: #888;
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

.toggle-btn:last-child { border-right: none; }
.toggle-btn.active {
  background-color: #1a1a1a;
  color: #f38b41;
  border-bottom: 2px solid #f38b41;
}

.grid-buttons { display: flex; gap: 8px; }

.grid-btn {
  background-color: #1e1e1e;
  border: 1px solid #333;
  color: #ccc;
  padding: 10px 0;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  text-align: center;
}

.grid-btn:last-child { flex: 2; }
.grid-btn.active { border-color: #f38b41; color: #f38b41; }

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

.margin-input label { font-size: 0.65rem; color: #888; }

.dark-input {
  width: 100%;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  padding: 10px 8px;
  box-sizing: border-box;
  font-size: 0.85rem;
  text-align: center;
  outline: none;
}

.dark-input:focus { border-color: #f38b41; }

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
  background: #333;
  border-radius: 2px;
  outline: none;
}

.orange-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f38b41;
  cursor: pointer;
  border: 2px solid #121212;
}

.slider-value-box {
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
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

.switch input { opacity: 0; width: 0; height: 0; }

.slider.round {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #333;
  transition: .4s;
  border-radius: 24px;
}

.slider.round:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background-color: #aaa;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider.round { background-color: #f38b41; }
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
  background-color: #f38b41;
  color: #121212;
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

.btn-generate-pdf:hover { background-color: #d17530; }
.btn-generate-pdf:active { transform: scale(0.98); }

.info-box {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-icon { font-size: 1.1rem; }

.info-box p {
  margin: 0;
  font-size: 0.7rem;
  color: #888;
  line-height: 1.4;
}
</style>