import { expect, test } from '@playwright/test';

/**
 * API Routes の応答形式テスト。
 * GA4 の認証情報がない環境ではダミーデータ、外部取得に失敗した場合はフォールバックを返す仕様なので、
 * どの経路でも同じ形のレスポンスになることを確認する。
 */

test('PV ランキング API が上位記事の配列を返す', async ({ request }) => {
    const response = await request.get('/api/pv/ranking');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body.ranking)).toBe(true);
    for (const item of body.ranking) {
        expect(item).toEqual(expect.objectContaining({ path: expect.stringMatching(/^\/posts\//), title: expect.any(String) }));
        expect(typeof item.pv).toBe('number');
    }
});

test('記事別 PV API が件数を返し、不正な slug は 400 / 未公開は 404 になる', async ({ request, page }) => {
    await page.goto('/posts');
    const href = await page.locator('a.post-card').first().getAttribute('href');
    const slug = decodeURIComponent((href as string).replace(/^\/posts\//, ''));

    const ok = await request.get(`/api/pv/${encodeURIComponent(slug)}`);
    expect(ok.ok()).toBeTruthy();
    const body = await ok.json();
    expect(body).toEqual(expect.objectContaining({ slug, periodDays: 30, source: expect.stringMatching(/^(ga4|dummy|fallback)$/) }));
    expect(body.count === null || typeof body.count === 'number').toBe(true);

    expect((await request.get(`/api/pv/${encodeURIComponent('a<b')}`)).status()).toBe(400);
    expect((await request.get('/api/pv/no-such-post-slug')).status()).toBe(404);
});

test('note 記事 API が記事配列を返す', async ({ request }) => {
    const response = await request.get('/api/note/posts');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.source).toMatch(/^(note-rss|static-fallback)$/);
    expect(Array.isArray(body.posts)).toBe(true);
    for (const post of body.posts) {
        expect(post).toEqual(expect.objectContaining({ title: expect.any(String), url: expect.stringMatching(/^https?:\/\//) }));
    }
});
