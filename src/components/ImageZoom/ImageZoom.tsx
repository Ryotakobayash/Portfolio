'use client';

import { useEffect } from 'react';
import mediumZoom from 'medium-zoom';

/**
 * 記事内の画像にズーム機能を追加するコンポーネント
 * マウント時に#article-content内のすべての画像にmedium-zoomを適用
 */
export function ImageZoom() {
    useEffect(() => {
        // 画像要素を取得するためのセレクタ（IDベースに変更）
        const selector = '#article-content img';

        // オプション設定
        const options = {
            margin: 24,
            background: 'rgba(0, 0, 0, 0.9)',
            scrollOffset: 0,
            zIndex: 9999, // 最前面に表示
        };

        // 初期化関数
        const initZoom = () => {
            const images = document.querySelectorAll(selector);
            if (images.length > 0) {
                mediumZoom(images as unknown as HTMLElement[], options);
            }
        };

        // 即時実行
        initZoom();

        // 少し遅延させて再実行（他のスクリプトによるDOM変更を考慮）
        const timeoutId = setTimeout(initZoom, 500);

        // MutationObserverでDOM変更を監視
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    shouldUpdate = true;
                }
            });
            if (shouldUpdate) {
                initZoom();
            }
        });

        const contentElement = document.getElementById('article-content');
        if (contentElement) {
            observer.observe(contentElement, { childList: true, subtree: true });
        }

        // クリーンアップ
        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
            const zoom = mediumZoom(document.querySelectorAll(selector) as unknown as HTMLElement[]);
            zoom.detach();
        };
    }, []);

    return null;
}
