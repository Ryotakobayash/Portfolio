import React, { Suspense, lazy, useEffect, useState } from 'react';

// three + R3F + drei を含む重量級チャンクはアイドル時まで取得しない
const SlideAsciiCanvas = lazy(() => import('./slides/SlideAsciiCanvas'));

/**
 * トップページ背景の ASCII 土星。
 * 実体は SlideAsciiCanvas(dpr 上限・タブ非表示/reduced-motion での描画停止込み)で、
 * このコンポーネントは LCP と競合しないようアイドル時にマウントする薄いラッパー。
 */
export default function AsciiBackground() {
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
    <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: -1, overflow: 'hidden' }}>
      <Suspense fallback={null}>
        <SlideAsciiCanvas />
      </Suspense>
    </div>
  );
}
