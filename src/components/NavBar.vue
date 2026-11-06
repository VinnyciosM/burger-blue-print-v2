<template>
  <header class="navbar">
    <div class="nav-left">
      <div class="logo" aria-hidden="true">🍔</div>
      <div class="brand">
        <span class="brand-name">Manual Burger</span>
        <span class="brand-edition">Community Edition</span>
      </div>
    </div>

    <nav class="nav-center" aria-label="Modo de trabalho">
      <button class="nav-tab" :class="{ active: !printMode }" @click="$emit('set-mode', 'edit')">
        <span class="tab-step">1</span> Montar lanches
      </button>
      <span class="tab-divider">›</span>
      <button class="nav-tab" :class="{ active: printMode }" @click="$emit('set-mode', 'print')">
        <span class="tab-step">2</span> Gerar manual
      </button>
    </nav>

    <div class="nav-right">
      <span class="count-pill" :title="`${snackCount} lanche(s) no manual`">
        {{ snackCount }} {{ snackCount === 1 ? 'lanche' : 'lanches' }}
      </span>
      <a class="nav-link" href="https://github.com/vinnycios/manual-burger" target="_blank" rel="noopener">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
        </svg>
        GitHub
      </a>
    </div>
  </header>
</template>

<script setup>
defineProps({
  printMode: { type: Boolean, default: false },
  snackCount: { type: Number, default: 0 }
})
defineEmits(['set-mode'])
</script>

<style scoped>
.navbar {
  height: 56px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 20px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  font-family: var(--font);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  font-size: 18px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  border-radius: 10px;
}

.brand {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: 0.2px;
}

.brand-edition {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.nav-tab:hover {
  color: var(--text);
}

.nav-tab.active {
  background: var(--accent);
  color: #1a1109;
}

.tab-step {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.1);
}

.nav-tab.active .tab-step {
  background: rgba(0, 0, 0, 0.18);
}

.tab-divider {
  color: var(--text-faint);
}

.nav-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.count-pill {
  padding: 5px 12px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: color 0.15s, border-color 0.15s;
}

.nav-link:hover {
  color: var(--text);
  border-color: var(--border-strong);
}

@media (max-width: 1100px) {
  .brand-edition,
  .count-pill {
    display: none;
  }
}
</style>
