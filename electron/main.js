const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
let win;

const projectRootPath = path.resolve(__dirname, '..'); // 回到项目根目录
const TASKS_PATH = path.join(projectRootPath, 'tasks.json');

function createWindow() {
    win = new BrowserWindow({
        width: 1200, // 设置较大初始宽度
        height: 960, // 设置较大初始高度
        minWidth: 800, // 设置最小宽度，防止窗口过小
        minHeight: 600, // 设置最小高度，防止窗口过小
        frame: false, // ✅ 禁用系统自带标题栏
        autoHideMenuBar: true,  // 隐藏菜单栏
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,  // ✅ 关闭 remote（已弃用）
            sandbox: false,             // ✅ 关闭 sandbox 才能用 fs 等 Node 模块
        }
    });

    //win.loadFile('dist/index.html'); // 确保指向正确的构建文件
    win.loadURL('http://localhost:5173');  // 或者使用 `loadFile()` 加载本地文件
    // 打开开发工具
    win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: '选择数据集存储路径',
    });
    return !result.canceled && result.filePaths.length > 0 ? result.filePaths[0] : null;
});

ipcMain.on('window-minimize', () => win.minimize());

ipcMain.on('window-maximize', () => {
    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
});

ipcMain.on('window-close', () => win.close());

ipcMain.handle('write-text-files', async (event, basePath, fileDataMap) => {
    try {
        for (const [filename, lines] of Object.entries(fileDataMap)) {
            const fullPath = path.join(basePath, filename);
            fs.writeFileSync(fullPath, lines.join('\n'), 'utf-8');
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('writeYamlFile', async (_, dirPath, content) => {
    try {
        const filePath = path.join(dirPath, 'dataset.yaml');
        fs.writeFileSync(filePath, content, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('start-training', async (_, trainingConfig) => {
    try {
        const pythonExe = trainingConfig.pythonPath;
        const scriptPath = trainingConfig.scriptPath;
        const args = trainingConfig.args || [];

        console.log('启动训练命令:', pythonExe, scriptPath, ...args);

        const trainProcess = spawn(pythonExe, [scriptPath, ...args], {
            cwd: trainingConfig.workingDirectory || undefined,
            shell: true,
        });

        trainProcess.stdout.on('data', (data) => {
            console.log(`训练输出: ${data}`);
        });

        trainProcess.stderr.on('data', (data) => {
            console.error(`训练错误: ${data}`);
        });

        trainProcess.on('close', (code) => {
            console.log(`训练进程退出，code: ${code}`);
        });

        return { success: true };
    } catch (err) {
        console.error('启动训练失败:', err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('generate-task-id', async () => {
    try {
        let tasks = [];
        if (fs.existsSync(TASKS_PATH)) {
            tasks = JSON.parse(fs.readFileSync(TASKS_PATH, 'utf8'));
        }

        let maxId = 0;
        for (const task of tasks) {
            const num = parseInt(task.id.replace('T', ''));
            if (!isNaN(num) && num > maxId) maxId = num;
        }

        const newId = `T${String(maxId + 1).padStart(6, '0')}`;
        return newId;
    } catch (err) {
        console.error('生成 task id 失败:', err);
        return null;
    }
});

// ipcMain.handle('append-task', async (_, taskInfo) => {
//     try {
//         let tasksData = { total: 0, items: [] };
//
//         if (fs.existsSync(TASKS_PATH)) {
//             const raw = fs.readFileSync(TASKS_PATH, 'utf8');
//             tasksData = JSON.parse(raw);
//         }
//
//         if (!Array.isArray(tasksData.items)) {
//             tasksData.items = [];
//         }
//
//         tasksData.items.push(taskInfo);
//         tasksData.total = tasksData.items.length;
//
//         fs.writeFileSync(TASKS_PATH, JSON.stringify(tasksData, null, 2), 'utf8');
//         return { success: true };
//     } catch (err) {
//         console.error('写入任务失败:', err);
//         return { success: false, error: err.message };
//     }
// });


ipcMain.handle('append-task', async (event, taskInfo) => {
    try {
        let existing = [];

        // 如果文件存在，尝试读取并解析
        if (fs.existsSync(TASKS_PATH)) {
            const content = fs.readFileSync(TASKS_PATH, 'utf-8');
            const json = JSON.parse(content);

            if (Array.isArray(json)) {
                // 错误格式（不是 { items: [...] }）
                existing = json;
            } else if (Array.isArray(json.items)) {
                existing = json.items;
            }
        }

        // 添加新任务
        existing.push(taskInfo);

        // 写入回文件
        fs.writeFileSync(TASKS_PATH, JSON.stringify({ items: existing }, null, 2), 'utf-8');

        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});