export { renderers } from '../../renderers.mjs';

const prerender = false;
function generateDummyData() {
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
const GET = async () => {
  {
    const data = generateDummyData();
    return Response.json({
      data,
      totalPV: data.reduce((sum, d) => sum + d.pv, 0),
      source: "dummy"
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
