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
                height: '80px',
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
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    Monthly PV
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    Target: {monthlyTarget} PV/mo
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{
                    fontSize: '1.5rem', fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: isAchieved ? 'var(--color-primary)' : 'var(--color-text)',
                    fontFamily: 'var(--font-sans)',
                }}>
                    {currentPV.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                    PV (last 7d)
                </span>
                <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', padding: '2px 6px',
                    border: `1px solid ${isAchieved ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    color: isAchieved ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}>
                    {isAchieved ? 'ACHIEVED' : `${percentage}%`}
                </span>
            </div>

            {/* Progress bar */}
            <div style={{
                height: '4px',
                backgroundColor: 'var(--color-border)', overflow: 'hidden',
            }}>
                <div style={{
                    height: '100%',
                    backgroundColor: isAchieved ? 'var(--color-primary)' : '#5C7F71',
                    width: `${percentage}%`,
                    transition: 'width 0.8s ease',
                }} />
            </div>
        </div>
    );
}
