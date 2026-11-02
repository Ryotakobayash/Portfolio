#!/usr/bin/env node
/**
 * talks ページとスライドのアクセシビリティ検査
 *
 * - axe-core で WCAG 2.1 AA 相当の違反をダーク・ライト両テーマで検査する
 * - スクリーンリーダーが受け取る内容（アクセシビリティツリー）をスライドごとに書き出す
 *   → 読み上げ機能を使わない人もテキストで読み上げ内容を確認できる
 *
 * 使い方:
 *   pnpm dev                 # 別ターミナルで起動しておく
 *   pnpm a11y:talks          # レポートを reports/a11y/talks.md に出力
 *   A11Y_BASE_URL=https://... pnpm a11y:talks   # 本番などを対象にする場合
 *
 * serious / critical の違反が 1 件でもあれば終了コード 1 で終わる。
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const BASE_URL = process.env.A11Y_BASE_URL ?? 'http://localhost:4321';
const OUT_FILE = path.resolve('reports/a11y/talks.md');
const THEMES = ['dark', 'light'];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BLOCKING = new Set(['serious', 'critical']);

// インストール済みの Chrome を優先し、なければ Playwright 同梱の Chromium を使う
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

async function runAxe(page) {
  const result = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
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

// talks 一覧からスライドを持つデッキの URL を集める（準備中のものも含む）
async function collectDeckPaths(page) {
  await page.goto(`${BASE_URL}/talks`, { waitUntil: 'networkidle' });
  const hrefs = await page.$$eval('a[href^="/slides/"]', (links) => links.map((a) => a.getAttribute('href')));
  return [...new Set(hrefs)];
}

async function slideCount(page) {
  return page.$$eval('[data-slide]', (slides) => slides.length);
}

async function nextSlide(page) {
  await page.keyboard.press('ArrowRight');
  // View Transitions の切り替えを待つ
  await page.waitForTimeout(400);
}

async function main() {
  const browser = await launchBrowser();
  const violations = []; // { theme, page, slide, ...violation }
  const readouts = []; // { deck, slides: [{ index, announce, tree }], chrome }
  let deckPaths = [];

  try {
    for (const theme of THEMES) {
      const page = await newThemedPage(browser, theme);
      deckPaths = await collectDeckPaths(page);

      for (const v of await runAxe(page)) violations.push({ theme, page: '/talks', slide: null, ...v });

      for (const deckPath of deckPaths) {
        await page.goto(`${BASE_URL}${deckPath}`, { waitUntil: 'networkidle' });
        const total = await slideCount(page);
        const readout = { deck: deckPath, chrome: '', slides: [] };

        for (let i = 1; i <= total; i++) {
          if (i > 1) await nextSlide(page);
          for (const v of await runAxe(page)) violations.push({ theme, page: deckPath, slide: i, ...v });

          // 読み上げ内容は テーマに依存しないので 1 テーマ分だけ記録する
          if (theme === THEMES[0]) {
            if (i === 1) readout.chrome = await page.locator('main').ariaSnapshot();
            readout.slides.push({
              index: i,
              announce: (await page.locator('#slide-status').textContent())?.trim() ?? '',
              tree: await page.locator('[data-slide].is-active').ariaSnapshot(),
            });
          }
        }
        if (theme === THEMES[0]) readouts.push(readout);
      }

      if (theme === THEMES[0]) {
        await page.goto(`${BASE_URL}/talks`, { waitUntil: 'networkidle' });
        readouts.unshift({ deck: '/talks', chrome: await page.locator('main').ariaSnapshot(), slides: [] });
      }
      await page.context().close();
    }
  } finally {
    await browser.close();
  }

  const blocking = violations.filter((v) => BLOCKING.has(v.impact));
  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, renderReport({ violations, readouts, deckPaths }), 'utf8');

  console.log(`検査対象: /talks と ${deckPaths.length} デッキ × ${THEMES.length} テーマ`);
  console.log(`違反: ${violations.length} 件（うち serious 以上 ${blocking.length} 件）`);
  console.log(`レポート: ${path.relative(process.cwd(), OUT_FILE)}`);
  if (blocking.length > 0) process.exitCode = 1;
}

function renderReport({ violations, readouts, deckPaths }) {
  const lines = [];
  lines.push('# talks アクセシビリティレポート', '');
  lines.push(`- 生成日時: ${new Date().toISOString()}`);
  lines.push(`- 対象: ${BASE_URL} の /talks と ${deckPaths.join(', ')}`);
  lines.push(`- テーマ: ${THEMES.join(', ')}`, '');

  lines.push('## axe の違反', '');
  if (violations.length === 0) {
    lines.push('違反はありませんでした。', '');
  } else {
    // 同じルール・同じ要素の指摘はページやスライドをまたいでまとめる
    const grouped = new Map();
    for (const v of violations) {
      for (const n of v.nodes) {
        const key = `${v.impact}|${v.id}|${n.target}|${n.summary}`;
        const entry = grouped.get(key) ?? { ...v, node: n, where: [] };
        entry.where.push(`${v.theme} ${v.page}${v.slide ? ` #${v.slide}` : ''}`);
        grouped.set(key, entry);
      }
    }
    for (const e of grouped.values()) {
      lines.push(`- [${e.impact}] ${e.id}: ${e.help}`);
      lines.push(`  - 要素: \`${e.node.target}\``);
      lines.push(`  - 内容: ${e.node.summary}`);
      lines.push(`  - 発生箇所（${e.where.length}）: ${e.where.slice(0, 8).join(' / ')}${e.where.length > 8 ? ' ほか' : ''}`);
    }
    lines.push('');
  }

  lines.push('## 読み上げ内容', '');
  lines.push('スクリーンリーダーが受け取る情報（アクセシビリティツリー）を、読み上げられる順に並べています。');
  lines.push('`heading [level=2]` は見出しレベル2、`img "..."` は画像の代替テキスト、`link "..."` はリンク名です。', '');
  for (const r of readouts) {
    lines.push(`### ${r.deck}`, '');
    if (r.chrome) {
      lines.push(r.slides.length ? 'ページ全体（1枚目表示時）:' : 'ページ全体:', '');
      lines.push('```yaml', r.chrome, '```', '');
    }
    for (const s of r.slides) {
      lines.push(`#### スライド ${s.index}`, '');
      if (s.announce) lines.push(`切り替え時の通知: 「${s.announce}」`, '');
      lines.push('```yaml', s.tree || '（読み上げる内容なし）', '```', '');
    }
  }
  return lines.join('\n');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
