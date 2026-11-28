/**
 * 未公開コンテンツを隠すべき「本番公開環境」かどうかを返す。
 *
 * - Vercel 上: `VERCEL_ENV` で判定する。`production` のときだけ true。
 *   Preview Deployment（ブランチ push / `vercel deploy`）では false になり、
 *   未公開スライドをレビュー用に表示できる。
 * - Vercel 以外（ローカルの `pnpm build && pnpm preview` など）:
 *   従来どおり `import.meta.env.PROD` で判定する。
 *   環境変数がないときは本番扱い（隠す側）に倒すフェイルセーフ。
 */
export function isProductionDeploy(): boolean {
    const vercelEnv = process.env.VERCEL_ENV;
    if (vercelEnv) {
        return vercelEnv === 'production';
    }
    return import.meta.env.PROD;
}
