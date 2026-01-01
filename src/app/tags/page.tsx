import { Metadata } from 'next';
import Link from 'next/link';
import { DashboardShell } from '@/components/Layout';
import { Container, Title, Text } from '@mantine/core';
import { IconTag } from '@tabler/icons-react';
import { getAllTags } from '@/lib/markdown';
import styles from './tags.module.css';

export const metadata: Metadata = {
    title: 'Tags | Dashboard Portfolio',
    description: 'タグ一覧ページ',
};

/**
 * タグ一覧ページ
 * 全タグをバッジ形式で表示し、クリックでフィルタリング
 */
export default async function TagsPage() {
    const tags = await getAllTags();

    return (
        <DashboardShell>
            <Container size="lg" py="xl">
                <Title order={1} mb="lg">🏷️ Tags</Title>

                {tags.length === 0 ? (
                    <Text c="dimmed">まだタグがありません。</Text>
                ) : (
                    <div className={styles.tagsGrid}>
                        {tags.map(({ tag, count }) => (
                            <Link
                                key={tag}
                                href={`/tags/${encodeURIComponent(tag)}`}
                                className={styles.tagCard}
                            >
                                <IconTag size={16} />
                                <span className={styles.tagName}>{tag}</span>
                                <span className={styles.tagCount}>{count}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </Container>
        </DashboardShell>
    );
}
