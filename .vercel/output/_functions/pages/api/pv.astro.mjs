export { renderers } from '../../renderers.mjs';

function getDummyData() {
  const today = /* @__PURE__ */ new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return {
      date: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`,
      pv: Math.floor(Math.random() * 150) + 80
    };
  });
}
const prerender = false;
const GET = async () => {
  try {
    const GA4_PROPERTY_ID = undefined                               ;
    const GCP_PROJECT_NUMBER = undefined                                  ;
    if (!GA4_PROPERTY_ID || !GCP_PROJECT_NUMBER) {
      const dummyData2 = getDummyData();
      const totalPV2 = dummyData2.reduce((sum, d) => sum + d.pv, 0);
      return new Response(
        JSON.stringify({
          data: dummyData2,
          totalPV: totalPV2,
          source: "dummy",
          message: "GA4_PROPERTY_ID or GCP_PROJECT_NUMBER not configured",
          debug: {
            hasGA4: !!GA4_PROPERTY_ID,
            hasGCP: !!GCP_PROJECT_NUMBER
          }
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
    const dummyData = getDummyData();
    const totalPV = dummyData.reduce((sum, d) => sum + d.pv, 0);
    return new Response(
      JSON.stringify({
        data: dummyData,
        totalPV,
        source: "placeholder",
        message: "GA4 API implementation pending"
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
    return new Response(
      JSON.stringify({
        data: getDummyData(),
        totalPV: 1e3,
        source: "error",
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
