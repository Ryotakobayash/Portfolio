import { useState, useEffect } from 'react';
import { useCountUp } from '../hooks/useCountUp';

interface Props {
    monthlyTarget: number;
}

/**
 * 月間PV達成率 コンポーネント
 * /api/pv から今月のPV合計を取得し、目標に対する達成率を表示
 */
export default function PVProgress({ monthlyTarget }: Props) {
    const [currentPV, setCurrentPV] = useState(0);
    const [trendData, setTrendData] = useState<{ date: string, pv: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/pv')
            .then((res) => res.json())
            .then((json) => {
                setCurrentPV(json.totalPV || 0);
                setTrendData(json.data || []);
            })
            .catch(() => { setCurrentPV(0); setTrendData([]); })
            .finally(() => setIsLoading(false));
    }, []);

    const animatedPV = useCountUp(currentPV, 1500);

    const percentage = Math.min(100, Math.round((currentPV / monthlyTarget) * 100));
    const animatedPercentage = useCountUp(percentage, 1500);
    const isAchieved = percentage >= 100;

    const generateSparklinePath = (data: { pv: number }[]) => {
        if (data.length === 0) return '';
        const max = Math.max(...data.map(d => d.pv), 1);
        const min = Math.min(...data.map(d => d.pv), 0);
        const range = max - min || 1;
        
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 30 - ((d.pv - min) / range) * 26 - 2;
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
        }).join(' ');
    };

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

            <div style={{ position: 'relative', display: 'flex', alignItems: 'baseline', gap: '8px', minHeight: '32px' }}>
                {trendData.length > 0 && (
                    <div style={{ position: 'absolute', right: '60px', bottom: 0, width: '40%', height: '100%', opacity: 0.25, pointerEvents: 'none' }}>
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                            <path d={generateSparklinePath(trendData)} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
                
                <span style={{
                    position: 'relative', zIndex: 1,
                    fontSize: '1.5rem', fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: isAchieved ? 'var(--color-primary)' : 'var(--color-text)',
                    fontFamily: 'var(--font-sans)',
                }}>
                    {animatedPV.toLocaleString()}
                </span>
                <span style={{ position: 'relative', zIndex: 1, fontSize: '0.65rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                    PV (last 7d)
                </span>
                <span style={{
                    marginLeft: 'auto',
                    position: 'relative', zIndex: 1,
                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', padding: '2px 6px',
                    border: `1px solid ${isAchieved ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    color: isAchieved ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}>
                    {isAchieved ? 'ACHIEVED' : `${animatedPercentage}%`}
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

            {/* Data Source */}
            <div style={{
                marginTop: '4px', fontSize: '0.6rem', color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textAlign: 'right'
            }}>
                Source: GA4 Data API
            </div>
        </div>
    );
}
