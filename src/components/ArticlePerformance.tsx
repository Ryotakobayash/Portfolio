import { useEffect, useState } from 'react';

interface Props {
    slug: string;
    wordCount: number;
    readingTime: number;
    publishDate: string; // YYYY-MM-DD
}

export default function ArticlePerformance({ slug, wordCount, readingTime, publishDate }: Props) {
    const [viewCount, setViewCount] = useState<number | null>(null);

    // PV取得
    useEffect(() => {
        fetch(`/api/pv/${slug}`)
            .then((res) => res.json())
            .then((json) => setViewCount(json.count))
            .catch(() => setViewCount(null));
    }, [slug]);

    // YYYY/MM/DD形式にフォーマット
    const formattedDate = publishDate.replace(/-/g, '/');

    const metrics = [
        {
            label: 'Published',
            value: formattedDate,
            suffix: ''
        },
        {
            label: 'Reading Time',
            value: readingTime,
            suffix: 'min'
        },
        {
            label: 'Views (30d)',
            value: viewCount !== null ? viewCount.toLocaleString() : '--',
            suffix: 'PV'
        },
        {
            label: 'Word Count',
            value: wordCount.toLocaleString(),
            suffix: 'chars'
        }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '1px',
            marginBottom: '32px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-border)',
        }}>
            {metrics.map((metric, i) => (
                <div key={i} style={{
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    padding: '14px 16px',
                    backgroundColor: 'var(--color-bg-secondary)',
                }}>
                    <span style={{
                        fontSize: '0.55rem', fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.2em',
                    }}>
                        {metric.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--color-text)', lineHeight: 1 }}>
                            {metric.value}
                        </span>
                        {metric.suffix && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                                {metric.suffix}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
