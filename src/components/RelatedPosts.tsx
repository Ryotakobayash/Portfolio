interface PostMeta {
    slug: string;
    title: string;
    tags: string[];
    date: string;
}

interface Props {
    currentSlug: string;
    currentTags: string[];
    allPosts: PostMeta[];
}

/**
 * 関連記事レコメンド コンポーネント
 * 共通タグ数でスコアリングし、上位3件を表示
 */
export default function RelatedPosts({ currentSlug, currentTags, allPosts }: Props) {
    // 共通タグ数でスコアリング
    const scored = allPosts
        .filter((p) => p.slug !== currentSlug)
        .map((post) => {
            const commonTags = post.tags.filter((t) => currentTags.includes(t));
            return { ...post, score: commonTags.length, commonTags };
        })
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score || (a.date < b.date ? 1 : -1))
        .slice(0, 3);

    if (scored.length === 0) return null;

    return (
        <div style={{ marginTop: '24px' }}>
            <h3 style={{
                fontSize: '0.9rem', fontWeight: 600,
                color: 'var(--color-text-muted)', textTransform: 'uppercase',
                letterSpacing: '0.05em', marginBottom: '12px',
            }}>
                📎 関連記事
            </h3>
            <div style={{
                display: 'grid', gap: '12px',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            }}>
                {scored.map((post) => (
                    <a
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        style={{
                            display: 'flex', flexDirection: 'column', gap: '6px',
                            padding: '12px', borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-bg-secondary)',
                            textDecoration: 'none', color: 'inherit',
                            transition: 'transform 150ms ease, box-shadow 150ms ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span style={{
                            fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4,
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                            {post.title}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {post.date}
                        </span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {post.commonTags.map((tag) => (
                                <span key={tag} style={{
                                    fontSize: '0.65rem', padding: '1px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)',
                                    fontWeight: 500,
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
