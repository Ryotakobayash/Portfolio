import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

export interface TalkMeta {
    id: string;
    title: string;
    date: string;
    event: string;
    description?: string;
    tags: string[];
    href: string;
    isExternal: boolean;
    type: 'Speaker Deck' | 'Slides';
}

interface TalkSearchProps {
    talks: TalkMeta[];
    allTags: string[];
}

type SortOrder = 'newest' | 'oldest';
const TALKS_PER_PAGE = 8;

const SearchInput = ({ query, setQuery, resetPage }: any) => (
    <div className="mb-md" style={{ position: 'relative' }}>
        <input
            type="text"
            placeholder="Search talks..."
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
);

const TagFilter = ({ allTags, selectedTags, toggleTag }: any) => (
    <div className="flex flex-wrap gap-sm mb-md">
        {allTags.map((tag: string) => {
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
                        textWrap: 'nowrap',
                    }}
                >
                    {tag}
                </button>
            );
        })}
    </div>
);

const Pagination = ({ safePage, totalPages, setCurrentPage }: any) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center" style={{ gap: '16px', marginTop: 'var(--spacing-xl)' }}>
            <button
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
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
            <span className="text-muted" style={{ fontSize: '0.7rem', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                {safePage} / {totalPages}
            </span>
            <button
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
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
    );
};

export function TalkSearch({ talks, allTags }: TalkSearchProps) {
    const [query, setQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [currentPage, setCurrentPage] = useState(1);

    const fuse = useMemo(() => {
        return new Fuse(talks, {
            keys: ['title', 'event', 'description', 'tags'],
            threshold: 0.3,
            includeScore: true,
        });
    }, [talks]);

    const filteredTalks = useMemo(() => {
        let result = query.trim()
            ? fuse.search(query).map((r) => r.item)
            : [...talks];

        if (selectedTags.size > 0) {
            result = result.filter((talk) =>
                Array.from(selectedTags).every((tag) => talk.tags.includes(tag))
            );
        }

        result.sort((a, b) =>
            sortOrder === 'newest'
                ? (a.date < b.date ? 1 : -1)
                : (a.date > b.date ? 1 : -1)
        );

        return result;
    }, [query, selectedTags, sortOrder, talks, fuse]);

    const totalPages = Math.max(1, Math.ceil(filteredTalks.length / TALKS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const pagedTalks = filteredTalks.slice(
        (safePage - 1) * TALKS_PER_PAGE,
        safePage * TALKS_PER_PAGE
    );

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
            <SearchInput query={query} setQuery={setQuery} resetPage={resetPage} />

            {allTags.length > 0 && (
                <TagFilter allTags={allTags} selectedTags={selectedTags} toggleTag={toggleTag} />
            )}

            <div className="flex justify-between items-center text-sm text-muted mb-md">
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
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                    {filteredTalks.length} talks
                </span>
            </div>

            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                {pagedTalks.map((talk) => (
                    <a
                        key={talk.id}
                        href={talk.href}
                        target={talk.isExternal ? '_blank' : undefined}
                        rel={talk.isExternal ? 'noopener noreferrer' : undefined}
                        style={{
                            display: 'block', padding: 'var(--spacing-lg)',
                            backgroundColor: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            textDecoration: 'none', color: 'inherit',
                            transition: 'border-color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                    >
                        <div className="text-muted" style={{ fontSize: '0.65rem', marginBottom: 'var(--spacing-xs)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span>{talk.date}</span>
                            <span style={{ color: 'var(--color-border)' }}>/</span>
                            <span style={{ color: 'var(--color-accent-2)', fontWeight: 600 }}>{talk.event}</span>
                            <span style={{ color: 'var(--color-border)' }}>/</span>
                            <span>{talk.type}{talk.isExternal ? ' ↗' : ''}</span>
                        </div>
                        <h2 className="font-bold" style={{ fontSize: '1.05rem', marginBottom: talk.description ? 'var(--spacing-sm)' : 0, letterSpacing: '-0.01em' }}>
                            {talk.title}
                        </h2>
                        {talk.description && (
                            <p className="text-secondary mb-sm" style={{
                                fontSize: '0.85rem',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                                {talk.description}
                            </p>
                        )}
                        {talk.tags.length > 0 && (
                            <div className="flex flex-wrap" style={{ gap: 'var(--spacing-xs)' }}>
                                {talk.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-primary font-semibold"
                                        style={{
                                            display: 'inline-flex', alignItems: 'center',
                                            padding: '1px 6px', fontSize: '0.6rem',
                                            border: '1px solid var(--color-primary)',
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

            {filteredTalks.length === 0 && (
                <p className="text-muted text-sm" style={{ textAlign: 'center', padding: 'var(--spacing-xl)', letterSpacing: '0.08em' }}>
                    No talks match your search.
                </p>
            )}

            <Pagination safePage={safePage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </div>
    );
}

export default TalkSearch;
