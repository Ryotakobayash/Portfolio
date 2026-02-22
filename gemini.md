# Project Context
このプロジェクトは、個人のポートフォリオ兼ブログサイトです。
ユーザーの活動データ（GitHub, 記事投稿数など）を可視化する「ダッシュボード」をコンセプトとしています。

# Tech Stack Rules (Strict)
以下の技術スタックを厳守してください。
- **Framework:** Astro (Islands Architecture), TypeScript
- **UI:** React (Astro Islands として利用)
- **Charts:** Highcharts (Highcharts React Official) — すべてのグラフは Highcharts で統一
- **Styling:** Vanilla CSS (CSS Variables ベースのデザインシステム)
- **Content:** Astro Content Collections (md/mdx) stored in `src/content/` folder
- **Hosting:** Vercel (API Routes for data fetching)
- **Data:** `src/data/` 配下の JSON ファイル (career.json, goals.json)

# Coding Guidelines
- コンポーネントは機能ごとに細かく分割してください。
- グラフ・ダッシュボード系コンポーネントは `src/components/` 配下に配置してください。
- すべてのコード内のコメントと、あなた（Agent）の発言は**日本語**で行ってください。

# Data Fetching
- 外部API（GA4, GitHub等）へのアクセスは `src/pages/api/` 配下のAPI Routesで行ってください。
- フロントエンドでは `fetch` + `useState/useEffect` でデータを取得してください。
- GA4認証は Vercel OIDC + GCP Workload Identity Federation を使用。

# Site Structure
- `/` — ダッシュボードTOP（Hero → Explore Treemap → Proof）
- `/me` — モチベーションダッシュボード（寿命進捗、バーンダウン、累計実績、GitHub Activity）
- `/about` — 来歴・スキル
- `/posts` — ブログ一覧
- `/posts/[slug]` — 記事詳細
- `/tags` — タグ一覧