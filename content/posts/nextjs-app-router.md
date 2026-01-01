---
title: "Next.js App Routerの基本"
date: "2024-12-30"
excerpt: "Next.js 15のApp Routerについて解説します。"
tags:
  - Next.js
  - React
  - TypeScript
---

# Next.js App Routerの基本

Next.js 13で導入されたApp Routerは、Reactのサーバーコンポーネントをフル活用したルーティングシステムです。

## 主な特徴

### 1. Server Components

デフォルトですべてのコンポーネントがサーバーコンポーネントとして動作します。

```typescript
// サーバーコンポーネント（デフォルト）
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}
```

### 2. ファイルベースルーティング

`app/` ディレクトリ内のフォルダ構造がそのままURLになります。

- `app/page.tsx` → `/`
- `app/posts/page.tsx` → `/posts`
- `app/posts/[slug]/page.tsx` → `/posts/:slug`

### 3. レイアウト

`layout.tsx` ファイルで共通レイアウトを定義できます。

## まとめ

App Routerを使うことで、より効率的なWebアプリケーション開発が可能になります。
