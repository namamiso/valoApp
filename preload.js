<<<<<<< HEAD
const { contextBridge } = require('electron');
const path = require('path');

// モジュールのパスを設定
process.env.NODE_PATH = path.join(__dirname, 'node_modules');
require('module').Module._initPaths();

// Firebaseモジュールを事前に読み込む
const firebase = require('firebase/app');
const firestore = require('firebase/firestore');

// グローバル変数を設定
window.__dirname = __dirname;
window.process = process;

// モジュール解決のための設定
window.require = require;
window.path = path;

// Firebaseモジュールをグローバルに公開
window.firebase = firebase;
window.firestore = firestore; 
=======
import { contextBridge } from 'electron';

// レンダラープロセスに公開するAPI
contextBridge.exposeInMainWorld('electronAPI', {
    // 必要に応じてAPIを追加
    getAppPath: () => process.cwd()
}); 
>>>>>>> 36fe725aaff824288bfae80b06d82c23dc69a13b
