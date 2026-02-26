import { useState, useEffect } from 'react';

export interface ContributionDay {
    date: string;
    count: number;
    color: string;
}

export interface GitHubActivityResponse {
    totalContributions: number;
    days: ContributionDay[];
}

export function useGitHubActivity(username: string = 'Ryotakobayash') {
    const [days, setDays] = useState<ContributionDay[]>([]);
    const [totalContributions, setTotalContributions] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);

        fetch('/api/github/contributions')
            .then((res) => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
            })
            .then((data: GitHubActivityResponse) => {
                setDays(data.days);
                setTotalContributions(data.totalContributions);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch contributions:', err);
                setError('Failed to load GitHub activity');
                setIsLoading(false);
            });
    }, [username]);

    return { days, totalContributions, isLoading, error };
}
