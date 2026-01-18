import { useEffect } from 'react';

/**
 * コードブロックにコピーボタンを追加するコンポーネント
 * 記事ページでマウント時に全preタグにボタンを挿入
 */
export function CodeCopyButton() {
    useEffect(() => {
        const codeBlocks = document.querySelectorAll('pre');

        codeBlocks.forEach((pre) => {
            // 既にボタンがある場合はスキップ
            if (pre.querySelector('.code-copy-btn')) return;

            // ボタンを作成
            const button = document.createElement('button');
            button.className = 'code-copy-btn';
            button.textContent = 'コピー';
            button.setAttribute('aria-label', 'コードをコピー');

            // スタイル設定
            button.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px 8px;
        font-size: 0.75rem;
        background-color: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 150ms ease;
        opacity: 0;
      `;

            // ホバーで表示
            pre.addEventListener('mouseenter', () => {
                button.style.opacity = '1';
            });
            pre.addEventListener('mouseleave', () => {
                button.style.opacity = '0';
            });

            button.addEventListener('click', async () => {
                const code = pre.querySelector('code');
                if (code) {
                    try {
                        await navigator.clipboard.writeText(code.textContent || '');
                        button.textContent = 'コピーしました！';
                        button.style.backgroundColor = 'var(--color-accent)';
                        button.style.color = 'white';
                        button.style.borderColor = 'var(--color-accent)';
                        setTimeout(() => {
                            button.textContent = 'コピー';
                            button.style.backgroundColor = 'var(--color-bg-secondary)';
                            button.style.color = 'var(--color-text-secondary)';
                            button.style.borderColor = 'var(--color-border)';
                        }, 2000);
                    } catch (err) {
                        button.textContent = 'エラー';
                        setTimeout(() => {
                            button.textContent = 'コピー';
                        }, 2000);
                    }
                }
            });

            // preを相対配置にしてボタンを絶対配置
            pre.style.position = 'relative';
            pre.appendChild(button);
        });
    }, []);

    return null;
}

export default CodeCopyButton;
