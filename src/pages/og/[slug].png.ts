import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// SSRモードで動作させるため、getStaticPathsはエクスポートしない
// export const prerender = false; // デフォルトがserverモードなら不要だが念のため

// Google Fontsからフォントを取得するヘルパー
async function fetchFont(text: string): Promise<ArrayBuffer> {
    const API = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;

    const css = await (await fetch(API)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (!resource) {
        throw new Error('Failed to fetch font');
    }

    const res = await fetch(resource[1]);
    return await res.arrayBuffer();
}

export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;
    if (!slug) return new Response('Not Found', { status: 404 });

    const posts = await getCollection('posts');
    const post = posts.find((p) => p.id.replace(/\.mdx?$/, '') === slug);

    if (!post) {
        return new Response('Post Not Found', { status: 404 });
    }

    // OGP画像に含める最低限の文字セット（タイトル + 固定文字）でフォントを取得
    // これによりフォントファイルサイズを最小化できる（サブセット化）
    const title = post.data.title;
    const date = post.data.date.toString(); // dateオブジェクトの場合はtoString
    const siteName = 'Dashboard Portfolio';

    // Noto Sans JPにASCII文字を含める（英数字記号 + タイトルの日本語）
    // 絵文字は含めない（文字化け回避のため削除またはSVG化推奨だが今回は削除）
    const ascii = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`"\' ';
    const fontText = title + date + siteName + ascii;

    // フォールバックフォント（サーバー内にある場合）またはGoogle Fonts
    // Vercel Serverless Function環境では外部fetchが確実
    let fontData: ArrayBuffer;
    try {
        fontData = await fetchFont(fontText);
    } catch (e) {
        console.error('Font fetch failed:', e);
        return new Response('Font load failed', { status: 500 });
    }

    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    display: 'flex',
                    height: '100%',
                    width: '100%',
                    backgroundColor: '#1a1b1e',
                    backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                    color: '#fff',
                    fontFamily: 'Noto Sans JP',
                    padding: '40px 80px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                },
                children: [
                    // 背景装飾（メッシュグラデーション風）
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                top: '-20%',
                                right: '-10%',
                                width: '600px',
                                height: '600px',
                                background: 'radial-gradient(circle, rgba(34,184,207,0.2) 0%, rgba(0,0,0,0) 70%)',
                                filter: 'blur(40px)',
                                zIndex: 0,
                            },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                bottom: '-20%',
                                left: '-10%',
                                width: '500px',
                                height: '500px',
                                background: 'radial-gradient(circle, rgba(34,139,230,0.15) 0%, rgba(0,0,0,0) 70%)',
                                filter: 'blur(40px)',
                                zIndex: 0,
                            },
                        },
                    },
                    // コンテンツ
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                zIndex: 1,
                                gap: '20px',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            fontSize: '32px',
                                            color: '#22b8cf',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                        },
                                        children: [
                                            // 絵文字削除
                                            siteName,
                                        ],
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            fontSize: '64px',
                                            fontWeight: 700,
                                            lineHeight: 1.2,
                                            background: 'linear-gradient(90deg, #fff, #adb5bd)',
                                            backgroundClip: 'text',
                                            color: 'transparent',
                                        },
                                        children: title,
                                    },
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '20px',
                                            fontSize: '28px',
                                            color: '#adb5bd',
                                            marginTop: '20px',
                                        },
                                        children: [
                                            {
                                                type: 'div',
                                                props: { children: `${date.slice(0, 10)}` },
                                            },
                                            {
                                                type: 'div',
                                                props: { children: 'Kobayashi Ryota' },
                                            },
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
                {
                    name: 'Noto Sans JP',
                    data: fontData,
                    weight: 700,
                    style: 'normal',
                },
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
