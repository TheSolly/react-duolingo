import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';
import { storageUtils } from '../../utils/storage';
import { LessonState } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
} as Storage;

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Progress Persistence Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLesson = {
    id: 'lesson-persistence-test',
    title: 'Progress Persistence Test',
    xp_per_correct: 10,
    streak_increment: 1,
    exercises: [
      {
        id: 'ex1',
        type: 'multiple_choice' as const,
        prompt_en: 'What is "Hello" in Spanish?',
        explanation_en: 'Basic greeting',
        choices: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
        answer: 'Hola'
      },
      {
        id: 'ex2', 
        type: 'type_answer' as const,
        prompt_en: 'Type "Good morning" in Spanish',
        explanation_en: 'Morning greeting',
        answer: ['Buenos días'],
        tolerance: { caseInsensitive: true, trim: true }
      }
    ]
  };

  describe('lesson progress persistence across page refresh', () => {
    it('saves and restores lesson progress correctly', () => {
      // Simulate starting a lesson
      const initialProgress: LessonState = {
        lesson: mockLesson,
        currentExerciseIndex: 0,
        answers: {},
        hearts: 3,
        streak: 0,
        xp: 0,
        isComplete: false,
        startTime: Date.now(),
        lastSavedTime: Date.now()
      };

      // Save initial progress
      storageUtils.saveLessonState(initialProgress);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'duolingo-lesson-state',
        expect.stringContaining('"currentExerciseIndex":0')
      );

      // Simulate answering first exercise correctly
      const updatedProgress: LessonState = {
        ...initialProgress,
        currentExerciseIndex: 1,
        answers: {
          'ex1': {
            exerciseId: 'ex1',
            userAnswer: 'Hola',
            correctAnswer: 'Hola',
            isCorrect: true,
            timeSpent: 5000
          }
        },
        xp: 10,
        streak: 1,
        lastSavedTime: Date.now()
      };

      storageUtils.saveLessonState(updatedProgress);

      // Verify progress was saved
      const savedCall = mockLocalStorage.setItem.mock.calls[1];
      const savedData = JSON.parse(savedCall[1]);
      expect(savedData).toMatchObject({
        currentExerciseIndex: 1,
        xp: 10,
        streak: 1,
        answers: {
          'ex1': {
            userAnswer: 'Hola',
            isCorrect: true
          }
        }
      });
    });

    it('restores progress after simulated page refresh', () => {
      // Mock saved lesson state in localStorage
      const savedProgress = {
        lesson: mockLesson,
        currentExerciseIndex: 1,
        answers: {
          'ex1': {
            exerciseId: 'ex1',
            userAnswer: 'Hola',
            correctAnswer: 'Hola',
            isCorrect: true,
            timeSpent: 5000
          }
        },
        hearts: 3,
        streak: 1,
        xp: 10,
        isComplete: false,
        startTime: Date.now() - 120000,
        lastSavedTime: Date.now() - 30000
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedProgress));

      // Simulate page refresh by loading lesson state
      const restoredProgress = storageUtils.loadLessonState();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('duolingo-lesson-state');
      expect(restoredProgress).toMatchObject({
        currentExerciseIndex: 1,
        xp: 10,
        streak: 1,
        hearts: 3
      });
      expect(restoredProgress?.answers['ex1']).toMatchObject({
        userAnswer: 'Hola',
        isCorrect: true
      });
    });

    it('handles lesson completion and clears saved state', () => {
      // Simulate completed lesson
      const completedProgress: LessonState = {
        lesson: mockLesson,
        currentExerciseIndex: 2,
        answers: {
          'ex1': {
            exerciseId: 'ex1',
            userAnswer: 'Hola',
            correctAnswer: 'Hola',
            isCorrect: true,
            timeSpent: 3000
          },
          'ex2': {
            exerciseId: 'ex2',
            userAnswer: 'Buenos días',
            correctAnswer: 'Buenos días',
            isCorrect: true,
            timeSpent: 4000
          }
        },
        hearts: 3,
        streak: 2,
        xp: 20,
        isComplete: true,
        startTime: Date.now() - 300000,
        lastSavedTime: Date.now()
      };

      // Save completed state
      storageUtils.saveLessonState(completedProgress);
      
      // Clear state after lesson completion
      storageUtils.clearLessonState();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('duolingo-lesson-state');
    });

    it('expires old lesson data (older than 24 hours)', () => {
      // Create expired lesson data
      const expiredData = {
        lesson: mockLesson,
        currentExerciseIndex: 1,
        answers: {},
        hearts: 2,
        streak: 1,
        xp: 10,
        isComplete: false,
        startTime: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        lastSavedTime: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredData));

      const result = storageUtils.loadLessonState();

      // Should return null and remove expired data
      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('duolingo-lesson-state');
    });

    it('maintains progress with hearts lost from wrong answers', () => {
      // Start with full hearts
      const initialState: LessonState = {
        lesson: mockLesson,
        currentExerciseIndex: 0,
        answers: {},
        hearts: 3,
        streak: 0,
        xp: 0,
        isComplete: false,
        startTime: Date.now(),
        lastSavedTime: Date.now()
      };

      storageUtils.saveLessonState(initialState);

      // Simulate wrong answer causing heart loss
      const afterWrongAnswer: LessonState = {
        ...initialState,
        answers: {
          'ex1': {
            exerciseId: 'ex1',
            userAnswer: 'Adiós',
            correctAnswer: 'Hola',
            isCorrect: false,
            timeSpent: 8000
          }
        },
        hearts: 2, // Lost one heart
        lastSavedTime: Date.now()
      };

      storageUtils.saveLessonState(afterWrongAnswer);

      // Mock loading after refresh
      const savedData = mockLocalStorage.setItem.mock.calls[1][1];
      mockLocalStorage.getItem.mockReturnValue(savedData);
      
      const restoredState = storageUtils.loadLessonState();

      expect(restoredState).toMatchObject({
        hearts: 2,
        xp: 0, // No XP gained from wrong answer
        answers: {
          'ex1': {
            userAnswer: 'Adiós',
            isCorrect: false
          }
        }
      });
    });
  });

  describe('user preferences persistence', () => {
    it('persists user stats across sessions', () => {
      // Start with default preferences
      mockLocalStorage.getItem.mockReturnValue(null);
      const initialPrefs = storageUtils.loadUserPreferences();
      
      expect(initialPrefs).toEqual({
        locale: 'en',
        totalStreak: 0,
        totalXP: 0
      });

      // Complete lessons and update stats
      storageUtils.updateUserStats(30, 3); // Gain 30 XP and 3 streak
      
      // Verify stats were saved
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'duolingo-user-preferences',
        JSON.stringify({
          locale: 'en',
          totalStreak: 3,
          totalXP: 30
        })
      );

      // Simulate new session by loading preferences
      const savedPrefs = mockLocalStorage.setItem.mock.calls[0][1];
      mockLocalStorage.getItem.mockReturnValue(savedPrefs);
      
      const loadedPrefs = storageUtils.loadUserPreferences();
      expect(loadedPrefs).toEqual({
        locale: 'en',
        totalStreak: 3,
        totalXP: 30
      });
    });

    it('accumulates stats over multiple sessions', () => {
      // Start with some existing progress
      const existingPrefs = {
        locale: 'en',
        totalStreak: 5,
        totalXP: 100,
        lastPlayedLessonId: 'lesson-1'
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingPrefs));

      // Complete another lesson
      storageUtils.updateUserStats(20, 2);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'duolingo-user-preferences',
        JSON.stringify({
          ...existingPrefs,
          totalStreak: 7, // 5 + 2
          totalXP: 120 // 100 + 20
        })
      );
    });
  });

  describe('useLocalStorage hook integration with lesson data', () => {
    it('maintains lesson preferences across component remounts', () => {
      // Initial mount with default value
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const { result: lessonPrefs } = renderHook(() => 
        useLocalStorage('current-lesson-id', null as string | null)
      );

      expect(lessonPrefs.current[0]).toBe(null);

      // Set current lesson
      act(() => {
        lessonPrefs.current[1]('lesson-basics-1');
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'current-lesson-id',
        JSON.stringify('lesson-basics-1')
      );

      // Simulate component remount (page refresh)
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify('lesson-basics-1'));
      
      const { result: restoredPrefs } = renderHook(() => 
        useLocalStorage('current-lesson-id', null as string | null)
      );

      expect(restoredPrefs.current[0]).toBe('lesson-basics-1');
    });

    it('tracks lesson completion history', () => {
      type CompletedLesson = {
        id: string;
        completedAt: number;
        finalXP: number;
        finalStreak: number;
      };

      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => 
        useLocalStorage<CompletedLesson[]>('completed-lessons', [])
      );

      // Complete first lesson
      act(() => {
        result.current[1]([{
          id: 'lesson-1',
          completedAt: Date.now(),
          finalXP: 30,
          finalStreak: 3
        }]);
      });

      // Complete second lesson  
      act(() => {
        result.current[1](prev => [...prev, {
          id: 'lesson-2',
          completedAt: Date.now(),
          finalXP: 50,
          finalStreak: 5
        }]);
      });

      expect(result.current[0]).toHaveLength(2);
      expect(result.current[0][0].id).toBe('lesson-1');
      expect(result.current[0][1].id).toBe('lesson-2');

      // Verify persistence
      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[1][1]);
      expect(savedData).toHaveLength(2);
      expect(savedData[0].finalXP).toBe(30);
      expect(savedData[1].finalXP).toBe(50);
    });
  });

  describe('error recovery scenarios', () => {
    it('handles localStorage corruption gracefully', () => {
      // Mock corrupted data
      mockLocalStorage.getItem.mockReturnValue('invalid json {');
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = storageUtils.loadLessonState();
      
      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('duolingo-lesson-state');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('continues working when localStorage is unavailable', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const testState: LessonState = {
        lesson: mockLesson,
        currentExerciseIndex: 0,
        answers: {},
        hearts: 3,
        streak: 0,
        xp: 0,
        isComplete: false,
        startTime: Date.now(),
        lastSavedTime: Date.now()
      };

      // Should not throw error
      expect(() => storageUtils.saveLessonState(testState)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save lesson state:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });
});