import { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import { HighchartsReact, type HighchartsReactRefObject } from '../utils/highchartsReact';
import { useTheme } from '../hooks/useTheme';
import { buildGenreData, buildPVData, getUsedTags, getTagColor } from '../utils/treemapUtils';
import type { PostData } from '../utils/treemapUtils';
import type { PvSource, TreemapPvResponse } from '../types/pv';

type ViewMode = 'genre' | 'pv';

interface Props {
    posts: PostData[];
}

export default function ArticleTreemap({ posts }: Props) {
    const chartRef = useRef<HighchartsReactRefObject>(null);
    const isDark = useTheme();
    const [viewMode, setViewMode] = useState<ViewMode>('genre');
    const [treemapReady, setTreemapReady] = useState(false);
    const [pvMap, setPvMap] = useState<Record<string, number>>({});
    const [totalPV, setTotalPV] = useState<number>(0);
    const [pvSource, setPvSource] = useState<PvSource | 'loading'>('loading');
    const [periodDays, setPeriodDays] = useState(365);

    // 合計文字数の計算
    const totalCharacters = useMemo(() => {
        return posts.reduce((acc, post) => acc + (post.wordCount || 0), 0);
    }, [posts]);

    // PVデータを取得し、実測・デモ・障害を明確に分ける
    useEffect(() => {
        const controller = new AbortController();

        fetch('/api/pv/treemap', { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<TreemapPvResponse>;
            })
            .then((data) => {
                setPeriodDays(data.periodDays);
                setPvSource(data.source);
                if (data.source === 'ga4') {
                    setPvMap(data.pvMap || {});
                    setTotalPV(typeof data.totalPV === 'number' ? data.totalPV : 0);
                } else if (data.source === 'dummy') {
                    setPvMap(data.pvMap || {});
                    setTotalPV(0);
                } else {
                    setPvMap({});
                    setTotalPV(0);
                }
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setPvMap({});
                setTotalPV(0);
                setPvSource('fallback');
            });

        return () => controller.abort();
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

    // Treemap データ生成（ジャンル→階層構造、PV→フラット構造）
    const treemapData = useMemo(() => {
        if (viewMode === 'pv') {
            return buildPVData(posts, pvMap);
        }
        return buildGenreData(posts, pvMap);
    }, [posts, pvMap, viewMode]);

    // チャートオプション
    const options: Highcharts.Options = useMemo(() => {
        const textColor = isDark ? '#c1c2c5' : '#495057';
        const pvUnit = pvSource === 'dummy' ? 'DEMO' : 'PV';
        const valueLabel = pvSource === 'dummy' ? 'Demo value' : 'Views';

        return {
            chart: {
                type: 'treemap',
                backgroundColor: 'transparent',
                height: 380,
                spacingBottom: viewMode === 'pv' ? 24 : 10,
                style: { fontFamily: 'Outfit, "Noto Sans JP", sans-serif' },
            },
            title: { text: undefined },
            credits: { enabled: false },
            ...(viewMode === 'pv' ? {
                colorAxis: {
                    min: 0,
                    minColor: isDark ? '#1C2621' : '#E8E2D2',
                    maxColor: isDark ? '#6BBF96' : '#2D5040',
                    labels: {
                        style: {
                            color: textColor,
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono, monospace)',
                        },
                        formatter: function() {
                            return `${this.value} ${pvUnit}`;
                        }
                    }
                },
                legend: {
                    enabled: true,
                    align: 'right',
                    verticalAlign: 'bottom',
                    layout: 'horizontal',
                    floating: false,
                    symbolWidth: 160,
                    symbolHeight: 8,
                    margin: 12,
                    itemStyle: {
                        color: textColor,
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono, monospace)',
                    }
                }
            } : {
                legend: { enabled: false }
            }),
            tooltip: {
                useHTML: true,
                formatter: function (this: Highcharts.Point): string {
                    const point = this as any;
                    const pvText = point.pv != null && point.pv > 0 ? `${point.pv.toLocaleString()} ${pvUnit}` : (point.pv === 0 ? `0 ${pvUnit}` : '---');
                    return `
                        <div style="padding:6px 10px; font-size:12px; line-height:1.5;">
                            <b style="font-size:13px;">${point.name}</b><br/>
                            <div style="margin-top:4px; display:flex; flex-direction:column; gap:2px;">
                                <span style="color:${textColor}">Characters (Area): <b>${point.value.toLocaleString()}</b></span>
                                <span style="color:${textColor}">${valueLabel}${viewMode === 'pv' ? ' (Color)' : ''}: <b>${pvText}</b></span>
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
                ...(viewMode === 'pv' ? { colorKey: 'colorValue' } : {}),
                data: treemapData,
                dataLabels: {
                    enabled: true,
                    style: {
                        color: isDark ? '#F5EDDC' : (viewMode === 'pv' ? '#1B2A22' : '#F5EDDC'),
                        fontSize: '11px',
                        fontWeight: '600',
                        textOutline: isDark
                            ? '1px rgba(0, 0, 0, 0.6)'
                            : (viewMode === 'pv' ? '1px rgba(255, 255, 255, 0.8)' : '1px rgba(0, 0, 0, 0.4)'),
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
    }, [treemapData, isDark, viewMode, pvSource]);

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
            {/* ビュー切替セグメンテッドコントロール */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    color: 'var(--color-text-muted)',
                }}>
                    COLOR: {viewMode === 'genre' ? 'GENRE (CATEGORICAL)' : 'PAGE VIEWS (SEQUENTIAL)'}
                </div>

                <div
                    role="tablist"
                    aria-label="Treemap View Mode"
                    style={{
                        display: 'inline-flex',
                        padding: '2px',
                        backgroundColor: 'var(--color-bg-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm, 4px)',
                        gap: '2px',
                    }}
                >
                    <button
                        type="button"
                        role="tab"
                        aria-selected={viewMode === 'genre'}
                        onClick={() => setViewMode('genre')}
                        style={{
                            padding: '4px 14px',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            border: 'none',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'genre' ? 'var(--color-primary)' : 'transparent',
                            color: viewMode === 'genre' ? 'var(--color-bg)' : 'var(--color-text-muted)',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        Genre
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={viewMode === 'pv'}
                        onClick={() => setViewMode('pv')}
                        style={{
                            padding: '4px 14px',
                            fontSize: '0.72rem',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            border: 'none',
                            borderRadius: '2px',
                            cursor: 'pointer',
                            backgroundColor: viewMode === 'pv' ? 'var(--color-primary)' : 'transparent',
                            color: viewMode === 'pv' ? 'var(--color-bg)' : 'var(--color-text-muted)',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        {pvSource === 'dummy' ? 'Page Views (Demo)' : 'Page Views'}
                    </button>
                </div>
            </div>

            {/* Treemap (keyにviewModeとisDarkを指定して切替時に確実に再描画) */}
            <HighchartsReact key={`${viewMode}-${isDark ? 'dark' : 'light'}`} highcharts={Highcharts} options={options} ref={chartRef} />

            {/* 凡例 */}
            <div className="flex text-sm text-muted gap-sm mt-md" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
                {viewMode === 'genre' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                    </div>
                )}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>
                        {viewMode === 'genre'
                            ? '※ ブロック面積 = 文字数'
                            : pvSource === 'dummy'
                                ? '※ ブロック面積 = 文字数 / 色 = デモ値（実際のPVではありません）'
                                : '※ ブロック面積 = 文字数 / 色 = 閲覧数 (PV)'}
                    </span>
                    {totalCharacters > 0 && (
                        <span>
                            Total: {totalCharacters.toLocaleString()} Characters
                            {viewMode === 'pv' && totalPV > 0 ? ` / ${totalPV.toLocaleString()} PV` : ''}
                        </span>
                    )}
                </div>
            </div>

            {/* Data Source */}
            <div style={{
                marginTop: '12px', fontSize: '0.6rem', color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textAlign: 'right'
            }}>
                Source: {viewMode === 'genre'
                    ? 'Local Files'
                    : pvSource === 'ga4'
                        ? `GA4 / 公開記事 / 過去${periodDays}日`
                        : pvSource === 'dummy'
                            ? `Demo data / 過去${periodDays}日 / 実際のPVではありません`
                            : pvSource === 'fallback'
                                ? 'PVデータを一時的に取得できません'
                                : 'PVデータを読み込み中'}
            </div>
        </div>
    );
}
