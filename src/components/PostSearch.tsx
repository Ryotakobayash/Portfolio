import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

interface PostMeta {
    slug: string;
    title: string;
    date: string;
    excerpt?: string;
    tags: string[];
}

interface PostSearchProps {
    posts: PostMeta[];
}

/**
 * 記事検索コンポーネント（Fuse.jsによるファジー検索）
 * Mantine依存を削除しVanilla CSSで実装
 */
export function PostSearch({ posts }: PostSearchProps) {
    const [query, setQuery] = useState('');

    // Fuse.jsのインスタンスをメモ化
    const fuse = useMemo(() => {
        return new Fuse(posts, {
            keys: ['title', 'excerpt', 'tags'],
            threshold: 0.3,
            includeScore: true,
        });
    }, [posts]);

    // 検索結果
    const results = useMemo(() => {
        if (!query.trim()) {
            return posts;
        }
        return fuse.search(query).map((result) => result.item);
    }, [query, posts, fuse]);

    return (
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            {/* 検索入力 */}
            <div style={{ position: 'relative', marginBottom: 'var(--spacing-lg)' }}>
                <span
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                        fontSize: '1rem',
                    }}
                >
                    🔍
                </span>
                <input
                    type="text"
                    placeholder="記事を検索..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        fontSize: '1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-card)',
                        color: 'var(--color-text)',
                        outline: 'none',
                        transition: 'border-color var(--transition-fast)',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                />
            </div>

            {/* 検索結果カウント */}
            {query && (
                <p
                    style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        marginBottom: 'var(--spacing-md)',
                    }}
                >
                    {results.length}件の記事が見つかりました
                </p>
            )}

            {/* 記事リスト */}
            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                {results.map((post) => (
                    <a
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        style={{
                            display: 'block',
                            padding: 'var(--spacing-lg)',
                            backgroundColor: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <div
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--color-text-muted)',
                                marginBottom: 'var(--spacing-sm)',
                            }}
                        >
                            📅 {post.date}
                        </div>
                        <h2
                            style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                marginBottom: 'var(--spacing-sm)',
                            }}
                        >
                            {post.title}
                        </h2>
                        {post.excerpt && (
                            <p
                                style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--color-text-secondary)',
                                    marginBottom: 'var(--spacing-md)',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {post.excerpt}
                            </p>
                        )}
                        {post.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            padding: '2px 8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 500,
                                            borderRadius: 'var(--radius-sm)',
                                            backgroundColor: 'var(--color-accent-light)',
                                            color: 'var(--color-accent)',
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </a>
                ))}
            </div>

            {/* 検索結果なし */}
            {results.length === 0 && query && (
                <p
                    style={{
                        textAlign: 'center',
                        color: 'var(--color-text-muted)',
                        padding: 'var(--spacing-xl)',
                    }}
                >
                    「{query}」に一致する記事が見つかりませんでした
                </p>
            )}
        </div>
    );
}

export default PostSearch;
