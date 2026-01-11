import { Metadata } from 'next';
import Link from 'next/link';
import { DashboardShell } from '@/components/Layout';
import { Container, Title, Text, Badge, Group, Button, Pagination } from '@mantine/core';
import { IconCalendar, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import { getAllPosts } from '@/lib/markdown';
import styles from './posts.module.css';

export const metadata: Metadata = {
    title: 'Posts | Dashboard Portfolio',
    description: '記事一覧ページ',
};

const POSTS_PER_PAGE = 15;

interface PageProps {
    searchParams: Promise<{ page?: string; sort?: string }>;
}

/**
 * 記事一覧ページ
 * ソート順変更とページネーション対応
 */
export default async function PostsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1', 10);
    const sortOrder = params.sort || 'desc';

    let posts = await getAllPosts();

    // ソート順変更
    if (sortOrder === 'asc') {
        posts = [...posts].reverse();
    }

    // ページネーション
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    return (
        <DashboardShell>
            <Container size="lg" py="xl">
                <Group justify="space-between" mb="lg">
                    <Title order={1}>📝 Posts</Title>

                    {/* ソート切替ボタン */}
                    <Link
                        href={`/posts?sort=${sortOrder === 'desc' ? 'asc' : 'desc'}&page=1`}
                        style={{ textDecoration: 'none' }}
                    >
                        <Button
                            variant="subtle"
                            size="sm"
                            leftSection={sortOrder === 'desc' ? <IconSortDescending size={16} /> : <IconSortAscending size={16} />}
                        >
                            {sortOrder === 'desc' ? '新しい順' : '古い順'}
                        </Button>
                    </Link>
                </Group>

                {posts.length === 0 ? (
                    <Text c="dimmed">まだ記事がありません。</Text>
                ) : (
                    <>
                        <div className={styles.postsGrid}>
                            {paginatedPosts.map((post) => (
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

                        {/* ページネーション */}
                        {totalPages > 1 && (
                            <Group justify="center" mt="xl">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/posts?sort=${sortOrder}&page=${page}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Button
                                            variant={page === currentPage ? 'filled' : 'outline'}
                                            size="sm"
                                            color="cyan"
                                        >
                                            {page}
                                        </Button>
                                    </Link>
                                ))}
                            </Group>
                        )}
                    </>
                )}
            </Container>
        </DashboardShell>
    );
}
