<template>
  <ModuleLayout title="数据集管理">
    <!-- 顶部区域 -->
    <div class="dataset-header">
      <button class="btn-create" @click="showCreateModal">+ 新建数据集</button>
      <div class="filter">
        <label>排序:</label>
        <select v-model="sortOrder" @change="fetchDatasets">
          <option value="desc">时间从近到远</option>
          <option value="asc">时间从远到近</option>
        </select>
      </div>
    </div>

    <!-- 数据集表格 -->
    <table class="dataset-table">
      <thead>
      <tr>
        <th>ID</th>
        <th>名称</th>
        <th>类型</th>
        <th>创建时间</th>
        <th>路径</th>
        <th>总数</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in datasets" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.name || '未命名' }}</td>
        <td>{{ item.type }}</td>
        <td>{{ item.createdAt }}</td>
        <td class="path-cell" :title="item.storagePath">{{ item.storagePath || '-' }}</td>
        <td>{{ item.totalCount ?? '-' }}</td>
        <td>{{ item.createdBy || '-' }}</td>
        <td>
          <button
              class="btn-action"
              :class="item.createdBy === '已校验' ? 'btn-danger' : 'btn-success'"
              @click="showImportModal(item)"
          >
            配置
          </button>

          <!-- 查看按钮 -->
          <button
              class="btn-action"
              :class="item.createdBy === '已校验' ? 'btn-success' : 'btn-danger'"
              @click="viewDataset(item)"
          >
            查看
          </button>
          <button class="btn-action" @click="deleteDataset(item)">删除</button>
        </td>
      </tr>
      </tbody>
    </table>


    <!-- 分页 -->
    <div class="pagination">
      <button :disabled="currentPage===1" @click="changePage(currentPage-1)">上一页</button>
      <span>第 {{currentPage}} / {{totalPages}} 页</span>
      <button :disabled="currentPage>=totalPages" @click="changePage(currentPage+1)">下一页</button>
    </div>

    <!-- 模态框组件 -->
    <CreateDatasetModal :visible="showCreate" @close="showCreate=false" @create="handleCreate" />
    <ImportConfirmModal :visible="showImport" :dataset="selectedDataset" @close="showImport=false" @import-success="handleImportSuccess" />
  </ModuleLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import ModuleLayout from '../components/ModuleLayout.vue';
import CreateDatasetModal from '../components/CreateDatasetModal.vue';
import ImportConfirmModal from '../components/ImportConfirmModal.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const currentPage = ref(1);
const pageSize = 10;
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize));
const datasets = ref([]);
const sortOrder = ref('desc');

const showCreate = ref(false);
const showImport = ref(false);
const selectedDataset = ref(null);

function loadPage(page) {
  currentPage.value = page;
  fetchDatasets();
}

// 从已有数据集中生成新的数据集 ID（D000000 ~）
function generateNewDatasetId(datasetsData) {
  if (!datasetsData.items || datasetsData.items.length === 0) {
    return 'D000000';
  }

  const maxIdNumber = datasetsData.items
      .map(dataset => parseInt(dataset.id.replace('D', ''), 10))
      .reduce((max, num) => Math.max(max, num), -1);

  const nextIdNumber = maxIdNumber + 1;
  return `D${nextIdNumber.toString().padStart(6, '0')}`;
}

async function fetchDatasets() {
  try {
    const data = await window.electronAPI.readDatasets();
    let arr = data.items || [];
    arr.sort((a,b) => sortOrder.value==='desc' ?
        new Date(b.createdAt)-new Date(a.createdAt) :
        new Date(a.createdAt)-new Date(b.createdAt)
    );
    totalItems.value = data.total || arr.length;
    const start=(currentPage.value-1)*pageSize;
    datasets.value = arr.slice(start, start+pageSize);
  } catch (e) {
    console.error('读取数据失败', e);
    datasets.value = [];
    totalItems.value = 0;
  }
}

async function handleCreate(form) {
  const data = await window.electronAPI.readDatasets(); // { total, items }
  const arr = data.items || [];
  const newId = generateNewDatasetId(data);
  const item = {
    id: newId,
    name: form.name || '未命名',
    type: form.task || '未指定',
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    createdBy: '未校验'
  };

  arr.push(item);
  const newData = { total: arr.length, items: arr };

  await window.electronAPI.writeDatasets(newData);

  showCreate.value = false;
  selectedDataset.value = item;
  showImport.value = true;
}


async function deleteDataset(item) {
  if (!confirm(`删除 ${item.name}？`)) return;
  const ok = await window.electronAPI.deleteDatasetById(item.id);
  if (ok) {
    fetchDatasets();
  } else {
    console.error('删除失败', item.id);
  }
}

function showCreateModal() { showCreate.value=true; }
function showImportModal(item) { selectedDataset.value=item; showImport.value=true; }
function handleImportSuccess() { fetchDatasets(); }
function changePage(page){ currentPage.value=page; fetchDatasets(); }
function viewDataset(item) {
  // 这里可以用 Vue Router 或弹窗，先假设你用的是 <router-view>
  router.push({
    name: 'DatasetPreview', // 路由名称
    query: {
      path: item.storagePath
    }
  });
}

fetchDatasets();
</script>

<style scoped>
.dataset-header { display: flex; justify-content: space-between; align-items:center; margin-bottom:16px; }
.btn-create{padding:8px 16px; background:#409EFF; color:#fff; border:none; border-radius:6px; cursor:pointer;}
.filter{display:flex; align-items:center; gap:8px;}
.dataset-table{width:100%; border-collapse:collapse; background:#fff; border-radius:6px; overflow:hidden;}
.dataset-table th, .dataset-table td{padding:12px; text-align:left; border-bottom:1px solid #ebeef5;}
.pagination{margin-top:16px; text-align:center;}
.pagination button{margin:0 8px; padding:6px 12px;border:1px solid #dcdfe6;border-radius:4px;background:none;}
.path-cell {max-width: 200px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;}
.btn-success {
  background-color: #28a745;
  color: white;
}
.btn-danger {
  background-color: #dc3545;
  color: white;
}

</style>
