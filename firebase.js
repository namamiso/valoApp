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
        console.log('カテゴリマッピングの初期化完了:', categoryMapping);
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
async function fetchPoints(map, agent, side) {
    try {
        const pointsRef = collection(db, "positions");
        const q = query(
            pointsRef,
            where("map", "==", map.toLowerCase()),
            where("agent", "==", agent),
            where("side", "==", side)
        );

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
        return [];
    }
}

// 定点の追加
async function addPoint(point) {
    try {
        const docRef = await addDoc(collection(db, "positions"), point);
        return {
            id: docRef.id,
            ...point
        };
    } catch (error) {
        console.error("定点の追加に失敗しました:", error);
        throw error;
    }
}

// カテゴリマッピングを取得
function getCategoryMapping() {
    return categoryMapping;
}

// モジュールのエクスポート
export {
    getAgentSkills,
    fetchPoints,
    addPoint,
    getCategoryMapping
};
