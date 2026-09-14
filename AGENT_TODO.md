# Agent TODOs

AIエージェントと人間が協業して開発を進めるためのタスク管理レジストリです。
本ファイルはAIエージェントによる機械的な走査・パース・更新に最適化（Agent-First）されています。

---

## 🤖 エージェント実行プロトコル (Agent Protocol)

AIエージェントは以下の手順に厳密に従ってタスクを処理してください。

1. **タスクの特定**:
   - ユーザーから特定のタスク指定がない場合、下記 [Task Registry](#-task-registry) から優先度（`P0` > `P1` > `P2`）が最も高く、Status が `TODO` のものを選択する。
2. **着手 (In Progress)**:
   - 対象タスクのブロックを**他セクションへ移動させない**こと（インプレース更新）。
   - [Task Registry](#-task-registry) テーブルの当該行の `Status` を `IN_PROGRESS` に更新する。
   - 詳細ブロック内の `Status:` を `IN_PROGRESS` に更新する。
3. **実装**:
   - `Target Files` に指定されたファイルを中心に編集する。
   - `Acceptance Criteria` の全条件を満たすように実装する。
4. **検証**:
   - `Verification Command`（例: `pnpm build`）を実行し、エラーのないことを確認する。
5. **完了 (Done)**:
   - [Task Registry](#-task-registry) テーブルの `Status` を `DONE` に更新する。
   - 詳細ブロック内の `Status:` を `DONE` に更新し、`Completed:` に完了日（YYYY-MM-DD）を追記する。
   - タスク単位で Git コミットを作成する（コミットメッセージは日本語）。

---

## 📊 Task Registry (全タスク一覧)

AIエージェントはタスク着手時にまずこのテーブルを走査してください。

| ID | Title | Priority | Status | Target Files |
| :-- | :-- | :-- | :-- | :-- |
| [`TASK-001`](#task-001) | CLS 改善 — client:only 要素の高さ予約とサムネイル SSR 化 | P0 | `DONE` | `src/pages/posts/[slug].astro`, `src/components/...` |
| [`TASK-002`](#task-002) | note アカウント記事のフォーク連携 | P1 | `DONE` | `src/pages/about.astro`, `src/pages/api/...` |
| [`TASK-003`](#task-003) | 読了プログレスの Scroll-driven Animations 実装 | P1 | `WONT_DO` | `src/pages/posts/[slug].astro`, `src/styles/global.css` |
| [`TASK-004`](#task-004) | saturn.obj のメッシュ削減または glTF/Draco 圧縮 | P2 | `DONE` | `public/models/saturn.obj` |
| [`TASK-005`](#task-005) | CRTOverlay の完成 — RGBシャドウマスク（つぶつぶピクセルグリッド） | P2 | `DONE` | `src/components/CRTOverlay.astro`, `src/styles/global.css` |
| [`TASK-006`](#task-006) | ArticleTreemap の PV データ復活（Categorical / Sequential 切り替えUI） | P2 | `DONE` | `src/components/ArticleTreemap.tsx`, `src/pages/api/pv/treemap.ts` |
| [`TASK-007`](#task-007) | AsciiBackground の 404 ページへの適用（信号途絶演出） | P2 | `DONE` | `src/components/AsciiBackground.tsx`, `src/pages/404.astro` |
| [`TASK-008`](#task-008) | SkillRadar の救出と GitHubActivity との統合 | P2 | `BLOCKED` | `src/pages/about.astro`, `src/components/SkillRadar.tsx` |
| [`TASK-009`](#task-009) | CSP (Content-Security-Policy) の段階導入 | P3 | `IN_PROGRESS` | `vercel.json` |
| [`TASK-010`](#task-010) | モバイル表示時の ASCII 装飾の最適化・見え方改善 | P2 | `DONE` | `src/components/AsciiBackground.tsx`, `src/components/slides/SlideAsciiCanvas.tsx` |

---

## 📋 Task Template (新規タスク追加用)

```markdown
### [TASK-XXX] タスク名
- Status: TODO
- Priority: P1
- Target Files: `src/...`
- Verification Command: `pnpm build`
- User Context: なぜ作るのか、背景意図など
- Specifications:
  - [ ] 具体的仕様1
  - [ ] 具体的仕様2
- Acceptance Criteria:
  - [ ] 検証可能な完了条件1
```

---

## 🚀 Active Tasks

### [TASK-001] CLS 改善 — client:only 要素の高さ予約とサムネイル SSR 化
- Status: `DONE`
- Completed: 2026-09-14
- Priority: P0
- Target Files:
  - `src/pages/posts/[slug].astro`
  - `src/components/QuadtreeThumbnail.tsx`
  - `src/pages/index.astro`
  - `src/components/ArticleTreemap.tsx`
  - `src/components/PopularPosts.tsx`
- Verification Command: `pnpm build`
- User Context: CLS 0.23 の主因である client:only 要素のハイドレーション前後のガタつきをなくし、RES を向上させたい。
- Specifications:
  - [x] サムネイルを SSR で `<img>` (`fetchpriority="high"`, `decoding="async"`) として静的出力し、`QuadtreeThumbnail` はその上に absolute 重ねに変更
  - [x] `.article-thumbnail-wrapper` に `aspect-ratio` を予約
  - [x] トップページの Treemap カードに CSS で min-height を予約
  - [x] 記事ページのサイドバー `.sidebar-graph-wrapper` に高さ予約
  - [x] `PopularPosts.tsx` のスケルトン高さを実リスト高（約55px × 5 + Source行）に一致させる
  - [x] 本番デプロイ後の Speed Insights / Lighthouse で数値観察（PerformanceObserver 実測で CLS = 0 を確認）
- Acceptance Criteria:
  - [x] 記事ページ初回ロードでサムネイル出現による本文押し下げが発生しないこと
  - [x] トップページで Treemap ロード前後にセクションが動かないこと
  - [x] Lighthouse(デスクトップ)で CLS < 0.1 になること（実測 CLS: 0）

---

### [TASK-002] note アカウント記事のフォーク連携
- Status: `DONE`
- Completed: 2026-09-12
- Priority: P1
- Target Files:
  - `src/utils/externalPosts.ts`
  - `src/pages/about.astro`
  - `src/pages/index.astro`
  - `src/components/ExternalPosts.tsx`
  - `src/data/external-posts.json`
- Verification Command: `pnpm build`
- User Context: 会社メンバーとして note に公開しているブログ（`https://note.com/tender_hyssop572/rss`）も `/about` の投稿数カウントおよび一覧に含めたい。
- Specifications:
  - [x] note の RSS (`https://note.com/tender_hyssop572/rss`) から記事一覧を取得
  - [x] `/about` の投稿数カウントに note 投稿を加算
  - [x] 既存の note 投稿表示と重複しないように調整
- Acceptance Criteria:
  - [x] `/about` で note の記事が正しく集計・表示されること
  - [x] 記事データに重複が生じないこと
  - [x] ビルドエラーおよび SSR 実行時エラーが発生しないこと

---

### [TASK-003] 読了プログレスの Scroll-driven Animations 実装
- Status: `WONT_DO`
- Decision Date: 2026-09-12
- Reason for Rejection:
  - `scaleX` によるドットの伸縮で間隔が不均一になり、モアレ・チラつきが発生して視覚品質を著しく損ねた。
  - そもそもブラウザ標準のスクロールバーが同様の機能・価値を十分に提供しており、画面上に重複する進捗バーを配置する必要性・価値がないと判断。コードをリバートして撤去。
- Priority: P1
- Target Files: `src/pages/posts/[slug].astro`

---

### [TASK-004] saturn.obj のメッシュ削減または glTF/Draco 圧縮
- Status: `DONE`
- Completed: 2026-09-12
- Priority: P2
- Target Files:
  - `public/models/saturn.obj`
- Verification Command: `pnpm build`
- User Context: 823KB のテキスト OBJ がトップページの転送量を圧迫しているため軽量化したい（2026-07-09 監査 Issue 11 残項目）。
- Specifications:
  - [x] 冗長な法線 (`vn` 14,000行) とテクスチャ座標 (`vt` 4,000行) を削除
  - [x] リングの同心円メッシュを適切な解像度（36セグメント）に最適化
  - [x] 球体メッシュを ASCII レンダラーに最適な密度（16×24）に最適化
  - [x] 座標数値を小数点以下2桁に最適化
- Acceptance Criteria:
  - [x] 転送サイズが現状より大幅に削減（823KB → 15KB、gzip で約178.4KB削減）されること
  - [x] Canvas 上での土星の見た目・描画が破綻しないこと

---

### [TASK-005] CRTOverlay の完成 — RGBシャドウマスク（つぶつぶピクセルグリッド）
- Status: `DONE`
- Completed: 2026-09-13
- Priority: P2
- Target Files:
  - `src/components/CRTOverlay.astro`
  - `src/styles/global.css`
- Verification Command: `pnpm build`
- User Context: 単なる横縞ではなく、CRT実機の蛍光体マスク（アパーチャーグリル/シャドウマスク）特有の「RGBサブピクセルのつぶつぶ感」を純CSSで再現。文字可読性を阻害しない微細な直交RGBドットグリッドを実現。
- Specifications:
  - [x] 縦方向: 3pxピッチの微小RGBストライプ（赤 1px / 緑 1px / 青 1px）
  - [x] 横・縦スリット: 3px×3pxの遮光格子スリット（走査線＋ピクセル境界）
  - [x] テーマ別のブレンド・不透明度最適化（Dark: screen + multiply, Light: multiply）
- Acceptance Criteria:
  - [x] 参考画像のような本物のCRTの微小な「つぶつぶ感」が得られること
  - [x] 文字やカードがクリアに読め、モアレやチラつきが発生しないこと
  - [x] 画像読み込みゼロ・GPU負荷ゼロの純CSSで動作すること

---

### [TASK-006] ArticleTreemap の PV データ復活（Categorical / Sequential 切り替えUI）
- Status: `DONE`
- Completed: 2026-09-14
- Priority: P2
- Target Files:
  - `src/components/ArticleTreemap.tsx`
  - `src/utils/treemapUtils.ts`
  - `src/pages/api/pv/treemap.ts`
- Verification Command: `pnpm build`
- User Context: ジャンル分け(categorical)とPV数マッピング(sequential)を混在させず、デフォルトはジャンル別、セグメンテッドコントロールでPVヒートマップ表示に切り替え可能にする。
- Specifications:
  - [x] API 側で文字数と PV データの両方を返すように調整
  - [x] デフォルト表示を categorical（ジャンル別・タグ固有色）に設定
  - [x] Highcharts Treemap の colorAxis sequential パレット（PV別フラット表示）を実装
  - [x] レトロフューチャーデザインのセグメンテッドコントロール（GENRE / PAGE VIEWS）を配置
  - [x] 各モードに応じた凡例・注記（タグ一覧 / カラーバー凡例）の動的切り替え
- Acceptance Criteria:
  - [x] セグメンテッドコントロールで2つの表示モードが滑らかに切り替わること
  - [x] デフォルトのジャンル別とPVヒートマップが直感的に識別できること
  - [x] PV API 取得失敗時もフォールバック表示できること

---

### [TASK-007] AsciiBackground の 404 ページへの適用（信号途絶演出）
- Status: `DONE`
- Completed: 2026-09-14
- Priority: P2
- Target Files:
  - `src/components/AsciiBackground.tsx`
  - `src/pages/404.astro`
- Verification Command: `pnpm build`
- User Context: 背景 3D ASCII（土星モデル）を 404 ページへ流用。通信途絶（SIGNAL LOST）の世界観に沿って、信号が途絶えかけたチカチカ（flicker）する演出を適用する。（※ポインタ追従は不要と判断）
- Specifications:
  - [x] `404.astro` に AsciiBackground を配置
  - [x] 404 の `signal-flicker` アニメーションと連動した、不透明度の低い点滅・明滅演出を適用
  - [x] メインコンテンツの文字（404, SIGNAL LOST, メッセージ）の可読性を阻害しない z-index / opacity 調整
- Acceptance Criteria:
  - [x] 404 ページで世界観に沿った ASCII 土星の信号途絶演出が表示されること
  - [x] モバイル・デスクトップでリンク操作やテキストの可読性が維持されていること
  - [x] `pnpm build` でエラーが発生しないこと

---

### [TASK-008] SkillRadar の救出と GitHubActivity との統合
- Status: `BLOCKED`
- Priority: P2
- Target Files:
  - `src/pages/about.astro`
  - `src/data/goals.json`
  - `src/components/SkillRadar.tsx` (復元元: `git show a96ce29^:src/components/SkillRadar.tsx`)
- Verification Command: `pnpm build`
- User Context: ⚠️ **保留方針**: スキルの数値の根拠（実績や学習プロセス）となるブログ記事を執筆・公開してからでないと表示しない方針。前提となる記事の蓄積が完了するまで着手・提案しないこと。各軸に根拠（記事タグ数等）を持たせる構成を前提とする。
- Specifications:
  - [ ] `SkillRadar.tsx` を復元し、テーマ判定を `useTheme` フックに統一
  - [ ] `data/goals.json` に skills データを定義
  - [ ] 各軸ホバーで関連記事数などをツールチップ表示
- Acceptance Criteria:
  - [ ] レーダーチャートがテーマ連動して描画されること
  - [ ] 値の展開アニメーションが正常に動作すること

---

### [TASK-009] CSP (Content-Security-Policy) の段階導入
- Status: `IN_PROGRESS`
- Priority: P3
- Target Files:
  - `vercel.json`
- Verification Command: `pnpm build`
- User Context: セキュリティ強化のため CSP を導入したい。いきなりブロックすると機能破損の恐れがあるためレポートモードから始める。
- Specifications:
  - [ ] `vercel.json` の headers に `Content-Security-Policy-Report-Only` を設定
  - [ ] 必要ディレクティブ（script-src, style-src, font-src, connect-src 等）の精査
- Acceptance Criteria:
  - [ ] コンソールに違反レポートが出ない（または予期されたレポートのみが出る）こと
  - [ ] 既存機能（GA4, Vercel Analytics, Highcharts）に影響が出ないこと

---

### [TASK-010] モバイル表示時の ASCII 装飾の最適化・見え方改善
- Status: `DONE`
- Completed: 2026-09-14
- Priority: P2
- Target Files:
  - `src/components/AsciiBackground.tsx`
  - `src/components/slides/SlideAsciiCanvas.tsx`
  - `src/styles/global.css`
  - `src/pages/404.astro`
  - `src/pages/index.astro`
- Verification Command: `pnpm build`
- User Context: スマートフォンなどの狭い画面幅（モバイルブラウザ）で表示した際、ASCII 装飾（背景の ASCII 3D や文字密度）の見え方やバランスを最適化したい。
- Specifications:
  - [x] モバイル端末の画面幅（〜480px）における ASCII フォントサイズ・解像度・行間（line-height）の調整
  - [x] ASCII キャンバスのスケール・カメラ距離・トリミングの最適化
  - [x] 本文コンテンツや Bento カードとの重なり・コントラスト調整
- Acceptance Criteria:
  - [x] モバイル表示時（幅375px〜430px）で ASCII 装飾が潰れたり見切れたりせず、美しく認識できること
  - [x] 画面の縦横比やスクロール時に不要なレイアウトシフトが発生しないこと

---

## ✅ Recent Done (直近完了タスク)

全完了タスクの完全な履歴ログは [docs/tasks-archive.md](docs/tasks-archive.md) を参照してください。

### [TASK-D01] フォント刷新 — Noto Sans JP 廃止・Outfit セルフホスト・和欧混植調整
- Status: `DONE`
- Completed: 2026-07-11
- Summary: 和文システムフォント化 + Outfit variable font セルフホストにより、Google Fonts 外部リクエストゼロ化・フォント由来の CLS を解消。

### [TASK-D02] OGP 画像をサイトの世界観に刷新 (satori の進化)
- Status: `DONE`
- Completed: 2026-07-11
- Summary: 計器盤フレーム・軌道リング・パンチカードドットを取り入れたミニダッシュボード風 OGP を動的生成化。Noto Sans JP フォント同梱。

### [TASK-D03] リポジトリ全体監査に基づく改善 14 件
- Status: `DONE`
- Completed: 2026-07-10
- Summary: 残骸コード・未使用依存削除、GA4 共通化、セキュリティヘッダー追加、three.js 遅延ロードなど 14 件の品質改善を実施。

---

## 💡 Notes & Ideas
記事ネタ、日常メモ、思考アイデアは [docs/ideas.md](docs/ideas.md) で管理しています。
