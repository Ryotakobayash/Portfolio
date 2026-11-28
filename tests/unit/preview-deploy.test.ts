import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { findProductionArgs, ignoresEnvFiles } from '../../scripts/preview-deploy.mjs';

const SCRIPT = fileURLToPath(new URL('../../scripts/preview-deploy.mjs', import.meta.url));
const VERCELIGNORE = fileURLToPath(new URL('../../.vercelignore', import.meta.url));

describe('findProductionArgs', () => {
    test('本番に出すオプションを検出する', () => {
        assert.deepEqual(findProductionArgs(['--prod']), ['--prod']);
        assert.deepEqual(findProductionArgs(['--target=production']), ['--target=production']);
        assert.deepEqual(findProductionArgs(['--target', 'production']), ['--target production']);
    });

    test('プレビュー向けのオプションは通す', () => {
        assert.deepEqual(findProductionArgs([]), []);
        assert.deepEqual(findProductionArgs(['--target', 'preview', '--yes']), []);
    });
});

describe('ignoresEnvFiles', () => {
    test('.env を除外していれば true', () => {
        assert.equal(ignoresEnvFiles('# comment\n.env*\n!.env.example\n'), true);
    });

    test('.env の除外がなければ false', () => {
        assert.equal(ignoresEnvFiles('/dist/\n# .env*\n'), false);
    });

    test('リポジトリの .vercelignore は .env を除外している', () => {
        assert.equal(ignoresEnvFiles(readFileSync(VERCELIGNORE, 'utf8')), true);
    });
});

test('--prod を付けると vercel を呼ばずに終了コード 1 で止まる', () => {
    const result = spawnSync(process.execPath, [SCRIPT, '--prod'], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /本番に出すオプション/);
    assert.doesNotMatch(result.stdout, /Preview Deployment を作成します/);
});
