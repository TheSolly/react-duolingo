import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FeedbackState } from '../types';

interface FeedbackBannerProps {
  feedback: FeedbackState;
  onContinue?: () => void;
  className?: string;
}

function FeedbackBanner({
  feedback,
  onContinue,
  className = '',
}: FeedbackBannerProps) {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (feedback.type !== 'none') {
      setIsVisible(true);
      setAnimationClass('slide-in');

      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [feedback]);

  if (!isVisible || feedback.type === 'none') {
    return null;
  }

  const isCorrect = feedback.type === 'correct';

  return (
    <div
      className={`feedback-banner ${feedback.type} ${animationClass} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="feedback-content">
        <div className="feedback-header">
          <div className="feedback-icon">{isCorrect ? '✅' : '❌'}</div>
          <div className="feedback-message">
            <h3 className="feedback-title">
              {isCorrect
                ? t('lesson.feedback.correct')
                : t('lesson.feedback.incorrect')}
            </h3>
            {feedback.message && (
              <p className="feedback-text">{feedback.message}</p>
            )}
          </div>
        </div>

        {feedback.explanation && (
          <div className="feedback-explanation">
            <p>{feedback.explanation}</p>
          </div>
        )}

        {onContinue && (
          <div className="feedback-actions">
            <button
              className={`continue-button ${isCorrect ? 'correct' : 'incorrect'}`}
              onClick={onContinue}
              autoFocus
            >
              {t('lesson.exercise.continue')}
            </button>
          </div>
        )}
      </div>

      <div className={`feedback-background ${feedback.type}`} />
    </div>
  );
}

export default FeedbackBanner;
