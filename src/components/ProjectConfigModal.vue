```vue
<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <div class="modal-header">
        <h2>项目配置与训练 - {{ project.name }}</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="modal-body">
        <!-- 步骤导航 -->
        <div class="steps">
          <div class="step" :class="{ active: currentStep === 1 }">1. 数据集和模型选择</div>
          <div class="step" :class="{ active: currentStep === 2 }">2. 训练参数设置</div>
          <div class="step" :class="{ active: currentStep === 3 }">3. 模型超参数设置</div>
          <div class="step" :class="{ active: currentStep === 4 }">4. 确认并启动</div>
        </div>

        <!-- 步骤内容 -->
        <div class="step-content">
          <!-- 合并后的步骤 1+2 -->
          <div v-if="currentStep === 1">
            <!-- 步骤标题 -->
            <h3>数据集和模型选择</h3>

            <!-- 数据集选择行 -->
            <div class="form-group horizontal-group">
              <label for="dataset">数据集：</label>
              <select v-model="selectedDatasetId" @change="loadDatasetStats" class="dataset-select">
                <option value="">请选择数据集</option>
                <option v-for="d in datasets" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </div>
            <div class="error-msg" v-if="errors.dataset">{{ errors.dataset }}</div>

            <!-- 路径 + 状态 + 分布合并显示 -->
            <div class="dataset-info" v-if="selectedDataset">
              <p><strong>数据集根目录：</strong>{{ selectedDataset.storagePath }}</p>
              <p><strong>数据集类型：</strong>{{ selectedDataset.type }}</p>
              <p><strong>数据集状态：</strong>{{ selectedDataset.createdBy }}</p>
              <p>
                <strong>数据集样本分布：</strong>
                Train: {{ datasetStats.train }}，
                Val: {{ datasetStats.val }}，
                Test: {{ datasetStats.test }}，
                Total: {{ computedTotal }}
              </p>
            </div>

            <!-- 模型选择 -->
            <div class="form-group horizontal-group">
              <label for="model">模型：</label>
              <select v-model="selectedModel" @change="validateModel" class="dataset-select">
                <option value="" disabled>请选择模型</option>
                <option v-for="model in availableModels" :key="model" :value="model">
                  {{ model }}
                </option>
              </select>
            </div>
            <div class="error-msg" v-if="errors.model">{{ errors.model }}</div>
          </div>

          <!-- 步骤 2: 训练参数设置 -->
          <div v-if="currentStep === 2">
            <h3>训练参数设置</h3>
            <div class="form-grid">

              <div class="form-item">
                <label>Task:</label>
                <input v-model="hyperParams.task" type="text" placeholder="segment" />
              </div>

              <div class="form-item">
                <label>Epochs:</label>
                <input v-model.number="hyperParams.epochs" type="number" placeholder="2000" />
              </div>

              <div class="form-item">
                <label>Patience:</label>
                <input v-model.number="hyperParams.patience" type="number" placeholder="500" />
              </div>

              <div class="form-item">
                <label>Batch:</label>
                <input v-model.number="hyperParams.batch" type="number" placeholder="48" />
              </div>

              <div class="form-item">
                <label>Image Size:</label>
                <input v-model.number="hyperParams.imgsz" type="number" placeholder="640" />
              </div>

              <div class="form-item">
                <label>Save:</label>
                <input v-model="hyperParams.save" type="text" placeholder="True" />
              </div>

              <div class="form-item">
                <label>Cache:</label>
                <input v-model="hyperParams.cache" type="text" placeholder="True" />
              </div>

              <div class="form-item">
                <label>Device:</label>
                <input v-model.number="hyperParams.device" type="number" placeholder="0" />
              </div>

              <div class="form-item">
                <label>Pretrained:</label>
                <input v-model="hyperParams.pretrained" type="text" placeholder="True" />
              </div>

              <div class="form-item">
                <label>Cos LR:</label>
                <input v-model="hyperParams.cos_lr" type="text" placeholder="True" />
              </div>

            </div>

            <p v-if="errors.hyperParams" class="error">{{ errors.hyperParams }}</p>
          </div>


          <!-- 步骤 3: 模型超参数设置 -->
          <div v-if="currentStep === 3">
            <h3>模型超参数设置</h3>
            <div class="form-group">
              <label>LR0:</label>
              <input v-model.number="trainParams.lr0" type="number" step="0.01" placeholder="0.01"/>
            </div>
            <div class="form-group">
              <label>LRF:</label>
              <input v-model.number="trainParams.lrf" type="number" step="0.01" placeholder="0.01"/>
            </div>
            <div class="form-group">
              <label>Momentum:</label>
              <input v-model.number="trainParams.momentum" type="number" step="0.001" placeholder="0.937"/>
            </div>
            <div class="form-group">
              <label>Weight Decay:</label>
              <input v-model.number="trainParams.weight_decay" type="number" step="0.0001" placeholder="0.0005"/>
            </div>
            <div class="form-group">
              <label>Warmup Epochs:</label>
              <input v-model.number="trainParams.warmup_epochs" type="number" step="0.1" placeholder="3.0"/>
            </div>
            <div class="form-group">
              <label>Warmup Momentum:</label>
              <input v-model.number="trainParams.warmup_momentum" type="number" step="0.1" placeholder="0.8"/>
            </div>
            <div class="form-group">
              <label>Warmup Bias LR:</label>
              <input v-model.number="trainParams.warmup_bias_lr" type="number" step="0.1" placeholder="0.1"/>
            </div>
            <div class="form-group">
              <label>Box:</label>
              <input v-model.number="trainParams.box" type="number" step="0.1" placeholder="7.5"/>
            </div>
            <div class="form-group">
              <label>Cls:</label>
              <input v-model.number="trainParams.cls" type="number" step="0.1" placeholder="0.5"/>
            </div>
            <div class="form-group">
              <label>Dfl:</label>
              <input v-model.number="trainParams.dfl" type="number" step="0.1" placeholder="1.5"/>
            </div>
            <div class="form-group">
              <label>Pose:</label>
              <input v-model.number="trainParams.pose" type="number" step="0.1" placeholder="12.0"/>
            </div>
            <div class="form-group">
              <label>Kobj:</label>
              <input v-model.number="trainParams.kobj" type="number" step="0.1" placeholder="1.0"/>
            </div>
            <div class="form-group">
              <label>Label Smoothing:</label>
              <input v-model.number="trainParams.label_smoothing" type="number" step="0.1" placeholder="0.0"/>
            </div>
            <div class="form-group">
              <label>NBS:</label>
              <input v-model.number="trainParams.nbs" type="number" placeholder="64"/>
            </div>
            <div class="form-group">
              <label>HSV H:</label>
              <input v-model.number="trainParams.hsv_h" type="number" step="0.001" placeholder="0.015"/>
            </div>
            <div class="form-group">
              <label>HSV S:</label>
              <input v-model.number="trainParams.hsv_s" type="number" step="0.1" placeholder="0.7"/>
            </div>
            <div class="form-group">
              <label>HSV V:</label>
              <input v-model.number="trainParams.hsv_v" type="number" step="0.1" placeholder="0.4"/>
            </div>
            <div class="form-group">
              <label>Degrees:</label>
              <input v-model.number="trainParams.degrees" type="number" step="0.1" placeholder="0.0"/>
            </div>
            <div class="form-group">
              <label>Translate:</label>
              <input v-model.number="trainParams.translate" type="number" step="0.1" placeholder="0.1"/>
            </div>
            <div class="form-group">
              <label>Scale:</label>
              <input v-model.number="trainParams.scale" type="number" step="0.1" placeholder="0.5"/>
            </div>
            <div class="form-group">
              <label>Shear:</label>
              <input v-model.number="trainParams.shear" type="number" step="0.1" placeholder="0.0"/>
            </div>
            <div class="form-group">
              <label>Perspective:</label>
              <input v-model.number="trainParams.perspective" type="number" step="0.1" placeholder="0.0"/>
            </div>
            <div class="form-group">
              <label>Flipud:</label>
              <input v-model.number="trainParams.flipud" type="number" step="0.1" placeholder="0.0"/>
            </div>
            <div class="form-group">
              <label>Fliplr:</label>
              <input v-model.number="trainParams.fliplr" type="number" step="0.1" placeholder="0.5"/>
            </div>
            <div class="form-group">
              <label>BGR:</label>
              <input v-model.number="trainParams.bgr" type="number" step="0.1" placeholder="0.0"/>
            </div>
            <div class="form-group">
              <label>Mosaic:</label>
              <input v-model.number="trainParams.mosaic" type="number" step="0.1" placeholder="1.0"/>
            </div>
            <div class="form-group">
              <label>Mixup:</label>
              <input v-model.number="trainParams.mixup" type="number" step="0.1" placeholder="0.0"/>
            </div>
            <div class="form-group">
              <label>Copy Paste:</label>
              <input v-model.number="trainParams.copy_paste" type="number" step="0.1" placeholder="0.0"/>
            </div>
            <div class="form-group">
              <label>Copy Paste Mode:</label>
              <input v-model="trainParams.copy_paste_mode" type="text" placeholder="flip"/>
            </div>
            <div class="form-group">
              <label>Auto Augment:</label>
              <input v-model="trainParams.auto_augment" type="text" placeholder="randaugment"/>
            </div>
            <div class="form-group">
              <label>Erasing:</label>
              <input v-model.number="trainParams.erasing" type="number" step="0.1" placeholder="0.4"/>
            </div>
            <div class="form-group">
              <label>Crop Fraction:</label>
              <input v-model.number="trainParams.crop_fraction" type="number" step="0.1" placeholder="1.0"/>
            </div>
            <p v-if="errors.trainParams" class="error">{{ errors.trainParams }}</p>
          </div>

          <!-- 步骤 5: 确认并启动 -->
          <div v-if="currentStep === 4">
            <h3>确认并启动</h3>
            <div class="summary">
              <h4>数据集信息</h4>
              <p>存储路径: {{ selectedDataset?.storagePath || '未指定' }}</p>
              <h4>模型选择</h4>
              <p>选择模型: {{ selectedModel + '.pth' }}</p>
              <h4>训练参数设置</h4>
              <p>Task: {{ hyperParams.task }}</p>
              <p>Epochs: {{ hyperParams.epochs }}</p>
              <p>Patience: {{ hyperParams.patience }}</p>
              <p>Batch: {{ hyperParams.batch }}</p>
              <p>Image Size: {{ hyperParams.imgsz }}</p>
              <p>Save: {{ hyperParams.save }}</p>
              <p>Cache: {{ hyperParams.cache }}</p>
              <p>Device: {{ hyperParams.device }}</p>
              <p>Pretrained: {{ hyperParams.pretrained }}</p>
              <p>Cos LR: {{ hyperParams.cos_lr }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button v-if="currentStep > 1" class="btn-prev" @click="currentStep--">上一步</button>
        <button v-if="currentStep < 5" class="btn-next" @click="nextStep">下一步</button>
        <button v-if="currentStep === 4" class="btn-confirm" @click="confirmConfig">开始训练</button>
        <button class="btn-cancel" @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue';

const props = defineProps({
  visible: Boolean,
  project: Object,
});

const emit = defineEmits(['close', 'config-success']);

const currentStep = ref(1);
const selectedDatasetId = ref('');
const datasets = ref([]);
const selectedDataset = ref(null);
const datasetStats = ref({total: 0, train: 0, val: 0, test: 0});
const selectedModel = ref('');
const errors = ref({dataset: '', model: '', hyperParams: '', trainParams: ''});

// 训练参数设置
const hyperParams = ref({
  task: 'segment',
  epochs: 1000,
  patience: 100,
  batch: 48,
  imgsz: 640,
  save: true,
  cache: false,
  device: 0,
  pretrained: true,
  cos_lr: false,
});

// 模型超参数设置
const trainParams = ref({
  lr0: 0.01,
  lrf: 0.01,
  momentum: 0.937,
  weight_decay: 0.0005,
  warmup_epochs: 3.0,
  warmup_momentum: 0.8,
  warmup_bias_lr: 0.1,
  box: 7.5,
  cls: 0.5,
  dfl: 1.5,
  pose: 12.0,
  kobj: 1.0,
  label_smoothing: 0.0,
  nbs: 64,
  hsv_h: 0.015,
  hsv_s: 0.7,
  hsv_v: 0.4,
  degrees: 0.0,
  translate: 0.1,
  scale: 0.5,
  shear: 0.0,
  perspective: 0.0,
  flipud: 0.0,
  fliplr: 0.5,
  bgr: 0.0,
  mosaic: 1.0,
  mixup: 0.0,
  copy_paste: 0.0,
  copy_paste_mode: 'flip',
  auto_augment: 'randaugment',
  erasing: 0.4,
  crop_fraction: 1.0,
});

// 模型选项
const modelOptions = {
  '图像分类': ['YOLO11n-cls', 'YOLO11s-cls', 'YOLO11m-cls', 'YOLO11l-cls', 'YOLO11x-cls'],
  '目标检测': ['YOLO11n', 'YOLO11s', 'YOLO11m', 'YOLO11l', 'YOLO11x'],
  '姿态估计': ['YOLO11n-pose', 'YOLO11s-pose', 'YOLO11m-pose', 'YOLO11l-pose', 'YOLO11x-pose',
    'YOLO11n-pose', 'YOLO11s-pose', 'YOLO11m-pose', 'YOLO11l-pose', 'YOLO11x-pose'],
  '实例分割': ['YOLO11n-seg', 'YOLO11s-seg', 'YOLO11m-seg', 'YOLO11l-seg', 'YOLO11x-seg',
    'YOLO12n-seg', 'YOLO12s-seg', 'YOLO12m-seg', 'YOLO12l-seg', 'YOLO12x-seg'],
};

// 计算可用模型
const availableModels = computed(() => {
  const type = selectedDataset.value?.type || '';
  return modelOptions[type] || [];
});

// 计算标定集总数
const computedTotal = computed(() => {
  return (datasetStats.value.train || 0) + (datasetStats.value.val || 0) + (datasetStats.value.test || 0);
});

// 加载 datasets.json
async function loadDatasets() {
  try {
    const data = await window.electronAPI.loadDatasets();
    datasets.value = data.items || [];
  } catch (error) {
    console.error('加载数据集失败:', error);
    datasets.value = [];
  }
}

// 加载选定数据集的统计信息
function loadDatasetStats() {
  errors.value.dataset = '';
  if (!selectedDatasetId.value) {
    selectedDataset.value = null;
    datasetStats.value = {total: 0, train: 0, val: 0, test: 0};
    selectedModel.value = '';
    return;
  }

  const dataset = datasets.value.find(d => d.id === selectedDatasetId.value);
  if (!dataset) {
    errors.value.dataset = '未找到选定数据集';
    selectedDataset.value = null;
    datasetStats.value = {total: 0, train: 0, val: 0, test: 0};
    selectedModel.value = '';
    return;
  }
  //console.log(props.project.type , selectedDataset.value?.type);

  selectedDataset.value = dataset;
  datasetStats.value = {
    train: dataset.trainCount || 0,
    val: dataset.valCount || 0,
    test: dataset.testCount || 0,
    get total() {
      return this.train + this.val + this.test;
    },
  };
  selectedModel.value = availableModels.value[0] || ''; // 默认选择第一个模型
  hyperParams.value.task = dataset.type || 'segment'; // 设置 task 基于数据集类型
}

// 验证模型选择
function validateModel() {
  errors.value.model = !selectedModel.value ? '请选择一个模型' : '';
}

// 验证超参数
function validateHyperParams() {
  errors.value.hyperParams = '';
  if (!hyperParams.value.task) errors.value.hyperParams = 'Task 不能为空';
  if (isNaN(hyperParams.value.epochs) || hyperParams.value.epochs <= 0) errors.value.hyperParams = 'Epochs 必须为正数';
  if (isNaN(hyperParams.value.patience) || hyperParams.value.patience < 0) errors.value.hyperParams = 'Patience 不能为负数';
  if (isNaN(hyperParams.value.batch) || hyperParams.value.batch <= 0) errors.value.hyperParams = 'Batch 必须为正数';
  if (isNaN(hyperParams.value.imgsz) || hyperParams.value.imgsz <= 0) errors.value.hyperParams = 'Image Size 必须为正数';
  if (isNaN(hyperParams.value.device) || hyperParams.value.device < 0) errors.value.hyperParams = 'Device 不能为负数';
  return !errors.value.hyperParams;
}

// 验证训练参数
function validateTrainParams() {
  errors.value.trainParams = '';
  if (isNaN(trainParams.value.lr0) || trainParams.value.lr0 < 0) errors.value.trainParams = 'LR0 不能为负数';
  if (isNaN(trainParams.value.lrf) || trainParams.value.lrf < 0) errors.value.trainParams = 'LRF 不能为负数';
  if (isNaN(trainParams.value.momentum) || trainParams.value.momentum < 0 || trainParams.value.momentum > 1) errors.value.trainParams = 'Momentum 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.weight_decay) || trainParams.value.weight_decay < 0) errors.value.trainParams = 'Weight Decay 不能为负数';
  if (isNaN(trainParams.value.warmup_epochs) || trainParams.value.warmup_epochs < 0) errors.value.trainParams = 'Warmup Epochs 不能为负数';
  if (isNaN(trainParams.value.warmup_momentum) || trainParams.value.warmup_momentum < 0 || trainParams.value.warmup_momentum > 1) errors.value.trainParams = 'Warmup Momentum 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.warmup_bias_lr) || trainParams.value.warmup_bias_lr < 0) errors.value.trainParams = 'Warmup Bias LR 不能为负数';
  if (isNaN(trainParams.value.box) || trainParams.value.box < 0) errors.value.trainParams = 'Box 不能为负数';
  if (isNaN(trainParams.value.cls) || trainParams.value.cls < 0) errors.value.trainParams = 'Cls 不能为负数';
  if (isNaN(trainParams.value.dfl) || trainParams.value.dfl < 0) errors.value.trainParams = 'Dfl 不能为负数';
  if (isNaN(trainParams.value.pose) || trainParams.value.pose < 0) errors.value.trainParams = 'Pose 不能为负数';
  if (isNaN(trainParams.value.kobj) || trainParams.value.kobj < 0) errors.value.trainParams = 'Kobj 不能为负数';
  if (isNaN(trainParams.value.label_smoothing) || trainParams.value.label_smoothing < 0) errors.value.trainParams = 'Label Smoothing 不能为负数';
  if (isNaN(trainParams.value.nbs) || trainParams.value.nbs <= 0) errors.value.trainParams = 'NBS 必须为正数';
  if (isNaN(trainParams.value.hsv_h) || trainParams.value.hsv_h < 0) errors.value.trainParams = 'HSV H 不能为负数';
  if (isNaN(trainParams.value.hsv_s) || trainParams.value.hsv_s < 0 || trainParams.value.hsv_s > 1) errors.value.trainParams = 'HSV S 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.hsv_v) || trainParams.value.hsv_v < 0 || trainParams.value.hsv_v > 1) errors.value.trainParams = 'HSV V 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.degrees) || trainParams.value.degrees < 0) errors.value.trainParams = 'Degrees 不能为负数';
  if (isNaN(trainParams.value.translate) || trainParams.value.translate < 0 || trainParams.value.translate > 1) errors.value.trainParams = 'Translate 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.scale) || trainParams.value.scale < 0 || trainParams.value.scale > 1) errors.value.trainParams = 'Scale 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.shear) || trainParams.value.shear < 0) errors.value.trainParams = 'Shear 不能为负数';
  if (isNaN(trainParams.value.perspective) || trainParams.value.perspective < 0) errors.value.trainParams = 'Perspective 不能为负数';
  if (isNaN(trainParams.value.flipud) || trainParams.value.flipud < 0 || trainParams.value.flipud > 1) errors.value.trainParams = 'Flipud 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.fliplr) || trainParams.value.fliplr < 0 || trainParams.value.fliplr > 1) errors.value.trainParams = 'Fliplr 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.bgr) || trainParams.value.bgr < 0 || trainParams.value.bgr > 1) errors.value.trainParams = 'BGR 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.mosaic) || trainParams.value.mosaic < 0 || trainParams.value.mosaic > 1) errors.value.trainParams = 'Mosaic 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.mixup) || trainParams.value.mixup < 0 || trainParams.value.mixup > 1) errors.value.trainParams = 'Mixup 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.copy_paste) || trainParams.value.copy_paste < 0 || trainParams.value.copy_paste > 1) errors.value.trainParams = 'Copy Paste 必须在 0 到 1 之间';
  if (!trainParams.value.copy_paste_mode) errors.value.trainParams = 'Copy Paste Mode 不能为空';
  if (!trainParams.value.auto_augment) errors.value.trainParams = 'Auto Augment 不能为空';
  if (isNaN(trainParams.value.erasing) || trainParams.value.erasing < 0 || trainParams.value.erasing > 1) errors.value.trainParams = 'Erasing 必须在 0 到 1 之间';
  if (isNaN(trainParams.value.crop_fraction) || trainParams.value.crop_fraction < 0 || trainParams.value.crop_fraction > 1) errors.value.trainParams = 'Crop Fraction 必须在 0 到 1 之间';
  return !errors.value.trainParams;
}

// 下一步（验证当前步骤）
function nextStep() {
  if (currentStep.value === 1) {
    if (!selectedDatasetId.value) {
      alert('请选择一个数据集!')
      //errors.value.dataset = '请选择一个数据集';
      return;
    }
    if(props.project.type !== selectedDataset.value?.type){
      alert('数据集类型于任务类型不匹配，请重新选择数据集!')
      return;
    }
  } else if (currentStep.value === 2) {
    validateModel();
    if (errors.value.model) return;
  } else if (currentStep.value === 3) {
    if (!validateHyperParams()) return;
  } else if (currentStep.value === 4) {
    if (!validateTrainParams()) return;
  }
  if (currentStep.value < 5) {
    currentStep.value++;
  }
}

// 启动训练
function confirmConfig() {
  emit('config-success', {
    ...props.project,
    datasetId: selectedDatasetId.value,
    model: selectedModel.value ?? '',
    hyperParams: {...hyperParams.value},
    trainParams: {...trainParams.value},
  });
  close();
}

function close() {
  currentStep.value = 1;
  selectedDatasetId.value = '';
  selectedDataset.value = null;
  datasetStats.value = {total: 0, train: 0, val: 0, test: 0};
  selectedModel.value = '';
  hyperParams.value = {
    task: 'segment',
    epochs: 1000,
    patience: 100,
    batch: 48,
    imgsz: 640,
    save: true,
    cache: false,
    device: 0,
    pretrained: true,
    cos_lr: false,
  };
  trainParams.value = {
    lr0: 0.01,
    lrf: 0.01,
    momentum: 0.937,
    weight_decay: 0.0005,
    warmup_epochs: 3.0,
    warmup_momentum: 0.8,
    warmup_bias_lr: 0.1,
    box: 7.5,
    cls: 0.5,
    dfl: 1.5,
    pose: 12.0,
    kobj: 1.0,
    label_smoothing: 0.0,
    nbs: 64,
    hsv_h: 0.015,
    hsv_s: 0.7,
    hsv_v: 0.4,
    degrees: 0.0,
    translate: 0.1,
    scale: 0.5,
    shear: 0.0,
    perspective: 0.0,
    flipud: 0.0,
    fliplr: 0.5,
    bgr: 0.0,
    mosaic: 1.0,
    mixup: 0.0,
    copy_paste: 0.0,
    copy_paste_mode: 'flip',
    auto_augment: 'randaugment',
    erasing: 0.4,
    crop_fraction: 1.0,
  };
  errors.value = {dataset: '', model: '', hyperParams: '', trainParams: ''};
  emit('close');
}

// 组件加载时初始化
onMounted(() => {
  loadDatasets();
});
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 20px; /* 行列间距 */
  margin-top: 10px;
}

.form-item {
  display: flex;
  align-items: center;
}

.form-item label {
  white-space: nowrap;
  margin-right: 8px;
  font-weight: 500;
  width: 80px; /* 控制标签宽度一致 */
}

.form-item input {
  flex: 1;
  padding: 6px 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error {
  color: red;
  font-size: 13px;
  margin-top: 10px;
}

.form-group.horizontal-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.dataset-select {
  flex-grow: 1;
  padding: 6px;
  font-size: 14px;
}

.dataset-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f6f8fa;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.error-msg {
  color: red;
  font-size: 13px;
  margin-top: 5px;
}

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
  width: 700px;
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

.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.step {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: #f5f7fa;
  color: #909399;
  border-radius: 4px;
  font-size: 14px;
}

.step.active {
  background: #409EFF;
  color: white;
}

.step-content {
  min-height: 200px;
}

.step-content h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.summary h4 {
  margin: 8px 0 4px;
  font-size: 14px;
  color: #303133;
}

.summary p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
}

.form-group .required {
  color: #f56c6c;
  margin-left: 4px;
}

.form-group input[type="text"],
.form-group input[type="number"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input[type="checkbox"] {
  margin-left: 8px;
}

.path-info {
  margin-top: 16px;
  padding: 12px;
  background: #e6f7ff;
  border-radius: 4px;
}

.path-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.form-group.horizontal-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.dataset-select {
  flex-grow: 1;
  padding: 6px;
  font-size: 14px;
}

.dataset-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f6f8fa;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
}

.error-msg {
  color: red;
  font-size: 13px;
  margin-top: 5px;
}


.stats {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.stats p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #ebeef5;
}

.btn-prev,
.btn-next,
.btn-confirm {
  padding: 8px 16px;
  background-color: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-prev:hover,
.btn-next:hover,
.btn-confirm:hover {
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
</style>
```