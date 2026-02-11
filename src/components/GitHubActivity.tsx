import { useState, useEffect } from 'react';

interface ContributionDay {
    date: string;
    count: number;
    level: number; // 0-4
}

/**
 * GitHub草グラフコンポーネント
 * GitHub公開プロフィールからコントリビューション状況を表示
 */
export function GitHubActivity({ username = 'Ryotakobayash' }: { username?: string }) {
    const [days, setDays] = useState<ContributionDay[]>([]);
    const [totalContributions, setTotalContributions] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // GitHub GraphQL APIはトークンが必要なので、
        // skyline/contrib APIのプロキシか、ダミーデータで代用
        // ここではGitHubの公開イベントAPIを使用
        fetch(`https://api.github.com/users/${username}/events/public?per_page=100`)
            .then((res) => res.json())
            .then((events: any[]) => {
                if (!Array.isArray(events)) {
                    generateDummyData();
                    return;
                }

                // イベントから日別のアクティビティを集計
                const activityMap = new Map<string, number>();
                const now = new Date();

                // 過去12週間分の日付を初期化
                for (let i = 83; i >= 0; i--) {
                    const d = new Date(now);
                    d.setDate(d.getDate() - i);
                    const key = d.toISOString().slice(0, 10);
                    activityMap.set(key, 0);
                }

                // イベントを日別に集計
                events.forEach((event: any) => {
                    const date = event.created_at?.slice(0, 10);
                    if (date && activityMap.has(date)) {
                        activityMap.set(date, (activityMap.get(date) || 0) + 1);
                    }
                });

                const result: ContributionDay[] = [];
                let total = 0;
                activityMap.forEach((count, date) => {
                    total += count;
                    result.push({
                        date,
                        count,
                        level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4,
                    });
                });

                setDays(result);
                setTotalContributions(total);
                setIsLoading(false);
            })
            .catch(() => {
                generateDummyData();
            });
    }, [username]);

    const generateDummyData = () => {
        const now = new Date();
        const result: ContributionDay[] = [];
        let total = 0;
        for (let i = 83; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const count = Math.random() > 0.4 ? Math.floor(Math.random() * 8) : 0;
            total += count;
            result.push({
                date: d.toISOString().slice(0, 10),
                count,
                level: count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4,
            });
        }
        setDays(result);
        setTotalContributions(total);
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div style={{
                height: '100px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)',
                backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite',
            }} />
        );
    }

    // 12週 × 7日のグリッドを構築
    const weeks: ContributionDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    const levelColors = [
        'var(--gh-level-0, rgba(128, 128, 128, 0.1))',
        'var(--gh-level-1, #0e4429)',
        'var(--gh-level-2, #006d32)',
        'var(--gh-level-3, #26a641)',
        'var(--gh-level-4, #39d353)',
    ];

    return (
        <div>
            <div style={{
                display: 'flex', gap: '3px', justifyContent: 'center',
                overflowX: 'auto', padding: '4px 0',
            }}>
                {weeks.map((week, wi) => (
                    <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {week.map((day) => (
                            <div
                                key={day.date}
                                title={`${day.date}: ${day.count} contributions`}
                                style={{
                                    width: '12px', height: '12px',
                                    borderRadius: '2px',
                                    backgroundColor: levelColors[day.level],
                                    transition: 'transform 150ms ease',
                                    cursor: 'default',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)',
            }}>
                <span>{totalContributions} contributions (12 weeks)</span>
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
