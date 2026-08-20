<script setup>

import { ref } from 'vue'
// Importando o componente correto
import { VueDraggable } from 'vue-draggable-plus'

const snackName = ref('01 - Alasca Burguer')

const ingredients = ref([
    { id: 1, name: 'Pão Brioche', obs: '' },
    { id: 2, name: 'Molho Alasca', obs: 'Obs: Molho especial da casa' },
    { id: 3, name: 'Bacon', obs: '' },
    { id: 4, name: 'Queijo Cheddar', obs: '' },
    { id: 5, name: 'Carne 180g', obs: 'Obs: Ponto da carne: ao ponto' },
    { id: 6, name: 'Alface', obs: '' },
    { id: 7, name: 'Tomate', obs: '' },
    { id: 8, name: 'Cebola Roxa', obs: '' },
    { id: 9, name: 'Picles', obs: '' }
])

const removeIngredient = (index) => {
    ingredients.value.splice(index, 1)
}
</script>

<template>
    <div class="product-editor">

        <!-- COLUNA ESQUERDA: Edição e Ingredientes -->
        <div class="editor-sidebar">

            <!-- Lanche Atual -->
            <section class="section-block">
                <h3 class="section-title">LANCHE ATUAL</h3>
                <div class="input-group">
                    <input type="text" v-model="snackName" class="dark-input" />
                    <button class="icon-btn" aria-label="Editar">
                        <!-- Ícone de Lápis (placeholder) -->
                        ✎
                    </button>
                </div>
            </section>

            <!-- Ingredientes do Lanche -->
            <section class="section-block flex-grow">
                <h3 class="section-title">INGREDIENTES DO LANCHE</h3>
                <p class="section-subtitle">Reordene arrastando os itens</p>

                <div class="ingredients-list">
                    <VueDraggable v-model="ingredients" ghost-class="ghost-item" :animation="200">
                        <div v-for="(item, index) in ingredients" :key="item.id" class="ingredient-item">
        
                            <div class="info-area">
                                <span class="index">#</span>
                                <span class="name">{{ item.name }}</span>
                            </div>

                            <img src="" alt="" class="ingredient-img" />

                            <button @click.stop="removeIngredient(index)" class="icon-btn delete-btn"
                                aria-label="Remover">✕</button>
                        </div>
                    </VueDraggable>
                </div>
            </section>
        </div>

        <!-- COLUNA DIREITA: Canvas -->
        <div class="editor-main">
            <div class="canvas-area light-canvas">

                <!-- Elementos Fixados no Topo -->
                <!-- Número de identificação fixado à esquerda -->
                <span class="item-number">1</span>

                <h2 class="canvas-title">{{ snackName }}</h2>

                <!-- Divisória fixa com tamanho fixo -->
                <div class="canvas-divider"></div>

                <!-- Texto Centralizado -->
                <span class="canvas-empty-text">VAZIO</span>

            </div>

            <!-- Controles de Paginação -->
            <div class="pagination-controls">
                <button class="page-btn">‹</button>
                <span class="page-indicator">1 / 12</span>
                <button class="page-btn">›</button>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Estilos básicos inspirados no modo escuro da imagem */
.product-editor {
    display: flex;
    gap: 24px;
    background-color: #121212;
    color: #ffffff;
    padding: 20px;
    box-sizing: border-box;
    font-family: sans-serif;
    width: 1100px;
}

/* Coluna Esquerda */
.editor-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 350px;
    flex-shrink: 0;
}

.section-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.flex-grow {
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
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
    margin: 0 0 8px 0;
}

/* Inputs e Textareas */
.input-group {
    display: flex;
    align-items: center;
    background-color: #1e1e1e;
    border-radius: 6px;
    padding: 4px 8px;
    border: 1px solid #333;
}

.dark-input {
    flex-grow: 1;
    background: transparent;
    border: none;
    color: white;
    padding: 8px;
    outline: none;
}

.textarea-wrapper {
    position: relative;
    background-color: #1e1e1e;
    border-radius: 6px;
    border: 1px solid #333;
}

.dark-textarea {
    width: 100%;
    background: transparent;
    border: none;
    color: #ccc;
    padding: 12px;
    outline: none;
    resize: none;
    box-sizing: border-box;
    font-size: 0.85rem;
    line-height: 1.4;
}

.char-count {
    position: absolute;
    bottom: 8px;
    right: 12px;
    font-size: 0.7rem;
    color: #666;
}

/* Lista de Ingredientes */
.ingredients-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-right: 4px;
}

/* Scrollbar customizada para a lista */
.ingredients-list::-webkit-scrollbar {
    width: 6px;
}

.ingredients-list::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
}

.ingredient-item {
    display: flex;
    align-items: center;
    background-color: #1e1e1e;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #2a2a2a;
}

.drag-handle {
    color: #555;
    cursor: grab;
    margin-right: 12px;
    font-size: 1.2rem;
}

.ingredient-icon {
    font-size: 1.5rem;
    margin-right: 12px;
}

.ingredient-info {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.ingredient-name {
    font-size: 0.85rem;
    font-weight: 500;
}

.ingredient-obs {
    font-size: 0.7rem;
    color: #888;
    margin-top: 2px;
}

.icon-btn {
    background: transparent;
    border: none;
    color: #888;
    cursor: pointer;
    transition: color 0.2s;
}

.icon-btn:hover {
    color: #fff;
}

.drop-zone-remove {
    margin-top: 10px;
    border: 1px dashed #444;
    border-radius: 6px;
    padding: 12px;
    text-align: center;
    color: #666;
    font-size: 0.8rem;
}

/* Coluna Direita - Canvas */
.editor-main {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #1a1a1a;
    border-radius: 12px;
    padding: 20px;
}

.canvas-area {
    width: 100%;
    max-width: 500px;
    aspect-ratio: 3/4;
    /* Proporção aproximada do card na imagem */
    background-color: #242424;
    border: 2px dashed #444;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.canvas-placeholder {
    color: #666;
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 2px;
}

/* Paginação */
.pagination-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 20px;
}

.page-btn {
    background-color: #2a2a2a;
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.page-btn:hover {
    background-color: #3a3a3a;
}

.page-indicator {
    font-size: 0.85rem;
    color: #ccc;
}

/* Atualize a classe do item para ter o cursor de arrastar */
.ingredient-item {
    display: flex;
    align-items: center;
    background-color: #1e1e1e;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #2a2a2a;
    cursor: grab;
    /* Adicionado aqui */
}

/* Quando estiver arrastando (clicando e segurando) */
.ingredient-item:active {
    cursor: grabbing;
}

/* Você pode remover o cursor do drag-handle agora, mantendo apenas a cor/margem */
.drag-handle {
    color: #555;
    margin-right: 12px;
    font-size: 1.2rem;
}

/* Novo estilo do Canvas (Claro) */
.canvas-area.light-canvas {
    position: relative;
    /* Essencial para fixar os itens absolutos dentro dele */
    width: 100%;
    max-width: 400px;
    aspect-ratio: 9/16;
    background-color: #fffdfc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

    /* Mantemos o flex apenas para centralizar a palavra "VAZIO" no meio da tela */
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Badge "EDITANDO" Fixado */
.edit-badge {
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 0.65rem;
    font-weight: 800;
    color: #f38b41;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Título Fixado */
.canvas-title {
    position: absolute;
    top: 35px;
    /* Distância fixa do topo */
    width: 100%;
    text-align: center;
    color: #1a1a24;
    font-size: 1.1rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
}

/* Divisória Laranja Fixada com Tamanho Fixo */
.canvas-divider {
    position: absolute;
    top: 70px;
    /* Distância fixa exata a partir do topo do canvas */
    left: 50%;
    transform: translateX(-50%);
    /* Centraliza a linha perfeitamente */
    width: 75%;
    /* Tamanho fixo da linha (pode usar pixels também, ex: 360px) */
    height: 2px;
    /* Espessura fixa */
    background-color: #f38b41;
}

.canvas-empty-text {
    color: #d8d8dd;
    font-size: 1rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* Número do Item Fixado à Esquerda */
.item-number {
    position: absolute;
    top: 35px;
    /* Mesma altura do título para ficarem alinhados */
    left: 5%;
    /* Fixado no lado esquerdo (acompanhando o início da divisória) */
    font-size: 1.1rem;
    font-weight: 900;
    color: #1a1a24;
}

/* Título Fixado */
.canvas-title {
    position: absolute;
    top: 35px;
    width: 100%;
    text-align: center;
    color: #1a1a24;
    font-size: 1.1rem;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
}

/* Divisória Laranja Fixada com Tamanho Fixo */
.canvas-divider {
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    /* 95% deixa 2.5% de espaço de cada lado. O 'left: 5%' do item-number o alinha com o começo da linha */
    height: 2px;
    background-color: #f38b41;
}

.info-area { flex: 1; display: flex; align-items: center; gap: 8px; }
.index { font-size: 9px; font-weight: 800; color: #fb923c; min-width: 18px; }
.name { font-size: 10px; font-weight: 800; color: #374151; text-transform: uppercase; }

.ingredient-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-right: 10px;
  mix-blend-mode: multiply;
}

.btn-delete-full {
  width: 45px;
  height: 100%;
  border: none;
  background: #f9fafb;
  border-left: 1px solid #f3f4f6;
  color: #d1d5db;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-delete-full:hover { background: #fee2e2; color: #ef4444; }

.empty-state { text-align: center; color: #d1d5db; font-size: 11px; margin-top: 40px; padding: 0 20px; line-height: 1.5; }

.ingredient-item {
  background: #ffffff;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  padding: 0 0 0 12px; 
  height: 48px;
  transition: all 0.2s;
  cursor: grab;
  overflow: hidden;
}

.ingredient-item:hover { border-color: #fb923c; }
.is-dragging { opacity: 0.3; border-style: dashed; }
.is-dragover { border-top: 2px solid #fb923c; margin-top: 10px; }


</style>