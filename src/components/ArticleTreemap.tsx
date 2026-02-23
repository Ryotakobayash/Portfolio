import { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';


/** 記事データ（Astroから渡される） */
interface PostData {
    slug: string;
    title: string;
    tags: string[];
    wordCount: number;
    date: string;
}

/** ビュー切替の種類 */
type ViewMode = 'pv' | 'wordCount' | 'timeline';

const VIEW_LABELS: Record<ViewMode, string> = {
    pv: 'PV × ジャンル',
    wordCount: '文字数 × ジャンル',
    timeline: '時系列 × ジャンル',
};

/** タグ→色のパレット — レトロフューチャー設計システム準拠 */
const TAG_COLORS: Record<string, string> = {
    // 日本語タグ
    'デザイン': '#7B5E52', // テラコッタ茶
    'デザインシステム': '#5C7F71', // プライマリグリーン
    'ガジェット': '#4A7A8A', // スレートティール
    'イベント': '#A03030', // アクセントレッド
    'ハッカソン': '#C07050', // アクセントオレンジ
    '大学生活': '#7A5C8A', // ダスティパープル
    '学習法': '#5C7F71', // プライマリグリーン
    '就活': '#C99040', // アクセントアンバー
    'PC環境': '#4A7A8A', // スレートティール
    // 英語タグ
    'Hugo': '#8A6A3A', // ウォームブラウン
    'HTML/CSS': '#4A7A8A', // スレートティール
    'Figma': '#7A5C8A', // ダスティパープル
    'NUTMEG': '#5C7F71', // プライマリグリーン
    // 汎用フォールバック
    'Design': '#7B5E52',
    'Tech': '#4A7A8A',
    'Blog': '#8A6A3A',
};

const DEFAULT_COLOR = '#6B6050'; // muted border tone


function getTagColor(tag: string): string {
    // 完全一致を優先
    if (TAG_COLORS[tag]) return TAG_COLORS[tag];
    // 部分一致でもマッチさせる
    for (const [key, color] of Object.entries(TAG_COLORS)) {
        if (tag.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return DEFAULT_COLOR;
}

interface Props {
    posts: PostData[];
}

export default function ArticleTreemap({ posts }: Props) {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const [isDark, setIsDark] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('pv');
    const [pvMap, setPvMap] = useState<Record<string, number>>({});
    const [totalPV, setTotalPV] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [treemapReady, setTreemapReady] = useState(false);

    // Highcharts Treemap モジュールを動的にロード
    useEffect(() => {
        import('highcharts/modules/treemap').then((mod) => {
            const init = (mod as any).default || mod;
            if (typeof init === 'function') {
                init(Highcharts);
            }
            setTreemapReady(true);
        }).catch(() => {
            setTreemapReady(true);
        });
    }, []);

    // ダークモード検知
    useEffect(() => {
        const checkTheme = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            setIsDark(theme === 'dark');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, []);

    // PVデータ取得
    useEffect(() => {
        fetch('/api/pv/treemap')
            .then((res) => res.json())
            .then((json) => {
                setPvMap(json.pvMap || {});
                setTotalPV(json.totalPV || 0);
            })
            .catch(() => setPvMap({}))
            .finally(() => setIsLoading(false));
    }, []);

    // Treemap データ生成
    const treemapData = useMemo(() => {
        if (viewMode === 'timeline') {
            return buildTimelineData(posts, pvMap);
        }
        return buildFlatData(posts, pvMap, viewMode);
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
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            const slug = (this as any).slug;
                            if (slug) {
                                window.location.href = `/posts/${slug}`;
                            }
                        },
                    },
                },
            }],
        };
    }, [treemapData, pvMap, isDark]);

    // テーマ変更時にチャート更新
    useEffect(() => {
        if (chartRef.current?.chart && treemapData.length > 0) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark]);

    if (isLoading || !treemapReady) {
        return (
            <div style={{ padding: '20px' }}>
                <div style={{
                    height: '380px', borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, var(--color-border) 50%, var(--color-bg-secondary) 75%)',
                    backgroundSize: '200% 100%', animation: 'skeleton-loading 1.5s infinite',
                }} />
            </div>
        );
    }

    return (
        <div>
            {/* ビュー切替 */}
            <div style={{
                display: 'flex', gap: '2px', marginBottom: '16px',
                background: 'var(--color-border)', padding: '1px',
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

            {/* Treemap */}
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />

            {/* 凡例 */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px',
                marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)',
            }}>
                {getUsedTags(posts).map((tag) => (
                    <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{
                            width: '8px', height: '8px',
                            backgroundColor: getTagColor(tag), display: 'inline-block',
                            flexShrink: 0,
                        }} />
                        {tag}
                    </span>
                ))}
                {totalPV > 0 && (
                    <span style={{ marginLeft: 'auto' }}>
                        Total: {totalPV.toLocaleString()} PV
                    </span>
                )}
            </div>
        </div>
    );
}

/** PV or 文字数 ベースのフラットデータ */
function buildFlatData(
    posts: PostData[],
    pvMap: Record<string, number>,
    mode: 'pv' | 'wordCount',
): any[] {
    return posts.map((post) => {
        const primaryTag = post.tags[0] || 'Other';
        const value = mode === 'pv'
            ? (pvMap[post.slug] || 1)
            : (post.wordCount || 100);

        return {
            name: post.title,
            value,
            color: getTagColor(primaryTag),
            slug: post.slug,
            primaryTag,
        };
    });
}

/** 時系列グルーピングのデータ */
function buildTimelineData(
    posts: PostData[],
    pvMap: Record<string, number>,
): any[] {
    // 年月でグルーピングし、parent-child 構造にする
    const groups: Record<string, PostData[]> = {};
    for (const post of posts) {
        const ym = post.date.slice(0, 7); // "2024-06"
        if (!groups[ym]) groups[ym] = [];
        groups[ym].push(post);
    }

    const data: any[] = [];

    // 親ノード（年月）
    for (const ym of Object.keys(groups).sort()) {
        data.push({
            id: ym,
            name: ym,
            color: 'transparent',
        });
    }

    // 子ノード（記事）
    for (const [ym, groupPosts] of Object.entries(groups)) {
        for (const post of groupPosts) {
            const primaryTag = post.tags[0] || 'Other';
            data.push({
                name: post.title,
                parent: ym,
                value: pvMap[post.slug] || 1,
                color: getTagColor(primaryTag),
                slug: post.slug,
                primaryTag,
            });
        }
    }

    return data;
}

/** 使用されているタグ一覧を取得 */
function getUsedTags(posts: PostData[]): string[] {
    const tags = new Set<string>();
    for (const post of posts) {
        if (post.tags[0]) tags.add(post.tags[0]);
    }
    return Array.from(tags).sort();
}
