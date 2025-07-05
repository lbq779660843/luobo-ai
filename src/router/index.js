// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Train from '../views/Train.vue';
import Dataset from '../views/Dataset.vue';
import Task from '../views/Task.vue';
import Deploy from '../views/Deploy.vue';

const routes = [
    { path: '/', component: Home },
    {
        path: '/train',
        component: () => import('../views/Train.vue')
    },
    {
        path: '/dataset',
        component: () => import('../views/Dataset.vue')
    },
    {
        path: '/task',
        component: () => import('../views/Task.vue')
    },
    {
        path: '/deploy',
        component: () => import('../views/Deploy.vue')
    },
    {
        path: '/dataset-preview',
        name: 'DatasetPreview',
        component: () => import('../components/DatasetPreview.vue')
    },
    {
        path: '/tensorboard',
        name: 'TensorBoard',
        component: () => import('../views/TensorBoardView.vue')
    },



];

const router = createRouter({
    history: createWebHashHistory(), // 使用 Hash 模式方便 Electron 中加载
    routes
});

export default router;
