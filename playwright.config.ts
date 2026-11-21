import { defineConfig, devices } from '@playwright/test';

/**
 * 主要ページの表示と API の応答形式を検証する E2E テスト。
 * astro dev を起動して実行する（Vercel アダプタは astro preview に非対応のため）。
 * Astro は dev サーバーを同時に1つしか起動できないので、ローカルでは起動中のサーバーをそのまま使う。
 */
const PORT = 4321;
const isCI = !!process.env.CI;

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 1 : 0,
    reporter: isCI ? [['github'], ['list']] : 'list',
    use: {
        baseURL: `http://localhost:${PORT}`,
        locale: 'ja-JP',
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // ローカルではインストール済みの Chrome を使い、CI では Playwright の Chromium を使う
                channel: isCI ? undefined : 'chrome',
            },
        },
    ],
    webServer: {
        command: `pnpm exec astro dev --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !isCI,
        timeout: 120_000,
    },
});
