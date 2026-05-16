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

## タスク化する前のアイデア

-

## 🚧 進行中タスク (In Progress)

---

## ✅ 完了タスク (Done)

### [タスク名: talks / slides / talks.json の一本化と公開フラグのフェイルセーフ化]

**完了日時:** 2026-05-16
**サマリー:**
3 つに散っていた登壇関連の真実のソースを `talks` コレクション 1 つに統合し、さらに公開判定をフェイルセーフな opt-in 方式に変更。

- `slidesCollection` 廃止、`src/data/talks.json` 削除、`talks` コレクション schema に `published / slug / embedUrl / externalUrl` を集約。
- 拡張子で本体の有無を表現：`.mdx` = スライド本体あり、`.md` = frontmatter のみ（Upcoming や外部埋め込み専用）。
- `/talks` の Upcoming / Archive は `date >= today` で自動分割（旧 `talks.json` の status テキストは廃止、Upcoming は「準備中」一律表示）。
- 公開判定を `draft: true` → `published: true` opt-in に反転。
  - フラグが存在しない／値が `false` なら prod では `/slides/[slug]` は 404。
  - 「公開を忘れて非公開」より「フラグを書き忘れて誤って公開」のほうがリスクが大きいため明示 opt-in 採用。
- `src/utils/slides.ts` を `src/utils/talks.ts` に統合し `getAllTalks` / `getPublishedTalks` / `talkSlug` / `hasSlideBody` を提供。
- 既存 `/slides/slide-system-2026` URL は frontmatter の `slug` フィールドで維持。

### [タスク名: モバイルヘッダーの再調整（ロゴ短縮＋ナビ拡大）]

**完了日時:** 2026-05-16
**サマリー:**
375px 対応で `RK / PORTFOLIO` を縮小したことでナビ項目（Posts/About/Talks）もタップ困難なサイズになっていた問題を解消。

- ロゴをモバイル（≤500px）では `RK` のみ表示する `.logo-full` / `.logo-short` 構造に変更。
- `.nav-link` を 500px 以下で `0.7rem`、375px 以下で `0.65rem` に再調整し、視認性とタップサイズを確保。
- `.theme-toggle` は 375px のみ最小化。

### [タスク名: /posts・/talks のタグフィルタリセットボタン]

**完了日時:** 2026-05-16
**サマリー:**
タグ選択時に件数表示の隣に `× Clear` ボタンを表示し、選択数（`N tags`）も併記。

- `PostSearch.tsx` / `TalkSearch.tsx` に `clearTags()` を追加し `setSelectedTags(new Set())` + `resetPage()`。
- 選択がないときはボタン非表示。

### [タスク名: Upcoming イベントカードに外部リンク]

**完了日時:** 2026-05-16
**サマリー:**
`src/data/talks.json` の upcoming entry に任意の `url` フィールドを導入。

- `talks.astro` で `url` が存在するとき `<li>` 内を `<a target="_blank">` で描画し、`↗` アイコン＋ホバーで枠線を `--color-primary` 化。
- 未設定のカードは従来通りの静的表示を維持。

### [タスク名: スライドページのスケルトン読込アニメ]

**完了日時:** 2026-05-16
**サマリー:**
`/slides/[slug]` は `prerender: false` なので初回ナビゲーションに遅延がある。Astro の `astro:before-preparation` を捕捉して、遷移先 URL が `/slides/...` のときだけ 16:9 スケルトン + コントロールバー風のオーバーレイを被せる実装を追加。

- `BaseLayout.astro` に `transition:persist` 付きの `#slide-loading-overlay` を設置。
- `astro:page-load` で hide。既存の `.skeleton` パターン（パルスアニメ）と一貫させた `.slide-loading-pulse` / `.skeleton-line` を `global.css` に追加。

### [タスク名: スライドの draft 状態管理と /talks の 3 状態表示]

**完了日時:** 2026-05-16
**サマリー:**
`slidesCollection` に `draft: z.boolean().optional().default(false)` を追加し、posts と同様に prod では draft を除外する `getPublishedSlides()` を `src/utils/slides.ts` に実装。

- `/slides/[slug]` は `getPublishedSlides` を経由するため、prod では draft slug が 404 になる（dev では引き続きプレビュー可能）。
- `/talks` の Archive 側カードは状態を 3 つに分類：
  - `no-slides` — slides も embedUrl もない（登壇予定のみ）。非クリッカブル＋「登壇予定」バッジ。
  - `draft-slides` — slides は存在するが draft。embedUrl/externalUrl にフォールバック、無ければ非クリッカブル。「準備中」バッジ。
  - `published` — 通常表示（`/slides/[slug]` または embed URL へリンク）。
- `TalkSearch` の `TalkMeta` に `status` を追加し、メタ行にバッジを表示。

### [タスク名: View Transitions の本格活用]

**完了日時:** 2026-05-11
**サマリー:**
ページ遷移時の体験を向上させるため、View Transitions を強化しました。

- ヘッダーロゴを共有要素 (`transition:name="site-logo"`) に設定。
- メインコンテンツに `slide` アニメーションを適用。
- 背景エフェクト（AmbientGlow, CRTOverlay）を `transition:persist` で永続化し、遷移時の再レンダリングを防止。

### [タスク名: ダークモード切替アニメーション]

**完了日時:** 2026-05-11
**サマリー:**
テーマ切替時に、クリック位置を中心とした円形展開アニメーションを実装しました。

- ブラウザネイティブの View Transition API (`document.startViewTransition`) を使用。
- `global.css` にてアニメーションの競合を防ぐためのスタイル調整。
- 非対応ブラウザ向けのフォールバック処理を実装。

## ✅ 完了タスク (Done)

### [タスク名: /talks ページへの登壇追加手順のドキュメント化]

**完了日時:** 2026-05-11
**サマリー:**
`/talks` ページへの情報追加を容易にするため、`docs/talks-management.md` を作成しました。JSONのスキーマや Speaker Deck の埋め込み方法を記載しています。

### [タスク名: /colophon ページの日本語化]

**完了日時:** 2026-05-11
**サマリー:**
`/colophon` ページのテキストを英語から日本語に翻訳し、日本の閲覧者に合わせて調整しました。

### [タスク名: 500エラーページの作成]

**完了日時:** 2026-05-11
**サマリー:**
サーバーエラー用の `src/pages/500.astro` を作成しました。404ページと共通のデザイン言語を使用しています。

### [タスク名: サイドノート（脚注）リンクのUX修正]

**完了日時:** 2026-05-11
**サマリー:**
記事内の脚注リンクをクリックした際に、非表示の要素へジャンプする挙動を無効化（preventDefault）し、カーソルを default に設定しました。

### [タスク名: /talks（登壇履歴）ページの作成]

**完了日時:** 2026-05-11
**サマリー:**
登壇予定と過去のスライド（Speaker Deck等）をまとめるページを作成しました。

- `src/data/talks.json` を新設し、Upcoming（予定）とPast（過去）の登壇データを管理。
- `src/pages/talks.astro` を作成。Upcomingはタイムライン形式、Pastはカードとiframe埋め込み（16:9比率対応）で実装。
- ヘッダーナビゲーションに `Talks` へのリンクを追加。

### [タスク名: /colophon（サイト制作情報）ページの作成]

**完了日時:** 2026-05-11
**サマリー:**
サイトの制作情報や構成要素を明示する Colophon（奥付）ページを作成しました。

- `src/pages/colophon.astro` を新設し、ヘッダーのナビゲーションに追加。
- 使用書体（Typography）のサンプル、カラーパレットのスウォッチ、技術スタック（Tech Stack）の一覧を整理して表示。
- CSS Variables と連携し、動的にテーマカラーやフォントを反映する実装としました。

## 🚀 未着手タスク (Backlog)

### ✅ [タスク名: モバイル（375px）ヘッダーナビゲーションの修正] — 完了

**背景・目的:**

- 375px 幅で表示したときに、ロゴ（`RK / PORTFOLIO`）・ナビリンク（Posts / About / Talks）・テーマトグル（LIGHT/DARK）が横一列に並びきらず破綻している。
- hamburger menu は使わない方針。インライン表示のまま収める。

**要件・仕様:**

- [ ] `375px` 以下のブレークポイントで `.logo` のフォントサイズと `letter-spacing` を縮小する（`font-size: 0.65rem` 程度、`letter-spacing` を詰める）
- [ ] 同ブレークポイントで `.nav-link` のフォントサイズ・`gap` をさらに縮小する
- [ ] テーマトグルボタンも必要に応じて縮小する
- [ ] 全要素が1行に収まり、かつ視認性を損なわないこと

**関連する既存ファイル:**

- `src/styles/global.css`（`.header`, `.logo`, `.nav-links`, `.nav-link`, `.theme-toggle`）
- `src/layouts/BaseLayout.astro`

**完了条件 (Acceptance Criteria):**

- [ ] 375px 幅のブラウザで全ナビ要素が1行に収まること
- [ ] hamburger menu を使っていないこと

---

### ✅ [タスク名: MDX + Astroコンポーネントベースのスライドシステム構築] — 完了

**背景・目的:**

- Talks ページに掲載するスライドを、Marp HTML の iframe 埋め込みではなく、Astro ネイティブな方法で作成・表示したい。
- MDX でスライドを記述し、独自の Astro コンポーネントでレンダリングすることで、サイトのデザインシステム（CSS 変数・フォント）と完全に統合されたスライドビューアを実現する。
- View Transitions API を活用したスライド遷移アニメーションで、技術的な面白さをもたせる。

**要件・仕様:**

- [ ] `src/content/slides/` にコンテンツコレクションを追加（スキーマ: `title`, `date`, `event`, `description`）
- [ ] スライドコンポーネント群を `src/components/slides/` に作成
  - `Slide.astro` — 1枚のスライドを囲むコンテナ
  - `SlideTitle.astro` — タイトルスライド用レイアウト
  - `TwoColumn.astro` — 2カラムレイアウト
  - `CodeSlide.astro` — コードブロックを中心に据えたスライド
- [ ] `src/pages/slides/[slug].astro` にスライドビューアページを作成
  - Reactアイランド（`client:load`）でスライドインデックス状態を管理
  - `←` `→` キーボードナビゲーション
  - `?slide=N` のURLパラメータでディープリンク対応
  - View Transitions API（`document.startViewTransition`）でスライド切り替えアニメーション
- [ ] `/talks` ページの Past Talks カードに、スライドが存在する場合は `/slides/[slug]` へのリンクを追加
- [ ] サンプルスライドデッキを1つ `src/content/slides/` に作成して動作確認

**関連する既存ファイル・技術スタック:**

- `src/pages/talks.astro`、`src/data/talks.json`
- `src/content/config.ts`（コレクション追加）
- View Transitions API（既にダークモード切替で使用実績あり）
- MDX: `@astrojs/mdx` が導入済みか要確認

**完了条件 (Acceptance Criteria):**

- [ ] MDX でスライドを記述し、`/slides/[slug]` でブラウザ表示できること
- [ ] キーボード（`←` `→`）でスライドを切り替えられること
- [ ] スライド切り替え時に View Transitions アニメーションが動作すること
- [ ] `/talks` ページからスライドビューアへ遷移できること
- [ ] サイトのダーク/ライトテーマが反映されること

---

### [タスク名: 気に入った写真の表示ページ /photos の作成]

**背景・目的:**

- お気に入りの写真を展示するギャラリーページを作成したい。
- 単に画像を並べるだけでなく、Quadtree（四分木）アルゴリズムを用いた画像解析や、技術的な装飾を施したユニークな展示方法を検討する。

**要件・仕様:**

- [ ] `src/pages/photos.astro` を作成
- [ ] 画像の動的な読み込みと、グリッド/Quadtreeベースのレイアウト実装
- [ ] 画像ホバー時のメタデータ表示

**完了条件 (Acceptance Criteria):**

- [ ] `/photos` で画像が美しく、かつ技術的な演出を伴って表示されること

---

### [保留タスク: quadtree-art の演出導入]

1
**背景・目的:**

- quadtree-artを使った演出を入れたいが、まだ具体的なイメージが固まっていないため延期。

## タスクにしたいこと（メモ）

### 改善系タスク

- 各ポストの目次の近くに、記事間リンクグラフ（Obsidian 的な参照関係の可視化）を追加する。

### 新規要素の追加タスク

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

---

## ✅ 完了タスク (Done)

### [Phase 3: Content Experience — ブログ・記事体験の強化]

**完了日時:** 2026-05-11
**サマリー:**
記事の読書体験・サイト品質を向上させる 3 つの施策を実装しました。

- **タスク 3-1:** `@astrojs/rss` で `/rss.xml` フィードを追加。公開済み記事を日付降順で配信。
- **タスク 3-2:** `remark-gfm` を設定し、Markdown の `[^1]` 脚注を Tufte CSS 風の右余白サイドノートに変換。デスクトップは float で右余白に配置、モバイルはインライン表示にフォールバック。
- **タスク 3-3:** カスタム 404 ページ (`src/pages/404.astro`) を作成。`signal-flicker` アニメーションと `█▓▒░` ASCII 装飾でサイトの世界観を維持。

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
