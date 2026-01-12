'use client';

import { DashboardShell } from '@/components/Layout';
import { Container, Title, Text, Avatar, Group, Stack, Badge, Timeline, TimelineItem, Anchor, Progress, Paper, SimpleGrid, Divider } from '@mantine/core';
import { IconSchool, IconBriefcase, IconBrandGithub, IconPresentation, IconCode, IconExternalLink } from '@tabler/icons-react';
import styles from './page.module.css';

/**
 * 自己紹介ページ
 * 学歴、職歴、スキル、外部リンクを表示
 */
export default function AboutPage() {
    return (
        <DashboardShell>
            <Container size="md" py="xl">
                {/* Hero セクション */}
                <section className={styles.hero}>
                    <Group align="flex-start" gap="xl">
                        <Avatar size={120} radius="xl" color="cyan">
                            KR
                        </Avatar>
                        <Stack gap="xs">
                            <Title order={1}>小林 諒大</Title>
                            <Text size="lg" c="dimmed">Kobayashi Ryota</Text>
                            <Text size="md">
                                サイボウズ株式会社 プロダクトデザイナー
                            </Text>
                        </Stack>
                    </Group>
                </section>

                <Divider my="xl" />

                {/* 学歴セクション */}
                <section className={styles.section}>
                    <Group gap="sm" mb="md">
                        <IconSchool size={24} />
                        <Title order={2} size="h3">学歴</Title>
                    </Group>
                    <Timeline active={2} bulletSize={24} lineWidth={2}>
                        <TimelineItem title="長岡技術科学大学 大学院">
                            <Text c="dimmed" size="sm">工学専攻科 機械工学分野</Text>
                            <Text c="dimmed" size="sm">知的計測制御研究室</Text>
                            <Text size="xs" mt={4}>2023/4 〜 2025/3</Text>
                        </TimelineItem>
                        <TimelineItem title="長岡技術科学大学">
                            <Text c="dimmed" size="sm">工学部 機械創造工学分野</Text>
                            <Text c="dimmed" size="sm">ナノ・原子レベル解析研究室</Text>
                            <Text size="xs" mt={4}>2019/4 〜 2023/3</Text>
                        </TimelineItem>
                        <TimelineItem title="新潟県立新潟工業高等学校">
                            <Text c="dimmed" size="sm">機械科</Text>
                            <Text size="xs" mt={4}>〜 2019/3</Text>
                        </TimelineItem>
                    </Timeline>
                </section>

                <Divider my="xl" />

                {/* 職歴セクション */}
                <section className={styles.section}>
                    <Group gap="sm" mb="md">
                        <IconBriefcase size={24} />
                        <Title order={2} size="h3">職歴</Title>
                    </Group>
                    <Timeline active={0} bulletSize={24} lineWidth={2}>
                        <TimelineItem title="サイボウズ株式会社">
                            <Text c="dimmed" size="sm">開発本部 プロダクトデザイナー</Text>
                            <Text c="dimmed" size="sm">kintoneプラットフォーム</Text>
                            <Text size="xs" mt={4}>2025/4 〜 現在</Text>
                        </TimelineItem>
                    </Timeline>
                </section>

                <Divider my="xl" />

                {/* スキルセクション - デザイン */}
                <section className={styles.section}>
                    <Group gap="sm" mb="md">
                        <IconCode size={24} />
                        <Title order={2} size="h3">スキル</Title>
                    </Group>

                    {/* デザインスキル（ソフトスキル） */}
                    <Text fw={600} mb="sm">デザインスキル</Text>
                    <Stack gap="md" mb="xl">
                        <SkillBar name="UIデザイン" level={2.5} maxLevel={5} />
                        <SkillBar name="ウェブアクセシビリティ" level={2} maxLevel={5} />
                        <SkillBar name="ライティング・ドキュメンテーション" level={1.5} maxLevel={5} />
                        <SkillBar name="エクスペリエンスデザイン" level={1.5} maxLevel={5} />
                        <SkillBar name="情報設計" level={2} maxLevel={5} />
                        <SkillBar name="プロトタイピング" level={2} maxLevel={5} />
                    </Stack>

                    {/* 技術スキル */}
                    <Text fw={600} mb="sm">技術スキル</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                        <TechSkillCard
                            name="Figma"
                            years="3年程度"
                            description="アプリUIデザイン、プロトタイプ作成、コンポーネントライブラリ作成"
                        />
                        <TechSkillCard
                            name="Adobe Illustrator"
                            years="5年程度"
                            description="ロゴデザイン、印刷物作成、SVG書き出し"
                        />
                        <TechSkillCard
                            name="Affinity Designer"
                            years="3年程度"
                            description="ポスター作成、素材作成・加工、ロゴデザイン"
                        />
                        <TechSkillCard
                            name="HTML/CSS/SCSS"
                            years="4年程度"
                            description="Webサイト作成、フロントエンド実装"
                        />
                        <TechSkillCard
                            name="TypeScript"
                            years="1年未満"
                            description="Vue, React, Next.js を使用したフロントエンド開発"
                        />
                    </SimpleGrid>
                </section>

                <Divider my="xl" />

                {/* 外部リンクセクション */}
                <section className={styles.section}>
                    <Group gap="sm" mb="md">
                        <IconExternalLink size={24} />
                        <Title order={2} size="h3">外部リンク</Title>
                    </Group>
                    <Stack gap="sm">
                        <Anchor href="https://github.com/Ryotakobayash" target="_blank" size="md">
                            <Group gap="sm">
                                <IconBrandGithub size={20} />
                                GitHub
                            </Group>
                        </Anchor>
                        <Anchor href="https://speakerdeck.com/ryota5884" target="_blank" size="md">
                            <Group gap="sm">
                                <IconPresentation size={20} />
                                Speaker Deck
                            </Group>
                        </Anchor>
                        <Anchor href="https://zenn.dev/ryota5884" target="_blank" size="md">
                            <Group gap="sm">
                                <IconCode size={20} />
                                Zenn
                            </Group>
                        </Anchor>
                        <Anchor href="https://note.com/tender_hyssop572" target="_blank" size="md">
                            <Group gap="sm">
                                <IconCode size={20} />
                                note
                            </Group>
                        </Anchor>
                    </Stack>
                </section>
            </Container>
        </DashboardShell>
    );
}

/**
 * スキルバーコンポーネント（5段階評価）
 */
function SkillBar({ name, level, maxLevel }: { name: string; level: number; maxLevel: number }) {
    const percentage = (level / maxLevel) * 100;
    return (
        <div>
            <Group justify="space-between" mb={4}>
                <Text size="sm">{name}</Text>
                <Text size="xs" c="dimmed">Lv.{level}/{maxLevel}</Text>
            </Group>
            <Progress value={percentage} size="md" radius="xl" color="cyan" />
        </div>
    );
}

/**
 * 技術スキルカードコンポーネント
 */
function TechSkillCard({ name, years, description }: { name: string; years: string; description: string }) {
    return (
        <Paper p="md" radius="md" withBorder>
            <Text fw={600} mb={4}>{name}</Text>
            <Badge size="sm" variant="light" color="gray" mb="xs">{years}</Badge>
            <Text size="sm" c="dimmed">{description}</Text>
        </Paper>
    );
}
