import { useMemo } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useGitHubActivity } from '../hooks/useGitHubActivity';
import { retroColor, groupContributionsByWeek, calculateMonthLabels } from '../utils/githubUtils';

export function GitHubActivity({ username = 'Ryotakobayash' }: { username?: string }) {
    const isDark = useTheme();
    const { days, totalContributions, isLoading, error } = useGitHubActivity(username);

    // 週ごとにグループ化 (全体)
    const allWeeks = useMemo(() => groupContributionsByWeek(days), [days]);

    // レイアウト破綻を防ぐため、情報量を「直近の24週分（約半年分）」に絞る
    const weeks = useMemo(() => {
        const WEEKS_TO_SHOW = 24;
        return allWeeks.length > WEEKS_TO_SHOW ? allWeeks.slice(-WEEKS_TO_SHOW) : allWeeks;
    }, [allWeeks]);

    // 月ラベルを計算
    const monthLabels = useMemo(() => calculateMonthLabels(weeks), [weeks]);

    if (isLoading) {
        return (
            <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius-md)' }} />
        );
    }

    if (error) {
        return (
            <div className="text-muted text-sm pt-md" style={{ textAlign: 'center' }}>
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
        <div style={{ width: '100%', minWidth: 0 }}>
            <div style={{ overflowX: 'auto', padding: '4px 0' }}>
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    style={{ display: 'block', minWidth: svgWidth, margin: '0 auto' }}
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
                                    fill={retroColor(day.count, isDark)}
                                    style={{ cursor: 'default' }}
                                >
                                    <title>{`${day.date}: ${day.count} contributions`}</title>
                                </rect>
                            ) : null
                        )
                    )}
                </svg>
            </div>
            <div className="flex justify-between items-center text-muted" style={{
                marginTop: '8px', fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
            }}>
                <span>{totalContributions} contributions in the last year</span>
                <a
                    href={`https://github.com/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                    style={{ textDecoration: 'none', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}
                >
                    @{username} →
                </a>
            </div>
        </div>
    );
}

export default GitHubActivity;
