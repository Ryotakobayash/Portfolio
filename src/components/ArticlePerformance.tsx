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

    // 公開からの日数を計算
    const daysSincePublish = Math.max(0, Math.floor((new Date().getTime() - new Date(publishDate).getTime()) / (1000 * 60 * 60 * 24)));

    const metrics = [
        {
            icon: '👁️',
            label: 'Views (30d)',
            value: viewCount !== null ? viewCount.toLocaleString() : '--',
            suffix: 'PV'
        },
        {
            icon: '📝',
            label: 'Word Count',
            value: wordCount.toLocaleString(),
            suffix: '文字'
        },
        {
            icon: '⏱️',
            label: 'Reading Time',
            value: readingTime,
            suffix: '分'
        },
        {
            icon: '📅',
            label: 'Published',
            value: daysSincePublish,
            suffix: '日前'
        }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '32px',
            padding: '16px',
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
        }}>
            {metrics.map((metric, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{metric.icon}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {metric.label}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
                            {metric.value}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {metric.suffix}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
