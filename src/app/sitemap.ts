import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/markdown';

const BASE_URL = 'https://portfolio-eight-rust-11.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const posts = await getAllPosts();

    // 静的ページ
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/posts`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/tags`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
    ];

    // 記事ページ
    const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${BASE_URL}/posts/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    // タグページ（ユニークなタグを抽出）
    const allTags = [...new Set(posts.flatMap((post) => post.tags))];
    const tagPages: MetadataRoute.Sitemap = allTags.map((tag) => ({
        url: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
    }));

    return [...staticPages, ...postPages, ...tagPages];
}
