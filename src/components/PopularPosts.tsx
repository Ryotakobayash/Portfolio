import { useEffect, useState } from 'react';
import type { RankingItem, RankingPvResponse, PvSource } from '../types/pv';

export function PopularPosts() {
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [source, setSource] = useState<PvSource | 'loading'>('loading');
    const [periodDays, setPeriodDays] = useState(30);

    useEffect(() => {
        const controller = new AbortController();

        fetch('/api/pv/ranking', { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<RankingPvResponse>;
            })
            .then((data) => {
                setRanking(Array.isArray(data.ranking) ? data.ranking : []);
                setSource(data.source || 'fallback');
                setPeriodDays(data.periodDays);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setRanking([]);
                setSource('fallback');
            });

        return () => controller.abort();
    }, []);

    if (source === 'loading') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }} aria-label="人気記事を読み込み中">
                {[1, 2, 3, 4, 5].map((index) => (
                    <div
                        key={index}
                        className="skeleton"
                        style={{
                            height: '55px',
                            borderBottom: index < 5 ? '1px solid var(--color-border)' : 'none',
                        }}
                    />
                ))}
                <div className="skeleton" style={{ height: '10px', width: '140px', marginTop: '12px', marginLeft: 'auto' }} />
            </div>
        );
    }

    if (source === 'fallback') {
        return <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>PVデータを一時的に取得できません。</p>;
    }

    if (ranking.length === 0) {
        return <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', letterSpacing: '0.05em' }}>過去{periodDays}日のデータはありません。</p>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {ranking.map((item, index) => (
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
                    onMouseEnter={(event) => (event.currentTarget.style.color = 'var(--color-primary)')}
                    onMouseLeave={(event) => (event.currentTarget.style.color = 'var(--color-text)')}
                >
                    <span style={{
                        width: '20px', flexShrink: 0, textAlign: 'center',
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                        color: index < 3 ? 'var(--color-accent-2)' : 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                    }}>
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                        width: '2px', height: '14px', flexShrink: 0,
                        backgroundColor: index === 0
                            ? 'var(--color-accent-2)'
                            : index === 1
                                ? 'var(--color-primary)'
                                : 'var(--color-border)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '0.875rem', fontWeight: 400,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            {item.title || item.path.replace('/posts/', '')}
                        </div>
                    </div>
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        letterSpacing: '0.05em',
                        color: 'var(--color-text-muted)', flexShrink: 0,
                        fontFamily: 'var(--font-mono)',
                    }}>
                        {source === 'ga4' ? `${item.pv.toLocaleString()} PV` : `${item.pv.toLocaleString()} DEMO`}
                    </span>
                </a>
            ))}

            <div style={{
                marginTop: '12px', fontSize: '0.6rem', color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textAlign: 'right',
            }}>
                {source === 'ga4'
                    ? `Source: GA4 / 公開記事 / 過去${periodDays}日`
                    : `Source: Demo data / 過去${periodDays}日 / 実際のPVではありません`}
            </div>
        </div>
    );
}

export default PopularPosts;
