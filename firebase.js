<<<<<<< HEAD
// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');
=======
// Firebase SDKのインポート
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyBeVu06oc7Ij4G9Nd9gXtB9XvlRh9odnXw",
  authDomain: "valo-764aa.firebaseapp.com",
  projectId: "valo-764aa",
  storageBucket: "valo-764aa.firebasestorage.app",
  messagingSenderId: "606436449733",
  appId: "1:606436449733:web:742243e1aaf6b064b13fac",
  measurementId: "G-R0X725JGEP"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// モックデータ
const mockPoints = [
    {
        id: 1,
        map: 'ascent',
        agent: 'sova',
        skill: 'Recon Bolt',
        category: ['メイン＆ミッド取り', 'ガジェット破壊'],
        description: 'Aサイトへのエントリー用',
        throwType: 'その場投げ',
                    position: { x: 30, y: 40 },
                    side: 'attack',
        images: ['assets/points/sova_recon_1.jpg']
                }
];
>>>>>>> 36fe725aaff824288bfae80b06d82c23dc69a13b

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeVu06oc7Ij4G9Nd9gXtB9XvlRh9odnXw",
  authDomain: "valo-764aa.firebaseapp.com",
  projectId: "valo-764aa",
  storageBucket: "valo-764aa.firebasestorage.app",
  messagingSenderId: "606436449733",
  appId: "1:606436449733:web:742243e1aaf6b064b13fac",
  measurementId: "G-R0X725JGEP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// カテゴリマッピングをFirestoreから取得
let categoryMapping = {};

// カテゴリマッピングの初期化
async function initializeCategoryMapping() {
    try {
        // 既存のデータをクリア
        categoryMapping = {};
        
        const querySnapshot = await getDocs(collection(db, "skillCategories"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!categoryMapping[data.agent]) {
                categoryMapping[data.agent] = {};
            }
            categoryMapping[data.agent][data.skill] = {
                attack: data.attack || [],
                defense: data.defense || []
            };
        });
    } catch (error) {
        console.error("Error initializing category mapping:", error);
    }
}

// 初期化を実行
initializeCategoryMapping();

// エージェントのスキル一覧
function getAgentSkills(agent) {
    return Object.keys(categoryMapping[agent] || {});
}

// 定点の取得
<<<<<<< HEAD
async function fetchPoints(map, agent, side) {
    try {
        const q = query(
            collection(db, "positions"),
=======
export async function fetchPoints(map, agent, side) {
    try {
        const pointsRef = collection(db, "positions");
        const q = query(
            pointsRef,
>>>>>>> 36fe725aaff824288bfae80b06d82c23dc69a13b
            where("map", "==", map.toLowerCase()),
            where("agent", "==", agent),
            where("side", "==", side)
        );
<<<<<<< HEAD
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching points:", error);
=======
        
        const querySnapshot = await getDocs(q);
        const points = [];
        
        querySnapshot.forEach((doc) => {
            points.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return points;
    } catch (error) {
        console.error("定点の取得に失敗しました:", error);
>>>>>>> 36fe725aaff824288bfae80b06d82c23dc69a13b
        return [];
    }
}

// 定点の追加
<<<<<<< HEAD
async function addPoint(point) {
    try {
        const docRef = await addDoc(collection(db, "positions"), point);
        return { id: docRef.id, ...point };
    } catch (error) {
        console.error("Error adding point:", error);
=======
export async function addPoint(point) {
    try {
        const docRef = await addDoc(collection(db, "positions"), point);
        return {
            id: docRef.id,
            ...point
        };
    } catch (error) {
        console.error("定点の追加に失敗しました:", error);
>>>>>>> 36fe725aaff824288bfae80b06d82c23dc69a13b
        throw error;
    }
}

// カテゴリマッピングを取得
<<<<<<< HEAD
function getCategoryMapping(agent, skill, side) {
    return categoryMapping[agent]?.[skill]?.[side] || [];
}

// モジュールのエクスポート
module.exports = {
    categoryMapping,
    getAgentSkills,
    fetchPoints,
    addPoint,
    getCategoryMapping,
    initializeCategoryMapping
};
=======
export async function getCategoryMapping(agent, skill, side) {
    try {
        const categoriesRef = collection(db, "skillCategories");
        const q = query(
            categoriesRef,
            where("agent", "==", agent),
            where("skill", "==", skill)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return doc.data()[side] || [];
        }
        return [];
    } catch (error) {
        console.error("カテゴリマッピングの取得に失敗しました:", error);
        return [];
    }
} 
>>>>>>> 36fe725aaff824288bfae80b06d82c23dc69a13b
