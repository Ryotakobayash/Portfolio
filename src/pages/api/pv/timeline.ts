import type { APIRoute } from 'astro';

export const prerender = false;

interface MonthlyPV {
    month: string; // "YYYYMM"
    pv: number;
}

// ダミーデータ生成（過去6ヶ月分）
function generateDummyData(): MonthlyPV[] {
    const data: MonthlyPV[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        data.push({
            month: `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`,
            pv: Math.floor(Math.random() * 2000) + 500,
        });
    }
    return data;
}

/**
 * 過去6ヶ月の月別PVデータを取得するAPI Route
 */
export const GET: APIRoute = async () => {
    const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
    const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;

    if (!GA4_PROPERTY_ID || !GCP_PROJECT_NUMBER || import.meta.env.DEV) {
        return Response.json({
            data: generateDummyData(),
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
            dateRanges: [{ startDate: '180daysAgo', endDate: 'today' }], // 約6ヶ月
            dimensions: [{ name: 'yearMonth' }], // YYYYMM
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ dimension: { dimensionName: 'yearMonth' } }]
        });

        const data: MonthlyPV[] = [];
        for (const row of response.rows || []) {
            data.push({
                month: row.dimensionValues?.[0]?.value || '',
                pv: parseInt(row.metricValues?.[0]?.value || '0', 10),
            });
        }

        return Response.json({ data, source: 'ga4' });
    } catch (error) {
        console.error('GA4 timeline API Error:', error);
        return Response.json({
            data: generateDummyData(),
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
