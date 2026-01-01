# Project Context
このプロジェクトは、個人のポートフォリオ兼ブログサイトです。
ユーザーの活動データ（GitHub, 記事投稿数など）を可視化する「ダッシュボード」をコンセプトとしています。

# Tech Stack Rules (Strict)
以下の技術スタックを厳守してください。
- **Framework:** Next.js (App Router), TypeScript
- **UI Library:** Mantine (https://mantine.dev/)
- **Charts:** Highcharts (Highcharts React Official)
- **Styling:** CSS Modules または Mantineのスタイルシステム (Tailwindは使用しない)
- **Content:** Local Markdown files (md/mdx) stored in `content/` folder
- **Server:** Vercel (API Routes for data fetching)

# Coding Guidelines
- コンポーネントは機能ごとに細かく分割してください。
- グラフコンポーネントは `components/Dashboard` 配下に配置してください。
- `app/layout.tsx` には MantineProvider を適切に設定してください。
- すべてのコード内のコメントと、あなた（Agent）の発言は**日本語**で行ってください。

# Data Fetching
- 外部API（GA4, GitHub等）へのアクセスは `app/api/` 配下のRoute Handlersで行ってください。
- フロントエンドでは `SWR` または `TanStack Query` を使用してデータを取得してください。