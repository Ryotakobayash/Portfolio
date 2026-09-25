export type PvSource = 'ga4' | 'dummy' | 'fallback';

export interface PvResponseMeta {
    source: PvSource;
    periodDays: number;
}

export interface ArticlePvResponse extends PvResponseMeta {
    slug: string;
    count: number | null;
}

export interface RankingItem {
    path: string;
    title: string;
    pv: number;
}

export interface RankingPvResponse extends PvResponseMeta {
    ranking: RankingItem[];
}

export interface MonthlyPV {
    month: string;
    pv: number;
}

export interface TimelinePvResponse extends PvResponseMeta {
    data: MonthlyPV[];
}

export interface TreemapPvResponse extends PvResponseMeta {
    pvMap: Record<string, number>;
    totalPV: number | null;
}
