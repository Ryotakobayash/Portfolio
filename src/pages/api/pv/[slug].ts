import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * 個別記事のPV数を取得する API Route
 */
export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;
    if (!slug) {
        return Response.json({ error: 'Slug is required' }, { status: 400 });
    }

    const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
    const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;

    // 環境変数未設定 or 開発モード → ダミーデータ
    if (!GA4_PROPERTY_ID || !GCP_PROJECT_NUMBER || import.meta.env.DEV) {
        let hash = 0;
        for (let i = 0; i < slug.length; i++) {
            hash = ((hash << 5) - hash) + slug.charCodeAt(i);
            hash = hash & hash;
        }
        return Response.json({
            slug,
            count: Math.abs(hash % 500) + 50,
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
                getSubjectToken: getVercelOidcToken,
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
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    stringFilter: { matchType: 'EXACT', value: `/posts/${slug}` },
                },
            },
        });

        const count = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0', 10);

        return Response.json({ slug, count, source: 'ga4' });
    } catch (error) {
        console.error('GA4 slug API Error:', error);
        let hash = 0;
        for (let i = 0; i < slug.length; i++) {
            hash = ((hash << 5) - hash) + slug.charCodeAt(i);
            hash = hash & hash;
        }
        return Response.json({
            slug,
            count: Math.abs(hash % 500) + 50,
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
