---
title: "NUTMEGブログ大改造ビフォーアフター"
date: "2024-05-26"
excerpt: "Hugoで作成しているNUTMEGブログの改修を行いました。著者名表示、著者一覧ページ作成などconfig.tomlやlayouts/index.htmlの編集方法を紹介。"
tags:
  - Hugo
  - HTML/CSS
  - NUTMEG
---
NUTMEGデザイナーチーム 修士2年のryota5884です。この度ふと思い立って後回しにしていたブログの改修をしてみました。

改修作業後にこのブログを書こうと思い立ったため、Beforeの画像はありません！

## やったこと

- ブログの記事ごとに別々の著者名を表示
- 著者一覧（authors）ページの作成
- メンバーページのアップデートと管理方法の変更
- Productページのアップデート
- Memberページのアップデート

## ブログの記事ごとに別々の著者名を表示する

従来のブログでは実際の著者が誰であろうと「By NUTMEG」と表示していました。今回はconfig.tomlにメンバーの人数分`[params.authors.member-name]`を作成し、layouts/index.htmlに少し手を加えることで実現しました。

```toml
[params.authors]
  [params.authors.ryota5884]
    name = "ryota5884"
    bio = "Designer"
```

### 条件分岐の概要

1. ブログ記事に`authors`が設定されている場合 → 著者名を表示
2. 設定されているが存在しない場合 → 直接キー名を表示
3. 設定されていない場合 → デフォルト著者名を表示

## 著者一覧ページの作成

config.tomlの`[taxonomies]`に`author = "authors"`を追加して、ブログ記事のmarkdownファイルに`authors: 著者名`を記述するだけでページを作ることができます。

## メンバーページの管理方法変更

メンバープロフィールはNUTMEGのNotionページで管理しています。新入生も簡単にアクセスでき、学年などで管理しやすいことがメリットです。

NotionのデータベースをChatGPTでHugoで使える形に変換することで、NotionからMemberページに反映させています。ChatGPT-4oの登場により無料で高性能なLLMを誰でも利用できるようになったため採用しました。

## 最後に

まだまだ改善点は多いですが、疲れたのでこの辺でひと段落つけました。この記事がHugoを使って団体のブログを作ろうとしている人や、NUTMEGブログを引き継ぐ後輩の役に立つと幸いです。
