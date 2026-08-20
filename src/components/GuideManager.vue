<template>
  <aside class="guide-settings-sidebar">
    
    <!-- SEÇÃO 1: PÁGINAS DO GUIA -->
    <section class="sidebar-section pages-section">
      <header class="section-header">
        <h3 class="section-title">📄 PÁGINAS DO GUIA</h3>
        <p class="section-subtitle">Organize a ordem dos lanches</p>
      </header>

      <div class="pages-list">
        <!-- Usando VueDraggablePlus para reordenar a lista -->
        <VueDraggable 
          v-model="pages" 
          ghost-class="ghost-page"
          :animation="200"
        >
          <div 
            v-for="(page, index) in pages" 
            :key="page.id" 
            class="page-item"
            :class="{ 'active-page': page.id === activePageId }"
            @click="setActivePage(page.id)"
          >
            <!-- Ícone de arraste -->
            <div class="drag-handle">⋮⋮</div>
            
            <!-- Nome da Página -->
            <div class="page-info">
              <span class="page-name">{{ page.number }} - {{ page.name }}</span>
            </div>
            
            <!-- Ações (Edit / Delete) com .stop para não conflitar com o Drag -->
            <div class="page-actions">
              <button @click.stop="editPage(page.id)" class="icon-btn" title="Editar">✎</button>
              <button @click.stop="deletePage(index)" class="icon-btn delete-btn" title="Excluir">🗑️</button>
            </div>
          </div>
        </VueDraggable>
      </div>

      <button class="add-snack-btn">
        + Adicionar Lanche
      </button>
    </section>

    <!-- SEÇÃO 2: CONFIGURAÇÕES DO GUIA -->
    <section class="sidebar-section settings-section">
      <header class="section-header flex-between">
        <h3 class="section-title">CONFIGURAÇÕES DO GUIA</h3>
        <button class="icon-btn add-btn">+</button>
      </header>

      <!-- Layout do Card -->
      <div class="setting-group">
        <label class="setting-label">Layout do Card</label>
        <div class="layout-options">
          <button class="layout-btn active">📄</button>
          <button class="layout-btn">🪟</button>
          <button class="layout-btn">🗂️</button>
        </div>
      </div>

      <!-- Fundo do Card -->
      <div class="setting-group">
        <label class="setting-label">Fundo do Card</label>
        <div class="color-options">
          <button class="color-circle bg-dark active"></button>
          <button class="color-circle bg-black"></button>
          <button class="color-circle bg-white"></button>
          <button class="color-circle bg-texture"></button>
          <button class="color-circle add-color">+</button>
        </div>
      </div>

      <!-- Fonte do Título -->
      <div class="setting-group">
        <label class="setting-label">Fonte do Título</label>
        <div class="select-wrapper">
          <select v-model="selectedFont" class="dark-select">
            <option value="Bebas Neue">Bebas Neue</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Roboto">Roboto</option>
          </select>
        </div>
      </div>

      <!-- Cor do Título -->
      <div class="setting-group">
        <label class="setting-label">Cor do Título</label>
        <div class="color-options">
          <button class="color-circle color-orange active"></button>
          <button class="color-circle color-white"></button>
          <button class="color-circle color-gray"></button>
          <button class="color-circle color-red"></button>
        </div>
      </div>

    </section>

  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'

// --- ESTADO DAS PÁGINAS ---
const activePageId = ref(1) // ID do lanche atualmente selecionado

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

const editPage = (id) => {
  console.log('Editando página', id)
}

// --- ESTADO DAS CONFIGURAÇÕES ---
const selectedFont = ref('Bebas Neue')

</script>

<style scoped>
/* Container Principal */
.guide-settings-sidebar {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 350px; /* Largura baseada na proporção da imagem */
  background-color: #121212;
  color: #ffffff;
  padding: 20px;
  box-sizing: border-box;
  font-family: sans-serif;
  border-left: 1px solid #222; /* Divisória sutil se houver algo à esquerda */
}

/* Seções Gerais */
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-header.flex-between {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
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

/* --- LISTA DE PÁGINAS --- */
.pages-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-item {
  display: flex;
  align-items: center;
  background-color: transparent;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  cursor: grab;
  transition: all 0.2s;
}

.page-item:active {
  cursor: grabbing;
}

/* Estado Ativo (Lanche selecionado na imagem) */
.page-item.active-page {
  border-color: #f38b41;
}

.page-item.active-page .page-name {
  color: #f38b41;
}

.ghost-page {
  opacity: 0.4;
  background-color: #222;
  border: 1px dashed #666;
}

.drag-handle {
  color: #555;
  margin-right: 12px;
  font-size: 1.2rem;
}

.page-info {
  flex-grow: 1;
}

.page-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: #ccc;
  transition: color 0.2s;
}

.page-actions {
  display: flex;
  gap: 8px;
}

/* Botões */
.icon-btn {
  background: transparent;
  border: none;
  color: #777;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  transition: color 0.2s;
}

.icon-btn:hover {
  color: #fff;
}

.add-snack-btn {
  background-color: transparent;
  border: 1px solid #333;
  color: #ccc;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.add-snack-btn:hover {
  background-color: #1e1e1e;
  border-color: #555;
}

/* --- CONFIGURAÇÕES --- */
.setting-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
}

.setting-label {
  font-size: 0.75rem;
  color: #a0a0a0;
}

/* Layout Options */
.layout-options {
  display: flex;
  gap: 12px;
}

.layout-btn {
  width: 48px;
  height: 48px;
  background-color: transparent;
  border: 1px solid #333;
  border-radius: 6px;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.layout-btn.active {
  border-color: #f38b41;
  color: #f38b41;
}

/* Color Circles */
.color-options {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.color-circle.active {
  border-color: #f38b41;
  padding: 2px;
  background-clip: content-box;
}

/* Cores específicas de Fundo */
.bg-dark { background-color: #1a1a1a; }
.bg-black { background-color: #000000; }
.bg-white { background-color: #ffffff; }
.bg-texture { background-color: #8b5a2b; /* Marrom imitando madeira da imagem */ }

/* Cores específicas de Título */
.color-orange { background-color: #d19a22; }
.color-white { background-color: #ffffff; }
.color-gray { background-color: #444444; }
.color-red { background-color: #a52a2a; }

.add-color {
  background: transparent;
  border: 1px dashed #666;
  color: #666;
  font-size: 1rem;
}

/* Select de Fonte */
.select-wrapper {
  background-color: #1e1e1e;
  border-radius: 6px;
  border: 1px solid #333;
  padding: 0 12px;
}

.dark-select {
  width: 100%;
  background: transparent;
  border: none;
  color: #ccc;
  padding: 10px 0;
  outline: none;
  font-size: 0.85rem;
  appearance: none; /* Remove seta padrão do navegador em alguns casos */
}
</style>