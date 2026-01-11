'use client';

import { useEffect } from 'react';

/**
 * 画像読み込み中のブラープレースホルダーを適用するコンポーネント
 * 画像が読み込まれるまでブラーエフェクトを表示し、読み込み完了後にフェードアウト
 */
export function ImageBlurLoader() {
    useEffect(() => {
        const images = document.querySelectorAll('.prose img') as NodeListOf<HTMLImageElement>;

        images.forEach((img) => {
            // 既にロード済みの場合はスキップ
            if (img.complete && img.naturalHeight !== 0) {
                img.classList.add('loaded');
                return;
            }

            // ブラークラスを追加
            img.classList.add('blur-loading');

            // 読み込み完了時にブラーを解除
            img.addEventListener('load', () => {
                img.classList.remove('blur-loading');
                img.classList.add('loaded');
            });

            // エラー時もブラーを解除
            img.addEventListener('error', () => {
                img.classList.remove('blur-loading');
            });
        });
    }, []);

    return null;
}
