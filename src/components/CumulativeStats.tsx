import { useState, useEffect } from 'react';

interface Props {
    postCount: number;
    talks: number;
    projects: number;
}

/**
 * 累計実績 Stats Grid コンポーネント
 * Posts / Total PV / Talks / Projects を表示
 */
export default function CumulativeStats({ postCount, talks, projects }: Props) {
    const [totalPV, setTotalPV] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/pv/treemap')
            .then((res) => res.json())
            .then((json) => {
                setTotalPV(json.totalPV || 0);
            })
            .catch(() => setTotalPV(0))
            .finally(() => setIsLoading(false));
    }, []);

    const stats = [
        { label: 'Posts', value: postCount },
        { label: 'Total PV', value: isLoading ? '---' : totalPV.toLocaleString() },
        { label: 'Talks', value: talks },
        { label: 'Projects', value: projects },
    ];

    return (
        <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            border: '1px solid var(--color-border)',
        }}>
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'flex-start', gap: '4px',
                        padding: '16px 12px',
                        backgroundColor: 'var(--color-bg-card)',
                        borderRight: '1px solid var(--color-border)',
                    }}
                >
                    <span style={{
                        fontSize: '0.55rem', fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.2em',
                    }}>
                        {stat.label}
                    </span>
                    <span style={{
                        fontSize: '1.75rem', fontWeight: 900,
                        letterSpacing: '-0.04em',
                        color: 'var(--color-primary)', lineHeight: 1,
                        fontFamily: 'var(--font-sans)',
                    }}>
                        {stat.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
