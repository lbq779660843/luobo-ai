<template>
  <!-- 背景视频 -->
  <video autoplay muted loop class="background-video">
    <source src="../assets/lbws.mp4" type="video/mp4" />
    您的浏览器不支持 video 标签。
  </video>

  <!-- 固定在底部偏上位置的按钮 -->
  <div class="button-container">
    <button class="start-btn" @click="goToDataset">
      开启罗博深度学习
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

function goToDataset() {
  router.push('/dataset');
}
</script>

<style scoped>
.background-video {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: -1;
}

/* 改为 absolute 定位 */
.button-container {
  position: absolute;
  bottom: 120px; /* 距离底部 120px，响应缩放 */
  width: 100%;
  display: flex;
  justify-content: center;
  z-index: 1;
}

.start-btn {
  padding: 18px 48px;
  font-size: 22px;
  font-weight: bold;
  background: linear-gradient(135deg, #409EFF, #66b1ff);
  color: white;
  border: none;
  border-radius: 30px;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  animation: fadeInUp 1s ease forwards, pulse 2.5s infinite ease-in-out;
}

.start-btn:hover {
  background: linear-gradient(135deg, #66b1ff, #409EFF);
  transform: scale(1.1);
  box-shadow: 0 10px 30px rgba(64, 158, 255, 0.6);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 20px rgba(64, 158, 255, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 35px rgba(64, 158, 255, 0.6);
  }
}
</style>

<style>
html, body {
  overflow: hidden;
  margin: 0;
  padding: 0;
  height: 100%;
}
::-webkit-scrollbar {
  display: none;
}
</style>
