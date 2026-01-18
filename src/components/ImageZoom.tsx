import { useEffect } from 'react';

/**
 * 画像クリックで拡大表示するコンポーネント
 * 記事ページでマウント時に全imgタグにズーム機能を追加
 */
export function ImageZoom() {
    useEffect(() => {
        const images = document.querySelectorAll('.prose img');

        images.forEach((img) => {
            const htmlImg = img as HTMLImageElement;

            // 既にズーム設定済みならスキップ
            if (htmlImg.dataset.zoomEnabled) return;
            htmlImg.dataset.zoomEnabled = 'true';

            htmlImg.style.cursor = 'zoom-in';
            htmlImg.style.transition = 'transform 150ms ease';

            htmlImg.addEventListener('click', () => {
                // オーバーレイ作成
                const overlay = document.createElement('div');
                overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          cursor: zoom-out;
          padding: 20px;
        `;

                // 拡大画像
                const zoomedImg = document.createElement('img');
                zoomedImg.src = htmlImg.src;
                zoomedImg.alt = htmlImg.alt;
                zoomedImg.style.cssText = `
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
          animation: zoomIn 200ms ease;
        `;

                // アニメーション用CSS追加
                if (!document.getElementById('zoom-styles')) {
                    const style = document.createElement('style');
                    style.id = 'zoom-styles';
                    style.textContent = `
            @keyframes zoomIn {
              from { transform: scale(0.9); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `;
                    document.head.appendChild(style);
                }

                overlay.appendChild(zoomedImg);
                document.body.appendChild(overlay);

                // スクロール無効化
                document.body.style.overflow = 'hidden';

                // クリックで閉じる
                overlay.addEventListener('click', () => {
                    document.body.removeChild(overlay);
                    document.body.style.overflow = '';
                });

                // ESCで閉じる
                const handleKeyDown = (e: KeyboardEvent) => {
                    if (e.key === 'Escape') {
                        document.body.removeChild(overlay);
                        document.body.style.overflow = '';
                        document.removeEventListener('keydown', handleKeyDown);
                    }
                };
                document.addEventListener('keydown', handleKeyDown);
            });
        });
    }, []);

    return null;
}

export default ImageZoom;
