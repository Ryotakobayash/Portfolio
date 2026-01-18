import '@google-analytics/data';
import 'google-auth-library';
export { renderers } from '../../renderers.mjs';

const GA4_PROPERTY_ID = undefined                               ;
let cachedData = null;
const CACHE_DURATION = 60 * 60 * 1e3;
const dummyData = [
  { date: "01/12", pv: 120 },
  { date: "01/13", pv: 145 },
  { date: "01/14", pv: 98 },
  { date: "01/15", pv: 210 },
  { date: "01/16", pv: 178 },
  { date: "01/17", pv: 156 },
  { date: "01/18", pv: 189 }
];
async function fetchGA4Data() {
  {
    throw new Error("GA4_PROPERTY_ID is not configured");
  }
}
const prerender = false;
const GET = async () => {
  try {
    if (!GA4_PROPERTY_ID || false) {
      const totalPV2 = dummyData.reduce((sum, d) => sum + d.pv, 0);
      return new Response(
        JSON.stringify({
          data: dummyData,
          totalPV: totalPV2,
          source: "dummy",
          message: "GA4_PROPERTY_ID not configured or development mode"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600"
          }
        }
      );
    }
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      const totalPV2 = cachedData.data.reduce((sum, d) => sum + d.pv, 0);
      return new Response(
        JSON.stringify({
          data: cachedData.data,
          totalPV: totalPV2,
          source: "cache"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600"
          }
        }
      );
    }
    const pvData = await fetchGA4Data();
    cachedData = {
      data: pvData,
      timestamp: Date.now()
    };
    const totalPV = pvData.reduce((sum, d) => sum + d.pv, 0);
    return new Response(
      JSON.stringify({
        data: pvData,
        totalPV,
        source: "ga4"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600"
        }
      }
    );
  } catch (error) {
    console.error("GA4 API Error:", error);
    const totalPV = dummyData.reduce((sum, d) => sum + d.pv, 0);
    return new Response(
      JSON.stringify({
        data: dummyData,
        totalPV,
        source: "fallback",
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
