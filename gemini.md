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

# Blog Post & Image Management Rules
ブログ記事の新規作成および画像管理は以下のルールを厳守してください。
- **新規作成:** 原則として `pnpm new:post [タイトル] [--slug スラッグ] [--tags タグ]` コマンド（または `scripts/new-post.mjs`）を使用してください。
- **ファイル命名規則:** `src/content/posts/YYYYMMDD_<slug_or_title>.md`（日付プレフィックス必須）
- **画像管理:** 記事ごとの専用画像フォルダ `src/content/posts/YYYYMMDD_<slug>/` 配下に格納し、相対パス（`./YYYYMMDD_<slug>/image.png`）で参照してください。
- **Markdown画像記法:** `![代替テキスト(ALT)](./YYYYMMDD_<slug>/image.png "図表タイトル")`
  - `"図表タイトル"` を指定すると、`src/components/CustomImage.astro` により自動で「図1: 図表タイトル」という連番 `<figcaption>` が出力されます。
  - タイトルを省略した場合は `alt` がキャプションとして使われます。
- **詳細ガイド:** [docs/article-workflow.md](docs/article-workflow.md) を参照。

# Git Commit Rules (Strict)
- 変更やタスクが完了・検証できたタイミングで、**ユーザーからのコミット指示を待たずに自律的に Git コミットを作成してください**。
- ユーザーに「コミットしますか？」と尋ねる必要はありません。検証が通ったら即座にコミットしてください。
- コミットメッセージは日本語で、適切なプレフィックス（`feat:`, `fix:`, `refactor:`, `docs:`, `chore:` など）を付与してください。
- **コミット厳禁ファイル**: 執筆中記事（例: `src/content/posts/20260313_w3cメンバーになりました.md` など未公開・編集中の記事）は、ユーザーから明示的なコミット指示がない限り**絶対にコミットに含めないでください**（`git add .` や `git commit -a` は禁止し、変更対象ファイルのみをピンポイントで `git add` すること）。

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