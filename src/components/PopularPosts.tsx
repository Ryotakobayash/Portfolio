import { useState, useEffect } from 'react';

interface RankingItem {
    path: string;
    title: string;
    pv: number;
}

export function PopularPosts() {
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/pv/ranking')
            .then((res) => res.json())
            .then((json) => { setRanking(json.ranking || []); })
            .catch(() => setRanking([]))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{
                        height: '36px',
                        background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'skeleton-loading 1.5s infinite',
                    }} />
                ))}
            </div>
        );
    }

    if (ranking.length === 0) {
        return <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>No data available.</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {ranking.map((item, i) => (
                <a
                    key={item.path}
                    href={item.path}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 0',
                        borderBottom: '1px solid var(--color-border)',
                        textDecoration: 'none', color: 'var(--color-text)',
                        transition: 'color 120ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text)')}
                >
                    {/* Rank number */}
                    <span style={{
                        width: '20px', flexShrink: 0, textAlign: 'center',
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                        color: i < 3 ? 'var(--color-accent-2)' : 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                    }}>
                        {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Accent rule */}
                    <span style={{
                        width: '2px', height: '14px', flexShrink: 0,
                        backgroundColor: i === 0
                            ? 'var(--color-accent-2)'
                            : i === 1
                                ? 'var(--color-primary)'
                                : 'var(--color-border)',
                    }} />

                    {/* Title */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '0.875rem', fontWeight: 400,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            {item.title || item.path.replace('/posts/', '')}
                        </div>
                    </div>

                    {/* PV */}
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        letterSpacing: '0.05em',
                        color: 'var(--color-text-muted)', flexShrink: 0,
                        fontFamily: 'var(--font-mono)',
                    }}>
                        {item.pv.toLocaleString()} PV
                    </span>
                </a>
            ))}
        </div>
    );
}

export default PopularPosts;
