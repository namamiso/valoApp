# VALORANT 定点管理アプリ

VALORANTの各マップにおけるエージェントのスキル定点を管理・表示するデスクトップアプリケーションです。

## 機能

- マップごとの定点表示
- エージェント・スキル・サイド（攻め/守り）によるフィルタリング
- カテゴリ別の定点表示
- 定点の詳細情報表示（画像スライダー付き）
- 新規定点の追加機能

## 必要条件

- Node.js (v14.0.0以上)
- npm (v6.0.0以上)
- Firebase プロジェクト

## インストール方法

1. リポジトリをクローン
```bash
git clone [リポジトリURL]
cd valo-points
```

2. 依存パッケージのインストール
```bash
npm install
```

3. Firebase設定
- Firebase Consoleでプロジェクトを作成
- プロジェクトの設定からFirebase設定情報を取得
- `createData/createFirestoreData.js`の`firebaseConfig`を更新

## データベースのセットアップ

1. データの生成
```bash
npm run create-data
```

このコマンドにより、以下のデータがFirestoreに追加されます：
- カテゴリマッピング（`skillCategories`コレクション）
- 定点情報（`positions`コレクション）

## アプリケーションの起動

```bash
npm start
```

## プロジェクト構造

```
valo-points/
├── main.js                # Electron アプリのエントリポイント
├── index.html            # メイン画面のHTML
├── style.css             # スタイルシート
├── script.js             # フロントエンドのロジック
├── firebase.js           # Firebase初期化と通信ロジック
├── package.json          # アプリ設定と依存関係
└── assets/               # 画像・アイコンなどのアセット
    ├── maps/             # マップ画像
    ├── agents/           # エージェントアイコン
    └── skills/           # スキルアイコン
```

## データ構造

### 定点情報（positions コレクション）
```json
{
  "agent": "sova",
  "map": "ascent",
  "skill": "Recon Bolt",
  "category": ["メイン＆ミッド取り", "ガジェット破壊"],
  "description": "Aサイトへのエントリー用",
  "throwType": "その場投げ",
  "position": { "x": 30, "y": 40 },
  "side": "attack",
  "images": ["assets/points/sova_recon_1.jpg"]
}
```

### カテゴリマッピング（skillCategories コレクション）
```json
{
  "agent": "sova",
  "skill": "Recon Bolt",
  "attack": ["メイン＆ミッド取り", "エントリー", "ガジェット破壊"],
  "defense": ["開幕", "カウンター", "リテイク"]
}
```

## 注意事項

- マップ画像は解像度を統一して使用してください
- 定点位置は%座標で管理されます
- 画像は最大5枚までアップロード可能です
- 動画ではなく、複数の静止画で定点情報を構成します

## 今後の拡張予定

- お気に入り定点の保存機能
- スキルアイコンの動的読み込み
- 初心者向けのUIガイド／チュートリアル

## ライセンス

ISC 