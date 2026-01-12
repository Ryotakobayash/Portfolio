'use client';

import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMantineColorScheme, useMantineTheme, Skeleton, Text } from '@mantine/core';

interface PVData {
    date: string;
    pv: number;
}

interface PVResponse {
    data: PVData[];
    totalPV: number;
    source: 'ga4' | 'cache' | 'dummy' | 'fallback';
    error?: string;
}

/**
 * PV数推移グラフコンポーネント
 * - Highchartsを使用したエリアチャート
 * - /api/pvからデータ取得
 * - ダークモード対応
 */
export function PVChart() {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    const isDark = colorScheme === 'dark';

    const [pvData, setPvData] = useState<PVData[]>([]);
    const [totalPV, setTotalPV] = useState<number>(0);
    const [source, setSource] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // APIからPVデータを取得
    useEffect(() => {
        async function fetchPVData() {
            try {
                const res = await fetch('/api/pv');
                if (!res.ok) throw new Error('Failed to fetch PV data');

                const json: PVResponse = await res.json();
                setPvData(json.data);
                setTotalPV(json.totalPV);
                setSource(json.source);
                if (json.error) setError(json.error);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                // フォールバックデータ
                setPvData([
                    { date: '12/29', pv: 120 },
                    { date: '12/30', pv: 145 },
                    { date: '12/31', pv: 98 },
                    { date: '01/01', pv: 210 },
                    { date: '01/02', pv: 178 },
                    { date: '01/03', pv: 156 },
                    { date: '01/04', pv: 189 },
                ]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPVData();
    }, []);

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
            categories: pvData.map(d => d.date),
            labels: {
                style: {
                    color: isDark ? '#c1c2c5' : '#495057',
                },
            },
            lineColor: isDark ? '#373A40' : '#dee2e6',
        },
        yAxis: {
            title: {
                text: undefined,
            },
            labels: {
                style: {
                    color: isDark ? '#c1c2c5' : '#495057',
                },
            },
            gridLineColor: isDark ? '#373A40' : '#dee2e6',
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
                        [0, isDark ? 'rgba(34, 184, 207, 0.5)' : 'rgba(34, 139, 230, 0.5)'],
                        [1, isDark ? 'rgba(34, 184, 207, 0)' : 'rgba(34, 139, 230, 0)'],
                    ],
                },
                marker: {
                    enabled: false,
                },
                lineWidth: 2,
                lineColor: isDark ? theme.colors.cyan[5] : theme.colors.blue[5],
            },
        },
        series: [
            {
                type: 'area',
                name: 'PV',
                data: pvData.map(d => d.pv),
            },
        ],
    };

    // カラースキーム変更時にチャートを更新
    useEffect(() => {
        if (chartRef.current?.chart && pvData.length > 0) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [colorScheme, pvData]);

    if (isLoading) {
        return <Skeleton height={200} />;
    }

    return (
        <div>
            <Text size="xl" fw={700} c="cyan" mb="xs">
                {totalPV.toLocaleString()} views
                <Text span size="sm" c="dimmed" ml="xs">
                    (過去7日間)
                </Text>
            </Text>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                ref={chartRef}
            />
            {source && source !== 'ga4' && (
                <Text size="xs" c="dimmed" ta="right" mt="xs">
                    Data source: {source}
                </Text>
            )}
        </div>
    );
}
