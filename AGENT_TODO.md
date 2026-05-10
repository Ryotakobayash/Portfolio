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
### [保留タスク: quadtree-art の演出導入]
**背景・目的:**
- quadtree-artを使った演出を入れたいが、まだ具体的なイメージが固まっていないため延期。

## タスクにしたいこと

### 改善系タスク

- markdownのfootnoteに対応する。Tufte CSS 的な余白注釈の表示をイメージ。
- Astro View Transitions を本格活用する（ページ間でロゴや見出しが共有要素として滑る）
- テキストリンクホバー時に該当画像のサムネがフェードで出るリンクプレビューを実装する
- ダークモード切替アニメーションを `view-transition` で覆う
- カスタム 404 / 500 ページに性格を持たせる
- 各ポストの目次の近くに、記事間リンクグラフ（Obsidian 的な参照関係の可視化）を追加する。

新規要素の追加タスク
- サイト自体の制作情報を表示するページ`/colophon`を追加する。
	- 書体、配色、ビルドツール、ホスティング
- 登壇履歴の統合ページ`/talks`を追加する。
	- Speaker Deck 埋め込み
	- Marp HTML
	- 今後の登壇予定 タイムライン
- 気に入った写真の表示ページ`/photos`を追加する。Quadtree等で画像処理する機能を付ける
- おすすめのものを追加していく`/favo`ページを追加する。
- RSS / JSON Feed の整備


## タスク化する前のメモ📝
- 記事を書く
	- スキルの評価のやつの根拠を追加する。
	- Token関係の取り組みをやる
	- Adobeの論文をがっつり読んで記事を書いてみる
	- 年末recapの続きを書く。
	- Xのブックマークを整理する
	- 入社前の内定時にやっていることの調査
	- 議事録を使ったレビュー観点抽出の話。
	- 海外の人がやっている開発者の自己表現っぽいやつを書いてみる（私を構成する言葉、みたいなやつをやってみる）[参考](https://gemini.google.com/app/477098d0c68f8eff?hl=ja)
	- 動く絵文字の話
	- 独自ドメイン設定の話
- marpで出力したスライドを配置するページを作成する。
- 自分が気に入った写真を表示するページを作成する。
- 「Popular Posts · 30 Days」が月が切り替わるタイミングで、リセットされるようになっているので、直近1ヶ月のを集計するようにする。
- 「PV Timeline」のグラフが表示されないようになっているので直す。
- 過去に作ったスライド(marp製)の出力結果であるhtmlをスライドを配置するページに表示する。

---




---

## 🚧 進行中タスク (In Progress)

### [Phase 3: Content Experience — ブログ・記事体験の強化]
**背景・目的:**
- ポートフォリオの中核コンテンツである「記事」の読書体験を向上させる。
- RSS Feed の整備、脚注の余白表示、カスタムエラーページ の3タスクに絞る（リンクプレビューや記事間グラフは Phase 4 以降に延期）。

**作業ルール:**
- 1タスク完了ごとに `git commit` すること。
- コミットメッセージは `feat:` / `style:` / `fix:` のプレフィクスを使うこと。
- 完了したタスクはチェックを入れること。
- 全タスク完了後、このセクション全体を `## ✅ 完了タスク (Done)` へ移動し、サマリーを追記すること。

---

#### タスク 3-1: RSS / JSON Feed の整備
- [ ] 実装完了
- [ ] ビルドエラーなし確認

**概要:** `@astrojs/rss` を使い `/rss.xml` エンドポイントを生成する。

**手順:**
1. `pnpm add @astrojs/rss` でパッケージをインストール。
2. `src/pages/rss.xml.ts` を新規作成。以下の要件で実装する:
   - `getPublishedPosts()` (`src/utils/posts.ts`) を使って公開済み記事のみ取得。
   - `title`: `"RK / Portfolio"`, `description`: `"Ryota Kobayashi's blog and portfolio"`, `site`: `import.meta.env.SITE` (astro.config.mjs の `site` 値)。
   - 各アイテムの `link` は `/posts/${post.data.slug || post.id.replace(/\.mdx?$/, '')}` 形式。
   - `pubDate` は `post.data.date` を `new Date()` でパース。
   - 記事を日付降順でソートしてフィードに含める。
3. `src/layouts/BaseLayout.astro` の `<head>` 内に `<link rel="alternate" type="application/rss+xml" title="RK / Portfolio" href="/rss.xml" />` を追加。
4. **注意:** このファイルは SSR 環境でプリレンダリングする必要があるため、ファイル先頭に `export const prerender = true;` を記述すること。

**完了条件:** `pnpm run build` がエラーなく通り、`/rss.xml` にアクセスするとXML形式のフィードが返ること。

---

#### タスク 3-2: Markdown 脚注（footnote）の Tufte CSS 的な余白注釈表示
- [ ] 実装完了
- [ ] ビルドエラーなし確認

**概要:** Markdown の `[^1]` 記法による脚注を、ページ下部ではなく記事本文の右余白（サイドノート）に表示する。デスクトップのみサイドノート表示し、モバイルではインライン展開する。

**手順:**
1. `pnpm add remark-gfm` が既にインストール済みか確認（`package.json` を参照 → 済み）。`remark-gfm` は GFM footnote 構文をパースする。
2. `astro.config.mjs` の `markdown.remarkPlugins` に `remark-gfm` が設定されているか確認し、なければ追加。（`remarkPlugins: [remarkGfm]` の形式）
3. `src/pages/posts/[slug].astro` の `<style>` セクションに以下のスタイルを追加:
   - `.prose :global(.footnotes)` — デフォルトの脚注セクション（ページ下部）を非表示にする (`display: none`)。
   - `.prose :global(sup a[data-footnote-ref])` — 脚注参照リンクのスタイル。上付き数字をプライマリカラーで強調。
   - `.prose :global(.sidenote)` — サイドノート用スタイル。`float: right; clear: right; margin-right: -220px; width: 200px;` で右余白に配置。`font-size: 0.75rem; color: var(--color-text-muted);`。
   - モバイル (`@media (max-width: 1023px)`) では `.sidenote` を `float: none; width: 100%; margin: 0.5rem 0; padding: 0.5rem; background: var(--color-bg-secondary); border-left: 2px solid var(--color-primary);` にフォールバック。
4. `src/pages/posts/[slug].astro` の `<script>` セクション（`setupImageFigures` と同じ場所）に、DOM操作で脚注をサイドノートに変換する関数を追加:
   ```js
   function setupSidenotes() {
     const footnoteSection = document.querySelector('.footnotes');
     if (!footnoteSection) return;
     const refs = document.querySelectorAll('sup a[data-footnote-ref]');
     refs.forEach((ref) => {
       const id = ref.getAttribute('href')?.replace('#', '');
       if (!id) return;
       const footnoteItem = footnoteSection.querySelector(`#${id}`);
       if (!footnoteItem) return;
       // サイドノート要素を生成
       const sidenote = document.createElement('span');
       sidenote.className = 'sidenote';
       sidenote.innerHTML = footnoteItem.innerHTML;
       // バックリンクを削除
       sidenote.querySelectorAll('.data-footnote-backref, a[data-footnote-backref]').forEach(el => el.remove());
       // 脚注参照の直後に挿入
       const sup = ref.closest('sup');
       sup?.parentNode?.insertBefore(sidenote, sup.nextSibling);
     });
   }
   ```
   既存の `DOMContentLoaded` / `astro:page-load` イベントリスナーに `setupSidenotes()` の呼び出しを追加。
5. **注意:** `.article-layout` のグリッドは現状 `max-width: 1100px` で `1fr 280px` 構成。サイドノートが右余白にはみ出すには、記事本文 `.prose` に `overflow: visible` を確保し、`.article` にも `overflow: visible` を設定する必要がある。既存の `overflow` 指定があれば `visible` に変更すること。

**完了条件:** テスト用の脚注を含む記事をビルドし、デスクトップ幅で脚注が本文横に表示され、モバイル幅ではインライン展開されること。

---

#### タスク 3-3: カスタム 404 ページの作成
- [ ] 実装完了
- [ ] ビルドエラーなし確認

**概要:** ポートフォリオの世界観に合ったカスタム404ページを作成する。ASCIIアート風のデザインで「迷子」感を表現する。

**手順:**
1. `src/pages/404.astro` を新規作成。`export const prerender = true;` を先頭に記述（Astro SSR環境で404をプリレンダリングする標準手法）。
2. `BaseLayout` を使用し、タイトルは `"404 — Page Not Found | RK / Portfolio"`。
3. ページ内容:
   - 中央寄せレイアウト（`display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh;`）。
   - 大きな `404` 数字をモノスペースで表示（`font-size: 6rem; font-weight: 900; color: var(--color-primary); font-family: var(--font-mono); letter-spacing: 0.1em;`）。
   - サブテキスト: `"SIGNAL LOST"` を `font-size: 0.7rem; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: var(--color-text-muted);` で表示。
   - 説明文: `"The page you're looking for has drifted beyond our telemetry range."` を `font-size: 0.9rem; color: var(--color-text-secondary); max-width: 400px; text-align: center;` で表示。
   - ASCIIアートの装飾: `█▓▒░` を使った横ライン（`<div class="morse">` クラスを再利用）を上下に配置。
   - ホームへのリンクボタン: `"← Return to Base"` — `<a href="/" class="link-arrow">` を使用。
4. スタイルは `<style>` タグ内にスコープドCSSで記述する（global.css には追加しない）。

**完了条件:** 存在しないURL（例: `/nonexistent`）にアクセスした際にこのページが表示されること。

---

## ✅ 完了タスク (Done)
### [Phase 2: Dashboard Robustness]
**完了日時:** 2026-05-10
**サマリー:**
ダッシュボードとしての完成度を高めるため、各カードの信頼性向上や演出の追加を行いました。
- 値・グラフの状態表現を `.skeleton` クラスで一貫性を持たせました。
- 各ダッシュボードカード末尾にデータソース情報 (`Source: GA4 API` 等) を明記しました。
- `useCountUp` カスタムフックを実装し、初期ロード時に数字がパラパラとカウントアップする演出を追加しました。
- `PVProgress` にSVG描画による簡易的なスパークラインを追加し、直近7日間のトレンドを可視化しました。

### [Phase 1: Quick Wins & Clarity]
**完了日時:** 2026-05-10
**サマリー:**
トークン枯渇リスクに備え、即効性のあるUI改善とバグ修正を優先実施し、タスクごとにGitコミットを行いました。
- ASCII レンダーに使う文字のカスタム ( `█▓▒░` に変更)
- `/me` (現 `/about`) の Life Progress の説明追加 (初期マウント時のバグ修正と説明テキスト追加)
- Article Map の categorical パレット色数増加 (DIVERSE_COLORS定義と文字列ハッシュによる決定)
- `Article Map — Word Count`の面積が文字数を表していることを明示する。 (凡例とTooltipに追加)
- `Popular Posts · 30 Days` を直近30日の集計に変更する。 (GA4のAPIが既に `30daysAgo` を使用したローリング集計であることを確認)



## ✅ 完了タスク (Done)
### [タスク名: aboutとdashboardページの合成]
**完了日時:** 2026-05-10
**サマリー:**
- `src/pages/me.astro` (Dashboard) の内容を `src/pages/about.astro` に統合し、1つのページに集約しました。
- `me.astro` ファイルを削除し、ヘッダー (`BaseLayout.astro`) の Navigation メニューから Dashboard を削除しました。
- トップページ (`index.astro`) にあった `/me` へのリンクを `/about` へ変更しました。
- 統合後の表示順は、Hero情報、Time Remaining、Post Count、GitHub Activity、Links としました。

### [タスク名: ダッシュボード全体像を示すTreemapの改善]
**完了日時:** 2026-05-03
**サマリー:**
- Treemapの設計を「サイトの全体像（ボリューム感）を直感的に把握する」という目的に特化させるため、文字数（面積）×ジャンル（カテゴリ色）の表示1つに固定しました。
- ツールチップの表示項目および右下の統計情報をPVから「Words（文字数）」に変更し、情報の意味を統一しました。
- 階層構造（タグ→記事）を維持しつつ、ジャンルごとにCategoricalパレットを適用し、不要な切り替え機能や複雑な `colorAxis` ロジックを削除してメンテナンス性を向上させました。
- 修正後コミットを行いました (`feat: change Treemap metrics...`, `refactor: simplify Treemap...`)。
### [タスク名: 記事のファイル名日本語化と短いURLの両立]
**完了日時:** 2026-05-03
**サマリー:**
- Nodeスクリプトにより、`src/content/posts/` の記事のファイル名を `YYYYMMDD_記事タイトル.md` という日本語フォーマットにリネームしました。
- 元のファイル名（ID）を `slug` としてフロントマターに付与し、ルーティング時に `post.data.slug` を優先して利用するよう各所のロジックを修正しました。これにより既存URLの短さ・リンクを維持しています。
- 修正後コミットを行いました (`feat: localize post filenames...`)。
### [タスク名: イベント参加レポートタグの統一と整理]
**完了日時:** 2026-05-03
**サマリー:**
- `src/content/posts/*.md` ファイル群に含まれる `EventReport` および `イベント` タグをすべて `参加ログ` に置換し、統一しました。
- 修正後コミットを行いました (`chore(content): unify event report tags...`)。
### [タスク名: WCAG基準に基づくコントラスト比の改善]
**完了日時:** 2026-05-03
**サマリー:**
- `src/styles/global.css` のCSS Variablesを調整し、ライト・ダークテーマ両方において、`color-text-muted`, `color-primary`, `color-accent` 等のコントラスト比が背景色に対して4.5:1 (WCAG AA基準) を満たすように修正しました。
- 修正後コミットを行いました (`style: adjust CSS variables to meet WCAG AA...`)。
### [タスク名: Share機能のアップデート（はてブ削除・Bluesky/LinkedIn追加）]
**完了日時:** 2026-05-03
**サマリー:**
- `src/components/ShareButtons.tsx` にて、はてなブックマークを削除し、BlueskyとLinkedInのシェアリンクを追加しました。
- 修正後コミットを行いました (`feat: replace Hatena Bookmark...`)。
### [タスク名: トップページ惑星装飾のz-index修正]
**完了日時:** 2026-05-03
**サマリー:**
- `src/components/OrbitalBackground.tsx` の `zIndex` プロパティを `0` から `-1` に変更し、テキスト要素の背面に描画されるように修正しました。
- 修正後コミットを行いました (`fix: change OrbitalBackground z-index to -1...`)。
### [タスク名: Typography ベストプラクティス導入]
**完了日時:** 2026-05-03
**サマリー:**
- `src/styles/global.css` に `clamp()` を用いたFluid Typography基盤を導入し、OS・ブラウザの文字サイズ設定に追従するように対応
- `text-autospace` などのCJK（日本語組版）向け最適化プロパティを追加
- `text-wrap: pretty` による見出しの改行最適化、およびブログ記事（`.prose`）内の読みやすい行幅制限（`40em`）を導入
- 余白管理を `lh`, `rlh` 等を用いたRhythmベースに刷新し、文字サイズに連動して適切な間隔を保てるよう改修
- `margin-trim: block` を採用し、先頭・末尾の不要な余白を削減（非対応ブラウザ向けフォールバック含む）
- フェーズごとにコミットを分割し対応済み
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
