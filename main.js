// ESモジュールのインポート
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
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