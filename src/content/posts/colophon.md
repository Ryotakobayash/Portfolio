---
title: Colophon — このサイトのデザインと技術スタック
date: '2026-05-13'
tags:
  - design
  - development
  - portfolio
draft: true
slug: colophon
---

このポートフォリオを構成するタイポグラフィ、カラーパレット、および技術スタックの詳細を記述します。
デザインシステムは、1960年代の宇宙開発競争時代の資料、ヴィンテージのテレメトリ表示、およびスイス・タイポグラフィから強い影響を受けています。

## Typography

### Outfit

メイン見出し & 英文テキスト

```
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789
```

### Noto Sans JP

日本語本文

```
あいうえお かきくけこ さしすせそ
アイウエオ カキクケコ サシスセソ
漢字 表現 typography
```

### System Mono

コード & テレメトリデータ

```
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789
```

## Color Palette

| Name | CSS Variable |
|------|-------------|
| Background | `--color-bg` |
| Surface | `--color-bg-secondary` |
| Text | `--color-text` |
| Text Muted | `--color-text-muted` |
| Primary | `--color-primary` |
| Accent 1 (Red) | `--color-accent` |
| Accent 2 (Yellow) | `--color-accent-2` |
| Accent 3 (Orange) | `--color-accent-3` |

## Technology Stack

- **Astro** — 静的サイト生成のためのコアフレームワーク。懐の深さが良い。
- **React** — Astro Islands内の一部UIコンポーネントで使用。チャートや3Dシーンなどのインタラクティブな要素の制御しています。
- **Vanilla CSS** — 標準的なCSSの機能でなんとかしています。
- **Highcharts** — チャート用データ可視化ライブラリ。
- **Three.js / React Three Fiber** — ASCIIアートの背景エフェクト用。
- **Vercel** — デプロイ先。
