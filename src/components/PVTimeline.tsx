import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useTheme } from '../hooks/useTheme';

interface MonthlyPV {
    month: string; // "YYYYMM"
    pv: number;
}

interface PostMeta {
    title: string;
    date: string; // "YYYY-MM-DD"
}

interface Props {
    posts: PostMeta[];
}

/**
 * 過去6ヶ月のPVタイムラインと投稿イベントマーカーを表示するコンポーネント
 */
export default function PVTimeline({ posts }: Props) {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const isDark = useTheme();
    const [pvData, setPvData] = useState<MonthlyPV[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [source, setSource] = useState('');

    useEffect(() => {
        fetch('/api/pv/timeline')
            .then((res) => res.json())
            .then((json) => {
                setPvData(json.data || []);
                setSource(json.source || '');
            })
            .catch(() => setPvData([]))
            .finally(() => setIsLoading(false));
    }, []);

    const colors = {
        text: isDark ? '#8A8A7A' : '#6B6B5A',
        grid: isDark ? '#2C2C2C' : '#E0D8CC',
        line: isDark ? '#7aa090' : '#466557', // プロジェクトのプライマリカラーに統一
        fillStart: isDark ? 'rgba(122, 160, 144, 0.25)' : 'rgba(70, 101, 87, 0.15)',
        fillEnd: isDark ? 'rgba(122, 160, 144, 0)' : 'rgba(70, 101, 87, 0)',
        markerLine: isDark ? 'rgba(245, 237, 220, 0.2)' : 'rgba(24, 24, 24, 0.15)',
        markerText: isDark ? '#6B6B5A' : '#8A8A7A',
    };

    // YYYYMM → timestamp
    const seriesData = pvData.map((d) => {
        const y = parseInt(d.month.substring(0, 4), 10);
        const m = parseInt(d.month.substring(4, 6), 10);
        return [Date.UTC(y, m - 1, 1), d.pv];
    });

    // 過去6ヶ月の範囲に収まる投稿を plotLines に変換
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const plotLines = posts
        .filter((p) => new Date(p.date).getTime() >= sixMonthsAgo.getTime())
        .map((p) => ({
            value: new Date(p.date).getTime(),
            color: colors.markerLine,
            dashStyle: 'Dash',
            width: 1.5,
            label: {
                text: p.title.length > 12 ? p.title.substring(0, 12) + '...' : p.title,
                rotation: 270,
                align: 'right',
                y: 10,
                style: {
                    color: colors.markerText,
                    fontSize: '10px',
                    fontWeight: '500',
                },
            },
            zIndex: 3,
        }));

    const options: Highcharts.Options = {
        chart: { type: 'area', backgroundColor: 'transparent', height: 260 },
        title: { text: undefined },
        xAxis: {
            type: 'datetime',
            labels: {
                format: '{value:%Y/%m}',
                style: { color: colors.text },
            },
            lineColor: colors.grid,
            tickColor: colors.grid,
            plotLines: plotLines as unknown as Highcharts.XAxisPlotLinesOptions[], // FIXME: type workaround for TS
        },
        yAxis: {
            title: { text: undefined },
            labels: { style: { color: colors.text } },
            gridLineColor: colors.grid,
            min: 0,
        },
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: {
            xDateFormat: '%Y年%m月',
            valueSuffix: ' PV',
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
                marker: { enabled: true, radius: 4 },
                lineWidth: 2,
                lineColor: colors.line,
            },
        },
        series: [{ type: 'area', name: '月間PV', data: seriesData, color: colors.line }],
    };

    // テーマ変更時にチャート更新
    useEffect(() => {
        if (chartRef.current?.chart) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark]);

    if (isLoading) {
        return (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading timeline...</span>
            </div>
        );
    }

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
            {source && source !== 'ga4' && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '4px' }}>
                    Data source: {source}
                </div>
            )}
        </div>
    );
}
