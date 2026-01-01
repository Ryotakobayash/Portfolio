import { Metadata } from 'next';
import Link from 'next/link';
import { DashboardShell } from '@/components/Layout';
import { Container, Title, Text, Badge, Group } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { getAllPosts } from '@/lib/markdown';
import styles from './posts.module.css';

export const metadata: Metadata = {
    title: 'Posts | Dashboard Portfolio',
    description: '記事一覧ページ',
};

/**
 * 記事一覧ページ
 * 全記事をカード形式で日付降順に表示
 */
export default async function PostsPage() {
    const posts = await getAllPosts();

    return (
        <DashboardShell>
            <Container size="lg" py="xl">
                <Title order={1} mb="lg">📝 Posts</Title>

                {posts.length === 0 ? (
                    <Text c="dimmed">まだ記事がありません。</Text>
                ) : (
                    <div className={styles.postsGrid}>
                        {posts.map((post) => (
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
                )}
            </Container>
        </DashboardShell>
    );
}
