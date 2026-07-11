// SSR環境でプリレンダリングするため先頭に明記
export const prerender = true;

import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublishedPosts } from '../utils/posts';
import { SITE_NAME } from '../consts';

/**
 * RSS フィードエンドポイント
 * 公開済み記事を日付降順でフィードに出力する
 */
export async function GET(context: APIContext) {
    const posts = await getPublishedPosts();

    // 日付降順にソート
    const sortedPosts = posts.sort((a, b) => {
        return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
    });

    return rss({
        title: SITE_NAME,
        description: "Ryota Kobayashi's blog and portfolio",
        site: context.site ?? 'https://www.ryota5884.com',
        items: sortedPosts.map((post) => {
            const slug = post.data.slug || post.id;
            return {
                title: post.data.title,
                pubDate: new Date(post.data.date),
                description: post.data.excerpt ?? '',
                link: `/posts/${slug}`,
            };
        }),
        customData: `<language>ja</language>`,
    });
}
