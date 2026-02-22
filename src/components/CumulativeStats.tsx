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
        { label: 'Posts', value: postCount, icon: '📝' },
        { label: 'Total PV', value: isLoading ? '...' : totalPV.toLocaleString(), icon: '👁' },
        { label: 'Talks', value: talks, icon: '🎤' },
        { label: 'Projects', value: projects, icon: '🏗️' },
    ];

    return (
        <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
        }}>
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: '4px',
                        padding: '12px 8px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-secondary)',
                    }}
                >
                    <span style={{ fontSize: '1.25rem' }}>{stat.icon}</span>
                    <span style={{
                        fontSize: '1.5rem', fontWeight: 700,
                        color: 'var(--color-accent)', lineHeight: 1.2,
                    }}>
                        {stat.value}
                    </span>
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 600,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        {stat.label}
                    </span>
                </div>
            ))}
        </div>
    );
}
