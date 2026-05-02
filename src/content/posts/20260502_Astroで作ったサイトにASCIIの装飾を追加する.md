---
title: "Astroで作ったサイトにThree.jsでASCIIアートの3D装飾を追加する"
date: "2026-05-02"
excerpt: "Astroベースのポートフォリオサイトに、Three.jsを使ったASCIIアートの3D装飾を導入しました。はじめに結論となる実装手順、後半で技術選定の理由やその他の選択肢についてまとめます。"
tags:
  - Astro
  - React
  - Three.js
---

## はじめに

最近、ポートフォリオサイトのトップページにちょっとした遊び心が欲しくなり、背景で3DモデルがASCIIアートとして回転する装飾を入れてみました。

Astroで作られたサイトに3Dモデルを使ったASCII装飾を追加する記事があまりなかったので投稿します。

## 結論：React Three Fiber + Drei を使うのが一番簡単

一通り調べた結果Astroベースのサイトで手軽にASCII装飾を入れるなら「React Three Fiber (R3F) と `@react-three/drei` をAstro Islandsで動かす」のが良さそうでした。比較した候補は記事の最後に記載します。

`@react-three/drei` が提供する `AsciiRenderer` というコンポーネントが優秀で、宣言的にポンと置くだけで画面全体をASCIIアート化してくれます。Vanilla JSで同等のことをやろうとすると手続き的なコードが長くなりそうですが、R3Fなら少ないコード量で済みます。

### 実装手順

#### 1. パッケージのインストール
まずはThree.jsとReact用のラッパーパッケージを一式インストールします。

```bash
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three
```

#### 2. Reactコンポーネントの作成
`AsciiBackground.tsx` という名前でコンポーネントを作ります。ここでは例として、`public/models/saturn.obj` という3Dモデルを読み込んでみます。特に用意しなくてもデフォルトの3Dモデルなら描画できます。私はAdobe Stockで見つけた無料モデルを利用しました。

```tsx
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { AsciiRenderer } from '@react-three/drei';
import * as THREE from 'three';
// ※ three/addons/... は Three.js r160以降のパスです
// 古いバージョンでは three/examples/jsm/loaders/OBJLoader を使ってください
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// カスタムモデルを読み込むコンポーネント
function CustomModel() {
  const obj = useLoader(OBJLoader, '/models/saturn.obj');
  const groupRef = useRef<THREE.Group>(null);
  
  // 毎フレーム少しずつ回転させる
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
      groupRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={0.1} position={[0, 0, 0]}>
      <primitive object={obj} />
    </group>
  );
}

// メインの背景コンポーネント
export default function AsciiBackground() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: -1, overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        {/* ASCIIの陰影を出すためのライト */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* モデルの読み込み中はfallbackを表示（今回はnull） */}
        <Suspense fallback={null}>
          <CustomModel />
        </Suspense>
        
        {/* これを入れるだけで画面全体がASCIIアート化される！ */}
        <AsciiRenderer 
          fgColor="currentColor" // サイトの文字色に合わせる
          bgColor="transparent"
          characters=" .:-+*=%@#" 
          invert={false}
        />
      </Canvas>
    </div>
  );
}
```

ポイントは `AsciiRenderer` の `fgColor` に `currentColor` を指定している点です。`currentColor` は親要素の `color` プロパティの値を継承するCSSキーワードなので、サイト側でテーマに応じた文字色を設定していれば、ASCIIアートの色も自動で追従してくれます。

#### 3. Astroページでの呼び出し
最後に、`index.astro` などのAstroファイルで呼び出します。Three.jsは `window` やWebGLコンテキストなど、ブラウザにしか存在しないAPIに依存するため、SSR時にエラーになります。`client:only="react"` を指定してサーバーサイドでの実行をスキップさせる必要があります。

```astro
---
import AsciiBackground from '../components/AsciiBackground.tsx';
---

<BaseLayout>
  <!-- 背景として配置 -->
  <AsciiBackground client:only="react" />
  
  <!-- 以下メインコンテンツ -->
</BaseLayout>
```

これで実装は完了です。

## 手軽さとトレードオフなポイント

手軽なR3Fアプローチですが、以下のようなトレードオフがありそうです。

1. **バンドルサイズの増加**
   Three.js本体（gzip後で約150〜170KB）に加え、`@react-three/fiber`（約50KB）や `@react-three/drei` がバンドルに含まれるため、JSのファイルサイズが大きくなります。軽量さが売りのAstroの良さを少し損なうスマートじゃない側面がありそうです。
   
2. **モデル読み込みのラグ**
   `.obj` や `.glb` ファイルのロードに少し時間がかかります。今回使用した `saturn.obj` は約800KBです。ハイポリゴンすぎるモデルを避ける（Blender等で事前にデシメートして軽くする）などの工夫が必要です。画像と一緒ですね。

---

## おまけ：見送ったその他の選択肢

最初からR3Fを使う方法に辿り着いたわけではなく、Geminiと壁打ちしながら手法を絞り込んでいきました。参考になるかわかりませんが不採用になった選択肢も載せておきます。

### 1. テキストや画像のASCII化
「AstroでASCIIレンダリングしたい」と最初に聞いたとき、Geminiからは以下の提案がありました。
- **ビルド時変換**: `figlet`（テキスト用）や `image-to-ascii`（静的画像用）を使う方法。Astroの静的生成と相性が良い。
- **クライアント側動的変換**: `aalib.js` を使って画像をリアルタイム変換する方法。

3Dモデルが動いている方が実現したいイメージに近かったので見送りました。

### 2. Vanilla JS + `AsciiEffect`
「3Dモデルを使いたい」と要件を絞り込んだ際に提案された、もう一つの有力な選択肢です。

Astroの `<script>` タグ内に生のThree.jsを書き、`three-stdlib` に含まれる `AsciiEffect` を使う方法。Reactを間に挟まないためバンドルサイズやパフォーマンス面では有利ですが、コードが命令的で長くなり、リサイズ対応なども自前で書く必要があったため、今回は手軽に書けるR3Fに軍配が上がりました。

### 3. 振り返るとR3Fじゃなくて Vanilla JS の方がよかった？

この記事を書くために振り返ってみて、「Reactを挟まないVanilla JS + `AsciiEffect` の方がAstroの思想に忠実というか…スマートでよかったのでは？」と思いました。こう納得した、というメモも残します。

**1. すでにReactを使っているなら、ランタイムのコストは払い済み**

私のサイトではTreemapやPopular Posts等、複数のReactコンポーネントをAstro Islandsとして動かしています。つまりReactのランタイムはすでにクライアントに送られていて、R3Fを追加しても増えるのは `@react-three/fiber` と `@react-three/drei` の分だけです。

もしReactを一切使っていないサイトで、ASCII背景のためだけにReactを入れるのだとしたら、Vanilla JSの方が合理的だと思います。

**2. 本当に重いのはThree.js本体**

R3F vs Vanilla JSの差よりも、Three.js本体（gzip後でも約150〜170KB）がバンドルに入ること自体の方がインパクトとして大きいです。ここはどちらの手法を選んでも変わりません。

Astroの軽量さを本気で守るなら、クライアントサイドでの3Dレンダリング自体を避けて、ビルド時にヘッドレスでレンダリングした静的ASCIIアートをCSSアニメーションで切り替える…みたいなアプローチとかが思い浮かびますが、背景の装飾にそこまでやる気はしません。

## おわりに

この記事が誰かの参考になれば幸いです。
