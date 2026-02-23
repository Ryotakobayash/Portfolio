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
    allTags: string[];
}

type SortOrder = 'newest' | 'oldest';
const POSTS_PER_PAGE = 6;

/**
 * 記事検索・フィルタ・ソート・ページネーション
 */
export function PostSearch({ posts, allTags }: PostSearchProps) {
    const [query, setQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [currentPage, setCurrentPage] = useState(1);

    const fuse = useMemo(() => {
        return new Fuse(posts, {
            keys: ['title', 'excerpt', 'tags'],
            threshold: 0.3,
            includeScore: true,
        });
    }, [posts]);

    // フィルタ → 検索 → ソート
    const filteredPosts = useMemo(() => {
        let result = query.trim()
            ? fuse.search(query).map((r) => r.item)
            : [...posts];

        // タグ絞り込み
        if (selectedTags.size > 0) {
            result = result.filter((post) =>
                Array.from(selectedTags).every((tag) => post.tags.includes(tag))
            );
        }

        // ソート
        result.sort((a, b) =>
            sortOrder === 'newest'
                ? (a.date < b.date ? 1 : -1)
                : (a.date > b.date ? 1 : -1)
        );

        return result;
    }, [query, selectedTags, sortOrder, posts, fuse]);

    // ページネーション
    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const pagedPosts = filteredPosts.slice(
        (safePage - 1) * POSTS_PER_PAGE,
        safePage * POSTS_PER_PAGE
    );

    // フィルタ変更時にページリセット
    const resetPage = () => setCurrentPage(1);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) => {
            const next = new Set(prev);
            if (next.has(tag)) next.delete(tag);
            else next.add(tag);
            return next;
        });
        resetPage();
    };

    return (
        <div>
            {/* 検索バー */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); resetPage(); }}
                    style={{
                        width: '100%', padding: '10px 14px', fontSize: '0.875rem',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text)',
                        outline: 'none', transition: 'border-color var(--transition-fast)',
                        boxSizing: 'border-box', fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.02em',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                />
            </div>

            {/* タグフィルタ */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {allTags.map((tag) => {
                    const isActive = selectedTags.has(tag);
                    return (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            style={{
                                padding: '3px 10px',
                                fontSize: '0.65rem', fontWeight: 600,
                                letterSpacing: '0.06em',
                                cursor: 'pointer',
                                border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                color: isActive ? 'var(--color-bg)' : 'var(--color-text-muted)',
                                transition: 'all var(--transition-fast)',
                                fontFamily: 'var(--font-sans)',
                            }}
                        >
                            {tag}
                        </button>
                    );
                })}
            </div>

            {/* ソート + 件数 */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '16px', fontSize: '0.875rem', color: 'var(--color-text-muted)',
            }}>
                <select
                    value={sortOrder}
                    onChange={(e) => { setSortOrder(e.target.value as SortOrder); resetPage(); }}
                    style={{
                        padding: '4px 10px', fontSize: '0.7rem',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text)',
                        cursor: 'pointer', letterSpacing: '0.06em',
                        fontFamily: 'var(--font-sans)',
                    }}
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>{filteredPosts.length} posts</span>
            </div>

            {/* 記事リスト */}
            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                {pagedPosts.map((post) => (
                    <a
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        style={{
                            display: 'block', padding: 'var(--spacing-lg)',
                            backgroundColor: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            textDecoration: 'none', color: 'inherit',
                            transition: 'border-color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                        }}
                    >
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                            {post.date}
                        </div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-sm)', letterSpacing: '-0.01em' }}>
                            {post.title}
                        </h2>
                        {post.excerpt && (
                            <p style={{
                                fontSize: '0.875rem', color: 'var(--color-text-secondary)',
                                marginBottom: 'var(--spacing-md)',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                                {post.excerpt}
                            </p>
                        )}
                        {post.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center',
                                            padding: '1px 6px', fontSize: '0.6rem', fontWeight: 600,
                                            border: '1px solid var(--color-primary)',
                                            color: 'var(--color-primary)',
                                            letterSpacing: '0.05em', textTransform: 'uppercase',
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

            {/* 結果なし */}
            {filteredPosts.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--spacing-xl)', fontSize: '0.875rem', letterSpacing: '0.08em' }}>
                    No posts match your search.
                </p>
            )}

            {/* ページネーション */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    gap: '16px', marginTop: 'var(--spacing-xl)',
                }}>
                    <button
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        style={{
                            padding: '6px 16px', fontSize: '0.75rem',
                            letterSpacing: '0.08em', cursor: safePage <= 1 ? 'default' : 'pointer',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-card)', color: safePage <= 1 ? 'var(--color-text-muted)' : 'var(--color-text)',
                            opacity: safePage <= 1 ? 0.5 : 1,
                            fontFamily: 'var(--font-sans)',
                        }}
                    >
                        ← Prev
                    </button>
                    <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        {safePage} / {totalPages}
                    </span>
                    <button
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        style={{
                            padding: '6px 16px', fontSize: '0.75rem',
                            letterSpacing: '0.08em', cursor: safePage >= totalPages ? 'default' : 'pointer',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-bg-card)', color: safePage >= totalPages ? 'var(--color-text-muted)' : 'var(--color-text)',
                            opacity: safePage >= totalPages ? 0.5 : 1,
                            fontFamily: 'var(--font-sans)',
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

export default PostSearch;
