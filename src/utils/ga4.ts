import {
    GA4_PROPERTY_ID,
    GCP_PROJECT_NUMBER,
    GCP_WORKLOAD_IDENTITY_POOL_ID,
    GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID,
    GCP_SERVICE_ACCOUNT_EMAIL,
} from 'astro:env/server';

export { GA4_PROPERTY_ID };

// PVデータは鮮度不要なので Vercel CDN に1時間キャッシュさせ、
// GA4 Data API のクォータ消費と関数実行数を抑える
export const GA4_CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

/**
 * GA4 を叩ける構成かどうか。
 * 未設定(ローカル等)や開発モードでは各エンドポイントがダミーデータへフォールバックする。
 */
export function isGA4Configured(): boolean {
    if (import.meta.env.DEV) return false;
    if (!GA4_PROPERTY_ID || !GCP_PROJECT_NUMBER) return false;
    if (!GCP_SERVICE_ACCOUNT_EMAIL) {
        // SAメールはリポジトリにフォールバック値を置かない方針。未設定は構成ミスとしてログに残す
        console.error('GCP_SERVICE_ACCOUNT_EMAIL is not set; falling back to dummy data');
        return false;
    }
    return true;
}

/**
 * Vercel OIDC + Workload Identity Federation で認証した GA4 Data API クライアントを生成する。
 * isGA4Configured() が true のときのみ呼ぶこと。
 */
export async function createAnalyticsClient() {
    const { getVercelOidcToken } = await import('@vercel/oidc');
    const { ExternalAccountClient } = await import('google-auth-library');

    const poolId = GCP_WORKLOAD_IDENTITY_POOL_ID || 'portfolio-vercel';
    const providerId = GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID || 'portfolio-vercel';

    const authClient = ExternalAccountClient.fromJSON({
        type: 'external_account',
        audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
        subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
        token_url: 'https://sts.googleapis.com/v1/token',
        service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
        subject_token_supplier: {
            getSubjectToken: () => getVercelOidcToken(),
        },
    });

    if (authClient) {
        authClient.scopes = ['https://www.googleapis.com/auth/analytics.readonly'];
    }

    const { BetaAnalyticsDataClient } = await import('@google-analytics/data');
    return new BetaAnalyticsDataClient({ authClient: authClient as any });
}
