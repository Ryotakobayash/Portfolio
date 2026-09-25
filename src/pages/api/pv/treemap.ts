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

const PERIOD_DAYS = 365;

/**
 * 公開記事の過去365日PVを一括取得し、slugごとのマッピングを返す。
 */
export const GET: APIRoute = async () => {
    if (!isGA4Configured()) {
        return Response.json(
            {
                pvMap: {
                    '20240526_blog-refactoring-2024': 245,
                    '20230420_design-system-2023': 198,
                    '20241005_hackathon-sticker-2024': 156,
                    '20240405_pc-environment-2024': 134,
                    '20221026_figma-education-2022': 112,
                    '20231206_job-hunting-intern-2023': 98,
                    '20241219_study-tips-2024': 87,
                    '20210901_lt-meeting-2021': 65,
                    '20240216_nutmeg-blog-history': 54,
                    '20240406_tips-for-freshmen': 43,
                },
                totalPV: 1192,
                source: 'dummy',
                periodDays: PERIOD_DAYS,
            },
            { headers: { 'Cache-Control': GA4_DEGRADED_CACHE_CONTROL } },
        );
    }

    try {
        const analytics = await createAnalyticsClient();
        const [response] = await analytics.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${PERIOD_DAYS - 1}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    stringFilter: { matchType: 'BEGINS_WITH', value: '/posts/' },
                },
            },
            limit: 10_000,
        });

        const publishedPosts = await getPublishedPosts();
        const oldToNewSlugMap = new Map<string, string>();
        for (const post of publishedPosts) {
            const newSlug = post.data.slug || post.id;
            const oldSlugMatch = newSlug.match(/^\d{8}_(.*)$/);
            const oldSlug = oldSlugMatch ? oldSlugMatch[1] : newSlug;
            oldToNewSlugMap.set(oldSlug, newSlug);
            oldToNewSlugMap.set(newSlug, newSlug);
        }

        const pvMap: Record<string, number> = {};
        let totalPV = 0;

        for (const row of response.rows || []) {
            const path = row.dimensionValues?.[0]?.value || '';
            const pv = Number.parseInt(row.metricValues?.[0]?.value || '0', 10);
            const slug = path.replace('/posts/', '').replace(/\/$/, '');
            const canonicalSlug = oldToNewSlugMap.get(slug);
            if (!canonicalSlug || slug.includes('/')) continue;

            pvMap[canonicalSlug] = (pvMap[canonicalSlug] || 0) + pv;
            totalPV += pv;
        }

        return Response.json(
            { pvMap, totalPV, source: 'ga4', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_CACHE_CONTROL } },
        );
    } catch (error) {
        console.error('GA4 treemap API Error:', error);
        return Response.json(
            { pvMap: {}, totalPV: null, source: 'fallback', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_DEGRADED_CACHE_CONTROL } },
        );
    }
};
