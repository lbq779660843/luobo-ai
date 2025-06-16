<template>
  <ModuleLayout title="我的项目">
    <!-- 顶部区域 -->
    <div class="training-header">
      <button class="btn-create" @click="showCreateModal">+ 新建项目</button>
      <div class="filter">
        <label>排序:</label>
        <select v-model="sortOrder" @change="fetchProjects">
          <option value="desc">时间从近到远</option>
          <option value="asc">时间从远到近</option>
        </select>
      </div>
    </div>

    <!-- 项目表格 -->
    <table class="training-table">
      <thead>
      <tr>
        <th>项目 ID</th>
        <th>项目名称</th>
        <th>任务类型</th>
        <th>创建时间</th>
        <th>创建人</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="project in projects" :key="project.id">
        <td>{{ project.id }}</td>
        <td>{{ project.name || '未命名' }}</td>
        <td>{{ project.type }}</td>
        <td>{{ project.createdAt }}</td>
        <td>{{ project.createdBy }}</td>
        <td>
          <button class="btn-action" @click="showConfigModal(project)">训练</button>
          <button class="btn-action" @click="deleteProject(project)">删除</button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--; fetchProjects()">上一页</button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++; fetchProjects()">下一页</button>
    </div>

    <!-- 新建项目模态框 -->
    <CreateProjectModal
        :visible="showCreate"
        @close="showCreate = false"
        @create="handleCreate"
    />

    <!-- 项目配置模态框 -->
    <ProjectConfigModal
        :visible="showConfig"
        :project="selectedProject"
        @close="showConfig = false"
        @config-success="handleConfigSuccess"
    />
  </ModuleLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import ModuleLayout from '../components/ModuleLayout.vue';
import CreateProjectModal from '../components/CreateProjectModal.vue';
import ProjectConfigModal from '../components/ProjectConfigModal.vue';
import { onMounted } from 'vue';
onMounted(() => {
  fetchProjects();
});
// 直接使用 require 加载 Node.js 模块
/*const fs = require('fs');
const path = require('path');*/

// 分页相关
const currentPage = ref(1);
const pageSize = 10; // 每页显示 10 条
const totalItems = ref(0); // 总记录数
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize));

// 项目列表
const projects = ref([]);
const sortOrder = ref('desc'); // 默认按时间降序

// 模态框控制
const showCreate = ref(false);
const showConfig = ref(false);
const selectedProject = ref(null);

// 获取项目列表
async function fetchProjects() {
  try {
    const res = await window.electronAPI.readProjects();
    if (res && res.items) {
      // 排序
      const sorted = [...res.items].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder.value === 'asc' ? timeA - timeB : timeB - timeA;
      });

      totalItems.value = sorted.length;

      // 分页
      const startIndex = (currentPage.value - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      projects.value = sorted.slice(startIndex, endIndex);
    } else {
      projects.value = [];
      totalItems.value = 0;
    }
  } catch (error) {
    console.error('Error loading projects:', error);
    projects.value = [];
    totalItems.value = 0;
  }
}



// 初始加载数据
fetchProjects();

// 生成新的项目ID（从 P000000 开始累加）
function generateNewProjectId(projectsData) {
  if (!projectsData.items || projectsData.items.length === 0) {
    return 'P000000';
  }

  const maxIdNumber = projectsData.items
      .map(project => parseInt(project.id.replace('P', ''), 10))
      .filter(n => !isNaN(n))
      .reduce((max, num) => Math.max(max, num), -1);

  const nextIdNumber = maxIdNumber + 1;
  return `P${nextIdNumber.toString().padStart(6, '0')}`;
}

// 显示新建模态框
function showCreateModal() {
  showCreate.value = true;
}

// 封装读取项目列表的方法
async function loadProjects() {
  const data = await window.electronAPI.readProjects();
  projects.value = data.items || [];
}


// 处理新建项目
async function handleCreate(form) {
  const data = window.electronAPI.readProjects(); // ⛔ 不要 await，因为是同步的
  const arr = data.items || [];

  const newId = generateNewProjectId(data);

  const item = {
    id: newId,
    name: form.name || '未命名',
    type: form.task || '未指定',
    description: form.description || '',
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    createdBy: '未登入'
  };

  arr.push(item);

  const newData = {
    total: arr.length,
    items: arr
  };

  window.electronAPI.writeProjects(newData);

  // 处理弹窗与状态
  showCreate.value = false;
  selectedProject.value = item;
  showConfig.value = true;
  await loadProjects(); // 关键：重新加载项目列表
}


// 显示配置模态框
function showConfigModal(project) {
  selectedProject.value = project;
  showConfig.value = true;
}

// 处理配置成功
function handleConfigSuccess(project) {
  console.log('Config success, refreshing table:', project);
  fetchProjects(); // 重新加载数据
  showConfig.value = false; // 关闭模态框
}

// 删除项目
async function deleteProject(project) {
  const success = await window.electronAPI.deleteProjectById(project.id);
  if (success) {
    fetchProjects(); // 删除成功后刷新列表
  }
}


</script>

<style scoped>
.training-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-create {
  padding: 8px 16px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-create:hover {
  background-color: #66b1ff;
}

.filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter label {
  font-size: 14px;
  color: #606266;
}

.filter select {
  padding: 6px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.training-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
}

.training-table th,
.training-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.training-table th {
  background-color: #f5f7fa;
  color: #909399;
  font-weight: 500;
}

.training-table td {
  color: #606266;
}

.btn-action {
  padding: 4px 8px;
  margin-right: 8px;
  background: none;
  border: none;
  color: #409EFF;
  cursor: pointer;
  font-size: 14px;
}

.btn-action:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: none;
  cursor: pointer;
}

.pagination button:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background: #f5f7fa;
}
</style>