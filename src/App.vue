<script setup>
import IngredientSidebar from './components/IngredientSidebar.vue';
import ProductEditor from './components/ProductEditor.vue';
import GuideManager from './components/GuideManager.vue';
</script>

<template>
  <div class="app-container">
    <IngredientSidebar/>
    <ProductEditor/>
    <GuideManager/>
  </div>
</template>

<style>
body{
  margin: 0;
}

.app-container{
  display: flex;
}
</style>
