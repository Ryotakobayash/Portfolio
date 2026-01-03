# ADR-0002: GA4 Data API認証方式の選定

## ステータス
承認

## コンテキスト

ダッシュボードにGA4の実PVデータを表示するため、GA4 Data APIへの認証方式を選定する必要がある。

Google Cloudの公式ドキュメントでは、サービスアカウントキー（JSON形式）は以下の理由で**非推奨**とされている：

1. **流出リスク** - ファイル形式のため、コードへの誤コミットや漏洩の危険
2. **キーローテーションの手間** - 手動での定期更新が必要
3. **2024年以降のデフォルト制約** - `iam.disableServiceAccountKeyCreation`が有効

### 認証方式の比較

| 方式 | セキュリティ | 設定の複雑さ | Vercel対応 |
|------|------------|------------|-----------|
| サービスアカウントキー(JSON) | 中（流出リスク） | 簡単 | ✅ |
| Workload Identity Federation | 高（キーレス） | 中程度 | ✅ |
| サービスアカウントアタッチ | 高 | 簡単 | ❌（GCP専用） |

## 決定

**Workload Identity Federationを使用する**

### 理由

1. **キーレス認証**
   - JSONキーの管理・ローテーションが不要
   - 流出リスクがゼロ

2. **Vercel公式サポート**
   - [Vercel OIDC for GCP](https://vercel.com/docs/oidc/gcp) で手順が明確
   - VercelがOIDCトークンを発行し、GCPのWorkload Identity Poolと連携

3. **学習目的との両立**
   - 本番推奨のベストプラクティスを習得
   - APIへの理解を深める目標に合致

### 設定内容

- **GCPプロジェクトID**: `portfolio-483013`
- **Workload Identity Pool ID**: `portfolio-vercel`
- **Provider ID**: `portfolio-vercel`
- **サービスアカウント**: `vercelportfolio@portfolio-483013.iam.gserviceaccount.com`

## 参考

- [Vercel OIDC for GCP](https://vercel.com/docs/oidc/gcp)
- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)

