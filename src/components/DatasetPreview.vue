<template>
  <div class="top-bar">
    <button @click="goBack" class="back-btn">← 返回</button>
  </div>

  <div class="dataset-preview">
    <h2>数据预览：{{ storagePath }}</h2>

    <div class="image-preview" v-if="imageFiles.length">
      <div class="image-grid">
        <img
            v-for="(img, index) in pagedImages"
            :key="index"
            :src="img.base64"
            class="preview-img"
        />

      </div>

      <div class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>

    <div v-else>暂无图像</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import path from 'path-browserify'; // 引入 path 模块
const route = useRoute();
const router = useRouter(); // 获取路由实例，用于跳转页面
const storagePath = ref(route.query.path); // 获取父组件传来的路径
const imageFiles = ref([]);
const currentPage = ref(1);
const pageSize = 50;

function goBack() {
  router.push('/dataset'); // 确保你的 router 配置有这个 name
}

// 分页逻辑
const pagedImages = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return imageFiles.value.slice(start, start + pageSize);
});

const totalPages = computed(() =>
    Math.ceil(imageFiles.value.length / pageSize)
);

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

// 调用 preload.js 暴露的方法获取图像
async function loadImageFiles() {
  console.log("storagePath.value：", storagePath.value); //
  imageFiles.value = [];  // ✅ 清空上一次的图像
  currentPage.value = 1;  // ✅ 重置分页
  const imageDir = path.join(storagePath.value, 'images');
  const result = await window.electronAPI.getImagesFromDir(imageDir);

  if (result.success) {
    console.log("读取到的文件列表：", result.files); // ✅ 检查 base64 字段
    imageFiles.value = result.files;
  } else {
    alert(`读取图像失败：${result.error}`);
  }
}

onMounted(loadImageFiles);
</script>

<style scoped>
.dataset-preview {
  padding: 20px;
}
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.preview-img {
  width: 100%;
  height: auto;
  object-fit: cover;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.back-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.back-btn:hover {
  background-color: #d32f2f;
}

</style>
