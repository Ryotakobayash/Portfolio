import { c as createComponent, b as createAstro, a as renderTemplate, k as renderScript, l as renderSlot, d as addAttribute, n as renderHead, p as defineScriptVars } from './astro/server_BEnHbRWG.mjs';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const {
    title = "Dashboard Portfolio",
    description = "\u30C0\u30C3\u30B7\u30E5\u30DC\u30FC\u30C9\u578B\u30DD\u30FC\u30C8\u30D5\u30A9\u30EA\u30AA\u30B5\u30A4\u30C8"
  } = Astro2.props;
  const GA_MEASUREMENT_ID = "G-3XG4W5WQD1";
  const GTM_ID = "GTM-WG6RHC88";
  return renderTemplate(_a || (_a = __template(['<html lang="ja"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description"', "><title>", `</title><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="alternate" type="application/rss+xml" title="Dashboard Portfolio RSS" href="/rss.xml"><!-- Dark mode script (run before render to prevent flash) --><script>
      (function() {
        const theme = localStorage.getItem('theme') ||
          (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
      })();
    <\/script><!-- Google Analytics 4 --><script>(function(){`, "\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('js', new Date());\n      gtag('config', GA_MEASUREMENT_ID);\n    })();<\/script><script async", "><\/script><!-- Google Tag Manager --><script>(function(){", "\n      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n      })(window,document,'script','dataLayer',GTM_ID);\n    })();<\/script>", "</head> <body> <!-- GTM noscript --> <noscript> <iframe", ' height="0" width="0" style="display:none;visibility:hidden"></iframe> </noscript> <header class="header"> <div class="container header-content"> <a href="/" class="logo">\u{1F4CA} Dashboard Portfolio</a> <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode"> <span class="sun-icon">\u2600\uFE0F</span> <span class="moon-icon">\u{1F319}</span> </button> </div> </header> <main class="main"> <div class="container"> ', " </div> </main> ", " </body> </html>"])), addAttribute(description, "content"), title, defineScriptVars({ GA_MEASUREMENT_ID }), addAttribute(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`, "src"), defineScriptVars({ GTM_ID }), renderHead(), addAttribute(`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`, "src"), renderSlot($$result, $$slots["default"]), renderScript($$result, "/Users/kobayashiryota/Workspace/portfolio/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts"));
}, "/Users/kobayashiryota/Workspace/portfolio/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
