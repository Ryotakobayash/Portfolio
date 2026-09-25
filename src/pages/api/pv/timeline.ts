import type { APIRoute } from 'astro';
import {
    GA4_PROPERTY_ID,
    GA4_CACHE_CONTROL,
    GA4_DEGRADED_CACHE_CONTROL,
    isGA4Configured,
    createAnalyticsClient,
} from '../../../utils/ga4';

export const prerender = false;

interface MonthlyPV {
    month: string;
    pv: number;
}

const PERIOD_DAYS = 180;

// ローカル表示専用の決定的なデモデータ
function generateDemoData(): MonthlyPV[] {
    const values = [640, 820, 760, 1_120, 980, 1_340];
    const today = new Date();
    return values.map((pv, index) => {
        const date = new Date(today.getFullYear(), today.getMonth() - (values.length - 1 - index), 1);
        return {
            month: `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`,
            pv,
        };
    });
}

/**
 * 過去約180日の月別PVデータを取得する。
 */
export const GET: APIRoute = async () => {
    if (!isGA4Configured()) {
        return Response.json(
            { data: generateDemoData(), source: 'dummy', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_DEGRADED_CACHE_CONTROL } },
        );
    }

    try {
        const analytics = await createAnalyticsClient();
        const [response] = await analytics.runReport({
            property: `properties/${GA4_PROPERTY_ID}`,
            dateRanges: [{ startDate: `${PERIOD_DAYS - 1}daysAgo`, endDate: 'today' }],
            dimensions: [{ name: 'yearMonth' }],
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [{ dimension: { dimensionName: 'yearMonth' } }],
        });

        const data: MonthlyPV[] = [];
        for (const row of response.rows || []) {
            data.push({
                month: row.dimensionValues?.[0]?.value || '',
                pv: Number.parseInt(row.metricValues?.[0]?.value || '0', 10),
            });
        }

        return Response.json(
            { data, source: 'ga4', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_CACHE_CONTROL } },
        );
    } catch (error) {
        console.error('GA4 timeline API Error:', error);
        return Response.json(
            { data: [], source: 'fallback', periodDays: PERIOD_DAYS },
            { headers: { 'Cache-Control': GA4_DEGRADED_CACHE_CONTROL } },
        );
    }
};
