import { q as decodeKey } from './chunks/astro/server_BEnHbRWG.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_CkBS5Mqa.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/kobayashiryota/Workspace/portfolio/","cacheDir":"file:///Users/kobayashiryota/Workspace/portfolio/node_modules/.astro/","outDir":"file:///Users/kobayashiryota/Workspace/portfolio/dist/","srcDir":"file:///Users/kobayashiryota/Workspace/portfolio/src/","publicDir":"file:///Users/kobayashiryota/Workspace/portfolio/public/","buildClientDir":"file:///Users/kobayashiryota/Workspace/portfolio/dist/client/","buildServerDir":"file:///Users/kobayashiryota/Workspace/portfolio/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"posts/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/posts","isIndex":true,"type":"page","pattern":"^\\/posts\\/?$","segments":[[{"content":"posts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/posts/index.astro","pathname":"/posts","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"tags/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/tags","isIndex":true,"type":"page","pattern":"^\\/tags\\/?$","segments":[[{"content":"tags","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tags/index.astro","pathname":"/tags","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/.pnpm/astro@5.16.11_@types+node@25.0.9_@vercel+functions@2.2.13_rollup@4.55.1_typescript@5.9.3/node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/pv/[slug]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/pv\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"pv","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/api/pv/[slug].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/pv","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/pv\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"pv","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/pv.ts","pathname":"/api/pv","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/Users/kobayashiryota/Workspace/portfolio/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/Users/kobayashiryota/Workspace/portfolio/src/pages/posts/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/posts/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kobayashiryota/Workspace/portfolio/src/pages/posts/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/posts/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kobayashiryota/Workspace/portfolio/src/pages/tags/[tag].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/tags/[tag]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kobayashiryota/Workspace/portfolio/src/pages/tags/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/tags/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/kobayashiryota/Workspace/portfolio/src/pages/about.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:node_modules/.pnpm/astro@5.16.11_@types+node@25.0.9_@vercel+functions@2.2.13_rollup@4.55.1_typescript@5.9.3/node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/api/pv/[slug]@_@ts":"pages/api/pv/_slug_.astro.mjs","\u0000@astro-page:src/pages/api/pv@_@ts":"pages/api/pv.astro.mjs","\u0000@astro-page:src/pages/posts/[slug]@_@astro":"pages/posts/_slug_.astro.mjs","\u0000@astro-page:src/pages/posts/index@_@astro":"pages/posts.astro.mjs","\u0000@astro-page:src/pages/tags/[tag]@_@astro":"pages/tags/_tag_.astro.mjs","\u0000@astro-page:src/pages/tags/index@_@astro":"pages/tags.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_DQ1-7ee7.mjs","/Users/kobayashiryota/Workspace/portfolio/node_modules/.pnpm/astro@5.16.11_@types+node@25.0.9_@vercel+functions@2.2.13_rollup@4.55.1_typescript@5.9.3/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_DNJwFA3D.mjs","/Users/kobayashiryota/Workspace/portfolio/.astro/content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","/Users/kobayashiryota/Workspace/portfolio/.astro/content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_DtGpVWvU.mjs","/Users/kobayashiryota/Workspace/portfolio/src/components/ViewCount":"_astro/ViewCount.CEyVWyCb.js","/Users/kobayashiryota/Workspace/portfolio/src/components/CodeCopyButton":"_astro/CodeCopyButton.mytdEw7O.js","/Users/kobayashiryota/Workspace/portfolio/src/components/ImageZoom":"_astro/ImageZoom.CU51m9u7.js","/Users/kobayashiryota/Workspace/portfolio/src/components/StickyToc":"_astro/StickyToc.B3ymcAx_.js","/Users/kobayashiryota/Workspace/portfolio/src/components/PostSearch":"_astro/PostSearch.-M7asibl.js","/Users/kobayashiryota/Workspace/portfolio/src/components/PostCalendar":"_astro/PostCalendar.DFbjfdcG.js","/Users/kobayashiryota/Workspace/portfolio/src/components/PVChart":"_astro/PVChart.BRTYVxXi.js","@astrojs/react/client.js":"_astro/client.9unXo8s5.js","/Users/kobayashiryota/Workspace/portfolio/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts":"_astro/BaseLayout.astro_astro_type_script_index_0_lang.URu-yyJJ.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/kobayashiryota/Workspace/portfolio/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts","const e=document.getElementById(\"theme-toggle\");e?.addEventListener(\"click\",()=>{const t=document.documentElement.getAttribute(\"data-theme\")===\"dark\"?\"light\":\"dark\";document.documentElement.setAttribute(\"data-theme\",t),localStorage.setItem(\"theme\",t)});"]],"assets":["/_astro/about.Csf2DoTT.css","/favicon.svg","/google68537fdebebc8e94.html","/rss.xml","/_astro/CodeCopyButton.mytdEw7O.js","/_astro/ImageZoom.CU51m9u7.js","/_astro/PVChart.BRTYVxXi.js","/_astro/PostCalendar.DFbjfdcG.js","/_astro/PostSearch.-M7asibl.js","/_astro/StickyToc.B3ymcAx_.js","/_astro/ViewCount.CEyVWyCb.js","/_astro/client.9unXo8s5.js","/_astro/index.WFquGv8Z.js","/_astro/jsx-runtime.D_zvdyIk.js","/images/posts/blog-refactoring-2024/HJlnIO9xE0_3.png","/images/posts/blog-refactoring-2024/HyiZI9eNC_1.png","/images/posts/blog-refactoring-2024/r1RwvqlER_2.png","/images/posts/blog-refactoring-2024/r1iOu9gVC_4.png","/images/posts/blog-refactoring-2024/rkOQFceNC_5.png","/images/posts/blog-refactoring-2024/rkrTOqg4C_6.png","/images/posts/design-system-2023/1G4kfMB_6.jpg","/images/posts/design-system-2023/KaUABJb_2.png","/images/posts/design-system-2023/PEV5sby_3.png","/images/posts/design-system-2023/ZHf01uQ_4.png","/images/posts/design-system-2023/ZbcKW24_5.png","/images/posts/design-system-2023/sRiY5fU_1.png","/images/posts/figma-education-2022/4e28yQq_3.png","/images/posts/figma-education-2022/7raPVKF_6.png","/images/posts/figma-education-2022/KPlqgvg_5.png","/images/posts/figma-education-2022/SIHpvOO_8.png","/images/posts/figma-education-2022/acW738U_1.png","/images/posts/figma-education-2022/g6Jd8Jb_4.png","/images/posts/figma-education-2022/oDJSHHZ_7.png","/images/posts/figma-education-2022/y696vLN_2.png","/images/posts/hackathon-sticker-2024/B1wDpwAAC_4.png","/images/posts/hackathon-sticker-2024/Byo4RvRR0_5.png","/images/posts/hackathon-sticker-2024/HknZVdC00_6.png","/images/posts/hackathon-sticker-2024/r1D8iv0RC_2.jpg","/images/posts/hackathon-sticker-2024/rJEzqvAC0_1.jpg","/images/posts/hackathon-sticker-2024/rJuWruCR0_7.png","/images/posts/hackathon-sticker-2024/ry5wnvCAC_3.png","/images/posts/pc-environment-2024/B18KrU6JC_5.png","/images/posts/pc-environment-2024/B1eoWDay0_11.jpg","/images/posts/pc-environment-2024/BJzDpITyA_8.jpg","/images/posts/pc-environment-2024/H1Fc68TkR_10.jpg","/images/posts/pc-environment-2024/H1kiNL6yC_3.png","/images/posts/pc-environment-2024/HJmME8TyC_2.png","/images/posts/pc-environment-2024/HyQc6L6JC_9.jpg","/images/posts/pc-environment-2024/S1sMrU6kC_4.png","/images/posts/pc-environment-2024/r1usgwT10_7.jpg","/images/posts/pc-environment-2024/rJYgUUayR_6.png","/images/posts/pc-environment-2024/ryZWcSpJ0_1.png","/images/posts/study-tips-2024/rJZA-2ZH1l_1.png","/about/index.html","/posts/index.html","/tags/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"ZJapgxqQ0RiIuJfczY/jAgyNteI1eMJI+ZYdASCv+UE="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
