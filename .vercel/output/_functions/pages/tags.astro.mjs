import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_BEnHbRWG.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_D8zhfPZW.mjs';
import { g as getCollection } from '../chunks/_astro_content_BasGnllD.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getCollection("posts");
  const tagMap = /* @__PURE__ */ new Map();
  posts.forEach((post) => {
    (post.data.tags || []).forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  const tags = Array.from(tagMap.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u30BF\u30B0\u4E00\u89A7 | Dashboard Portfolio", "data-astro-cid-os4i7owy": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-header" data-astro-cid-os4i7owy> <h1 class="page-title" data-astro-cid-os4i7owy>タグ一覧</h1> <p class="page-description" data-astro-cid-os4i7owy>${tags.length} 件のタグ</p> </div> <div class="tag-grid" data-astro-cid-os4i7owy> ${tags.map(({ tag, count }) => renderTemplate`<a${addAttribute(`/tags/${tag.replace(/\//g, "-")}`, "href")} class="tag-card" data-astro-cid-os4i7owy> <span class="tag-card__name" data-astro-cid-os4i7owy>${tag}</span> <span class="tag-card__count" data-astro-cid-os4i7owy>${count} 記事</span> </a>`)} </div> ` })} `;
}, "/Users/kobayashiryota/Workspace/portfolio/src/pages/tags/index.astro", void 0);

const $$file = "/Users/kobayashiryota/Workspace/portfolio/src/pages/tags/index.astro";
const $$url = "/tags";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
