import type { APIRoute } from 'astro';
import {
    GA4_PROPERTY_ID,
    GA4_CACHE_CONTROL,
    isGA4Configured,
    createAnalyticsClient,
} from '../../../utils/ga4';

export const prerender = false;

function dummyCount(slug: string): number {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = ((hash << 5) - hash) + slug.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash % 500) + 50;
}

/**
 * 個別記事のPV数を取得する API Route
 */
export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;
    if (!slug) {
        return Response.json({ error: 'Slug is required' }, { status: 400 });
    }

    // 環境変数未設定 or 開発モード → ダミーデータ
    if (!isGA4Configured()) {
        return Response.json({
            slug,
            count: dummyCount(slug),
            source: 'dummy',
        });
    }

    try {
        const analytics = await createAnalyticsClient();

        const oldSlugMatch = slug.match(/^\d{8}_(.*)$/);
        const oldSlug = oldSlugMatch ? oldSlugMatch[1] : slug;

        const [response] = await analytics.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    inListFilter: {
                        values: [`/posts/${slug}`, `/posts/${oldSlug}`]
                    }
                },
            },
        });

        let count = 0;
        for (const row of response.rows || []) {
            count += parseInt(row.metricValues?.[0]?.value || '0', 10);
        }

        return Response.json(
            { slug, count, source: 'ga4' },
            { headers: { 'Cache-Control': GA4_CACHE_CONTROL } },
        );
    } catch (error) {
        console.error('GA4 slug API Error:', error);
        return Response.json({
            slug,
            count: dummyCount(slug),
            source: 'fallback',
        });
    }
};
