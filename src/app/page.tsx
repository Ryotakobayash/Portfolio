import Link from 'next/link';
import { DashboardShell } from '@/components/Layout';
import { BentoGrid, BentoCard } from '@/components/BentoGrid';
import { PVChart, PostCalendar } from '@/components/Dashboard';
import { getAllPosts, getPostCount } from '@/lib/markdown';
import { Text, Avatar, Group, Badge, Stack } from '@mantine/core';
import { IconArticle } from '@tabler/icons-react';
import styles from './page.module.css';

/**
 * トップページ
 * Bento Gridレイアウトでダッシュボードを表示
 */
export default async function HomePage() {
  const posts = await getAllPosts();
  const postCount = getPostCount();

  return (
    <DashboardShell>
      <BentoGrid>
        {/* プロフィールカード */}
        <BentoCard title="Profile">
          <Group>
            <Avatar size="xl" radius="xl" color="cyan">
              KR
            </Avatar>
            <Stack gap="xs">
              <Text fw={700} size="lg">小林 諒大</Text>
              <Text c="dimmed" size="sm">Cybozu プロダクトデザイナー</Text>
              <Group gap="xs">
                <Badge variant="light" color="cyan">kintone</Badge>
                <Badge variant="light" color="pink">Figma</Badge>
                <Badge variant="light" color="grape">Next.js</Badge>
              </Group>
            </Stack>
          </Group>
          <Group justify="flex-end" mt="auto" pt="md">
            <Link href="/about" className={styles.drillDownLink}>
              詳細プロフィール →
            </Link>
          </Group>
        </BentoCard>

        {/* PV数グラフカード（ワイド） */}
        <BentoCard title="Page Views (Last 7 Days)" wide>
          <PVChart />
        </BentoCard>

        {/* 投稿カレンダーカード（ワイド） */}
        <BentoCard title="Post Activity" wide>
          <PostCalendar posts={posts.map((p) => ({ slug: p.slug, title: p.title, date: p.date }))} />
        </BentoCard>

        {/* 最新記事リストカード */}
        <BentoCard title="Latest Posts">
          <Stack gap="sm">
            {posts.length > 0 ? (
              posts.slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/posts/${post.slug}`}
                  className={styles.postLink}
                >
                  <Group gap="sm">
                    <IconArticle size={16} style={{ color: 'var(--mantine-color-cyan-5)' }} />
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>{post.title}</Text>
                      <Text size="xs" c="dimmed">{post.date}</Text>
                    </Stack>
                  </Group>
                </Link>
              ))
            ) : (
              <Text c="dimmed" size="sm">まだ記事がありません</Text>
            )}
          </Stack>
          <Group justify="space-between" mt="auto" pt="md">
            <Text size="sm" c="dimmed">Total: {postCount} posts</Text>
            <Link href="/posts" className={styles.seeAllLink}>
              すべて見る →
            </Link>
          </Group>
        </BentoCard>
      </BentoGrid>
    </DashboardShell>
  );
}
