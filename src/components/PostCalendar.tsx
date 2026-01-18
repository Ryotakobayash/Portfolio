import { useMemo } from 'react';

interface PostDate {
    slug: string;
    title: string;
    date: string;
}

interface PostCalendarProps {
    posts: PostDate[];
}

/**
 * 記事の投稿タイミングをカレンダー形式で可視化するコンポーネント
 * 過去12ヶ月のカレンダーグリッドを表示
 */
export function PostCalendar({ posts }: PostCalendarProps) {
    // 投稿日をMapに変換
    const postsByDate = useMemo(() => {
        const map = new Map<string, PostDate[]>();
        posts.forEach((post) => {
            const dateKey = post.date;
            const existing = map.get(dateKey) || [];
            existing.push(post);
            map.set(dateKey, existing);
        });
        return map;
    }, [posts]);

    // 過去12ヶ月の月別グリッドを生成
    const months = useMemo(() => {
        const result: { month: string; days: { date: string; posts: PostDate[] }[] }[] = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

            const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
            const days: { date: string; posts: PostDate[] }[] = [];

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${monthKey}-${String(day).padStart(2, '0')}`;
                days.push({
                    date: dateStr,
                    posts: postsByDate.get(dateStr) || [],
                });
            }

            result.push({
                month: monthKey,
                days,
            });
        }

        return result;
    }, [postsByDate]);

    // 投稿数に基づく色を計算
    const getColor = (count: number) => {
        if (count === 0) return 'var(--color-bg-secondary)';
        if (count === 1) return 'var(--color-accent)';
        if (count === 2) return '#1b9db0';
        return '#15818f';
    };

    return (
        <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                過去12ヶ月の投稿
            </div>
            <div
                style={{
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                }}
            >
                {months.map((month) => (
                    <div key={month.month} style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                            {month.month.slice(5)}月
                        </div>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 10px)',
                                gap: '2px',
                            }}
                        >
                            {month.days.map((day) =>
                                day.posts.length > 0 ? (
                                    <a
                                        key={day.date}
                                        href={`/posts/${day.posts[0].slug}`}
                                        title={`${day.date}: ${day.posts.map((p) => p.title).join(', ')}`}
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '2px',
                                            backgroundColor: getColor(day.posts.length),
                                            cursor: 'pointer',
                                            display: 'block',
                                        }}
                                    />
                                ) : (
                                    <div
                                        key={day.date}
                                        style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '2px',
                                            backgroundColor: getColor(0),
                                        }}
                                    />
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>少</span>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-bg-secondary)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-accent)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#1b9db0' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#15818f' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>多</span>
            </div>
        </div>
    );
}

export default PostCalendar;
