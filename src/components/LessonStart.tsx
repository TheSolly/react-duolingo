import { useTranslation } from 'react-i18next';
import { ExerciseUnion } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { Lesson } from '../types';

interface LessonStartProps {
  lesson: Lesson | null;
  onStartLesson: () => void;
}

function LessonStart({ lesson, onStartLesson }: LessonStartProps) {
  const { t } = useTranslation();
  const { state: appState } = useAppContext();

  if (!lesson) {
    return (
      <div className="lesson-start loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const estimatedTime = Math.ceil(lesson.exercises.length * 0.5);

  return (
    <div className="lesson-start">
      <div className="lesson-start-content">
        <div className="lesson-header">
          <h1 className="lesson-title">{lesson.title}</h1>
          <div className="lesson-meta">
            <div className="estimated-time">
              <span className="time-icon">⏱</span>
              <span>
                {t('lesson.start.estimatedTime', { time: estimatedTime })}
              </span>
            </div>
          </div>
        </div>

        <div className="lesson-stats">
          <div className="stat-item">
            <div className="stat-icon hearts">❤️</div>
            <div className="stat-info">
              <span className="stat-label">{t('lesson.start.hearts')}</span>
              <span className="stat-value">3</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon streak">🔥</div>
            <div className="stat-info">
              <span className="stat-label">{t('lesson.start.streak')}</span>
              <span className="stat-value">{appState.totalStreak}</span>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon xp">⭐</div>
            <div className="stat-info">
              <span className="stat-label">XP</span>
              <span className="stat-value">{appState.totalXP}</span>
            </div>
          </div>
        </div>

        <div className="lesson-preview">
          <h3>{t('lesson.start.title')}</h3>
          <div className="exercise-count">
            <span>{lesson.exercises.length} exercises</span>
          </div>

          <div className="exercise-types">
            {getUniqueExerciseTypes(lesson.exercises as ExerciseUnion[]).map((type, index) => (
              <div key={index} className={`exercise-type-badge ${type}`}>
                {getExerciseTypeIcon(type)}
                <span>{getExerciseTypeName(type)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="start-lesson-button"
          onClick={onStartLesson}
          aria-describedby="lesson-description"
        >
          {t('lesson.start.startButton')}
        </button>

        <div id="lesson-description" className="lesson-description">
          Complete {lesson.exercises.length} exercises to earn{' '}
          {lesson.xp_per_correct * lesson.exercises.length} XP
        </div>
      </div>
    </div>
  );
}

function getUniqueExerciseTypes(exercises: ExerciseUnion[]): string[] {
  return [...new Set(exercises.map((ex) => ex.type))];
}

function getExerciseTypeIcon(type: string): string {
  const icons = {
    multiple_choice: '📝',
    type_answer: '⌨️',
    word_bank: '🧩',
    match_pairs: '🔗',
    listening_prompt: '🎧',
  };
  return icons[type as keyof typeof icons] || '📚';
}

function getExerciseTypeName(type: string): string {
  const names = {
    multiple_choice: 'Multiple Choice',
    type_answer: 'Type Answer',
    word_bank: 'Word Bank',
    match_pairs: 'Match Pairs',
    listening_prompt: 'Listening',
  };
  return names[type as keyof typeof names] || type;
}

export default LessonStart;
