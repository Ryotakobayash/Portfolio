import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_BEnHbRWG.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_D8zhfPZW.mjs';
import { g as getCollection } from '../chunks/_astro_content_BasGnllD.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useRef, useState, useEffect, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

function PVChart() {
  const chartRef = useRef(null);
  const [isDark, setIsDark] = useState(false);
  const [pvData, setPvData] = useState([]);
  const [totalPV, setTotalPV] = useState(0);
  const [source, setSource] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme === "dark");
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    async function fetchPVData() {
      try {
        const res = await fetch("/api/pv");
        if (!res.ok) throw new Error("Failed to fetch PV data");
        const json = await res.json();
        setPvData(json.data);
        setTotalPV(json.totalPV);
        setSource(json.source);
        if (json.error) setError(json.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setPvData([
          { date: "01/11", pv: 120 },
          { date: "01/12", pv: 145 },
          { date: "01/13", pv: 98 },
          { date: "01/14", pv: 210 },
          { date: "01/15", pv: 178 },
          { date: "01/16", pv: 156 },
          { date: "01/17", pv: 189 }
        ]);
        setTotalPV(1096);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPVData();
  }, []);
  const colors = {
    text: isDark ? "#c1c2c5" : "#495057",
    grid: isDark ? "#373A40" : "#dee2e6",
    line: isDark ? "#22b8cf" : "#228be6",
    fillStart: isDark ? "rgba(34, 184, 207, 0.5)" : "rgba(34, 139, 230, 0.5)",
    fillEnd: isDark ? "rgba(34, 184, 207, 0)" : "rgba(34, 139, 230, 0)"
  };
  const options = {
    chart: {
      type: "area",
      backgroundColor: "transparent",
      height: 200
    },
    title: {
      text: void 0
    },
    xAxis: {
      categories: pvData.map((d) => d.date),
      labels: {
        style: {
          color: colors.text
        }
      },
      lineColor: colors.grid
    },
    yAxis: {
      title: {
        text: void 0
      },
      labels: {
        style: {
          color: colors.text
        }
      },
      gridLineColor: colors.grid
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, colors.fillStart],
            [1, colors.fillEnd]
          ]
        },
        marker: {
          enabled: false
        },
        lineWidth: 2,
        lineColor: colors.line
      }
    },
    series: [
      {
        type: "area",
        name: "PV",
        data: pvData.map((d) => d.pv)
      }
    ]
  };
  useEffect(() => {
    if (chartRef.current?.chart && pvData.length > 0) {
      chartRef.current.chart.update(options, true, true);
    }
  }, [isDark, pvData]);
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "skeleton", style: { height: "24px", width: "120px", marginBottom: "16px" } }),
      /* @__PURE__ */ jsx("div", { className: "skeleton", style: { height: "200px" } })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: "12px" }, children: [
      /* @__PURE__ */ jsxs("span", { style: { fontSize: "1.25rem", fontWeight: 700, color: "var(--color-accent)" }, children: [
        totalPV.toLocaleString(),
        " views"
      ] }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.875rem", color: "var(--color-text-muted)", marginLeft: "8px" }, children: "(過去7日間)" })
    ] }),
    /* @__PURE__ */ jsx(HighchartsReact, { highcharts: Highcharts, options, ref: chartRef }),
    source && source !== "ga4" && /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "right", marginTop: "8px" }, children: [
      "Data source: ",
      source
    ] })
  ] });
}

function PostCalendar({ posts }) {
  const postsByDate = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    posts.forEach((post) => {
      const dateKey = post.date;
      const existing = map.get(dateKey) || [];
      existing.push(post);
      map.set(dateKey, existing);
    });
    return map;
  }, [posts]);
  const months = useMemo(() => {
    const result = [];
    const today = /* @__PURE__ */ new Date();
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const days = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${monthKey}-${String(day).padStart(2, "0")}`;
        days.push({
          date: dateStr,
          posts: postsByDate.get(dateStr) || []
        });
      }
      result.push({
        month: monthKey,
        days
      });
    }
    return result;
  }, [postsByDate]);
  const getColor = (count) => {
    if (count === 0) return "var(--color-bg-secondary)";
    if (count === 1) return "var(--color-accent)";
    if (count === 2) return "#1b9db0";
    return "#15818f";
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: { fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "8px" }, children: "過去12ヶ月の投稿" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          display: "flex",
          gap: "4px",
          flexWrap: "wrap",
          alignItems: "flex-start"
        },
        children: months.map((month) => /* @__PURE__ */ jsxs("div", { style: { marginBottom: "8px" }, children: [
          /* @__PURE__ */ jsxs("div", { style: { fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "4px" }, children: [
            month.month.slice(5),
            "月"
          ] }),
          /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                display: "grid",
                gridTemplateColumns: "repeat(7, 10px)",
                gap: "2px"
              },
              children: month.days.map(
                (day) => day.posts.length > 0 ? /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: `/posts/${day.posts[0].slug}`,
                    title: `${day.date}: ${day.posts.map((p) => p.title).join(", ")}`,
                    style: {
                      width: "10px",
                      height: "10px",
                      borderRadius: "2px",
                      backgroundColor: getColor(day.posts.length),
                      cursor: "pointer",
                      display: "block"
                    }
                  },
                  day.date
                ) : /* @__PURE__ */ jsx(
                  "div",
                  {
                    style: {
                      width: "10px",
                      height: "10px",
                      borderRadius: "2px",
                      backgroundColor: getColor(0)
                    }
                  },
                  day.date
                )
              )
            }
          )
        ] }, month.month))
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }, children: [
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "var(--color-text-muted)" }, children: "少" }),
      /* @__PURE__ */ jsx("div", { style: { width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "var(--color-bg-secondary)" } }),
      /* @__PURE__ */ jsx("div", { style: { width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "var(--color-accent)" } }),
      /* @__PURE__ */ jsx("div", { style: { width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#1b9db0" } }),
      /* @__PURE__ */ jsx("div", { style: { width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#15818f" } }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: "0.75rem", color: "var(--color-text-muted)" }, children: "多" })
    ] })
  ] });
}

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getCollection("posts");
  const sortedPosts = posts.map((post) => ({
    slug: post.id.replace(/\.mdx?$/, ""),
    title: post.data.title,
    date: post.data.date,
    tags: post.data.tags || []
  })).sort((a, b) => a.date < b.date ? 1 : -1);
  const postCount = posts.length;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "data-astro-cid-j7pv25f6": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="bento-grid" data-astro-cid-j7pv25f6> <!-- プロフィールカード --> <div class="bento-card" data-astro-cid-j7pv25f6> <div class="bento-card__title" data-astro-cid-j7pv25f6>Profile</div> <div class="flex items-center gap-lg" data-astro-cid-j7pv25f6> <div class="avatar" data-astro-cid-j7pv25f6>KR</div> <div class="flex flex-col gap-sm" data-astro-cid-j7pv25f6> <span class="text-lg font-bold" data-astro-cid-j7pv25f6>小林 諒大</span> <span class="text-secondary text-sm" data-astro-cid-j7pv25f6>Cybozu プロダクトデザイナー</span> </div> </div> <div class="card-footer" data-astro-cid-j7pv25f6> <a href="/about" class="link-arrow" data-astro-cid-j7pv25f6>詳細プロフィール →</a> </div> </div> <!-- PV数グラフカード（ワイド） --> <div class="bento-card bento-card--wide" data-astro-cid-j7pv25f6> <div class="bento-card__title" data-astro-cid-j7pv25f6>Page Views (Last 7 Days)</div> ${renderComponent($$result2, "PVChart", PVChart, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/kobayashiryota/Workspace/portfolio/src/components/PVChart", "client:component-export": "default", "data-astro-cid-j7pv25f6": true })} </div> <!-- 投稿カレンダーカード（ワイド） --> <div class="bento-card bento-card--wide" data-astro-cid-j7pv25f6> <div class="bento-card__title" data-astro-cid-j7pv25f6>Post Activity</div> ${renderComponent($$result2, "PostCalendar", PostCalendar, { "client:load": true, "posts": sortedPosts.map((p) => ({ slug: p.slug, title: p.title, date: p.date })), "client:component-hydration": "load", "client:component-path": "/Users/kobayashiryota/Workspace/portfolio/src/components/PostCalendar", "client:component-export": "default", "data-astro-cid-j7pv25f6": true })} </div> <!-- 最新記事リストカード --> <div class="bento-card" data-astro-cid-j7pv25f6> <div class="bento-card__title" data-astro-cid-j7pv25f6>Latest Posts</div> <div class="post-list" data-astro-cid-j7pv25f6> ${sortedPosts.length > 0 ? sortedPosts.slice(0, 3).map((post) => renderTemplate`<a${addAttribute(`/posts/${post.slug}`, "href")} class="post-list__item" data-astro-cid-j7pv25f6> <span class="post-list__icon" data-astro-cid-j7pv25f6>📝</span> <div class="post-list__content" data-astro-cid-j7pv25f6> <span class="post-list__title" data-astro-cid-j7pv25f6>${post.title}</span> <span class="post-list__date" data-astro-cid-j7pv25f6>${post.date}</span> </div> </a>`) : renderTemplate`<p class="text-muted text-sm" data-astro-cid-j7pv25f6>まだ記事がありません</p>`} </div> <div class="card-footer flex justify-between items-center" data-astro-cid-j7pv25f6> <span class="text-muted text-sm" data-astro-cid-j7pv25f6>Total: ${postCount} posts</span> <a href="/posts" class="link-arrow" data-astro-cid-j7pv25f6>すべて見る →</a> </div> </div> </div> ` })} `;
}, "/Users/kobayashiryota/Workspace/portfolio/src/pages/index.astro", void 0);

const $$file = "/Users/kobayashiryota/Workspace/portfolio/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
