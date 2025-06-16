// start-desktop.js
const { execSync, spawn } = require('child_process');
const path = require('path');

// Step 1: 打包前端资源
console.log('📦 正在打包前端...');
execSync('npm run build', { stdio: 'inherit' });

// Step 2: 启动 Electron（生产模式）
console.log('🚀 启动 Electron...');
spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
});
