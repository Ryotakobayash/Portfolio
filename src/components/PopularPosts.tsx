import { useState, useEffect } from 'react';

interface RankingItem {
    path: string;
    title: string;
    pv: number;
}

/**
 * 人気記事ランキングコンポーネント
 * GA4 APIから上位5記事を取得して表示
 */
export function PopularPosts() {
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/pv/ranking')
            .then((res) => res.json())
            .then((json) => {
                setRanking(json.ranking || []);
            })
            .catch(() => setRanking([]))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                        height: '40px', borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)',
                        backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite',
                    }} />
                ))}
            </div>
        );
    }

    if (ranking.length === 0) {
        return <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>データがありません</p>;
    }

    const medals = ['🥇', '🥈', '🥉', '4', '5'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {ranking.map((item, i) => (
                <a
                    key={item.path}
                    href={item.path}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px', borderRadius: 'var(--radius-md)',
                        textDecoration: 'none', color: 'inherit',
                        transition: 'background-color 150ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    <span style={{
                        width: '28px', height: '28px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: i < 3 ? '1.1rem' : '0.8rem', fontWeight: 700,
                        color: i < 3 ? undefined : 'var(--color-text-muted)',
                        flexShrink: 0,
                    }}>
                        {medals[i]}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '0.875rem', fontWeight: 500,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            {item.title || item.path.replace('/posts/', '')}
                        </div>
                    </div>
                    <span style={{
                        fontSize: '0.75rem', color: 'var(--color-text-muted)',
                        fontWeight: 600, flexShrink: 0,
                    }}>
                        {item.pv.toLocaleString()} PV
                    </span>
                </a>
            ))}
        </div>
    );
}

export default PopularPosts;
