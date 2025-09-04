import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import LessonStart from '../LessonStart';
import { useAppContext } from '../../contexts/AppContext';

// Mock the hooks
jest.mock('react-i18next');
jest.mock('../../contexts/AppContext');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseAppContext = useAppContext as jest.MockedFunction<typeof useAppContext>;

const mockLesson = {
  id: 'lesson-basics-1',
  title: 'Basic Phrases',
  xp_per_correct: 10,
  streak_increment: 1,
  exercises: [
    {
      id: 'ex1',
      type: 'multiple_choice',
      prompt_en: 'Hello',
      explanation_en: 'A greeting',
      choices: ['Hola', 'Adiós'],
      answer: 'Hola'
    },
    {
      id: 'ex2', 
      type: 'type_answer',
      prompt_en: 'Goodbye',
      explanation_en: 'A farewell',
      answer: ['Adiós'],
      tolerance: { caseInsensitive: true, trim: true }
    }
  ]
};

const mockAppState = {
  lessonState: {
    lesson: null,
    currentExerciseIndex: 0,
    answers: {},
    hearts: 3,
    streak: 5,
    xp: 120,
    isComplete: false,
    startTime: Date.now(),
    lastSavedTime: Date.now()
  },
  locale: 'en',
  isLoading: false,
  error: null
};

describe('LessonStart', () => {
  const mockOnStart = jest.fn();
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        changeLanguage: jest.fn(),
        language: 'en'
      } as any
    });

    mockUseAppContext.mockReturnValue({
      state: mockAppState,
      actions: {
        setLoading: jest.fn(),
        setError: jest.fn()
      }
    });

    jest.clearAllMocks();
  });

  it('renders lesson information correctly', () => {
    render(<LessonStart lesson={mockLesson} onStartLesson={mockOnStart} />);
    
    expect(screen.getByText('Basic Phrases')).toBeInTheDocument();
    expect(screen.getByText('2 exercises')).toBeInTheDocument();
  });

  it('displays user stats correctly', () => {
    render(<LessonStart lesson={mockLesson} onStartLesson={mockOnStart} />);
    
    // Check hearts, streak, and XP are displayed
    expect(screen.getByText('3')).toBeInTheDocument(); // hearts
    expect(screen.getByText('5')).toBeInTheDocument(); // streak
    expect(screen.getByText('120')).toBeInTheDocument(); // XP
  });

  it('shows exercise type badges', () => {
    render(<LessonStart lesson={mockLesson} onStartLesson={mockOnStart} />);
    
    // Should show badges for multiple_choice and type_answer
    expect(screen.getByText('exerciseTypes.multiple_choice')).toBeInTheDocument();
    expect(screen.getByText('exerciseTypes.type_answer')).toBeInTheDocument();
  });

  it('calls onStartLesson when start button is clicked', () => {
    render(<LessonStart lesson={mockLesson} onStartLesson={mockOnStart} />);
    
    const startButton = screen.getByText('lesson.start');
    fireEvent.click(startButton);
    
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('shows estimated time', () => {
    render(<LessonStart lesson={mockLesson} onStartLesson={mockOnStart} />);
    
    expect(screen.getByText('lesson.estimatedTime')).toBeInTheDocument();
  });

  it('displays exercise type icons correctly', () => {
    render(<LessonStart lesson={mockLesson} onStartLesson={mockOnStart} />);
    
    // Check that exercise type badges have proper classes
    const multipleChoiceBadge = screen.getByText('exerciseTypes.multiple_choice').closest('.exercise-type-badge');
    const typeAnswerBadge = screen.getByText('exerciseTypes.type_answer').closest('.exercise-type-badge');
    
    expect(multipleChoiceBadge).toHaveClass('multiple_choice');
    expect(typeAnswerBadge).toHaveClass('type_answer');
  });

  it('handles empty exercises array', () => {
    const emptyLesson = { ...mockLesson, exercises: [] };
    render(<LessonStart lesson={emptyLesson} onStartLesson={mockOnStart} />);
    
    expect(screen.getByText('0 exercises')).toBeInTheDocument();
  });
});