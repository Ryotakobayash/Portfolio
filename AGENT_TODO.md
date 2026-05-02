# Agent TODOs

このファイルは、AIエージェント（AIアシスタント）に依頼したいタスクやアイデアを書き留めておくためのドキュメントです。
エージェントがコードの文脈を把握しやすく、スムーズに実装を進められるように設計されています。

## 📝 使い方（人間向け）
新しいタスクやアイデアを思いついたら、以下の「タスクテンプレート」をコピーして、`## 🚀 未着手タスク (Backlog)` のセクションに追加してください。
タスクの背景（なぜやりたいか）や、完了条件（どうなったらOKか）を明確にしておくと、エージェントがより意図に沿った実装を行えます。

## 🤖 エージェント向けルール (Agent Guidelines)
- あなた（エージェント）は、新しい会話や指示で「タスクを進めて」と言われたら、まずこのファイルの `## 🚀 未着手タスク (Backlog)` を確認してください。
- 作業に着手する際、対象のタスクを `## 🚧 進行中タスク (In Progress)` に移動させてください（複数ステップにまたがる場合は、タスクの進捗状況をチェックリストで管理してください）。
- 作業が完了したら、対象のタスクを `## ✅ 完了タスク (Done)` に移動させ、完了日時と簡単なサマリーを追記してください。
- ユーザーの指示が抽象的であったり、技術的な選択肢が複数ある場合は、作業を進める前にユーザーに確認を取ってください。

---

## 📋 タスクテンプレート
```markdown
### [タスク名: e.g. OOOコンポーネントの作成]
**背景・目的:**
- なぜこれを作るのか？ユーザーにどうなってほしいか？

**要件・仕様:**
- [ ] 具体的な要件1
- [ ] 具体的な要件2

**関連する既存ファイル・技術スタック:**
- 対象ファイル: `src/...`
- (必要であれば) 使用するライブラリや独自ルールなど

**完了条件 (Acceptance Criteria):**
- [ ] 〜の画面でOOOが表示されていること
- [ ] エラーが出ないこと、など
```

---

## 🚀 未着手タスク (Backlog)

## タスク化する前のメモ📝

## タスク化する前のメモ📝
- 記事を書く
	- スキルの評価のやつの根拠を追加する。
	- Adobeの論文をがっつり読んで記事を書いてみる
	- Token関係の取り組みをやる
	- 年末recapの続きを書く。
	- Xのブックマークを整理する
	- 入社前の内定時にやっていることの調査
	- 議事録を使ったレビュー観点抽出の話。
	- 海外の人がやっているやつ（私を構成する言葉、みたいなやつをやってみる）
	- 動く絵文字の話
	- 独自ドメイン設定の話
	- 開発者の自己表現っぽいやつを書いてみる
	- https://gemini.google.com/app/477098d0c68f8eff?hl=ja

---

## 🚧 進行中タスク (In Progress)

### [タスク名: Typography ベストプラクティス導入]
**背景・目的:**
- 参照記事: https://blog.sakupi01.com/dev/articles/state-of-sakupi01com-ui-practice-2
- 現状 `html { font-size: 16px; }` 固定でユーザのブラウザ設定を無視している
- CJK テキスト処理（日本語組版）が一切されていない
- スケーリングシステムがなく、フォントサイズがハードコードで散在
- 詳細な実装計画は Conversation `2bd439de-2d6a-4678-b200-2a65e50bcc7d` の implementation_plan.md を参照

**ユーザ確認済み決定事項:**
- フォントサイズ基準値: `max(1em, 16px)` を採用（`18px` には引き上げない）
- スケーリング適用範囲: `.prose`（ブログ記事本文）限定。ダッシュボード系UIは固定サイズ維持
- `text-fit`: 見送り

**要件・仕様:**

#### Phase 1: フォントサイズ基盤のリファクタリング
- [ ] `src/styles/global.css` の `:root` に Typography Scale 変数を追加
- [ ] `@media (width >= 60em)` で `--p-text-ratio: 1.175` に切り替え
- [ ] `html { font-size: 16px; }` → `html { font-size: var(--p-text-base); }` に変更
- [ ] `html` に `text-size-adjust: none; -webkit-text-size-adjust: none;` を追加
- [ ] `src/pages/posts/[slug].astro` 内 `.prose h2` → `var(--p-step-2)`、`.prose h3` → `var(--p-step-1)` に移行
- [ ] 確認: `npm run dev` → `/posts/{slug}` でブログ記事表示確認

#### Phase 2: CJK テキスト最適化
- [ ] `src/styles/global.css` に以下を追加
- [ ] 確認: ブログ記事で日本語テキストの改行位置や約物の処理を確認

#### Phase 3: テキスト折り返しとコンテンツ幅
- [ ] `src/styles/global.css` に `text-wrap: pretty` を見出しに追加
- [ ] `src/pages/posts/[slug].astro` の `.prose` 内に `max-inline-size: 40em` を p, li 等に追加
- [ ] 確認: 記事本文が約40文字で折り返されること、コードブロック等は幅制限を受けないこと

#### Phase 4: スペーシング改善（`.prose` 内限定）
- [ ] `src/styles/global.css` の `:root` にスペーシング変数追加
- [ ] `.prose p` の `margin-bottom: 1rem` → `margin-block: 0.75lh` に移行
- [ ] `.prose h2` の `margin-top: 2.5rem` → `margin-block-start: var(--s-space-gap-md)` に移行
- [ ] 確認: テキストサイズ変更時にスペーシングが適切にスケールすること

#### Phase 5: `margin-trim`
- [ ] `src/styles/global.css` に `margin-trim: block` とフォールバックを追加
- [ ] 確認: コンテナの先頭/末尾に不要な余白がないこと

**関連する既存ファイル・技術スタック:**
- `src/styles/global.css` — メインの変更対象
- `src/pages/posts/[slug].astro` — `.prose` スタイルの変更対象
- `src/layouts/BaseLayout.astro` — `<html lang="ja">` 設定済み（CJK 対応に必要）

**完了条件 (Acceptance Criteria):**
- [ ] `npm run build` でビルドエラーが出ないこと
- [ ] `/posts/{slug}` でブログ記事の Typography が改善されていること
- [ ] `/` `/about` `/me` でダッシュボード系UIのレイアウトが崩れていないこと
- [ ] ブラウザのフォントサイズ設定を 16px → 24px に変更してテキストが適切にスケールすること
- [ ] モバイル幅（375px）で表示崩れがないこと

---

## ✅ 完了タスク (Done)
### [タスク名: Faviconの設定]
**完了日時:** 2026-04-25
**サマリー:**
- ルートディレクトリにあった `favicon.svg` を `public/favicon.svg` に移動し、AstroのデフォルトFaviconを上書きしました。

### [タスク名: src/content/postsの記事をyyyymmdd_title.mdという命名規則に統一する]
**完了日時:** 2026-03-17
**サマリー:**
- `src/content/posts/` 以下のすべての markdown ファイルをパースし、フロントマターの `date` の値を `yyyymmdd` 形式にしてファイル名や関連ディレクトリ名（画像保管用）の先頭に付与しました。
- それに伴い、内部リンクやAPIエンドポイント（`ranking.ts`, `treemap.ts` など）でハードコードされていた古いslug指定を、新しい `yyyymmdd_title` 形式に置換してリンク切れを防ぎました。

### [タスク名: DashboardページのLifeProgressの見た目を整える]
**完了日時:** 2026-03-16
**サマリー:**
- `src/components/LifeProgress.tsx` を編集し、年齢/寿命の表示形式を `CreativeLifeCountdown`（CreativeLifeRunway部分）の "Days" セクションと同じスタイル（`fontSize: '2.2rem'`, `fontWeight: 900`, `color: 'var(--color-primary)'`, `fontFamily: 'var(--font-sans)'`）に合わせました。
- 狭い画面幅でも破綻しないよう、全体を囲むコンテナに `flexWrap: 'wrap'` と `whiteSpace: 'nowrap'` を適用し、リングの横に文字が収まらなかった場合には自然と折り返して表示されるように調整しています。
- ローカル環境（`pnpm run dev`）を開始し、確認可能な状態にしました（現在バックグラウンドで起動中です）。

### [タスク名: 公開した記事のPVを取得できるようにする]
**完了日時:** 2026-03-16
**サマリー:**
- 当該記事 (`src/content/posts/emacsKeymap_for_claudeCode-2026.md`) のfrontmatterにて、日付が `2026-01-XX` と無効な形式になっていたため、`NaN` と表示されていました。これを `2026-03-08` に修正しました。
- また、当該記事のPVが本番環境で正常に取得できていない問題を解消するため、個別ページのPV取得API (`src/pages/api/pv/[slug].ts`) 内の `getVercelOidcToken` の呼び出し部分に存在していた型ミスマッチエラーを修正しました。

### [タスク名: topページの「Popular Posts · 30 Days」にも記事の公開ステータスを反映させる]
**完了日時:** 2026-03-16
**サマリー:**
- `src/pages/api/pv/ranking.ts` にて `getPublishedPosts()` を呼び出し、下書き（非公開）の記事をランキング結果から除外するように修正しました。
- GA4からの取得元データを50件に増やし、下書き記事を除外した上で上位5件を返す仕様に変更しました。

### [タスク名: 下書き状態の管理（公開・非公開ステータス）]
**完了日時:** 2026-03-08
**サマリー:**
- `src/content/config.ts` のスキーマに `draft: z.boolean().optional().default(false)` を追加
- `src/utils/posts.ts` を作成し `getPublishedPosts()` ヘルパー関数を実装
- 各ページの `getCollection('posts')` を `getPublishedPosts()` に置換し、本番ビルド時のみ `draft` が `true` の記事を除外するように修正
