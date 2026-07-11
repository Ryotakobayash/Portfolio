import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../../utils/posts';
import { SITE_NAME_UPPER } from '../../consts';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// SSRモードで動作させるため、getStaticPathsはエクスポートしない

// ライトテーマ(global.css)の計器盤パレット
const C = {
    bg: '#f5eddc',
    bgCard: '#ede5ce',
    text: '#181818',
    textSecondary: '#4a3f30',
    muted: '#6e624f',
    border: '#c8baa0',
    primary: '#466557',
    accent2: '#996b24',
};

// Google Fontsからフォントを取得するヘルパー
// TODO(C-3): デザイン確定後、リポジトリ同梱の ttf サブセットに切り替えて実行時 fetch を廃止する
async function fetchFont(text: string, weight: 400 | 700): Promise<ArrayBuffer> {
    const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(text)}`;

    const css = await (await fetch(API)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    // 抽出URLが Google Fonts の配信ドメインであることを検証(CSSパース結果を無検証でfetchしない)
    if (!resource || !resource[1].startsWith('https://fonts.gstatic.com/')) {
        throw new Error('Failed to fetch font');
    }

    const res = await fetch(resource[1]);
    return await res.arrayBuffer();
}

// タイトルから決定的に表情を変えるためのハッシュ(djb2)
function hashString(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
}

type Node = { type: string; props: Record<string, unknown> };

// 同心円の軌道リング(OrbitalBackground のモチーフ)。中心 (cx, cy)・タイトルハッシュで傾きが変わる
function orbitRings(cx: number, cy: number, tilt: number, satellites: number[]): Node[] {
    const ring = (r: number, style: Record<string, unknown>): Node => ({
        type: 'div',
        props: {
            style: {
                position: 'absolute',
                left: `${cx - r}px`,
                top: `${cy - r}px`,
                width: `${r * 2}px`,
                height: `${r * 2}px`,
                borderRadius: '9999px',
                ...style,
            },
        },
    });
    const dot = (r: number, angleDeg: number, size: number, color: string): Node => {
        const rad = (angleDeg * Math.PI) / 180;
        return {
            type: 'div',
            props: {
                style: {
                    position: 'absolute',
                    left: `${cx + r * Math.cos(rad) - size / 2}px`,
                    top: `${cy + r * Math.sin(rad) - size / 2}px`,
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '9999px',
                    backgroundColor: color,
                },
            },
        };
    };
    return [
        // 惑星本体
        ring(70, { border: `2px solid ${C.primary}` }),
        // 土星風の環(傾きはタイトルハッシュ由来)
        {
            type: 'div',
            props: {
                style: {
                    position: 'absolute',
                    left: `${cx - 140}px`,
                    top: `${cy - 140}px`,
                    width: '280px',
                    height: '280px',
                    borderRadius: '9999px',
                    border: `1.5px dashed ${C.accent2}`,
                    transform: `rotate(${tilt}deg) scaleY(0.32)`,
                },
            },
        },
        // 外周軌道
        ring(150, { border: `1.5px solid ${C.border}` }),
        ring(225, { border: `1.5px dashed ${C.border}` }),
        ring(300, { border: `1px solid ${C.border}` }),
        // 軌道上の衛星(位置はハッシュ由来)
        dot(150, satellites[0], 12, C.primary),
        dot(225, satellites[1], 9, C.accent2),
        dot(300, satellites[2], 7, C.muted),
    ];
}

// パンチカード風ドットグリッド(DotGrid のモチーフ)
function dotGrid(cols: number, rows: number, dotSize: number, gap: number, color: string): Node {
    const cells: Node[] = [];
    for (let i = 0; i < cols * rows; i++) {
        cells.push({
            type: 'div',
            props: {
                style: {
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    backgroundColor: color,
                },
            },
        });
    }
    return {
        type: 'div',
        props: {
            style: {
                display: 'flex',
                flexWrap: 'wrap',
                width: `${cols * (dotSize + gap) - gap}px`,
                gap: `${gap}px`,
                opacity: 0.5,
            },
            children: cells,
        },
    };
}

export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;
    if (!slug) return new Response('Not Found', { status: 404 });

    const posts = await getPublishedPosts();
    const post = posts.find((p) => (p.data.slug || p.id) === slug);

    if (!post) {
        return new Response('Post Not Found', { status: 404 });
    }

    const title = post.data.title;
    const date = new Date(post.data.date).toISOString().slice(0, 10);
    const tags: string[] = (post.data.tags || []).slice(0, 3);
    const siteName = SITE_NAME_UPPER;

    // 記事ページ(posts/[slug].astro)と同じロジックで読了時間を推定
    const charCount = (post.body || '').length;
    const readingTime = Math.max(1, Math.ceil(charCount / 500));

    const hash = hashString(title);
    const tilt = (hash % 51) - 25; // -25deg 〜 +25deg
    const satellites = [hash % 360, (hash * 7) % 360, (hash * 13) % 360];

    // タイトル長でフォントサイズを段階調整(3行クランプ)
    const titleSize = title.length <= 18 ? 64 : title.length <= 30 ? 56 : 48;

    // OGP画像に含める文字セット(タイトル + メタ + 固定文字)でフォントをサブセット取得
    const ascii = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\' ·';
    const fontText = title + date + siteName + tags.join('') + ascii;

    let fontRegular: ArrayBuffer;
    let fontBold: ArrayBuffer;
    try {
        [fontRegular, fontBold] = await Promise.all([
            fetchFont(fontText, 400),
            fetchFont(fontText, 700),
        ]);
    } catch (e) {
        console.error('Font fetch failed:', e);
        return new Response('Font load failed', { status: 500 });
    }

    // 計器風メタブロック(サイトのカードと同じ「左に2pxのプライマリ罫線」)
    const meter = (label: string, value: string, unit?: string): Node => ({
        type: 'div',
        props: {
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingLeft: '18px',
                borderLeft: `3px solid ${C.primary}`,
            },
            children: [
                {
                    type: 'div',
                    props: {
                        style: {
                            fontSize: '20px',
                            letterSpacing: '3px',
                            color: C.muted,
                        },
                        children: label,
                    },
                },
                {
                    type: 'div',
                    props: {
                        style: {
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '6px',
                        },
                        children: [
                            {
                                type: 'div',
                                props: {
                                    style: { fontSize: '40px', fontWeight: 700, color: C.text },
                                    children: value,
                                },
                            },
                            ...(unit
                                ? [
                                      {
                                          type: 'div',
                                          props: {
                                              style: { fontSize: '22px', color: C.muted },
                                              children: unit,
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                },
            ],
        },
    });

    const tagBadge = (tag: string): Node => ({
        type: 'div',
        props: {
            style: {
                fontSize: '23px',
                color: C.primary,
                border: `1.5px solid ${C.border}`,
                borderRadius: '4px',
                padding: '7px 16px',
                backgroundColor: C.bgCard,
            },
            children: `# ${tag}`,
        },
    });

    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: C.bg,
                    fontFamily: 'Noto Sans JP',
                    padding: '28px',
                },
                children: [
                    // 計器盤フレーム
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                width: '100%',
                                height: '100%',
                                border: `2px solid ${C.border}`,
                                borderRadius: '8px',
                                padding: '48px 56px',
                                position: 'relative',
                                overflow: 'hidden',
                            },
                            children: [
                                // 背景装飾: 軌道リング(外周は右端で見切れる)
                                ...orbitRings(1055, 315, tilt, satellites),
                                // ヘッダー行: ワードマーク + ドットグリッド
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    style: {
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '16px',
                                                    },
                                                    children: [
                                                        {
                                                            type: 'div',
                                                            props: {
                                                                style: {
                                                                    width: '14px',
                                                                    height: '14px',
                                                                    backgroundColor: C.primary,
                                                                },
                                                            },
                                                        },
                                                        {
                                                            type: 'div',
                                                            props: {
                                                                style: {
                                                                    fontSize: '26px',
                                                                    fontWeight: 700,
                                                                    letterSpacing: '5px',
                                                                    color: C.primary,
                                                                },
                                                                children: siteName,
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            dotGrid(16, 3, 4, 8, C.muted),
                                        ],
                                    },
                                },
                                // タイトル
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '28px',
                                            maxWidth: '840px',
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: {
                                                    style: {
                                                        fontSize: `${titleSize}px`,
                                                        fontWeight: 700,
                                                        lineHeight: 1.35,
                                                        color: C.text,
                                                        lineClamp: 3,
                                                    },
                                                    children: title,
                                                },
                                            },
                                            ...(tags.length
                                                ? [
                                                      {
                                                          type: 'div',
                                                          props: {
                                                              style: { display: 'flex', gap: '12px' },
                                                              children: tags.map(tagBadge),
                                                          },
                                                      },
                                                  ]
                                                : []),
                                        ],
                                    },
                                },
                                // フッター行: 計器メタ
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            gap: '48px',
                                        },
                                        children: [
                                            meter('DATE', date),
                                            meter('READ', `~${readingTime}`, 'MIN'),
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        } as any,
        {
            width: 1200,
            height: 630,
            fonts: [
                { name: 'Noto Sans JP', data: fontRegular, weight: 400, style: 'normal' },
                { name: 'Noto Sans JP', data: fontBold, weight: 700, style: 'normal' },
            ],
        }
    );

    const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: 1200 },
    });

    const buffer = resvg.render().asPng();

    return new Response(new Uint8Array(buffer), {
        headers: {
            'Content-Type': 'image/png',
            // CDNキャッシュ設定 (1日)
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
};
