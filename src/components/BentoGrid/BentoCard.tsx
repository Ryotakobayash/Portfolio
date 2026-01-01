import { ReactNode } from 'react';
import styles from './BentoCard.module.css';
import gridStyles from './BentoGrid.module.css';

interface BentoCardProps {
    title: string;
    children: ReactNode;
    /** 2カラム分のワイドカードにする */
    wide?: boolean;
}

/**
 * Bento Grid用カードコンポーネント
 * - ホバーエフェクト付き
 * - wide=trueで2カラム分の幅を取る
 */
export function BentoCard({ title, children, wide = false }: BentoCardProps) {
    return (
        <div className={`${styles.bentoCard} ${wide ? gridStyles.spanTwo : ''}`}>
            <div className={styles.cardTitle}>{title}</div>
            <div className={styles.cardContent}>
                {children}
            </div>
        </div>
    );
}
