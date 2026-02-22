import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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
    const [isDark, setIsDark] = useState(false);
    const [pvData, setPvData] = useState<MonthlyPV[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [source, setSource] = useState('');

    useEffect(() => {
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            setIsDark(theme === 'dark');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

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
        text: isDark ? '#c1c2c5' : '#495057',
        grid: isDark ? '#373A40' : '#dee2e6',
        line: isDark ? '#22b8cf' : '#228be6',
        fillStart: isDark ? 'rgba(34, 184, 207, 0.4)' : 'rgba(34, 139, 230, 0.4)',
        fillEnd: isDark ? 'rgba(34, 184, 207, 0)' : 'rgba(34, 139, 230, 0)',
        markerLine: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
        markerText: isDark ? '#868e96' : '#868e96',
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
        series: [{ type: 'area', name: '月間PV', data: seriesData }],
    };

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
