import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import LessonStart from '../LessonStart';
import { useAppContext } from '../../contexts/AppContext';
import { Lesson } from '../../types';

// Mock the hooks
jest.mock('react-i18next');
jest.mock('../../contexts/AppContext');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseAppContext = useAppContext as jest.MockedFunction<typeof useAppContext>;

const mockLesson: Lesson = {
  id: 'lesson-basics-1',
  title: 'Basics 1 — Greetings',
  title_es: 'Básico 1 — Saludos',
  xp_per_correct: 10,
  streak_increment: 1,
  exercises: [
    {
      id: 'ex1',
      type: 'multiple_choice',
      prompt_en: 'Select the translation for: Hello',
      prompt_es: 'Selecciona la traducción de: Hello',
      explanation_en: 'Hola means Hello in Spanish.',
      explanation_es: 'Hola significa Hello en inglés.',
      choices: ['Hola', 'Adiós', 'Gracias'],
      answer: 'Hola'
    },
    {
      id: 'ex2',
      type: 'type_answer',
      prompt_en: 'Type the translation for: Thank you',
      prompt_es: 'Escribe la traducción de: Thank you',
      explanation_en: 'Gracias means Thank you.',
      explanation_es: 'Gracias significa Thank you en inglés.',
      answer: ['gracias'],
      tolerance: { caseInsensitive: true, trim: true }
    }
  ]
};

describe('LessonStart', () => {
  const mockOnStartLesson = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseTranslation.mockReturnValue({
      t: (key: string, options?: any) => {
        const translations: Record<string, string> = {
          'lesson.start.estimatedTime': `${options?.time} min`,
          'lesson.start.hearts': 'Hearts',
          'lesson.start.streak': 'Streak',
          'lesson.start.xp': 'XP',
          'lesson.start.exercises': 'exercises',
          'lesson.start.completionDescription': `Complete ${options?.count} exercises to earn ${options?.xp} XP`,
          'lesson.start.startButton': 'Start Lesson',
          'lesson.start.title': 'Ready to start?',
          'exercises.multipleChoice.name': 'Multiple Choice',
          'exercises.typeAnswer.name': 'Type Answer'
        };
        return translations[key] || key;
      },
      i18n: {
        language: 'en',
        changeLanguage: () => new Promise(() => {}),
      },
    } as any);

    mockUseAppContext.mockReturnValue({
      state: {
        locale: 'en',
        isLoading: false,
        error: null,
        totalStreak: 5,
        totalXP: 100
      },
      actions: {
        setLocale: jest.fn(),
        setLoading: jest.fn(),
        setError: jest.fn(),
        loadUserPreferences: jest.fn(),
        updateUserStats: jest.fn()
      }
    });
  });

  it('renders lesson start and begins lesson on click', () => {
    render(<LessonStart lesson={mockLesson} onStartLesson={mockOnStartLesson} />);
    
    // Check that lesson title is rendered
    expect(screen.getByText('Basics 1 — Greetings')).toBeInTheDocument();
    
    // Check that exercise count is shown
    expect(screen.getByText('2 exercises')).toBeInTheDocument();
    
    // Check that estimated time is shown
    expect(screen.getByText('1 min')).toBeInTheDocument();
    
    // Check that user stats are shown
    expect(screen.getByText('Hearts')).toBeInTheDocument();
    expect(screen.getByText('Streak')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // streak value
    expect(screen.getByText('100')).toBeInTheDocument(); // XP value
    
    // Check that exercise types are shown
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
    expect(screen.getByText('Type Answer')).toBeInTheDocument();
    
    // Check that start button is present
    const startButton = screen.getByText('Start Lesson');
    expect(startButton).toBeInTheDocument();
    
    // Check completion description
    expect(screen.getByText('Complete 2 exercises to earn 20 XP')).toBeInTheDocument();
    
    // Click start lesson button
    fireEvent.click(startButton);
    
    // Verify that onStartLesson was called
    expect(mockOnStartLesson).toHaveBeenCalledTimes(1);
  });

  it('handles null lesson gracefully', () => {
    render(<LessonStart lesson={null} onStartLesson={mockOnStartLesson} />);
    
    // Should show loading state
    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('displays Spanish title when language is Spanish', () => {
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      i18n: {
        language: 'es',
        changeLanguage: () => new Promise(() => {}),
      },
    } as any);

    render(<LessonStart lesson={mockLesson} onStartLesson={mockOnStartLesson} />);
    
    // Should show Spanish title
    expect(screen.getByText('Básico 1 — Saludos')).toBeInTheDocument();
  });
});