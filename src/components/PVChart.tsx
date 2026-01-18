import { useState } from 'react';

interface PVData {
    date: string;
    pv: number;
}

// ダミーデータ（現在日付ベースで生成）
function generateDummyData(): PVData[] {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
            date: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
            pv: Math.floor(Math.random() * 150) + 80,
        };
    });
}

/**
 * PV数推移グラフコンポーネント
 * シンプルなバーチャートで表示（Highcharts問題回避用）
 */
export function PVChart() {
    const [pvData] = useState<PVData[]>(() => generateDummyData());
    const totalPV = pvData.reduce((sum, d) => sum + d.pv, 0);
    const maxPV = Math.max(...pvData.map((d) => d.pv));

    return (
        <div>
            <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                    {totalPV.toLocaleString()} views
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                    (過去7日間)
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
                {pvData.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div
                            style={{
                                width: '100%',
                                height: `${(d.pv / maxPV) * 100}px`,
                                backgroundColor: 'var(--color-accent)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.3s ease',
                            }}
                            title={`${d.pv} views`}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{d.date}</span>
                    </div>
                ))}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right', marginTop: '8px' }}>
                Data source: demo
            </div>
        </div>
    );
}

export default PVChart;
