import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import ExercisePlayer from '../ExercisePlayer';
import { useLessonContext } from '../../contexts/LessonContext';

// Mock the hooks and components
jest.mock('react-i18next');
jest.mock('../../contexts/LessonContext');
jest.mock('../ProgressBar', () => ({ progress }: { progress: number }) => 
  <div data-testid="progress-bar">Progress: {progress}%</div>
);
jest.mock('../StreakHearts', () => ({ hearts, streak }: { hearts: number; streak: number }) => 
  <div data-testid="streak-hearts">Hearts: {hearts}, Streak: {streak}</div>
);
jest.mock('../FeedbackBanner', () => ({ feedback }: { feedback: any }) => 
  <div data-testid="feedback-banner">Feedback: {feedback.type}</div>
);

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseLessonContext = useLessonContext as jest.MockedFunction<typeof useLessonContext>;

const mockLesson = {
  id: 'lesson-basics-1',
  title: 'Basic Phrases',
  xp_per_correct: 10,
  streak_increment: 1,
  exercises: [
    {
      id: 'ex1',
      type: 'multiple_choice' as const,
      prompt_en: 'What does "Hello" mean in Spanish?',
      explanation_en: 'A greeting',
      choices: ['Hola', 'Adiós', 'Gracias'],
      answer: 'Hola'
    },
    {
      id: 'ex2',
      type: 'type_answer' as const,
      prompt_en: 'Type "Goodbye" in Spanish',
      explanation_en: 'A farewell',
      answer: ['Adiós'],
      tolerance: { caseInsensitive: true, trim: true }
    }
  ]
};

const mockLessonState = {
  lesson: mockLesson,
  currentExerciseIndex: 0,
  answers: {},
  hearts: 3,
  streak: 2,
  xp: 50,
  isComplete: false,
  startTime: Date.now(),
  lastSavedTime: Date.now()
};

describe('ExercisePlayer', () => {
  const mockSubmitAnswer = jest.fn();
  const mockNextExercise = jest.fn();
  const mockLoseHeart = jest.fn();
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: { language: 'en' } as any
    });

    mockUseLessonContext.mockReturnValue({
      state: mockLessonState,
      actions: {
        loadLesson: jest.fn(),
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        loseHeart: mockLoseHeart,
        completeLesson: jest.fn(),
        restartLesson: jest.fn()
      }
    });

    jest.clearAllMocks();
  });

  it('renders progress bar with correct progress', () => {
    render(<ExercisePlayer />);
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveTextContent('Progress: 0%'); // 0/2 exercises completed
  });

  it('displays hearts and streak correctly', () => {
    render(<ExercisePlayer />);
    
    const streakHearts = screen.getByTestId('streak-hearts');
    expect(streakHearts).toHaveTextContent('Hearts: 3, Streak: 2');
  });

  it('shows current exercise prompt', () => {
    render(<ExercisePlayer />);
    
    expect(screen.getByText('What does "Hello" mean in Spanish?')).toBeInTheDocument();
  });

  it('renders multiple choice exercise', () => {
    render(<ExercisePlayer />);
    
    // Should render multiple choice options
    expect(screen.getByText('Hola')).toBeInTheDocument();
    expect(screen.getByText('Adiós')).toBeInTheDocument();
    expect(screen.getByText('Gracias')).toBeInTheDocument();
  });

  it('handles answer submission correctly', async () => {
    render(<ExercisePlayer />);
    
    // Select correct answer
    const correctOption = screen.getByDisplayValue('Hola');
    fireEvent.click(correctOption);
    
    const submitButton = screen.getByText('exercise.submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmitAnswer).toHaveBeenCalledWith('ex1', 'Hola', true, expect.any(Number));
    });
  });

  it('shows feedback banner after answer submission', async () => {
    render(<ExercisePlayer />);
    
    // Submit an answer
    const correctOption = screen.getByDisplayValue('Hola');
    fireEvent.click(correctOption);
    
    const submitButton = screen.getByText('exercise.submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const feedbackBanner = screen.getByTestId('feedback-banner');
      expect(feedbackBanner).toBeInTheDocument();
    });
  });

  it('advances to next exercise after continue', async () => {
    render(<ExercisePlayer />);
    
    // Submit correct answer
    const correctOption = screen.getByDisplayValue('Hola');
    fireEvent.click(correctOption);
    
    const submitButton = screen.getByText('exercise.submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const continueButton = screen.getByText('exercise.continue');
      fireEvent.click(continueButton);
      
      expect(mockNextExercise).toHaveBeenCalledTimes(1);
    });
  });

  it('shows correct progress after completing first exercise', () => {
    const completedState = {
      ...mockLessonState,
      currentExerciseIndex: 1,
      answers: { ex1: { exerciseId: 'ex1', userAnswer: 'Hola', correctAnswer: 'Hola', isCorrect: true, timeSpent: 1000 } }
    };

    mockUseLessonContext.mockReturnValue({
      state: completedState,
      actions: {
        loadLesson: jest.fn(),
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        loseHeart: mockLoseHeart,
        completeLesson: jest.fn(),
        restartLesson: jest.fn()
      }
    });

    render(<ExercisePlayer />);
    
    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveTextContent('Progress: 50%'); // 1/2 exercises completed
  });

  it('renders type answer exercise for second exercise', () => {
    const typeAnswerState = {
      ...mockLessonState,
      currentExerciseIndex: 1
    };

    mockUseLessonContext.mockReturnValue({
      state: typeAnswerState,
      actions: {
        loadLesson: jest.fn(),
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        loseHeart: mockLoseHeart,
        completeLesson: jest.fn(),
        restartLesson: jest.fn()
      }
    });

    render(<ExercisePlayer />);
    
    expect(screen.getByText('Type "Goodbye" in Spanish')).toBeInTheDocument();
    expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Input field
  });

  it('handles incorrect answer and loses heart', async () => {
    render(<ExercisePlayer />);
    
    // Select incorrect answer
    const incorrectOption = screen.getByDisplayValue('Adiós');
    fireEvent.click(incorrectOption);
    
    const submitButton = screen.getByText('exercise.submit');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSubmitAnswer).toHaveBeenCalledWith('ex1', 'Adiós', false, expect.any(Number));
      expect(mockLoseHeart).toHaveBeenCalledTimes(1);
    });
  });
});