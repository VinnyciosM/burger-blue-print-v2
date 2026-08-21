<template>
  <aside class="guide-settings-sidebar">
    
    <!-- DIV 1: GERENCIAMENTO DE PÁGINAS -->
    <div class="top-content">
      <section class="sidebar-section pages-section">
        <header class="section-header">
          <h3 class="section-title">📄 PÁGINAS DO GUIA</h3>
          <p class="section-subtitle">Selecione o lanche para editar</p>
        </header>

        <!-- Lista de Páginas -->
        <div class="pages-list">
          <div 
            v-for="(page, index) in pages" 
            :key="page.id" 
            class="page-item"
            :class="{ 'active-page': page.id === activePageId }"
            @click="setActivePage(page.id)"
          >
            <div class="page-main-row">
              <div class="info-area">
                <span class="index">#{{ index + 1 }}</span>
                <span class="name">{{ page.name }}</span>
              </div>
              
              <button @click.stop="deletePage(index)" class="btn-delete-full" title="Excluir Lanche">
                ✕
              </button>
            </div>
          </div>
        </div>

        <button class="add-snack-btn">
          + Adicionar Lanche
        </button>
      </section>
    </div>

    <!-- DIV 2: RESUMO E MODO DE IMPRESSÃO -->
    <div class="bottom-content">
      <div class="summary-card">
        <div class="summary-row">
          <span class="summary-label">Total de Lanches</span>
          <span class="summary-value">{{ pages.length }}</span>
        </div>
      </div>

      <section class="sidebar-section print-section">
        <header class="section-header">
          <h3 class="section-title">🖨️ MODO DE IMPRESSÃO</h3>
          <p class="section-subtitle">Ajuste o layout e gere o PDF</p>
        </header>

        <div class="print-actions">
          <button @click="openPrintMode" class="primary-btn">
            Visualizar Impressão
            <span class="arrow-icon">→</span>
          </button>
        </div>
      </section>
    </div>

  </aside>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['open-print-mode']) //[cite: 5]

const activePageId = ref(1)

const pages = ref([
  { id: 1, number: '01', name: 'Alasca Burguer' },
  { id: 2, number: '02', name: 'Cheddar Bacon' },
  { id: 3, number: '03', name: 'Smash Duplo' },
  { id: 4, number: '04', name: 'Chicken Crispy' },
  { id: 5, number: '05', name: 'BBQ Burguer' },
  { id: 6, number: '06', name: 'Veggie Burguer' }
])

const setActivePage = (id) => {
  activePageId.value = id
}

const deletePage = (index) => {
  pages.value.splice(index, 1)
}

const openPrintMode = () => {
  emit('open-print-mode') //[cite: 5]
}
</script>

<style scoped>
/* Reset de Botão Padrão */
button {
  background-color: transparent;
}

.guide-settings-sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
  width: 350px;
  height: 100vh;
  background-color: #121212;
  color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  font-family: sans-serif;
  border-left: 1px solid #222;
}

.top-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}

.bottom-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: #a0a0a0;
  margin: 0;
  text-transform: uppercase;
}

.section-subtitle {
  font-size: 0.7rem;
  color: #666;
  margin: 0;
}

.pages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 4px;
}

.pages-list::-webkit-scrollbar { width: 6px; }
.pages-list::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

.page-item {
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  border: 1px solid #2a2a2a;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
}

.page-item:hover {
  border-color: #444;
}

.page-item.active-page {
  border-color: #f38b41;
}

.page-item.active-page .name {
  color: #f38b41;
}

.page-main-row {
  display: flex;
  align-items: center;
  padding: 0 0 0 12px;
  height: 48px;
  width: 100%;
  box-sizing: border-box;
}

.info-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.index {
  font-size: 9px;
  font-weight: 800;
  color: #fb923c;
  min-width: 18px;
}

.name {
  font-size: 10px;
  font-weight: 800;
  color: #e5e5e5;
  text-transform: uppercase;
  transition: color 0.2s;
}

.btn-delete-full {
  width: 45px;
  height: 100%;
  border: none;
  color: #777;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-left: 1px solid #2a2a2a;
  background-color: #161616;
}

.btn-delete-full:hover {
  color: #cc3333;
  background-color: #111;
}

.add-snack-btn {
  background-color: transparent;
  border: 1px dashed #444;
  color: #888;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-top: 4px;
}

.add-snack-btn:hover {
  background-color: #1e1e1e;
  border-color: #666;
  color: #ccc;
}

.summary-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 0.75rem;
  color: #888;
  font-weight: 500;
}

.summary-value {
  font-size: 0.85rem;
  color: #f38b41;
  font-weight: 800;
}

.print-section {
  padding-top: 20px;
  border-top: 1px solid #222;
}

.primary-btn {
  width: 100%;
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

.primary-btn:hover {
  background-color: #d17530;
}

.primary-btn:active {
  transform: scale(0.98);
}

.arrow-icon {
  font-size: 1.1rem;
}
</style>