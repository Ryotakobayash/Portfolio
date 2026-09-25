import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import { HighchartsReact, type HighchartsReactRefObject } from '../utils/highchartsReact';
import { useTheme } from '../hooks/useTheme';
import type { MonthlyPV, PvSource, TimelinePvResponse } from '../types/pv';

interface PostMeta {
    title: string;
    date: string;
}

interface Props {
    posts: PostMeta[];
}

/**
 * PV推移と投稿イベントを表示する。
 */
export default function PVTimeline({ posts }: Props) {
    const chartRef = useRef<HighchartsReactRefObject>(null);
    const isDark = useTheme();
    const [pvData, setPvData] = useState<MonthlyPV[]>([]);
    const [source, setSource] = useState<PvSource | 'loading'>('loading');
    const [periodDays, setPeriodDays] = useState(180);

    useEffect(() => {
        const controller = new AbortController();

        fetch('/api/pv/timeline', { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<TimelinePvResponse>;
            })
            .then((data) => {
                setPvData(Array.isArray(data.data) ? data.data : []);
                setSource(data.source || 'fallback');
                setPeriodDays(data.periodDays);
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setPvData([]);
                setSource('fallback');
            });

        return () => controller.abort();
    }, []);

    const colors = {
        text: isDark ? '#8A8A7A' : '#6B6B5A',
        grid: isDark ? '#2C2C2C' : '#E0D8CC',
        line: isDark ? '#7aa090' : '#466557',
        fillStart: isDark ? 'rgba(122, 160, 144, 0.25)' : 'rgba(70, 101, 87, 0.15)',
        fillEnd: isDark ? 'rgba(122, 160, 144, 0)' : 'rgba(70, 101, 87, 0)',
        markerLine: isDark ? 'rgba(245, 237, 220, 0.2)' : 'rgba(24,24,24,0.15)',
        markerText: isDark ? '#6B6B5A' : '#8A8A7A',
    };

    const seriesData = pvData.map((item) => {
        const year = Number.parseInt(item.month.substring(0, 4), 10);
        const month = Number.parseInt(item.month.substring(4, 6), 10);
        return [Date.UTC(year, month - 1, 1), item.pv];
    });

    const rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - (periodDays - 1));

    const plotLines = posts
        .filter((post) => new Date(post.date).getTime() >= rangeStart.getTime())
        .map((post) => ({
            value: new Date(post.date).getTime(),
            color: colors.markerLine,
            dashStyle: 'Dash',
            width: 1.5,
            label: {
                text: post.title.length > 12 ? `${post.title.substring(0, 12)}...` : post.title,
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

    const valueSuffix = source === 'dummy' ? ' DEMO' : ' PV';
    const options: Highcharts.Options = {
        chart: { type: 'area', backgroundColor: 'transparent', height: 260 },
        title: { text: undefined },
        xAxis: {
            type: 'datetime',
            labels: { format: '{value:%Y/%m}', style: { color: colors.text } },
            lineColor: colors.grid,
            tickColor: colors.grid,
            plotLines: plotLines as unknown as Highcharts.XAxisPlotLinesOptions[],
        },
        yAxis: {
            title: { text: undefined },
            labels: { style: { color: colors.text } },
            gridLineColor: colors.grid,
            min: 0,
        },
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: { xDateFormat: '%Y年%m月', valueSuffix },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [[0, colors.fillStart], [1, colors.fillEnd]],
                },
                marker: { enabled: true, radius: 4 },
                lineWidth: 2,
                lineColor: colors.line,
            },
        },
        series: [{
            type: 'area',
            name: source === 'dummy' ? '月間デモ値' : '月間PV',
            data: seriesData,
            color: colors.line,
        }],
    };

    useEffect(() => {
        if (chartRef.current?.chart) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark, pvData, source, periodDays]);

    if (source === 'loading') {
        return (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>PV推移を読み込み中...</span>
            </div>
        );
    }

    if (source === 'fallback') {
        return (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>PVデータを一時的に取得できません。</span>
            </div>
        );
    }

    if (pvData.length === 0) {
        return (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>過去{periodDays}日のPVデータはありません。</span>
            </div>
        );
    }

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '4px' }}>
                {source === 'ga4'
                    ? `Source: GA4 / サイト全体 / 過去${periodDays}日`
                    : `Source: Demo data / 過去${periodDays}日 / 実際のPVではありません`}
            </div>
        </div>
    );
}
