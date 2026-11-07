<template>
  <div ref="root" class="appearance">
    <button class="trigger" :class="{ open }" title="Aparência" aria-haspopup="true" :aria-expanded="open"
      @click="open = !open">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
      </svg>
      <span class="trigger-label">Aparência</span>
    </button>

    <div v-if="open" class="panel" role="dialog" aria-label="Aparência">
      <p class="label">Modo</p>
      <div class="modes">
        <button v-for="m in MODES" :key="m.id" class="mode-btn" :class="{ active: theme.mode === m.id }"
          @click="theme.mode = m.id">
          <span aria-hidden="true">{{ icons[m.id] }}</span> {{ m.label }}
        </button>
      </div>

      <p class="label">Cor principal</p>
      <div class="swatches">
        <button v-for="c in ACCENTS" :key="c.value" class="swatch" :title="c.name"
          :class="{ active: theme.accent.toLowerCase() === c.value }" :style="{ background: c.value }"
          :aria-label="c.name" @click="theme.accent = c.value" />
        <label class="swatch custom" title="Cor personalizada" :class="{ active: isCustom }">
          <input type="color" :value="theme.accent" @input="theme.accent = $event.target.value" />
          <span aria-hidden="true">+</span>
        </label>
      </div>

      <button class="reset" @click="resetTheme">Restaurar padrão</button>
      <p class="hint">Suas escolhas ficam salvas neste navegador.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { theme, ACCENTS, MODES, resetTheme } from '../theme.js'

const icons = { light: '☀️', dark: '🌙', system: '💻' }
const open = ref(false)
const root = ref(null)

const isCustom = computed(() => !ACCENTS.some(c => c.value === theme.accent.toLowerCase()))

const onDocClick = (e) => { if (root.value && !root.value.contains(e.target)) open.value = false }
const onKey = (e) => { if (e.key === 'Escape') open.value = false }

onMounted(() => {
  document.addEventListener('mousedown', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<style scoped>
.appearance {
  position: relative;
}

.trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-family: var(--font);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.trigger:hover,
.trigger.open {
  color: var(--text);
  border-color: var(--border-strong);
}

.panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  z-index: 60;
  width: 264px;
  padding: 14px;
  background: var(--surface-2);
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
  font-family: var(--font);
  color: var(--text);
}

.label {
  margin: 0 0 8px;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--text-faint);
}

.modes {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}

.mode-btn {
  padding: 8px 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.mode-btn:hover {
  color: var(--text);
}

.mode-btn.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}

.swatches {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.swatch {
  position: relative;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.12s;
}

.swatch:hover {
  transform: scale(1.12);
}

.swatch.active {
  border-color: var(--text);
  box-shadow: 0 0 0 2px var(--surface-2) inset;
}

.swatch.custom {
  display: grid;
  place-items: center;
  background: conic-gradient(#e5484d, #f5c542, #3fb27f, #3b82f6, #8b5cf6, #ec4899, #e5484d);
  color: #fff;
  font-weight: 800;
  overflow: hidden;
}

.swatch.custom input {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.reset {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.reset:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

.hint {
  margin: 10px 0 0;
  font-size: 0.68rem;
  color: var(--text-faint);
  text-align: center;
}

@media (max-width: 1100px) {
  .trigger-label {
    display: none;
  }
}
</style>
