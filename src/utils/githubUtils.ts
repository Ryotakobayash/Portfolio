import type { ContributionDay } from '../hooks/useGitHubActivity';

// Retro contribution color scale (4 levels, no GitHub green dependency)
export function retroColor(count: number, isDark: boolean): string {
    if (count === 0) return isDark ? '#2A2A2A' : '#E0D8CC';
    if (count <= 2) return isDark ? '#3D5C52' : '#8AB8A8';
    if (count <= 5) return isDark ? '#5C7F71' : '#5C7F71';
    return isDark ? '#7AA090' : '#3A6357';
}

// 週ごとにグループ化（日曜始まり、GitHub準拠）
export function groupContributionsByWeek(days: ContributionDay[]) {
    if (days.length === 0) return [];

    const result: (ContributionDay | null)[][] = [];
    let currentWeek: (ContributionDay | null)[] = [];

    // 最初の日の曜日を取得し、それ以前をnullで埋める
    if (days.length > 0) {
        const firstDayOfWeek = new Date(days[0].date).getUTCDay(); // 0=Sun
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }
    }

    for (const day of days) {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            result.push(currentWeek);
            currentWeek = [];
        }
    }

    // 最後の不完全な週を追加
    if (currentWeek.length > 0) {
        result.push(currentWeek);
    }

    return result;
}

// 月ラベルを計算
export function calculateMonthLabels(weeks: (ContributionDay | null)[][]) {
    if (weeks.length === 0) return [];

    const labels: { text: string; col: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;

    weeks.forEach((week, colIndex) => {
        // 週の最初の有効な日を取得
        const firstDay = week.find((d) => d !== null);
        if (firstDay) {
            const month = new Date(firstDay.date).getUTCMonth();
            if (month !== lastMonth) {
                labels.push({ text: monthNames[month], col: colIndex });
                lastMonth = month;
            }
        }
    });

    return labels;
}
