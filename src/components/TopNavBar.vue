<template>
  <header class="top-nav-bar">
    
    <!-- Logo na Esquerda -->
    <div class="brand-area">
      <div class="brand-badge">keeta</div>
    </div>

    <!-- Menu do Usuário na Direita -->
    <div class="user-area">
      
      <!-- Botão que abre o dropdown -->
      <button @click="toggleDropdown" class="user-btn">
        <img 
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
          alt="Foto do usuário" 
          class="user-avatar"
        />
        <svg class="chevron-icon" :class="{ 'rotate': isDropdownOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <!-- Dropdown flutuante -->
      <div v-if="isDropdownOpen" class="dropdown-menu">
        <div class="dropdown-header">
          <span class="user-name">João Silva</span>
          <span class="user-email">joao@email.com</span>
        </div>
        
        <div class="dropdown-divider"></div>
        
        <button class="dropdown-item">
          <span class="icon">👤</span> Perfil
        </button>
        <button class="dropdown-item">
          <span class="icon">⚙️</span> Configurações
        </button>
        
        <div class="dropdown-divider"></div>
        
        <!-- Botão de Sair emite o evento para o App.vue -->
        <button @click="handleLogout" class="dropdown-item logout-item">
          <span class="icon">🚪</span> Sair
        </button>
      </div>

    </div>

    <!-- Fundo invisível para fechar o menu ao clicar fora dele -->
    <div v-if="isDropdownOpen" @click="isDropdownOpen = false" class="dropdown-overlay"></div>

  </header>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['logout'])
const isDropdownOpen = ref(false)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleLogout = () => {
  isDropdownOpen.value = false
  emit('logout')
}
</script>

<style scoped>
.top-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  background-color: #161616;
  border-bottom: 1px solid #2a2a2a;
  padding: 0 24px;
  box-sizing: border-box;
  font-family: sans-serif;
  position: relative;
  z-index: 50;
}

/* Logo */
.brand-badge {
  background: #facc15;
  color: #111;
  font-weight: 900;
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Área do Usuário */
.user-area {
  position: relative;
}

.user-btn {
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px;
  border-radius: 24px;
  transition: background-color 0.2s;
}

.user-btn:hover {
  background-color: #222;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #333;
}

.chevron-icon {
  color: #888;
  transition: transform 0.2s;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

/* Dropdown */
.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 220px;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
  animation: slideDown 0.15s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-header {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}

.user-email {
  color: #888;
  font-size: 0.75rem;
}

.dropdown-divider {
  height: 1px;
  background-color: #333;
  width: 100%;
}

.dropdown-item {
  background: transparent;
  border: none;
  color: #ccc;
  padding: 12px 16px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-item:hover {
  background-color: #2a2a2a;
  color: #fff;
}

.logout-item {
  color: #cc3333;
}

.logout-item:hover {
  background-color: rgba(204, 51, 51, 0.1);
  color: #ff4444;
}

.dropdown-item .icon {
  font-size: 1.1rem;
}

/* Overlay invisível para fechar clicando fora */
.dropdown-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 90;
}
</style>