// @ts-check
import { defineConfig, envField } from 'astro/config';

import { unified } from '@astrojs/markdown-remark';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import remarkBreaks from 'remark-breaks';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.ryota5884.com',
  output: 'server',
  // Astro 6と同じHTML空白処理を維持し、インライン要素間の意図しない結合を防ぐ
  compressHTML: true,
  env: {
    schema: {
      GA4_PROPERTY_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      GCP_PROJECT_NUMBER: envField.string({ context: 'server', access: 'secret', optional: true }),
      GCP_WORKLOAD_IDENTITY_POOL_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      GCP_SERVICE_ACCOUNT_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      GITHUB_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    react(),
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      styleOverrides: {
        borderRadius: '0',
        codeFontFamily: 'var(--font-mono)',
        frames: {
          shadowColor: 'transparent',
        },
      },
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    // Astro 7でも既存のremark/rehypeプラグインによる記事変換を維持する
    processor: unified({
      remarkPlugins: [remarkBreaks],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: {
              className: ['heading-anchor'],
              ariaLabel: 'このセクションへのリンク',
            },
            content: { type: 'text', value: '#' },
          },
        ],
        [
          rehypeExternalLinks,
          {
            target: '_blank',
            rel: ['noopener', 'noreferrer'],
          },
        ],
      ],
    }),
  },
  adapter: vercel({
    // OGP画像生成（satori）がfsで読むフォントをServerless Functionへ同梱する
    includeFiles: [
      'src/assets/fonts/NotoSansJP-Regular.otf',
      'src/assets/fonts/NotoSansJP-Bold.otf',
    ],
  }),
  vite: {
    // 開発時にR3F・Drei・Threeを別chunkへ分割せず、Canvasコンテキストを共有する
    optimizeDeps: {
      include: [
        '@react-three/fiber',
        '@react-three/drei',
        'three',
        'highcharts',
        'highcharts-react-official',
        'highcharts/modules/networkgraph',
        'highcharts/modules/heatmap',
        'highcharts/modules/treemap',
      ],
    },
  },
});
