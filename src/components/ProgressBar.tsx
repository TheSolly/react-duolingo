import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  currentExercise: number;
  totalExercises: number;
  className?: string;
}

function ProgressBar({
  currentExercise,
  totalExercises,
  className = '',
}: ProgressBarProps) {
  const { t } = useTranslation();
  const progressPercentage = (currentExercise / totalExercises) * 100;

  return (
    <div className={`progress-bar-container ${className}`}>
      <div className="progress-text" aria-live="polite">
        {t('lesson.progress.exercise', {
          current: currentExercise + 1,
          total: totalExercises,
        })}
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={currentExercise}
        aria-valuemin={0}
        aria-valuemax={totalExercises}
        aria-label={t('accessibility.progressBar', {
          current: currentExercise + 1,
          total: totalExercises,
        })}
      >
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercentage}%` }}
        />

        <div className="progress-steps">
          {Array.from({ length: totalExercises }, (_, index) => (
            <div
              key={index}
              className={`progress-step ${
                index < currentExercise
                  ? 'completed'
                  : index === currentExercise
                    ? 'current'
                    : 'upcoming'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
