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
            <div class="section-header">
              <h3>训练参数设置</h3>
              <span class="tooltip-icon" title="
              主要调整的参数,无需特别专业的知识即可调整
                task: 任务类型
                data: 数据集配置路径 (如 lbws.yaml)
                epochs: 每批图像数，越大越高效
                Batch: 每次训练的批大小
                patience: 早停策略耐心值
                Image Size: 输入图像大小
                device: 指定GPU编号
                pretrained: 是否使用预训练模型
                workers: 数据加载线程数
                optimizer: 优化器类型
                single_cls: 是否将所有类别都视为一类(在数据集比较混乱时启用)
                project: 是否使用余弦学习率调度
                amp: 是否启用混合精度训练
                overlap_mask: 掩膜是否重叠(仅分割模型生效)
                mask_ratio: 掩膜比例(仅分割模型生效)
                dropout: dropout比例(仅分类模型生效)
            ">❔</span>
            </div>
            <div class="form-grid">

              <div class="form-item">
                <label>Task:</label>
                <input v-model="hyperParams.task" type="text" placeholder="segment"/>
              </div>

              <div class="form-item">
                <label>data:</label>
                <input v-model="hyperParams.data" type="text" placeholder="lbws-seg.yaml"/>
              </div>

              <div class="form-item">
                <label>Epochs:</label>
                <input v-model.number="hyperParams.epochs" type="number" placeholder="2000"/>
              </div>

              <div class="form-item">
                <label>Batch:</label>
                <input v-model.number="hyperParams.batch" type="number" placeholder="48"/>
              </div>

              <div class="form-item">
                <label>Image Size:</label>
                <input v-model.number="hyperParams.imgsz" type="number" placeholder="640"/>
              </div>

              <div class="form-item">
                <label>Device:</label>
                <input v-model.number="hyperParams.device" type="number" placeholder="0"/>
              </div>

              <div class="form-item">
                <label>Pretrained:</label>
                <input v-model="hyperParams.pretrained" type="text" placeholder="True"/>
              </div>

              <div class="form-item">
                <label>workers:</label>
                <input v-model.number="hyperParams.workers" type="number" placeholder="4"/>
              </div>


              <div class="form-item">
                <label>Patience:</label>
                <input v-model.number="hyperParams.patience" type="number" placeholder="500"/>
              </div>

              <div class="form-item">
                <label>optimizer:</label>
                <input v-model="hyperParams.optimizer" type="text" placeholder="auto"/>
              </div>

              <div class="form-item">
                <label>single_cls:</label>
                <input v-model="hyperParams.single_cls" type="text" placeholder="false"/>
              </div>

              <div class="form-item">
                <label>project:</label>
                <input v-model="hyperParams.project" type="text" placeholder="false"/>
              </div>

              <div class="form-item">
                <label>amp:</label>
                <input v-model="hyperParams.amp" type="text" placeholder="true"/>
              </div>

              <div class="form-item">
                <label>overlap_mask:</label>
                <input v-model="hyperParams.overlap_mask" type="text" placeholder="true"/>
              </div>

              <div class="form-item">
                <label>mask_ratio:</label>
                <input v-model.number="hyperParams.mask_ratio" type="number" placeholder="4"/>
              </div>

              <div class="form-item">
                <label>dropout:</label>
                <input v-model.number="hyperParams.dropout" type="number" placeholder="0.0"/>
              </div>
            </div>

            <p v-if="errors.hyperParams" class="error">{{ errors.hyperParams }}</p>
          </div>


          <!-- 步骤 3: 模型超参数设置 -->
          <div v-if="currentStep === 3">
            <h3>模型超参数设置</h3>
            <div class="form-grid-4col">

              <div class="form-item" v-for="(field, key) in trainParamFields" :key="key">
                <label :for="key">{{ field.label }}</label>
                <input
                    :id="key"
                    v-model.number="trainParams[key]"
                    :type="field.type || 'number'"
                    :step="field.step"
                    :placeholder="field.placeholder"
                />
              </div>

            </div>
            <p v-if="errors.trainParams" class="error">{{ errors.trainParams }}</p>
          </div>


          <!-- 步骤 4: 确认并启动 -->
          <div v-if="currentStep === 4">
            <h3>数据配置预览</h3>
            <div class="summary">
              <h4>数据集信息</h4>
              <p>存储路径: {{ selectedDataset?.storagePath || '未指定' }}</p>
              <h4>模型选择</h4>
              <p>选择模型: {{ selectedModel }}</p>
              <h4>训练参数设置</h4>
              <p>Task: {{ hyperParams.task }}</p>
              <p>data: {{ hyperParams.data }}</p>
              <p>Epochs: {{ hyperParams.epochs }}</p>
              <p>Batch: {{ hyperParams.batch }}</p>
              <p>Image Size: {{ hyperParams.imgsz }}</p>
              <p>Patience: {{ hyperParams.patience }}</p>
              <p>Device: {{ hyperParams.device }}</p>
              <p>Pretrained: {{ hyperParams.pretrained }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button v-if="currentStep > 1" class="btn-prev" @click="currentStep--">上一步</button>
        <button v-if="currentStep < 4" class="btn-next" @click="nextStep">下一步</button>
        <button v-if="currentStep === 4" class="btn-confirm" @click="startTraining">开始训练</button>
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
  data: 'dataset.yaml',
  epochs: 1000,
  patience: 100,
  batch: 56,
  imgsz: 640,
  device: 0,
  pretrained: true,
  workers: 4,
  optimizer: 'SGD',
  single_cls: false,
  project: 'runs',
  amp: true,
  overlap_mask: true,
  mask_ratio: 4,
  dropout: 0.0
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
  conf: 0.001,
  iou: 0.7,
  save_period: 300,
  half: false,
  plots: true,
});
const trainParamFields = {
  conf: {label: 'conf', step: 0.001, placeholder: '0.001'},
  iou: {label: 'iou', step: 0.1, placeholder: '0.7'},
  lr0: {label: 'LR0', step: 0.01, placeholder: '0.01'},
  lrf: {label: 'LRF', step: 0.01, placeholder: '0.01'},
  momentum: {label: 'Momentum', step: 0.001, placeholder: '0.937'},
  weight_decay: {label: 'Weight Decay', step: 0.0001, placeholder: '0.0005'},
  warmup_epochs: {label: 'Warmup Epochs', step: 0.1, placeholder: '3.0'},
  warmup_momentum: {label: 'Warmup Momentum', step: 0.1, placeholder: '0.8'},
  warmup_bias_lr: {label: 'Warmup Bias LR', step: 0.1, placeholder: '0.1'},
  box: {label: 'Box', step: 0.1, placeholder: '7.5'},
  cls: {label: 'Cls', step: 0.1, placeholder: '0.5'},
  dfl: {label: 'Dfl', step: 0.1, placeholder: '1.5'},
  pose: {label: 'Pose', step: 0.1, placeholder: '12.0'},
  kobj: {label: 'Kobj', step: 0.1, placeholder: '1.0'},
  label_smoothing: {label: 'Label Smoothing', step: 0.1, placeholder: '0.0'},
  hsv_h: {label: 'HSV H', step: 0.001, placeholder: '0.015'},
  hsv_s: {label: 'HSV S', step: 0.1, placeholder: '0.7'},
  hsv_v: {label: 'HSV V', step: 0.1, placeholder: '0.4'},
  degrees: {label: 'Degrees', step: 0.1, placeholder: '0.0'},
  translate: {label: 'Translate', step: 0.1, placeholder: '0.1'},
  scale: {label: 'Scale', step: 0.1, placeholder: '0.5'},
  shear: {label: 'Shear', step: 0.1, placeholder: '0.0'},
  perspective: {label: 'Perspective', step: 0.1, placeholder: '0.0'},
  flipud: {label: 'Flipud', step: 0.1, placeholder: '0.0'},
  fliplr: {label: 'Fliplr', step: 0.1, placeholder: '0.5'},
  bgr: {label: 'BGR', step: 0.1, placeholder: '0.0'},
  mosaic: {label: 'Mosaic', step: 0.1, placeholder: '1.0'},
  mixup: {label: 'Mixup', step: 0.1, placeholder: '0.0'},
  copy_paste: {label: 'Copy Paste', step: 0.1, placeholder: '0.0'},
  copy_paste_mode: {label: 'Copy Paste Mode', type: 'text', placeholder: 'flip'},
  auto_augment: {label: 'Auto Augment', type: 'text', placeholder: 'randaugment'},
  erasing: {label: 'Erasing', step: 0.1, placeholder: '0.4'},
  crop_fraction: {label: 'Crop Fraction', step: 0.1, placeholder: '1.0'},
};

// 模型选项
const modelOptions = {
  '图像分类': ['yolo11n-cls.pt', 'yolo11s-cls.pt', 'yolo11m-cls.pt', 'yolo11l-cls.pt', 'yolo11x-cls.pt'],
  '目标检测': ['yolo11n.pt', 'yolo11s.pt', 'yolo11m.pt', 'yolo11l.pt', 'yolo11x.pt'],
  '姿态估计': ['yolo11n-pose.pt', 'yolo11s-pose.pt', 'yolo11m-pose.pt', 'yolo11l-pose.pt', 'yolo11x-pose.pt',
    'yolo11n-pose.pt', 'yolo11s-pose.pt', 'yolo11m-pose.pt', 'yolo11l-pose.pt', 'yolo11x-pose.pt'],
  '实例分割': ['yolo11n-seg.pt', 'yolo11s-seg.pt', 'yolo11m-seg.pt', 'yolo11l-seg.pt', 'yolo11x-seg.pt',
    'yolov12n-seg.pt', 'yolov12s-seg.pt', 'yolov12m-seg.pt', 'yolov12l-seg.pt', 'yolov12x-seg.pt'],
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

async function startTraining() {
  const args = [];

  // 步骤 1：模型
  if (selectedModel.value) {
    const absModelPath = `E:\\Codes\\py\\yolov12-Seg\\${selectedModel.value}`;  // 绝对路径拼接
    args.push('--model', absModelPath);
  }

// 步骤 2：添加 --data 参数为绝对路径
  if (selectedDataset.value?.storagePath) {
    const dataYamlPath = `${selectedDataset.value.storagePath}/dataset.yaml`;
    args.push('--data', dataYamlPath);
  }

// 步骤 2：其余超参数
  const hyperKeys = ['epochs', 'imgsz', 'batch', 'patience', 'device', 'workers', 'optimizer', 'mask_ratio', 'project'];
  for (const key of hyperKeys) {
    const value = hyperParams.value[key];
    if (value !== undefined && value !== '') {
      args.push(`--${key}`, String(value));
    }
  }


  // 步骤 3：训练参数 (trainParams)
  const trainKeys = [
    'lr0', 'momentum', 'weight_decay', 'hsv_h', 'hsv_s', 'hsv_v', 'degrees',
    'translate', 'scale', 'mosaic', 'copy_paste', 'erasing', 'warmup_epochs',
    'close_mosaic', 'save_period'
  ];
  for (const key of trainKeys) {
    const value = trainParams.value[key];
    if (value !== undefined && value !== '') {
      args.push(`--${key}`, String(value));
    }
  }

  const config = {
    pythonPath: 'D:\\conda\\envs\\yolov12-Seg\\python.exe',
    scriptPath: 'E:\\Codes\\py\\yolov12-Seg\\lbws_train.py',
    args: args,
    workingDirectory: 'E:\\Codes\\py\\yolov12-Seg'
  };

  const result = await window.electronAPI.startTraining(config);

  // ✅ 后续记录任务
  if (result.success) {
    alert('训练已启动');

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const taskInfo = {
      id: await window.electronAPI.generateTaskId(),
      name: props.project.name,
      status: '在训练',
      createdAt: timestamp,
      dir: selectedDataset.value.storagePath
    };

    const writeRes = await window.electronAPI.appendTask(taskInfo);
    if (!writeRes.success) {
      alert(`写入任务失败：${writeRes.error}`);
    }
  } else {
    alert(`训练启动失败：${result.error}`);
  }
}



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
  // if (isNaN(trainParams.value.nbs) || trainParams.value.nbs <= 0) errors.value.trainParams = 'NBS 必须为正数';
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
    if (props.project.type !== selectedDataset.value?.type) {
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

function close() {
  currentStep.value = 1;
  selectedDatasetId.value = '';
  selectedDataset.value = null;
  datasetStats.value = {total: 0, train: 0, val: 0, test: 0};
  selectedModel.value = '';
  hyperParams.value = {
    task: 'segment',
    data: 'dataset.yaml',
    epochs: 1000,
    patience: 100,
    batch: 56,
    imgsz: 640,
    device: 0,
    pretrained: true,
    workers: 4,
    optimizer: 'SGD',
    single_cls: false,
    project: 'runs',
    amp: true,
    overlap_mask: true,
    mask_ratio: 4,
    dropout: 0.0
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
    close_mosaic: 20,
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

.form-grid-4col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px 20px;
  margin-top: 10px;
}

.form-item {
  display: flex;
  align-items: center;
}

.form-item label {
  white-space: nowrap;
  margin-right: 10px;
  font-weight: 500;
  width: 120px;
}

.form-item input {
  width: 120%;
  padding: 6px 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.section-header {
  display: flex;
  //align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.tooltip-icon {
  display: inline-block;
  background-color: #f0f0f0;
  color: #333;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  text-align: center;
  line-height: 20px;
  cursor: help;
  font-weight: bold;
  border: 1px solid #ccc;
}

</style>
```