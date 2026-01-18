import { useEffect, useState } from 'react';

interface ViewCountProps {
    slug: string;
}

/**
 * 記事のPV数を表示するコンポーネント
 * /api/pv/[slug] からデータ取得
 */
export function ViewCount({ slug }: ViewCountProps) {
    const [count, setCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchViewCount() {
            try {
                const res = await fetch(`/api/pv/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count);
                }
            } catch (err) {
                console.error('Failed to fetch view count:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchViewCount();
    }, [slug]);

    if (isLoading) {
        return (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                👁️ ...
            </span>
        );
    }

    if (count === null) {
        return null;
    }

    return (
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            👁️ {count.toLocaleString()} views
        </span>
    );
}

export default ViewCount;
