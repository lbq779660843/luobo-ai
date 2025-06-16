<template>
  <div class="title-bar" @dblclick="toggleMaximize">
    <div class="drag-region">
      <img src="../assets/lbws.png" alt="logo" class="logo" />
      <span class="title">罗博AI训练平台</span>
    </div>
    <div class="window-controls">
      <button @click="openSettings">⚙</button>
      <button @click="openAbout">❓</button>
      <button @click="minimize">🗕</button>
      <button @click="maximize">🗖</button>
      <button @click="close">✖</button>
    </div>
  </div>
</template>

<script setup>
const minimize = () => window.electronAPI.minimize();
const maximize = () => window.electronAPI.maximize();
const close = () => window.electronAPI.close();
const toggleMaximize = () => window.electronAPI.maximize();

// 预留功能
const openSettings = () => {
  console.log('打开设置...');
};
const openAbout = () => {
  console.log('显示版本信息...');
};
</script>

<style scoped>
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  background-color: #0b1925;
  color: white;
  -webkit-user-select: none;
}

.drag-region {
  flex: 1;
  padding-left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  -webkit-app-region: drag;
}

.logo {
  height: 20px;
  width: auto;
  -webkit-app-region: no-drag; /* 避免拖动时误点图片 */
}

.title {
  font-size: 14px;
  font-weight: bold;
}

.window-controls {
  display: flex;
  -webkit-app-region: no-drag;
}

.window-controls button {
  width: 32px;
  height: 100%;
  border: none;
  background: transparent;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.window-controls button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
