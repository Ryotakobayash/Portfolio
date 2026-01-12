'use client';

import { useEffect, useState } from 'react';
import { Text, Group } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';

interface ViewCountProps {
    slug: string;
}

interface PVResponse {
    slug: string;
    pv: number;
    source: string;
    error?: string;
}

/**
 * 記事の閲覧回数を表示するコンポーネント
 */
export function ViewCount({ slug }: ViewCountProps) {
    const [pv, setPv] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchPV() {
            try {
                const res = await fetch(`/api/pv/${encodeURIComponent(slug)}`);
                if (!res.ok) throw new Error('Failed to fetch PV');

                const json: PVResponse = await res.json();
                setPv(json.pv);
            } catch (err) {
                console.error('ViewCount fetch error:', err);
                setPv(null);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPV();
    }, [slug]);

    if (isLoading) {
        return (
            <Group gap={4}>
                <IconEye size={14} />
                <Text size="sm" c="dimmed">...</Text>
            </Group>
        );
    }

    if (pv === null) {
        return null;
    }

    return (
        <Group gap={4}>
            <IconEye size={14} />
            <Text size="sm" c="dimmed">{pv.toLocaleString()} views</Text>
        </Group>
    );
}
