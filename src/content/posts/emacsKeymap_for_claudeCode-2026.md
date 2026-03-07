---
title: Emacs Keymap for Claude Code
description: Claude CodeでEmacsキーマップを使用する方法
date: 2026-01-XX
tags: [emacs, claudecode, productivity]
category: Development
---

# Emacs Keymap for Claude Code

## はじめに

VScodeの拡張機能経由でclaude codeを使っていると不便なことがある。
普段使っているemacsのキーマップが使えず文字入力の効率がガタ落ちする点だ。特に`ctrl+F`（カーソルを右に移動）。

このブログはそれをなんとかするための作業ログ。

結論から言えば、これは実現できなかった。私が望む形では。

<!-- 記事の導入 -->

## いい感じの方法がないか探してみる。

perplexityで調べてみた。

> 結論から言うと、「Claude Code のチャット欄で ctrl+F を Emacs 流儀の“カーソル右移動”として使う」のは、今の VS Code ＋ Claude Code の仕組みだとほぼ不可能で、拡張側の修正を待つ形になります。 [github](https://github.com/anthropics/claude-code/issues/21137)

早くもダメそう。

#### なぜ ctrl+F が特につらいか（技術的な背景）

> - Claude Code の VS Code 版チャット入力欄は webview 上のテキスト入力で、そこでキーイベントを独自に処理しています。 [code.claude](https://code.claude.com/docs/en/vs-code)
> - macOS では ctrl+F が「1 文字右へ」の標準 Emacs 風キーバインドですが、VS Code 側は webview 内の keydown をフックして「検索系（find）」かどうかを判定し、一部で preventDefault しています。 [github](https://github.com/microsoft/vscode/issues/244924)
> - その結果、Claude Code 側の webview で ctrl+F / ctrl+P など Emacs 互換キーが効かないバグが公式に報告されており、現状ではワークアラウンドは提供されていません。 [github](https://github.com/anthropics/claude-code/issues/25326)

#### 「VS Code 全体で ctrl+F を潰す」案が微妙な理由

> - ターミナルや一部コンテキストでは、`keybindings.json` で ctrl+F のデフォルト Find 系ショートカットを外すことで、アプリ側にキーを渡すパターン自体はあります。 [stackoverflow](https://stackoverflow.com/questions/61331675/how-do-i-remap-the-default-ctrlf-find-in-visual-studio-code-such-that-i-can-u)
> - しかし Claude Code のチャット欄は webview 内部の処理＋VS Code の webview キーフィルタの挙動に依存しており、単に VS Code の keybinding を変更しても ctrl+F がテキスト入力の「カーソル右」に変わるわけではありません。 [github](https://github.com/microsoft/vscode/wiki/Keybinding-Issues)
> - つまり、VS Code 全体で ctrl+F を削っても、チャット欄だけ救える見込みは薄く、「エディタや他の場所で検索がしにくくなる」副作用だけが残りやすいです。 [github](https://github.com/VSCodeVim/Vim/issues/3501)

無理そう…。

claude codeに挙げられているemacsキーバインドが効かない旨に関するissueをよく見てみると↓2つのissueで逆の事を言っている。

[VS Code 拡張機能: macOS のターミナルモードでは Emacs の Ctrl+A と Ctrl+E キーバインディングが機能しない · 問題 #25326 · anthropics/claude-code](https://github.com/anthropics/claude-code/issues/25326)
↑これはできると言っている。`Ctrl+F→ 正常に動作します（前進します）`

[[バグ] macOS Emacs のキーバインド (Ctrl+P/F) が VSCode WebView 入力で動作しない · Issue #21137 · anthropics/claude-code](https://github.com/anthropics/claude-code/issues/21137)
↑これはできないって言っている。`Ctrl+F（文字を進める） カーソルを右に移動 ✗ 応答なし`

これらのissueは重複したissueとして一本化され積まれたよう。
細かい原因は私には考えつかないが、一旦はclaude codeが修正してくれるのを待つしかなさそう。

---

## terminalモードを便利に使う方法を試してみる

単純にemacsのキーマップを使って文字を入力したいのであれば、`Claude Code: Use Terminal`をオンにする方法もある。

画像さえ貼れればterminalモードでもいいのでは？と思い、試しに使ってみる。

読んだ記事
- [Claude Code（ターミナル）でスクリーンショット画像が貼れない場合… - FUJILOG](https://yoshifuji.hateblo.jp/entry/2026/02/28/202045)
- [WindowsのClaude Code（v1.0.57）でクリップボードから画像を貼り付けられない - 他にもこの問題に遭遇している人いますか？何か回避策はありますか？ : r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1m6p1aa/cant_paste_images_from_clipboard_into_claude_code/?tl=ja)

これらの記事はのMacの話をしていないが、`Ctrl+V`を試してみたらできた。やったぜ。

![itermで画像を貼り付けたあとのスクリーンショット。`[image 1]`と表示されている。](./emacsKeymap_for_claudeCode-2026/2026-03-08-00-11-14.png "itermで画像を貼り付けたあとのスクリーンショット")

でもこれをやるくらいだったら`Ctrl+F`を我慢してもいいかな、というくらいの体験だった。

本業はデザイナーなのでクリップボードから直接画像を貼り付ける体験は大切にしたい。

terminal側を色々カスタムする道もあるかもしれないが、それは気が向いたら考える。

---

## 想定質問：Karabiner-Elements入れたら解決しませんか…？

私は宗教上の理由でKaraviner-Elementsは受け付けない人間です。
純正のキーマップを使えないなら不便さも受け入れる。

## 想定質問：自作キーボードのキープロファイル設定で解決しませんか…？

同上。

## 今回の結論

しばらく無理。我慢します。

<!-- 結論 -->
