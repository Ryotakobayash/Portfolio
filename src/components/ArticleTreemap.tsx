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

/** タグ→色のパレット（実際の記事タグに合わせて日英両対応） */
const TAG_COLORS: Record<string, string> = {
    // 日本語タグ
    'デザイン': '#4C6EF5',
    'デザインシステム': '#5C7CFA',
    'ガジェット': '#15AABF',
    'イベント': '#FA5252',
    'ハッカソン': '#F76707',
    '大学生活': '#AE3EC9',
    '学習法': '#40C057',
    '就活': '#E8590C',
    'PC環境': '#228BE6',
    // 英語タグ
    'Hugo': '#FD7E14',
    'HTML/CSS': '#228BE6',
    'Figma': '#A855F7',
    'NUTMEG': '#20C997',
    // 汎用フォールバック
    'Design': '#4C6EF5',
    'Tech': '#228BE6',
    'Blog': '#FD7E14',
};

const DEFAULT_COLOR = '#868E96';

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
                style: { fontFamily: 'Inter, "Noto Sans JP", sans-serif' },
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
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: '500',
                        textOutline: '1px contrast',
                    },
                },
                levels: [{
                    level: 1,
                    dataLabels: {
                        enabled: true,
                        align: 'left',
                        verticalAlign: 'top',
                        style: {
                            fontSize: '13px',
                            fontWeight: '600',
                        },
                    },
                    borderWidth: 2,
                    borderColor: isDark ? '#1a1b1e' : '#ffffff',
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
                display: 'flex', gap: '4px', marginBottom: '16px',
                background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)',
                padding: '4px',
            }}>
                {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        style={{
                            flex: 1, padding: '6px 12px',
                            fontSize: '0.8rem', fontWeight: viewMode === mode ? 600 : 400,
                            border: 'none', borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            backgroundColor: viewMode === mode ? 'var(--color-bg-card)' : 'transparent',
                            color: viewMode === mode ? 'var(--color-text)' : 'var(--color-text-muted)',
                            boxShadow: viewMode === mode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
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
                    <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                            width: '10px', height: '10px', borderRadius: '2px',
                            backgroundColor: getTagColor(tag), display: 'inline-block',
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
