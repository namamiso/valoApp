// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

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
async function fetchPoints(map, agent, side) {
    try {
        const q = query(
            collection(db, "positions"),
            where("map", "==", map.toLowerCase()),
            where("agent", "==", agent),
            where("side", "==", side)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching points:", error);
        return [];
    }
}

// 定点の追加
async function addPoint(point) {
    try {
        const docRef = await addDoc(collection(db, "positions"), point);
        return { id: docRef.id, ...point };
    } catch (error) {
        console.error("Error adding point:", error);
        throw error;
    }
}

// カテゴリマッピングを取得
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