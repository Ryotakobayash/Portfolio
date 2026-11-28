import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { resolveIsProductionDeploy } from '../../src/utils/env.ts';

// 未公開スライドを隠すかどうかの判定。docs/talk-preview-review.md の「仕組み」と対応する
describe('resolveIsProductionDeploy', () => {
    test('Vercel の本番では隠す', () => {
        assert.equal(resolveIsProductionDeploy({ vercelEnv: 'production', isProdBuild: true }), true);
    });

    test('Vercel の Preview Deployment では見せる（本番用ビルドでも）', () => {
        assert.equal(resolveIsProductionDeploy({ vercelEnv: 'preview', isProdBuild: true }), false);
    });

    test('vercel dev（development）では見せる', () => {
        assert.equal(resolveIsProductionDeploy({ vercelEnv: 'development', isProdBuild: false }), false);
    });

    test('Vercel 以外の本番用ビルドでは隠す（フェイルセーフ）', () => {
        assert.equal(resolveIsProductionDeploy({ vercelEnv: undefined, isProdBuild: true }), true);
        assert.equal(resolveIsProductionDeploy({ vercelEnv: '', isProdBuild: true }), true);
    });

    test('開発サーバーでは見せる', () => {
        assert.equal(resolveIsProductionDeploy({ vercelEnv: undefined, isProdBuild: false }), false);
    });
});
