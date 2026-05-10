import { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useTheme } from '../hooks/useTheme';
import { useFetchPV } from '../hooks/useFetchPV';
import { buildGenreData, getUsedTags, getTagColor } from '../utils/treemapUtils';
import type { PostData } from '../utils/treemapUtils';



interface Props {
    posts: PostData[];
}

export default function ArticleTreemap({ posts }: Props) {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const isDark = useTheme();
    const { pvMap, totalPV, isLoading } = useFetchPV();
    const [treemapReady, setTreemapReady] = useState(false);

    // 合計文字数の計算
    const totalWords = useMemo(() => {
        return posts.reduce((acc, post) => acc + (post.wordCount || 0), 0);
    }, [posts]);

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

    // Treemap データ生成（ジャンル→階層構造）
    const treemapData = useMemo(() => {
        return buildGenreData(posts);
    }, [posts]);

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
            title: { text: undefined },
            credits: { enabled: false },
            tooltip: {
                useHTML: true,
                formatter: function (this: Highcharts.Point): string {
                    const point = this as any;
                    return `
                        <div style="padding:4px 8px">
                            <b>${point.name}</b><br/>
                            <span style="color:${textColor}">Words (Area): ${point.value.toLocaleString()}</span><br/>
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
                levels: [{
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
                }],
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
    }, [treemapData, pvMap, isDark]);

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
            {/* Treemap */}
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />

            {/* 凡例 */}
            <div className="flex text-sm text-muted gap-sm mt-md" style={{ flexWrap: 'wrap' }}>
                {getUsedTags(posts).map((tag) => (
                    <span key={tag} className="flex items-center gap-xs" style={{ gap: '5px' }}>
                        <span style={{
                            width: '8px', height: '8px',
                            backgroundColor: getTagColor(tag), display: 'inline-block',
                            flexShrink: 0,
                        }} />
                        {tag}
                    </span>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span>※ ブロック面積 = 文字数</span>
                    {totalWords > 0 && (
                        <span>Total: {totalWords.toLocaleString()} Words</span>
                    )}
                </div>
            </div>
        </div>
    );
}
