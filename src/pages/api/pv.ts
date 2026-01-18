import type { APIRoute } from 'astro';

/**
 * GA4 Data APIからPVデータを取得するAPI Route
 * 環境変数未設定時はダミーデータを返す
 */

interface PVData {
    date: string;
    pv: number;
}

// ダミーデータ（開発用/フォールバック用）
const dummyData: PVData[] = [
    { date: '01/12', pv: 120 },
    { date: '01/13', pv: 145 },
    { date: '01/14', pv: 98 },
    { date: '01/15', pv: 210 },
    { date: '01/16', pv: 178 },
    { date: '01/17', pv: 156 },
    { date: '01/18', pv: 189 },
];

// SSRモード（動的API）
export const prerender = false;

export const GET: APIRoute = async () => {
    // 環境変数から設定を取得
    const GA4_PROPERTY_ID = import.meta.env.GA4_PROPERTY_ID;
    const GCP_PROJECT_NUMBER = import.meta.env.GCP_PROJECT_NUMBER;

    // 必須環境変数のチェック - 未設定ならダミーデータを返す
    if (!GA4_PROPERTY_ID || !GCP_PROJECT_NUMBER) {
        const totalPV = dummyData.reduce((sum, d) => sum + d.pv, 0);
        return new Response(
            JSON.stringify({
                data: dummyData,
                totalPV,
                source: 'dummy',
                message: 'GA4_PROPERTY_ID or GCP_PROJECT_NUMBER not configured',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=3600',
                },
            }
        );
    }

    // 開発環境ではダミーデータを返す
    if (import.meta.env.DEV) {
        const totalPV = dummyData.reduce((sum, d) => sum + d.pv, 0);
        return new Response(
            JSON.stringify({
                data: dummyData,
                totalPV,
                source: 'dummy',
                message: 'Development mode',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    // 本番環境でGA4 APIを呼び出す
    try {
        // Vercel OIDCトークンを取得
        const tokenUrl = process.env.VERCEL_OIDC_TOKEN_URL;
        if (!tokenUrl) {
            throw new Error('VERCEL_OIDC_TOKEN_URL is not set - ensure OIDC is enabled in Vercel project settings');
        }

        const oidcResponse = await fetch(tokenUrl);
        if (!oidcResponse.ok) {
            throw new Error(`Failed to get OIDC token: ${oidcResponse.statusText}`);
        }

        const oidcData = await oidcResponse.json();
        const oidcToken = oidcData.token || oidcData.access_token;

        if (!oidcToken) {
            throw new Error('OIDC token not found in response');
        }

        // GCP設定
        const GCP_WORKLOAD_IDENTITY_POOL_ID = import.meta.env.GCP_WORKLOAD_IDENTITY_POOL_ID || 'portfolio-vercel';
        const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = import.meta.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || 'portfolio-vercel';
        const GCP_SERVICE_ACCOUNT_EMAIL = import.meta.env.GCP_SERVICE_ACCOUNT_EMAIL || 'vercelportfolio@portfolio-483013.iam.gserviceaccount.com';

        // 動的インポートでGA4クライアントを読み込む
        const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
        const { ExternalAccountClient } = await import('google-auth-library');

        const authClient = ExternalAccountClient.fromJSON({
            type: 'external_account',
            audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
            subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
            token_url: 'https://sts.googleapis.com/v1/token',
            service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
            subject_token_supplier: {
                getSubjectToken: async () => oidcToken,
            },
        });

        if (authClient) {
            authClient.scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
        }

        const analyticsDataClient = new BetaAnalyticsDataClient({
            authClient: authClient as any,
        });

        // 過去7日間のPVを取得
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [
                {
                    startDate: '7daysAgo',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: 'date',
                },
            ],
            metrics: [
                {
                    name: 'screenPageViews',
                },
            ],
            orderBys: [
                {
                    dimension: {
                        dimensionName: 'date',
                    },
                },
            ],
        });

        // レスポンスをフォーマット
        const pvData: PVData[] = (response.rows || []).map((row) => {
            const dateStr = row.dimensionValues?.[0]?.value || '';
            const formattedDate =
                dateStr.length === 8 ? `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}` : dateStr;

            return {
                date: formattedDate,
                pv: parseInt(row.metricValues?.[0]?.value || '0', 10),
            };
        });

        const totalPV = pvData.reduce((sum, d) => sum + d.pv, 0);
        return new Response(
            JSON.stringify({
                data: pvData,
                totalPV,
                source: 'ga4',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=3600',
                },
            }
        );
    } catch (error) {
        console.error('GA4 API Error:', error);

        // エラー時はダミーデータを返す（クラッシュしない）
        const totalPV = dummyData.reduce((sum, d) => sum + d.pv, 0);
        return new Response(
            JSON.stringify({
                data: dummyData,
                totalPV,
                source: 'fallback',
                error: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
};
