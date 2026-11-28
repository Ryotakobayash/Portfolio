#!/usr/bin/env node
/**
 * 手元のファイルから Vercel の Preview Deployment を作る（GitHub を経由しない）。
 * 社外に出す前の登壇スライドをレビューしてもらうときに使う。
 *
 * 使い方: pnpm preview:deploy [vercel deploy に渡す追加オプション]
 * 詳細: docs/talk-preview-review.md
 *
 * 事故防止のため、次の場合は実行せずに終了する。
 * - 本番に出すオプション（--prod / --target production）が付いている
 * - .vercelignore がない、または .env を除外していない（CLI は既定で .env をアップロードする）
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 本番デプロイにつながるオプションを返す。なければ空配列 */
export function findProductionArgs(args) {
    const found = [];
    args.forEach((arg, i) => {
        if (arg === '--prod' || arg === '--production') found.push(arg);
        if (arg === '--target=production') found.push(arg);
        if (arg === '--target' && args[i + 1] === 'production') found.push(`${arg} ${args[i + 1]}`);
    });
    return found;
}

/** .vercelignore の内容が .env を除外しているか */
export function ignoresEnvFiles(content) {
    return content
        .split('\n')
        .map((line) => line.trim())
        .some((line) => line === '.env*' || line === '.env' || line === '/.env*' || line === '/.env');
}

function main(args) {
    const productionArgs = findProductionArgs(args);
    if (productionArgs.length > 0) {
        console.error(`✖ 本番に出すオプション（${productionArgs.join(', ')}）は使えません。`);
        console.error('  本番への公開は main ブランチへのマージで行います。');
        return 1;
    }

    const ignorePath = path.join(ROOT, '.vercelignore');
    if (!existsSync(ignorePath) || !ignoresEnvFiles(readFileSync(ignorePath, 'utf8'))) {
        console.error('✖ .vercelignore がないか、.env を除外していません。');
        console.error('  このままだと .env（秘密情報）が Vercel にアップロードされるため中止します。');
        return 1;
    }

    console.log('▶ Preview Deployment を作成します（本番には出ません）');
    const result = spawnSync('pnpm', ['dlx', 'vercel', 'deploy', ...args], {
        cwd: ROOT,
        stdio: 'inherit',
    });
    if (result.status === 0) {
        console.log('\n✔ 表示された URL をレビュアーに共有してください。');
        console.log('  社外の人に見せるときは、Vercel ツールバーの Share から共有リンクを発行します。');
    }
    return result.status ?? 1;
}

// テストから import されたときは実行しない
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    process.exit(main(process.argv.slice(2)));
}
