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
                        stroke={isOverHalf ? 'var(--color-accent)' : '#228BE6'}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
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
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🕐 人生の進捗
                </span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' }}>
                    {currentAge}歳 / {expectedAge}歳
                </span>
                {yearsToHalf > 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        折り返し(50%)まで: あと{yearsToHalf}年
                    </span>
                ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>
                        ✅ 折り返し地点を通過済み
                    </span>
                )}
            </div>
        </div>
    );
}
