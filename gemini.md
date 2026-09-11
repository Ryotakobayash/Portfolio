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
- 変更を加えるたびに、タスクや機能単位で小まめに Git コミットを作成してください。

# Task Management Rules
- タスクの確認・進捗管理は `AGENT_TODO.md` の Task Registry およびエージェント実行プロトコルに従ってください。
- タスク着手時はインプレースで Status を `IN_PROGRESS` に更新し、完了時は `DONE` に更新してください（セクション間移動は行わない）。

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