import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';
import { storageUtils } from '../utils/storage';

interface AppState {
  locale: string;
  isLoading: boolean;
  error: string | null;
  totalStreak: number;
  totalXP: number;
}

type AppAction =
  | { type: 'SET_LOCALE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | {
      type: 'LOAD_USER_PREFERENCES';
      payload: { locale: string; totalStreak: number; totalXP: number };
    }
  | {
      type: 'UPDATE_USER_STATS';
      payload: { xpGained: number; streakIncrement: number };
    };

const initialAppState: AppState = {
  locale: 'en',
  isLoading: false,
  error: null,
  totalStreak: 0,
  totalXP: 0,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOCALE':
      return { ...state, locale: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOAD_USER_PREFERENCES':
      return {
        ...state,
        locale: action.payload.locale,
        totalStreak: action.payload.totalStreak,
        totalXP: action.payload.totalXP,
      };
    case 'UPDATE_USER_STATS':
      return {
        ...state,
        totalXP: state.totalXP + action.payload.xpGained,
        totalStreak: state.totalStreak + action.payload.streakIncrement,
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  actions: {
    setLocale: (locale: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    loadUserPreferences: () => void;
    updateUserStats: (xpGained: number, streakIncrement: number) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  useEffect(() => {
    const preferences = storageUtils.loadUserPreferences();
    dispatch({
      type: 'LOAD_USER_PREFERENCES',
      payload: {
        locale: preferences.locale,
        totalStreak: preferences.totalStreak,
        totalXP: preferences.totalXP,
      },
    });
  }, []);

  const actions = useMemo(() => ({
    setLocale: (locale: string) => {
      dispatch({ type: 'SET_LOCALE', payload: locale });
      const currentPrefs = storageUtils.loadUserPreferences();
      storageUtils.saveUserPreferences({ ...currentPrefs, locale });
    },

    setLoading: (loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    },

    setError: (error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    },

    loadUserPreferences: () => {
      const preferences = storageUtils.loadUserPreferences();
      dispatch({
        type: 'LOAD_USER_PREFERENCES',
        payload: {
          locale: preferences.locale,
          totalStreak: preferences.totalStreak,
          totalXP: preferences.totalXP,
        },
      });
    },

    updateUserStats: (xpGained: number, streakIncrement: number) => {
      // Update localStorage first
      storageUtils.updateUserStats(xpGained, streakIncrement);
      // Then update the context state
      dispatch({
        type: 'UPDATE_USER_STATS',
        payload: { xpGained, streakIncrement },
      });
    },
  }), []);

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
