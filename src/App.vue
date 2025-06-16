<template>
  <div id="app">
    <TitleBar />
    <router-view />
  </div>
</template>

<script setup>
import TitleBar from './components/TitleBar.vue'
</script>

<style>
body {
  margin: 0;
}
</style>
