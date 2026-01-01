---
Date: 2025-06-23
Status: Accepted
---

# 1. Dashboard Portfolio Tech Stack Strategy

## Context
「ユーザー自身の活動ログやサイト指標をダッシュボード形式（Bento Grid）で全公開する」というコンセプトのポートフォリオ兼ブログサイトを構築する。
単なる静的なブログではなく、リアルタイム性のあるデータ可視化が求められる一方、個人運営であるため「メンテナンスコストの低さ」と「執筆の気軽さ」が重要である。

主な要件：
- サイト訪問数、滞在時間、GitHub活動ログなどのデータを可視化したい。
- ダッシュボードUI（Bento Grid）を効率よく構築したい。
- 記事の執筆・管理はGitワークフロー内で完結させたい（Markdown）。
- サーバー管理コストは極限まで下げたい。

## Decision

### 1. Framework & Infrastructure: Next.js (App Router) on Vercel
- **Next.js:** Server Componentsを活用し、Bento Gridのような複雑なレイアウトのパフォーマンスを最適化するため採用。
- **Vercel:** API Routes（Serverless Functions）をゼロコンフィグで使用できるため採用。APIキー（GA4, GitHub等）の隠蔽とプロキシ処理を、別途バックエンドサーバーを立てずに実現する。

### 2. UI Library: Mantine
- 豊富なHooks（`use-os`, `use-window-scroll`など）と、カスタマイズ性の高いコンポーネント群がダッシュボード構築に適しているため採用。
- Tailwind CSSではなく、Mantine独自のスタイルシステム（またはCSS Modules）を使用し、デザインの一貫性を担保する。

### 3. Data Visualization: Highcharts
- ビジネスライクで洗練されたグラフ描画能力を評価し採用。
- RechartsやTremorと比較し、より高度なインタラクションと表現力が求められる場面（ドリルダウンや複合グラフなど）に対応するため。

### 4. Content Management: Local Markdown (Git-based)
- **Decision:** 記事データはリポジトリ内のMarkdownファイルで管理する。
- **Reason:** - 外部CMS（Headless CMS）への依存を排除し、完全無料かつオフラインでも執筆可能にするため。
    - 記事の更新自体をGitHubのContribution（草）として反映させるため。
    - `gray-matter` 等を用いてメタデータを解析し、自身の「執筆活動量」をダッシュボードのデータソースとして利用しやすくするため。

### 5. Analytics & Data Source: Google Analytics 4 (No Database)
- **Decision:** PV数や滞在時間の表示にSupabase等の自前データベースは使用せず、GA4 Data APIを利用する。
- **Reason:** - 個人開発において、アクセス解析用のDB書き込み処理はオーバーヘッドが大きく、メンテナンスコストが増大するため。
    - 「データの蓄積」はGoogleに任せ、アプリ側は「データの取得・表示」に専念するアーキテクチャとする。

## Consequences

### Positive
- **開発体験:** フロントエンド（React）の知識だけで、データ取得から可視化まで完結する。
- **コスト:** Vercel HobbyプランとGA4無料枠の範囲内で運用可能。
- **パフォーマンス:** 静的コンテンツ（記事）と動的データ（グラフ）をNext.jsの機能で適切に分離・最適化できる。

### Negative
- **ビルド時間:** 記事数が増大した場合、Markdownのビルド時間が長くなる可能性がある（数千記事レベルにならない限り許容範囲）。
- **リアルタイム性:** GA4のデータ反映には数時間のラグがあるため、「現在の閲覧者数」以外の指標は厳密なリアルタイムではない（ポートフォリオとしては許容）。