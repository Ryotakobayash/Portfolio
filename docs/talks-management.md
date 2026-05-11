# /talks ページの登壇情報管理手順

`/talks` ページに表示される登壇予定および登壇履歴を管理する方法を説明します。

## データソースの場所
登壇データは以下の JSON ファイルで管理されています。
- `src/data/talks.json`

## JSON の構造

```json
{
  "upcoming": [
    {
      "id": "一意のID",
      "date": "YYYY-MM-DD",
      "event": "イベント名",
      "title": "セッションタイトル",
      "status": "ステータス（例：準備中、予定）"
    }
  ],
  "past": [
    {
      "id": "一意のID",
      "date": "YYYY-MM-DD",
      "event": "イベント名",
      "title": "セッションタイトル",
      "embedUrl": "Speaker Deck の埋め込み用URL",
      "link": "スライドへのリンク（Speaker Deck等）",
      "type": "サービス名（例：Speaker Deck）"
    }
  ]
}
```

## 各項目の詳細

### `upcoming` (今後の予定)
- `date`: 開催日。
- `event`: カンファレンス名やミートアップ名。
- `status`: 進捗状況などを記載します。

### `past` (過去の履歴)
- `embedUrl`: Speaker Deck の場合、`https://speakerdeck.com/player/[デッキID]` の形式になります。
  - Speaker Deck の各スライドページの「Embed」ボタンから `src` 属性のURLを取得してください。
- `link`: スライドのメインページ（共有用URL）です。
- `type`: リンクのラベルとして表示されます。

## 表示の仕組み
- `src/pages/talks.astro` がこの JSON を読み込み、`upcoming` はタイムライン形式、`past` はカード形式で自動的にレンダリングします。
- `past` の `embedUrl` が存在する場合、16:9 のアスペクト比を維持した iframe でスライドが埋め込まれます。
