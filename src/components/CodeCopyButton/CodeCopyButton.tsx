'use client';

import { useEffect } from 'react';
import styles from './CopyButton.module.css';

/**
 * コードブロックにコピーボタンを追加するコンポーネント
 * 記事ページでマウント時に全preタグにボタンを挿入
 */
export function CodeCopyButton() {
    useEffect(() => {
        const codeBlocks = document.querySelectorAll('pre');

        codeBlocks.forEach((pre) => {
            // 既にボタンがある場合はスキップ
            if (pre.querySelector(`.${styles.copyButton}`)) return;

            // ボタンを作成
            const button = document.createElement('button');
            button.className = styles.copyButton;
            button.textContent = 'コピー';
            button.setAttribute('aria-label', 'コードをコピー');

            button.addEventListener('click', async () => {
                const code = pre.querySelector('code');
                if (code) {
                    try {
                        await navigator.clipboard.writeText(code.textContent || '');
                        button.textContent = 'コピーしました！';
                        button.classList.add(styles.copied);
                        setTimeout(() => {
                            button.textContent = 'コピー';
                            button.classList.remove(styles.copied);
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
