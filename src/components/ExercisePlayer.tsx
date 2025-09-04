import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLessonContext } from '../contexts/LessonContext';
import {
  FeedbackState,
  ExerciseUnion,
  MultipleChoiceExercise,
  TypeAnswerExercise,
  WordBankExercise,
  MatchPairsExercise,
  AudioExercise,
} from '../types';
import ProgressBar from './ProgressBar';
import StreakHearts from './StreakHearts';
import FeedbackBanner from './FeedbackBanner';
import MultipleChoice from './exercises/MultipleChoice';
import TypeAnswer from './exercises/TypeAnswer';
import WordBank from './exercises/WordBank';
import MatchPairs from './exercises/MatchPairs';
import ListeningPrompt from './exercises/ListeningPrompt';

function ExercisePlayer() {
  const { t, i18n } = useTranslation();
  const { state, actions } = useLessonContext();
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: 'none',
    message: '',
    explanation: '',
  });
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [exerciseStartTime, setExerciseStartTime] = useState(Date.now());

  const { lesson, currentExerciseIndex, hearts, streak, isComplete } = state;

  useEffect(() => {
    setExerciseStartTime(Date.now());
    setFeedback({ type: 'none', message: '', explanation: '' });
    setIsAnswerSubmitted(false);
  }, [currentExerciseIndex]);

  useEffect(() => {
    if (isComplete) {
      actions.completeLesson();
    }
  }, [isComplete, actions]);

  const currentExercise = lesson?.exercises[
    currentExerciseIndex
  ] as ExerciseUnion;
  const isLastExercise = lesson
    ? currentExerciseIndex === lesson.exercises.length - 1
    : false;

  const handleAnswerSubmit = (
    userAnswer: string | string[],
    isCorrect: boolean
  ) => {
    const timeSpent = Date.now() - exerciseStartTime;

    actions.submitAnswer(currentExercise.id, userAnswer, isCorrect, timeSpent);

    const explanation =
      i18n.language === 'es'
        ? currentExercise.explanation_es ||
          currentExercise.explanation_en
        : currentExercise.explanation_en;


    setFeedback({
      type: isCorrect ? 'correct' : 'incorrect',
      message: isCorrect
        ? t('lesson.feedback.correct')
        : t('lesson.feedback.incorrect'),
      explanation,
    });

    setIsAnswerSubmitted(true);

    if (!isCorrect && hearts > 0) {
      actions.loseHeart();
    }
  };

  const handleContinue = () => {
    console.log('handleContinue called:', {
      currentExerciseIndex,
      isLastExercise,
      totalExercises: lesson?.exercises.length,
    });

    setIsAnswerSubmitted(false);
    setFeedback({
      type: 'none',
      message: '',
      explanation: '',
    });

    if (isLastExercise) {
      console.log('Completing lesson...');
      actions.completeLesson();
    } else {
      console.log('Moving to next exercise...');
      actions.nextExercise();
    }
  };

  const renderExercise = () => {
    switch (currentExercise.type) {
      case 'multiple_choice':
        return (
          <MultipleChoice
            exercise={currentExercise as MultipleChoiceExercise}
            onAnswerSubmit={handleAnswerSubmit}
            disabled={isAnswerSubmitted}
            key={currentExercise.id}
          />
        );
      case 'type_answer':
        return (
          <TypeAnswer
            exercise={currentExercise as TypeAnswerExercise}
            onAnswerSubmit={handleAnswerSubmit}
            disabled={isAnswerSubmitted}
            key={currentExercise.id}
          />
        );
      case 'word_bank':
        return (
          <WordBank
            exercise={currentExercise as WordBankExercise}
            onAnswerSubmit={handleAnswerSubmit}
            disabled={isAnswerSubmitted}
            key={currentExercise.id}
          />
        );
      case 'match_pairs':
        return (
          <MatchPairs
            exercise={currentExercise as MatchPairsExercise}
            onAnswerSubmit={(userAnswer, isCorrect) => {
              // Convert pairs to string format for consistency
              const answerString = userAnswer.map(
                (pair) => `${pair.left}-${pair.right}`
              );
              handleAnswerSubmit(answerString, isCorrect);
            }}
            disabled={isAnswerSubmitted}
            key={currentExercise.id}
          />
        );
      case 'listening_prompt':
        return (
          <ListeningPrompt
            exercise={currentExercise as AudioExercise}
            onAnswerSubmit={handleAnswerSubmit}
            disabled={isAnswerSubmitted}
            key={currentExercise.id}
          />
        );
      default:
        return (
          <div className="exercise-error">
            <p>
              Unsupported exercise type:{' '}
              {(currentExercise as ExerciseUnion).type}
            </p>
          </div>
        );
    }
  };

  if (!lesson || isComplete) {
    return null;
  }

  return (
    <div className="exercise-player">
      <div className="exercise-header">
        <ProgressBar
          currentExercise={currentExerciseIndex}
          totalExercises={lesson.exercises.length}
        />
        <StreakHearts hearts={hearts} streak={streak} />
      </div>

      <div className="exercise-content">
        <div className="exercise-container">{renderExercise()}</div>

        {hearts === 0 && (
          <div className="hearts-depleted" role="alert">
            <div className="hearts-depleted-content">
              <h3>💔 {t('hearts.noHeartsLeft')}</h3>
              <p>{t('hearts.noHeartsMessage')}</p>
              <button
                onClick={() => actions.restartLesson()}
                className="restart-button"
              >
                {t('hearts.startOver')}
              </button>
            </div>
          </div>
        )}
      </div>

      <FeedbackBanner
        feedback={feedback}
        onContinue={
          isAnswerSubmitted && hearts > 0 ? handleContinue : undefined
        }
      />
    </div>
  );
}

export default ExercisePlayer;
