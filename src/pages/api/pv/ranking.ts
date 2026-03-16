import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../../../utils/posts';

export const prerender = false;

/**
 * 人気記事ランキング API
 * GA4から30日間のページ別PVを取得し、上位5件を返す
 */
export const GET: APIRoute = async () => {
    const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
    const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;

    // 公開済みの記事パス一覧を取得
    const publishedPosts = await getPublishedPosts();
    const validPathPrefixes = publishedPosts.map(post => `/posts/${post.id.replace(/\.mdx?$/, '')}`);

    const oldToNewPathMap = new Map<string, string>();
    for (const post of publishedPosts) {
        const newSlug = post.id.replace(/\.mdx?$/, '');
        const oldSlugMatch = newSlug.match(/^\d{8}_(.*)$/);
        const oldSlug = oldSlugMatch ? oldSlugMatch[1] : newSlug;
        oldToNewPathMap.set(`/posts/${oldSlug}`, `/posts/${newSlug}`);
        oldToNewPathMap.set(`/posts/${newSlug}`, `/posts/${newSlug}`);
    }

    if (!GA4_PROPERTY_ID || !GCP_PROJECT_NUMBER || import.meta.env.DEV) {
        const dummyRanking = [
            { path: '/posts/20240526_blog-refactoring-2024', title: 'デモデータ1', pv: 245 },
            { path: '/posts/20230420_design-system-2023', title: 'デモデータ2', pv: 198 },
            { path: '/posts/20241005_hackathon-sticker-2024', title: 'デモデータ3', pv: 156 },
            { path: '/posts/20240405_pc-environment-2024', title: 'デモデータ4', pv: 134 },
            { path: '/posts/20221026_figma-education-2022', title: 'デモデータ5', pv: 112 },
        ];

        const filteredDummy = dummyRanking
            .filter(item => validPathPrefixes.some(vp => item.path === vp || item.path.startsWith(`${vp}/`) || item.path.startsWith(`${vp}?`)))
            .slice(0, 5);

        return Response.json({
            ranking: filteredDummy,
            source: 'dummy',
        });
    }

    try {
        const { getVercelOidcToken } = await import('@vercel/oidc');
        const GCP_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID || 'portfolio-vercel';
        const GCP_PROVIDER_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || 'portfolio-vercel';
        const GCP_SA_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL || 'vercelportfolio@portfolio-483013.iam.gserviceaccount.com';

        const { ExternalAccountClient } = await import('google-auth-library');
        const authClient = ExternalAccountClient.fromJSON({
            type: 'external_account',
            audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_POOL_ID}/providers/${GCP_PROVIDER_ID}`,
            subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            token_url: 'https://sts.googleapis.com/v1/token',
            service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SA_EMAIL}:generateAccessToken`,
            subject_token_supplier: {
                getSubjectToken: () => getVercelOidcToken(),
            },
        });

        if (authClient) {
            authClient.scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
        }

        const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
        const analytics = new BetaAnalyticsDataClient({ authClient: authClient as any });

        const [response] = await analytics.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    stringFilter: { matchType: 'BEGINS_WITH', value: '/posts/' },
                },
            },
            limit: 50, // 下書きを除外するため多めに取得
        });

        const pvMap: Record<string, { title: string; pv: number }> = {};

        for (const row of response.rows || []) {
            let path = row.dimensionValues?.[0]?.value || '';
            const title = (row.dimensionValues?.[1]?.value || '').replace(' | Dashboard Portfolio', '');
            const pv = parseInt(row.metricValues?.[0]?.value || '0', 10);

            // Canonicalize path: if it's an old path, map it to the new one
            let canonicalPath = path;
            for (const [oldP, newP] of oldToNewPathMap.entries()) {
                if (path === oldP || path.startsWith(`${oldP}/`) || path.startsWith(`${oldP}?`)) {
                    canonicalPath = newP;
                    break;
                }
            }

            if (!pvMap[canonicalPath]) {
                pvMap[canonicalPath] = { title, pv: 0 };
            }
            pvMap[canonicalPath].pv += pv;
        }

        const ranking = Object.entries(pvMap).map(([path, data]) => ({
            path,
            title: data.title,
            pv: data.pv
        }));

        const filteredRanking = ranking
            .filter(item => validPathPrefixes.some(vp => item.path === vp || item.path.startsWith(`${vp}/`) || item.path.startsWith(`${vp}?`)))
            .sort((a, b) => b.pv - a.pv)
            .slice(0, 5);

        return Response.json({ ranking: filteredRanking, source: 'ga4' });
    } catch (error) {
        console.error('GA4 ranking API Error:', error);
        return Response.json({
            ranking: [],
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
