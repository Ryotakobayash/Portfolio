#!/usr/bin/env node
/**
 * 主要ページのアクセシビリティ検査（axe-core）
 *
 * - トップ・About・記事一覧・記事詳細・タグ・登壇一覧・404 をダーク・ライト両テーマで検査する
 * - 結果を reports/a11y/pages.md に書き出す
 *
 * 使い方:
 *   pnpm dev                 # 別ターミナルで起動しておく
 *   pnpm a11y:pages
 *   A11Y_BASE_URL=https://... pnpm a11y:pages   # 本番などを対象にする場合
 *
 * serious / critical の違反が 1 件でもあれば終了コード 1 で終わる。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const BASE_URL = process.env.A11Y_BASE_URL ?? 'http://localhost:4321';
const OUT_FILE = path.resolve('reports/a11y/pages.md');
const THEMES = ['dark', 'light'];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BLOCKING = new Set(['serious', 'critical']);
const STATIC_PATHS = ['/', '/about', '/posts', '/tags', '/talks', '/404'];

async function launchBrowser() {
  try {
    return await chromium.launch({ channel: 'chrome' });
  } catch {
    return await chromium.launch();
  }
}

async function newThemedPage(browser, theme) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ja-JP' });
  await context.addInitScript((t) => localStorage.setItem('theme', t), theme);
  return context.newPage();
}

// 記事詳細とタグ詳細は一覧から先頭のものを拾う
async function collectDynamicPaths(page) {
  const pick = async (listPath, prefix) => {
    await page.goto(`${BASE_URL}${listPath}`, { waitUntil: 'networkidle' });
    const href = await page.$$eval(`a[href^="${prefix}"]`, (links) => links.map((a) => a.getAttribute('href')).find(Boolean));
    return href ? [href] : [];
  };
  return [...(await pick('/posts', '/posts/')), ...(await pick('/tags', '/tags/'))];
}

async function scan(page, pagePath) {
  await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle' });
  // client:idle / client:visible の island とアニメーションの描画を待つ
  await page.waitForTimeout(1500);
  const result = await new AxeBuilder({ page })
    .withTags(AXE_TAGS)
    .exclude('astro-dev-toolbar')
    .analyze();
  return result.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => ({
      target: n.target.join(' '),
      summary: (n.any[0]?.message ?? n.failureSummary ?? '').split('\n')[0],
    })),
  }));
}

async function main() {
  const browser = await launchBrowser();
  const rows = [];
  try {
    const first = await newThemedPage(browser, 'dark');
    const paths = [...STATIC_PATHS, ...(await collectDynamicPaths(first))];
    await first.context().close();

    for (const theme of THEMES) {
      const page = await newThemedPage(browser, theme);
      for (const p of paths) {
        for (const v of await scan(page, p)) rows.push({ theme, page: decodeURIComponent(p), ...v });
      }
      await page.context().close();
    }
  } finally {
    await browser.close();
  }

  const blocking = rows.filter((r) => BLOCKING.has(r.impact));
  const lines = [
    '# 主要ページのアクセシビリティ検査結果',
    '',
    `- 対象: ${BASE_URL}`,
    `- 実行日時: ${new Date().toISOString()}`,
    `- 違反: ${rows.length} 件（serious / critical: ${blocking.length} 件）`,
    '',
  ];
  for (const r of rows) {
    lines.push(`## [${r.impact}] ${r.id} — ${r.page}（${r.theme}）`, '', r.help, '');
    for (const n of r.nodes.slice(0, 10)) lines.push(`- \`${n.target}\` ${n.summary}`);
    if (r.nodes.length > 10) lines.push(`- ほか ${r.nodes.length - 10} 件`);
    lines.push('');
  }
  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, `${lines.join('\n')}\n`);

  console.log(`違反 ${rows.length} 件（serious / critical: ${blocking.length} 件）→ ${path.relative(process.cwd(), OUT_FILE)}`);
  if (blocking.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
