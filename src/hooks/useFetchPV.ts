import { useState, useEffect } from 'react';

interface PVResponse {
    pvMap: Record<string, number>;
    totalPV: number;
}

export function useFetchPV() {
    const [pvMap, setPvMap] = useState<Record<string, number>>({});
    const [totalPV, setTotalPV] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/pv/treemap')
            .then((res) => res.json())
            .then((json: PVResponse) => {
                setPvMap(json.pvMap || {});
                setTotalPV(json.totalPV || 0);
            })
            .catch((err) => {
                console.error('Failed to fetch PV data:', err);
                setPvMap({});
            })
            .finally(() => setIsLoading(false));
    }, []);

    return { pvMap, totalPV, isLoading };
}
