import { contextBridge } from 'electron';

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld('electronAPI', {
    // 必要に応じてAPIを追加
    getAppPath: () => process.cwd()
}); 