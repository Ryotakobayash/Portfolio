# Agent TODOs

このファイルは、AIエージェント（AIアシスタント）と協業して進める実装タスクを管理するためのドキュメントです。
エージェントがコードの文脈を素早く把握し、スムーズに実装を進められるように設計されています。

---

## 📑 目次

- [🤖 エージェント向けルール (Agent Guidelines)](#-エージェント向けルール-agent-guidelines)
- [📋 使い方・タスクテンプレート](#-使い方タスクテンプレート)
- [🚧 進行中タスク (In Progress)](#-進行中タスク-in-progress)
  - [CLS 改善 — client:only 要素の高さ予約とサムネイル SSR 化](#cls-改善--clientonly-要素の高さ予約とサムネイル-ssr-化)
- [🚀 未着手タスク (Backlog)](#-未着手タスク-backlog)
  - [機能追加・改善タスク](#-機能追加改善タスク)
    - [note アカウント記事のフォーク](#note-アカウント記事のフォーク)
    - [saturn.obj のメッシュ削減または glTF/Draco 化](#saturnobj-のメッシュ削減または-gltfdraco-化)
    - [CSP の段階導入](#csp-の段階導入)
  - [技術的ロマン・UX 改善タスク](#-技術的ロマンux-改善タスク)
    - [読了プログレスの Scroll-driven Animations](#読了プログレスの-scroll-driven-animationscss新機能の見せ場)
    - [CRTOverlay の完成 — 動くグレインと電源 ON 演出](#crtoverlay-の完成--動くグレインと電源on演出)
    - [ArticleTreemap の PV データ復活（2変数エンコード）](#articletreemap-の使われていない-pv-データを復活させる)
    - [AsciiBackground の磨き込み — ポインタ追従とモチーフ見直し](#asciibackground-の磨き込み--ポインタ追従と省エネ化)
    - [SkillRadar の救出と GitHubActivity との統合](#skillradar-の救出と-githubactivity-との統合about-の計器盤化)
- [💡 アイデア・記事ネタ・思考メモ](#-アイデア記事ネタ思考メモ)
- [✅ 直近の完了タスク (Recent Done)](#-直近の完了タスク-recent-done)
  - [フォント刷新 — Noto Sans JP 廃止・Outfit セルフホスト・和欧混植調整 (2026-07-11)](#タスク名-フォント刷新--noto-sans-jp-廃止outfit-セルフホスト和欧混植調整)
  - [OGP画像をサイトの世界観に刷新(satori の進化) (2026-07-11)](#タスク名-ogp画像をサイトの世界観に刷新satori-の進化)
  - [リポジトリ全体監査に基づく改善14件 (2026-07-10)](#タスク名-リポジトリ全体監査に基づく改善14件セキュリティパフォーマンス冗長性)
- [📚 過去の完了タスクアーカイブ](#-過去の完了タスクアーカイブ)

---

## 🤖 エージェント向けルール (Agent Guidelines)

- 新しい会話や指示で「タスクを進めて」と言われたら、まずこのファイルの [🚀 未着手タスク (Backlog)](#-未着手タスク-backlog) を確認してください。
- 作業に着手する際、対象のタスクを [🚧 進行中タスク (In Progress)](#-進行中タスク-in-progress) に移動させてください（複数ステップにまたがる場合は、タスクの進捗状況をチェックリストで管理してください）。
- 作業が完了したら、対象のタスクを [✅ 直近の完了タスク (Recent Done)](#-直近の完了タスク-recent-done) に移動させ、完了日時と簡単なサマリーを追記してください（数が増えた古いものは [docs/tasks-archive.md](docs/tasks-archive.md) に移送します）。
- 指示が抽象的であったり、技術的な選択肢が複数ある場合は、作業を進める前にユーザーに確認を取ってください。
- 作業過程でファイルを変更するたびに、小まめに Git のコミットを行ってください。
- コード内のコメントおよびエージェントの発言は**日本語**で行ってください。

---

## 📋 使い方・タスクテンプレート

新しいタスクやアイデアを思いついたら、以下の「タスクテンプレート」をコピーして、[🚀 未着手タスク (Backlog)](#-未着手タスク-backlog) のセクションに追加してください。
タスクの背景（なぜやりたいか）や完了条件を明確にしておくと、エージェントがより意図に沿った実装を行えます。

```markdown
### [タスク名: e.g. OOOコンポーネントの作成]

**背景・目的:**
- なぜこれを作るのか？ユーザーにどうなってほしいか？

**要件・仕様:**
- [ ] 具体的な要件1
- [ ] 具体的な要件2

**関連する既存ファイル・技術スタック:**
- 対象ファイル: `src/...`
- 使用するライブラリや独自ルールなど

**完了条件 (Acceptance Criteria):**
- [ ] 〜の画面でOOOが表示されていること
- [ ] エラーが出ないこと、など
```

---

## 🚧 進行中タスク (In Progress)

### CLS 改善 — client:only 要素の高さ予約とサムネイル SSR 化

**ステータス:** 実装完了・本番環境での観察待ち

**背景・目的:**
- CLS 0.23 の主因は、`client:only="react"` 要素が SSR 時に何も出力せず、ハイドレーション後に挿入されてコンテンツを押し下げること（記事ページ先頭サムネイルやトップページの Treemap）。

**要件・仕様:**
- [x] B-1. `src/pages/posts/[slug].astro`: サムネイルを SSR で `<img>`(`fetchpriority="high"`, `decoding="async"`)として静的出力し、`QuadtreeThumbnail`(client:only)はその上に absolute 重ねの演出に変更。`.article-thumbnail-wrapper` に `aspect-ratio` を予約
- [x] B-2. トップページ(`src/pages/index.astro`)の Treemap カードに、チャート 380px + 凡例・注記分を含めた `min-height` を CSS で予約
- [x] B-2. 記事ページのサイドバー `.sidebar-graph-wrapper`(LocalArticleNetworkGraph, client:only)にも同様に高さ予約
- [x] B-3. `src/components/PopularPosts.tsx` のスケルトンを実リスト高に合わせる
- [ ] 検証: `pnpm build` は通過(コミット c790297)。デプロイ後に Speed Insights の CLS/RES を観察して効果を判定する

**関連する既存ファイル・技術スタック:**
- `src/pages/posts/[slug].astro`
- `src/components/QuadtreeThumbnail.tsx`
- `src/pages/index.astro`
- `src/components/ArticleTreemap.tsx`
- `src/components/PopularPosts.tsx`

**完了条件 (Acceptance Criteria):**
- [x] 記事ページ初回ロードでサムネイル出現による本文の押し下げが発生しないこと
- [x] トップページで Treemap ロード前後にセクションが動かないこと
- [ ] Lighthouse(デスクトップ)で CLS < 0.1 になること

---

## 🚀 未着手タスク (Backlog)

### 機能追加・改善タスク

#### note アカウント記事のフォーク

**背景・目的:**
- 所属している会社のメンバーとして公開するブログは note にまとめるようにしている。これも `/about` の投稿数カウントに含めたい。

**要件・仕様:**
- フィード URL: `https://note.com/tender_hyssop572/rss`
- note の RSS から記事データを取得・統合する。

**完了条件 (Acceptance Criteria):**
- [ ] すでにサイトで表示されている note 投稿と、今回の変更で追加される note が重複しないこと（過去の実装は削除して構わない）。

#### saturn.obj のメッシュ削減または glTF/Draco 化

- 根拠: `public/models/saturn.obj` (823KB テキスト OBJ) がトップページの転送量を圧迫している（2026-07-09 監査 Issue 11 残項目）。
- 方向性: メッシュ削減 or glTF/Draco 圧縮。実施により gzip 約 180KB 削減可能。
- コスト: 小 / 優先度: 中

#### CSP の段階導入

- 根拠: セキュリティ強化（2026-07-09 監査 Issue 7）。
- 方向性: まず `Content-Security-Policy-Report-Only` で違反レポートを観察してから本適用する。
- コスト: 小 / 優先度: 低

---

### 技術的ロマン・UX 改善タスク

見た目・UX に与える影響が大きいため、1つずつレビューして進める。

#### 読了プログレスの Scroll-driven Animations(CSS新機能の見せ場)

- コメント: ヘッダー下に読了の進捗が表示されても見ることはできない。モバイルならやる価値はある。PC でやるなら目次と合体させる方が良い。
- 根拠: サイト全体で `animation-timeline` / `scroll-timeline` の使用ゼロ。記事ページには `StickyToc` と読了時間表示 (`posts/[slug].astro:35`) があり、読書体験への投資意欲は明確。
- 方向性: ヘッダー下に `animation-timeline: scroll()` 純 CSS の読了バー(JS 0行)。世界観に寄せて単純なバーでなく DotGrid のドットが読了分だけ点灯していく「パンチカードが打鍵されていく」表現にすると独自性が出る。StickyToc の現在セクション強調も `view-timeline` で置換可能。
- コスト: 小 / ロマン度: 中

#### CRTOverlay の完成 — 動くグレインと電源ON演出

- コメント: 最近のゲーム（ゼンレスゾーンゼロなど）ではアナログ表現が流行っている。その知見を取り入れたい。特定の UI（skill を表示するレーダーチャート背景など）に使う可能性も踏まえて模索したい。
- 現状メモ (2026-07-11): 監査で `CRTOverlay.astro` に変換済み。vignette の pulse には reduced-motion 対応済み。ただしグレインが静止画である点、scanline がライトテーマでほぼ知覚できない点は未解決。
- 方向性: グレインを `steps()` で background-position をランダムジャンプさせて本物のノイズ化。初回ロード/テーマ切替時だけ一瞬の水平同期ズレ(白フラッシュ + scanline 太化 0.3s)を入れると既存の円形 View Transition テーマ切替と相性が良い。`@media (prefers-reduced-motion: reduce)` で全アニメ停止を実装。
- コスト: 小 / ロマン度: 中

#### ArticleTreemap の「使われていない PV データ」を復活させる

- 現状メモ (2026-07-11): 監査で未使用 PV フェッチは削除済み。残るは「PV を2変数目として新規に追加するか」の判断。
- 方向性: 「面積 = 文字数、色の濃度 = PV」の2変数 treemap に進化させる（tooltip への PV 追記 + 彩度エンコードが穏当）。
- コスト: 中 / ロマン度: 中

#### AsciiBackground の磨き込み — ポインタ追従と省エネ化

- コメント: 現状 AsciiRender を使った！という位置付けでしかなく、サイトとして意図がない。背景の土星の 3D モデルも自分にゆかりのないモチーフ。見直しを含めてやりたい。
- 現状メモ (2026-07-11): 省エネ化は監査で完了済み。残るは (a) ポインタ追従などの演出強化、(b) モチーフ（土星）自体の見直し、(c) 404 ページへの流用。
- 方向性: (a) マウス位置に土星がゆっくり視線を向ける lerp 追従、(c) 404 ページ(`█▓▒░` の signal-flicker 演出)に「信号途絶した衛星」として流用。モチーフ見直しは saturn.obj 軽量化と同時に行う。
- コスト: 小〜中 / ロマン度: 中

#### SkillRadar の救出と GitHubActivity との統合(about の計器盤化)

- コメント: SkillRadar に表示する情報には根拠が必要。2026年1月に実施した内容を記事にしてからやるのが良い。
- 現状メモ (2026-07-11): `SkillRadar.tsx` は旧 `/me` 整理で削除済み。復元する場合は `git show a96ce29^:src/components/SkillRadar.tsx` から取得。
- 方向性: about の Hero 横に配置し、`data/goals.json` に skills データを移す。テーマ追従を `useTheme` に統一し、描画アニメーション（0→値へのスイープ）を追加。「根拠」は各軸ホバーで関連記事タグ数・登壇数を出すと GA/コンテンツデータと接続できる。
- コスト: 小 / ロマン度: 中

---

## 💡 アイデア・記事ネタ・思考メモ

ブログの執筆ネタ、デザイン検討、個人の思考メモなどは専用ドキュメントに切り出しています。
タスクとして具体化する前のアイデアは以下を参照・追記してください。

👉 [**docs/ideas.md (アイデア・思考メモ・記事ネタノート)**](docs/ideas.md)

---

## ✅ 直近の完了タスク (Recent Done)

### [タスク名: フォント刷新 — Noto Sans JP 廃止・Outfit セルフホスト・和欧混植調整]

**完了日時:** 2026-07-11  
**サマリー:**  
Vercel Speed Insights の RES 向上およびフォント由来の CLS 解消を目的に実施。和文をシステムフォント優先にし、欧文のみ軽量にセルフホストした。
- `src/layouts/BaseLayout.astro` から Google Fonts 関連 3 行を削除し、外部フォントリクエストを 0 に。
- `src/styles/global.css` の `--font-sans` を Outfit / Noto Sans JP / システムフォント混植スタックに刷新。本文ウェイトを 300 から 400 に統一。
- Outfit variable font を `public/fonts/outfit-latin-variable.woff2` に配置し、フォールバックメトリクス（Arial）を設定してリフローを抑制。
- 見出し類に `font-feature-settings: "palt"` を適用。

### [タスク名: OGP画像をサイトの世界観に刷新(satori の進化)]

**完了日時:** 2026-07-11  
**サマリー:**  
検討中タスク(技術的ロマン観点)の1件目として実施。旧 cyan×ダークグレーの OGP を、サイトのライトテーマ(クリーム #f5eddc × グリーン #466557 の計器盤)に合わせた「記事のミニダッシュボード」に刷新した(コミット 856be0c / 85c5f61 / c48fb32)。
- OrbitalBackground モチーフの軌道リング、DotGrid パンチカード、計器風メタを配置。
- ブログ名を `src/consts.ts` の `SITE_NAME` に集約。
- Noto Sans JP の JP 版 OTF を同梱し、外部依存のない高速・堅牢な生成を実現。

### [タスク名: リポジトリ全体監査に基づく改善14件(セキュリティ/パフォーマンス/冗長性)]

**完了日時:** 2026-07-10  
**サマリー:**  
2026-07-09 の全体監査で洗い出した Issue 1〜14 をすべて実施(コミット 9a2229d〜f028d13)。
- 旧 `/me` ダッシュボードの残骸コンポーネントや未使用依存15個の削除。
- GA4 WIF 認証の共通化、PV 系 API の CDN キャッシュ設定、セキュリティヘッダーの導入。
- 静的コンポーネントの Astro 化、three.js 遅延ロードなどによるパフォーマンス最適化。

---

## 📚 過去の完了タスクアーカイブ

2026年3月〜2026年7月までに完了した全タスクの詳細ログ・サマリーは以下のアーカイブファイルに保管されています。

👉 [**docs/tasks-archive.md (完了タスクアーカイブ全履歴)**](docs/tasks-archive.md)
