// ESモジュールのインポート
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirnameの代替（ESM用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            preload: path.join(__dirname, 'preload.cjs')
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

    win.loadFile(path.join(__dirname, 'index.html'));

    // 開発者ツールを開く
    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools();
    }
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