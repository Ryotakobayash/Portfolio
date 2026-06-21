import { useEffect, useRef, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import networkgraph from 'highcharts/modules/networkgraph';

// クライアントサイドでのみ Highcharts の networkgraph モジュールを初期化する
if (typeof window !== 'undefined' && typeof Highcharts === 'object') {
    // すでにロードされていない場合のみ適用
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
    thumbnail?: string;
}

interface ArticleNetworkGraphProps {
    posts: PostMeta[];
}

/**
 * Obsidianライクな記事関連ネットワークグラフコンポーネント
 * 記事とタグのつながりをドラッグ可能な2Dグラフで可視化する
 */
export default function ArticleNetworkGraph({ posts }: ArticleNetworkGraphProps) {
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
        const tagSet = new Set<string>();

        posts.forEach((post) => {
            // 記事ノードの追加
            nodes.push({
                id: post.title,
                marker: {
                    radius: 12,
                },
                color: '#5C7F71', // 記事ノードはテーマカラーの緑
                slug: post.slug,
                excerpt: post.excerpt || '',
                date: post.date,
                type: 'post',
            });

            // 記事に紐づくタグとエッジを追加
            post.tags.forEach((tag) => {
                data.push({
                    from: tag,
                    to: post.title,
                });
                tagSet.add(tag);
            });
        });

        // タグノードの追加（重複排除済み）
        tagSet.forEach((tag) => {
            nodes.push({
                id: tag,
                marker: {
                    radius: 8,
                },
                color: isDark ? '#3A3A32' : '#C8C0B0', // タグノードはテーマに応じた配色
                type: 'tag',
            });
        });

        return { chartData: data, chartNodes: nodes };
    }, [posts, isDark]);

    // Highcharts オプションの設定
    const options: Highcharts.Options = {
        chart: {
            type: 'networkgraph',
            backgroundColor: 'transparent',
            height: 380,
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
                    linkLength: 45, // エッジの長さ
                    integration: 'verlet',
                },
                point: {
                    events: {
                        click: function (e: any) {
                            const point = e.target;
                            // 記事ノードをクリックしたときは記事詳細ページに遷移
                            if (point.type === 'post' && point.slug) {
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
                        fontSize: '0.65rem',
                        color: isDark ? '#8A8A7A' : '#6B6B5A',
                        textOutline: 'none',
                        fontWeight: '600',
                    },
                },
                data: chartData,
                nodes: chartNodes,
                link: {
                    color: isDark ? 'rgba(245,237,220,0.1)' : 'rgba(24,24,24,0.1)',
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
                if (point.type === 'post') {
                    return `
                        <div style="padding: 4px; max-width: 240px; font-family: var(--font-sans);">
                            <div style="font-size: 0.6rem; color: var(--color-text-muted); font-family: var(--font-mono); margin-bottom: 2px;">${point.date}</div>
                            <div style="font-weight: bold; font-size: 0.75rem; color: var(--color-text); margin-bottom: 4px; line-height: 1.3;">${point.id}</div>
                            <div style="font-size: 0.65rem; color: var(--color-text-secondary); line-height: 1.4;">${point.excerpt}</div>
                        </div>
                    `;
                } else if (point.type === 'tag') {
                    return `
                        <div style="padding: 2px; font-family: var(--font-sans); font-size: 0.7rem; color: var(--color-text);">
                            <span style="font-weight: bold;">Tag:</span> ${point.id}
                        </div>
                    `;
                }
                return false;
            },
        },
    };

    // テーマ切り替え時に Highcharts を動的にアップデートする
    useEffect(() => {
        if (chartRef.current?.chart) {
            chartRef.current.chart.update(options, true, true);
        }
    }, [isDark]);

    return (
        <div 
            className="article-network-graph-container"
            style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-card)',
                padding: 'var(--spacing-md)',
                marginTop: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
                cursor: 'grab',
            }}
        >
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: 'var(--spacing-sm)' 
                }}
            >
                <span 
                    style={{ 
                        fontSize: '0.6rem', 
                        fontWeight: 700, 
                        color: 'var(--color-text-muted)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.15em',
                        fontFamily: 'var(--font-mono)'
                    }}
                >
                    Interactive Article Relations
                </span>
                <span 
                    style={{ 
                        fontSize: '0.6rem', 
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)'
                    }}
                >
                    ● Post Node (Green) / ● Tag Node
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
