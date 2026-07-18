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
- 作業過程でファイルを変更するたびに、小まめに Git のコミットを行ってください。

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

## 検討中タスク（技術的ロマン観点）

見ため、UXに与える影響がかなりおおきいので1つずつ、レビューして進めていく。上の方が優先度高い。

### 読了プログレスの Scroll-driven Animations(CSS新機能の見せ場)

コメント：ヘッダー下に読了の進捗が表示されても見ることはできない。モバイルならやる価値はあると思う。PCでこれをやるなら、目次と合体させる方がいい。

- 根拠: サイト全体で `animation-timeline` / `scroll-timeline` の使用ゼロ(grep 一致は Marp 書き出し HTML のみ)。記事ページには `StickyToc` と読了時間表示(`posts/[slug].astro:35`)が既にあり、読書体験への投資意欲は明確
- 方向性: ヘッダー下に `animation-timeline: scroll()` 純CSSの読了バー(JS 0行)。世界観に寄せて単純なバーでなく DotGrid のドットが読了分だけ点灯していく「パンチカードが打鍵されていく」表現にすると独自性が出る。StickyToc の現在セクション強調も `view-timeline` で置換可能
- コスト: 小 / ロマン度: 中

### CRTOverlay の完成 — 動くグレインと電源ON演出

↓のやり方でも良さそう。だが、もっとうまいグレインのあり方があったりしないだろうか。最近のゲーム（ゼンレスゾーンゼロなど）ではあえてのアナログ表現が流行っている。そのあたりの知見を可能ならうまく取り入れたい。ここで記載しているやり方でどれくらい見ためが変わるのかわからないので、やってみるのもいいかも。
この手のグレインを特定のUI（例えばskillを表示するレーダーチャートの背景とか）に使う可能性もある。それを踏まえて模索したい。

- 現状メモ (2026-07-11): 監査で `CRTOverlay.astro` に変換済み。vignette の pulse には reduced-motion 対応済み。ただしグレインが静止画である点、scanline がライトテーマでほぼ知覚できない点は未解決のまま
- 根拠: `CRTOverlay.astro` はグレインが静止画。scanline も `mix-blend-mode: multiply` のためライトテーマでほぼ知覚できず「入れた意味」が薄い
- 方向性: グレインを `steps()` で background-position をランダムジャンプさせて本物のノイズ化(feTurbulence の再生成不要で軽い)。初回ロード/テーマ切替時だけ一瞬の水平同期ズレ(白フラッシュ+ scanline 太化 0.3s)を入れると既存の円形 View Transition テーマ切替(BaseLayout.astro:159)と相性が良い。`@media (prefers-reduced-motion: reduce)` で全アニメ停止を今度こそ実装
- コスト: 小 / ロマン度: 中

### ArticleTreemap の「使われていない PV データ」を復活させる

- 現状メモ (2026-07-11): 監査で未使用 PV フェッチは削除済み(「使わないなら削除」の選択肢が既に実行された状態)。残るのは「PV を2変数目として新規に追加するか」という純粋な機能追加の判断のみで、フェッチの再実装が必要になるためコストは小→中に上方修正
- 方向性: 「面積=文字数、色の濃度=PV」の2変数 treemap に進化させる(Done ログで一度 PV 表示を外した経緯があるので、切替トグルより tooltip への PV 追記+彩度エンコードが穏当)
- コスト: 中 / ロマン度: 中

### AsciiBackground の磨き込み — ポインタ追従と省エネ化

コメント：現状AsciiRenderを使った！という位置付けでしかなく、サイトとして意図がない。背景の土星の3Dモデルも意味があまりない。私にゆかりのないモチーフだ。そのへんの見直しなどを含めてやってもいいかもしれない。

- 現状メモ (2026-07-11): 省エネ化は監査で完了済み — AsciiBackground は SlideAsciiCanvas の薄いラッパーに統合され、dpr 上限・タブ非表示/reduced-motion での描画停止・アイドル時ロードも実装済み。残るのは (a) ポインタ追従などの演出強化、モチーフ(土星)自体の見直し、(c) 404 ページへの流用
- 方向性: (a) マウス位置に土星がゆっくり視線を向ける lerp 追従、(c) 404ページ(`█▓▒░` の signal-flicker 演出が既にある)にも「信号途絶した衛星」として流用。モチーフ見直しは Backlog の saturn.obj 軽量化(823KB)と同時にやると一石二鳥
- コスト: 小〜中 / ロマン度: 中

### SkillRadar の救出と GitHubActivity との統合(about の計器盤化)

コメント：skillRadarに表示する情報には根拠となる情報が必要だと思っている。2026年の1月にそれをやったので、それを記事にしてやるのが良いと思う。準備をしておくのは良いと思って記載。

- 現状メモ (2026-07-11): `SkillRadar.tsx` は監査(コミット a96ce29)で旧 /me ダッシュボード残骸として削除済み。着手する場合は `git show a96ce29^:src/components/SkillRadar.tsx` から復元する
- 根拠: SkillRadar は Canvas 手描きのレトロ計器風レーダー(四角ドット、テーマ対応済み)で完成度が高かった。AGENT_TODO の保留メモに「スキルの評価のやつの根拠を追加する」とあり本人も再利用意思がある。復元時は自前テーマ判定を `useTheme` フックに置き換えること
- 方向性: about の Hero 横に配置し、`data/goals.json` に skills データを移す。テーマ追従を `useTheme` に統一し、値の描画にアニメーション(0→値へのスイープ)を追加。「根拠」は各軸ホバーで関連記事タグ数・登壇数を出すと GA/コンテンツデータと接続できる
- コスト: 小 / ロマン度: 中

---

## 🚧 進行中タスク (In Progress)

### [タスク名: フォント刷新 — Noto Sans JP 廃止・Outfit セルフホスト・和欧混植調整]

**背景・目的:**

- Vercel Speed Insights の RES が 88(CLS 0.23 / LCP 2.08s)。フォント由来の CLS(swap リフロー)と render-blocking な Google Fonts CSS が一因。
- Webフォント勉強会の知見に基づき、和文はシステムフォント化(Noto Sans JP は Windows 10/11 に 2025-04 から標準搭載)、欧文のみ軽量にセルフホストする方針。
- 決定済み事項(ユーザー確認済み): 和文は Noto 優先スタック / 本文ウェイトは 300 → 400 に変更。

**要件・仕様:**

- [x] A-1. `src/layouts/BaseLayout.astro` から Google Fonts 関連 3 行(preconnect ×2 + stylesheet link)を削除
- [x] A-1. `src/styles/global.css` の `--font-sans` を以下に変更:
      `"Outfit", "Outfit Fallback", "Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "Yu Gothic", sans-serif`
- [x] A-1. body の `font-weight: 300` を `400` に変更(global.css 内の他の 300 指定も確認し、本文系は 400 に揃える)
- [x] A-2. Outfit variable font(wght 軸、latin サブセット)の woff2 を `public/fonts/outfit-latin-variable.woff2` として配置(`@fontsource-variable/outfit` を devDependency として入れて node_modules からコピーするのが確実)
- [x] A-2. global.css に `@font-face`(`font-family: "Outfit"; font-weight: 100 900; font-display: swap; src: url(...) format("woff2-variations")`)を定義
- [x] A-2. BaseLayout の `<head>` に `<link rel="preload" as="font" type="font/woff2" crossorigin>` を追加
- [x] A-3. `npx fontpie` 等で Outfit のフォールバックメトリクスを算出し、`@font-face { font-family: "Outfit Fallback"; src: local("Arial"); }` に `size-adjust` / `ascent-override` / `descent-override` / `line-gap-override` を設定
- [x] A-4. 見出し(h1〜h3 相当、`.article-title`、KPI 値、セクションラベル類)に `font-feature-settings: "palt"` を追加。本文(`.prose` の段落)には掛けない
- [x] 検証: `pnpm build` が通ること。dev サーバーで見出し・本文・混植箇所(和文中の英数字)の見た目を確認

**関連する既存ファイル・技術スタック:**

- `src/layouts/BaseLayout.astro`(35-37 行目が Google Fonts)
- `src/styles/global.css`(92 行目 `--font-sans`、133-134 行目 body)
- 実使用ウェイト集計: 400 / 500 / 600 / 700 / 900(100 は未使用、300 は body のみ)。variable font 化で全カバー

**完了条件 (Acceptance Criteria):**

- [x] 外部オリジン(fonts.googleapis.com / fonts.gstatic.com)へのリクエストが 0 になること
- [x] フォントロード前後でレイアウトシフトが目視でほぼ発生しないこと
- [x] 和文がヒラギノ(macOS)で表示され、欧文が Outfit のままであること

### [タスク名: CLS 改善 — client:only 要素の高さ予約とサムネイル SSR 化]

**背景・目的:**

- CLS 0.23 の主因は、`client:only="react"` 要素が SSR 時に何も出力せず、ハイドレーション後に挿入されてコンテンツを押し下げること。特に記事ページ先頭のサムネイルとトップページの Treemap。

**要件・仕様:**

- [x] B-1. `src/pages/posts/[slug].astro`: サムネイルを SSR で `<img>`(`fetchpriority="high"`, `decoding="async"`)として静的出力し、`QuadtreeThumbnail`(client:only)はその上に absolute 重ねの演出に変更。`.article-thumbnail-wrapper` に `aspect-ratio` を予約(QuadtreeThumbnail 現行のキャンバスサイズ決定ロジックを調査し、現在の表示サイズと同じ箱を予約すること。既存記事のサムネイル画像の実寸を確認して決める)
- [x] B-2. トップページ(`src/pages/index.astro`)の Treemap カードに、チャート 380px + 凡例・注記分を含めた `min-height` を CSS で予約
- [x] B-2. 記事ページのサイドバー `.sidebar-graph-wrapper`(LocalArticleNetworkGraph, client:only)にも同様に高さ予約
- [x] B-3. `src/components/PopularPosts.tsx` のスケルトンを実リスト高に合わせる(実測: 1 行 約55px × 5 + Source 行。スケルトン行の height とギャップを実物と一致させる)
- [ ] 検証: `pnpm build` は通過(コミット c790297)。Lighthouse 計測は未実施 — デプロイ後に Speed Insights の CLS/RES を 1〜2 週間観察して判定する

**関連する既存ファイル・技術スタック:**

- `src/pages/posts/[slug].astro`(66-75 行目サムネイル、364-368 行目 wrapper CSS)
- `src/components/QuadtreeThumbnail.tsx`(アニメ完了後に実画像を表示する `showRealImage` state が既にある — SSR img との統合に利用できる)
- `src/pages/index.astro`(109-112 行目 Treemap カード)、`src/components/ArticleTreemap.tsx`(chart height 380px + 凡例)
- `src/components/PopularPosts.tsx`(21-29 行目スケルトン)

**完了条件 (Acceptance Criteria):**

- [ ] 記事ページ初回ロードでサムネイル出現による本文の押し下げが発生しないこと
- [ ] トップページで Treemap ロード前後にセクションが動かないこと
- [ ] Lighthouse(デスクトップ)で CLS < 0.1 になること

---

## 🚀 未着手タスク (Backlog)

- (任意・効果大) `public/models/saturn.obj`(823KB テキストOBJ)のメッシュ削減 or glTF/Draco 化。2026-07-09 監査 Issue 11 の残り項目。実施すればトップページの転送量をさらに gzip 約180KB 削減できる
- (任意) CSP の段階導入。まず `Content-Security-Policy-Report-Only` で違反レポートを観察してから本適用する(2026-07-09 監査 Issue 7 で見送った分)

### [タスク名: noteアカウントの投稿を自動取得して表示する]

**背景・目的:**

- 会社メンバーとして公開するブログ記事は note(アカウント: `tender_hyssop572`)にまとめている。以前 note 記事を表示する仕組み(`ExternalPosts.tsx` + `src/data/external-posts.json`)を作ったが、これは手動でJSONに追記する静的リストであり、自動取得の仕組みがない。そのため最近 note に投稿した記事がサイトに反映されていない。
- note の投稿を自動的に取得し、新しく投稿するたびに手動更新なしでサイトに反映されるようにしたい。

　**要件・仕様:**

- [ ] note の RSS フィード(`https://note.com/tender_hyssop572/rss`)を取得し、記事一覧(タイトル・URL・投稿日)をパースする
- [ ] `src/pages/api/github/contributions.ts` 等を参考に、`src/pages/api/note/` 配下に取得用の API Route を新設する(RSSのXMLパースが必要、外部ライブラリ追加が要る場合は事前に確認する)
- [ ] `ExternalPosts.tsx` を、静的JSON参照から API 経由の動的取得(または ビルド時取得)に切り替える。zenn記事など、note以外の既存の静的エントリの扱いも検討する(残すか、同様に自動化するか)
- [ ] 取得失敗時(APIレート制限・ネットワークエラー等)のフォールバック(既存の静的データ表示 or 空表示)を用意する
- [ ] `/about` の投稿数カウントにも新しく取得したnote記事が反映されるか確認する

**関連する既存ファイル・技術スタック:**

- 対象ファイル: `src/components/ExternalPosts.tsx`, `src/data/external-posts.json`, `src/pages/api/github/contributions.ts`(参考実装), `src/pages/about.astro`
- データ取得は `src/pages/api/` 配下の API Routes で行う方針(プロジェクトルール)

**完了条件 (Acceptance Criteria):**

- [ ] noteに新規投稿した記事が、サイト側で手動更新せずに表示されること
- [ ] 既存の /about や記事一覧まわりの表示が壊れていないこと
- [ ] エラーが出ないこと(取得失敗時もページがクラッシュしないこと)

---

## 🐾 保留中のアイデア・メモ

- 記事を書く
  - スキルの評価のやつの根拠を追加する。
  - Token関係の取り組みをやる
  - Adobeの論文をがっつり読んで記事を書いてみる
  - 年末recapの続きを書く。
  - Xのブックマークを整理する
  - 入社前の内定時にやっていることの調査
  - 議事録を使ったレビュー観点抽出の話。
  - 海外の人がやっている開発者の自己表現っぽいやつを書いてみる（私を構成する言葉、みたいなやつをやってみる）[参考](https://gemini.google.com/app/477098d0c68f8eff?hl=ja)

---

## ✅ 完了タスク (Done)

### [タスク名: OGP画像をサイトの世界観に刷新(satori の進化)]

**完了日時:** 2026-07-11
**サマリー:**
検討中タスク(技術的ロマン観点)の1件目として実施。旧 cyan×ダークグレーの OGP を、サイトのライトテーマ(クリーム #f5eddc × グリーン #466557 の計器盤)に合わせた「記事のミニダッシュボード」に刷新した(コミット 856be0c / 85c5f61 / c48fb32)。

- デザイン: 計器盤フレームの中に、OrbitalBackground モチーフの軌道リング(土星の環の傾きと衛星3つの位置はタイトルのハッシュで記事ごとに変化)、DotGrid のパンチカードドット、タグバッジ(最大3つ)、DATE / READ の計器風メタを配置。タイトルは長さに応じ 64/56/48px の3段階 + 3行クランプ。装飾は satori が確実に描ける div ベースで実装
- レビュー反映: クリーム地・装飾密度は第1案どおり採用。CHARS メーターと著者名はユーザー判断で削除し、メタのフォントを拡大(SNS 縮小表示対策)。READ の分数と単位のベースラインずれは satori が alignItems: baseline 非対応のため flex-end + paddingBottom で調整
- サイト名の一元化: 10箇所にハードコードされていた「RK / Portfolio」(旧称 Dashboard Portfolio 含む)を `src/consts.ts` の `SITE_NAME` に集約。ブログ名変更が OGP・RSS・JSON Feed・各ページ title・ヘッダーロゴ・GA4 ランキングのサフィックス除去に自動反映される
- フォント: ユーザー判断でフル収録を採用し、Noto Sans JP の JP 版 OTF(Regular/Bold 計9.2MB)を src/assets/fonts に同梱。vercel adapter の includeFiles で関数にバンドルし、リクエスト毎の Google Fonts fetch を廃止(外部依存起因の生成失敗リスクも解消)
- 検証: 公開16記事すべてで 200 + PNG 生成を確認、本番ビルドでフォント同梱と関数サイズ(71MB / 上限250MB)を確認済み
- 運用メモ: OG 画像は CDN に1日キャッシュされるため、デプロイ直後に旧デザインが見える場合がある。X の Card Validator 等で実 URL の表示確認を推奨


### [タスク名: リポジトリ全体監査に基づく改善14件(セキュリティ/パフォーマンス/冗長性)]

**完了日時:** 2026-07-10
**サマリー:**
2026-07-09 の全体監査で洗い出した Issue 1〜14 をすべて実施(コミット 9a2229d〜f028d13)。

- 掃除: 旧静的 rss.xml・Marp 関連・マイグレーションスクリプト・テスト記事・陳腐化 docs を削除、.obsidian を gitignore 化、README を実態に更新。旧 /me ダッシュボードの残骸9コンポーネント+api/pv.ts(約950行)と未使用依存15個を削除
- バグ修正: ShareButtons の共有 URL が旧ドメイン(dashboard-portfolio.vercel.app)を指していたのを Astro.site 由来に修正
- API: GA4 の WIF 認証を src/utils/ga4.ts に集約(4重コピー解消)。PV 系 API に CDN キャッシュ(s-maxage=3600)を付与、error.message のクライアント返却と SA メールのハードコードを撤去、OG 画像のフォント取得 URL に fonts.gstatic.com 検証を追加
- 配信: vercel.json にセキュリティヘッダー5種(X-Frame-Options / nosniff / Referrer-Policy / HSTS / Permissions-Policy)を追加
- フロント: AmbientGlow / CRTOverlay / OrbitalBackground / DotGrid / RelatedPosts を .astro 化(island を持たないページで React ランタイム不要に)、prefers-reduced-motion 対応を実装。NetworkGraph を client:media 化して二重ハイドレーション解消。three.js チャンクを React.lazy + requestIdleCallback で遅延ロード化し dpr 上限・タブ非表示時の描画停止を追加(AsciiBackground は SlideAsciiCanvas の薄いラッパーに統合)。ArticleTreemap の未使用 PV フェッチを削除して treemap API の二重呼び出しを解消。1.1MB PNG サムネイルを WebP(158KB)化。StickyToc を IntersectionObserver 化。検索 UI を client:idle 化。テーマ検出3箇所を useTheme に統合、未使用 CSS クラス8個と変数十数個を削除
- 運用上の注意: Vercel の環境変数に GCP_SERVICE_ACCOUNT_EMAIL が設定されていることを要確認(ハードコードのフォールバックを削除したため、未設定だと本番 PV がダミーデータに落ちる)

### [タスク名: ブログ詳細ページへのローカルネットワークグラフ（Obsidian風）の実装]

**完了日時:** 2026-06-21
**サマリー:**
各ブログ記事の個別詳細ページ（`/posts/[slug]`）のサイドバーおよびフッターに、その記事を中心としたローカルな関係性（タグや、共通タグを持つ関連記事）を視覚化したドラッグ操作可能でインタラクティブなネットワークグラフを実装しました。

- 特定の記事を中心とする `LocalArticleNetworkGraph.tsx` コンポーネントを新規開発。中心の記事ノード（大きく目立つグリーン）、タグノード、および共通タグを持つ関連記事ノードをエッジで結んで描画。
- 関連記事ノードをクリックした際、該当の記事へ画面遷移するインタラクションを構築。また、ホバー時に記事の日付と抜粋を表示するツールチップを実装。
- `src/pages/posts/[slug].astro` に組み込み、デスクトップ表示時は右サイドバーの目次の上に、モバイル表示時は記事本文の下にそれぞれレスポンシブに表示されるよう Vanilla CSS でレイアウトを構築。
- 不要になったブログ一覧ページ（`/posts`）の一時的なアコーディオンおよび `ArticleNetworkGraph.tsx` を削除。
- ブログ一覧のカードでの四分木アニメーションは不要とのフィードバックに基づき無効化（記事詳細ページのヘッダー画像での演出は維持）。

### [タスク名: Xアカウントへのリンク設置 & 記事詳細ページ要素の幅一貫性調整]

**完了日時:** 2026-05-31
**サマリー:**
Xアカウントへのリンクを設置し、またアクセシビリティ（読みやすさ）向上のために記事詳細ページの本文・コードブロック等のレイアウト幅を調整しました。

- `src/pages/about.astro` の Links セクションに X (Twitter) アカウント（`https://x.com/Re00871489`）のリンクを追加。
- 記事全体のレイアウトバランスを崩さないよう、ヘッダー、サムネイル画像、数値ボードは元の広がる幅（100%）に維持。
- 記事本文の文章（段落、リスト）、見出し、引用、テーブル、およびコードブロックのみ最大幅を `40em` に厳密に制限し、右端が綺麗に揃うように CSS を修正。
- デスクトップ表示時に、余白に浮く Tufte CSS 風のサイドノート (`sidenote`) が重ならず美しく配置されるようにレイアウト幅を調整。

### [タスク名: JSON Feed (feed.json) の作成とフィードの整備]

**完了日時:** 2026-05-31
**サマリー:**
モダンなフィードフォーマットである JSON Feed 1.1 に対応するため、エンドポイントの新設とレイアウトへの購読リンク埋め込みを行いました。

- `src/pages/feed.json.ts` を新規作成し、Astro Content Collections から取得した公開済み記事データを JSON Feed 1.1 形式（`application/feed+json`）で静的出力（`prerender = true`）するように実装しました。
- `src/layouts/BaseLayout.astro` の `<head>` 内に JSON Feed 購読リンク `<link rel="alternate" type="application/feed+json" ...>` を追加しました。
- `pnpm build` にてビルドおよび静的生成テストを行い、ローカルで API 応答と HTML ソースの動作を確認しました。

### [タスク名: PV Timelineの復活と表示バグ修正]

**完了日時:** 2026-05-31
**サマリー:**
使われていなかったPVタイムライン表示を復活させ、テーマ連動やローカル用のフォールバック、開発環境の動作安定化を行いました。

- `src/pages/about.astro` に `PVTimeline` コンポーネントを `client:only="react"` で組み込み、「03 · PV Timeline」セクションとして追加（以降のセクションをリナンバリング）。
- プロットラインに表示される投稿情報にタイトルを渡すため、`postDates` のマッピング処理に `title` を含めるよう修正。
- `src/components/PVTimeline.tsx` にて、テーマ（`isDark`）変更時に `chart.update(options, true, true)` が走るようにし、ダークモード切り替え時の配色追従バグを修正。
- `astro.config.mjs` で定義している `GA4_PROPERTY_ID` と `GCP_PROJECT_NUMBER` スキーマを `optional: true` に変更し、ローカル開発環境で環境変数が空の場合でも `EnvInvalidVariables` エラーを出さずにダミーデータで安全に動くよう修正。
- `pnpm build` およびローカル環境での API/HTML 応答疎通を確認。

### [タスク名: Astro v6 後続タスク — astro:env / astro/zod / Vercel preview 検証]

**完了日時:** 2026-05-31
**サマリー:**
Astro v6 のメジャー移行後推奨事項に対応し、環境変数管理とzodインポートを適正化しました。

- `astro.config.mjs` に `envField` を用いて、環境変数（GA4, GCP, GitHubトークン等）のスキーマ定義を記述。
- `src/pages/api/pv*.ts` や `contributions.ts` での `process.env` / `import.meta.env` 直接参照を `astro:env/server` からの型安全インポートに移行。
- `src/content.config.ts` で `z` を `astro:content`（将来非推奨）から `astro/zod` からの直接インポートへ変更。
- 本番ビルドを実行し、全静的ルートのプリレンダリング、サーバーエントリーポイントのコンパイルが警告なくパスすることを確認。

### [タスク名: Astro v6 アップグレード後の dev 警告調査]

**完了日時:** 2026-05-31
**サマリー:**
Astro v6 / React 19 アップグレード後にブログ記事詳細ページで発生していた `Invalid hook call` 警告を解消しました。

- 原因: SSRでHTMLを出力しない（常に `null` を返しクライアントでのみ `useEffect` を評価する）`ImageZoom` コンポーネントが `client:load` として読み込まれていたため。
- 対策: `ImageZoom` を `client:only="react"` に変更してSSRでの評価をスキップするように修正。
- また、重複モジュール解決の競合を防ぐため、`ImageZoom.tsx` のエクスポート定義を `export default function` のみに統一しました。

### [タスク名: talks / slides / talks.json の一本化と公開フラグ of フェイルセーフ化]

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

### [タスク名: aboutとdashboardページの合成]

**完了日時:** 2026-05-10
**サマリー:**

- `src/pages/me.astro` (Dashboard) の内容を `src/pages/about.astro` に統合し、1つのページに集約しました。
- `me.astro` ファイルを削除し、ヘッダー (`BaseLayout.astro`) の Navigation メニューから Dashboard を削除しました。
- トップページ (`index.astro`) にあった `/me` へのリンクを `/about` へ変更しました。
- 統合後の表示順は、Hero情報、Time Remaining、Post Count、GitHub Activity、Links としました。

### [タスク名: ダッシュボード全体像を示すTreemap of 改善]

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
```
