import { useState, useEffect } from 'react';

interface Props {
    birthYear: number;
    expectedAge: number;
}

/**
 * 寿命パーセンタイル Ring Progress コンポーネント
 * 現在の年齢 / 期待寿命 の割合をリング型プログレスで表示
 */
export default function LifeProgress({ birthYear, expectedAge }: Props) {
    const [currentAge, setCurrentAge] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [yearsToHalf, setYearsToHalf] = useState(0);

    useEffect(() => {
        const now = new Date();
        const age = now.getFullYear() - birthYear;
        const pct = Math.round((age / expectedAge) * 100);
        const halfAge = Math.ceil(expectedAge / 2);
        const toHalf = halfAge - age;

        setCurrentAge(age);
        setPercentage(pct);
        setYearsToHalf(toHalf > 0 ? toHalf : 0);
    }, [birthYear, expectedAge]);

    // SVG Ring Progress
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const isOverHalf = percentage >= 50;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            padding: '4px 0',
        }}>
            {/* Ring */}
            <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* 背景リング */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none" stroke="var(--color-bg-secondary)"
                        strokeWidth={strokeWidth}
                    />
                    {/* プログレスリング */}
                    <circle
                        cx={size / 2} cy={size / 2} r={radius}
                        fill="none"
                        stroke={isOverHalf ? 'var(--color-primary)' : '#5C7F71'}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                </svg>
                {/* 中心テキスト */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        {percentage}%
                    </span>
                </div>
            </div>

            {/* テキスト情報 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    Life Progress
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                    {currentAge} / {expectedAge} yrs
                </span>
                {yearsToHalf > 0 ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Midpoint in {yearsToHalf} yr{yearsToHalf !== 1 ? 's' : ''}
                    </span>
                ) : (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                        50% Passed
                    </span>
                )}
            </div>
        </div>
    );
}
