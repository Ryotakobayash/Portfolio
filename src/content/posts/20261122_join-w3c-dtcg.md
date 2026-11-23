---
title: W3CのDesign Tokens Community Groupに参加しました
date: "2026-11-22"
excerpt: W3CのDesign Tokens Community Group（DTCG）に参加しました。まずはDTCGの動きを追うための情報収集の環境を整えたので、その手順をまとめます。
tags:
  - W3C
  - DesignToken
slug: 20261122_join-w3c-dtcg
draft: false
thumbnail: /thumbnails/20261122_w3c_japan_30th_stamp.webp
---

## はじめに。何があったんです？

サイボウズはW3Cのメンバーに加入しています。会社としてどのようなことを考えて参加したのかは、以下の記事に詳しく書かれています。

- [サイボウズ、W3C (World Wide Web Consortium) のメンバーに加入 | サイボウズ株式会社](https://topics.cybozu.co.jp/news/2025/07/25-19153.html)
- [なぜサイボウズは W3C のメンバーに加入したのか？その真意を聞いてみた - Cybozu Inside Out | サイボウズエンジニアのブログ](https://blog.cybozu.io/entry/joining-w3c)

私自身は少し興味があったくらいだったんですが、社内の同期（@mehm8128）が頑張っているところを見て、自分も何かしら貢献できることがあるんじゃないかと思うようになりました。
自分が力になれるかわかりませんが、自分が入ることでハードルが下がり自分より優秀な人が挑戦しやすくなることもあるかもしれません。
そんな思いでW3CのDesign Tokens Community Group（DTCG）に入ってみました。

とはいえそんないきなりの参加だったので、どこをどう見るといいかなんてわかりません。
色々手探りながら探索した結果を作業ログ的に残していきます。

参加してからこれまで外部発信をしてこなかったので頑張ります。
日本人のデザイナーで参加している人はあまり見かけないので、貢献したいですね。

※ここで正直に言いますが、この記事は2026/03/13に書いたものをちょっと編集して投稿したものです。情報が遅かったら申し訳ない。

## やること

まずは受動的な人間でもインプットできる基盤を作りました。
別に会員じゃなくてもやれるので、皆さんも真似してみましょう。

ここで出てくるGitHubやメーリングリスト、RSSなどの公式リンクは、基本的に以下の入口ページから辿れます。

- [W3C Design Tokens Community Group（ブログ・公式ホーム）](https://www.w3.org/community/design-tokens/)
- [W3C グループ情報ページ（ML・RSSのリンクあり）](https://www.w3.org/groups/cg/design-tokens)
- [DTCG 公式サイト（designtokens.org）](https://www.designtokens.org/)

### `design-tokens/community-group` リポジトリをCustom Watchに設定

議論が行われる場所、議事録などのやりとりはGitHubで行われるのでその場所をフォローするだけです。メールで議論を追えるようになるので便利。 割とDTCGは動きがゆったりめなので、今の所埋もれたことはありません。

1. [design-tokens/community-group](https://github.com/design-tokens/community-group) を開く（GitHubアカウントでログインしておく）
2. 右上の **Watch** をクリックして **Custom** を選ぶ
3. **Issues**、**Pull requests**、**Discussions** の3つにチェックを入れて **Apply** を押す

関連リンク

- **対象リポジトリ：** [design-tokens/community-group](https://github.com/design-tokens/community-group)（W3Cの公式ホームやDTCG公式サイトからリンクされています）
- **設定手順の元情報：** [GitHub Docs - Configuring notifications](https://docs.github.com/en/subscriptions-and-notifications/get-started/configuring-notifications)

### メーリングリスト（lists.w3.org）を購読

`public-design-tokens` メーリングリスト（lists.w3.org）に入れてもらいましょう。

DTCGのホームページがあるので、そこにアクセス。メーリングリスト登録をするだけ。
あんまり見慣れないやり方だったのでびびった。とくに難しいことも、先方から不審がられることもない。

登録をシステム的に処理されるのか生身の人が処理するのかわからなくて、やや緊張しました。多分システマチックに処理された気がします。

ざっくりいうと指定されるメールアドレスにメールを送るだけで登録できます。

1. 普段使っているメールアプリで `public-design-tokens-request@w3.org` 宛てにメールを作る（投稿用の `public-design-tokens@w3.org` ではないので注意）
2. 件名に `subscribe` とだけ書いて送る（本文は空でOK）
3. W3Cから確認メールが届くので、指示どおりにそのまま返信すると登録完了

やめたいときは同じ宛先に件名 `unsubscribe` で送れば解除できるはず。

登録前にどんなメールが流れているか見たい場合は、[MLアーカイブ](https://lists.w3.org/Archives/Public/public-design-tokens/) から過去のやり取りをそのまま見られます。

関連リンク

- **MLの入口・アーカイブ：** [W3C グループ情報ページ](https://www.w3.org/groups/cg/design-tokens) → [public-design-tokens アーカイブ](https://lists.w3.org/Archives/Public/public-design-tokens/)（アーカイブページの上部に `subscribe to this list` のリンクがあります）
- **購読手順の元情報：** [W3C Mailing List Administrivia（w3.org/Mail/Request）](https://www.w3.org/Mail/Request)（W3Cのメーリングリスト共通の登録ルールが書いてあります）

### W3C CG ブログのRSSフィードをリーダーに追加

これも気楽。 最近馴染みない人もいると思うのでRSSが何かわかる記事のリンクを置いておく。

[RSSとは（意味・解説） - 意味がわかる辞典](https://wa3.i-3-i.info/word11641.html)

友達から勧めてもらって自分も愛用しているサービスも置いておく。
[Inoreader](https://www.inoreader.com/)

追加するフィードのURLはこれ（[W3C グループ情報ページ](https://www.w3.org/groups/cg/design-tokens) の「Related RSS feed」からも辿れます）。

`https://www.w3.org/community/design-tokens/feed/`

Inoreaderなら、ログインして左上の「フィードを追加（＋）」か検索バーにこのURLを貼って、出てきた「Design Tokens Community Group」をフォローするだけ。

### 最新プレビュードラフトが読めるページをブックマーク

[最新プレビュードラフト（designtokens.org/tr/drafts/）](https://www.designtokens.org/tr/drafts/)

[DTCG公式サイト（designtokens.org）](https://www.designtokens.org/) やGitHubリポジトリから辿れる仕様書の最新ドラフト。ブックマークするだけ。ここが更新されるまえに、これまでに紹介してきたところが色々賑やかになるはずなので、そっちをチェックできているなら不要。

### エコシステムツールのリリース情報源を整理

このへんはたまに見る。大体SNS経由で知ることが多い。

- [Style Dictionary GitHub](https://github.com/style-dictionary/style-dictionary)
- [Tokens Studio changelog](https://feedback.tokens.studio/changelog) / [GitHub](https://github.com/tokens-studio/figma-plugin)
- [Penpot のリリース](https://github.com/penpot/penpot/releases)
- [Figma のリリースノート](https://www.figma.com/release-notes/)

一旦こんなところで終了。
