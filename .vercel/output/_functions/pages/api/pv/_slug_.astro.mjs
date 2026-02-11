export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ params }) => {
  const { slug } = params;
  if (!slug) {
    return Response.json({ error: "Slug is required" }, { status: 400 });
  }
  {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
      hash = (hash << 5) - hash + slug.charCodeAt(i);
      hash = hash & hash;
    }
    return Response.json({
      slug,
      count: Math.abs(hash % 500) + 50,
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
