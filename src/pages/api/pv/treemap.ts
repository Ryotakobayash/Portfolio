import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../../../utils/posts';

export const prerender = false;

/**
 * 全記事のPVを一括取得する API Route
 * Treemapコンポーネントで使用
 * GA4から /posts/* のページ別PVを取得し、slug → PV のマッピングを返す
 */
export const GET: APIRoute = async () => {
    const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
    const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;

    // 開発環境 or 環境変数未設定 → ダミーデータ
    if (!GA4_PROPERTY_ID || !GCP_PROJECT_NUMBER || import.meta.env.DEV) {
        return Response.json({
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

        // 全期間の /posts/* のPVを取得
        const [response] = await analytics.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    stringFilter: { matchType: 'BEGINS_WITH', value: '/posts/' },
                },
            },
            limit: 100,
        });

        const publishedPosts = await getPublishedPosts();
        const oldToNewSlugMap = new Map();
        for (const post of publishedPosts) {
            const newSlug = (post.data.slug || post.id);
            const oldSlugMatch = newSlug.match(/^\d{8}_(.*)$/);
            const oldSlug = oldSlugMatch ? oldSlugMatch[1] : newSlug;
            oldToNewSlugMap.set(oldSlug, newSlug);
            oldToNewSlugMap.set(newSlug, newSlug);
        }

        const pvMap: Record<string, number> = {};
        let totalPV = 0;

        for (const row of response.rows || []) {
            const path = row.dimensionValues?.[0]?.value || '';
            const pv = parseInt(row.metricValues?.[0]?.value || '0', 10);
            // /posts/slug → slug を抽出
            const slug = path.replace('/posts/', '').replace(/\/$/, '');
            if (slug && !slug.includes('/')) {
                const canonicalSlug = oldToNewSlugMap.get(slug) || slug;
                pvMap[canonicalSlug] = (pvMap[canonicalSlug] || 0) + pv;
                totalPV += pv;
            }
        }

        return Response.json({ pvMap, totalPV, source: 'ga4' });
    } catch (error) {
        console.error('GA4 treemap API Error:', error);
        return Response.json({
            pvMap: {},
            totalPV: 0,
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
