import { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import networkgraph from 'highcharts/modules/networkgraph';

// クライアントサイドでのみ Highcharts の networkgraph モジュールを初期化する
if (typeof window !== 'undefined' && typeof Highcharts === 'object') {
    if (!Highcharts.Series.types.networkgraph) {
        networkgraph(Highcharts);
    }
}

interface PostMeta {
    slug: string;
    title: string;
    date: string;
    excerpt?: string;
    tags: string[];
}

interface LocalArticleNetworkGraphProps {
    currentSlug: string;
    currentTitle: string;
    currentTags: string[];
    allPosts: PostMeta[];
}

/**
 * 個別記事用のローカルネットワークグラフ（Obsidian ローカルグラフ風）
 * 現在の記事を中心に、そのタグと共通のタグを持つ関連記事の接続を可視化する
 */
export default function LocalArticleNetworkGraph({
    currentSlug,
    currentTitle,
    currentTags,
    allPosts,
}: LocalArticleNetworkGraphProps) {
    const chartRef = useRef<HighchartsReact.RefObject>(null);
    const [isDark, setIsDark] = useState(false);

    // ダークモードの検知と監視
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

    // グラフ用データ（ノードとエッジ）の構築
    const { chartData, chartNodes } = useMemo(() => {
        const data: { from: string; to: string }[] = [];
        const nodes: any[] = [];
        const addedNodes = new Set<string>();

        // 1. 中心となる現在の記事ノード
        nodes.push({
            id: currentTitle,
            marker: {
                radius: 16, // 中心は大きく
            },
            color: '#5C7F71', // 目立つテーマグリーン
            slug: currentSlug,
            type: 'current',
        });
        addedNodes.add(currentTitle);

        // 現在の記事のタグをセット化
        const currentTagSet = new Set(currentTags);

        // 現在の記事に関連するタグノードを追加し、中心ノードと接続
        currentTags.forEach((tag) => {
            nodes.push({
                id: tag,
                marker: {
                    radius: 8,
                },
                color: isDark ? '#4A4A3F' : '#B8B0A0', // タグノードカラー
                type: 'tag',
            });
            addedNodes.add(tag);

            data.push({
                from: currentTitle,
                to: tag,
            });
        });

        // 2. 共通タグを1つ以上持つ関連記事を抽出
        const relatedPosts = allPosts
            .filter((post) => post.slug !== currentSlug) // 自分自身は除外
            .map((post) => {
                // 共通タグの数をカウント
                const commonTagsCount = post.tags.filter((t) => currentTagSet.has(t)).length;
                return { ...post, commonTagsCount };
            })
            .filter((post) => post.commonTagsCount > 0) // 共通タグがあるもの
            // 共通タグ数が多い順、同数なら新しい順にソート
            .sort((a, b) => {
                if (b.commonTagsCount !== a.commonTagsCount) {
                    return b.commonTagsCount - a.commonTagsCount;
                }
                return b.date > a.date ? 1 : -1;
            })
            .slice(0, 6); // グラフが過密になりすぎないよう最大6件に制限

        // 関連記事ノードを追加し、該当するタグとエッジで結ぶ
        relatedPosts.forEach((post) => {
            nodes.push({
                id: post.title,
                marker: {
                    radius: 11,
                },
                color: isDark ? '#3D5A4D' : '#8CB3A2', // やや淡いグリーンで現在の記事と区別
                slug: post.slug,
                excerpt: post.excerpt || '',
                date: post.date,
                type: 'post',
            });
            addedNodes.add(post.title);

            // 現在の記事と共有しているタグとの間にリンクを張る
            post.tags.forEach((tag) => {
                if (currentTagSet.has(tag)) {
                    data.push({
                        from: tag,
                        to: post.title,
                    });
                }
            });
        });

        return { chartData: data, chartNodes: nodes };
    }, [currentSlug, currentTitle, currentTags, allPosts, isDark]);

    // Highcharts オプション
    const options: Highcharts.Options = {
        chart: {
            type: 'networkgraph',
            backgroundColor: 'transparent',
            height: 260, // サイドバーに収まるようコンパクトに
            style: {
                fontFamily: 'var(--font-sans)',
            },
        },
        title: { text: undefined },
        credits: { enabled: false },
        plotOptions: {
            networkgraph: {
                keys: ['from', 'to'],
                layoutAlgorithm: {
                    enableSimulation: true,
                    friction: -0.9,
                    linkLength: 40,
                    integration: 'verlet',
                    gravitationalConstant: 0.06,
                },
                point: {
                    events: {
                        click: function (e: any) {
                            const point = e.target;
                            // 関連記事ノードをクリックしたときはその詳細ページへ遷移
                            if (point.type === 'post' && point.slug && point.slug !== currentSlug) {
                                window.location.href = `/posts/${point.slug}`;
                            }
                        },
                    },
                },
            },
        },
        series: [
            {
                type: 'networkgraph',
                dataLabels: {
                    enabled: true,
                    linkFormat: '',
                    allowOverlap: false,
                    style: {
                        fontSize: '0.6rem',
                        color: isDark ? '#8A8A7A' : '#6B6B5A',
                        textOutline: 'none',
                        fontWeight: '600',
                    },
                },
                data: chartData,
                nodes: chartNodes,
                link: {
                    color: isDark ? 'rgba(245,237,220,0.08)' : 'rgba(24,24,24,0.08)',
                    width: 1.5,
                },
            },
        ],
        tooltip: {
            useHTML: true,
            backgroundColor: isDark ? 'var(--color-bg-card)' : '#FFFFFF',
            borderColor: 'var(--color-border)',
            borderRadius: 0,
            shadow: false,
            formatter: function () {
                const point = this.point as any;
                if (point.type === 'current') {
                    return `
                        <div style="padding: 4px; max-width: 200px; font-family: var(--font-sans); font-size: 0.65rem; color: var(--color-text);">
                            <strong>表示中の記事:</strong><br/>${point.id}
                        </div>
                    `;
                } else if (point.type === 'post') {
                    return `
                        <div style="padding: 4px; max-width: 220px; font-family: var(--font-sans);">
                            <div style="font-size: 0.55rem; color: var(--color-text-muted); font-family: var(--font-mono); margin-bottom: 2px;">${point.date}</div>
                            <div style="font-weight: bold; font-size: 0.7rem; color: var(--color-text); margin-bottom: 4px; line-height: 1.3;">${point.id}</div>
                            <div style="font-size: 0.6rem; color: var(--color-text-secondary); line-height: 1.3;">${point.excerpt}</div>
                        </div>
                    `;
                } else if (point.type === 'tag') {
                    return `
                        <div style="padding: 2px; font-family: var(--font-sans); font-size: 0.65rem; color: var(--color-text);">
                            <span style="font-weight: bold;">Tag:</span> ${point.id}
                        </div>
                    `;
                }
                return false;
            },
        },
    };

    // テーマ切り替え時の更新
    useEffect(() => {
        if (chartRef.current?.chart) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark]);

    return (
        <div
            className="local-article-graph"
            style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                padding: 'var(--spacing-md)',
                cursor: 'grab',
                width: '100%',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-xs)',
                }}
            >
                <span
                    style={{
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    Interactive Graph (Obsidian)
                </span>
            </div>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                ref={chartRef}
            />
        </div>
    );
}
