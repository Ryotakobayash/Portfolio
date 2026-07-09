import { useEffect, useState } from 'react';

export type Frameloop = 'always' | 'demand' | 'never';

/**
 * 装飾用 Canvas のフレームループ制御。
 * - タブ非表示中は描画を完全停止(never)
 * - prefers-reduced-motion では初回フレームのみ描画(demand = 静止画として表示)
 * - それ以外は通常描画(always)
 */
export function useDecorativeFrameloop(): Frameloop {
    const [frameloop, setFrameloop] = useState<Frameloop>('always');

    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => {
            if (document.hidden) {
                setFrameloop('never');
            } else if (reduced.matches) {
                setFrameloop('demand');
            } else {
                setFrameloop('always');
            }
        };
        update();
        document.addEventListener('visibilitychange', update);
        reduced.addEventListener('change', update);
        return () => {
            document.removeEventListener('visibilitychange', update);
            reduced.removeEventListener('change', update);
        };
    }, []);

    return frameloop;
}
