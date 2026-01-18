import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface PVData {
    date: string;
    pv: number;
}

// ダミーデータ（現在日付ベースで生成）
function generateDummyData(): PVData[] {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
            date: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
            pv: Math.floor(Math.random() * 150) + 80,
        };
    });
}

/**
 * PV数推移グラフコンポーネント
 * - Highchartsを使用したエリアチャート
 * - client:only="react" で完全クライアントサイドレンダリング
 * - ダークモード対応（CSS変数ベース）
 */
export function PVChart() {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const [isDark, setIsDark] = useState(false);
    const [pvData] = useState<PVData[]>(() => generateDummyData());
    const totalPV = pvData.reduce((sum, d) => sum + d.pv, 0);

    // ダークモード検知
    useEffect(() => {
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            setIsDark(theme === 'dark');
        };

        checkTheme();

        // MutationObserverでdata-theme変更を監視
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        return () => observer.disconnect();
    }, []);

    // チャートカラー設定
    const colors = {
        text: isDark ? '#c1c2c5' : '#495057',
        grid: isDark ? '#373A40' : '#dee2e6',
        line: isDark ? '#22b8cf' : '#228be6',
        fillStart: isDark ? 'rgba(34, 184, 207, 0.5)' : 'rgba(34, 139, 230, 0.5)',
        fillEnd: isDark ? 'rgba(34, 184, 207, 0)' : 'rgba(34, 139, 230, 0)',
    };

    const options: Highcharts.Options = {
        chart: {
            type: 'area',
            backgroundColor: 'transparent',
            height: 200,
        },
        title: {
            text: undefined,
        },
        xAxis: {
            categories: pvData.map((d) => d.date),
            labels: {
                style: {
                    color: colors.text,
                },
            },
            lineColor: colors.grid,
        },
        yAxis: {
            title: {
                text: undefined,
            },
            labels: {
                style: {
                    color: colors.text,
                },
            },
            gridLineColor: colors.grid,
        },
        legend: {
            enabled: false,
        },
        credits: {
            enabled: false,
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, colors.fillStart],
                        [1, colors.fillEnd],
                    ],
                },
                marker: {
                    enabled: false,
                },
                lineWidth: 2,
                lineColor: colors.line,
            },
        },
        series: [
            {
                type: 'area',
                name: 'PV',
                data: pvData.map((d) => d.pv),
            },
        ],
    };

    // カラースキーム変更時にチャートを更新
    useEffect(() => {
        if (chartRef.current?.chart && pvData.length > 0) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark, pvData]);

    return (
        <div>
            <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    {totalPV.toLocaleString()} views
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                    (過去7日間)
                </span>
            </div>
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '8px' }}>
                Data source: demo
            </div>
        </div>
    );
}

export default PVChart;
