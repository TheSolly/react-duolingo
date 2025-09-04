import { useEffect, useState, useCallback } from 'react';
import { AppProvider } from './contexts/AppContext';
import { LessonProvider } from './contexts/LessonContext';
import { useAppContext } from './contexts/AppContext';
import { useLessonContext } from './contexts/LessonContext';
import { loadLesson } from './utils/lessonLoader';
import { useTranslation } from 'react-i18next';
import LessonStart from './components/LessonStart';
import ExercisePlayer from './components/ExercisePlayer';
import CompletionScreen from './components/CompletionScreen';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/globals.css';

type AppScreen = 'start' | 'lesson' | 'complete' | 'error';

function AppContent() {
  const { state: appState, actions: appActions } = useAppContext();
  const { state: lessonState, actions: lessonActions } = useLessonContext();
  const { i18n } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('start');

  const loadLessonData = useCallback(async () => {
    try {
      appActions.setLoading(true);
      appActions.setError(null);
      const lesson = await loadLesson('lesson-basics-1');
      lessonActions.loadLesson(lesson);
    } catch (error) {
      appActions.setError(
        error instanceof Error ? error.message : 'Failed to load lesson'
      );
      setCurrentScreen('error');
    } finally {
      appActions.setLoading(false);
    }
  }, [appActions, lessonActions]);

  useEffect(() => {
    i18n.changeLanguage(appState.locale);
  }, [appState.locale, i18n]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  useEffect(() => {
    if (
      lessonState.lesson &&
      lessonState.currentExerciseIndex === 0 &&
      !lessonState.isComplete
    ) {
      setCurrentScreen('start');
    } else if (lessonState.isComplete) {
      setCurrentScreen('complete');
    }
  }, [lessonState]);

  const handleStartLesson = () => {
    setCurrentScreen('lesson');
  };

  const handleRestartLesson = () => {
    lessonActions.restartLesson();
    setCurrentScreen('start');
  };

  if (appState.isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (currentScreen === 'error' || appState.error) {
    return (
      <div className="app-error">
        <div className="error-content">
          <h2>Oops! Something went wrong</h2>
          <p>{appState.error || 'An unexpected error occurred'}</p>
          <button onClick={loadLessonData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="language-switcher">
          <button
            onClick={() => appActions.setLocale('en')}
            className={`lang-btn ${appState.locale === 'en' ? 'active' : ''}`}
            aria-pressed={appState.locale === 'en'}
          >
            EN
          </button>
          <button
            onClick={() => appActions.setLocale('es')}
            className={`lang-btn ${appState.locale === 'es' ? 'active' : ''}`}
            aria-pressed={appState.locale === 'es'}
          >
            ES
          </button>
        </div>
      </header>

      <main className="app-main">
        {currentScreen === 'start' && (
          <LessonStart
            lesson={lessonState.lesson}
            onStartLesson={handleStartLesson}
          />
        )}

        {currentScreen === 'lesson' && <ExercisePlayer />}

        {currentScreen === 'complete' && (
          <CompletionScreen onRestartLesson={handleRestartLesson} />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <LessonProvider>
          <AppContent />
        </LessonProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
