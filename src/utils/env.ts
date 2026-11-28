export interface DeployEnv {
    /** Vercel のシステム環境変数 `VERCEL_ENV`（production / preview / development）。Vercel 以外では undefined */
    vercelEnv: string | undefined;
    /** 本番用ビルドかどうか（`import.meta.env.PROD`） */
    isProdBuild: boolean;
}

/**
 * 未公開コンテンツを隠すべき「本番公開環境」かどうかを判定する（純粋関数。テスト用に分離）。
 *
 * - Vercel 上: `VERCEL_ENV` で判定する。`production` のときだけ true。
 *   Preview Deployment（ブランチ push / `vercel deploy`）では false になり、
 *   未公開スライドをレビュー用に表示できる。
 * - Vercel 以外（ローカルの `pnpm build` など）: `isProdBuild` で判定する。
 *   環境変数がないときは本番扱い（隠す側）に倒すフェイルセーフ。
 */
export function resolveIsProductionDeploy({ vercelEnv, isProdBuild }: DeployEnv): boolean {
    if (vercelEnv) {
        return vercelEnv === 'production';
    }
    return isProdBuild;
}

/** 実行中の環境が本番公開環境かどうか。詳細は docs/talk-preview-review.md を参照 */
export function isProductionDeploy(): boolean {
    return resolveIsProductionDeploy({
        vercelEnv: process.env.VERCEL_ENV,
        isProdBuild: import.meta.env.PROD,
    });
}
