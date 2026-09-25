import { useEffect, useMemo, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import { HighchartsReact, type HighchartsReactRefObject } from '../utils/highchartsReact';
import { useTheme } from '../hooks/useTheme';

interface PostDate {
    slug: string;
    date: string;
}

interface Props {
    posts: PostDate[];
    yearlyTarget: number;
    period: string;
}

interface ExternalPost {
    url: string;
    date: string;
}

type ExternalState = 'loading' | 'loaded' | 'error';
type ProgressStatus = 'ON TRACK' | 'BEHIND' | 'NOT STARTED';

function normalizePostKey(slug: string): string {
    return slug.trim().replace(/\/+$/, '');
}

interface TokyoDateContext {
    dateKey: string;
    year: number;
    monthIndex: number;
}

function getTokyoDateContext(date: Date): TokyoDateContext {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const year = Number.parseInt(values.year, 10);
    const month = Number.parseInt(values.month, 10);
    const day = Number.parseInt(values.day, 10);

    return {
        dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        year,
        monthIndex: month - 1,
    };
}

/**
 * 年間の投稿目標と実績を表示する。
 * 内部記事はprops、外部記事はAPIから取得し、同じURLは一度だけ集計する。
 */
export default function PostBurndown({ posts, yearlyTarget, period }: Props) {
    const chartRef = useRef<HighchartsReactRefObject>(null);
    const isDark = useTheme();
    const [externalPosts, setExternalPosts] = useState<PostDate[]>([]);
    const [externalState, setExternalState] = useState<ExternalState>('loading');

    useEffect(() => {
        const controller = new AbortController();

        fetch('/api/note/posts', { signal: controller.signal })
            .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
            .then((data: { posts?: ExternalPost[] }) => {
                const fetchedPosts = Array.isArray(data.posts)
                    ? data.posts.map((post) => ({ slug: post.url, date: post.date }))
                    : [];
                setExternalPosts(fetchedPosts);
                setExternalState('loaded');
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setExternalPosts([]);
                setExternalState('error');
            });

        return () => controller.abort();
    }, []);

    const { idealLine, actualLine, currentTotal, progressStatus } = useMemo(() => {
        const year = Number.parseInt(period, 10);
        const today = getTokyoDateContext(new Date());
        const todayKey = today.dateKey;
        const currentMonth = year < today.year
            ? 11
            : year === today.year
                ? today.monthIndex
                : -1;

        const uniquePosts = new Map<string, PostDate>();
        for (const post of [...posts, ...externalPosts]) {
            const key = normalizePostKey(post.slug);
            if (key) uniquePosts.set(key, post);
        }

        const monthlyCounts = new Array<number>(12).fill(0);
        for (const post of uniquePosts.values()) {
            if (!post.date.startsWith(period) || post.date.slice(0, 10) > todayKey) continue;
            const month = Number.parseInt(post.date.slice(5, 7), 10) - 1;
            if (month >= 0 && month < 12) monthlyCounts[month] += 1;
        }

        const actual: (number | null)[] = [];
        let visibleTotal = 0;
        for (let month = 0; month < 12; month += 1) {
            if (month <= currentMonth) {
                visibleTotal += monthlyCounts[month];
                actual.push(visibleTotal);
            } else {
                actual.push(null);
            }
        }

        const monthlyTarget = yearlyTarget / 12;
        const ideal = Array.from({ length: 12 }, (_, index) =>
            Math.round(monthlyTarget * (index + 1) * 10) / 10,
        );
        const expectedByNow = currentMonth >= 0
            ? Math.round(monthlyTarget * (currentMonth + 1) * 10) / 10
            : 0;
        const status: ProgressStatus = currentMonth < 0
            ? 'NOT STARTED'
            : visibleTotal >= expectedByNow
                ? 'ON TRACK'
                : 'BEHIND';

        return {
            idealLine: ideal,
            actualLine: actual,
            currentTotal: visibleTotal,
            progressStatus: status,
        };
    }, [posts, externalPosts, yearlyTarget, period]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const statusColor = progressStatus === 'ON TRACK'
        ? 'var(--color-primary)'
        : progressStatus === 'BEHIND'
            ? '#802520'
            : 'var(--color-text-muted)';

    const colors = {
        text: isDark ? '#8A8A7A' : '#6B6B5A',
        grid: isDark ? '#2C2C2C' : '#E0D8CC',
        ideal: isDark ? '#3A3A32' : '#C8C0B0',
        actual: '#5C7F71',
        warning: '#802520',
    };

    const options: Highcharts.Options = {
        chart: {
            type: 'line',
            backgroundColor: 'transparent',
            height: 240,
            style: { fontFamily: 'Outfit, sans-serif' },
        },
        title: { text: undefined },
        credits: { enabled: false },
        xAxis: {
            categories: months,
            labels: { style: { color: colors.text, fontSize: '0.7rem' } },
            lineColor: colors.grid,
        },
        yAxis: {
            title: { text: undefined },
            labels: { style: { color: colors.text } },
            gridLineColor: colors.grid,
            max: yearlyTarget,
            min: 0,
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            itemStyle: { color: colors.text, fontSize: '0.75rem' },
        },
        plotOptions: {
            line: {
                marker: { enabled: true, radius: 3 },
            },
        },
        series: [
            {
                type: 'line',
                name: 'Ideal',
                data: idealLine,
                color: colors.ideal,
                dashStyle: 'Dash',
                lineWidth: 1.5,
                marker: { enabled: false },
            },
            {
                type: 'line',
                name: 'Actual',
                data: actualLine,
                color: progressStatus === 'BEHIND' ? colors.warning : colors.actual,
                lineWidth: 2.5,
                connectNulls: false,
            },
        ],
    };

    useEffect(() => {
        if (chartRef.current?.chart) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark, idealLine, actualLine, progressStatus]);

    const sourceLabel = externalState === 'loading'
        ? 'Local Markdown（外部記事を取得中）'
        : externalState === 'loaded'
            ? 'Local Markdown + External Posts API'
            : 'Local Markdown（外部記事を取得できませんでした）';

    return (
        <div>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '8px',
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                        Post Count
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        Target: {yearlyTarget} / yr
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        fontSize: '1.5rem', fontWeight: 900,
                        letterSpacing: '-0.04em', color: statusColor,
                        fontFamily: 'var(--font-sans)',
                    }}>
                        {currentTotal}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        posts
                    </span>
                    <span style={{
                        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase', padding: '2px 6px',
                        border: `1px solid ${statusColor}`,
                        color: statusColor,
                    }}>
                        {progressStatus}
                    </span>
                </div>
            </div>

            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />

            <div style={{
                marginTop: '4px', fontSize: '0.6rem', color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textAlign: 'right',
            }}>
                Source: {sourceLabel} / {period}年・本日まで
            </div>
        </div>
    );
}
