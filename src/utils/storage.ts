import { LessonState } from '../types';

const LESSON_STATE_KEY = 'duolingo-lesson-state';
const USER_PREFERENCES_KEY = 'duolingo-user-preferences';

export interface UserPreferences {
  locale: string;
  totalStreak: number;
  totalXP: number;
  lastPlayedLessonId?: string;
}

export const storageUtils = {
  saveLessonState: (state: LessonState): void => {
    try {
      const serializedState = JSON.stringify({
        ...state,
        lastSavedTime: Date.now(),
      });
      localStorage.setItem(LESSON_STATE_KEY, serializedState);
    } catch (error) {
      console.error('Failed to save lesson state:', error);
    }
  },

  loadLessonState: (): Partial<LessonState> | null => {
    try {
      const savedState = localStorage.getItem(LESSON_STATE_KEY);
      if (!savedState) return null;

      const parsedState = JSON.parse(savedState) as LessonState;

      // Validate that the saved state is still relevant (within 24 hours)
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (parsedState.lastSavedTime && parsedState.lastSavedTime < oneDayAgo) {
        localStorage.removeItem(LESSON_STATE_KEY);
        return null;
      }

      return parsedState;
    } catch (error) {
      console.error('Failed to load lesson state:', error);
      localStorage.removeItem(LESSON_STATE_KEY);
      return null;
    }
  },

  clearLessonState: (): void => {
    try {
      localStorage.removeItem(LESSON_STATE_KEY);
    } catch (error) {
      console.error('Failed to clear lesson state:', error);
    }
  },

  saveUserPreferences: (preferences: UserPreferences): void => {
    try {
      const serializedPrefs = JSON.stringify(preferences);
      localStorage.setItem(USER_PREFERENCES_KEY, serializedPrefs);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  },

  loadUserPreferences: (): UserPreferences => {
    try {
      const savedPrefs = localStorage.getItem(USER_PREFERENCES_KEY);
      if (!savedPrefs) {
        return {
          locale: 'en',
          totalStreak: 0,
          totalXP: 0,
        };
      }

      return JSON.parse(savedPrefs) as UserPreferences;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return {
        locale: 'en',
        totalStreak: 0,
        totalXP: 0,
      };
    }
  },

  updateUserStats: (xpGained: number, streakIncrement: number): void => {
    const currentPrefs = storageUtils.loadUserPreferences();
    const updatedPrefs: UserPreferences = {
      ...currentPrefs,
      totalXP: currentPrefs.totalXP + xpGained,
      totalStreak: Math.max(
        currentPrefs.totalStreak,
        currentPrefs.totalStreak + streakIncrement
      ),
    };
    storageUtils.saveUserPreferences(updatedPrefs);
  },

  isStorageAvailable: (): boolean => {
    try {
      const testKey = '__duolingo_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};
