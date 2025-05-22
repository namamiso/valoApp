// ESモジュールのインポート
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirnameの設定（ESモジュール用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
<<<<<<< HEAD
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
=======
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true,
>>>>>>> 36fe725aaff824288bfae80b06d82c23dc69a13b
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // レンダラープロセスに必要な情報を提供
    win.webContents.on('did-finish-load', () => {
        win.webContents.executeJavaScript(`
            window.process = {
                cwd: () => "${process.cwd().replace(/\\/g, '\\\\')}",
                platform: "${process.platform}"
            };
        `);
    });

    win.loadFile('index.html');

    // 開発者ツールを開く
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