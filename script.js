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
let selectedPosition = { x: 0, y: 0 };

// 定点追加のステップ管理
let currentStep = 1;
let selectedMap = null;
let selectedAgent = null;
let selectedSkill = null;
let selectedSide = null;
let selectedCategory = null;
let selectedImages = [];
let selectedThrowType = '';
let selectedDescription = '';

// DOM要素の取得
const mapButtons = document.querySelector('.map-buttons');
const sideButtons = document.querySelectorAll('.side-btn');
const agentButtons = document.querySelector('.agent-buttons');
const mapSvg = document.getElementById('mapSvg');
const viewport = document.getElementById('viewport');
const mapImageSvg = document.getElementById('mapImageSvg');
const pointsLayer = document.getElementById('pointsLayer');
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



// パスの解決用関数
function resolvePath(relativePath) {
    // 相対パスをそのまま使用
    return relativePath;
}

// 正規化→論理座標（0..1 → 0..1000）
const L = 1000;
const toLogical = ({x, y}) => ({ X: x * L, Y: y * L });

// クライアント座標→SVG座標（論理座標）→正規化（0..1）
function svgPointFromClient(evt) {
    const pt = mapSvg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const inv = mapSvg.getScreenCTM().inverse();
    const svgP = pt.matrixTransform(inv); // これは viewBox 座標（0..1000）
    return { x: svgP.x / L, y: svgP.y / L }; // 正規化0..1
}

// スキル名 → アイコンファイルパスを返す関数
function getSkillIconPath(skill) {
    const file = skill.trim().replace(/\s+/g, '_') + '.webp';
    return resolvePath(`assets/skills/${file}`);
}

// モーダル外クリックで閉じる関数
function closeModalOnOutsideClick(event) {
    if (event.target === pointModal) {
        pointModal.style.display = 'none';
        pointModal.removeEventListener('click', closeModalOnOutsideClick);
    }
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
                // 定点モーダルの場合、イベントリスナーをクリーンアップ
                if (modal.id === 'pointModal') {
                    modal.removeEventListener('click', closeModalOnOutsideClick);
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
        resetAddPointModal();
        addPointModal.style.display = 'block';
    });

    // ステップナビゲーション
    document.querySelectorAll('.next-step-btn').forEach(button => {
        button.addEventListener('click', goToNextStep);
    });

    document.querySelectorAll('.prev-step-btn').forEach(button => {
        button.addEventListener('click', goToPrevStep);
    });

    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (pointModal.style.display === 'block') {
                pointModal.style.display = 'none';
                pointModal.removeEventListener('click', closeModalOnOutsideClick);
            }
            if (favoritesModal.style.display === 'block') {
                favoritesModal.style.display = 'none';
            }
            if (addPointModal.style.display === 'block') {
                addPointModal.style.display = 'none';
                isAddingPoint = false;
                positionMarker.style.display = 'none';
            }
        }
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

    // ズーム・パン（viewportへ集約）
    let scale = 1, tx = 0, ty = 0;
    mapSvg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = Math.sign(e.deltaY) * 0.1;
        scale = Math.max(0.5, Math.min(4, scale - delta));
        viewport.setAttribute('transform', `translate(${tx}, ${ty}) scale(${scale})`);
    }, { passive: false });

    let dragging = false, startX = 0, startY = 0;
    mapSvg.addEventListener('mousedown', (e) => {
        dragging = true; startX = e.clientX; startY = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        tx += (e.clientX - startX) / scale;
        ty += (e.clientY - startY) / scale;
        startX = e.clientX; startY = e.clientY;
        viewport.setAttribute('transform', `translate(${tx}, ${ty}) scale(${scale})`);
    });
    window.addEventListener('mouseup', () => dragging = false);

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
    const file = `${prefix}${currentMap.toLowerCase()}.svg`;
    // assets/maps に配置済みのSVGを使う
    mapImageSvg.setAttribute('href', resolvePath(`assets/maps/${file}`));
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
    pointsLayer.innerHTML = '';
    points.forEach(p => {
        const { X, Y } = toLogical(p.position);

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'point');
        g.setAttribute('transform', `translate(${X}, ${Y})`);

        const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hit.setAttribute('r', '14');
        hit.setAttribute('class', 'point-hit');
        g.appendChild(hit);

        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttribute('href', getSkillIconPath(p.skill));
        img.setAttribute('x', -12);
        img.setAttribute('y', -12);
        img.setAttribute('width', '24');
        img.setAttribute('height', '24');
        img.setAttribute('class', 'point-icon');
        g.appendChild(img);

        g.addEventListener('click', () => showPointDetails(p));
        pointsLayer.appendChild(g);
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
    
    // モーダル外クリックで閉じる機能を追加
    setTimeout(() => {
        pointModal.addEventListener('click', closeModalOnOutsideClick);
    }, 100);
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
        'cypher': ['Spy Cam', 'Trapwire', 'Cyber Cage'],
        'viper': ['Vipers Pit'],
        'deadlock': ['Sonic Sensor', 'Barrier Mesh'],
    };
    return specialSkills[agent]?.includes(skill) || false;
}

// スキルアイコンの表示
function displaySkills(agent) {
    const skillsContainer = document.querySelector('.skill-buttons');
    skillsContainer.innerHTML = '';

    const skills = getAgentSkills(agent);
    const skillsGrid = document.createElement('div');
    skillsGrid.className = 'skills-grid';

    skills.forEach(skill => {
        const skillButton = document.createElement('button');
        skillButton.className = 'skill-btn';
        skillButton.dataset.skill = skill;

        // スキルアイコンの作成
        const skillIcon = document.createElement('img');
        const formattedSkill = skill
            .split(/\s+|\//)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('_')
            .replace(/\//g, '');
        skillIcon.src = resolvePath(`assets/skills/${formattedSkill}.webp`);
        skillIcon.alt = skill;
        skillButton.appendChild(skillIcon);

        // スキル選択時のイベントリスナー
        skillButton.addEventListener('click', () => {
            document.querySelectorAll('.skill-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            skillButton.classList.add('selected');
            
            // 特定スキルの場合はカテゴリ選択をスキップ
            if (isSpecialSkill(agent, skill)) {
                const points = currentPoints.filter(point =>
                    point.agent === agent &&
                    point.skill === skill &&
                    point.side === currentSide
                );
                displayPoints(points);
            } else {
                // スキルで絞り込んだ定点を表示
                const filteredPoints = currentPoints.filter(point =>
                    point.agent === agent &&
                    point.skill === skill &&
                    point.side === currentSide
                );
                displayPoints(filteredPoints);
                
                // カテゴリを表示
                displayCategories(agent, skill, currentSide);
            }
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
    document.querySelectorAll('.add-point-step').forEach(step => {
        step.style.display = 'none';
    });
    document.getElementById(`step${currentStep}`).style.display = 'block';
}

// スキル選択画面の更新
function updateSkillSelection() {
    const skillSelection = document.querySelector('#step3 .skill-selection');
    skillSelection.innerHTML = '';

    if (!selectedAgent) {
        console.log('エージェントが選択されていません');
        return;
    }

    const categoryMapping = getCategoryMapping();
    const skills = categoryMapping[selectedAgent] ? Object.keys(categoryMapping[selectedAgent]) : [];

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

        const skillIcon = document.createElement('img');
        const formattedSkill = skill
            .replace(/\s+/g, '_')
            .replace(/\//g, '_')
            .replace(/-/g, '_')
            .toLowerCase();

        skillIcon.src = resolvePath(`assets/skills/${formattedSkill}.webp`);
        skillIcon.alt = skill;
        skillIcon.onerror = function() {
            console.warn(`スキルアイコンの読み込みに失敗: ${skillIcon.src}`);
            this.style.display = 'none';
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

// マップ表示の更新（定点追加用）
function updateAddPointMapDisplay() {
    const prefix = selectedSide === 'attack' ? 'atk_' : 'def_';
    const file = `${prefix}${selectedMap.toLowerCase()}.svg`;
    const addPointMapImageSvg = document.getElementById('addPointMapImageSvg');
    if (addPointMapImageSvg) {
        addPointMapImageSvg.setAttribute('href', resolvePath(`assets/maps/${file}`));
    }

    // 定点追加用のズーム・パン設定
    const addPointMapSvg = document.getElementById('addPointMapSvg');
    const addPointViewport = document.getElementById('addPointViewport');
    
    if (addPointMapSvg && addPointViewport) {
        let addPointScale = 1, addPointTx = 0, addPointTy = 0;
        
        // ホイールイベント（ズーム）
        addPointMapSvg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = Math.sign(e.deltaY) * 0.1;
            addPointScale = Math.max(0.5, Math.min(4, addPointScale - delta));
            addPointViewport.setAttribute('transform', `translate(${addPointTx}, ${addPointTy}) scale(${addPointScale})`);
        }, { passive: false });

        // ドラッグ機能
        let addPointDragging = false, addPointStartX = 0, addPointStartY = 0;
        addPointMapSvg.addEventListener('mousedown', (e) => {
            addPointDragging = true; addPointStartX = e.clientX; addPointStartY = e.clientY;
        });
        window.addEventListener('mousemove', (e) => {
            if (!addPointDragging) return;
            addPointTx += (e.clientX - addPointStartX) / addPointScale;
            addPointTy += (e.clientY - addPointStartY) / addPointScale;
            addPointStartX = e.clientX; addPointStartY = e.clientY;
            addPointViewport.setAttribute('transform', `translate(${addPointTx}, ${addPointTy}) scale(${addPointScale})`);
        });
        window.addEventListener('mouseup', () => addPointDragging = false);
    }
}

// マップクリック時の処理（SVG用）
function handleMapClick(e) {
    const addPointMapSvg = document.getElementById('addPointMapSvg');
    if (!addPointMapSvg) return;

    const pt = addPointMapSvg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const inv = addPointMapSvg.getScreenCTM().inverse();
    const svgP = pt.matrixTransform(inv); // これは viewBox 座標（0..1000）
    const norm = { x: svgP.x / 1000, y: svgP.y / 1000 }; // 正規化0..1

    // パーセンテージ表示（0-100）
    const xPercent = norm.x * 100;
    const yPercent = norm.y * 100;

    const positionMarker = document.getElementById('positionMarker');
    positionMarker.style.left = `${xPercent}%`;
    positionMarker.style.top = `${yPercent}%`;
    positionMarker.style.display = 'block';

    document.getElementById('positionX').textContent = xPercent.toFixed(1);
    document.getElementById('positionY').textContent = yPercent.toFixed(1);

    selectedPosition = norm; // 0..1 の正規化座標を保存
    document.querySelector('#step6 .next-step-btn').disabled = false;
}

// 次のステップに進む
function goToNextStep() {
    if (currentStep < 9) {
        currentStep++;
        updateStepDisplay();

        // 各ステップの初期化処理
        switch (currentStep) {
            case 2:
                generateAddPointAgentButtons();
                break;
            case 3:
                updateSkillSelection();
                break;
            case 4:
                setupSideSelection();
                break;
            case 5:
                updateCategorySelection();
                break;
            case 6:
                updateAddPointMapDisplay();
                setupMapClickHandler();
                break;
            case 7:
                setupImageUpload();
                break;
            case 8:
                setupThrowTypeSelection();
                break;
            case 9:
                setupDescriptionInput();
                break;
        }
    } else {
        // 最終ステップで追加ボタンが押された場合
        addPointToFirestore();
    }
}

// 前のステップに戻る
function goToPrevStep() {
    if (currentStep > 1) {
        // 現在のステップのクリーンアップ
        switch (currentStep) {
            case 6:
                cleanupMapClickHandler();
                break;
            case 7:
                cleanupImageUpload();
                break;
        }

        currentStep--;
        updateStepDisplay();
    }
}

// カテゴリ選択画面の更新
function updateCategorySelection() {
    const categoryButtons = document.querySelector('#step5 .category-buttons');
    categoryButtons.innerHTML = '';

    if (!selectedAgent || !selectedSkill || !selectedSide) {
        console.log('必要な情報が不足しています');
        return;
    }

    const categoryMapping = getCategoryMapping();
    const categories = categoryMapping[selectedAgent]?.[selectedSkill]?.[selectedSide] || [];

    if (categories.length === 0) {
        console.log('カテゴリが見つかりません');
        return;
    }

    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.dataset.category = category;

        button.addEventListener('click', () => {
            document.querySelectorAll('#step5 .category-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');
            selectedCategory = category;
            document.querySelector('#step5 .next-step-btn').disabled = false;
        });

        categoryButtons.appendChild(button);
    });
}

// マップクリックハンドラーの設定（SVG用）
function setupMapClickHandler() {
    const addPointMapSvg = document.getElementById('addPointMapSvg');
    if (addPointMapSvg) {
        addPointMapSvg.addEventListener('click', handleMapClick);
    }
}

// マップクリックハンドラーのクリーンアップ（SVG用）
function cleanupMapClickHandler() {
    const addPointMapSvg = document.getElementById('addPointMapSvg');
    if (addPointMapSvg) {
        addPointMapSvg.removeEventListener('click', handleMapClick);
    }
}

// 画像アップロードの設定
function setupImageUpload() {
    const imageInput = document.getElementById('pointImages');
    const imagePreview = document.getElementById('imagePreview');

    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length < 3 || files.length > 5) {
            alert('画像は3〜5枚選択してください');
            imageInput.value = '';
            imagePreview.innerHTML = '';
            selectedImages = [];
            document.querySelector('#step7 .next-step-btn').disabled = true;
            return;
        }

        selectedImages = [];
        imagePreview.innerHTML = '';

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                imagePreview.appendChild(img);
                selectedImages.push(e.target.result);
            };
            reader.readAsDataURL(file);
        });

        document.querySelector('#step7 .next-step-btn').disabled = false;
    });
}

// 画像アップロードのクリーンアップ
function cleanupImageUpload() {
    const imageInput = document.getElementById('pointImages');
    imageInput.value = '';
    document.getElementById('imagePreview').innerHTML = '';
    selectedImages = [];
}

// 投げ方選択の設定
function setupThrowTypeSelection() {
    const throwTypeSelect = document.getElementById('throwType');
    throwTypeSelect.addEventListener('change', () => {
        selectedThrowType = throwTypeSelect.value;
        document.querySelector('#step8 .next-step-btn').disabled = !selectedThrowType;
    });
}

// 説明入力の設定
function setupDescriptionInput() {
    const descriptionInput = document.getElementById('pointDescription');
    descriptionInput.addEventListener('input', () => {
        selectedDescription = descriptionInput.value;
        document.querySelector('#step9 .next-step-btn').disabled = !selectedDescription;
    });
}

// Firestoreに定点を追加
async function addPointToFirestore() {
    try {
        const point = {
            map: selectedMap.toLowerCase(),
            agent: selectedAgent,
            skill: selectedSkill,
            side: selectedSide,
            category: [selectedCategory],
            position: selectedPosition,
            images: selectedImages,
            throwType: selectedThrowType,
            description: selectedDescription,
            timestamp: new Date().toISOString()
        };

        await addPoint(point);
        alert('定点が追加されました');
        document.getElementById('addPointModal').style.display = 'none';
        resetAddPointModal();
        loadPoints(); // 定点一覧を更新
    } catch (error) {
        console.error('定点の追加に失敗しました:', error);
        alert('定点の追加に失敗しました');
    }
}

// 定点追加モーダルの初期化
function initializeAddPointModal() {
    const addPointBtn = document.getElementById('addPointBtn');
    const addPointModal = document.getElementById('addPointModal');
    const closeBtn = addPointModal.querySelector('.close');

    addPointBtn.addEventListener('click', () => {
        resetAddPointModal();
        addPointModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        addPointModal.style.display = 'none';
        resetAddPointModal();
    });
}

// 定点追加モーダルのリセット
function resetAddPointModal() {
    currentStep = 1;
    selectedMap = null;
    selectedAgent = null;
    selectedSkill = null;
    selectedSide = null;
    selectedCategory = null;
    selectedPosition = { x: 50, y: 50 };
    selectedImages = [];
    selectedThrowType = '';
    selectedDescription = '';

    // すべてのステップを非表示
    document.querySelectorAll('.add-point-step').forEach(step => {
        step.style.display = 'none';
    });

    // ステップ1を表示
    document.getElementById('step1').style.display = 'block';

    // すべてのボタンのアクティブ状態を解除
    document.querySelectorAll('.map-btn, .agent-btn, .skill-button, .side-btn, .category-btn').forEach(btn => {
        btn.classList.remove('active', 'selected');
    });

    // すべての次へボタンを無効化
    document.querySelectorAll('.next-step-btn').forEach(btn => {
        btn.disabled = true;
    });

    // 位置マーカーをリセット
    const positionMarker = document.getElementById('positionMarker');
    positionMarker.style.display = 'none';
    positionMarker.style.left = '50%';
    positionMarker.style.top = '50%';

    // 座標表示をリセット
    document.getElementById('positionX').textContent = '50.0';
    document.getElementById('positionY').textContent = '50.0';

    // 画像プレビューをクリア
    document.getElementById('imagePreview').innerHTML = '';

    // フォームをリセット
    document.getElementById('throwType').value = '';
    document.getElementById('pointDescription').value = '';
}

// 初期化時に定点追加モーダルを設定
initializeAddPointModal();

// 攻守選択の設定
function setupSideSelection() {
    const sideButtons = document.querySelectorAll('#step4 .side-btn');
    sideButtons.forEach(button => {
        button.addEventListener('click', () => {
            sideButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedSide = button.dataset.side;
            document.querySelector('#step4 .next-step-btn').disabled = false;
        });
    });
}