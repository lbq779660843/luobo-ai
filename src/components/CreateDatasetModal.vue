```vue
<template>
  <div class="modal" v-if="visible">
    <div class="modal-content">
      <div class="modal-header">
        <h2>新建数据集</h2>
        <button class="close-btn" @click="close">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>数据集名称:<span class="required">*</span></label>
          <input v-model="form.name" placeholder="我的新数据集" />
          <p v-if="errors.name" class="error">{{ errors.name }}</p>
        </div>
        <div class="form-group">
          <label>数据集描述:</label>
          <textarea v-model="form.description" placeholder="简单描述数据集用途"></textarea>
        </div>
        <div class="form-group">
          <label>任务类型:<span class="required">*</span></label>
          <div class="radio-group">
            <label>
              <input type="radio" v-model="form.task" value="图像分类"/> 图像分类
            </label>
            <label>
              <input type="radio" v-model="form.task" value="目标检测"/> 目标检测
            </label>
            <label>
              <input type="radio" v-model="form.task" value="姿态估计"/> 姿态估计
            </label>
            <label>
              <input type="radio" v-model="form.task" value="实例分割"/> 实例分割
            </label>
          </div>
          <p v-if="errors.task" class="error">{{ errors.task }}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-confirm" @click="create" :disabled="!isFormValid">创建</button>
        <button class="btn-cancel" @click="close">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['close', 'create']);

const form = ref({
  name: '',
  description: '',
  task: '图像分类', // 设置默认任务类型
});

const errors = ref({
  name: '',
  task: '',
});

// 表单验证
const isFormValid = computed(() => {
  let valid = true;
  errors.value.name = '';
  errors.value.task = '';

  if (!form.value.name.trim()) {
    errors.value.name = '数据集名称不能为空';
    valid = false;
  }

  if (!form.value.task) {
    errors.value.task = '请选择任务类型';
    valid = false;
  }

  return valid;
});

function close() {
  form.value = { name: '', description: '', task: '图像分类' };
  errors.value = { name: '', task: '' };
  emit('close');
}

function create() {
  if (!isFormValid.value) {
    return;
  }
  emit('create', form.value);
  close();
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
  overflow: hidden;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 80px;
  resize: none;
}

.radio-group {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
  gap: 16px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap; /* 防止文字换行 */
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
</style>
```