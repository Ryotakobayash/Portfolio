import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../../../utils/posts';
import {
    GA4_PROPERTY_ID,
    GA4_CACHE_CONTROL,
    GA4_DEGRADED_CACHE_CONTROL,
    isGA4Configured,
    createAnalyticsClient,
} from '../../../utils/ga4';

export const prerender = false;

const PERIOD_DAYS = 30;

function dummyCount(slug: string): number {
    let hash = 0;
    for (let index = 0; index < slug.length; index += 1) {
        hash = ((hash << 5) - hash) + slug.charCodeAt(index);
        hash &= hash;
    }
    return Math.abs(hash % 500) + 50;
}

/**
 * 公開記事の過去30日PVを取得する。
 */
export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;
    if (!slug) {
        return Response.json({ error: 'Slug is required' }, { status: 400 });
    }

    const publishedPosts = await getPublishedPosts();
    const isPublished = publishedPosts.some((post) => (post.data.slug || post.id) === slug);
    if (!isPublished) {
        return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!isGA4Configured()) {
        return Response.json(
            { slug, count: dummyCount(slug), source: 'dummy', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_DEGRADED_CACHE_CONTROL } },
        );
    }

    try {
        const analytics = await createAnalyticsClient();
        const oldSlugMatch = slug.match(/^\d{8}_(.*)$/);
        const oldSlug = oldSlugMatch ? oldSlugMatch[1] : slug;

        const [response] = await analytics.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${PERIOD_DAYS - 1}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    inListFilter: {
                        values: [`/posts/${slug}`, `/posts/${oldSlug}`],
                    },
                },
            },
        });

        let count = 0;
        for (const row of response.rows || []) {
            count += Number.parseInt(row.metricValues?.[0]?.value || '0', 10);
        }

        return Response.json(
            { slug, count, source: 'ga4', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_CACHE_CONTROL } },
        );
    } catch (error) {
        console.error('GA4 slug API Error:', error);
        return Response.json(
            { slug, count: null, source: 'fallback', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_DEGRADED_CACHE_CONTROL } },
        );
    }
};
