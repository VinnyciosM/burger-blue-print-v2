<template>
  <div class="print-canvas-wrapper">
    
    <!-- Indicador superior esquerdo -->
    <div class="top-indicator">
      Página 1 de 3
    </div>

    <!-- Controles de Zoom Flutuantes -->
    <div class="zoom-controls">
      <button class="zoom-btn">+</button>
      <span class="zoom-level">100%</span>
      <button class="zoom-btn">-</button>
    </div>

    <!-- Área da Folha A4 (Simulação) -->
    <div class="paper-sheet landscape">
      
      <!-- Linhas de corte (Tracejado interno) -->
      <div class="cut-lines-grid">
        <!-- Ícones de Tesoura simulados nos cruzamentos (Opcional, usando texto para o mockup) -->
        <div class="scissor top">✂</div>
        <div class="scissor bottom">✂</div>
        <div class="scissor left">✂</div>
        <div class="scissor right">✂</div>
        <div class="scissor center">✂</div>

        <!-- Placeholder dos 4 lanches (Mockup visual) -->
        <div v-for="n in 4" :key="n" class="snack-preview-card">
          <div class="card-header">
            <span class="snack-number">0{{ n }}</span>
            <h4 class="snack-name">NOME DO LANCHE</h4>
            <div class="brand-badge">keeta</div>
          </div>
          
          <div class="card-body">
            <div class="image-placeholder">🍔</div>
            <div class="ingredients-placeholder">
              <span v-for="i in 6" :key="i">Ingrediente {{ i }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <span class="price">R$ 28,90</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Paginação e Aviso Inferior -->
    <div class="bottom-controls">
      <div class="pagination">
        <button class="page-btn">‹</button>
        <span class="page-indicator">1 / 3</span>
        <button class="page-btn">›</button>
      </div>
      <p class="disclaimer">
        Esta é uma simulação. O resultado final pode ter pequenas variações.
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

// Aqui futuramente receberemos os dados via props do App.vue
// const props = defineProps(['lanches', 'configuracoes'])

</script>

<style scoped>
/* Container Principal (Fundo Cinza) */
.print-canvas-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #d8d8dd; /* Cinza claro da imagem */
  border-radius: 8px;
  flex-grow: 1;
  padding: 40px 20px;
  overflow: hidden;
  font-family: sans-serif;
}

/* Indicador Topo Esquerdo */
.top-indicator {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #333;
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Controles de Zoom */
.zoom-controls {
  position: absolute;
  top: 60px;
  left: 20px;
  background-color: #222;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
}

.zoom-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.zoom-btn:hover { background-color: #444; }

.zoom-level {
  color: #ccc;
  font-size: 0.7rem;
  padding: 8px 4px;
  border-top: 1px solid #444;
  border-bottom: 1px solid #444;
  font-weight: bold;
}

/* Folha A4 */
.paper-sheet {
  background-color: #ffffff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  position: relative;
  /* Proporção de A4 Paisagem (297x210) */
  width: 100%;
  max-width: 800px;
  aspect-ratio: 1.414 / 1; 
  padding: 20px;
  box-sizing: border-box;
}

/* Grid de Linhas de Corte */
.cut-lines-grid {
  width: 100%;
  height: 100%;
  border: 1px dashed #ccc;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  position: relative;
}

/* Elementos do Grid de Corte */
.cut-lines-grid > div.snack-preview-card {
  border: 1px dashed #ccc; /* Bordas internas tracejadas */
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Tesourinhas (Posicionamento Absoluto) */
.scissor {
  position: absolute;
  font-size: 12px;
  color: #aaa;
  background: #fff;
  padding: 2px;
}
.scissor.top { top: -10px; left: 50%; transform: translateX(-50%); }
.scissor.bottom { bottom: -10px; left: 50%; transform: translateX(-50%); }
.scissor.left { left: -10px; top: 50%; transform: translateY(-50%); }
.scissor.right { right: -10px; top: 50%; transform: translateY(-50%); }
.scissor.center { top: 50%; left: 50%; transform: translate(-50%, -50%); }

/* Mockup do Lanche (Visual Temporário) */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid #f38b41;
  padding-bottom: 8px;
}
.snack-number { background: #111; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem;}
.snack-name { margin: 0; font-size: 1.1rem; color: #111; font-weight: 900; flex-grow: 1; }
.brand-badge { background: #facc15; color: #111; font-weight: 800; font-size: 0.6rem; padding: 4px 8px; border-radius: 12px; }

.card-body {
  display: flex;
  flex-grow: 1;
  gap: 16px;
  align-items: center;
}
.image-placeholder { font-size: 4rem; flex-grow: 1; text-align: center; }
.ingredients-placeholder { display: flex; flex-direction: column; gap: 4px; font-size: 0.65rem; color: #555; }

.card-footer { font-weight: 900; font-size: 1.1rem; color: #111; }

/* Controles Inferiores */
.bottom-controls {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #222;
  padding: 4px;
  border-radius: 6px;
}

.page-btn {
  background-color: transparent;
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}
.page-btn:hover { background-color: #444; }

.page-indicator { color: #fff; font-size: 0.8rem; font-weight: 600; padding: 0 8px; }

.disclaimer {
  color: #777;
  font-size: 0.75rem;
  margin: 0;
}
</style>