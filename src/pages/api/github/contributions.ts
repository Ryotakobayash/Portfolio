import type { APIRoute } from 'astro';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const GITHUB_USERNAME = 'Ryotakobayash';

interface ContributionDay {
    date: string;
    contributionCount: number;
    color: string;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

interface GraphQLResponse {
    data?: {
        user?: {
            contributionsCollection: {
                contributionCalendar: {
                    totalContributions: number;
                    weeks: ContributionWeek[];
                };
            };
        };
    };
    errors?: { message: string }[];
}

/**
 * GitHub GraphQL APIからコントリビューションカレンダーデータを取得
 * GITHUB_TOKEN が設定されていればGraphQL（正確なデータ）を使用、
 * なければREST API（公開イベントベース、概算）にフォールバック。
 */
export const GET: APIRoute = async () => {
    const token = import.meta.env.GITHUB_TOKEN;

    if (token) {
        return await fetchWithGraphQL(token);
    } else {
        return await fetchWithRestAPI();
    }
};

/**
 * GraphQL API経由で正確なコントリビューションデータを取得（認証必須）
 */
async function fetchWithGraphQL(token: string): Promise<Response> {
    const query = `
        query($userName: String!) {
            user(login: $userName) {
                contributionsCollection {
                    contributionCalendar {
                        totalContributions
                        weeks {
                            contributionDays {
                                contributionCount
                                date
                                color
                            }
                        }
                    }
                }
            }
        }
    `;

    try {
        const res = await fetch(GITHUB_GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Portfolio-App',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                query,
                variables: { userName: GITHUB_USERNAME },
            }),
        });

        if (!res.ok) {
            console.error('GitHub GraphQL API error:', res.status, await res.text());
            // GraphQL失敗時はRESTにフォールバック
            return await fetchWithRestAPI();
        }

        const json: GraphQLResponse = await res.json();

        if (json.errors) {
            console.error('GraphQL errors:', json.errors);
            return await fetchWithRestAPI();
        }

        const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
        if (!calendar) {
            return await fetchWithRestAPI();
        }

        // フラットな配列に変換
        const days = calendar.weeks.flatMap((week) =>
            week.contributionDays.map((day) => ({
                date: day.date,
                count: day.contributionCount,
                color: day.color,
            }))
        );

        return new Response(
            JSON.stringify({
                totalContributions: calendar.totalContributions,
                days,
                source: 'graphql',
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'private, max-age=300',
                },
            }
        );
    } catch (err) {
        console.error('GraphQL fetch error:', err);
        return await fetchWithRestAPI();
    }
}

/**
 * REST API経由で公開イベントベースのコントリビューションデータを取得（フォールバック）
 * 直近90日・公開リポジトリのみなので概算となる。
 */
async function fetchWithRestAPI(): Promise<Response> {
    try {
        const res = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`,
            {
                headers: {
                    'User-Agent': 'Portfolio-App',
                },
            }
        );

        if (!res.ok) {
            return new Response(JSON.stringify({ error: 'GitHub API request failed' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const events: any[] = await res.json();

        if (!Array.isArray(events)) {
            return new Response(JSON.stringify({ error: 'Invalid response' }), {
                status: 502,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 過去1年分の日付を初期化
        const activityMap = new Map<string, number>();
        const now = new Date();
        for (let i = 364; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            activityMap.set(key, 0);
        }

        // イベントを日別に集計
        events.forEach((event: any) => {
            const date = event.created_at?.slice(0, 10);
            if (date && activityMap.has(date)) {
                activityMap.set(date, (activityMap.get(date) || 0) + 1);
            }
        });

        // GitHubの草カラーを模倣
        const getColor = (count: number): string => {
            if (count === 0) return '#161b22';
            if (count <= 2) return '#0e4429';
            if (count <= 5) return '#006d32';
            if (count <= 10) return '#26a641';
            return '#39d353';
        };

        let total = 0;
        const days: { date: string; count: number; color: string }[] = [];
        activityMap.forEach((count, date) => {
            total += count;
            days.push({ date, count, color: getColor(count) });
        });

        return new Response(
            JSON.stringify({
                totalContributions: total,
                days,
                source: 'rest-fallback',
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'private, max-age=300',
                },
            }
        );
    } catch (err) {
        console.error('REST API fetch error:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
