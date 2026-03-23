# ニートクエスト

> ニートが勇者として社会復帰するRPG — ブラウザで遊べる無料ゲーム

**[>> ゲームをプレイする (GitHub Pages)](https://toukanno.github.io/neet-quest/)**

---

## ゲーム概要

引きこもり歴 3 年。履歴書は白紙。
「怠惰スライム」「不安コウモリ」「先延ばしゴブリン」――心の中の敵を倒しながら、
コンビニへの買い物、ハローワークへの相談、そして面接ダンジョンの攻略を目指す短編RPGです。

社会復帰度メーターを上げ、最終ボス「ブラック企業の社長」を倒してエンディングを迎えましょう。

## 操作方法

| 操作                | キーボード      | モバイル       |
| ------------------- | --------------- | -------------- |
| 移動                | WASD / 矢印キー | 画面の十字キー |
| 話しかける / 調べる | Space / Enter   | 中央ボタン     |
| ステータス画面      | C               | 画面下部ボタン |
| もちもの画面        | I               | 画面下部ボタン |
| クエスト一覧        | Q               | 画面下部ボタン |

## 主な機能

- **マップ探索** — 6つのエリア (自室 / リビング / 街 / コンビニ / ハローワーク / 面接ダンジョン)
- **ターン制バトル** — こうげき / スキル / アイテム / にげる。ランダムエンカウント方式
- **NPC会話** — 選択肢分岐あり。お母さん、コンビニ店長、ハローワーク受付と会話
- **クエスト** — メインクエスト 4 本 + サブクエスト 3 本
- **ショップ** — コンビニとハローワーク売店で売買
- **装備システム** — 武器 / 防具 / アクセサリーの 3 スロット
- **実績** — 15 種の実績。トースト通知で解除をお知らせ
- **セーブ / ロード** — localStorage ベース、3 スロット
- **チュートリアル** — 初回起動時に 5 ステップのガイド (スキップ可)
- **設定** — BGM/SE 音量、テキスト速度、チュートリアル ON/OFF
- **レスポンシブ** — モバイル / タブレット / デスクトップ対応

## 技術スタック

| レイヤー       | 技術                                                          |
| -------------- | ------------------------------------------------------------- |
| フレームワーク | React 19 + TypeScript                                         |
| ビルド         | Vite 6                                                        |
| 状態管理       | Zustand 5                                                     |
| ルーティング   | React Router 7                                                |
| コード品質     | ESLint 9 + Prettier + Husky + lint-staged                     |
| テスト         | Vitest + Testing Library + axe-core (a11y) + Playwright (E2E) |
| エラー監視     | Sentry (opt-in via `VITE_SENTRY_DSN`)                         |
| アクセス解析   | Google Analytics 4 (opt-in via `VITE_GA_ID`)                  |
| CI/CD          | GitHub Actions → GitHub Pages                                 |
| ホスティング   | GitHub Pages (HTTPS + CDN 自動)                               |

## ローカル開発

```bash
# 依存インストール
npm install

# 開発サーバー起動 (http://localhost:5173)
npm run dev

# ビルド
npm run build

# テスト実行
npm test

# lint
npm run lint
```

## 環境変数 (任意)

| 変数名            | 説明                                                  |
| ----------------- | ----------------------------------------------------- |
| `VITE_SENTRY_DSN` | Sentry DSN (設定するとエラー監視が有効)               |
| `VITE_GA_ID`      | GA4 測定 ID (設定するとアクセス解析が有効)            |
| `BASE_URL`        | デプロイ時のベースパス (GitHub Pages: `/neet-quest/`) |

## プロジェクト構成

```
src/
  components/   # 共通コンポーネント (HUD, MapView, DialogueBox 等)
  screens/      # 画面コンポーネント (Title, Game, Battle, Shop 等)
  store/        # Zustand ストア (ゲーム全状態管理)
  data/         # マスターデータ (items, skills, enemies, quests, maps, achievements, shops)
  types/        # TypeScript 型定義
  lib/          # ユーティリティ (Sentry, GA4)
  __tests__/    # テスト (unit, a11y, performance)
scenario/       # シナリオ YAML (キャラクター設定, メインストーリー)
docs/           # 設計ドキュメント (GDD, ペルソナ, バランス設計)
```

## ライセンス

[MIT](./LICENSE)
