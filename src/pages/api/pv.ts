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
function getDummyData(): PVData[] {
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

// SSRモード（動的API）
export const prerender = false;

export const GET: APIRoute = async () => {
    try {
        // 環境変数から設定を取得
        const GA4_PROPERTY_ID = import.meta.env.GA4_PROPERTY_ID;
        const GCP_PROJECT_NUMBER = import.meta.env.GCP_PROJECT_NUMBER;

        // 必須環境変数のチェック - 未設定ならダミーデータを返す
        if (!GA4_PROPERTY_ID || !GCP_PROJECT_NUMBER) {
            const dummyData = getDummyData();
            const totalPV = dummyData.reduce((sum, d) => sum + d.pv, 0);
            return new Response(
                JSON.stringify({
                    data: dummyData,
                    totalPV,
                    source: 'dummy',
                    message: 'GA4_PROPERTY_ID or GCP_PROJECT_NUMBER not configured',
                    debug: {
                        hasGA4: !!GA4_PROPERTY_ID,
                        hasGCP: !!GCP_PROJECT_NUMBER,
                    },
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

        // TODO: GA4 API実装（環境変数設定後に有効化）
        // 現時点ではダミーデータを返す
        const dummyData = getDummyData();
        const totalPV = dummyData.reduce((sum, d) => sum + d.pv, 0);
        return new Response(
            JSON.stringify({
                data: dummyData,
                totalPV,
                source: 'placeholder',
                message: 'GA4 API implementation pending',
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
        // エラー時もクラッシュしない
        return new Response(
            JSON.stringify({
                data: getDummyData(),
                totalPV: 1000,
                source: 'error',
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
