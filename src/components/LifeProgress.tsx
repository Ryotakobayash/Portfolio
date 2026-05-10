import { useCountUp } from '../hooks/useCountUp';

interface Props {
    birthYear: number;
    expectedAge: number;
}

/**
 * 寿命パーセンタイル Ring Progress コンポーネント
 * 現在の年齢 / 期待寿命 の割合をリング型プログレスで表示
 */
export default function LifeProgress({ birthYear, expectedAge }: Props) {
    // コンポーネント内で直接計算（初期レンダー時のチラつきや矛盾を防ぐ）
    const age = new Date().getFullYear() - birthYear;
    const percentage = Math.round((age / expectedAge) * 100);
    const halfAge = Math.ceil(expectedAge / 2);
    const yearsToHalf = halfAge - age;

    const animatedPercentage = useCountUp(percentage, 2000);

    // SVG Ring Progress
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedPercentage / 100) * circumference;

    const isOverHalf = animatedPercentage >= 50;

    return (

        <div style={{
            display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: '20px',
            padding: '4px 0',
        }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    Life Progress
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    想定寿命（{expectedAge}歳）に対する現在の年齢の割合
                </span>
            </div>


            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
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
                            {animatedPercentage}%
                        </span>
                    </div>
                </div>

                {/* テキスト情報 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--color-primary)', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
                            {age} / {expectedAge}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                            yrs
                        </span>
                    </div>

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

            {/* Data Source */}
            <div style={{
                marginTop: 'auto', paddingTop: '8px',
                fontSize: '0.6rem', color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textAlign: 'right'
            }}>
                Source: Local Config
            </div>
        </div>
    );
}
