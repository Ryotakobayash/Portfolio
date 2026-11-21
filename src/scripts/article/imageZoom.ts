/**
 * 記事本文の画像をクリック／Enter で拡大表示するダイアログ。
 * Reactを使わない素のスクリプト。client:only island を置くと dev の View Transitions が
 * 遷移先を隠し iframe でフルロードして遅くなるため island 化しない。
 */
export function enableImageZoom() {
  const images = document.querySelectorAll<HTMLImageElement>('.prose img');

  images.forEach((img) => {
    if (img.dataset.zoomEnabled) return;
    img.dataset.zoomEnabled = 'true';

    img.style.cursor = 'zoom-in';
    img.style.transition = 'transform 150ms ease';
    if (!img.getAttribute('tabindex')) img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-haspopup', 'dialog');

    const openZoom = () => {
      const overlay = document.createElement('div');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', img.alt || '画像の拡大表示');
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        cursor: zoom-out;
        padding: 20px;
      `;

      const closeBtn = document.createElement('button');
      closeBtn.setAttribute('aria-label', '閉じる');
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = `
        position: absolute; top: 16px; right: 16px;
        background: none; border: 1px solid rgba(255,255,255,0.3);
        color: #fff; font-size: 1.25rem; padding: 4px 10px;
        cursor: pointer; z-index: 1001; line-height: 1;
      `;

      const zoomedImg = document.createElement('img');
      zoomedImg.src = img.src;
      zoomedImg.alt = img.alt;
      zoomedImg.style.cssText = `
        max-width: 90vw;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        animation: zoomIn 200ms ease;
      `;

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
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      closeBtn.focus();

      const close = () => {
        overlay.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeyDown);
        img.focus();
      };
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
      closeBtn.addEventListener('click', close);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') close();
        if (e.key === 'Tab') {
          e.preventDefault();
          closeBtn.focus();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
    };

    img.addEventListener('click', openZoom);
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openZoom();
      }
    });
  });
}
