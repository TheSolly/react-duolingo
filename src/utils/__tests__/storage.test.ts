import { storageUtils, UserPreferences } from '../storage';
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

describe('storageUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveLessonState', () => {
    it('saves lesson state to localStorage with timestamp', () => {
      const mockState: LessonState = {
        lesson: {
          id: 'test-lesson',
          title: 'Test Lesson',
          xp_per_correct: 10,
          streak_increment: 1,
          exercises: []
        },
        currentExerciseIndex: 2,
        answers: {
          'ex1': {
            exerciseId: 'ex1',
            userAnswer: 'test',
            correctAnswer: 'test',
            isCorrect: true,
            timeSpent: 5000
          }
        },
        hearts: 2,
        streak: 5,
        xp: 50,
        isComplete: false,
        startTime: Date.now() - 10000,
        lastSavedTime: Date.now() - 5000
      };

      const beforeSave = Date.now();
      storageUtils.saveLessonState(mockState);
      const afterSave = Date.now();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'duolingo-lesson-state',
        expect.any(String)
      );

      const savedData = JSON.parse(mockLocalStorage.setItem.mock.calls[0][1]);
      expect(savedData).toEqual({
        ...mockState,
        lastSavedTime: expect.any(Number)
      });
      expect(savedData.lastSavedTime).toBeGreaterThanOrEqual(beforeSave);
      expect(savedData.lastSavedTime).toBeLessThanOrEqual(afterSave);
    });

    it('handles save errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const mockState: LessonState = {
        lesson: null,
        currentExerciseIndex: 0,
        answers: {},
        hearts: 3,
        streak: 0,
        xp: 0,
        isComplete: false,
        startTime: Date.now(),
        lastSavedTime: Date.now()
      };

      expect(() => storageUtils.saveLessonState(mockState)).not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to save lesson state:',
        expect.any(Error)
      );
    });
  });

  describe('loadLessonState', () => {
    it('loads valid lesson state from localStorage', () => {
      const mockState = {
        lesson: { id: 'test', title: 'Test' },
        currentExerciseIndex: 1,
        hearts: 2,
        lastSavedTime: Date.now()
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockState));

      const result = storageUtils.loadLessonState();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('duolingo-lesson-state');
      expect(result).toEqual(mockState);
    });

    it('returns null when no saved state exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = storageUtils.loadLessonState();
      
      expect(result).toBeNull();
    });

    it('removes and returns null for expired state (older than 24 hours)', () => {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const expiredState = {
        lesson: { id: 'test' },
        lastSavedTime: oneDayAgo - 1000 // 1 second past expiry
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredState));

      const result = storageUtils.loadLessonState();
      
      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('duolingo-lesson-state');
    });

    it('loads valid state from exactly 24 hours ago', () => {
      const exactlyOneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      const validState = {
        lesson: { id: 'test' },
        lastSavedTime: exactlyOneDayAgo // Exactly at the boundary
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(validState));

      const result = storageUtils.loadLessonState();
      
      expect(result).toEqual(validState);
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('handles malformed JSON gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json {');

      const result = storageUtils.loadLessonState();
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load lesson state:',
        expect.any(Error)
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('duolingo-lesson-state');
    });

    it('handles localStorage read errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const result = storageUtils.loadLessonState();
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load lesson state:',
        expect.any(Error)
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('duolingo-lesson-state');
    });
  });

  describe('clearLessonState', () => {
    it('removes lesson state from localStorage', () => {
      storageUtils.clearLessonState();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('duolingo-lesson-state');
    });

    it('handles clear errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      expect(() => storageUtils.clearLessonState()).not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to clear lesson state:',
        expect.any(Error)
      );
    });
  });

  describe('saveUserPreferences', () => {
    it('saves user preferences to localStorage', () => {
      const preferences: UserPreferences = {
        locale: 'es',
        totalStreak: 15,
        totalXP: 250,
        lastPlayedLessonId: 'lesson-2'
      };

      storageUtils.saveUserPreferences(preferences);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'duolingo-user-preferences',
        JSON.stringify(preferences)
      );
    });

    it('handles save errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const preferences: UserPreferences = {
        locale: 'en',
        totalStreak: 0,
        totalXP: 0
      };

      expect(() => storageUtils.saveUserPreferences(preferences)).not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to save user preferences:',
        expect.any(Error)
      );
    });
  });

  describe('loadUserPreferences', () => {
    it('loads user preferences from localStorage', () => {
      const preferences: UserPreferences = {
        locale: 'es',
        totalStreak: 15,
        totalXP: 250,
        lastPlayedLessonId: 'lesson-2'
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(preferences));

      const result = storageUtils.loadUserPreferences();
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('duolingo-user-preferences');
      expect(result).toEqual(preferences);
    });

    it('returns default preferences when no saved data exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = storageUtils.loadUserPreferences();
      
      expect(result).toEqual({
        locale: 'en',
        totalStreak: 0,
        totalXP: 0
      });
    });

    it('returns default preferences on JSON parse error', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const result = storageUtils.loadUserPreferences();
      
      expect(result).toEqual({
        locale: 'en',
        totalStreak: 0,
        totalXP: 0
      });
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load user preferences:',
        expect.any(Error)
      );
    });

    it('returns default preferences on localStorage error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const result = storageUtils.loadUserPreferences();
      
      expect(result).toEqual({
        locale: 'en',
        totalStreak: 0,
        totalXP: 0
      });
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load user preferences:',
        expect.any(Error)
      );
    });
  });

  describe('updateUserStats', () => {
    it('updates XP and streak correctly', () => {
      const currentPrefs: UserPreferences = {
        locale: 'en',
        totalStreak: 10,
        totalXP: 100,
        lastPlayedLessonId: 'lesson-1'
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(currentPrefs));

      storageUtils.updateUserStats(50, 2);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'duolingo-user-preferences',
        JSON.stringify({
          ...currentPrefs,
          totalXP: 150, // 100 + 50
          totalStreak: 12 // max(10, 10 + 2)
        })
      );
    });

    it('ensures streak never decreases', () => {
      const currentPrefs: UserPreferences = {
        locale: 'en',
        totalStreak: 15,
        totalXP: 200
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(currentPrefs));

      // Try to decrease streak with negative increment
      storageUtils.updateUserStats(25, -5);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'duolingo-user-preferences',
        JSON.stringify({
          ...currentPrefs,
          totalXP: 225,
          totalStreak: 15 // Should remain 15, not become 10
        })
      );
    });

    it('handles case where current streak + increment is greater', () => {
      const currentPrefs: UserPreferences = {
        locale: 'en',
        totalStreak: 5,
        totalXP: 50
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(currentPrefs));

      storageUtils.updateUserStats(10, 8);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'duolingo-user-preferences',
        JSON.stringify({
          ...currentPrefs,
          totalXP: 60,
          totalStreak: 13 // 5 + 8
        })
      );
    });
  });

  describe('isStorageAvailable', () => {
    it('returns true when localStorage is available', () => {
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.removeItem.mockImplementation(() => {});

      const result = storageUtils.isStorageAvailable();
      
      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        '__duolingo_storage_test__',
        'test'
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        '__duolingo_storage_test__'
      );
    });

    it('returns false when localStorage throws an error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage unavailable');
      });

      const result = storageUtils.isStorageAvailable();
      
      expect(result).toBe(false);
    });

    it('returns false when localStorage removeItem throws an error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove unavailable');
      });

      const result = storageUtils.isStorageAvailable();
      
      expect(result).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('handles complete lesson progress persistence flow', () => {
      // Start with no saved state
      mockLocalStorage.getItem.mockReturnValue(null);
      
      let initialLoad = storageUtils.loadLessonState();
      expect(initialLoad).toBeNull();

      // Save lesson progress
      const lessonProgress: LessonState = {
        lesson: {
          id: 'lesson-1',
          title: 'Basic Greetings',
          xp_per_correct: 10,
          streak_increment: 1,
          exercises: []
        },
        currentExerciseIndex: 3,
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
            timeSpent: 4500
          }
        },
        hearts: 3,
        streak: 2,
        xp: 20,
        isComplete: false,
        startTime: Date.now() - 60000,
        lastSavedTime: Date.now()
      };

      storageUtils.saveLessonState(lessonProgress);

      // Simulate page refresh - localStorage now returns saved data
      const savedData = mockLocalStorage.setItem.mock.calls[0][1];
      mockLocalStorage.getItem.mockReturnValue(savedData);

      const loadedState = storageUtils.loadLessonState();
      expect(loadedState).toEqual(expect.objectContaining({
        lesson: lessonProgress.lesson,
        currentExerciseIndex: 3,
        hearts: 3,
        streak: 2,
        xp: 20
      }));
    });

    it('handles user preference persistence across sessions', () => {
      // Initial default preferences
      mockLocalStorage.getItem.mockReturnValue(null);
      
      let prefs = storageUtils.loadUserPreferences();
      expect(prefs).toEqual({
        locale: 'en',
        totalStreak: 0,
        totalXP: 0
      });

      // Complete a lesson and update stats
      storageUtils.updateUserStats(30, 3);

      // Simulate new session
      const savedPrefs = mockLocalStorage.setItem.mock.calls[0][1];
      mockLocalStorage.getItem.mockReturnValue(savedPrefs);

      const loadedPrefs = storageUtils.loadUserPreferences();
      expect(loadedPrefs).toEqual({
        locale: 'en',
        totalStreak: 3,
        totalXP: 30
      });
    });
  });
});