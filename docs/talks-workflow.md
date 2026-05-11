# 登壇履歴（Talks）の追加フロー

`/talks` ページに今後の登壇予定や過去の登壇実績を追加する手順のドキュメントです。
データはすべて `src/data/talks.json` で管理されており、この JSON ファイルを編集するだけで自動的にページに反映されます。

## データ構造

`src/data/talks.json` は以下の2つの配列を持っています。

- `upcoming`: 今後の登壇予定（タイムライン形式で表示されます）
- `past`: 過去の登壇履歴（カード形式とスライドの埋め込みで表示されます）

## 1. 今後の登壇予定（upcoming）の追加

登壇が決まったら、`upcoming` 配列の先頭（または適切な日付順）にオブジェクトを追加します。

```json
{
  "id": "upcoming-2",
  "date": "2026-12-01",
  "event": "Event Name 2026",
  "title": "発表するセッションのタイトル",
  "status": "スライド作成中"
}
```

**プロパティ:**
- `id` (String): 一意のID（例: `upcoming-2`）
- `date` (String): 登壇日（`YYYY-MM-DD` 形式推奨）
- `event` (String): イベント名やカンファレンス名
- `title` (String): セッションのタイトル
- `status` (String): 現在のステータス（「準備中」「資料公開予定」など）

## 2. 過去の登壇履歴（past）の追加

登壇が終了し、スライドを公開したら `past` 配列にデータを移行・追加します。

```json
{
  "id": "past-2",
  "date": "2026-12-01",
  "event": "Event Name 2026",
  "title": "発表したセッションのタイトル",
  "embedUrl": "https://speakerdeck.com/player/YOUR_DECK_ID",
  "link": "https://speakerdeck.com/your-account/slide-name",
  "type": "Speaker Deck"
}
```

**プロパティ:**
- `id` (String): 一意のID（例: `past-2`）
- `date` (String): 登壇日
- `event` (String): イベント名
- `title` (String): セッションのタイトル
- `embedUrl` (String): スライド埋め込み用のURL（※後述）
- `link` (String): スライドの公開URL（任意）
- `type` (String): プラットフォーム名（例: "Speaker Deck"）

---

## 💡 Speaker Deck の埋め込みURL (`embedUrl`) の取得方法

Speaker Deck でアップロードしたスライドを `/talks` ページに埋め込むための手順です。

1. Speaker Deck で対象のスライドページを開く。
2. スライド右下の **[Share]** アイコンをクリックする。
3. **[Embed]** タブを開き、表示される `<iframe>` コードをコピーするか確認する。
4. コード内にある `src="https://speakerdeck.com/player/xxxxxxxxxxxxxxxx"` のURL部分を抽出する。
5. 抽出したURLを `talks.json` の `embedUrl` に貼り付ける。

※ サイトのCSSにより、埋め込み枠は自動的に **16:9** のアスペクト比でレスポンシブ表示されるよう設定されています。
