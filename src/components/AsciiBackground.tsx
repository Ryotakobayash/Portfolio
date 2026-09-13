import React, { Suspense, lazy, useEffect, useState } from 'react';

// three + R3F + drei を含む重量級チャンクはアイドル時まで取得しない
const SlideAsciiCanvas = lazy(() => import('./slides/SlideAsciiCanvas'));

export interface AsciiBackgroundProps {
  characters?: string;
  modelUrl?: string;
  scale?: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 背景の ASCII 3D モデル（土星など）。
 * 実体は SlideAsciiCanvas(dpr 上限・タブ非表示/reduced-motion での描画停止込み)で、
 * このコンポーネントは LCP と競合しないようアイドル時にマウントする薄いラッパー。
 */
export default function AsciiBackground({
  characters,
  modelUrl,
  scale,
  speed,
  className,
  style,
}: AsciiBackgroundProps = {}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setMounted(true), { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(id);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style,
      }}
    >
      <Suspense fallback={null}>
        <SlideAsciiCanvas
          characters={characters}
          modelUrl={modelUrl}
          scale={scale}
          speed={speed}
        />
      </Suspense>
    </div>
  );
}
