import { useEffect, useRef } from 'react';

interface SkillRadarProps {
    data: Record<string, number>;
}

export default function SkillRadar({ data }: SkillRadarProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const size = 260;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.scale(dpr, dpr);

        const cx = size / 2;
        const cy = size / 2;
        const maxR = 70;
        const labels = Object.keys(data);
        const values = Object.values(data);
        const n = labels.length;
        const angleStep = (2 * Math.PI) / n;
        const startAngle = -Math.PI / 2; // top

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#6B6B5A' : '#8A8A7A';
        const gridColor = isDark ? 'rgba(245,237,220,0.08)' : 'rgba(24,24,24,0.08)';
        const fillColor = isDark ? 'rgba(92,127,113,0.3)' : 'rgba(92,127,113,0.18)';
        const strokeColor = '#5C7F71';

        ctx.clearRect(0, 0, size, size);

        // Draw grid rings
        for (let ring = 1; ring <= 4; ring++) {
            const r = (maxR * ring) / 4;
            ctx.beginPath();
            for (let i = 0; i <= n; i++) {
                const angle = startAngle + angleStep * i;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw axes
        for (let i = 0; i < n; i++) {
            const angle = startAngle + angleStep * i;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Draw data polygon
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
            const idx = i % n;
            const angle = startAngle + angleStep * idx;
            const r = (maxR * values[idx]) / 100;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw dots & labels
        for (let i = 0; i < n; i++) {
            const angle = startAngle + angleStep * i;
            const r = (maxR * values[i]) / 100;
            const dx = cx + r * Math.cos(angle);
            const dy = cy + r * Math.sin(angle);

            // square dot (retro instrument style)
            const dr = 3;
            ctx.fillStyle = strokeColor;
            ctx.fillRect(dx - dr, dy - dr, dr * 2, dr * 2);

            // label - short names for better fit
            const shortLabels: Record<string, string> = {
                'Product Design': 'PdD',
                'UX Research': 'UXR',
                'Visual Design': 'ViD',
                'Frontend Dev': 'FE',
            };
            const labelText = shortLabels[labels[i]] || labels[i];

            const labelR = maxR + 20;
            const lx = cx + labelR * Math.cos(angle);
            const ly = cy + labelR * Math.sin(angle);
            ctx.fillStyle = textColor;
            ctx.font = '600 10px Outfit, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labelText, lx, ly);
        }
    }, [data]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <canvas ref={canvasRef} />
        </div>
    );
}
