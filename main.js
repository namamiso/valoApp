const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // レンダラープロセスに必要な情報を提供
    win.webContents.on('did-finish-load', () => {
        win.webContents.executeJavaScript(`
            window.__dirname = "${__dirname.replace(/\\/g, '\\\\')}";
            window.process = process;
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