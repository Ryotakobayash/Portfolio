import { useState, useEffect, useMemo } from 'react';

interface ContributionDay {
    date: string;
    count: number;
    color: string; // GitHub公式カラー
}

interface APIResponse {
    totalContributions: number;
    days: ContributionDay[];
}

/**
 * GitHub草グラフコンポーネント
 * GitHub GraphQL APIから正確なコントリビューションカレンダーを取得して表示
 */
export function GitHubActivity({ username = 'Ryotakobayash' }: { username?: string }) {
    const [days, setDays] = useState<ContributionDay[]>([]);
    const [totalContributions, setTotalContributions] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/github/contributions')
            .then((res) => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
            })
            .then((data: APIResponse) => {
                setDays(data.days);
                setTotalContributions(data.totalContributions);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch contributions:', err);
                setError('Failed to load');
                setIsLoading(false);
            });
    }, []);

    // 週ごとにグループ化（日曜始まり、GitHub準拠）
    const weeks = useMemo(() => {
        if (days.length === 0) return [];

        const result: (ContributionDay | null)[][] = [];
        let currentWeek: (ContributionDay | null)[] = [];

        // 最初の日の曜日を取得し、それ以前をnullで埋める
        if (days.length > 0) {
            const firstDayOfWeek = new Date(days[0].date).getUTCDay(); // 0=Sun
            for (let i = 0; i < firstDayOfWeek; i++) {
                currentWeek.push(null);
            }
        }

        for (const day of days) {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                result.push(currentWeek);
                currentWeek = [];
            }
        }

        // 最後の不完全な週を追加
        if (currentWeek.length > 0) {
            result.push(currentWeek);
        }

        return result;
    }, [days]);

    // 月ラベルを計算
    const monthLabels = useMemo(() => {
        if (weeks.length === 0) return [];

        const labels: { text: string; col: number }[] = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let lastMonth = -1;

        weeks.forEach((week, colIndex) => {
            // 週の最初の有効な日を取得
            const firstDay = week.find((d) => d !== null);
            if (firstDay) {
                const month = new Date(firstDay.date).getUTCMonth();
                if (month !== lastMonth) {
                    labels.push({ text: monthNames[month], col: colIndex });
                    lastMonth = month;
                }
            }
        });

        return labels;
    }, [weeks]);

    if (isLoading) {
        return (
            <div style={{
                height: '120px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)',
                backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite',
            }} />
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '20px', textAlign: 'center',
                color: 'var(--color-text-muted)', fontSize: '0.85rem',
            }}>
                {error}
            </div>
        );
    }

    const cellSize = 11;
    const cellGap = 3;
    const labelHeight = 18;
    const dayLabelWidth = 30;
    const svgWidth = dayLabelWidth + weeks.length * (cellSize + cellGap);
    const svgHeight = labelHeight + 7 * (cellSize + cellGap);
    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

    return (
        <div>
            <div style={{ overflowX: 'auto', padding: '4px 0' }}>
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    style={{ display: 'block', minWidth: svgWidth }}
                >
                    {/* 月ラベル */}
                    {monthLabels.map((label, i) => (
                        <text
                            key={i}
                            x={dayLabelWidth + label.col * (cellSize + cellGap)}
                            y={12}
                            fill="var(--color-text-muted)"
                            fontSize="10"
                            fontFamily="inherit"
                        >
                            {label.text}
                        </text>
                    ))}

                    {/* 曜日ラベル */}
                    {dayLabels.map((label, i) =>
                        label ? (
                            <text
                                key={`day-${i}`}
                                x={0}
                                y={labelHeight + i * (cellSize + cellGap) + cellSize - 1}
                                fill="var(--color-text-muted)"
                                fontSize="10"
                                fontFamily="inherit"
                            >
                                {label}
                            </text>
                        ) : null
                    )}

                    {/* セル */}
                    {weeks.map((week, colIndex) =>
                        week.map((day, rowIndex) =>
                            day ? (
                                <rect
                                    key={day.date}
                                    x={dayLabelWidth + colIndex * (cellSize + cellGap)}
                                    y={labelHeight + rowIndex * (cellSize + cellGap)}
                                    width={cellSize}
                                    height={cellSize}
                                    rx={2}
                                    ry={2}
                                    fill={day.color}
                                    style={{ cursor: 'default' }}
                                >
                                    <title>{`${day.date}: ${day.count} contributions`}</title>
                                </rect>
                            ) : null
                        )
                    )}
                </svg>
            </div>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)',
            }}>
                <span>{totalContributions} contributions in the last year</span>
                <a
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.75rem' }}
                >
                    @{username} →
                </a>
            </div>
        </div>
    );
}

export default GitHubActivity;
