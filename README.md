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

環境変数(GA4_PROPERTY_ID / GCP_PROJECT_NUMBER / GITHUB_TOKEN 等)は未設定でもダミーデータで動作する。スキーマは `astro.config.mjs` の `env.schema` を参照。

## 運用メモ

- タスク管理と作業ルールは [AGENT_TODO.md](AGENT_TODO.md)
- 記事の執筆フローは [docs/article-workflow.md](docs/article-workflow.md)、設計判断の記録は [docs/adr/](docs/adr/)
- 記事の公開はフロントマターの `draft` / talks は `published`(opt-in)で制御
