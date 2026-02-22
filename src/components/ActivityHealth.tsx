import { useState, useEffect } from 'react';

export default function ActivityHealth() {
    const [weeks, setWeeks] = useState<boolean[]>(new Array(12).fill(false));

    useEffect(() => {
        fetch('/api/github/contributions')
            .then((res) => res.json())
            .then((data) => {
                if (data.days && Array.isArray(data.days)) {
                    // days は { date, count, color } の配列（過去1年分）
                    // 直近12週 = 直近84日の日ごとのデータを7日ごとにグループ化
                    const recentDays = data.days.slice(-84);
                    const weekActivity: boolean[] = [];
                    for (let i = 0; i < 12; i++) {
                        const weekDays = recentDays.slice(i * 7, (i + 1) * 7);
                        const hasActivity = weekDays.some((d: { count: number }) => d.count > 0);
                        weekActivity.push(hasActivity);
                    }
                    setWeeks(weekActivity);
                }
            })
            .catch(() => { });
    }, []);

    return (
        <div className="activity-health">
            <div className="activity-health__label">12-Week Activity</div>
            <div className="activity-health__dots">
                {weeks.map((active, i) => (
                    <div
                        key={i}
                        className={`activity-health__dot ${active ? 'activity-health__dot--active' : ''}`}
                        title={`${12 - i} weeks ago${active ? ' ✓' : ''}`}
                    />
                ))}
            </div>
            <div className="activity-health__streak">
                {weeks.filter(Boolean).length}/12 weeks active
            </div>
        </div>
    );
}
