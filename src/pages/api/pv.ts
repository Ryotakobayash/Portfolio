import type { APIRoute } from 'astro';

/**
 * GA4 Data APIからPVデータを取得するAPI Route
 * 開発環境ではダミーデータを返す
 */

interface PVData {
    date: string;
    pv: number;
}

// ダミーデータ（開発用）
const dummyData: PVData[] = [
    { date: '01/11', pv: 120 },
    { date: '01/12', pv: 145 },
    { date: '01/13', pv: 98 },
    { date: '01/14', pv: 210 },
    { date: '01/15', pv: 178 },
    { date: '01/16', pv: 156 },
    { date: '01/17', pv: 189 },
];

export const GET: APIRoute = async () => {
    // 環境変数から設定を取得
    const GA4_PROPERTY_ID = import.meta.env.GA4_PROPERTY_ID;

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

    // 本番環境ではGA4 Data APIを呼び出す
    // TODO: Vercel OIDC + GCP Workload Identity Federation認証を実装
    // 現在は暫定的にダミーデータを返す
    try {
        const totalPV = dummyData.reduce((sum, d) => sum + d.pv, 0);
        return new Response(
            JSON.stringify({
                data: dummyData,
                totalPV,
                source: 'fallback',
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
