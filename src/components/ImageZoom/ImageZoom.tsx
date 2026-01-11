'use client';

import { useEffect } from 'react';
import mediumZoom from 'medium-zoom';

/**
 * 記事内の画像にズーム機能を追加するコンポーネント
 * マウント時に.prose内のすべての画像にmedium-zoomを適用
 */
export function ImageZoom() {
    useEffect(() => {
        // .prose内の画像を取得
        const images = document.querySelectorAll('.prose img');

        if (images.length > 0) {
            const zoom = mediumZoom(images as unknown as HTMLElement[], {
                margin: 24,
                background: 'rgba(0, 0, 0, 0.9)',
                scrollOffset: 0,
            });

            // クリーンアップ
            return () => {
                zoom.detach();
            };
        }
    }, []);

    return null;
}
