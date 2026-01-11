'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { TextInput, Badge, Group } from '@mantine/core';
import { IconSearch, IconCalendar } from '@tabler/icons-react';
import styles from './PostSearch.module.css';

interface PostMeta {
    slug: string;
    title: string;
    date: string;
    excerpt?: string;
    tags: string[];
    contentText?: string;
}

interface PostSearchProps {
    posts: PostMeta[];
}

/**
 * 記事検索コンポーネント（Fuse.jsによるファジー検索）
 */
export function PostSearch({ posts }: PostSearchProps) {
    const [query, setQuery] = useState('');

    // Fuse.jsのインスタンスをメモ化
    const fuse = useMemo(() => {
        return new Fuse(posts, {
            keys: ['title', 'excerpt', 'tags', 'contentText'],
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
        <div className={styles.searchContainer}>
            <TextInput
                placeholder="記事を検索..."
                leftSection={<IconSearch size={16} />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
                size="md"
            />

            {query && (
                <p className={styles.resultCount}>
                    {results.length}件の記事が見つかりました
                </p>
            )}

            <div className={styles.postsGrid}>
                {results.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        className={styles.postCard}
                    >
                        <div className={styles.postMeta}>
                            <IconCalendar size={14} />
                            <span className={styles.postDate}>{post.date}</span>
                        </div>
                        <h2 className={styles.postTitle}>{post.title}</h2>
                        {post.excerpt && (
                            <p className={styles.postExcerpt}>{post.excerpt}</p>
                        )}
                        {post.tags.length > 0 && (
                            <Group gap="xs" mt="sm">
                                {post.tags.map((tag) => (
                                    <Badge key={tag} size="sm" variant="outline" color="cyan">
                                        {tag}
                                    </Badge>
                                ))}
                            </Group>
                        )}
                    </Link>
                ))}
            </div>

            {results.length === 0 && query && (
                <p className={styles.noResults}>
                    「{query}」に一致する記事が見つかりませんでした
                </p>
            )}
        </div>
    );
}
