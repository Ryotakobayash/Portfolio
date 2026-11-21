#!/usr/bin/env node
/**
 * ビルド後に Content-Security-Policy ヘッダーを生成し、Vercel の出力設定へ書き込む。
 *
 * - script-src から 'unsafe-inline' / 'unsafe-eval' を外し、許可するインラインスクリプトを sha256 ハッシュで列挙する
 * - ハッシュの収集元
 *   1. dist/client 配下の全 HTML（プリレンダーされたページ）に含まれるインラインスクリプト
 *   2. Astro がアイランドのために埋め込むランタイム（SSR ページにも出るため、パッケージから直接読む）
 * - ClientRouter はページ遷移時に遷移先のインラインスクリプトを実行するが、CSP は最初に開いたページのものが
 *   使われ続ける。そのため全ページのハッシュを1つのポリシーにまとめ、全ルートへ同じヘッダーを付ける。
 * - 出力先は .vercel/output/config.json（Build Output API）。vercel.json は静的なので、ここで生成する。
 *
 * 使い方: pnpm build の後に自動で実行される（package.json の build スクリプト）。
 *         `node scripts/csp-headers.mjs --print` でポリシーを表示するだけにもできる。
 */
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_CLIENT = path.join(ROOT, 'dist/client');
const VERCEL_CONFIG = path.join(ROOT, '.vercel/output/config.json');
const printOnly = process.argv.includes('--print');

/** ハッシュ以外のポリシー。外部サービスを追加するときはここを編集する */
const BASE_POLICY = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        'https://www.googletagmanager.com',
        'https://*.googletagmanager.com',
        'https://platform.twitter.com',
        'https://*.twimg.com',
        'https://www.instagram.com',
        'https://*.cdninstagram.com',
        'https://va.vercel-scripts.com',
    ],
    // React の style 属性や expressive-code のインラインスタイルがあるため、style-src は 'unsafe-inline' を残す
    'style-src': ["'self'", "'unsafe-inline'", 'https://platform.twitter.com'],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': [
        "'self'",
        'https://www.google-analytics.com',
        'https://*.google-analytics.com',
        'https://*.analytics.google.com',
        'https://*.googletagmanager.com',
        // GA4 の計測送信先（gtag.js が www.google.com/g/collect へ送る）
        'https://www.google.com',
        'https://vitals.vercel-insights.com',
        'https://*.vercel-insights.com',
        'https://syndication.twitter.com',
        'https://*.instagram.com',
    ],
    'frame-src': [
        "'self'",
        'https://docs.google.com',
        'https://www.youtube.com',
        'https://www.youtube-nocookie.com',
        'https://platform.twitter.com',
        'https://syndication.twitter.com',
        'https://www.instagram.com',
        'https://speakerdeck.com',
    ],
    'media-src': ["'self'", 'https:'],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
};

/** 実行されない data block（JSON-LD など）は CSP の対象外 */
const NON_EXECUTABLE_TYPE = /^(application\/(ld\+)?json|importmap|text\/(template|plain|markdown))$/i;

const sha256 = (text) => `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;

async function* walkHtml(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* walkHtml(full);
        else if (entry.name.endsWith('.html')) yield full;
    }
}

/** HTML からインラインスクリプトの本文を取り出す（src 属性つき・データブロックは除く） */
function inlineScripts(html) {
    const scripts = [];
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        const [, attrs, body] = match;
        if (/\bsrc\s*=/i.test(attrs)) continue;
        const type = attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1];
        if (type && NON_EXECUTABLE_TYPE.test(type)) continue;
        if (body.length === 0) continue;
        scripts.push(body);
    }
    return scripts;
}

/** Astro がアイランド用に埋め込むスクリプト（本番ビルド版）をパッケージから読む */
async function astroIslandScripts() {
    const require = createRequire(import.meta.url);
    const astroDir = path.dirname(require.resolve('astro/package.json'));
    const files = [
        'dist/runtime/server/astro-island.prebuilt.js',
        ...['idle', 'load', 'media', 'only', 'visible'].map((d) => `dist/runtime/client/${d}.prebuilt.js`),
    ];
    const scripts = [];
    for (const file of files) {
        const mod = await import(path.join(astroDir, file));
        scripts.push(mod.default);
    }
    return scripts;
}

function serialize(policy) {
    return Object.entries(policy)
        .map(([directive, values]) => `${directive} ${values.join(' ')}`)
        .join('; ');
}

async function main() {
    const hashes = new Map(); // hash → 出現元（ログ用）
    for await (const file of walkHtml(DIST_CLIENT)) {
        for (const body of inlineScripts(await readFile(file, 'utf8'))) {
            const hash = sha256(body);
            if (!hashes.has(hash)) hashes.set(hash, path.relative(DIST_CLIENT, file));
        }
    }
    for (const body of await astroIslandScripts()) {
        const hash = sha256(body);
        if (!hashes.has(hash)) hashes.set(hash, 'astro island runtime');
    }

    const policy = {
        ...BASE_POLICY,
        'script-src': [...BASE_POLICY['script-src'], ...[...hashes.keys()].sort()],
    };
    const csp = serialize(policy);

    if (printOnly) {
        console.log(csp);
        return;
    }

    const config = JSON.parse(await readFile(VERCEL_CONFIG, 'utf8'));
    // 再実行に備えて、以前に書き込んだ CSP ルートを取り除く（Vercel はルートの未知のキーを受け付けないため、内容で判定する）
    config.routes = (config.routes ?? []).filter(
        (route) => !(route.src === '/(.*)' && route.continue && route.headers?.['Content-Security-Policy']),
    );
    // handle: filesystem より前に置くと、静的ファイルと SSR の両方に適用される
    config.routes.unshift({
        src: '/(.*)',
        headers: { 'Content-Security-Policy': csp },
        continue: true,
    });
    await writeFile(VERCEL_CONFIG, `${JSON.stringify(config, null, 2)}\n`);

    console.log(`[csp] インラインスクリプトのハッシュ ${hashes.size} 件で CSP を生成しました（${csp.length} 文字）`);
}

main().catch((error) => {
    console.error('[csp] CSP ヘッダーの生成に失敗しました', error);
    process.exitCode = 1;
});
