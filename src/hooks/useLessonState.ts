import { useReducer, useEffect } from 'react';
import {
  LessonState,
  LessonAction,
  Lesson,
  ExerciseResult,
  MultipleChoiceExercise,
  TypeAnswerExercise,
  WordBankExercise,
  MatchPairsExercise,
  AudioExercise,
} from '../types';
import { storageUtils } from '../utils/storage';

const initialLessonState: LessonState = {
  lesson: null,
  currentExerciseIndex: 0,
  answers: {},
  hearts: 3,
  streak: 0,
  xp: 0,
  isComplete: false,
  startTime: Date.now(),
  lastSavedTime: Date.now(),
};

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'LOAD_LESSON':
      return {
        ...initialLessonState,
        lesson: action.payload,
        startTime: Date.now(),
      };

    case 'SUBMIT_ANSWER': {
      const { exerciseId, userAnswer, isCorrect, timeSpent } = action.payload;
      const exerciseResult: ExerciseResult = {
        exerciseId,
        userAnswer,
        correctAnswer: getCurrentExerciseAnswer(state.lesson, exerciseId),
        isCorrect,
        timeSpent,
      };

      return {
        ...state,
        answers: {
          ...state.answers,
          [exerciseId]: exerciseResult,
        },
        xp: isCorrect
          ? state.xp + (state.lesson?.xp_per_correct || 10)
          : state.xp,
        hearts: isCorrect ? state.hearts : Math.max(0, state.hearts - 1),
      };
    }

    case 'NEXT_EXERCISE': {
      const nextIndex = state.currentExerciseIndex + 1;
      const isLastExercise =
        state.lesson && nextIndex >= state.lesson.exercises.length;

      return {
        ...state,
        currentExerciseIndex: nextIndex,
        isComplete: isLastExercise || false,
        streak: isLastExercise
          ? state.streak + (state.lesson?.streak_increment || 1)
          : state.streak,
      };
    }

    case 'LOSE_HEART':
      return {
        ...state,
        hearts: Math.max(0, state.hearts - 1),
      };

    case 'COMPLETE_LESSON':
      return {
        ...state,
        isComplete: true,
        streak: state.streak + (state.lesson?.streak_increment || 1),
      };

    case 'RESTART_LESSON':
      return {
        ...initialLessonState,
        lesson: state.lesson,
        startTime: Date.now(),
      };

    case 'LOAD_SAVED_STATE':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

function getCurrentExerciseAnswer(
  lesson: Lesson | null,
  exerciseId: string
): string | string[] {
  if (!lesson) return '';

  const exercise = lesson.exercises.find((ex) => ex.id === exerciseId);
  if (!exercise) return '';

  switch (exercise.type) {
    case 'multiple_choice':
      return (exercise as MultipleChoiceExercise).answer;
    case 'type_answer':
      return (exercise as TypeAnswerExercise).answer;
    case 'word_bank':
      return (exercise as WordBankExercise).answer;
    case 'match_pairs':
      return (exercise as MatchPairsExercise).pairs.map(
        (pair) => `${pair.left}-${pair.right}`
      );
    case 'listening_prompt':
      return (exercise as AudioExercise).answer;
    default:
      return '';
  }
}

export function useLessonState() {
  const [state, dispatch] = useReducer(lessonReducer, initialLessonState);

  // Load saved state on mount
  useEffect(() => {
    const savedState = storageUtils.loadLessonState();
    if (savedState) {
      dispatch({ type: 'LOAD_SAVED_STATE', payload: savedState });
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (state.lesson) {
      storageUtils.saveLessonState(state);
    }
  }, [state]);

  const actions = {
    loadLesson: (lesson: Lesson) => {
      dispatch({ type: 'LOAD_LESSON', payload: lesson });
    },

    submitAnswer: (
      exerciseId: string,
      userAnswer: string | string[],
      isCorrect: boolean,
      timeSpent: number
    ) => {
      dispatch({
        type: 'SUBMIT_ANSWER',
        payload: { exerciseId, userAnswer, isCorrect, timeSpent },
      });
    },

    nextExercise: () => {
      dispatch({ type: 'NEXT_EXERCISE' });
    },

    loseHeart: () => {
      dispatch({ type: 'LOSE_HEART' });
    },

    completeLesson: () => {
      dispatch({ type: 'COMPLETE_LESSON' });
      // Update global user stats
      if (state.lesson) {
        storageUtils.updateUserStats(state.xp, state.lesson.streak_increment);
      }
      // Clear saved lesson state since it's complete
      storageUtils.clearLessonState();
    },

    restartLesson: () => {
      dispatch({ type: 'RESTART_LESSON' });
    },
  };

  return {
    state,
    actions,
  };
}
