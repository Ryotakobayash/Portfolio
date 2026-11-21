import { expect, test } from '@playwright/test';

/** ページ読み込み中に出たコンソールエラーと未捕捉例外を集める */
function collectErrors(page: import('@playwright/test').Page): string[] {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
    });
    return errors;
}

/** 外部サービス（GA・X など）起因のエラーはテスト対象外にする */
const isOwnError = (text: string) => !/googletagmanager|google-analytics|twitter|instagram|vercel-scripts|Failed to load resource/i.test(text);

// トップページは現状 h1 を持たないため、見出しの検査対象から外している
const PAGES = [
    { path: '/', name: 'トップ', hasH1: false },
    { path: '/about', name: 'About', hasH1: true },
    { path: '/posts', name: '記事一覧', hasH1: true },
    { path: '/tags', name: 'タグ一覧', hasH1: true },
    { path: '/talks', name: '登壇一覧', hasH1: true },
];

for (const { path, name, hasH1 } of PAGES) {
    test(`${name}（${path}）が表示される`, async ({ page }) => {
        const errors = collectErrors(page);
        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        if (hasH1) await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.locator('main')).toBeVisible();
        expect(errors.filter(isOwnError)).toEqual([]);
    });
}

test('記事詳細が表示され、目次と本文がある', async ({ page }) => {
    await page.goto('/posts');
    const firstPost = page.locator('a.post-card').first();
    const href = await firstPost.getAttribute('href');
    expect(href).toMatch(/^\/posts\//);

    const errors = collectErrors(page);
    const response = await page.goto(href as string);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1.article-title')).toBeVisible();
    await expect(page.locator('.prose')).not.toBeEmpty();
    expect(errors.filter(isOwnError)).toEqual([]);
});

test('記事一覧のタグ絞り込みで件数が減る', async ({ page }) => {
    await page.goto('/posts');
    const cards = page.locator('a.post-card');
    await expect(cards.first()).toBeVisible();
    const before = await cards.count();

    await page.locator('fieldset button[aria-pressed]').first().click();
    await expect(page.locator('fieldset button[aria-pressed="true"]')).toHaveCount(1);
    await expect.poll(() => cards.count()).toBeLessThanOrEqual(before);
});

test('存在しないページは 404 を返す', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
});
