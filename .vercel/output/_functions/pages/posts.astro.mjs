import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BEnHbRWG.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_D8zhfPZW.mjs';
import { g as getCollection } from '../chunks/_astro_content_BasGnllD.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

function PostSearch({ posts }) {
  const [query, setQuery] = useState("");
  const fuse = useMemo(() => {
    return new Fuse(posts, {
      keys: ["title", "excerpt", "tags"],
      threshold: 0.3,
      includeScore: true
    });
  }, [posts]);
  const results = useMemo(() => {
    if (!query.trim()) {
      return posts;
    }
    return fuse.search(query).map((result) => result.item);
  }, [query, posts, fuse]);
  return /* @__PURE__ */ jsxs("div", { style: { marginBottom: "var(--spacing-xl)" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { position: "relative", marginBottom: "var(--spacing-lg)" }, children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-muted)",
            fontSize: "1rem"
          },
          children: "🔍"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "記事を検索...",
          value: query,
          onChange: (e) => setQuery(e.target.value),
          style: {
            width: "100%",
            padding: "12px 12px 12px 40px",
            fontSize: "1rem",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--color-bg-card)",
            color: "var(--color-text)",
            outline: "none",
            transition: "border-color var(--transition-fast)"
          },
          onFocus: (e) => e.target.style.borderColor = "var(--color-primary)",
          onBlur: (e) => e.target.style.borderColor = "var(--color-border)"
        }
      )
    ] }),
    query && /* @__PURE__ */ jsxs(
      "p",
      {
        style: {
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          marginBottom: "var(--spacing-md)"
        },
        children: [
          results.length,
          "件の記事が見つかりました"
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { style: { display: "grid", gap: "var(--spacing-lg)" }, children: results.map((post) => /* @__PURE__ */ jsxs(
      "a",
      {
        href: `/posts/${post.slug}`,
        style: {
          display: "block",
          padding: "var(--spacing-lg)",
          backgroundColor: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          textDecoration: "none",
          color: "inherit",
          transition: "box-shadow var(--transition-fast), transform var(--transition-fast)"
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
          e.currentTarget.style.transform = "translateY(-2px)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "none";
        },
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                marginBottom: "var(--spacing-sm)"
              },
              children: [
                "📅 ",
                post.date
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "h2",
            {
              style: {
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "var(--spacing-sm)"
              },
              children: post.title
            }
          ),
          post.excerpt && /* @__PURE__ */ jsx(
            "p",
            {
              style: {
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--spacing-md)",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              },
              children: post.excerpt
            }
          ),
          post.tags.length > 0 && /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "var(--spacing-xs)" }, children: post.tags.map((tag) => /* @__PURE__ */ jsx(
            "span",
            {
              style: {
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 8px",
                fontSize: "0.75rem",
                fontWeight: 500,
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--color-accent-light)",
                color: "var(--color-accent)"
              },
              children: tag
            },
            tag
          )) })
        ]
      },
      post.slug
    )) }),
    results.length === 0 && query && /* @__PURE__ */ jsxs(
      "p",
      {
        style: {
          textAlign: "center",
          color: "var(--color-text-muted)",
          padding: "var(--spacing-xl)"
        },
        children: [
          "「",
          query,
          "」に一致する記事が見つかりませんでした"
        ]
      }
    )
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getCollection("posts");
  const sortedPosts = posts.map((post) => ({
    slug: post.id.replace(/\.mdx?$/, ""),
    title: post.data.title,
    date: post.data.date,
    excerpt: post.data.excerpt || "",
    tags: post.data.tags || []
  })).sort((a, b) => a.date < b.date ? 1 : -1);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "\u8A18\u4E8B\u4E00\u89A7 | Dashboard Portfolio", "data-astro-cid-fjqfnjxi": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="page-header" data-astro-cid-fjqfnjxi> <h1 class="page-title" data-astro-cid-fjqfnjxi>記事一覧</h1> <p class="page-description" data-astro-cid-fjqfnjxi>${sortedPosts.length} 件の記事</p> </div>  ${renderComponent($$result2, "PostSearch", PostSearch, { "client:load": true, "posts": sortedPosts, "client:component-hydration": "load", "client:component-path": "/Users/kobayashiryota/Workspace/portfolio/src/components/PostSearch", "client:component-export": "default", "data-astro-cid-fjqfnjxi": true })} ` })} `;
}, "/Users/kobayashiryota/Workspace/portfolio/src/pages/posts/index.astro", void 0);

const $$file = "/Users/kobayashiryota/Workspace/portfolio/src/pages/posts/index.astro";
const $$url = "/posts";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
