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

    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    const colors = {
        text: isDark ? '#c1c2c5' : '#495057',
        grid: isDark ? '#373A40' : '#dee2e6',
        ideal: isDark ? '#555' : '#adb5bd',
        actual: isDark ? '#22b8cf' : '#228be6',
        warning: '#FA5252',
    };

    const options: Highcharts.Options = {
        chart: {
            type: 'line',
            backgroundColor: 'transparent',
            height: 240,
            style: { fontFamily: 'Inter, "Noto Sans JP", sans-serif' },
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
                name: '理想',
                data: idealLine,
                color: colors.ideal,
                dashStyle: 'Dash',
                lineWidth: 1.5,
                marker: { enabled: false },
            },
            {
                type: 'line',
                name: '実績',
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
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        📝 投稿数
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                        目標: {yearlyTarget}本/年
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        fontSize: '1.25rem', fontWeight: 700,
                        color: isOnTrack ? 'var(--color-accent)' : '#FA5252',
                    }}>
                        {currentTotal}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        本
                    </span>
                    <span style={{ fontSize: '0.85rem' }}>
                        {isOnTrack ? '✅' : '⚠️'}
                    </span>
                </div>
            </div>

            {/* チャート */}
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
        </div>
    );
}
