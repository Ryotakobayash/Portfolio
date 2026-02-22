import { useState, useEffect, type ReactNode } from 'react';

interface KPICardProps {
    label: string;
    value: number | string;
    suffix?: string;
    icon?: string;
    href?: string;
    animateNumber?: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (value === 0) { setDisplay(0); return; }
        const duration = 1200;
        const steps = 30;
        const increment = value / steps;
        let current = 0;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            current = Math.min(Math.round(increment * step), value);
            setDisplay(current);
            if (step >= steps) clearInterval(timer);
        }, duration / steps);
        return () => clearInterval(timer);
    }, [value]);

    return <span className="kpi-card__value">{display.toLocaleString()}</span>;
}

export function KPICard({ label, value, suffix, icon, href, animateNumber = true }: KPICardProps) {
    const isNumeric = typeof value === 'number';
    const content = (
        <div className="kpi-card">
            {icon && <span className="kpi-card__icon">{icon}</span>}
            <div className="kpi-card__body">
                <span className="kpi-card__label">{label}</span>
                <div className="kpi-card__value-row">
                    {isNumeric && animateNumber ? (
                        <AnimatedNumber value={value} />
                    ) : (
                        <span className="kpi-card__value">{value}</span>
                    )}
                    {suffix && <span className="kpi-card__suffix">{suffix}</span>}
                </div>
            </div>
        </div>
    );

    if (href) {
        return <a href={href} className="kpi-card__link">{content}</a>;
    }
    return content;
}

interface PageDashboardHeaderProps {
    children: ReactNode;
}

export function PageDashboardHeader({ children }: PageDashboardHeaderProps) {
    return <div className="dashboard-header">{children}</div>;
}
