<script setup>
import { ref } from 'vue'

import IngredientSidebar from './components/IngredientSidebar.vue';
import ProductEditor from './components/ProductEditor.vue';
import GuideManager from './components/GuideManager.vue';
import PrintCanvas from './components/PrintCanvas.vue';
import PrintSettingsSidebar from './components/PrintSettingsSidebar.vue';

const isPrintMode = ref(false)
</script>

<template>
  <div v-if="!isPrintMode" class="app-container">
    <IngredientSidebar/>
    <ProductEditor/>
    <GuideManager @open-print-mode="isPrintMode = true" />
  </div>

  <div v-else class="print-container">
    <PrintCanvas/>
    <PrintSettingsSidebar @back-to-edit="isPrintMode = false" />
  </div>
</template>

<style>
body {
  margin: 0;
  background-color: #121212;
  color: #fff;
}

.app-container {
  display: flex;
  height: 100vh;
}

.print-container {
  display: flex;
  height: 100vh;
}
</style>