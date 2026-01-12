'use client';

import { useMemo } from 'react';
import { Text, Group, Tooltip, Box } from '@mantine/core';
import Link from 'next/link';

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
            const dateKey = post.date; // YYYY-MM-DD形式を想定
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

    // 投稿数に基づく色の濃さを計算
    const getColor = (count: number) => {
        if (count === 0) return 'var(--mantine-color-dark-6)';
        if (count === 1) return 'var(--mantine-color-cyan-7)';
        if (count === 2) return 'var(--mantine-color-cyan-5)';
        return 'var(--mantine-color-cyan-3)';
    };

    return (
        <Box>
            <Text size="sm" c="dimmed" mb="sm">
                過去12ヶ月の投稿
            </Text>
            <div style={{
                display: 'flex',
                gap: '4px',
                flexWrap: 'wrap',
                alignItems: 'flex-start'
            }}>
                {months.map((month) => (
                    <div key={month.month} style={{ marginBottom: '8px' }}>
                        <Text size="xs" c="dimmed" mb={4}>
                            {month.month.slice(5)}月
                        </Text>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 10px)',
                            gap: '2px'
                        }}>
                            {month.days.map((day) => (
                                day.posts.length > 0 ? (
                                    <Tooltip
                                        key={day.date}
                                        label={
                                            <div>
                                                <Text size="xs">{day.date}</Text>
                                                {day.posts.map((p) => (
                                                    <Text key={p.slug} size="xs">{p.title}</Text>
                                                ))}
                                            </div>
                                        }
                                    >
                                        <Link href={`/posts/${day.posts[0].slug}`}>
                                            <div
                                                style={{
                                                    width: '10px',
                                                    height: '10px',
                                                    borderRadius: '2px',
                                                    backgroundColor: getColor(day.posts.length),
                                                    cursor: 'pointer',
                                                }}
                                            />
                                        </Link>
                                    </Tooltip>
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
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Group gap="xs" mt="sm">
                <Text size="xs" c="dimmed">少</Text>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--mantine-color-dark-6)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--mantine-color-cyan-7)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--mantine-color-cyan-5)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--mantine-color-cyan-3)' }} />
                <Text size="xs" c="dimmed">多</Text>
            </Group>
        </Box>
    );
}
