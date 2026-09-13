import { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import { HighchartsReact, type HighchartsReactRefObject } from '../utils/highchartsReact';
import { useTheme } from '../hooks/useTheme';
import { buildGenreData, getUsedTags, getTagColor } from '../utils/treemapUtils';
import type { PostData } from '../utils/treemapUtils';



interface Props {
    posts: PostData[];
}

export default function ArticleTreemap({ posts }: Props) {
    const chartRef = useRef<HighchartsReactRefObject>(null);
    const isDark = useTheme();
    const [treemapReady, setTreemapReady] = useState(false);
    const [pvMap, setPvMap] = useState<Record<string, number>>({});
    const [totalPV, setTotalPV] = useState<number>(0);
    const [source, setSource] = useState<string>('Local Files');

    // 合計文字数の計算
    const totalWords = useMemo(() => {
        return posts.reduce((acc, post) => acc + (post.wordCount || 0), 0);
    }, [posts]);

    // PV データを API Route から非同期フェッチ
    useEffect(() => {
        let isMounted = true;
        fetch('/api/pv/treemap')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (!isMounted) return;
                if (data.pvMap) setPvMap(data.pvMap);
                if (data.totalPV != null) setTotalPV(data.totalPV);
                if (data.source === 'ga4') setSource('Google Analytics 4');
                else if (data.source === 'dummy') setSource('Local Files (Estimated PV)');
            })
            .catch((err) => {
                console.warn('Failed to fetch PV data for Treemap:', err);
            });
        return () => {
            isMounted = false;
        };
    }, []);

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

    // Treemap データ生成（ジャンル→階層構造、PV数に応じた色の濃度変調）
    const treemapData = useMemo(() => {
        return buildGenreData(posts, pvMap);
    }, [posts, pvMap]);

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
                    const pvText = point.pv != null ? `${point.pv.toLocaleString()} PV` : '---';
                    return `
                        <div style="padding:6px 10px; font-size:12px; line-height:1.5;">
                            <b style="font-size:13px;">${point.name}</b><br/>
                            <div style="margin-top:4px; display:flex; flex-direction:column; gap:2px;">
                                <span style="color:${textColor}">Words (Area): <b>${point.value.toLocaleString()}</b></span>
                                <span style="color:${textColor}">Views (Color): <b>${pvText}</b></span>
                                <span style="color:${textColor}; font-size:11px; opacity:0.8;">Category: ${point.primaryTag || ''}</span>
                            </div>
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
    }, [treemapData, isDark]);

    // テーマ変更時・データ変更時にチャート更新
    useEffect(() => {
        if (chartRef.current?.chart && treemapData.length > 0) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark, treemapData, options]);

    if (!treemapReady) {
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
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>※ ブロック面積 = 文字数 / 色の濃度 = PV数</span>
                    {totalWords > 0 && (
                        <span>Total: {totalWords.toLocaleString()} Words{totalPV > 0 ? ` / ${totalPV.toLocaleString()} PV` : ''}</span>
                    )}
                </div>
            </div>

            {/* Data Source */}
            <div style={{
                marginTop: '12px', fontSize: '0.6rem', color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textAlign: 'right'
            }}>
                Source: {source}
            </div>
        </div>
    );
}
