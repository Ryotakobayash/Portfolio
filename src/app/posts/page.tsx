import { Metadata } from 'next';
import { DashboardShell } from '@/components/Layout';
import { Container, Title, Text } from '@mantine/core';
import { getAllPosts } from '@/lib/markdown';
import { PostSearch } from '@/components/PostSearch';

export const metadata: Metadata = {
    title: 'Posts | Dashboard Portfolio',
    description: '記事一覧ページ',
};

/**
 * 記事一覧ページ
 * クライアントサイド検索対応
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
                    <PostSearch posts={posts} />
                )}
            </Container>
        </DashboardShell>
    );
}
