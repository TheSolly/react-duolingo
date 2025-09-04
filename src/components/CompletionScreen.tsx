import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLessonContext } from '../contexts/LessonContext';
import { useAppContext } from '../contexts/AppContext';

interface CompletionScreenProps {
  onRestartLesson: () => void;
}

function CompletionScreen({ onRestartLesson }: CompletionScreenProps) {
  const { t } = useTranslation();
  const { state: lessonState } = useLessonContext();
  const { state: appState } = useAppContext();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setShowCelebration(true);

    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const { lesson, xp } = lessonState;
  const correctAnswers = Object.values(lessonState.answers).filter(
    (answer) => answer.isCorrect
  ).length;
  const totalAnswers = Object.values(lessonState.answers).length;
  const accuracy =
    totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  if (!lesson) {
    return null;
  }

  return (
    <div className="completion-screen">
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="confetti-container">
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i} className={`confetti confetti-${i % 5}`} />
            ))}
          </div>
        </div>
      )}

      <div className="completion-content">
        <div className="completion-header">
          <div className="completion-icon">🎉</div>
          <h1 className="completion-title">
            {t('lesson.completion.congratulations')}
          </h1>
          <h2 className="lesson-complete-subtitle">
            {t('lesson.completion.title')}
          </h2>
        </div>

        <div className="completion-stats">
          <div className="stat-card primary">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-label">{t('completion.xpEarned')}</span>
              <span className="stat-value">+{xp}</span>
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <span className="stat-label">{t('completion.streak')}</span>
              <span className="stat-value">{appState.totalStreak}</span>
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <span className="stat-label">{t('completion.accuracy')}</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
          </div>
        </div>

        <div className="completion-summary">
          <h3>{t('completion.lessonSummary')}</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">{t('completion.exercisesCompleted')}</span>
              <span className="summary-value">{lesson.exercises.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">{t('completion.correctAnswers')}</span>
              <span className="summary-value">
                {correctAnswers}/{totalAnswers}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">{t('completion.totalXP')}</span>
              <span className="summary-value">{appState.totalXP + xp}</span>
            </div>
          </div>
        </div>

        <div className="completion-actions">
          <button onClick={onRestartLesson} className="restart-button">
            {t('lesson.completion.restartLesson')}
          </button>

          <button
            className="continue-button"
            disabled
            title="More lessons coming soon!"
          >
            {t('lesson.completion.nextLesson')}
          </button>
        </div>

        <div className="motivational-message">
          <p>
            {accuracy >= 80
              ? t('lesson.completion.motivationalMessage.excellent')
              : accuracy >= 60
                ? t('lesson.completion.motivationalMessage.good')
                : t('lesson.completion.motivationalMessage.keepPracticing')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CompletionScreen;
