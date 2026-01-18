import type { APIRoute } from 'astro';

// 動的ルートはサーバーサイドで処理
export const prerender = false;

/**
 * 個別記事のPV数を取得するAPI Route
 * 開発環境ではランダムなダミーデータを返す
 */
export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;

    if (!slug) {
        return new Response(JSON.stringify({ error: 'Slug is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // 開発環境ではダミーデータを返す
    // 本番ではGA4 APIから個別ページのPVを取得する
    const dummyCount = Math.floor(Math.random() * 500) + 50;

    return new Response(
        JSON.stringify({
            slug,
            count: dummyCount,
            source: 'dummy',
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600',
            },
        }
    );
};
