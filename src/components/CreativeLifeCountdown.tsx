import { useState, useEffect } from 'react';

interface Props {
    startDate: string;  // "2025-04-01"
    endDate: string;    // "2035-03-31"
}

/**
 * 創造的人生カウントダウン コンポーネント
 * 映画「風立ちぬ」カプローニの名言になぞらえた10年カウントダウン
 */
export default function CreativeLifeCountdown({ startDate, endDate }: Props) {
    const [daysLeft, setDaysLeft] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [timeBreakdown, setTimeBreakdown] = useState({ years: 0, months: 0, days: 0 });

    useEffect(() => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        const totalMs = end.getTime() - start.getTime();
        const elapsedMs = now.getTime() - start.getTime();
        const remainMs = end.getTime() - now.getTime();

        const remaining = Math.max(0, Math.ceil(remainMs / (1000 * 60 * 60 * 24)));
        const pct = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

        // 年/月/日 に分解
        const years = Math.floor(remaining / 365);
        const months = Math.floor((remaining % 365) / 30);
        const days = remaining % 30;

        setDaysLeft(remaining);
        setPercentage(Math.max(0, pct));
        setTimeBreakdown({ years, months, days });
    }, [startDate, endDate]);

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: '12px',
            padding: '4px 0',
        }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🚀 創造的人生の持ち時間
            </span>

            {/* 残り日数 */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    {daysLeft.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    日
                </span>
            </div>

            {/* 年月日に分解 */}
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                ({timeBreakdown.years}年 {timeBreakdown.months}ヶ月 {timeBreakdown.days}日)
            </span>

            {/* プログレスバー */}
            <div>
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.75rem', color: 'var(--color-text-muted)',
                    marginBottom: '4px',
                }}>
                    <span>{startDate.slice(0, 4)}年</span>
                    <span>{percentage}% 経過</span>
                    <span>{endDate.slice(0, 4)}年</span>
                </div>
                <div style={{
                    height: '8px', borderRadius: '4px',
                    backgroundColor: 'var(--color-bg-secondary)', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%', borderRadius: '4px',
                        backgroundColor: 'var(--color-accent)',
                        width: `${percentage}%`,
                        transition: 'width 1s ease',
                    }} />
                </div>
            </div>

            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                「力を尽くして生きなさい」— カプローニ
            </span>
        </div>
    );
}
