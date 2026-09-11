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
| [`TASK-001`](#task-001) | CLS 改善 — client:only 要素の高さ予約とサムネイル SSR 化 | P0 | `IN_PROGRESS` | `src/pages/posts/[slug].astro`, `src/components/...` |
| [`TASK-002`](#task-002) | note アカウント記事のフォーク連携 | P1 | `DONE` | `src/pages/about.astro`, `src/pages/api/...` |
| [`TASK-003`](#task-003) | 読了プログレスの Scroll-driven Animations 実装 | P1 | `WONT_DO` | `src/pages/posts/[slug].astro`, `src/styles/global.css` |
| [`TASK-004`](#task-004) | saturn.obj のメッシュ削減または glTF/Draco 圧縮 | P2 | `TODO` | `public/models/saturn.obj` |
| [`TASK-005`](#task-005) | CRTOverlay の完成 — 動くグレインと電源 ON 演出 | P2 | `TODO` | `src/components/CRTOverlay.astro`, `src/styles/global.css` |
| [`TASK-006`](#task-006) | ArticleTreemap の PV データ復活（2変数エンコード） | P2 | `TODO` | `src/components/ArticleTreemap.tsx`, `src/pages/api/pv/treemap.ts` |
| [`TASK-007`](#task-007) | AsciiBackground の磨き込み — ポインタ追従とモチーフ見直し | P2 | `TODO` | `src/components/AsciiBackground.astro`, `src/components/SlideAsciiCanvas.tsx` |
| [`TASK-008`](#task-008) | SkillRadar の救出と GitHubActivity との統合 | P2 | `TODO` | `src/pages/about.astro`, `src/components/SkillRadar.tsx` |
| [`TASK-009`](#task-009) | CSP (Content-Security-Policy) の段階導入 | P3 | `TODO` | `vercel.json` |

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
- Status: `IN_PROGRESS`
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
  - [ ] 本番デプロイ後の Speed Insights / Lighthouse で数値観察
- Acceptance Criteria:
  - [x] 記事ページ初回ロードでサムネイル出現による本文押し下げが発生しないこと
  - [x] トップページで Treemap ロード前後にセクションが動かないこと
  - [ ] Lighthouse(デスクトップ)で CLS < 0.1 になること

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
- Status: `TODO`
- Priority: P2
- Target Files:
  - `public/models/saturn.obj`
  - `src/components/SlideAsciiCanvas.tsx`
- Verification Command: `pnpm build`
- User Context: 823KB のテキスト OBJ がトップページの転送量を圧迫しているため軽量化したい（2026-07-09 監査 Issue 11 残項目）。
- Specifications:
  - [ ] OBJ メッシュ削減、または glTF/Draco 圧縮フォーマットへの変換
  - [ ] 読み込みコンポーネント側のローダー調整
- Acceptance Criteria:
  - [ ] 転送サイズが現状より大幅に削減（gzip で約180KB以上削減）されること
  - [ ] Canvas 上での土星の見た目・描画が破綻しないこと

---

### [TASK-005] CRTOverlay の完成 — 動くグレインと電源 ON 演出
- Status: `TODO`
- Priority: P2
- Target Files:
  - `src/components/CRTOverlay.astro`
  - `src/styles/global.css`
- Verification Command: `pnpm build`
- User Context: アナログ計器盤の質感を高めるため、静止画のグレインを本物の動的ノイズにし、電源ON/テーマ切替時の同期演出を入れたい。
- Specifications:
  - [ ] CSS `steps()` で background-position をランダムジャンプさせ動的ノイズ化（SVG 再生成不要で軽量）
  - [ ] 初回ロードおよびテーマ切替時に一瞬の水平同期ズレ演出（白フラッシュ + scanline 太化 0.3s）
  - [ ] `@media (prefers-reduced-motion: reduce)` で全アニメ停止
- Acceptance Criteria:
  - [ ] ライト/ダーク両テーマで過度にならず心地よいレトロ感が得られること
  - [ ] CPU/GPU 負荷が上がらないこと
  - [ ] reduced-motion 時に完全に静止すること

---

### [TASK-006] ArticleTreemap の PV データ復活（2変数エンコード）
- Status: `TODO`
- Priority: P2
- Target Files:
  - `src/components/ArticleTreemap.tsx`
  - `src/pages/api/pv/treemap.ts`
- Verification Command: `pnpm build`
- User Context: 一度外した PV データを、「面積 = 文字数、色の濃度 = PV」の2変数エンコードとして復活させたい。
- Specifications:
  - [ ] API 側で文字数と PV データの両方を返すように調整
  - [ ] Highcharts Treemap の colorAxis / saturation ロジックを実装
  - [ ] Tooltip に文字数と PV の両方を併記
- Acceptance Criteria:
  - [ ] 2変数（文字数×PV）が視覚的に区別できること
  - [ ] PV API 取得失敗時もフォールバック表示できること

---

### [TASK-007] AsciiBackground の磨き込み — ポインタ追従とモチーフ見直し
- Status: `TODO`
- Priority: P2
- Target Files:
  - `src/components/AsciiBackground.astro`
  - `src/components/SlideAsciiCanvas.tsx`
  - `src/pages/404.astro`
- Verification Command: `pnpm build`
- User Context: 背景 3D モデルのポインタ追従と、モチーフ（土星）自体の見直し。404 ページへの流用。
- Specifications:
  - [ ] マウス座標に対する lerp 視線追従の実装
  - [ ] 404 ページ (`█▓▒░` の flicker 演出) への「信号途絶衛星」としての適用
- Acceptance Criteria:
  - [ ] マウス操作に滑らかに追従すること（低負荷）
  - [ ] 404 ページで世界観に沿った演出が表示されること

---

### [TASK-008] SkillRadar の救出と GitHubActivity との統合
- Status: `TODO`
- Priority: P2
- Target Files:
  - `src/pages/about.astro`
  - `src/data/goals.json`
  - `src/components/SkillRadar.tsx` (復元元: `git show a96ce29^:src/components/SkillRadar.tsx`)
- Verification Command: `pnpm build`
- User Context: 削除された旧 SkillRadar を about ページの Hero 横に計器盤風に復元・統合したい。各軸に根拠（記事タグ数等）を持たせる。
- Specifications:
  - [ ] `SkillRadar.tsx` を復元し、テーマ判定を `useTheme` フックに統一
  - [ ] `data/goals.json` に skills データを定義
  - [ ] 各軸ホバーで関連記事数などをツールチップ表示
- Acceptance Criteria:
  - [ ] レーダーチャートがテーマ連動して描画されること
  - [ ] 値の展開アニメーションが正常に動作すること

---

### [TASK-009] CSP (Content-Security-Policy) の段階導入
- Status: `TODO`
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
