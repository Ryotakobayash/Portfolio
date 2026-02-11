import type { APIRoute } from 'astro';

export const prerender = false;

interface PVData {
    date: string;
    pv: number;
}

// ダミーデータ生成
function generateDummyData(): PVData[] {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
            date: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
            pv: Math.floor(Math.random() * 150) + 80,
        };
    });
}

/**
 * GA4 Data APIからPVデータを取得するAPI Route
 * Vercel OIDC + GCP Workload Identity Federation でキーレス認証
 * エラー時はダミーデータにフォールバック
 */
export const GET: APIRoute = async () => {
    const GA4_PROPERTY_ID = import.meta.env.GA4_PROPERTY_ID;
    const GCP_PROJECT_NUMBER = import.meta.env.GCP_PROJECT_NUMBER;

    // 環境変数未設定 or 開発モード → ダミーデータ
    if (!GA4_PROPERTY_ID || !GCP_PROJECT_NUMBER || import.meta.env.DEV) {
        const data = generateDummyData();
        return Response.json({
            data,
            totalPV: data.reduce((sum, d) => sum + d.pv, 0),
            source: 'dummy',
        });
    }

    try {
        // --- Vercel OIDC トークン取得 ---
        const tokenUrl = process.env.VERCEL_OIDC_TOKEN_URL;
        if (!tokenUrl) {
            throw new Error('VERCEL_OIDC_TOKEN_URL not set');
        }
        const oidcRes = await fetch(tokenUrl);
        if (!oidcRes.ok) throw new Error(`OIDC fetch failed: ${oidcRes.status}`);
        const oidcJson = await oidcRes.json();
        const oidcToken = oidcJson.token || oidcJson.access_token;
        if (!oidcToken) throw new Error('No OIDC token in response');

        // --- GCP Workload Identity Federation ---
        const GCP_POOL_ID = import.meta.env.GCP_WORKLOAD_IDENTITY_POOL_ID || 'portfolio-vercel';
        const GCP_PROVIDER_ID = import.meta.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || 'portfolio-vercel';
        const GCP_SA_EMAIL = import.meta.env.GCP_SERVICE_ACCOUNT_EMAIL || 'vercelportfolio@portfolio-483013.iam.gserviceaccount.com';

        const { ExternalAccountClient } = await import('google-auth-library');
        const authClient = ExternalAccountClient.fromJSON({
            type: 'external_account',
            audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_POOL_ID}/providers/${GCP_PROVIDER_ID}`,
            subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            token_url: 'https://sts.googleapis.com/v1/token',
            service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SA_EMAIL}:generateAccessToken`,
            subject_token_supplier: {
                getSubjectToken: async () => oidcToken,
            },
        });

        if (authClient) {
            authClient.scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
        }

        // --- GA4 Data API ---
        const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
        const analytics = new BetaAnalyticsDataClient({ authClient: authClient as any });

        const [response] = await analytics.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
            dimensions: [{ name: 'date' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
        });

        const pvData: PVData[] = (response.rows || []).map((row) => {
            const d = row.dimensionValues?.[0]?.value || '';
            return {
                date: d.length === 8 ? `${d.slice(4, 6)}/${d.slice(6, 8)}` : d,
                pv: parseInt(row.metricValues?.[0]?.value || '0', 10),
            };
        });

        return Response.json({
            data: pvData,
            totalPV: pvData.reduce((sum, d) => sum + d.pv, 0),
            source: 'ga4',
        });
    } catch (error) {
        // フォールバック: クラッシュさせない
        console.error('GA4 API Error:', error);
        const data = generateDummyData();
        return Response.json({
            data,
            totalPV: data.reduce((sum, d) => sum + d.pv, 0),
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
