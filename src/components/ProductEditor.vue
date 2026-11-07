<template>
    <div class="product-editor">
        <div class="editor-sidebar">
            <!-- Lanche Atual -->
            <section class="section-block">
                <h3 class="section-title">LANCHE ATUAL (Nome sem número)</h3>
                <div class="input-group">
                    <!-- O Input altera SOMENTE o nome real do lanche -->
                    <input type="text" v-model="snack.name" class="dark-input" placeholder="Ex: Alasca Burguer" />
                    <button class="icon-btn" aria-label="Editar">✏️</button>
                </div>
            </section>

            <!-- Ingredientes -->
            <section class="section-block flex-grow">
                <h3 class="section-title">INGREDIENTES DO LANCHE</h3>
                <p class="section-subtitle">Reordene arrastando os itens</p>
                <div class="ingredients-list">
                    <VueDraggable v-model="snack.ingredients" ghost-class="ghost-item" :animation="200">
                        <div v-for="(item, index) in snack.ingredients" :key="item.id" class="ingredient-item">
                            <div class="ingredient-main-row">
                                <div class="info-area">
                                    <span class="index">#{{ index + 1 }}</span>
                                    <span class="name">{{ item.name }}</span>
                                </div>
                                <img v-if="item.image" :src="item.image" :alt="item.name" class="ingredient-img" />
                                
                                <button @click.stop="toggleObs(item)" class="btn-observation"
                                    :class="{ 'is-open': openObsId === item.id }" title="Adicionar Observação">
                                    <ObservationIcon />
                                </button>
                                
                                <button v-if="openObsId !== item.id" @click.stop="removeIngredient(index)"
                                    class="btn-delete-full" aria-label="Remover">✕</button>
                            </div>

                            <!-- Observação -->
                            <div v-if="openObsId === item.id" class="ingredient-obs-row">
                                <div class="obs-header">
                                    <span class="obs-label">OBSERVAÇÃO</span>
                                </div>
                                <textarea v-model="item.obs" class="obs-textarea"
                                    placeholder="Digite a observação para este item..."></textarea>
                                <button @click.stop="closeObs" class="btn-close-obs">✓ Concluído</button>
                            </div>
                        </div>
                    </VueDraggable>
                    <div v-if="snack.ingredients.length === 0" class="empty-list-msg">
                        Nenhum ingrediente adicionado.
                    </div>
                </div>
            </section>
        </div>

        <!-- CANVAS -->
        <div class="editor-main">
            <div class="canvas-area active-column">
                
                <!-- Título -->
                <h2 class="canvas-title">{{ snack.name }}</h2>

                <!-- Container da Lista -->
                <div class="canvas-content">
                    
                    <!-- Vazio -->
                    <span v-if="snack.ingredients.length === 0" class="canvas-empty-text">VAZIO</span>

                    <!-- Lista Espelhada (Imagem Direita / Texto Esquerda) -->
                    <div v-else class="layers-list">
                        <div v-for="item in snack.ingredients" :key="item.id" class="layer-item">
                            <img v-if="item.image" :src="item.image" class="ingredient-img-canvas" />
                            <div class="info">
                                <span class="layer-name">{{ item.name }}</span>
                                <span v-if="item.obs" class="layer-obs">{{ item.obs }}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import ObservationIcon from './icons/ObservationIcon.vue'

const props = defineProps({
    snack: { type: Object, required: true },
    snackIndex: { type: Number, required: true }
})

const openObsId = ref(null)

const toggleObs = (item) => {
    if (openObsId.value === item.id) {
        openObsId.value = null
    } else {
        openObsId.value = item.id
        if (!item.obs) item.obs = ''
    }
}

const closeObs = () => { openObsId.value = null }

const removeIngredient = (index) => {
    props.snack.ingredients.splice(index, 1)
}
</script>

<style scoped>
button {
    background-color: transparent;
}

.product-editor {
    display: flex;
    gap: 20px;
    gap: 12px;
    color: var(--text);
    box-sizing: border-box;
    font-family: var(--font);
}

.editor-sidebar {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 360px;
    flex-shrink: 0;
    min-height: 0;
    padding: 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-panel);
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
    color: var(--text-muted);
    margin: 0;
    text-transform: uppercase;
}

.section-subtitle {
    font-size: 0.7rem;
    color: var(--text-faint);
    margin: 0 0 8px 0;
}

.input-group {
    display: flex;
    align-items: center;
    background-color: var(--bg);
    border-radius: 12px;
    padding: 4px 8px;
    border: 1px solid var(--border);
    transition: border-color 0.15s, box-shadow 0.15s;
}

.input-group:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
}

.dark-input {
    flex-grow: 1;
    background: transparent;
    border: none;
    color: var(--text);
    padding: 8px;
    outline: none;
}

.icon-btn {
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.2s;
}

.icon-btn:hover {
    color: var(--text);
}

/* Lista de ingredientes da sidebar */
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
    background: var(--border);
    border-radius: 4px;
}

.empty-list-msg {
    color: var(--text-faint);
    font-size: 0.8rem;
    text-align: center;
    padding: 20px 0;
    font-style: italic;
}

.ingredient-item {
    border-radius: 12px;
    margin-bottom: 6px;
    display: flex;
    flex-direction: column;
    background-color: var(--surface-2);
    border: 1px solid var(--border);
    cursor: grab;
    overflow: hidden;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.ingredient-item:hover {
    border-color: var(--border-strong);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.ingredient-item:active {
    cursor: grabbing;
}

.ghost-item {
    opacity: 0.5;
    background-color: var(--border);
    border: 1px dashed var(--border-strong);
}

.ingredient-main-row {
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
    color: var(--accent);
    min-width: 18px;
}

.name {
    font-size: 10px;
    font-weight: 800;
    color: var(--text);
    text-transform: uppercase;
}

.ingredient-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    margin-right: 10px;
    background-color: #ffffff;
    border-radius: 4px;
    padding: 2px;
    box-sizing: border-box;
}

.btn-observation {
    margin-right: 6px;
    color: #cc3333;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-observation:hover {
    background-color: var(--border);
    border-color: #cc3333;
}

.btn-observation.is-open {
    background-color: #cc3333;
    color: var(--text);
    border-color: #cc3333;
    margin-right: 12px;
}

.btn-delete-full {
    width: 45px;
    height: 100%;
    border: none;
    color: var(--text-faint);
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-left: 1px solid var(--border);
    background-color: var(--bg);
}

.btn-delete-full:hover {
    color: #cc3333;
    background-color: var(--bg);
}

.ingredient-obs-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background-color: var(--bg);
    border-top: 1px solid var(--border);
    cursor: default;
}

.obs-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
}

.obs-label {
    font-size: 0.65rem;
    color: var(--text-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.obs-textarea {
    width: 100%;
    background-color: var(--bg);
    color: var(--text);
    border: 1px solid var(--border);
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
    border-color: var(--accent);
}

.btn-close-obs {
    align-self: flex-end;
    background-color: var(--border);
    color: var(--text);
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-close-obs:hover {
    background-color: var(--accent);
    color: var(--on-accent);
}

/* =========================================
   CANVAS - ESTILO V1
========================================= */
.editor-main {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-panel);
    background-color: var(--surface);
    /* mesa de trabalho pontilhada ao redor da guia */
    background-image: radial-gradient(var(--border-strong) 1px, transparent 1px);
    background-size: 22px 22px;
    padding: 12px;
    overflow: hidden;
}

.canvas-area {
    position: relative;
    width: 100%;
    max-width: 420px; 
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 14px;
    box-sizing: border-box;
    overflow: hidden; /* Mantém tudo dentro do container branco */
}

.active-column {
    background: #fffaf7; 
    border-radius: 6px;
    box-shadow: inset 0 0 0 2px var(--accent), 0 18px 40px rgba(0, 0, 0, 0.35);
}

.edit-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 9px;
    font-weight: 900;
    color: var(--accent);
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.canvas-title {
    flex-shrink: 0; /* Impede o título de esmagar */
    font-size: 15px;
    font-weight: 900;
    text-align: center;
    border-bottom: 2px solid var(--accent); 
    padding-bottom: 12px;
    margin-top: 6px;
    margin-bottom: 8px;
    text-transform: uppercase;
    color: #111827;
    width: 100%;
    box-sizing: border-box;
}

.canvas-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* REMOVIDO O SCROLL (auto -> hidden) */
    min-height: 0; 
}

.canvas-content::-webkit-scrollbar {
    display: none;
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
    gap: 2px; /* Gap reduzido para não gastar espaço útil quando houver muitos itens */
    height: 100%;
    min-height: 0;
}

.layer-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1; /* MÁGICA: Faz o item crescer ou encolher para preencher o espaço */
    min-height: 0; /* MÁGICA 2: Permite que o item encolha infinitamente sem quebrar o layout */
    max-height: 84px; /* Trava o tamanho máximo para não ficarem gigantes se houver apenas 2 itens */
    width: 100%;
}

.ingredient-img-canvas {
    max-width: 150px;
    height: 100%; /* A imagem vai acompanhar a altura "espremida" do item */
    width: auto;
    object-fit: contain;
    mix-blend-mode: multiply; 
    flex-shrink: 1; /* Permite que a área da imagem encolha se necessário */
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
    white-space: normal;
    word-wrap: break-word;
}

.layer-obs {
    font-size: 11px;
    font-weight: 600;
    color: #cc3333;
    font-style: italic;
    margin-top: 2px;
}
</style>