<template>
  <div class="layout">
    <aside class="sidebar">
      <h2 class="logo">AI工具箱</h2>
      <ul class="nav">
        <li @click="go('/')">🏠 首页</li>
        <li @click="go('/dataset')">📁 数据集管理</li>
        <li @click="go('/train')">🧠 我的项目</li>

        <li @click="go('/task')">📊 任务管理</li>
        <li @click="go('/deploy')">🚀 模型管理</li>
      </ul>
    </aside>

    <main class="main">
      <header class="topbar">
        <button @click="go('/')" class="back">← 返回首页</button>
        <h1>{{ title }}</h1>
      </header>

      <section class="content">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
defineProps(['title'])

function go(path) {
  router.push(path)
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
  margin: 0;
  padding: 0;
}

.sidebar {
  width: 140px; /* 原来可能是 200px，可适当调整更窄 */
  background-color: #d9e6cc;
  padding: 10px 0;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
}

.sidebar li:hover {
  background-color: #e6f7ff;
}


.logo {
  font-size: 18px;
  margin-bottom: 24px;
  text-align: center;
}

.nav li {
  list-style: none;
  padding: 12px;
  margin: 4px 0;
  cursor: pointer;
  border-radius: 6px;
  transition: 0.2s;
}
.nav li:hover {
  background-color: #34495e;
}

.main {
  flex: 1;
  padding: 16px;
  box-sizing: border-box;
  margin-left: 0; /* 确保左侧不留空白 */
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.back {
  background: none;
  border: none;
  color: #409EFF;
  font-size: 16px;
  cursor: pointer;
}
.back:hover {
  text-decoration: underline;
}

.content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
}
</style>
