import type { APIRoute } from 'astro';
import {
    GA4_PROPERTY_ID,
    GA4_CACHE_CONTROL,
    isGA4Configured,
    createAnalyticsClient,
} from '../../../utils/ga4';

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
    // 環境変数未設定 or 開発モード → ダミーデータ
    if (!isGA4Configured()) {
        return Response.json({
            data: generateDummyData(),
            source: 'dummy',
        });
    }

    try {
        const analytics = await createAnalyticsClient();

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

        return Response.json(
            { data, source: 'ga4' },
            { headers: { 'Cache-Control': GA4_CACHE_CONTROL } },
        );
    } catch (error) {
        console.error('GA4 timeline API Error:', error);
        return Response.json({
            data: generateDummyData(),
            source: 'fallback',
        });
    }
};
