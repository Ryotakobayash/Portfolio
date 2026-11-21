/**
 * 脚注の UI/UX を向上させる
 * - 本文中の [^1] 参照をクリック/ホバーでその場にポップオーバーカードを展開
 * - 右サイドバー（目次・TOC）との衝突を 100% 解消
 * - 冪等性を担保し多重初期化を防止
 * - 記事末尾の脚注一覧へのスムーズジャンプとハイライト
 */
export function setupFootnotes() {
  const footnoteSection = document.querySelector('.footnotes');
  if (!footnoteSection) return;

  const refs = document.querySelectorAll<HTMLAnchorElement>('sup a[data-footnote-ref]');
  if (refs.length === 0) return;

  refs.forEach((ref) => {
    const sup = ref.closest('sup');
    if (!sup) return;

    // 二重初期化防止ガード
    if (sup.dataset.footnoteInitialized === 'true') return;
    sup.dataset.footnoteInitialized = 'true';

    const href = ref.getAttribute('href');
    if (!href) return;
    // href は "#user-content-fn-1" など
    const id = href.replace(/^#/, '');
    const footnoteItem = footnoteSection.querySelector(`#${CSS.escape(id)}`);
    if (!footnoteItem) return;

    // 既存の旧 sidenote 要素があれば削除
    sup.parentElement?.querySelectorAll('.sidenote').forEach((el) => el.remove());

    // 注釈番号
    const noteNumber = ref.textContent?.trim() || '';

    // 注釈本文（バックリンク ↩ を除外）
    const clone = footnoteItem.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('a[data-footnote-backref]').forEach((el) => el.remove());
    const noteHtml = clone.innerHTML.trim();

    // ポップオーバー要素を生成
    const popover = document.createElement('div');
    popover.className = 'footnote-popover';
    popover.setAttribute('role', 'tooltip');
    popover.id = `footnote-popover-${id}`;
    popover.innerHTML = `
      <div class="footnote-popover-header">
        <span class="footnote-popover-badge">NOTE [${noteNumber}]</span>
        <div class="footnote-popover-actions">
          <a href="${href}" class="footnote-popover-jump" title="記事末尾の脚注へジャンプ" aria-label="記事末尾の脚注へジャンプ">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 13l5 5 5-5M12 4v14"/></svg>
          </a>
          <button type="button" class="footnote-popover-close" title="閉じる" aria-label="閉じる">
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
      <div class="footnote-popover-body">${noteHtml}</div>
    `;

    sup.style.position = 'relative';
    sup.appendChild(popover);

    // アクセシビリティ属性
    ref.setAttribute('aria-expanded', 'false');
    ref.setAttribute('aria-controls', popover.id);

    let closeTimeout: number | undefined;

    const adjustPosition = () => {
      popover.classList.remove('align-right', 'align-left');
      const rect = popover.getBoundingClientRect();
      const padding = 16;
      if (rect.right > window.innerWidth - padding) {
        popover.classList.add('align-right');
      } else if (rect.left < padding) {
        popover.classList.add('align-left');
      }
    };

    const openPopover = (isPinned = false) => {
      if (closeTimeout) {
        window.clearTimeout(closeTimeout);
        closeTimeout = undefined;
      }

      // 他のポップオーバーを閉じる
      if (isPinned) {
        document.querySelectorAll('.footnote-popover.is-open').forEach((p) => {
          if (p !== popover) {
            p.classList.remove('is-open', 'is-pinned');
            const otherRef = p.parentElement?.querySelector('a[data-footnote-ref]');
            otherRef?.setAttribute('aria-expanded', 'false');
          }
        });
      }

      popover.classList.add('is-open');
      if (isPinned) {
        popover.classList.add('is-pinned');
      }
      ref.setAttribute('aria-expanded', 'true');
      adjustPosition();
    };

    const closePopover = (force = false) => {
      if (!force && popover.classList.contains('is-pinned')) {
        return;
      }
      popover.classList.remove('is-open', 'is-pinned');
      ref.setAttribute('aria-expanded', 'false');
    };

    // ホバー時の動作（マウスが乗っている間は表示、離れたらディレイで非表示）
    ref.addEventListener('mouseenter', () => openPopover(false));
    ref.addEventListener('mouseleave', () => {
      closeTimeout = window.setTimeout(() => closePopover(false), 200);
    });

    popover.addEventListener('mouseenter', () => {
      if (closeTimeout) {
        window.clearTimeout(closeTimeout);
        closeTimeout = undefined;
      }
    });
    popover.addEventListener('mouseleave', () => {
      closeTimeout = window.setTimeout(() => closePopover(false), 200);
    });

    // クリック時の動作（ピン留めトグル）
    ref.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (popover.classList.contains('is-open') && popover.classList.contains('is-pinned')) {
        closePopover(true);
      } else {
        openPopover(true);
      }
    });

    // 閉じるボタン
    const closeBtn = popover.querySelector('.footnote-popover-close');
    closeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closePopover(true);
    });

    // 末尾へのジャンプリンク
    const jumpLink = popover.querySelector('.footnote-popover-jump');
    jumpLink?.addEventListener('click', () => {
      closePopover(true);
    });
  });

  // 記事末尾の脚注から本文へ戻る（↩）リンク押下時に、残っているポップオーバーを全て閉じる
  footnoteSection.querySelectorAll('a[data-footnote-backref]').forEach((backref) => {
    backref.addEventListener('click', () => {
      document.querySelectorAll('.footnote-popover.is-open').forEach((popover) => {
        popover.classList.remove('is-open', 'is-pinned');
        const ref = popover.parentElement?.querySelector('a[data-footnote-ref]');
        ref?.setAttribute('aria-expanded', 'false');
      });
    });
  });

  // グローバル閉じるハンドラー（外側クリック & Escキー）
  if (!(window as any).__footnoteGlobalDismissBound) {
    (window as any).__footnoteGlobalDismissBound = true;

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest('sup') && !target?.closest('.footnote-popover')) {
        document.querySelectorAll('.footnote-popover.is-open').forEach((popover) => {
          popover.classList.remove('is-open', 'is-pinned');
          const ref = popover.parentElement?.querySelector('a[data-footnote-ref]');
          ref?.setAttribute('aria-expanded', 'false');
        });
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.footnote-popover.is-open').forEach((popover) => {
          popover.classList.remove('is-open', 'is-pinned');
          const ref = popover.parentElement?.querySelector('a[data-footnote-ref]');
          ref?.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }
}
