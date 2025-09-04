import { useTranslation } from 'react-i18next';

interface StreakHeartsProps {
  hearts: number;
  streak: number;
  maxHearts?: number;
  className?: string;
}

function StreakHearts({
  hearts,
  streak,
  maxHearts = 3,
  className = '',
}: StreakHeartsProps) {
  const { t } = useTranslation();

  return (
    <div className={`streak-hearts ${className}`}>
      <div className="streak-container">
        <div className="streak-icon">🔥</div>
        <div
          className="streak-count"
          aria-label={t('accessibility.currentStreak', { streak })}
        >
          {streak}
        </div>
      </div>

      <div className="hearts-container">
        {Array.from({ length: maxHearts }, (_, index) => (
          <div
            key={index}
            className={`heart ${index < hearts ? 'filled' : 'empty'}`}
            aria-hidden="true"
          >
            {index < hearts ? '❤️' : '🤍'}
          </div>
        ))}
        <div className="hearts-text" aria-live="polite">
          <span className="sr-only">
            {t('accessibility.heartsRemaining', { count: hearts })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StreakHearts;
