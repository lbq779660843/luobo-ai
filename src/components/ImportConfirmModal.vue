<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <div class="modal-header">
        <h2>创建信息</h2>
        <button class="doc-btn" title="
                - 图像分类任务：
            一级目录为‘存储路径’所在根目录，二级目录为类别目录数量不限，
            类别目录中包含的必须是以'.jpg'或'.png'或'.bmp'结尾的图像文件

- 目标检测任务、实例分割任务、姿态估计任务：
            一级目录为‘存储路径’所在根目录，二级目录必须只有'labels'和'images'两个目录，
            其中'labels'目录中必须包含的是以'.txt'结尾的标签文件，'images'必须包含的是以'.jpg'或'.png'或'.bmp'结尾的图像文件。
         ">📖
        </button>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>
      <div class="modal-body">
        <!-- 创建信息 -->
        <div class="info-group">
          <!--          <h3>创建信息</h3>-->
          <p><strong>ID:</strong> {{ dataset.id }}</p>
          <p><strong>类型:</strong> {{ dataset.type }}</p>
          <p><strong>描述:</strong> {{ dataset.description || '无描述' }}</p>
        </div>

        <!-- 数据集导入 -->
        <div class="info-group">
          <h3>数据集导入</h3>
          <p>
            需要提供压缩包或解压后文件中完整路径（包含目录仅一个数据集），不支持 zip、tar.gz 等压缩包和加密数据集，
            <a href="#" class="link">了解更多</a>
          </p>
          <div class="path-selector">
            <label>存储路径:</label>
            <input type="text" v-model="storagePath" placeholder="请输入存储路径" @input="logStoragePath"/>
            <button class="btn-browse" @click="openFileExplorer">🔍</button>
          </div>
          <!-- 数据集划分（仅对目标检测、实例分割、姿态估计任务显示） -->
          <div class="split-section" v-if="['目标检测', '实例分割', '姿态估计'].includes(dataset.type)">
            <h4>数据集划分</h4>
            <div class="split-status" :class="{ 'success': isImported }">
              <span :class="{ 'red': !isImported, 'green': isImported }">
                {{ isImported ? '成功导入' : '未导入' }}
              </span>
            </div>
            <div class="split-inputs">
              <div class="split-input">
                <label>训练集比例:</label>
                <input type="number" v-model.number="splitRatios.train" min="0" max="100"
                       @input="adjustRatios('train')"/>%
                <span v-if="isImported" class="count">训练集数量: {{ trainCount }}</span>
              </div>
              <div class="split-input">
                <label>验证集比例:</label>
                <input type="number" v-model.number="splitRatios.val" min="0" max="100" @input="adjustRatios('val')"/>%
                <span v-if="isImported" class="count">验证集数量: {{ valCount }}</span>
              </div>
              <div class="split-input">
                <label>测试集比例:</label>
                <input type="number" v-model.number="splitRatios.test" min="0" max="100" @input="adjustRatios('test')"/>%
                <span v-if="isImported" class="count">测试集数量: {{ testCount }}</span>
              </div>
            </div>
            <p v-if="splitError" class="error">{{ splitError }}</p>
          </div>
        </div>

        <!-- 数据预览 -->
        <div class="info-group">
          <h3>全部数据预览</h3>
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
        </div>


      </div>


      <div class="modal-footer">
        <button class="btn-confirm" @click="confirmImport" :disabled="!storagePath">确定导入</button>
        <button class="btn-cancel" @click="close">退出</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch} from 'vue'
import path from 'path-browserify'; // 引入 path 模块

// 当前页和分页控制
const currentPage = ref(1)
const itemsPerPage = 10
const allImages = ref([])
const emit = defineEmits(['import-success']);
const storagePath = ref('');
const splitRatios = ref({train: 70, val: 20, test: 10});
const splitError = ref('');
const isImported = ref(false);
const trainCount = ref(0);
const valCount = ref(0);
const testCount = ref(0);
const imageFiles = ref([]);
const datasetStatus = ref('未校验');

// 从路径中加载 images 目录下图像
async function loadImageFiles() {
  console.log("storagePath.value：", storagePath.value); //
  imageFiles.value = [];  // ✅ 清空上一次的图像
  currentPage.value = 1;  // ✅ 重置分页
  const imageDir = path.join(storagePath.value, 'images');
  const result = await window.electronAPI.getImagesFromDir(imageDir);
  if (result.success) {
    console.log("读取到的文件列表：", result.files); // ✅ 检查 base64 字段
    imageFiles.value = result.files; // files 是 [{ name, base64, fullPath }, ...]
    datasetStatus.value = '已校验';
    isImported.value = true;
  } else {
    alert(`读取图像失败：${result.error}`);
  }
}

// script 部分
const pagedImages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return imageFiles.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(imageFiles.value.length / itemsPerPage));

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}


const props = defineProps({
  visible: Boolean,
  dataset: Object,
});


function logStoragePath() {
  console.log('storagePath updated:', storagePath.value);
}

async function openFileExplorer() {
  const selectedPath = await window.electronAPI.openFolderDialog();
  if (selectedPath) {
    storagePath.value = selectedPath;
    logStoragePath();

  }
}

function close() {
  // ✅ 初始化所有状态
  currentPage.value = 1;
  allImages.value = [];
  storagePath.value = '';
  splitRatios.value = {train: 70, val: 20, test: 10};
  splitError.value = '';
  isImported.value = false;
  imageFiles.value = [];
  datasetStatus.value = '未校验';
  emit('close');
}

function adjustRatios() {
  const total = splitRatios.value.train + splitRatios.value.val + splitRatios.value.test;
  splitError.value = total !== 100 ? '训练集、验证集和测试集比例之和必须为 100%' : '';
  if (!splitError.value) calculateCounts();
}

async function calculateCounts() {
  const total = imageFiles.value.length;
  trainCount.value = Math.floor(total * (splitRatios.value.train / 100));
  valCount.value = Math.floor(total * (splitRatios.value.val / 100));
  testCount.value = total - trainCount.value - valCount.value;

  const shuffled = [...imageFiles.value];
  shuffled.sort(() => Math.random() - 0.5); // 打乱顺序

  const trainImages = shuffled.slice(0, trainCount.value);
  const valImages = shuffled.slice(trainCount.value, trainCount.value + valCount.value);
  const testImages = shuffled.slice(trainCount.value + valCount.value);

  const fileDataMap = {
    'train.txt': trainImages,
    'val.txt': valImages,
    'test.txt': testImages,
  };

  const result = await window.electronAPI.writeTextFiles(storagePath.value, fileDataMap);

  if (!result.success) {
    alert(`写入数据集划分文件失败：${result.error}`);
  }
}


async function confirmImport() {
  console.log('Confirming with storagePath:', storagePath.value);
  await loadImageFiles();
  if (splitError.value) {
    alert('请修正数据集划分比例！');
    return;
  }

  // 调用 preload 的 validateDataset
  const validationResult = await window.electronAPI.validateDataset(storagePath.value, props.dataset.type);
  if (!validationResult.success) {
    alert(`数据验证失败：${validationResult.error}`);
    return;
  }

  const imageFiles = validationResult.files;
  const totalCount = imageFiles.length;
  let trainCount = 0;
  let valCount = 0;
  let testCount = 0;

  // 需要划分训练集的类型
  if (['目标检测', '实例分割', '姿态估计'].includes(props.dataset.type)) {
    const splitResult = await window.electronAPI.splitDataset(
        storagePath.value,
        props.dataset.type,
        imageFiles,
        {
          train: parseFloat(splitRatios.value.train),
          val: parseFloat(splitRatios.value.val),
          test: parseFloat(splitRatios.value.val)
        }
    );

    if (!splitResult.success) {
      alert(`数据划分失败：${splitResult.error}`);
      return;
    }

    trainCount = splitResult.trainCount;
    valCount = splitResult.valCount;
    testCount = splitResult.testCount;
  }

  // 生成当前时间
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formatDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  // 构建写入数据集信息对象（保留传入的 props.dataset.id）
  const datasetInfo = {
    id: props.dataset.id,                 // 已在 Dataset.vue 中生成
    name: props.dataset.name,
    type: props.dataset.type,
    createdAt: formatDate,
    createdBy: datasetStatus.value,
    storagePath: storagePath.value,
    totalCount,
    trainCount,
    valCount,
    testCount
  };

  // 写入 datasets.json
  const writeResult = await window.electronAPI.writeDatasetInfo(datasetInfo);
  if (!writeResult.success) {
    alert(`写入数据集信息失败：${writeResult.error}`);
    return;
  }

  isImported.value = true;
  emit('import-success', props.dataset); // props.dataset 中应包含

}

</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 600px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: auto;
  max-height: 80vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.modal-body {
  padding: 16px;
}

.info-group {
  margin-bottom: 24px;
}

.info-group h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.info-group h4 {
  margin: 16px 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.info-group p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.info-group .link {
  color: #409EFF;
  text-decoration: none;
}

.info-group .link:hover {
  text-decoration: underline;
}

.path-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.path-selector label {
  font-size: 14px;
  color: #606266;
}

.path-selector input {
  flex: 1;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.split-section {
  margin-top: 16px;
}

.split-status {
  margin-bottom: 8px;
}

.split-status span {
  padding: 4px 8px;
  border-radius: 4px;
}

.split-status .red {
  background-color: #ff4d4f;
  color: white;
}

.split-status .green {
  background-color: #52c41a;
  color: white;
}

.split-inputs {
  display: flex;
  gap: 16px;
}

.split-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.split-input label {
  font-size: 14px;
  color: #606266;
}

.split-input input {
  width: 60px;
  padding: 4px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.split-input .count {
  font-size: 14px;
  color: #606266;
  margin-left: 8px;
}

.error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 8px;
}

.preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.preview-item {
  padding: 8px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.preview-structure {
  margin-top: 16px;
  padding: 8px;
  background: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  width: 100%;
}

.structure-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.structure-subitem {
  margin-left: 16px;
  font-size: 13px;
  color: #909399;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.btn-confirm {
  padding: 8px 16px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #66b1ff;
}

.btn-cancel {
  padding: 8px 16px;
  background: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #f5f7fa;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.doc-btn {
  font-size: 18px;
  background: none;
  border: none;
  cursor: pointer;
}

.preview-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 10px;
}

.pagination button {
  margin-right: 5px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  background: #f8f8f8;
  cursor: pointer;
}

.pagination button.active {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}
</style>
