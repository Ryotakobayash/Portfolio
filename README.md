# Portfolio — ryota5884.com

Astro 製の個人ポートフォリオ/ブログ。1960年代の宇宙開発・計器盤をモチーフにしたデザインで、GA4 と連携した PV ダッシュボードや自作スライドシステムを備える。

本番: https://www.ryota5884.com

## 技術スタック

- Astro 6(静的生成 + 一部 SSR)+ React 19(インタラクティブな島のみ)
- Vercel デプロイ。GA4 Data API へは Vercel OIDC + Workload Identity Federation のキーレス認証
- チャートは Highcharts、3D 装飾は three.js + React Three Fiber
- OGP 画像は satori + resvg で動的生成

## ディレクトリ構成

```text
src/
├── content/posts/   # ブログ記事(Markdown、YYYYMMDD_タイトル.md)
├── content/talks/   # 登壇情報とスライド本体(.mdx = スライドあり)
├── pages/           # ルーティング(api/ 配下は GA4・GitHub 連携エンドポイント)
├── components/      # React コンポーネント(チャート・背景演出・検索)
├── layouts/         # BaseLayout(テーマ・View Transitions・フォント)
├── hooks/ utils/    # 共有ロジック
└── styles/          # global.css(デザイントークン + ユーティリティ)
```

## 開発コマンド

| コマンド | 内容 |
| :-- | :-- |
| `pnpm install` | 依存インストール |
| `pnpm dev` | 開発サーバー(localhost:4321) |
| `pnpm build` | 本番ビルド(`dist/`) |
| `pnpm preview` | ビルド結果のプレビュー |
| `pnpm dev:fresh` | キャッシュ削除して dev 起動 |
| `pnpm new:post` | 新規ブログ記事と画像フォルダの雛形作成 |

環境変数(GA4_PROPERTY_ID / GCP_PROJECT_NUMBER / GITHUB_TOKEN 等)は未設定でもダミーデータで動作する。スキーマは `astro.config.mjs` の `env.schema` を参照。

## ブログ記事の執筆と画像管理

記事の作成や画像管理は以下のルールで統一されています（詳細は [docs/article-workflow.md](docs/article-workflow.md) を参照）。

1. **新規作成コマンド:**
   - `pnpm new:post`（対話形式）または `pnpm new:post "タイトル"` で実行すると、本日の日付に基づき記事と専用画像フォルダが自動生成されます。
2. **配置ルール:**
   - 記事: `src/content/posts/YYYYMMDD_<slug_or_title>.md`
   - 画像: `src/content/posts/YYYYMMDD_<slug>/`
3. **画像記法と自動連番キャプション:**
   - `![ALT](./YYYYMMDD_<slug>/image.png "図表タイトル")`
   - `"図表タイトル"` を指定すると、`src/components/CustomImage.astro` により画面下部に **「図1: 図表タイトル」** のように自動で番号付き `<figcaption>` が出力されます。
4. **公開ステータス:**
   - 執筆中は Frontmatter を `draft: true` に設定します。未公開記事は Git コミットに含めない運用です。

## AI エージェント / LLM 協業開発ガイド

本リポジトリは、Claude Code、Gemini（Antigravity）、Cursor、Codex など、**どの AI エージェント・LLM を利用しても一貫した品質とルールで開発できるように標準化**されています。

- **統一ルールファイル（Single Source of Truth）:**
  - ルートの [AGENTS.md](AGENTS.md) に技術スタック、コーディング規約、ブログ執筆ルール、Git コミットルールを集約しています。
  - Claude Code 向けに `CLAUDE.md -> AGENTS.md` のシンボリックリンクを配置しているため、どのツールでも同じ指示が自動読み込みされます。
- **タスク・進捗管理:**
  - タスクの追加・進捗更新・完了確認はすべて [AGENT_TODO.md](AGENT_TODO.md) の Task Registry およびプロトコルに従って機械的・自律的に行われます。
- **自律的 Git コミット:**
  - 各タスクの検証完了後、LLM は自律的にコミットを作成します。ただし未公開記事（`draft: true`）はユーザーの明示指示がない限りコミットに含めず、対象ファイルのみをピンポイントでステージングします。

## 運用メモ

- タスク管理と作業ルールは [AGENT_TODO.md](AGENT_TODO.md)（完了履歴は [docs/tasks-archive.md](docs/tasks-archive.md)）
- 記事ネタ・思考メモ・アイデアは [docs/ideas.md](docs/ideas.md)
- 記事の執筆フロー詳細は [docs/article-workflow.md](docs/article-workflow.md)、設計判断の記録は [docs/adr/](docs/adr/)
- 記事の公開はフロントマターの `draft` / talks は `published`(opt-in)で制御


