import type { APIRoute } from 'astro';
import { SITE_NAME } from '../../../consts';
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

/**
 * 公開記事の過去30日PVを取得し、上位5件を返す。
 */
export const GET: APIRoute = async () => {
    const publishedPosts = await getPublishedPosts();
    const validPathPrefixes = publishedPosts.map((post) => `/posts/${post.data.slug || post.id}`);

    const oldToNewPathMap = new Map<string, string>();
    for (const post of publishedPosts) {
        const newSlug = post.data.slug || post.id;
        const oldSlugMatch = newSlug.match(/^\d{8}_(.*)$/);
        const oldSlug = oldSlugMatch ? oldSlugMatch[1] : newSlug;
        oldToNewPathMap.set(`/posts/${oldSlug}`, `/posts/${newSlug}`);
        oldToNewPathMap.set(`/posts/${newSlug}`, `/posts/${newSlug}`);
    }

    if (!isGA4Configured()) {
        const dummyRanking = [
            { path: '/posts/20240526_blog-refactoring-2024', title: 'デモデータ1', pv: 245 },
            { path: '/posts/20230420_design-system-2023', title: 'デモデータ2', pv: 198 },
            { path: '/posts/20241005_hackathon-sticker-2024', title: 'デモデータ3', pv: 156 },
            { path: '/posts/20240405_pc-environment-2024', title: 'デモデータ4', pv: 134 },
            { path: '/posts/20221026_figma-education-2022', title: 'デモデータ5', pv: 112 },
        ];
        const ranking = dummyRanking
            .filter((item) => validPathPrefixes.some((path) => item.path === path))
            .slice(0, 5);

        return Response.json(
            { ranking, source: 'dummy', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_DEGRADED_CACHE_CONTROL } },
        );
    }

    try {
        const analytics = await createAnalyticsClient();
        const [response] = await analytics.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${PERIOD_DAYS - 1}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    stringFilter: { matchType: 'BEGINS_WITH', value: '/posts/' },
                },
            },
            limit: 50,
        });

        const pvMap: Record<string, { title: string; pv: number }> = {};
        for (const row of response.rows || []) {
            const path = row.dimensionValues?.[0]?.value || '';
            const title = (row.dimensionValues?.[1]?.value || '')
                .replace(` | ${SITE_NAME}`, '')
                .replace(' | Dashboard Portfolio', '');
            const pv = Number.parseInt(row.metricValues?.[0]?.value || '0', 10);

            let canonicalPath = path;
            for (const [oldPath, newPath] of oldToNewPathMap.entries()) {
                if (path === oldPath || path.startsWith(`${oldPath}/`) || path.startsWith(`${oldPath}?`)) {
                    canonicalPath = newPath;
                    break;
                }
            }

            if (!pvMap[canonicalPath]) {
                pvMap[canonicalPath] = { title, pv: 0 };
            }
            pvMap[canonicalPath].pv += pv;
        }

        const ranking = Object.entries(pvMap)
            .map(([path, data]) => ({ path, title: data.title, pv: data.pv }))
            .filter((item) => validPathPrefixes.includes(item.path))
            .sort((first, second) => second.pv - first.pv)
            .slice(0, 5);

        return Response.json(
            { ranking, source: 'ga4', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_CACHE_CONTROL } },
        );
    } catch (error) {
        console.error('GA4 ranking API Error:', error instanceof Error ? error.message : 'unknown');
        return Response.json(
            { ranking: [], source: 'fallback', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_DEGRADED_CACHE_CONTROL } },
        );
    }
};
