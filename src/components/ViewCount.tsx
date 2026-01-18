import { useState } from 'react';

interface ViewCountProps {
    slug: string;
}

/**
 * 記事のPV数を表示するコンポーネント
 * ダミーデータを表示（GA4 API連携は後で追加）
 */
export function ViewCount({ slug }: ViewCountProps) {
    // slugのハッシュ値からダミー数値を生成（一貫性のため）
    const [count] = useState<number>(() => {
        let hash = 0;
        for (let i = 0; i < slug.length; i++) {
            hash = ((hash << 5) - hash) + slug.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash % 500) + 50;
    });

    return (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            👁️ {count.toLocaleString()} views
        </span>
    );
}

export default ViewCount;
