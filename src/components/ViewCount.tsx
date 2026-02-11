import { useEffect, useState } from 'react';

interface ViewCountProps {
    slug: string;
}

/**
 * 記事のPV数を表示するコンポーネント
 * /api/pv/{slug} からデータ取得
 */
export function ViewCount({ slug }: ViewCountProps) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        fetch(`/api/pv/${slug}`)
            .then((res) => res.json())
            .then((json) => setCount(json.count))
            .catch(() => setCount(null));
    }, [slug]);

    if (count === null) {
        return (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                👁️ --
            </span>
        );
    }

    return (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            👁️ {count.toLocaleString()} views
        </span>
    );
}

export default ViewCount;
