import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DashboardShell } from '@/components/Layout';
import { Container, Title, Anchor, Group, Badge, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconCalendar, IconTag } from '@tabler/icons-react';
import { getAllTags, getPostsByTag } from '@/lib/markdown';
import styles from '../tags.module.css';

interface PageProps {
    params: Promise<{ tag: string }>;
}

/**
 * 静的パラメータ生成（SSG用）
 */
export async function generateStaticParams() {
    const tags = await getAllTags();
    return tags.map(({ tag }) => ({
        tag: encodeURIComponent(tag),
    }));
}

/**
 * メタデータ生成（SEO用）
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);

    return {
        title: `${decodedTag} の記事一覧 | Dashboard Portfolio`,
        description: `${decodedTag} タグが付いた記事の一覧`,
    };
}

/**
 * タグ別記事一覧ページ
 */
export default async function TagPage({ params }: PageProps) {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);
    const posts = await getPostsByTag(decodedTag);

    if (posts.length === 0) {
        notFound();
    }

    return (
        <DashboardShell>
            <Container size="lg" py="xl">
                {/* 戻るリンク */}
                <Group mb="lg">
                    <Link href="/tags" className={styles.backLink}>
                        <Group gap="xs">
                            <IconArrowLeft size={16} />
                            タグ一覧に戻る
                        </Group>
                    </Link>
                </Group>

                {/* タイトル */}
                <Group gap="sm" mb="xl">
                    <IconTag size={24} />
                    <Title order={1}>{decodedTag}</Title>
                    <Badge size="lg" variant="light" color="cyan">
                        {posts.length} 件
                    </Badge>
                </Group>

                {/* 記事一覧 */}
                <Stack gap="md">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/posts/${post.slug}`}
                            className={styles.tagCard}
                            style={{ display: 'block', padding: '1.25rem' }}
                        >
                            <Group gap="sm" mb="xs">
                                <IconCalendar size={14} />
                                <Text size="sm" c="dimmed">{post.date}</Text>
                            </Group>
                            <Text fw={600} size="lg" mb="xs">{post.title}</Text>
                            {post.excerpt && (
                                <Text size="sm" c="dimmed" lineClamp={2}>{post.excerpt}</Text>
                            )}
                            <Group gap="xs" mt="sm">
                                {post.tags.map((t) => (
                                    <Badge key={t} size="sm" variant="outline" color={t === decodedTag ? 'cyan' : 'gray'}>
                                        {t}
                                    </Badge>
                                ))}
                            </Group>
                        </Link>
                    ))}
                </Stack>
            </Container>
        </DashboardShell>
    );
}
