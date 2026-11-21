# DTCG キャッチアップレポート（2026年1月〜2026年11月21日）

W3C Design Tokens Community Group（DTCG）の2026年の動きを、記事「w3cメンバーになりました」Phase 1 のチェック項目に沿ってまとめる。サイボウズの「Web標準動向」への DTCG パート寄稿の下敷きにもする。

- 調査日: 2026-11-21
- 一次情報: `design-tokens/community-group` リポジトリ（コミット履歴・2026年に更新された issue 32件 / PR 57件）、W3C CG ブログ、`public-design-tokens` ML アーカイブ、designtokens.org、Style Dictionary / Terrazzo のリリース
- 未確認: GitHub Discussions、Format Module 議事録（Google Docs）、Discord、Figma 公式リリースノート（末尾の「残タスク」参照）

---

## 0. 3行サマリ

1. **仕様本体は 2025.10 のまま凍結状態。** 2026年の仕様テキスト変更はすべて誤記・リンク・例示の修正で、新しいドラフトもない。drafts ページも 2025.10 のプレビューのまま。
2. **動いたのは「周辺インフラ」と「体制」。** 公式 JSON Schema の整備、テストスイート追加（2026-09）、チャットの Slack→Discord 移行（2026-06）、共同チェアの Jina Anne / Val Head の退任（2026-06）。意思決定フレームワークは PR のまま未マージ。
3. **次の論点は「モーション（spring）」「色の合成（alpha / color-mix）」「複数値（配列）」「タイポの拡張」。** 外圧になっているのは Figma の新機能（Figma Motion、色変数の opacity 合成）で、Figma が独自の `$extensions` で先行している。

---

## 1. Final Reports 2025.10 の現在地

| モジュール | 公開 | 2026年の変化 |
| --- | --- | --- |
| Format Module 2025.10 | 2025-10-28 | 編集上の修正のみ（例示の `$type` 補完、リンク修正、JSON Pointer の MAY/MUST 矛盾の解消 #442） |
| Color Module 2025.10 | 2025-10-28 | 表記の Markdown 化、JSON Schema へのリンク追加のみ |
| Resolver Module 2025.10 | 2025-12-16（Final Report） | `version` フィールドの型表記修正（`YYYY-MM-DD`→`YYYY.MM`, #408）、JSON Schema 追加（#356）。目次の不整合や bundling 例の修正 PR（#457, #458）がオープン |

押さえておく点:

- **参照構文は2本立てで確定。** `{group.token}`（波括弧エイリアス）と `$ref`（JSON Pointer）はどちらも MUST でサポート。仕様の「Recommended」表記は誤りで、削除された（#383 → #442、2026-09-09 マージ）。`$ref` を使うと配列要素（例: oklch の hue 成分）も参照できる。一方で「色の構造に結合してしまう」という批判も出た。
- **color は composite ではない。** そのため `components` 配列の中に波括弧エイリアスは書けない（`$ref` オブジェクトなら可）。`cubicBezier` も同じ扱い（#383 での @drwpow の回答）。
- **モード（light/dark・ブランド）は Resolver の責務。** `$modes` 配列の提案（#348）は「Resolver で解決済み、足りないのはツールとガイド」として 2026-02-24 にクローズ。ブランド×テーマの2軸も `resolutionOrder` で modifier を並べるのが想定どおりの書き方（#381）。
- drafts ページ（designtokens.org/tr/drafts/）の日付は 2026-09-08。中身は 2025.10 の修正版プレビューで、新バージョンの予告はない。

---

## 2. 2026年のタイムライン

| 時期 | 出来事 | 出典 |
| --- | --- | --- |
| 1月 | Resolver の JSON Schema を追加、例示を実在のトークン型に統一（light/dark 例を削除） | #356, #364, #378 |
| 1月 | issue テンプレートに「現行安定版（2025.10）」の選択肢を追加 | #377 |
| 1月 | 「JSON Pointer の MAY/MUST 矛盾」報告 | #383 |
| 1月 | `em` を dimension に追加する提案（リアクション最多の新規 issue） | #390 |
| 1月〜6月 | JSON Schema の修正が続く（配列全体のエイリアス、MIME タイプ、バンドル） | #387, #388, #389, #412 |
| 2月 | Kaelig が Discord 通知ワークフローを追加。@drwpow がオープン issue の棚卸しを実施 | コミット, #348 |
| 4月 | 公式サイトを Astro v6 化し、ブログをサイト内に移設。Resolver Playground を修正 | #395, #405 |
| 5月 | 用語集の UI デザインツールに Penpot を追加 | #406 |
| 6月 | **コミュニティチャットを Slack から Discord へ移行** | #418, #420 |
| 6月17日 | **ブログ「Thank you, Jina and Val」**: Jina Anne と Val Head が共同チェアを退き、chairs emerita に。Kaelig はチェアを続投。共同チェア選挙と（一部公開の）ミーティング再開を「次の投稿で」予告 | W3C CG ブログ |
| 6月末〜 | モーションの上位レイヤー（spring / keyframe）提案。Figma Motion のデータを使った検証が進む | #429 |
| 8月 | 「複数値（配列）」を次回エディターズミーティングに持ち込むと @drwpow が表明 | #239 |
| 9月 | **テストスイートのパッケージを追加**（ツール実装者向けの適合テスト fixture） | #386, #413 |
| 9月 | Figma の色合成機能を根拠に、色の加工（alpha / color-mix）の議論が再燃 | #88 |
| 9月〜11月 | 公式 JSON Schema と仕様本文の不一致の報告が続く（`$root` 参照、`$type` 継承時の検証漏れ、gradientStop の ref） | #428, #439, #448, #449 |
| 11月 | Resolver の目次・例の修正 PR | #457, #458 |

ML（`public-design-tokens`）は2026年の投稿がブログ転送の1通（6月）だけ。2025年12月は Resolver の Final 化で28通あった。**2026年の議論はほぼ GitHub と Discord に移っている。**

---

## 3. 未決事項・議論が続いている issue

### 優先度高（次に動きそう／寄稿で触れる価値あり）

| issue | 論点 | 状況・各ポジション |
| --- | --- | --- |
| [#429](https://github.com/design-tokens/community-group/issues/429) / [#158](https://github.com/design-tokens/community-group/issues/158) モーション | `transition`（2状態・cubicBezier）の先。spring、keyframe、名前付きパターン | エディター @ilikescience は「方向性は一致、proposal を書いてよい」。@drwpow は「モーションは次のロードマップ」「spring は皆が望んでいる。論点はどの数式を基準にするか」（2026-07）。コントリビューター側は Figma が spring を `{bounce, duration}` で持ち、`bounce = 1 − 減衰比` になることを Plugin API で実証済み。「名前付きパターン」は groups/aliases に任せる方向 |
| [#88](https://github.com/design-tokens/community-group/issues/88) 色の加工 | 基準色を参照しつつ alpha だけ変える（rgba 相当）、`color-mix` など | 2021年からの長寿 issue。2026-09 に「Figma が色変数の opacity を別変数にバインドできるようになり、DTCG エクスポートでは `$extensions.com.figma.composedColor` に逃がしている」との報告が入り再燃。「固定メニューの加工関数」と「汎用の式言語」を分けるべきという整理が出ている。CSS Color の編集者 @svgeesus（Chris Lilley）も参加し、RGB 前提ではなく OKLCH など知覚的な空間で操作すべきと指摘 |
| [#239](https://github.com/design-tokens/community-group/issues/239) 複数値（配列型） | padding・border の4辺など、複数値の表現 | @drwpow が「現行構文は不要な制約を課している。次回エディター会議で扱う」（2026-08） |
| [#102](https://github.com/design-tokens/community-group/issues/102) / [#53](https://github.com/design-tokens/community-group/issues/53) / [#417](https://github.com/design-tokens/community-group/issues/417) タイポグラフィ | `fontStyle`（italic）、`textDecoration` / `textTransform`、`lineHeight` に dimension も許すか、`letterSpacing` の任意化、プロパティ集合を閉じるか開くか | Figma の "Bold Italic" が往復変換できない、公式スキーマが `additionalProperties: false` なので独自拡張も検証で落ちる、という実装者からの報告あり（2026-09） |
| [#390](https://github.com/design-tokens/community-group/issues/390) `em` 単位 | dimension に `em` を追加 | 実需は多い（letter-spacing、インラインアイコン）。一方で iOS / Android に相当概念がないので、プラットフォーム非依存の原則と衝突する |

### 公式 JSON Schema と本文のずれ（実装者が踏みやすい）

- [#448](https://github.com/design-tokens/community-group/issues/448) / [#449](https://github.com/design-tokens/community-group/pull/449): `{group.$root}` 参照をスキーマが拒否する
- [#439](https://github.com/design-tokens/community-group/issues/439): グループから `$type` を継承したトークンは `$value` が検証されない
- [#428](https://github.com/design-tokens/community-group/issues/428): `gradientStop` の `$ref` が解決できない
- [#441](https://github.com/design-tokens/community-group/issues/441) / [#451](https://github.com/design-tokens/community-group/pull/451): shadow の `inset` のデフォルト値の記述ミス

### 長期で塩漬け

- [#127](https://github.com/design-tokens/community-group/issues/127): `$value` 以外のプロパティを参照できるか
- [#213](https://github.com/design-tokens/community-group/issues/213): outline 型
- [#396](https://github.com/design-tokens/community-group/issues/396): `$description` などの多言語化（i18n）。日本語話者として意見を出しやすいテーマ
- [#376](https://github.com/design-tokens/community-group/issues/376): 最新版への恒久 URL

---

## 4. 主要な発言者とポジション

| 人物 | 役割 | 2026年の動き・スタンス |
| --- | --- | --- |
| Kaelig Deloumeau-Prigent (@kaelig) | Chair（続投） | 運営・広報。Discord 移行、ブログ、issue テンプレート |
| Drew Powers (@drwpow) | Editor / Terrazzo 作者 | 最も発言が多い。Resolver の推進役で「モードは Resolver で解ける、足りないのはツール」。モーションと配列型を次の議題に挙げている |
| Matt Ström-Awn (@ilikescience) | Editor | 意思決定フレームワーク（PR #366）の著者。参照構文の改訂者で JSON Pointer 推し。「有界で連続な f(t) ならイージングとして許容したい」 |
| Maximilian Blazek (@dgtlntv) | Contributor | JSON Schema とテストスイートの実質的な担い手 |
| Louis Chenais / Kathleen McMahon / Donna Vitan / Mike Kamminga | Editors | drafts の Editors 欄に掲載。Mike Kamminga は Tokens Studio 側で、Resolver の起案に関わった |
| Jina Anne / Val Head (@valhead) | Chairs emerita（2026-06〜） | Val はモーション分野の元起点（#158 で spring 事例を募集していた） |
| @bobz24、@inkxel、@kjooncho、@lifaon74、@nesquarx | 外部コントリビューター | Figma エクスポーター実装やモーション実務の知見から、データで議論を前に進めている。新しく入った人でも影響力を持てる例 |

---

## 5. 議事録（エディターズミーティング）

- リポジトリの `meeting-notes/` は2019年分で止まっている。Format Module の議事録は README からリンクされた Google Docs に移っている（未確認）。
- 6月のブログは「ミーティングの再開（一部は公開）」を予告していた。つまり **2026年前半は定例が止まっていた可能性が高い**。再開が告知された形跡は ML・ブログ上では見つからなかった。
- 議事録を遡るより先に、**Discord で現在の開催状況を確認する**のが早い。

---

## 6. 意思決定フレームワーク（PR #366、未マージ）

`governance/DECISION_MAKING.md` と `governance/ROLES.md` を追加する PR。2025-12-16 作成で、レビュー承認コメントはあるが **2026-11-21 時点でオープン**。正式な規程ではなく「運用案」として扱う。

- **Tier 1 Editorial**: 誤記など。エディター1人で即マージ
- **Tier 2 Standard**（3週間）: バグ修正、新しいトークン型、軽微な破壊的変更。エディター2名の承認。Discord と ML に告知
- **Tier 3 Major**（6週間）: 新モジュール、大きな破壊的変更、ガバナンス変更。`/proposals` に RFC（Problem / Solution / Impact / Alternatives）を置き、4週間のコメント期間 → エディターの2/3で投票 → 1週間の異議期間
- 異議は「技術的根拠と代替案」が必須。12/15〜1/5 はプロセス休止
- **ロール**
  - Active Contributor: W3C メンバーで、過去90日に PR か実質的なコメントがあり、会議に1回以上出席。Tier 3 の投票権を持つ
  - Editor: 週1時間程度、PR レビューは1週間以内。180日活動がないと emeritus
  - Module Lead: Color / Typography / Spacing / Animation / Core。ほぼ未割り当て
  - Chair: 運営専任で、技術判断はしない。任期1年
- 自分への示唆: **W3C メンバーで、会議に1回出て、実質的なコメントを1件すれば Active Contributor になれる**。Phase 3 の目標設定にそのまま使える。

---

## 7. エコシステムの実装状況

| ツール | 2026年の状況 |
| --- | --- |
| Style Dictionary | v5.4〜v5.8（2026-11-03）。v5.7.0 で 2025.10 の `duration` に対応、v5.6.0 で `$root` 参照の出力バグを修正。**Resolver は未対応**（2025.10 対応の追跡 issue #1590 はオープン、gradient も作業中）。prototype pollution 関連のセキュリティ修正が多い |
| Terrazzo | v2.10（2026-10）。@drwpow のツールで、Resolver に最も近い実装 |
| Figma | 2025年の Schema で DTCG 準拠の変数インポート / エクスポートを発表。composite（typography など）の書き出しは弱いという報告が多い。2026年は Figma Motion、色変数の opacity 合成が入り、DTCG にない部分は `$extensions.com.figma.*` で吸収している（issue 内の報告ベース。公式リリースノートで要確認） |
| Penpot | 2026年に仕様の用語集へ UI ツールとして追加 |
| Tokens Studio | DTCG 形式の出力が既定。2025.10 の Resolver 対応状況は一次情報を確認できていない |

---

## 8. Genie のトークン設計とのギャップを洗い出すための観点

2026年の議論から逆算した、Genie と突き合わせるべき箇所。

1. **3層アーキテクチャ（Base→Semantic→Component）**: エイリアスで表現できる。Semantic 層のテーマ切り替えは Resolver の `sets` / `modifiers` に寄せるのが仕様の想定（#348, #381）。Genie が「1ファイルにモード別の値を同居」させているなら、Resolver の bundling 形式に変換できるかを確認する。
2. **dataviz パレット**: 連続（sequential）パレットを「グループ＋連番トークン」で持つと、順序の意味は仕様上保証されない（配列型は #239 で未決）。カテゴリ順・段階数を `$extensions` で持つのか、配列型を待つのかが論点。**#239 に dataviz のユースケースを書き込むのは貢献の入口として良い。**
3. **Figma Variables 連携**: opacity 違いの色（#88）、italic（#102）、`em`（#390）、composite 型の欠落が典型的な詰まりどころ。Genie で遭遇した制約がこれらのどれに当たるかを分類すると、そのまま issue コメントになる。
4. **公式 JSON Schema で Genie のトークンを検証する**: #439 / #448 のようなスキーマ側のバグを踏む可能性がある。踏んだら報告すること自体が貢献になる。

---

## 9. Web標準動向（DTCG パート）寄稿用の素材

「2026年の DTCG」を1セクションで書く場合の骨子案。

- **見出し案**: 「仕様は安定、議論は“次の型”へ ― Design Tokens 2026」
- **トピック**
  1. 2025.10（Format / Color / Resolver）が初の安定版。2026年は仕様を凍結し、JSON Schema とテストスイートで「実装しやすさ」を整えた年
  2. 体制の変化: 共同チェアの交代、Discord への移行、ティア制の意思決定フレームワーク案
  3. 次の論点: spring アニメーション、色の加工（CSS Color 5 の `color-mix()` / 相対色構文との関係）、配列型、`em` 単位
  4. 実装の現状: Style Dictionary は Resolver が未対応、Figma は独自拡張で先行
- **フロントエンド読者向けのフック**: #88 は CSS Color 4/5 と直結している。CSS WG の Chris Lilley が議論に参加している点は、Web標準動向の読者にとって具体的な接点になる。
- 執筆時の注意: Figma の新機能の日付・名称は issue 内の報告に基づく。公式リリースノートで裏取りしてから書く。

---

## 10. 残タスク（未確認の一次情報）

Claude Code からは取りにくい情報が残っている。claude.ai（Web 検索やログイン済みブラウザ）で確認するためのプロンプトを付ける。

- GitHub Discussions（未認証 API では取得できない）
- Format Module の議事録（Google Docs）
- Discord でのミーティング再開・共同チェア選挙の告知
- Figma 公式リリースノート（Figma Motion、色の opacity 合成、DTCG エクスポート）
- Tokens Studio / Penpot / Sketch の 2025.10・Resolver 対応状況

### claude.ai 用プロンプト

```
W3C Design Tokens Community Group（DTCG）の2026年1月〜現在の動向を調査しています。
GitHub の issue / PR とコミット履歴は確認済みなので、それ以外の一次情報を集めてください。
出力は日本語、各項目に日付と出典URLを付け、「一次情報で確認できた」か「二次情報・推測」かを明記してください。

1. github.com/design-tokens/community-group の Discussions で、2026年に作成・更新されたスレッドの一覧と要旨
2. DTCG のミーティング（エディターズミーティング、Format Module 会議）が2026年に開催・再開されたか。共同チェア選挙の結果（2026年6月のブログ「Thank you, Jina and Val」で予告されたもの）
3. 意思決定フレームワーク（PR #366: governance/DECISION_MAKING.md, ROLES.md）がマージ・運用されているか
4. Figma の2026年のリリースノートのうち、Variables、DTCG インポート/エクスポート、Figma Motion（spring）、色変数の opacity 合成に関するもの
5. Tokens Studio、Penpot、Sketch、Supernova、zeroheight の DTCG 2025.10（特に Resolver Module）対応状況
6. 2026年に DTCG について書かれた主要な記事・登壇（英語・日本語）

最後に「日本のフロントエンドエンジニア向けの Web 標準動向記事で触れるべき DTCG の話題トップ5」を理由付きで挙げてください。
```
