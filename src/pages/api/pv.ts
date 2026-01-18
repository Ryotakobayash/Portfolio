import type { APIRoute } from 'astro';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { ExternalAccountClient } from 'google-auth-library';

/**
 * GA4 Data APIからPVデータを取得するAPI Route
 * Workload Identity Federationを使用してキーレス認証
 */

// 環境変数から設定を取得
const GCP_PROJECT_ID = import.meta.env.GCP_PROJECT_ID || 'portfolio-483013';
const GCP_PROJECT_NUMBER = import.meta.env.GCP_PROJECT_NUMBER;
const GCP_WORKLOAD_IDENTITY_POOL_ID = import.meta.env.GCP_WORKLOAD_IDENTITY_POOL_ID || 'portfolio-vercel';
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = import.meta.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || 'portfolio-vercel';
const GCP_SERVICE_ACCOUNT_EMAIL = import.meta.env.GCP_SERVICE_ACCOUNT_EMAIL || 'vercelportfolio@portfolio-483013.iam.gserviceaccount.com';
const GA4_PROPERTY_ID = import.meta.env.GA4_PROPERTY_ID;

// キャッシュ用（1時間）
let cachedData: { data: PVData[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1時間

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

/**
 * Vercel OIDCトークンを取得
 */
async function getVercelOidcToken(): Promise<string> {
    const tokenUrl = process.env.VERCEL_OIDC_TOKEN_URL;
    if (!tokenUrl) {
        throw new Error('VERCEL_OIDC_TOKEN_URL is not set');
    }

    const response = await fetch(tokenUrl);
    if (!response.ok) {
        throw new Error(`Failed to get OIDC token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.token || data.access_token;
}

/**
 * Workload Identity Federationを使用してGCP認証クライアントを作成
 */
async function getAuthClient() {
    if (!GCP_PROJECT_NUMBER) {
        throw new Error('GCP_PROJECT_NUMBER is not configured');
    }

    // Vercel OIDCトークンを取得
    const oidcToken = await getVercelOidcToken();

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

    // Analytics Data APIに必要なスコープを設定
    if (authClient) {
        authClient.scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
    }

    return authClient;
}

/**
 * GA4からPVデータを取得
 */
async function fetchGA4Data(): Promise<PVData[]> {
    if (!GA4_PROPERTY_ID) {
        throw new Error('GA4_PROPERTY_ID is not configured');
    }

    const authClient = await getAuthClient();

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
        // YYYYMMDD形式をMM/DD形式に変換
        const formattedDate =
            dateStr.length === 8 ? `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}` : dateStr;

        return {
            date: formattedDate,
            pv: parseInt(row.metricValues?.[0]?.value || '0', 10),
        };
    });

    return pvData;
}

// SSRモード（動的API）
export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        // 開発環境またはGA4未設定時はダミーデータを返す
        if (!GA4_PROPERTY_ID || import.meta.env.DEV) {
            const totalPV = dummyData.reduce((sum, d) => sum + d.pv, 0);
            return new Response(
                JSON.stringify({
                    data: dummyData,
                    totalPV,
                    source: 'dummy',
                    message: 'GA4_PROPERTY_ID not configured or development mode',
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

        // キャッシュチェック
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            const totalPV = cachedData.data.reduce((sum, d) => sum + d.pv, 0);
            return new Response(
                JSON.stringify({
                    data: cachedData.data,
                    totalPV,
                    source: 'cache',
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

        // GA4からデータ取得
        const pvData = await fetchGA4Data();

        // キャッシュ更新
        cachedData = {
            data: pvData,
            timestamp: Date.now(),
        };

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

        // エラー時はダミーデータを返す
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
