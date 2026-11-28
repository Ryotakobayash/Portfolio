# 登壇スライドを公開前にレビューしてもらう方法

社外に出す前のスライドを、本番サイト（www.ryota5884.com）に載せずに人に見てもらうための手順。
Vercel の **Preview Deployment**（本番とは別の URL にサイトを丸ごとデプロイする機能）を使う。

## 仕組み

- 本番（`VERCEL_ENV=production`）では、`published: true` のスライドだけが `/slides/[slug]` で表示される。
- Preview Deployment（`VERCEL_ENV=preview`）と開発サーバーでは、`published` がなくても表示される。
- 判定は `src/utils/env.ts` の `isProductionDeploy()` に集約している。`VERCEL_ENV` がない環境（ローカルの `pnpm build` など）は本番扱いになり、未公開スライドは隠れる。
- Preview Deployment には Vercel が `X-Robots-Tag: noindex` を付けるため、検索エンジンには載らない。

### URL の種類

| 種類 | 例 | 使いどころ |
|---|---|---|
| ブランチ URL | `portfolio-git-talk-xxx-<team>.vercel.app` | ブランチごとに固定され、push のたびに最新になる。「最新を見て」と頼むとき |
| デプロイ URL | `portfolio-<ハッシュ>-<team>.vercel.app` | デプロイごとに作られ、内容は変わらない。「この版を見て」と頼むとき |

URL は Vercel のダッシュボード（Deployments）か、PR に付く Vercel ボットのコメントで確認できる。

## 方法 A：ブランチを push する

```sh
git switch -c talk/<slug>     # レビュー用ブランチを切る
# スライドを書く（published は付けない）
git add src/content/talks/<file>.mdx
git commit -m "docs: ○○の登壇スライドを追加する"
git push -u origin talk/<slug> # Vercel が自動でプレビューを作る
gh pr create --draft           # 任意。PR 上でコメントをもらえる
```

- 良い点：PR でレビューコメントをもらえる。push するたびにブランチ URL が更新される。
- **注意：GitHub リポジトリは公開（PUBLIC）なので、push した原稿は誰でも読める。** 見られても困らない内容のときに使う。
- レビューが終わったら `published: true` を付けて main にマージすると、本番で公開される。

## 方法 B：GitHub を経由せず手元からデプロイする

```sh
pnpm dlx vercel login   # 初回だけ
pnpm dlx vercel link    # 初回だけ。既存の Vercel プロジェクトを選ぶ（.vercel/ に保存、Git 管理外）
pnpm dlx vercel deploy  # 手元のファイルから Preview Deployment を作り、URL を表示する
```

- 良い点：**原稿が GitHub に一切出ない。** コミットやブランチも不要。
- 悪い点：PR でのコメントはできない。指摘は Slack などでもらうか、Vercel Comments（プレビュー画面上のコメント機能）を使う。
- アップロードしないファイルは `.vercelignore` に書いてある。CLI はデフォルトで `.env` をアップロードしてしまうので、このファイルは消さないこと。
- `--prod` は付けない（付けると本番に出る）。

## 使い分け

| 状況 | 方法 |
|---|---|
| 社外秘、または発表前に中身を知られたくない | B |
| 公開日前というだけで、見られても困らない | A |
| PR 上でじっくりコメントをもらいたい | A |

## レビュアーに見てもらう（共通）

Preview Deployment は、初期設定では Vercel にログインしたプロジェクトメンバーしか開けない（Deployment Protection）。社外の人に見せるときは次のどちらかを使う。

1. **共有リンク（おすすめ）**：プレビューを開き、Vercel ツールバーの Share からリンクを発行して渡す。リンクを知っている人だけが見られる。
2. **保護を外す**：Vercel の Settings → Deployment Protection でプレビューの保護を無効にする。URL を知っていれば誰でも見られるので、基本は 1 を使う。

本番のドメインとは別に `preview.ryota5884.com` のような独自サブドメインをブランチに割り当てることもできるが、上の方法で足りているので設定していない。

## 経緯

talks は公開前にレビューを頼みにくかった。「CI でプレビュー環境を作ってレビューできるようにしたら」という助言をもらい、Vercel に最初からある Preview Deployment を使う形にした。以前の判定は `import.meta.env.PROD` で、これはプレビュー環境でも `true` になるため、未公開スライドがプレビューでも 404 になっていた。そこで判定を `VERCEL_ENV` に切り替えた（2026-11-28）。
