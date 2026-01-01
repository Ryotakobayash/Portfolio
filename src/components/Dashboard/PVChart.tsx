'use client';

import { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useMantineColorScheme, useMantineTheme } from '@mantine/core';

/**
 * PV数推移グラフコンポーネント（ダミーデータ）
 * - Highchartsを使用したエリアチャート
 * - ダークモード対応
 */
export function PVChart() {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();
    const isDark = colorScheme === 'dark';

    // ダミーデータ（過去7日間のPV数）
    const dummyData = [
        { date: '12/25', pv: 120 },
        { date: '12/26', pv: 145 },
        { date: '12/27', pv: 132 },
        { date: '12/28', pv: 189 },
        { date: '12/29', pv: 201 },
        { date: '12/30', pv: 178 },
        { date: '12/31', pv: 245 },
    ];

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
            categories: dummyData.map(d => d.date),
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
                data: dummyData.map(d => d.pv),
            },
        ],
    };

    // カラースキーム変更時にチャートを更新
    useEffect(() => {
        if (chartRef.current?.chart) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [colorScheme]);

    return (
        <HighchartsReact
            highcharts={Highcharts}
            options={options}
            ref={chartRef}
        />
    );
}
