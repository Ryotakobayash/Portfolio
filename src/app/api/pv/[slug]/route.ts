import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { ExternalAccountClient } from 'google-auth-library';
import { getVercelOidcToken } from '@vercel/functions/oidc';

/**
 * 記事別PVを取得するAPI Route
 * GA4 Data APIを使用
 */

// 環境変数から設定を取得
const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID || 'portfolio-vercel';
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || 'portfolio-vercel';
const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL || 'vercelportfolio@portfolio-483013.iam.gserviceaccount.com';
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;

// キャッシュ用（1時間）
const cache = new Map<string, { pv: number; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1時間

interface PageProps {
    params: Promise<{ slug: string }>;
}

/**
 * Workload Identity Federationを使用してGCP認証クライアントを作成
 */
async function getAuthClient() {
    if (!GCP_PROJECT_NUMBER) {
        throw new Error('GCP_PROJECT_NUMBER is not configured');
    }

    // @vercel/functions を使用してOIDCトークンを取得
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
 * GA4から特定記事のPVを取得
 */
async function fetchArticlePV(slug: string): Promise<number> {
    if (!GA4_PROPERTY_ID) {
        throw new Error('GA4_PROPERTY_ID is not configured');
    }

    const authClient = await getAuthClient();

    const analyticsDataClient = new BetaAnalyticsDataClient({
        authClient: authClient as any,
    });

    // 全期間の該当記事PVを取得
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
            {
                startDate: '2020-01-01',
                endDate: 'today',
            },
        ],
        dimensions: [
            {
                name: 'pagePath',
            },
        ],
        metrics: [
            {
                name: 'screenPageViews',
            },
        ],
        dimensionFilter: {
            filter: {
                fieldName: 'pagePath',
                stringFilter: {
                    matchType: 'CONTAINS',
                    value: `/posts/${slug}`,
                },
            },
        },
    });

    // PV数を集計
    let totalPV = 0;
    (response.rows || []).forEach((row) => {
        totalPV += parseInt(row.metricValues?.[0]?.value || '0', 10);
    });

    return totalPV;
}

export async function GET(request: Request, { params }: PageProps) {
    const { slug } = await params;

    try {
        // 開発環境またはGA4未設定時はダミーデータを返す
        if (!GA4_PROPERTY_ID || process.env.NODE_ENV === 'development') {
            // slugのハッシュに基づいたダミー閲覧数（100-500の範囲）
            const dummyPV = 100 + (slug.length * 37) % 400;
            return NextResponse.json({
                slug,
                pv: dummyPV,
                source: 'dummy',
            });
        }

        // キャッシュチェック
        const cached = cache.get(slug);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return NextResponse.json({
                slug,
                pv: cached.pv,
                source: 'cache',
            });
        }

        // GA4からデータ取得
        const pv = await fetchArticlePV(slug);

        // キャッシュ更新
        cache.set(slug, {
            pv,
            timestamp: Date.now(),
        });

        return NextResponse.json({
            slug,
            pv,
            source: 'ga4',
        });
    } catch (error) {
        console.error('GA4 Article PV API Error:', error);

        // エラー時はダミーデータを返す
        const fallbackPV = 100 + (slug.length * 37) % 400;
        return NextResponse.json({
            slug,
            pv: fallbackPV,
            source: 'fallback',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
