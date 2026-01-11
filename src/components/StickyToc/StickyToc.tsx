'use client';

import { useEffect, useState } from 'react';
import styles from './StickyToc.module.css';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface StickyTocProps {
    toc: TocItem[];
}

/**
 * サイドバー固定目次（スクロール位置ハイライト付き）
 * デスクトップのみ表示、モバイルでは非表示
 */
export function StickyToc({ toc }: StickyTocProps) {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const headings = toc.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // 画面内に入った見出しの中で最も上にあるものをアクティブに
                const visibleEntries = entries.filter((entry) => entry.isIntersecting);
                if (visibleEntries.length > 0) {
                    // 最も上にある見出しを選択
                    const topEntry = visibleEntries.reduce((prev, current) =>
                        prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current
                    );
                    setActiveId(topEntry.target.id);
                }
            },
            {
                rootMargin: '-80px 0px -70% 0px',
                threshold: 0,
            }
        );

        headings.forEach((heading) => observer.observe(heading));

        return () => {
            headings.forEach((heading) => observer.unobserve(heading));
        };
    }, [toc]);

    if (toc.length === 0) return null;

    return (
        <nav className={styles.stickyToc}>
            <h2 className={styles.tocTitle}>目次</h2>
            <ul className={styles.tocList}>
                {toc.map((item) => (
                    <li
                        key={item.id}
                        className={`${styles.tocItem} ${activeId === item.id ? styles.active : ''}`}
                        style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
                    >
                        <a href={`#${item.id}`} className={styles.tocLink}>
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
