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

                            <!-- LINHA PRINCIPAL -->
                            <div class="ingredient-main-row">
                                <div class="info-area">
                                    <span class="index">#{{ index + 1 }}</span>
                                    <span class="name">{{ item.name }}</span>
                                </div>

                                <img v-if="item.image" :src="item.image" :alt="item.name" class="ingredient-img" />

                                <!-- Adicionado um :class dinâmico para quando estiver aberto -->
                                <button @click.stop="toggleObs(item)" class="btn-observation"
                                    :class="{ 'is-open': openObsId === item.id }" title="Adicionar Observação">
                                    <ObservationIcon />
                                </button>

                                <!-- Botão deletar (só aparece se estiver fechado) -->
                                <button v-if="openObsId !== item.id" @click.stop="removeIngredient(index)"
                                    class="btn-delete-full" aria-label="Remover">
                                    ✕
                                </button>
                            </div>

                            <!-- CAIXA DE OBSERVAÇÃO -->
                            <div v-if="openObsId === item.id" class="ingredient-obs-row">

                                <div class="obs-header">
                                    <span class="obs-label">OBSERVAÇÃO</span>
                                    <!-- REMOVIDO o botão "X" daqui! Deixamos só o rótulo -->
                                </div>

                                <textarea v-model="item.obs" class="obs-textarea"
                                    placeholder="Digite a observação para este item..."></textarea>

                                <button @click.stop="closeObs" class="btn-close-obs">
                                    ✓ Concluído
                                </button>
                            </div>

                        </div>
                    </VueDraggable>
                </div>
            </section>
        </div>

        <!-- COLUNA DIREITA: Canvas -->
        <div class="editor-main">
            <div class="canvas-area light-canvas">

                <!-- Elementos Fixados no Topo -->
                <span class="item-number">1</span>

                <h2 class="canvas-title">{{ snackName }}</h2>

                <!-- Divisória fixa -->
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

<script setup>
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import ObservationIcon from './icons/ObservationIcon.vue'

// Estado principal
const snackName = ref('01 - Alasca Burguer')

const openObsId = ref(null)

// Alterna a abertura/fechamento da observação
const toggleObs = (item) => {
    if (openObsId.value === item.id) {
        // Se clicar no botão de um item que já está aberto, ele fecha
        openObsId.value = null
    } else {
        // Caso contrário, abre a caixa para este item (o que fecha os outros automaticamente)
        openObsId.value = item.id
        // Zera o texto sempre que abrir, conforme você pediu antes
        item.obs = ''
    }
}

// Função simples apenas para fechar a caixa
const closeObs = () => {
    openObsId.value = null
}

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

<style scoped>
/* Reset de Botão Padrão */
button {
    background-color: transparent;
}

/* Container Principal */
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

/* Input "Lanche Atual" */
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

.icon-btn {
    border: none;
    color: #888;
    cursor: pointer;
    transition: color 0.2s;
}

.icon-btn:hover {
    color: #fff;
}

/* Lista de Ingredientes (Scroll) */
.ingredients-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-right: 4px;
}

.ingredients-list::-webkit-scrollbar {
    width: 6px;
}

.ingredients-list::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
}

/* Item da Lista (Container) */
.ingredient-item {
    border-radius: 8px;
    margin-bottom: 5px;
    display: flex;
    flex-direction: column;
    background-color: #1e1e1e;
    border: 1px solid #2a2a2a;
    cursor: grab;
    overflow: hidden;
}

.ingredient-item:active {
    cursor: grabbing;
}

.ghost-item {
    opacity: 0.5;
    background-color: #222;
    border: 1px dashed #666;
}

/* Linha Principal do Item */
.ingredient-main-row {
    display: flex;
    align-items: center;
    padding: 0 0 0 12px;
    height: 48px;
    width: 100%;
    box-sizing: border-box;
}

/* Info do Ingrediente (# e Nome) */
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
}

/* Imagem do Ingrediente */
.ingredient-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    margin-right: 10px;
    mix-blend-mode: multiply;
    /* Funciona bem para fundos brancos, pode remover se suas imagens forem PNG com fundo transparente */
}

/* Botão de Observação */
.btn-observation {
    margin-right: 6px;
    color: #cc3333;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-observation:hover {
    background-color: #333;
    border-color: #cc3333;
}

/* Botão de Fechar/Remover Item */
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

/* --- ESTILOS DA CAIXA DE OBSERVAÇÃO --- */
.ingredient-obs-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background-color: #161616;
    border-top: 1px solid #2a2a2a;
    cursor: default;
}

.obs-textarea {
    width: 100%;
    background-color: #111111;
    color: #e5e5e5;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 8px 10px;
    font-family: inherit;
    font-size: 0.75rem;
    resize: vertical;
    min-height: 60px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
}

.obs-textarea:focus {
    border-color: #fb923c;
}

.btn-close-obs {
    align-self: flex-end;
    background-color: #2a2a2a;
    color: #e5e5e5;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-close-obs:hover {
    background-color: #fb923c;
    color: #fff;
}

/* --- COLUNA DIREITA - CANVAS --- */
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

.canvas-area.light-canvas {
    position: relative;
    width: 100%;
    max-width: 400px;
    aspect-ratio: 9/16;
    background-color: #fffdfc;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.item-number {
    position: absolute;
    top: 35px;
    left: 5%;
    font-size: 1.1rem;
    font-weight: 900;
    color: #1a1a24;
}

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

.canvas-divider {
    position: absolute;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    height: 2px;
    background-color: #f38b41;
}

.canvas-empty-text {
    color: #d8d8dd;
    font-size: 1rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
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

/* Cabeçalho da Observação e Botão X */
.obs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
}

.obs-label {
    font-size: 0.65rem;
    color: #888;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.btn-close-x {
    background: transparent;
    border: none;
    color: #888;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
}

.btn-close-x:hover {
    color: #cc3333;
}

/* ... estilos existentes do botão ... */
.btn-observation {
    margin-right: 6px;
    color: #cc3333;
    border: 1px solid #333;
    border-radius: 6px;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-observation:hover {
    background-color: #333;
    border-color: #cc3333;
}

/* NOVO: Estado quando a observação está aberta */
.btn-observation.is-open {
    background-color: #cc3333;
    color: #ffffff;
    /* Ícone fica branco */
    border-color: #cc3333;
    /* Adiciona uma margem simulando o espaço do botão de lixeira que sumiu */
    margin-right: 12px;
}
</style>