import { useState, useEffect } from 'react';

interface Props {
    monthlyTarget: number;
}

/**
 * 月間PV達成率 コンポーネント
 * /api/pv から今月のPV合計を取得し、目標に対する達成率を表示
 */
export default function PVProgress({ monthlyTarget }: Props) {
    const [currentPV, setCurrentPV] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/pv')
            .then((res) => res.json())
            .then((json) => {
                setCurrentPV(json.totalPV || 0);
            })
            .catch(() => setCurrentPV(0))
            .finally(() => setIsLoading(false));
    }, []);

    const percentage = Math.min(100, Math.round((currentPV / monthlyTarget) * 100));
    const isAchieved = percentage >= 100;

    if (isLoading) {
        return (
            <div style={{
                height: '80px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)',
                backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite',
            }} />
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    👁 月間PV
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    目標: {monthlyTarget} PV/月
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{
                    fontSize: '1.5rem', fontWeight: 700,
                    color: isAchieved ? 'var(--color-accent)' : 'var(--color-text)',
                }}>
                    {currentPV.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    PV (過去7日)
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '1rem', fontWeight: 600 }}>
                    {isAchieved ? '✅' : `${percentage}%`}
                </span>
            </div>

            {/* プログレスバー */}
            <div style={{
                height: '8px', borderRadius: '4px',
                backgroundColor: 'var(--color-bg-secondary)', overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%', borderRadius: '4px',
                    backgroundColor: isAchieved ? 'var(--color-accent)' : '#228BE6',
                    width: `${percentage}%`,
                    transition: 'width 0.8s ease',
                }} />
            </div>
        </div>
    );
}
