// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

// カテゴリマッピング
const categoryMapping = {
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
  'phoenix': {
    'Curveball': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Hot Hands': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'sage': {
    'Barrier Orb': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Slow Orb': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'cypher': {
    'Spy Cam': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Cyber Cage': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'brimstone': {
    'Smoke Screen': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Incendiary': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'viper': {
    'Poison Cloud': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Toxic Screen': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'breach': {
    'Flashpoint': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Fault Line': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'raze': {
    'Blast Pack': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Paint Shells': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'skye': {
    'Trailblazer': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Guiding Light': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'yoru': {
    'Blindside': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Gatecrash': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'astra': {
    'Nova Pulse': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Nebula': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'kayo': {
    'Flash/Drive': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Zero/Point': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'neon': {
    'Fast Lane': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Relay Bolt': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'fade': {
    'Seize': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Haunt': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'harbor': {
    'Cove': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'High Tide': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'gekko': {
    'Wingman': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Dizzy': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'deadlock': {
    'Sonic Sensor': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    },
    'Barrier Mesh': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  },
  'clove': {
    'Meddle': {
      'attack': ['エントリー', 'リテイク阻止'],
      'defense': ['開幕', 'カウンター']
    }
  }
};

// 定点データ
const positions = [
  {
    agent: "sova",
    map: "ascent",
    skill: "Recon Bolt",
    category: ["メイン＆ミッド取り", "ガジェット破壊"],
    description: "Aサイトへのエントリー用",
    throwType: "その場投げ",
    position: { x: 30, y: 40 },
    side: "attack",
    images: ["assets/points/sova_recon_1.jpg"]
  },
  {
    agent: "sova",
    map: "bind",
    skill: "Shock Bolt",
    category: ["エントリー", "リテイク阻止"],
    description: "Bサイトへのエントリー用",
    throwType: "ジャンプ投げ",
    position: { x: 45, y: 60 },
    side: "attack",
    images: ["assets/points/sova_shock_1.jpg"]
  },
  {
    agent: "cypher",
    map: "split",
    skill: "Spy Cam",
    category: ["開幕", "カウンター"],
    description: "Aサイトの監視用",
    throwType: "その場投げ",
    position: { x: 35, y: 25 },
    side: "defense",
    images: ["assets/points/cypher_spycam_1.jpg"]
  }
];

// データをFirestoreに追加する関数
async function addDataToFirestore() {
  try {
    // カテゴリマッピングの追加
    for (const [agent, skills] of Object.entries(categoryMapping)) {
      for (const [skill, sides] of Object.entries(skills)) {
        const docRef = await addDoc(collection(db, "skillCategories"), {
          agent,
          skill,
          ...sides
        });
        console.log("カテゴリマッピング追加成功:", docRef.id);
      }
    }

    // ポジションデータの追加
    for (const position of positions) {
      const docRef = await addDoc(collection(db, "positions"), position);
      console.log("ポジションデータ追加成功:", docRef.id);
    }

    console.log("すべてのデータの追加が完了しました");
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}

// データ追加の実行
addDataToFirestore();