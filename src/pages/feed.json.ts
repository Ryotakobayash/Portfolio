export const prerender = true;

import type { APIContext } from 'astro';
import { getPublishedPosts } from '../utils/posts';

/**
 * JSON Feed エンドポイント
 * 公開済み記事を日付降順で JSON Feed 1.1 仕様に則って出力する
 */
export async function GET(context: APIContext) {
    const posts = await getPublishedPosts();

    // 日付降順にソート
    const sortedPosts = posts.sort((a, b) => {
        return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
    });

    const siteUrl = context.site?.toString() ?? 'https://www.ryota5884.com';
    const cleanSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

    const feed = {
        version: "https://jsonfeed.org/version/1.1",
        title: "RK / Portfolio",
        home_page_url: cleanSiteUrl,
        feed_url: `${cleanSiteUrl}/feed.json`,
        description: "Ryota Kobayashi's blog and portfolio",
        items: sortedPosts.map((post) => {
            const slug = post.data.slug || post.id;
            const postUrl = `${cleanSiteUrl}/posts/${slug}`;
            return {
                id: postUrl,
                url: postUrl,
                title: post.data.title,
                summary: post.data.excerpt || '',
                content_text: post.data.excerpt || '',
                date_published: new Date(post.data.date).toISOString(),
            };
        }),
    };

    return new Response(JSON.stringify(feed, null, 2), {
        headers: {
            'Content-Type': 'application/feed+json; charset=utf-8',
        },
    });
}
