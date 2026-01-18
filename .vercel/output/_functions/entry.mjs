import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_78LkrHiY.mjs';
import { manifest } from './manifest_BWPe0jua.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/pv/_slug_.astro.mjs');
const _page3 = () => import('./pages/api/pv.astro.mjs');
const _page4 = () => import('./pages/posts/_slug_.astro.mjs');
const _page5 = () => import('./pages/posts.astro.mjs');
const _page6 = () => import('./pages/tags/_tag_.astro.mjs');
const _page7 = () => import('./pages/tags.astro.mjs');
const _page8 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.16.11_@types+node@25.0.9_@vercel+functions@2.2.13_rollup@4.55.1_typescript@5.9.3/node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/api/pv/[slug].ts", _page2],
    ["src/pages/api/pv.ts", _page3],
    ["src/pages/posts/[slug].astro", _page4],
    ["src/pages/posts/index.astro", _page5],
    ["src/pages/tags/[tag].astro", _page6],
    ["src/pages/tags/index.astro", _page7],
    ["src/pages/index.astro", _page8]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "81a47d07-5ca7-4ca8-9f74-0d4e38e46fe0",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
