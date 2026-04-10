<script setup>
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive include="ResultPage">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f9fafb;
  color: #333;
}
</style>
