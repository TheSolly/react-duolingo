export interface Lesson {
  id: string;
  title: string;
  xp_per_correct: number;
  streak_increment: number;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt_en: string;
  explanation_en: string;
}

export interface MultipleChoiceExercise extends Exercise {
  type: 'multiple_choice';
  choices: string[];
  answer: string;
}

export interface TypeAnswerExercise extends Exercise {
  type: 'type_answer';
  answer: string[];
  tolerance: {
    caseInsensitive: boolean;
    trim: boolean;
  };
}

export interface WordBankExercise extends Exercise {
  type: 'word_bank';
  bank: string[];
  answer: string[];
}

export interface MatchPairsExercise extends Exercise {
  type: 'match_pairs';
  pairs: Array<{
    left: string;
    right: string;
  }>;
}

export interface AudioExercise extends Exercise {
  type: 'listening_prompt';
  audio_url?: string;
  fallback_text: string;
  answer: string;
}

export type ExerciseType =
  | 'multiple_choice'
  | 'type_answer'
  | 'word_bank'
  | 'match_pairs'
  | 'listening_prompt';

export type ExerciseUnion =
  | MultipleChoiceExercise
  | TypeAnswerExercise
  | WordBankExercise
  | MatchPairsExercise
  | AudioExercise;

export interface ExerciseResult {
  exerciseId: string;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface LessonState {
  lesson: Lesson | null;
  currentExerciseIndex: number;
  answers: Record<string, ExerciseResult>;
  hearts: number;
  streak: number;
  xp: number;
  isComplete: boolean;
  startTime: number;
  lastSavedTime: number;
}

export type LessonAction =
  | { type: 'LOAD_LESSON'; payload: Lesson }
  | {
      type: 'SUBMIT_ANSWER';
      payload: {
        exerciseId: string;
        userAnswer: string | string[];
        isCorrect: boolean;
        timeSpent: number;
      };
    }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'LOSE_HEART' }
  | { type: 'COMPLETE_LESSON' }
  | { type: 'RESTART_LESSON' }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<LessonState> };

export interface AppState {
  lessonState: LessonState;
  locale: string;
  isLoading: boolean;
  error: string | null;
}

export type FeedbackType = 'correct' | 'incorrect' | 'none';

export interface FeedbackState {
  type: FeedbackType;
  message: string;
  explanation: string;
}

export interface MatchPair {
  left: string;
  right: string;
  isMatched: boolean;
}
