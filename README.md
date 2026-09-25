# Personal Site — ryota5884.com

AstroやHighchartsを使った学習・実験と、記事・登壇・活動データをまとめる個人サイトです。1960年代の宇宙開発・計器盤をモチーフにしたデザインで、GA4と連携したPVダッシュボードや自作スライドシステムを備えています。

本番: https://www.ryota5884.com

## 技術スタック

- Astro 7（静的生成 + 一部SSR）+ React 19（インタラクティブなIslandのみ）
- Vercelへデプロイ。GA4 Data APIへはVercel OIDC + Workload Identity Federationでキーレス認証
- チャートはHighcharts、3D装飾はthree.js + React Three Fiber
- OGP画像はsatori + resvgで動的生成

## ディレクトリ構成

```text
src/
├── content/posts/   # ブログ記事（Markdown、YYYYMMDD_タイトル.md）
├── content/talks/   # 登壇情報とスライド本体（.mdx = スライドあり）
├── pages/           # ルーティング（api/配下はGA4・GitHub連携エンドポイント）
├── components/      # Reactコンポーネント（チャート・背景演出・検索）
├── layouts/         # BaseLayout（テーマ・View Transitions・フォント）
├── hooks/ utils/    # 共有ロジック
└── styles/          # global.css（デザイントークン + ユーティリティ）
```

## 開発コマンド

| コマンド | 内容 |
| :-- | :-- |
| `pnpm install` | 依存インストール |
| `pnpm dev` | 開発サーバー（localhost:4321） |
| `pnpm exec astro check` | Astro・TypeScriptの型検査 |
| `pnpm build` | 本番ビルド（`dist/`） |
| `pnpm preview` | ビルド結果のプレビュー |
| `pnpm dev:fresh` | キャッシュを削除して開発サーバーを起動 |
| `pnpm new:post` | 新規ブログ記事と画像フォルダの雛形作成 |

環境変数（GA4_PROPERTY_ID / GCP_PROJECT_NUMBER / GITHUB_TOKENなど）は未設定でも動作します。ローカル用の疑似値は画面上で`DEMO`と明記され、本番データや障害状態とは区別されます。スキーマは`astro.config.mjs`の`env.schema`を参照してください。

## ブログ記事の執筆と画像管理

記事の作成や画像管理は以下のルールで統一しています。詳細は[docs/article-workflow.md](docs/article-workflow.md)を参照してください。

1. **新規作成コマンド**
   - `pnpm new:post`（対話形式）または`pnpm new:post "タイトル"`で、本日の日付に基づく記事と専用画像フォルダを生成します。
2. **配置ルール**
   - 記事: `src/content/posts/YYYYMMDD_<slug_or_title>.md`
   - 画像: `src/content/posts/YYYYMMDD_<slug>/`
3. **画像記法と自動連番キャプション**
   - `![ALT](./YYYYMMDD_<slug>/image.png "図表タイトル")`
   - 図表タイトルを指定すると、`src/components/CustomImage.astro`が「図1: 図表タイトル」のような`<figcaption>`を生成します。
4. **公開ステータス**
   - 執筆中はFrontmatterを`draft: true`に設定します。未公開記事は明示的な指示なしにコミットしません。

## AIエージェント / LLM協業開発ガイド

このリポジトリは、利用するAIエージェントやLLMが変わっても同じ品質とルールで開発できるようにしています。

- **統一ルール**
  - [AGENTS.md](AGENTS.md)に技術スタック、コーディング規約、記事執筆ルール、Git運用を集約しています。
  - Claude Code向けの`CLAUDE.md`も同じ規約を参照します。
- **タスク・進捗管理**
  - [AGENT_TODO.md](AGENT_TODO.md)のTask Registryと実行プロトコルに従います。
- **自律的Gitコミット**
  - 各タスクの検証後、対象ファイルだけをコミットします。未公開記事はユーザーの明示指示なしに含めません。

## 運用メモ

- タスク管理: [AGENT_TODO.md](AGENT_TODO.md)（完了履歴は[docs/tasks-archive.md](docs/tasks-archive.md)）
- 記事ネタ・思考メモ: [docs/ideas.md](docs/ideas.md)
- 執筆フロー: [docs/article-workflow.md](docs/article-workflow.md)
- 設計判断: [docs/adr/](docs/adr/)
- 公開制御: 記事は`draft`、登壇資料は`published`（opt-in）
