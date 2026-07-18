import type { APIRoute } from 'astro';
import { fetchNotePosts } from '../../../utils/note';
import externalData from '../../../data/external-posts.json';

export const prerender = false;

type ServiceType = 'zenn' | 'note';

interface ExternalPost {
    service: ServiceType;
    title: string;
    url: string;
    date: string;
}

/** URL 末尾スラッシュを無視して同一記事を判定するためのキー */
function urlKey(url: string): string {
    return url.replace(/\/+$/, '');
}

/**
 * note の投稿を RSS から取得し、静的な external-posts.json（zenn や RSS 範囲外の
 * 過去 note 記事）とマージして返す。
 * - note の live 記事は URL 一致で静的エントリを上書き（実際の投稿日で更新）
 * - RSS 取得失敗時は静的データのみを返す（ページはクラッシュしない）
 */
export const GET: APIRoute = async () => {
    const staticPosts = externalData.posts as ExternalPost[];
    let source = 'note-rss';

    let livePosts: ExternalPost[] = [];
    try {
        livePosts = await fetchNotePosts();
    } catch (err) {
        console.error('note RSS fetch error:', err);
        source = 'static-fallback';
    }

    // 静的エントリをベースに、live note で上書き＋新規追加
    const byUrl = new Map<string, ExternalPost>();
    for (const post of staticPosts) {
        byUrl.set(urlKey(post.url), post);
    }
    for (const post of livePosts) {
        byUrl.set(urlKey(post.url), post);
    }

    const posts = Array.from(byUrl.values()).sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : 0
    );

    return new Response(JSON.stringify({ posts, source }), {
        headers: {
            'Content-Type': 'application/json',
            // CDN に1時間キャッシュ。裏で再検証してデプロイなしでも新着が反映される
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
};
