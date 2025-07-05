<template>
  <ModuleLayout title="任务管理">
    <div class="training-header">
      <div class="filter">
        <label>排序:</label>
        <select v-model="sortOrder" @change="fetchTasks">
          <option value="desc">时间从近到远</option>
          <option value="asc">时间从远到近</option>
        </select>
      </div>
    </div>

    <table class="training-table">
      <thead>
      <tr>
        <th>任务 ID</th>
        <th>任务名称</th>
        <th>状态</th>
        <th>创建时间</th>
        <th>数据路径</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="task in tasks" :key="task.id">
        <td>{{ task.id }}</td>
        <td>{{ task.name }}</td>
        <td>{{ task.status }}</td>
        <td>{{ task.createdAt }}</td>
        <td>{{ task.dir }}</td>
        <td>
          <button class="btn-action" @click="handleView(task)">查看</button>
          <button class="btn-action" @click="openDir(task)">打开目录</button>
          <button class="btn-action" @click="deleteTask(task)">删除</button>
        </td>
      </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</button>
    </div>
  </ModuleLayout>
</template>


<script setup>
import { ref, computed } from 'vue';
import ModuleLayout from '../components/ModuleLayout.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize));
const tasks = ref([]);
const sortOrder = ref('desc');
onMounted(() => {
  fetchTasks()
})
// 加载分页数据
function loadPage(page) {
  currentPage.value = page;
  fetchTasks();
}

function handleView(task) {
  router.push({ name: 'TensorBoard' });
}

// 从现有任务生成下一个 ID（T000000 ~）
function generateNewTaskId(data) {
  if (!data.items || data.items.length === 0) {
    return 'T000000';
  }

  const maxId = data.items
      .map(task => parseInt(task.id.replace('T', ''), 10))
      .reduce((max, num) => Math.max(max, num), -1);

  const nextId = maxId + 1;
  return `T${nextId.toString().padStart(6, '0')}`;
}

function openDir(task) {
  if (task.dir) {
    window.electronAPI.openDir(task.dir);
  } else {
    console.warn('任务目录未定义');
  }
}

// 获取任务数据
async function fetchTasks() {
  try {
    const data = await window.electronAPI.readTasks();
    let arr = data.items || [];

    arr.sort((a, b) =>
        sortOrder.value === 'desc'
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
    );

    totalItems.value = data.total || arr.length;

    const start = (currentPage.value - 1) * pageSize;
    tasks.value = arr.slice(start, start + pageSize);
  } catch (e) {
    console.error('读取任务数据失败', e);
    tasks.value = [];
    totalItems.value = 0;
  }
}

// 删除任务
async function deleteTask(item) {
  if (!confirm(`确认删除任务 ${item.name}?`)) return;
  const ok = await window.electronAPI.deleteTaskById(item.id);
  if (ok) {
    fetchTasks();
  } else {
    console.error('任务删除失败:', item.id);
  }
}

// 任务详情操作
function handleDetail(task) {
  console.log('查看任务详情:', task);
  // 后续可接入详情页或弹窗
}

// 页码切换
function changePage(page) {
  currentPage.value = page;
  fetchTasks();
}

fetchTasks();
</script>


<style scoped>
.training-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.filter {
  display: flex;
  align-items: center;
}

.filter select {
  margin-left: 5px;
}

.training-table {
  width: 100%;
  border-collapse: collapse;
}

.training-table th,
.training-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.btn-action {
  margin-right: 6px;
}

.pagination {
  margin-top: 10px;
  text-align: center;
}
</style>
