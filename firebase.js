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
    return mockPoints.filter(point => 
        point.map.toLowerCase() === map.toLowerCase() &&
        point.agent === agent &&
        point.side === side
    );
}

// 定点の追加
export async function addPoint(point) {
    mockPoints.push({
        ...point,
        id: mockPoints.length + 1
    });
    return point;
}

// カテゴリマッピングを取得
export function getCategoryMapping(agent, skill, side) {
    return categoryMapping[agent]?.[skill]?.[side] || [];
} 