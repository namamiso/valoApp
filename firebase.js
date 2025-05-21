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

// カテゴリマッピング
export const categoryMapping = {
    'sova': {
        'Recon Bolt': {
            'attack': ['メイン＆ミッド取り', 'エントリー', 'ガジェット破壊'],
            'defense': ['開幕', 'カウンター', 'リテイク']
        },
        'Shock Bolt': {
            'attack': ['エントリー', 'リテイク阻止', '解除阻止'],
            'defense': ['カウンター', 'リテイク']
        }
    },
    'cypher': {
        'Spy Cam': {
            'attack': ['エントリー', 'リテイク阻止'],
            'defense': ['開幕', 'カウンター']
        }
        },
    'viper': {
        'Viper\'s Pit': {
            'attack': ['エントリー', 'リテイク阻止'],
            'defense': ['カウンター', 'リテイク']
        }
    }
};

// エージェントのスキル一覧
export function getAgentSkills(agent) {
    return Object.keys(categoryMapping[agent] || {});
}

// 定点の取得
export async function fetchPoints(map, agent, side) {
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
export async function addPoint(point) {
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