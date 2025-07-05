<template>
  <ModuleLayout title="训练过程查看">
    <iframe
        src="http://localhost:6006/"
        width="100%"
        height="800px"
        frameborder="0"
    ></iframe>
  </ModuleLayout>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import ModuleLayout from '../components/ModuleLayout.vue'

const isLoaded = ref(false)

onMounted(async () => {
  try {
    // 简单判断服务是否在运行
    const res = await fetch('http://localhost:6006/');
    isLoaded.value = res.ok;
  } catch (e) {
    isLoaded.value = false;
  }
});
</script>
