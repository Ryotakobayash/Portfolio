import externalData from '../data/external-posts.json';

type ServiceType = 'zenn' | 'note';

interface ExternalPost {
    service: ServiceType;
    title: string;
    url: string;
    date: string;
}

const SERVICE_CONFIG: Record<ServiceType, { color: string; bg: string; icon: string; label: string }> = {
    zenn: {
        color: '#3EA8FF',
        bg: 'rgba(62, 168, 255, 0.1)',
        icon: '📘',
        label: 'Zenn',
    },
    note: {
        color: '#41C9B4',
        bg: 'rgba(65, 201, 180, 0.1)',
        icon: '📓',
        label: 'note',
    }
};

export default function ExternalPosts() {
    const posts = externalData.posts as ExternalPost[];

    if (!posts || posts.length === 0) return null;

    return (
        <div className="external-posts">
            <h3 style={{
                fontSize: '1.125rem', fontWeight: 700,
                marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
                <span>🌐</span> 外部プラットフォームの記事
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {posts.map((post, i) => {
                    const config = SERVICE_CONFIG[post.service] || SERVICE_CONFIG.note;
                    return (
                        <a
                            key={i}
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                padding: '16px',
                                backgroundColor: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none',
                                color: 'var(--color-text)',
                                transition: 'all 150ms ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = config.color;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-border)';
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '40px', height: '40px', borderRadius: '8px',
                                backgroundColor: config.bg, color: config.color,
                                fontSize: '1.25rem', flexShrink: 0
                            }}>
                                {config.icon}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4 }}>
                                    {post.title}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    <span style={{
                                        color: config.color, fontWeight: 600,
                                        backgroundColor: config.bg, padding: '1px 6px', borderRadius: '4px'
                                    }}>
                                        {config.label}
                                    </span>
                                    <span>{post.date === '2023-01-01' || post.date === '2024-01-01' || post.date === '2022-01-01' || post.date === '2025-01-01' ? '過去の記事' : post.date}</span>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
