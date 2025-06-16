const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let win;

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
