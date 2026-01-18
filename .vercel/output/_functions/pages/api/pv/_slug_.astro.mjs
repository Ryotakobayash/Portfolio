export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ params }) => {
  const { slug } = params;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Slug is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  const dummyCount = Math.floor(Math.random() * 500) + 50;
  return new Response(
    JSON.stringify({
      slug,
      count: dummyCount,
      source: "dummy"
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600"
      }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    GET,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
