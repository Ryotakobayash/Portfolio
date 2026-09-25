import { useEffect, useState } from 'react';
import type { ArticlePvResponse } from '../types/pv';

interface Props {
    slug: string;
    wordCount: number;
    readingTime: number;
    publishDate: string;
}

type PvState =
    | { status: 'loading'; periodDays: number }
    | { status: 'ready'; count: number; periodDays: number }
    | { status: 'demo'; periodDays: number }
    | { status: 'unavailable'; periodDays: number };

export default function ArticlePerformance({ slug, wordCount, readingTime, publishDate }: Props) {
    const [pvState, setPvState] = useState<PvState>({ status: 'loading', periodDays: 30 });

    useEffect(() => {
        const controller = new AbortController();
        setPvState({ status: 'loading', periodDays: 30 });

        fetch(`/api/pv/${encodeURIComponent(slug)}`, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json() as Promise<ArticlePvResponse>;
            })
            .then((data) => {
                if (data.source === 'ga4' && typeof data.count === 'number') {
                    setPvState({ status: 'ready', count: data.count, periodDays: data.periodDays });
                } else if (data.source === 'dummy') {
                    setPvState({ status: 'demo', periodDays: data.periodDays });
                } else {
                    setPvState({ status: 'unavailable', periodDays: data.periodDays });
                }
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') return;
                setPvState({ status: 'unavailable', periodDays: 30 });
            });

        return () => controller.abort();
    }, [slug]);

    const formattedDate = publishDate.replace(/-/g, '/');
    const pvValue = pvState.status === 'ready'
        ? pvState.count.toLocaleString()
        : pvState.status === 'demo'
            ? 'DEMO'
            : pvState.status === 'unavailable'
                ? 'N/A'
                : '--';

    const metrics = [
        { label: 'Published', value: formattedDate, suffix: '' },
        { label: 'Reading Time', value: readingTime, suffix: 'min' },
        { label: `Views (${pvState.periodDays}d)`, value: pvValue, suffix: pvState.status === 'ready' ? 'PV' : '' },
        { label: 'Character Count', value: wordCount.toLocaleString(), suffix: 'chars' },
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
            {metrics.map((metric) => (
                <div key={metric.label} style={{
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
