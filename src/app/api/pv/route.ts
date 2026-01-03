import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { ExternalAccountClient } from 'google-auth-library';

/**
 * GA4 Data APIからPVデータを取得するAPI Route
 * Workload Identity Federationを使用してキーレス認証
 */

// 環境変数から設定を取得
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'portfolio-483013';
const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID || 'portfolio-vercel';
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || 'portfolio-vercel';
const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL || 'vercelportfolio@portfolio-483013.iam.gserviceaccount.com';
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;

// キャッシュ用（1時間）
let cachedData: { data: PVData[]; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1時間

interface PVData {
    date: string;
    pv: number;
}

/**
 * Workload Identity Federationを使用してGCP認証クライアントを作成
 */
async function getAuthClient() {
    // Vercel OIDC token取得
    const oidcToken = process.env.VERCEL_OIDC_TOKEN;

    if (!oidcToken || !GCP_PROJECT_NUMBER) {
        throw new Error('Missing OIDC configuration. Required: VERCEL_OIDC_TOKEN, GCP_PROJECT_NUMBER');
    }

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
        const formattedDate = dateStr.length === 8
            ? `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`
            : dateStr;

        return {
            date: formattedDate,
            pv: parseInt(row.metricValues?.[0]?.value || '0', 10),
        };
    });

    return pvData;
}

export async function GET() {
    try {
        // 開発環境またはGA4未設定時はダミーデータを返す
        if (!GA4_PROPERTY_ID || process.env.NODE_ENV === 'development') {
            const dummyData: PVData[] = [
                { date: '12/29', pv: 120 },
                { date: '12/30', pv: 145 },
                { date: '12/31', pv: 98 },
                { date: '01/01', pv: 210 },
                { date: '01/02', pv: 178 },
                { date: '01/03', pv: 156 },
                { date: '01/04', pv: 189 },
            ];
            return NextResponse.json({
                data: dummyData,
                source: 'dummy',
                message: 'GA4_PROPERTY_ID not configured or development mode'
            });
        }

        // キャッシュチェック
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return NextResponse.json({
                data: cachedData.data,
                source: 'cache'
            });
        }

        // GA4からデータ取得
        const pvData = await fetchGA4Data();

        // キャッシュ更新
        cachedData = {
            data: pvData,
            timestamp: Date.now(),
        };

        return NextResponse.json({
            data: pvData,
            source: 'ga4'
        });
    } catch (error) {
        console.error('GA4 API Error:', error);

        // エラー時はダミーデータを返す
        const fallbackData: PVData[] = [
            { date: '12/29', pv: 120 },
            { date: '12/30', pv: 145 },
            { date: '12/31', pv: 98 },
            { date: '01/01', pv: 210 },
            { date: '01/02', pv: 178 },
            { date: '01/03', pv: 156 },
            { date: '01/04', pv: 189 },
        ];

        return NextResponse.json({
            data: fallbackData,
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
