import { createContext, useContext, ReactNode } from 'react';
import { useLessonState } from '../hooks/useLessonState';
import { LessonState, Lesson } from '../types';

interface LessonContextType {
  state: LessonState;
  actions: {
    loadLesson: (lesson: Lesson) => void;
    submitAnswer: (
      exerciseId: string,
      userAnswer: string | string[],
      isCorrect: boolean,
      timeSpent: number
    ) => void;
    nextExercise: () => void;
    loseHeart: () => void;
    completeLesson: () => void;
    restartLesson: () => void;
  };
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

interface LessonProviderProps {
  children: ReactNode;
}

export function LessonProvider({ children }: LessonProviderProps) {
  const lessonState = useLessonState();

  return (
    <LessonContext.Provider value={lessonState}>
      {children}
    </LessonContext.Provider>
  );
}

export function useLessonContext() {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error('useLessonContext must be used within a LessonProvider');
  }
  return context;
}
