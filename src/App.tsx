import { useEffect, useState, useCallback, useRef } from 'react';
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
  const hasLoadedLesson = useRef(false);

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

  // Load lesson only once on mount, but only if no lesson is already loaded from localStorage
  useEffect(() => {
    // Check for error simulation immediately
    const urlParams = new URLSearchParams(window.location.search);
    const errorType = urlParams.get('error');
    
    if (errorType) {
      // Force error state for testing
      let errorMessage = 'An error occurred';
      switch (errorType) {
        case 'malformed':
          errorMessage = 'Lesson data is malformed or missing required fields. Please try refreshing the page.';
          break;
        case 'empty':
          errorMessage = 'This lesson appears to be empty. Please contact support if this problem persists.';
          break;
        case 'notfound':
          errorMessage = 'Lesson "advanced-1" not found. Please check the lesson ID and try again.';
          break;
        case 'network':
          errorMessage = 'Unable to load lesson data. Please check your internet connection and try again.';
          break;
      }
      
      appActions.setError(errorMessage);
      setCurrentScreen('error');
      hasLoadedLesson.current = true;
      return;
    }
    
    // Add a small delay to let localStorage load first
    const timer = setTimeout(() => {
      if (!hasLoadedLesson.current && !lessonState.lesson) {
        hasLoadedLesson.current = true;
        
        const loadData = async () => {
          try {
            appActions.setLoading(true);
            appActions.setError(null);
            console.log('🆕 Loading fresh lesson data...');

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
        };

        loadData();
      } else if (lessonState.lesson) {
        console.log('✅ Using existing lesson data from localStorage');
        hasLoadedLesson.current = true;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [appActions, lessonActions, lessonState.lesson]);

  useEffect(() => {
    console.log('🎯 App screen logic:', {
      isComplete: lessonState.isComplete,
      currentExerciseIndex: lessonState.currentExerciseIndex,
      currentScreen,
      hasLesson: !!lessonState.lesson,
      answersCount: Object.keys(lessonState.answers).length,
    });

    if (lessonState.isComplete) {
      console.log('Setting screen to complete');
      setCurrentScreen('complete');
    } else if (
      lessonState.lesson &&
      currentScreen !== 'lesson'
    ) {
      // Check if this is a fresh lesson (no progress) or resumed lesson
      const hasProgress = lessonState.currentExerciseIndex > 0 || Object.keys(lessonState.answers).length > 0;
      
      if (hasProgress) {
        console.log('🔄 Resuming lesson from saved state, exercise:', lessonState.currentExerciseIndex, 'answers:', Object.keys(lessonState.answers).length);
        setCurrentScreen('lesson');
      } else {
        console.log('🆕 Fresh lesson start');
        setCurrentScreen('start');
      }
    }
  }, [lessonState, currentScreen]);

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
