<template>
  <div class="container">
    <CardModule
        v-for="item in cards"
        :key="item.title"
        :title="item.title"
        :description="item.description"
        :image="item.image"
    >
      <template #actions>
        <button class="btn" @click="onClick(item)">进入</button>
      </template>
    </CardModule>
  </div>
  <div class="footer"></div>
</template>

<script setup>
import CardModule from '../components/CardModule.vue';
import trainImg from '../assets/train.png'
import deployImg from '../assets/deploy.png'
import dataImg from '../assets/data.png'
import taskManagementImg from '../assets/task_management.png';
import {useRouter} from 'vue-router';

const router = useRouter();
//console.log('process.cwd() ', process.cwd() )
const cards = [
  {title: '模型训练', description: '配置数据集，启动训练流程', image: trainImg, path: '/train'},
  {title: '数据集管理', description: '上传与标注您的数据', image: dataImg, path: '/dataset'},
  {title: '任务管理', description: '管理您的训练和部署任务', image: taskManagementImg, path: '/task'},
  {title: '模型部署', description: '将模型导出到推理环境', image: deployImg, path: '/deploy'},
];

function onClick(item) {
  router.push(item.path);
  //console.log('点击了：', item.title);
}
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: #f0f0f0;
}

.container {
  display: grid;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: repeat(2, auto); /* 两行 */
  gap: 20px;
  justify-content: center;
  align-items: center; /* 纵向居中 */
  padding: 8px 0;
  background: #F7F8FA;
  box-sizing: border-box;
}


.btn {
  padding: 6px 20px;
  background-color: #409EFF;
  color: white;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.btn:hover {
  background-color: #66b1ff;
}
</style>
