import { fetchPoints, getAgentSkills, getCategoryMapping } from './firebase.js';

// グローバル変数
let currentMap = 'Ascent';
let currentSide = 'attack';
let currentAgent = null;
let currentPoints = [];
let currentImageIndex = 0;
let currentPoint = null;
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let isAddingPoint = false;

// 定点追加のステップ管理
let currentStep = 1;
let selectedMap = null;
let selectedAgent = null;
let selectedSkill = null;
let selectedSide = null;
let selectedPosition = { x: 0, y: 0 };
let selectedCategory = null;
let selectedImages = [];
let newPointDescription = '';
let newPointThrowType = '';

// DOM要素の取得
const mapButtons = document.querySelector('.map-buttons');
const sideButtons = document.querySelectorAll('.side-btn');
const agentButtons = document.querySelector('.agent-buttons');
const mapImage = document.getElementById('mapImage');
const mapDisplay = document.querySelector('.map-display');
const mapContainer = document.querySelector('.map-container');
const pointModal = document.getElementById('pointModal');
const closeModal = document.querySelector('.close');
const sliderImage = document.querySelector('.slider-image');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const sliderCounter = document.querySelector('.slider-counter');
const pointDescription = document.getElementById('pointDescription');
const throwType = document.getElementById('throwType');
const favoriteBtn = document.getElementById('favoriteBtn');
const showFavoritesBtn = document.getElementById('showFavoritesBtn');
const favoritesModal = document.getElementById('favoritesModal');
const favoritesList = document.getElementById('favoritesList');
const addPointBtn = document.getElementById('addPointBtn');
const addPointModal = document.getElementById('addPointModal');
const addPointForm = document.getElementById('addPointForm');
const pointSkill = document.getElementById('pointSkill');
const pointCategory = document.getElementById('pointCategory');
const pointImages = document.getElementById('pointImages');
const imagePreview = document.getElementById('imagePreview');
const positionMarker = document.getElementById('positionMarker');
const positionX = document.getElementById('positionX');
const positionY = document.getElementById('positionY');

// マップのズームとパン用の変数
let scale = 1;
let isDragging = false;
let startX;
let startY;
let translateX = 0;
let translateY = 0;

// パスの解決用関数
function resolvePath(relativePath) {
    // 開発環境では相対パスを使用
    if (window.location.protocol === 'file:') {
        return relativePath;
    }
    // 本番環境では絶対パスを使用
    return window.location.origin + '/' + relativePath;
}

// 初期化
function initialize() {
    // エージェントボタンの生成
    generateAgentButtons();

    // 初期マップの設定
    updateMapDisplay();

    // 初期マップボタンのアクティブ状態を設定
    document.querySelectorAll('.map-btn').forEach(button => {
        if (button.dataset.map === currentMap) {
            button.classList.add('active');
        }
    });

    // 初期サイドボタンのアクティブ状態を設定
    sideButtons.forEach(button => {
        if (button.dataset.side === currentSide) {
            button.classList.add('active');
        }
    });

    // イベントリスナーの設定
    setupEventListeners();
}

// マップボタンの生成
function generateMapButtons() {
    const maps = ['Ascent', 'Bind', 'Haven', 'Split', 'Icebox', 'Breeze', 'Pearl', 'Lotus'];
    maps.forEach(map => {
        const button = document.createElement('button');
        button.className = 'map-btn';
        button.textContent = map;
        button.dataset.map = map;
        if (map === currentMap) {
            button.classList.add('active');
        }
        mapButtons.appendChild(button);
    });
}

// エージェントボタンの生成
function generateAgentButtons() {
    const agents = [
        { id: 'brimstone', name: 'Brimstone' },
        { id: 'phoenix', name: 'Phoenix' },
        { id: 'sage', name: 'Sage' },
        { id: 'sova', name: 'Sova' },
        { id: 'viper', name: 'Viper' },
        { id: 'cypher', name: 'Cypher' },
        // { id: 'reyna', name: 'Reyna' },
        { id: 'killjoy', name: 'Killjoy' },
        { id: 'breach', name: 'Breach' },
        // { id: 'omen', name: 'Omen' },
        // { id: 'jett', name: 'Jett' },
        { id: 'raze', name: 'Raze' },
        { id: 'skye', name: 'Skye' },
        { id: 'yoru', name: 'Yoru' },
        // { id: 'astra', name: 'Astra' },
        { id: 'kayo', name: 'KAY_O' },
        // { id: 'chamber', name: 'Chambar' },
        { id: 'neon', name: 'Neon' },
        { id: 'fade', name: 'Fade' },
        { id: 'harbor', name: 'Harbor' },
        { id: 'gekko', name: 'Gekko' },
        { id: 'deadlock', name: 'Deadlock' },
        // { id: 'iso', name: 'Iso' },
        { id: 'clove', name: 'Clove' },
        { id: 'vise', name: 'Vise' },
        { id: 'tejo', name: 'Tejo' },
        { id: 'waylay', name: 'Waylay' }
    ];

    agents.forEach(agent => {
        const button = document.createElement('button');
        button.className = 'agent-btn';
        button.dataset.agent = agent.id;

        const img = document.createElement('img');
        img.src = resolvePath(`assets/agents/${agent.name}.png`);
        img.alt = agent.name;

        button.appendChild(img);
        agentButtons.appendChild(button);

        button.addEventListener('click', () => {
            document.querySelectorAll('.agent-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentAgent = agent.id;
            displaySkills(agent.id);
            loadPoints();
        });
    });
}

// エージェントボタンの生成（定点追加用）
function generateAddPointAgentButtons() {
    const agents = [
        { id: 'brimstone', name: 'Brimstone' },
        { id: 'phoenix', name: 'Phoenix' },
        { id: 'sage', name: 'Sage' },
        { id: 'sova', name: 'Sova' },
        { id: 'viper', name: 'Viper' },
        { id: 'cypher', name: 'Cypher' },
        { id: 'killjoy', name: 'Killjoy' },
        { id: 'breach', name: 'Breach' },
        { id: 'raze', name: 'Raze' },
        { id: 'skye', name: 'Skye' },
        { id: 'yoru', name: 'Yoru' },
        { id: 'kayo', name: 'KAY_O' },
        { id: 'neon', name: 'Neon' },
        { id: 'fade', name: 'Fade' },
        { id: 'harbor', name: 'Harbor' },
        { id: 'gekko', name: 'Gekko' },
        { id: 'deadlock', name: 'Deadlock' },
        { id: 'clove', name: 'Clove' },
        { id: 'vise', name: 'Vise' },
        { id: 'tejo', name: 'Tejo' },
        { id: 'waylay', name: 'Waylay' }
    ];

    const agentGrid = document.querySelector('#step2 .agent-selection-grid');
    agentGrid.innerHTML = '';

    agents.forEach(agent => {
        const button = document.createElement('button');
        button.className = 'agent-btn';
        button.dataset.agent = agent.id;

        const img = document.createElement('img');
        img.src = resolvePath(`assets/agents/${agent.name}.png`);
        img.alt = agent.name;

        const span = document.createElement('span');
        span.textContent = agent.name;

        button.appendChild(img);
        button.appendChild(span);
        agentGrid.appendChild(button);

        button.addEventListener('click', () => {
            document.querySelectorAll('#step2 .agent-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            selectedAgent = agent.id;
            document.querySelector('#step2 .next-step-btn').disabled = false;
        });
    });
}

// イベントリスナーの設定
function setupEventListeners() {
    // マップ選択
    document.querySelectorAll('.map-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.map-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentMap = button.dataset.map;
            updateMapDisplay();
            loadPoints();
        });
    });

    // サイド選択
    sideButtons.forEach(button => {
        button.addEventListener('click', () => {
            sideButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentSide = button.dataset.side;
            updateMapDisplay();
            loadPoints();
        });
    });

    // モーダルを閉じる
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                if (modal.id === 'addPointModal') {
                    isAddingPoint = false;
                    positionMarker.style.display = 'none';
                }
            }
        });
    });

    // スライダーのイベントリスナー
    prevBtn.addEventListener('click', () => {
        if (currentImageIndex > 0) {
            currentImageIndex--;
            updateSlider(currentPoint);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentImageIndex < currentPoint.images.length - 1) {
            currentImageIndex++;
            updateSlider(currentPoint);
        }
    });

    // お気に入りボタンのイベントリスナー
    favoriteBtn.addEventListener('click', () => {
        if (!currentPoint) return;

        const favoriteIndex = favorites.findIndex(fav =>
            fav.map === currentPoint.map &&
            fav.agent === currentPoint.agent &&
            fav.skill === currentPoint.skill &&
            fav.position.x === currentPoint.position.x &&
            fav.position.y === currentPoint.position.y
        );

        if (favoriteIndex === -1) {
            favorites.push({
                ...currentPoint,
                timestamp: Date.now()
            });
            favoriteBtn.classList.add('active');
        } else {
            favorites.splice(favoriteIndex, 1);
            favoriteBtn.classList.remove('active');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
    });

    // お気に入り一覧ボタンのイベントリスナー
    showFavoritesBtn.addEventListener('click', () => {
        showFavorites();
        favoritesModal.style.display = 'block';
    });

    // 新規定点追加ボタンのイベントリスナー
    addPointBtn.addEventListener('click', () => {
        currentStep = 1;
        selectedMap = null;
        selectedAgent = null;
        selectedSkill = null;
        selectedSide = null;
        selectedPosition = { x: 50, y: 50 };
        updateStepDisplay();
        addPointModal.style.display = 'block';
        positionMarker.style.display = 'block';
        positionMarker.style.left = '50%';
        positionMarker.style.top = '50%';
        positionX.textContent = '50.0';
        positionY.textContent = '50.0';

        // すべてのマップボタンのアクティブ状態を解除
        document.querySelectorAll('#step1 .map-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // 次へボタンを無効化
        document.querySelector('#step1 .next-step-btn').disabled = true;

        // エージェント選択画面のボタンを生成
        generateAddPointAgentButtons();
    });

    // ステップナビゲーション
    document.querySelectorAll('.next-step-btn').forEach(button => {
        button.addEventListener('click', goToNextStep);
    });

    document.querySelectorAll('.prev-step-btn').forEach(button => {
        button.addEventListener('click', goToPrevStep);
    });

    // マップ選択（ステップ1）
    document.querySelectorAll('#step1 .map-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('#step1 .map-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            selectedMap = button.dataset.map;
            document.querySelector('#step1 .next-step-btn').disabled = false;
        });
    });

    // マップのドラッグ機能
    mapDisplay.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // 左クリックの場合のみ
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            mapDisplay.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            mapContainer.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            mapDisplay.style.cursor = 'grab';
        }
    });

    // マップのズーム機能
    mapDisplay.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        const zoomFactor = 0.1;
        
        if (delta < 0) {
            scale = Math.min(scale + zoomFactor, 3);
        } else {
            scale = Math.max(scale - zoomFactor, 0.5);
        }
        
        mapContainer.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    });

    // エージェント選択エリアのスクロール
    const agentSelection = document.querySelector('.agent-selection');
    agentSelection.addEventListener('wheel', (e) => {
        e.preventDefault();
        agentSelection.scrollLeft += e.deltaY;
    });
}

// マップ表示の更新
function updateMapDisplay() {
    const prefix = currentSide === 'attack' ? 'atk_' : 'def_';
    const mapPath = resolvePath(`assets/maps/${prefix}${currentMap.toLowerCase()}.svg`);
    mapImage.src = mapPath;
}

// 定点の読み込み
async function loadPoints() {
    if (!currentMap || !currentAgent || !currentSide) return;

    try {
        currentPoints = await fetchPoints(currentMap, currentAgent, currentSide);
        displayPoints(currentPoints);
    } catch (error) {
        console.error('定点の読み込みに失敗しました:', error);
    }
}

// 定点の表示
function displayPoints(points) {
    // 既存の定点をクリア
    const existingPoints = document.querySelectorAll('.point-marker');
    existingPoints.forEach(point => point.remove());

    points.forEach(point => {
        const marker = document.createElement('div');
        marker.className = 'point-marker';
        marker.style.left = `${point.position.x}%`;
        marker.style.top = `${point.position.y}%`;
        marker.dataset.pointId = point.id;

        // スキルアイコンの作成
        const skillIcon = document.createElement('img');
        const formattedSkill = point.skill
            .split(/\s+|\//)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('_')
            .replace(/\//g, '');
        skillIcon.src = resolvePath(`assets/skills/${formattedSkill}.webp`);
        skillIcon.alt = point.skill;
        skillIcon.className = 'point-skill-icon';
        skillIcon.onerror = function() {
            console.warn(`Failed to load skill icon: ${skillIcon.src}`);
            this.style.display = 'none';
        };

        // カテゴリに基づいて背景色を設定
        const category = point.category[0];
        if (category.includes('情報収集')) {
            marker.style.backgroundColor = '#4CAF50'; // 緑
        } else if (category.includes('敵の位置特定')) {
            marker.style.backgroundColor = '#2196F3'; // 青
        } else if (category.includes('エントリー')) {
            marker.style.backgroundColor = '#FFC107'; // 黄
        } else if (category.includes('サイト攻略')) {
            marker.style.backgroundColor = '#FF5722'; // オレンジ
        } else if (category.includes('サイト防衛')) {
            marker.style.backgroundColor = '#9C27B0'; // 紫
        } else if (category.includes('敵の排除')) {
            marker.style.backgroundColor = '#F44336'; // 赤
        }

        marker.appendChild(skillIcon);
        marker.addEventListener('click', () => showPointDetails(point));
        mapContainer.appendChild(marker);
    });
}

// 定点詳細の表示
function showPointDetails(point) {
    currentPoint = point;
    currentImageIndex = 0;
    updateSlider(point);
    pointDescription.textContent = point.description;
    throwType.textContent = `投げ方: ${point.throwType}`;

    // お気に入りボタンの状態を更新
    const isFavorite = favorites.some(fav =>
        fav.map === point.map &&
        fav.agent === point.agent &&
        fav.skill === point.skill &&
        fav.position.x === point.position.x &&
        fav.position.y === point.position.y
    );
    favoriteBtn.classList.toggle('active', isFavorite);

    pointModal.style.display = 'block';
}

// スライダーの更新
function updateSlider(point) {
    if (point.images.length === 0) return;

    sliderImage.src = point.images[currentImageIndex];
    sliderCounter.textContent = `${currentImageIndex + 1}/${point.images.length}`;
    prevBtn.disabled = currentImageIndex === 0;
    nextBtn.disabled = currentImageIndex === point.images.length - 1;
}

// 特定スキルの判定
function isSpecialSkill(agent, skill) {
    const specialSkills = {
        'cypher': ['Spy Cam'],
        'viper': ['Viper\'s Pit'],
        'astra': ['Nova Pulse', 'Nebula', 'Astral Form'],
        'kayo': ['ZERO/point'],
        'neon': ['Fast Lane', 'Overdrive'],
        'fade': ['Haunt', 'Seize'],
        'harbor': ['Cove', 'High Tide'],
        'gekko': ['Wingman', 'Mosh Pit'],
        'deadlock': ['Sonic Sensor', 'Barrier Mesh'],
        'clove': ['Meddle', 'Ruse']
    };
    return specialSkills[agent]?.includes(skill) || false;
}

// スキルアイコンの表示
function displaySkills(agent) {
    const skillsContainer = document.querySelector('.skill-buttons');
    if (!skillsContainer) {
        console.error('スキルコンテナが見つかりません');
        return;
    }
    skillsContainer.innerHTML = '';

    // カテゴリマッピングからスキルを取得
    const skills = getAgentSkills(agent);

    // スキルボタンのグリッドを作成
    const skillsGrid = document.createElement('div');
    skillsGrid.className = 'skills-grid';

    skills.forEach(skill => {
        const skillButton = document.createElement('button');
        skillButton.className = 'skill-button';
        skillButton.dataset.skill = skill;

        // スキルアイコンの画像を設定
        const skillIcon = document.createElement('img');
        // スキル名を適切な形式に変換（先頭と区切りを大文字に、区切りに_を追加）
        const formattedSkill = skill
            .split(/\s+|\//)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('_')
            .replace(/\//g, '');
        const imagePath = `assets/skills/${formattedSkill}.webp`;
        console.log('Loading skill image:', imagePath); // デバッグ用ログ
        skillIcon.src = imagePath;
        skillIcon.alt = skill;
        skillIcon.onerror = function() {
            console.warn(`Failed to load image: ${imagePath}`); // デバッグ用ログ
            // エラー時は空の画像を表示
            this.style.display = 'none';
        };

        const skillName = document.createElement('span');
        skillName.textContent = skill;

        skillButton.appendChild(skillIcon);
        skillButton.appendChild(skillName);

        // スキル選択時のイベントリスナー
        skillButton.addEventListener('click', () => {
            document.querySelectorAll('.skill-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            skillButton.classList.add('selected');
            selectedSkill = skill;
            nextStepBtn.disabled = false;
        });

        skillsGrid.appendChild(skillButton);
    });

    skillsContainer.appendChild(skillsGrid);
}

// カテゴリの表示
function displayCategories(agent, skill, side) {
    const categories = getCategoryMapping()[agent]?.[skill]?.[side] || [];
    const categoryButtons = document.querySelector('.category-buttons');
    categoryButtons.innerHTML = '';

    // カテゴリが存在しない場合は定点を直接表示
    if (categories.length === 0) {
        const points = currentPoints.filter(point =>
            point.agent === agent &&
            point.skill === skill &&
            point.side === side
        );
        displayPoints(points);
        return;
    }

    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.dataset.category = category;
        categoryButtons.appendChild(button);

        button.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filteredPoints = currentPoints.filter(point =>
                point.agent === agent &&
                point.skill === skill &&
                point.side === side &&
                point.category.includes(category)
            );
            displayPoints(filteredPoints);
        });
    });
}

// お気に入り一覧の表示
function showFavorites() {
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>お気に入りはありません</p>';
        return;
    }

    favorites.forEach(favorite => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <h3>${favorite.agent} - ${favorite.skill}</h3>
            <p>マップ: ${favorite.map}</p>
            <p>サイド: ${favorite.side === 'attack' ? '攻撃' : '防御'}</p>
            <button class="remove-favorite">削除</button>
        `;

        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-favorite')) {
                currentMap = favorite.map;
                currentSide = favorite.side;
                currentAgent = favorite.agent;

                document.querySelectorAll('.map-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.map === currentMap));
                sideButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.side === currentSide));
                agentButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.agent === currentAgent));

                updateMapDisplay();
                loadPoints();
                favoritesModal.style.display = 'none';
            }
        });

        const removeBtn = item.querySelector('.remove-favorite');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = favorites.findIndex(fav =>
                fav.map === favorite.map &&
                fav.agent === favorite.agent &&
                fav.skill === favorite.skill &&
                fav.position.x === favorite.position.x &&
                fav.position.y === favorite.position.y
            );
            if (index !== -1) {
                favorites.splice(index, 1);
                localStorage.setItem('favorites', JSON.stringify(favorites));
                showFavorites();
            }
        });

        favoritesList.appendChild(item);
    });
}

// 初期表示
updateMapDisplay();

// アプリケーションの初期化
initialize();

// ステップの表示を更新
function updateStepDisplay() {
    // すべてのステップを非表示
    document.querySelectorAll('.add-point-step').forEach(step => {
        step.style.display = 'none';
    });

    // 現在のステップを表示
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (currentStepElement) {
        currentStepElement.style.display = 'block';
    }
}

// スキル選択画面の更新
function updateSkillSelection() {
    const skillSelection = document.querySelector('#step3 .skill-selection');
    skillSelection.innerHTML = '';

    if (!selectedAgent) {
        console.log('エージェントが選択されていません');
        return;
    }

    // カテゴリマッピングからスキルを取得
    const categoryMapping = getCategoryMapping();
    console.log('カテゴリマッピング:', categoryMapping);
    console.log('選択されたエージェント:', selectedAgent);
    
    const skills = categoryMapping[selectedAgent] ? Object.keys(categoryMapping[selectedAgent]) : [];
    console.log('取得されたスキル:', skills);
    
    if (!skills || skills.length === 0) {
        console.log('スキルが見つかりません');
        return;
    }

    const skillsGrid = document.createElement('div');
    skillsGrid.className = 'skills-grid';

    skills.forEach(skill => {
        const skillButton = document.createElement('button');
        skillButton.className = 'skill-button';
        skillButton.dataset.skill = skill;

        // スキルアイコンの画像を設定
        const skillIcon = document.createElement('img');
        // スキル名を適切な形式に変換
        const formattedSkill = skill
            .replace(/\s+/g, '_')  // スペースをアンダースコアに
            .replace(/\//g, '_')   // スラッシュをアンダースコアに
            .replace(/-/g, '_')    // ハイフンをアンダースコアに
            .toLowerCase();        // 小文字に変換

        const imagePath = `assets/skills/${formattedSkill}.webp`;
        console.log('スキルアイコンのパス:', imagePath);
        
        skillIcon.src = resolvePath(imagePath);
        skillIcon.alt = skill;
        skillIcon.onerror = function() {
            console.warn(`スキルアイコンの読み込みに失敗: ${skillIcon.src}`);
            this.style.display = 'none';
        };
        skillIcon.onload = function() {
            console.log(`スキルアイコンの読み込み成功: ${skillIcon.src}`);
        };

        const skillName = document.createElement('span');
        skillName.textContent = skill;

        skillButton.appendChild(skillIcon);
        skillButton.appendChild(skillName);

        skillButton.addEventListener('click', () => {
            document.querySelectorAll('#step3 .skill-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            skillButton.classList.add('selected');
            selectedSkill = skill;
            document.querySelector('#step3 .next-step-btn').disabled = false;
        });

        skillsGrid.appendChild(skillButton);
    });

    skillSelection.appendChild(skillsGrid);
}

// カテゴリ選択画面の更新
function updateCategorySelection() {
    console.log('カテゴリ選択画面の更新開始');
    console.log('選択されたエージェント:', selectedAgent);
    console.log('選択されたスキル:', selectedSkill);
    console.log('選択されたサイド:', selectedSide);

    const categorySelection = document.querySelector('#step4 .category-selection');
    categorySelection.innerHTML = '';

    if (!selectedAgent || !selectedSkill || !selectedSide) {
        console.log('必要な情報が不足しています');
        return;
    }

    // カテゴリマッピングからカテゴリを取得
    const categoryMapping = getCategoryMapping();
    const categories = categoryMapping[selectedAgent]?.[selectedSkill]?.[selectedSide] || [];
    console.log('取得されたカテゴリ:', categories);

    if (categories.length === 0) {
        console.log('カテゴリが見つかりません');
        return;
    }

    const categoriesGrid = document.createElement('div');
    categoriesGrid.className = 'categories-grid';

    categories.forEach(category => {
        const categoryButton = document.createElement('button');
        categoryButton.className = 'category-button';
        categoryButton.textContent = category;

        categoryButton.addEventListener('click', () => {
            document.querySelectorAll('#step4 .category-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            categoryButton.classList.add('selected');
            selectedCategory = category;
            document.querySelector('#step4 .next-step-btn').disabled = false;
        });

        categoriesGrid.appendChild(categoryButton);
    });

    categorySelection.appendChild(categoriesGrid);
}

// マップクリック時の処理
function handleMapClick(e) {
    console.log('マップクリックイベント発生');
    console.log('現在のステップ:', currentStep);
    console.log('選択されたスキル:', selectedSkill);

    if (currentStep !== 4 || !selectedSkill) {
        console.log('スキルが選択されていないか、ステップが4ではありません');
        return;
    }

    const mapDisplay = document.querySelector('#step4 .map-display');
    const rect = mapDisplay.getBoundingClientRect();
    
    // クリック位置をパーセンテージに変換
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    console.log('クリック座標:', { x, y });

    // 位置マーカーを更新
    const positionMarker = document.getElementById('positionMarker');
    console.log('位置マーカー要素:', positionMarker);

    // スキルアイコンの作成
    const skillIcon = document.createElement('img');
    const formattedSkill = selectedSkill
        .replace(/\s+/g, '_')
        .replace(/\//g, '_')
        .replace(/-/g, '_')
        .toLowerCase();
    
    const imagePath = `assets/skills/${formattedSkill}.webp`;
    console.log('スキルアイコンのパス:', imagePath);
    
    skillIcon.src = resolvePath(imagePath);
    skillIcon.alt = selectedSkill;
    skillIcon.className = 'point-skill-icon';
    skillIcon.onerror = function() {
        console.warn(`スキルアイコンの読み込みに失敗: ${skillIcon.src}`);
        this.style.display = 'none';
    };
    skillIcon.onload = function() {
        console.log(`スキルアイコンの読み込み成功: ${skillIcon.src}`);
    };

    // 位置マーカーの内容をクリアして新しいスキルアイコンを追加
    positionMarker.innerHTML = '';
    positionMarker.appendChild(skillIcon);
    positionMarker.style.left = `${x}%`;
    positionMarker.style.top = `${y}%`;
    positionMarker.style.display = 'block';
    console.log('位置マーカーのスタイル:', {
        left: positionMarker.style.left,
        top: positionMarker.style.top,
        display: positionMarker.style.display
    });

    // 座標を表示
    document.getElementById('positionX').textContent = x.toFixed(1);
    document.getElementById('positionY').textContent = y.toFixed(1);
    console.log('表示座標:', { x: x.toFixed(1), y: y.toFixed(1) });

    // 選択された位置を保存
    selectedPosition = { x, y };
    console.log('保存された位置:', selectedPosition);

    // 次へボタンを有効化
    const nextButton = document.querySelector('#step4 .next-step-btn');
    nextButton.disabled = false;
    console.log('次へボタンの状態:', { disabled: nextButton.disabled });
}

// マップ表示の更新（定点追加用）
function updateAddPointMapDisplay() {
    console.log('マップ表示の更新開始');
    console.log('選択されたマップ:', selectedMap);
    console.log('選択されたサイド:', selectedSide);

    const prefix = selectedSide === 'attack' ? 'atk_' : 'def_';
    const mapPath = resolvePath(`assets/maps/${prefix}${selectedMap.toLowerCase()}.svg`);
    console.log('マップ画像のパス:', mapPath);

    const mapImage = document.querySelector('#step4 .map-display img');
    console.log('マップ画像要素:', mapImage);

    if (mapImage) {
        mapImage.src = mapPath;
        mapImage.onload = function() {
            console.log('マップ画像の読み込み成功');
        };
        mapImage.onerror = function() {
            console.error('マップ画像の読み込みに失敗:', mapPath);
        };
    } else {
        console.error('マップ画像要素が見つかりません');
    }
}

// 次のステップに進む
function goToNextStep() {
    console.log('次のステップに進む');
    console.log('現在のステップ:', currentStep);

    if (currentStep < 7) { // ステップ数を7に更新
        currentStep++;
        updateStepDisplay();
        
        // ステップ2（エージェント選択）からステップ3（スキル選択）に進む時
        if (currentStep === 3) {
            console.log('ステップ3（スキル選択）に進みます');
            updateSkillSelection();
        }
        // ステップ3（スキル選択）からステップ4（カテゴリ選択）に進む時
        else if (currentStep === 4) {
            console.log('ステップ4（カテゴリ選択）に進みます');
            updateCategorySelection();
        }
        // ステップ4（カテゴリ選択）からステップ5（位置選択）に進む時
        else if (currentStep === 5) {
            console.log('ステップ5（位置選択）に進みます');
            updateAddPointMapDisplay();
            // マップクリックイベントを設定
            const mapDisplay = document.querySelector('#step5 .map-display');
            if (mapDisplay) {
                console.log('マップクリックイベントを設定します');
                mapDisplay.addEventListener('click', handleMapClick);
            } else {
                console.error('マップ表示要素が見つかりません');
            }
        }
        // ステップ5（位置選択）からステップ6（画像追加）に進む時
        else if (currentStep === 6) {
            console.log('ステップ6（画像追加）に進みます');
            // マップクリックイベントを削除
            const mapDisplay = document.querySelector('#step5 .map-display');
            if (mapDisplay) {
                mapDisplay.removeEventListener('click', handleMapClick);
            }
        }
    }
}

// 前のステップに戻る
function goToPrevStep() {
    console.log('前のステップに戻る');
    console.log('現在のステップ:', currentStep);

    if (currentStep > 1) {
        // ステップ4から戻る時、マップクリックイベントを削除
        if (currentStep === 4) {
            console.log('ステップ4から戻ります');
            const mapDisplay = document.querySelector('#step4 .map-display');
            if (mapDisplay) {
                console.log('マップクリックイベントを削除します');
                mapDisplay.removeEventListener('click', handleMapClick);
            }
        }
        
        currentStep--;
        updateStepDisplay();
    }
}

// 画像追加の処理
function handleImageUpload(event) {
    const files = event.target.files;
    console.log('アップロードされたファイル数:', files.length);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                selectedImages.push(e.target.result);
                updateImagePreview();
            };
            reader.readAsDataURL(file);
        }
    }
}

// 画像プレビューの更新
function updateImagePreview() {
    const previewContainer = document.querySelector('#step6 .image-preview-container');
    previewContainer.innerHTML = '';

    selectedImages.forEach((image, index) => {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        
        const img = document.createElement('img');
        img.src = image;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
            selectedImages.splice(index, 1);
            updateImagePreview();
        };

        preview.appendChild(img);
        preview.appendChild(removeBtn);
        previewContainer.appendChild(preview);
    });
}

// 説明文入力の処理
function handleDescriptionInput(event) {
    newPointDescription = event.target.value;
    console.log('説明文が更新されました:', newPointDescription);
}

// 投げ方入力の処理
function handleThrowTypeInput(event) {
    newPointThrowType = event.target.value;
    console.log('投げ方が更新されました:', newPointThrowType);
}

// 定点の追加処理
async function addNewPoint() {
    console.log('定点の追加処理を開始');
    console.log('選択された情報:', {
        map: selectedMap,
        agent: selectedAgent,
        skill: selectedSkill,
        side: selectedSide,
        category: selectedCategory,
        position: selectedPosition,
        images: selectedImages,
        description: newPointDescription,
        throwType: newPointThrowType
    });

    try {
        // Firestoreにデータを追加
        const pointData = {
            map: selectedMap,
            agent: selectedAgent,
            skill: selectedSkill,
            side: selectedSide,
            category: [selectedCategory],
            position: selectedPosition,
            images: selectedImages,
            description: newPointDescription,
            throwType: newPointThrowType,
            timestamp: new Date()
        };

        // TODO: Firestoreへのデータ追加処理を実装
        // await addPointToFirestore(pointData);

        console.log('定点の追加が完了しました');
        
        // モーダルを閉じる
        const addPointModal = document.getElementById('addPointModal');
        addPointModal.style.display = 'none';
        
        // 選択状態をリセット
        resetPointSelection();
        
        // 成功メッセージを表示
        alert('定点が追加されました');
    } catch (error) {
        console.error('定点の追加に失敗しました:', error);
        alert('定点の追加に失敗しました');
    }
}

// 選択状態のリセット
function resetPointSelection() {
    currentStep = 1;
    selectedMap = null;
    selectedAgent = null;
    selectedSkill = null;
    selectedSide = null;
    selectedPosition = { x: 0, y: 0 };
    selectedCategory = null;
    selectedImages = [];
    newPointDescription = '';
    newPointThrowType = '';
    updateStepDisplay();
}