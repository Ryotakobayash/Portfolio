import { useEffect, useState } from 'react';

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
        const handleScroll = () => {
            const headings = toc.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
            if (headings.length === 0) return;

            // Header offset for scroll calculation
            const scrollPosition = window.scrollY + window.innerHeight / 3;

            // Find the last heading that we've scrolled past
            let currentActiveId = '';
            for (const heading of headings) {
                if (heading.offsetTop <= scrollPosition) {
                    currentActiveId = heading.id;
                } else {
                    break;
                }
            }

            if (currentActiveId) {
                setActiveId(currentActiveId);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        // Initial check
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [toc]);

    if (toc.length === 0) return null;

    return (
        <nav
            style={{
                position: 'sticky',
                top: 'calc(var(--header-height) + var(--spacing-lg))',
                maxHeight: 'calc(100vh - var(--header-height) - 2 * var(--spacing-lg))',
                overflowY: 'auto',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
            }}
        >
            <h2
                style={{
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--spacing-md)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.25em',
                }}
            >
                Contents
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {toc.map((item) => (
                    <li
                        key={item.id}
                        style={{
                            paddingLeft: `${(item.level - 2) * 0.75}rem`,
                            marginBottom: 'var(--spacing-xs)',
                        }}
                    >
                        <a
                            href={`#${item.id}`}
                            style={{
                                display: 'block',
                                padding: '4px 8px',
                                fontSize: '0.8rem',
                                color: activeId === item.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                textDecoration: 'none',
                                borderLeft: activeId === item.id ? '2px solid var(--color-primary)' : '2px solid transparent',
                                backgroundColor: 'transparent',
                                transition: 'color var(--transition-fast), border-color var(--transition-fast)',
                            }}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default StickyToc;
