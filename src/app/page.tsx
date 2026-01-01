import Link from 'next/link';
import { DashboardShell } from '@/components/Layout';
import { BentoGrid, BentoCard } from '@/components/BentoGrid';
import { PVChart } from '@/components/Dashboard';
import { getAllPosts, getPostCount } from '@/lib/markdown';
import { Text, Avatar, Group, Badge, Stack, Anchor } from '@mantine/core';
import { IconBrandGithub, IconBrandTwitter, IconArticle, IconCode } from '@tabler/icons-react';

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
              <Text fw={700} size="lg">Kobayashi Ryota</Text>
              <Text c="dimmed" size="sm">Software Engineer</Text>
              <Group gap="xs">
                <Badge variant="light" color="cyan">React</Badge>
                <Badge variant="light" color="blue">TypeScript</Badge>
                <Badge variant="light" color="grape">Next.js</Badge>
              </Group>
            </Stack>
          </Group>
        </BentoCard>

        {/* PV数グラフカード（ワイド） */}
        <BentoCard title="Page Views (Last 7 Days)" wide>
          <PVChart />
        </BentoCard>

        {/* 最新記事リストカード */}
        <BentoCard title="Latest Posts">
          <Stack gap="sm">
            {posts.length > 0 ? (
              posts.slice(0, 3).map((post) => (
                <Anchor
                  key={post.slug}
                  component={Link}
                  href={`/posts/${post.slug}`}
                  underline="never"
                  c="inherit"
                >
                  <Group gap="sm">
                    <IconArticle size={16} style={{ color: 'var(--mantine-color-cyan-5)' }} />
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>{post.title}</Text>
                      <Text size="xs" c="dimmed">{post.date}</Text>
                    </Stack>
                  </Group>
                </Anchor>
              ))
            ) : (
              <Text c="dimmed" size="sm">まだ記事がありません</Text>
            )}
          </Stack>
          <Group justify="space-between" mt="auto" pt="md">
            <Text size="sm" c="dimmed">Total: {postCount} posts</Text>
            <Anchor component={Link} href="/posts" size="sm">
              すべて見る →
            </Anchor>
          </Group>
        </BentoCard>

        {/* GitHub活動カード */}
        <BentoCard title="GitHub Activity">
          <Stack gap="sm">
            <Group gap="sm">
              <IconBrandGithub size={20} />
              <Text size="sm" fw={500}>This Week</Text>
            </Group>
            <Group gap="lg">
              <Stack gap={0} align="center">
                <Text size="xl" fw={700} c="cyan">24</Text>
                <Text size="xs" c="dimmed">Commits</Text>
              </Stack>
              <Stack gap={0} align="center">
                <Text size="xl" fw={700} c="green">5</Text>
                <Text size="xs" c="dimmed">PRs</Text>
              </Stack>
              <Stack gap={0} align="center">
                <Text size="xl" fw={700} c="yellow">12</Text>
                <Text size="xs" c="dimmed">Reviews</Text>
              </Stack>
            </Group>
          </Stack>
        </BentoCard>

        {/* スキルセットカード */}
        <BentoCard title="Tech Stack">
          <Group gap="xs" wrap="wrap">
            <Badge leftSection={<IconCode size={12} />} variant="outline" color="cyan">React</Badge>
            <Badge leftSection={<IconCode size={12} />} variant="outline" color="blue">TypeScript</Badge>
            <Badge leftSection={<IconCode size={12} />} variant="outline" color="grape">Next.js</Badge>
            <Badge leftSection={<IconCode size={12} />} variant="outline" color="orange">Node.js</Badge>
            <Badge leftSection={<IconCode size={12} />} variant="outline" color="teal">GraphQL</Badge>
            <Badge leftSection={<IconCode size={12} />} variant="outline" color="pink">Mantine</Badge>
          </Group>
        </BentoCard>

        {/* SNSリンクカード */}
        <BentoCard title="Connect">
          <Stack gap="sm">
            <Group gap="sm">
              <IconBrandGithub size={20} />
              <Anchor href="https://github.com" target="_blank" size="sm">
                GitHub
              </Anchor>
            </Group>
            <Group gap="sm">
              <IconBrandTwitter size={20} />
              <Anchor href="https://twitter.com" target="_blank" size="sm">
                Twitter / X
              </Anchor>
            </Group>
          </Stack>
        </BentoCard>
      </BentoGrid>
    </DashboardShell>
  );
}
