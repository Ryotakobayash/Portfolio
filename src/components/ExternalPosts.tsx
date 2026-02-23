import externalData from '../data/external-posts.json';

type ServiceType = 'zenn' | 'note';

interface ExternalPost {
    service: ServiceType;
    title: string;
    url: string;
    date: string;
}

const SERVICE_CONFIG: Record<ServiceType, { color: string; label: string }> = {
    zenn: { color: 'var(--color-primary)', label: 'Zenn' },
    note: { color: 'var(--color-accent-2)', label: 'note' },
};

// Dates that are "past article" placeholders
const PAST_DATES = new Set(['2022-01-01', '2023-01-01', '2024-01-01', '2025-01-01']);

export default function ExternalPosts() {
    const posts = externalData.posts as ExternalPost[];
    if (!posts || posts.length === 0) return null;

    return (
        <div>
            {/* Section label */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '16px',
                fontSize: '0.6rem', fontWeight: 600,
                letterSpacing: '0.25em', textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
            }}>
                External Articles
                <span style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {posts.map((post, i) => {
                    const config = SERVICE_CONFIG[post.service] ?? SERVICE_CONFIG.note;
                    const dateLabel = PAST_DATES.has(post.date) ? 'Past Article' : post.date;
                    return (
                        <a
                            key={i}
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '12px 0',
                                borderBottom: '1px solid var(--color-border)',
                                textDecoration: 'none',
                                color: 'var(--color-text)',
                                transition: 'color 120ms ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text)'; }}
                        >
                            {/* Service label pill */}
                            <span style={{
                                flexShrink: 0,
                                fontSize: '0.55rem', fontWeight: 700,
                                letterSpacing: '0.15em', textTransform: 'uppercase',
                                color: config.color,
                                border: `1px solid ${config.color}`,
                                padding: '1px 5px',
                                lineHeight: 1.4,
                                minWidth: '36px',
                                textAlign: 'center',
                            }}>
                                {config.label}
                            </span>

                            {/* Title */}
                            <span style={{
                                flex: 1, minWidth: 0,
                                fontSize: '0.875rem', fontWeight: 400,
                                lineHeight: 1.5,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {post.title}
                            </span>

                            {/* Date */}
                            <span style={{
                                flexShrink: 0,
                                fontSize: '0.6rem', letterSpacing: '0.08em',
                                color: 'var(--color-text-muted)',
                            }}>
                                {dateLabel}
                            </span>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
