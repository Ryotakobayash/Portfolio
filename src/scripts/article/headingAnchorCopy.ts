/**
 * 見出し横の '#' クリックでセクション URL をクリップボードにコピー、
 * 直後に 'Copied!' ツールチップに切り替える。
 * 委譲リスナを document に 1 回だけ登録する。
 */
export function setupHeadingAnchorCopy() {
  if ((window as any).__headingAnchorCopyBound) return;
  (window as any).__headingAnchorCopyBound = true;

  document.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('.heading-anchor') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    const url = `${window.location.origin}${window.location.pathname}${href}`;
    try {
      await navigator.clipboard.writeText(url);
      anchor.classList.add('is-copied');
      window.setTimeout(() => anchor.classList.remove('is-copied'), 1500);
    } catch (err) {
      console.warn('Failed to copy section URL', err);
    }
  });
}
