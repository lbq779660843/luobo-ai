// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('electronAPI', {
    // 窗口控制
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),

    // 数据集操作
    readDatasets: () => {
        const datasetsPath = path.join(process.cwd(), 'datasets.json');
        if (fs.existsSync(datasetsPath)) {
            const raw = fs.readFileSync(datasetsPath, 'utf8');
            return raw.trim() ? JSON.parse(raw) : { total: 0, items: [] };
        }
        return { total: 0, items: [] };
    },

    writeDatasets: (data) => {
        const datasetsPath = path.join(process.cwd(), 'datasets.json');
        fs.writeFileSync(datasetsPath, JSON.stringify(data, null, 2), 'utf8');
    },

    deleteDatasetById: (id) => {
        const datasetsPath = path.join(process.cwd(), 'datasets.json');
        if (!fs.existsSync(datasetsPath)) return false;
        const raw = fs.readFileSync(datasetsPath, 'utf8');
        const data = raw.trim() ? JSON.parse(raw) : { items: [] };
        const idx = (data.items || []).findIndex(item => item.id === id);
        if (idx !== -1) {
            data.items.splice(idx, 1);
            data.total = data.items.length;
            fs.writeFileSync(datasetsPath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        }
        return false;
    },

    validateDataset: (storagePath, datasetType) => {
        const normalizedPath = path.normalize(storagePath);

        if (!fs.existsSync(normalizedPath)) {
            return { success: false, error: '路径不存在' };
        }

        let imageFiles = [];

        if (datasetType === '图像分类') {
            const subdirs = fs.readdirSync(normalizedPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const subdir of subdirs) {
                const files = fs.readdirSync(path.join(normalizedPath, subdir));
                for (const file of files) {
                    const ext = path.extname(file).toLowerCase();
                    if (!['.jpg', '.png', '.bmp'].includes(ext)) {
                        return { success: false, error: `图像分类任务：类别目录 ${subdir} 中包含不支持的文件 ${file}` };
                    }
                }
                imageFiles = imageFiles.concat(files);
            }

        } else if (['目标检测', '实例分割', '姿态估计'].includes(datasetType)) {
            const labelsPath = path.join(normalizedPath, 'labels');
            const imagesPath = path.join(normalizedPath, 'images');

            if (!fs.existsSync(labelsPath) || !fs.existsSync(imagesPath)) {
                return { success: false, error: 'labels 或 images 目录不存在' };
            }

            const labelFiles = fs.readdirSync(labelsPath);
            for (const file of labelFiles) {
                if (path.extname(file).toLowerCase() !== '.txt') {
                    fs.unlinkSync(path.join(labelsPath, file));
                }
            }

            const imageFilesTemp = fs.readdirSync(imagesPath);
            for (const file of imageFilesTemp) {
                if (!['.jpg', '.png', '.bmp'].includes(path.extname(file).toLowerCase())) {
                    fs.unlinkSync(path.join(imagesPath, file));
                } else {
                    imageFiles.push(file);
                }
            }

        } else {
            return { success: false, error: `不支持的数据集类型：${datasetType}` };
        }

        return { success: true, files: imageFiles };
    },

    splitDataset: (storagePath, datasetType, imageFiles, splitRatios) => {
        if (!['目标检测', '实例分割', '姿态估计'].includes(datasetType)) return;

        const total = imageFiles.length;
        const trainCount = Math.floor(total * (splitRatios.train / 100));
        const valCount = Math.floor(total * (splitRatios.val / 100));
        const testCount = total - trainCount - valCount;

        const shuffled = imageFiles.sort(() => Math.random() - 0.5);
        const train = shuffled.slice(0, trainCount);
        const val = shuffled.slice(trainCount, trainCount + valCount);
        const test = shuffled.slice(trainCount + valCount);

        const imagesPath = path.join(storagePath, 'images');

        try {
            fs.writeFileSync(path.join(storagePath, 'train.txt'), train.map(f => path.join(imagesPath, f)).join('\n'));
            fs.writeFileSync(path.join(storagePath, 'val.txt'), val.map(f => path.join(imagesPath, f)).join('\n'));
            fs.writeFileSync(path.join(storagePath, 'test.txt'), test.map(f => path.join(imagesPath, f)).join('\n'));
        } catch (err) {
            return { success: false, error: '无法写入数据集划分文件' };
        }

        return {
            success: true,
            trainCount,
            valCount,
            testCount
        };
    },

    writeDatasetInfo: (datasetInfo) => {
        const filePath = path.join(process.cwd(), 'datasets.json');
        let datasets = { total: 0, items: [] };

        try {
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                if (data.trim()) {
                    datasets = JSON.parse(data);
                }
            }

            // 查找是否已有相同 ID 的项
            const existingIndex = datasets.items.findIndex(item => item.id === datasetInfo.id);
            if (existingIndex !== -1) {
                // 如果找到了，进行替换
                datasets.items[existingIndex] = datasetInfo;
            } else {
                // 如果没找到，追加
                datasets.items.push(datasetInfo);
            }

            datasets.total = datasets.items.length;

            fs.writeFileSync(filePath, JSON.stringify(datasets, null, 2), 'utf8');
            return { success: true };
        } catch (err) {
            return { success: false, error: '写入 datasets.json 失败' };
        }
    },

    // 文件/路径操作：用于项目管理
    readProjects: () => {
        const filePath = path.join(process.cwd(), 'projects.json');
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            return raw.trim() ? JSON.parse(raw) : { total: 0, items: [] };
        }
        return { total: 0, items: [] };
    },

    writeProjects: (data) => {
        const filePath = path.join(process.cwd(), 'projects.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    },

    deleteProjectById: (id) => {
        const filePath = path.join(process.cwd(), 'projects.json');
        if (!fs.existsSync(filePath)) return false;

        const raw = fs.readFileSync(filePath, 'utf8');
        const data = raw.trim() ? JSON.parse(raw) : { items: [] };

        const idx = (data.items || []).findIndex(item => item.id === id);
        if (idx !== -1) {
            data.items.splice(idx, 1);
            data.total = data.items.length;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        }

        return false;
    },

    loadDatasets:  () => {
        const datasetsPath = path.join(process.cwd(), 'datasets.json');
        try {
            if (fs.existsSync(datasetsPath)) {
                const rawData = fs.readFileSync(datasetsPath, 'utf8');
                if (rawData.trim()) {
                    const data = JSON.parse(rawData);
                    return data;
                }
            }
        } catch (error) {
            console.error('读取 datasets.json 失败:', error);
        }
        return { items: [] };
    },

    readImageFiles: async (dirPath) => {
        try {
            const files = fs.readdirSync(dirPath)
            const imageFiles = files
                .filter((f) => /\.(jpg|jpeg|png|bmp)$/i.test(f))
                .map((f) => 'file://' + path.join(dirPath, f))
            return { success: true, files: imageFiles }
        } catch (error) {
            return { success: false, error: error.message }
        }
    },

    // 读取指定目录下的图像文件
    getImagesFromDir: async (dirPath) => {
        try {
            const files = fs.readdirSync(dirPath).filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.bmp'].includes(ext);
            });

            const images = files.map(file => {
                const fullPath = path.join(dirPath, file);
                const ext = path.extname(file).toLowerCase();
                const mime = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.bmp': 'image/bmp',
                }[ext] || 'application/octet-stream';

                const buffer = fs.readFileSync(fullPath);
                const base64 = buffer.toString('base64');
                const dataUrl = `data:${mime};base64,${base64}`;

                return {
                    name: file,
                    fullPath,
                    base64: dataUrl,
                };
            });

            return { success: true, files: images };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    writeTextFiles: (basePath, fileDataMap) => ipcRenderer.invoke('write-text-files', basePath, fileDataMap),

    writeYamlFile: (dirPath, content) => ipcRenderer.invoke('writeYamlFile', dirPath, content),

    startTraining: (config) => ipcRenderer.invoke('start-training', config),

    // 生成 task id
    generateTaskId: () => ipcRenderer.invoke('generate-task-id'),

    // 添加 task
    appendTask: (taskInfo) => ipcRenderer.invoke('append-task', taskInfo),

    readTasks: () => {
        const tasksPath = path.join(process.cwd(), 'tasks.json');
        if (fs.existsSync(tasksPath)) {
            const raw = fs.readFileSync(tasksPath, 'utf8');
            return raw.trim() ? JSON.parse(raw) : { total: 0, items: [] };
        }
        return { total: 0, items: [] };
    },

    // 建议也暴露这两个，避免后续功能报错
    writeTasks: (data) => {
        const tasksPath = path.join(process.cwd(), 'tasks.json');
        fs.writeFileSync(tasksPath, JSON.stringify(data, null, 2), 'utf8');
    },

    deleteTaskById: (id) => {
        const tasksPath = path.join(process.cwd(), 'tasks.json');
        if (fs.existsSync(tasksPath)) {
            const raw = fs.readFileSync(tasksPath, 'utf8');
            let data = raw.trim() ? JSON.parse(raw) : { total: 0, items: [] };
            const newItems = data.items.filter(task => task.id !== id);
            const updated = { total: newItems.length, items: newItems };
            fs.writeFileSync(tasksPath, JSON.stringify(updated, null, 2), 'utf8');
            return true;
        }
        return false;
    },

    openDir: (dirPath) => {
        if (fs.existsSync(dirPath)) {
            shell.openPath(dirPath); // 使用 shell 打开目录
        } else {
            console.warn('路径不存在:', dirPath);
        }
    }
});
