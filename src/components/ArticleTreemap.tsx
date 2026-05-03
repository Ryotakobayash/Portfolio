import { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useTheme } from '../hooks/useTheme';
import { useFetchPV } from '../hooks/useFetchPV';
import { buildTagGroupData, buildPvFlatData } from '../utils/treemapUtils';
import type { PostData } from '../utils/treemapUtils';

type ViewMode = 'genre' | 'pv';

const VIEW_LABELS: Record<ViewMode, string> = {
    genre: 'ジャンルで見る',
    pv: '閲覧数で見る',
};

interface Props {
    posts: PostData[];
}

export default function ArticleTreemap({ posts }: Props) {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const isDark = useTheme();
    const { pvMap, totalPV, isLoading } = useFetchPV();
    const [viewMode, setViewMode] = useState<ViewMode>('genre');
    const [treemapReady, setTreemapReady] = useState(false);

    // Highcharts Treemap / Heatmap モジュールを動的にロード
    useEffect(() => {
        Promise.all([
            import('highcharts/modules/heatmap'),
            import('highcharts/modules/treemap')
        ]).then(([heatmapMod, treemapMod]) => {
            const initHeatmap = (heatmapMod as any).default || heatmapMod;
            const initTreemap = (treemapMod as any).default || treemapMod;
            if (typeof initHeatmap === 'function') initHeatmap(Highcharts);
            if (typeof initTreemap === 'function') initTreemap(Highcharts);
            setTreemapReady(true);
        }).catch(() => {
            setTreemapReady(true);
        });
    }, []);

    // Treemap データ生成
    const treemapData = useMemo(() => {
        if (viewMode === 'pv') {
            // PVモードはフラット構造（colorAxis sequentialが機能するのはparent/childなしの場合のみ）
            return buildPvFlatData(posts, pvMap);
        }
        // ジャンルモードはタグごとの階層構造
        return buildTagGroupData(posts, pvMap, viewMode);
    }, [posts, pvMap, viewMode]);

    // チャートオプション
    const options: Highcharts.Options = useMemo(() => {
        const textColor = isDark ? '#c1c2c5' : '#495057';

        return {
            chart: {
                type: 'treemap',
                backgroundColor: 'transparent',
                height: 380,
                style: { fontFamily: 'Outfit, "Noto Sans JP", sans-serif' },
            },
            ...(viewMode === 'pv' ? {
                colorAxis: {
                    minColor: isDark ? '#1f1f1f' : '#ede5ce',
                    maxColor: isDark ? '#7aa090' : '#466557',
                }
            } : {}),
            title: { text: undefined },
            credits: { enabled: false },
            tooltip: {
                useHTML: true,
                formatter: function (this: Highcharts.Point): string {
                    const point = this as any;
                    const pv = pvMap[point.slug] || 0;
                    return `
                        <div style="padding:4px 8px">
                            <b>${point.name}</b><br/>
                            <span style="color:${textColor}">PV: ${pv.toLocaleString()}</span><br/>
                            <span style="color:${textColor}">${point.primaryTag || ''}</span>
                        </div>
                    `;
                },
            },
            series: [{
                type: 'treemap',
                layoutAlgorithm: 'squarified',
                allowDrillToNode: false,
                animationLimit: 1000,
                colorKey: 'colorValue', // colorAxisのグラデーション対象を明示
                data: treemapData,
                dataLabels: {
                    enabled: true,
                    style: {
                        color: '#F5EDDC',
                        fontSize: '11px',
                        fontWeight: '600',
                        textOutline: 'none',
                        letterSpacing: '0.02em',
                    },
                },
                levels: viewMode === 'genre' ? [{
                    level: 1,
                    dataLabels: {
                        enabled: true,
                        align: 'left',
                        verticalAlign: 'top',
                        style: {
                            fontSize: '11px',
                            fontWeight: '700',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        },
                    },
                    borderWidth: 1,
                    borderColor: isDark ? '#2A2A2A' : '#C8BAA0',
                }] : [],
            }],
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                const slug = (this as any).slug;
                                if (slug) {
                                    window.location.href = `/posts/${slug}`;
                                }
                            }
                        }
                    }
                }
            }
        };
    }, [treemapData, pvMap, isDark, viewMode]);

    // テーマ変更時・データ変更時にチャート更新
    useEffect(() => {
        if (chartRef.current?.chart && treemapData.length > 0) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark, treemapData, options]);

    if (isLoading || !treemapReady) {
        return (
            <div className="pt-md">
                <div className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-md)' }} />
            </div>
        );
    }

    return (
        <div>
            {/* ビュー切替 */}
            <div className="flex mb-md" style={{
                gap: '2px', background: 'var(--color-border)', padding: '1px',
            }}>
                {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        style={{
                            flex: 1, padding: '6px 10px',
                            fontSize: '0.65rem', fontWeight: 700,
                            border: 'none',
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            cursor: 'pointer',
                            backgroundColor: viewMode === mode ? 'var(--color-primary)' : 'var(--color-bg-card)',
                            color: viewMode === mode ? 'var(--color-bg)' : 'var(--color-text-muted)',
                            transition: 'all 150ms ease',
                        }}
                    >
                        {VIEW_LABELS[mode]}
                    </button>
                ))}
            </div>

            {/* Treemap (keyにviewModeを指定して、モード切替時に確実な再描画を行う) */}
            <HighchartsReact key={viewMode} highcharts={Highcharts} options={options} ref={chartRef} />

            {/* 凡例（colorAxisが自動で描画するためタグ色の凡例は削除） */}
            {totalPV > 0 && (
                <div className="flex text-sm text-muted mt-md">
                    <span style={{ marginLeft: 'auto' }}>
                        Total: {totalPV.toLocaleString()} PV
                    </span>
                </div>
            )}
        </div>
    );
}
