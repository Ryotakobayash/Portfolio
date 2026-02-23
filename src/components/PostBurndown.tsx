import { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface PostDate {
    slug: string;
    date: string; // "2026-01-15"
}

interface Props {
    posts: PostDate[];
    yearlyTarget: number;
    period: string; // "2026"
}

/**
 * 投稿バーンダウンチャート コンポーネント
 * 年間の投稿目標(理想線) vs 実績(実績線) を Highcharts で描画
 */
export default function PostBurndown({ posts, yearlyTarget, period }: Props) {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const [isDark, setIsDark] = useState(false);

    // ダークモード検知
    useEffect(() => {
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            setIsDark(theme === 'dark');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, []);

    // 対象年の記事をフィルタし、月別累積を計算
    const { idealLine, actualLine, currentTotal, isOnTrack } = useMemo(() => {
        const year = parseInt(period);
        const yearPosts = posts.filter((p) => p.date.startsWith(period));

        // 月別カウント
        const monthlyCounts = new Array(12).fill(0);
        for (const post of yearPosts) {
            const month = parseInt(post.date.slice(5, 7)) - 1; // 0-indexed
            monthlyCounts[month]++;
        }

        // 累積
        const actual: (number | null)[] = [];
        let cumulative = 0;
        const now = new Date();
        const currentMonth = now.getFullYear() === year ? now.getMonth() : 11;

        for (let i = 0; i < 12; i++) {
            cumulative += monthlyCounts[i];
            if (i <= currentMonth) {
                actual.push(cumulative);
            } else {
                actual.push(null); // 未来月はnull
            }
        }

        // 理想線: 毎月 target/12 ずつ増える
        const monthlyTarget = yearlyTarget / 12;
        const ideal = Array.from({ length: 12 }, (_, i) =>
            Math.round(monthlyTarget * (i + 1) * 10) / 10,
        );

        const total = cumulative;
        const expectedByNow = Math.round(monthlyTarget * (currentMonth + 1) * 10) / 10;
        const onTrack = total >= expectedByNow;

        return { idealLine: ideal, actualLine: actual, currentTotal: total, isOnTrack: onTrack };
    }, [posts, yearlyTarget, period]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
                color: isOnTrack ? colors.actual : colors.warning,
                lineWidth: 2.5,
                connectNulls: false,
            },
        ],
    };

    // テーマ変更時にチャート更新
    useEffect(() => {
        if (chartRef.current?.chart) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark]);

    return (
        <div>
            {/* ヘッダー */}
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
                        letterSpacing: '-0.04em',
                        color: isOnTrack ? 'var(--color-primary)' : '#802520',
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
                        border: `1px solid ${isOnTrack ? 'var(--color-primary)' : '#802520'}`,
                        color: isOnTrack ? 'var(--color-primary)' : '#802520',
                    }}>
                        {isOnTrack ? 'ON TRACK' : 'BEHIND'}
                    </span>
                </div>
            </div>

            {/* チャート */}
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
        </div>
    );
}
