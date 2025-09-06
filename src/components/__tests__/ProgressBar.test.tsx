import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar';

jest.mock('react-i18next');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('ProgressBar', () => {
  const mockT = jest.fn((key: string, options?: any) => {
    if (key === 'lesson.progress.exercise') {
      return `Exercise ${options?.current} of ${options?.total}`;
    }
    if (key === 'accessibility.progressBar') {
      return `Progress: ${options?.current} of ${options?.total} exercises`;
    }
    return key;
  });

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: { language: 'en' } as any
    });

    jest.clearAllMocks();
  });

  it('renders progress bar with first exercise', () => {
    render(<ProgressBar currentExercise={0} totalExercises={5} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '5');
  });

  it('displays correct exercise progress text', () => {
    render(<ProgressBar currentExercise={2} totalExercises={5} />);
    
    expect(screen.getByText('Exercise 3 of 5')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    render(<ProgressBar currentExercise={2} totalExercises={5} />);
    
    const progressFill = document.querySelector('.progress-bar-fill') as HTMLElement;
    expect(progressFill).toHaveStyle('width: 40%'); // 2/5 = 40%
  });

  it('shows correct number of progress steps', () => {
    render(<ProgressBar currentExercise={1} totalExercises={3} />);
    
    const steps = screen.getAllByClassName('progress-step');
    expect(steps).toHaveLength(3);
  });

  it('marks completed steps correctly', () => {
    render(<ProgressBar currentExercise={2} totalExercises={5} />);
    
    const steps = screen.getAllByClassName('progress-step');
    
    // First 2 should be completed
    expect(steps[0]).toHaveClass('progress-step', 'completed');
    expect(steps[1]).toHaveClass('progress-step', 'completed');
    
    // Third should be current
    expect(steps[2]).toHaveClass('progress-step', 'current');
    
    // Rest should be upcoming
    expect(steps[3]).toHaveClass('progress-step', 'upcoming');
    expect(steps[4]).toHaveClass('progress-step', 'upcoming');
  });

  it('has correct accessibility attributes', () => {
    render(<ProgressBar currentExercise={1} totalExercises={4} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', 'Progress: 2 of 4 exercises');
    
    const progressText = screen.getByText('Exercise 2 of 4');
    expect(progressText.closest('.progress-text')).toHaveAttribute('aria-live', 'polite');
  });

  it('supports custom className', () => {
    render(<ProgressBar currentExercise={0} totalExercises={5} className="custom-class" />);
    
    const container = screen.getByRole('progressbar').closest('.progress-bar-container');
    expect(container).toHaveClass('progress-bar-container', 'custom-class');
  });

  it('handles edge case of 0 total exercises', () => {
    render(<ProgressBar currentExercise={0} totalExercises={0} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemax', '0');
    
    const progressFill = document.querySelector('.progress-bar-fill') as HTMLElement;
    expect(progressFill).toHaveStyle('width: 0%'); // Should handle division by zero
  });

  it('shows 100% progress when all exercises completed', () => {
    render(<ProgressBar currentExercise={5} totalExercises={5} />);
    
    const progressFill = document.querySelector('.progress-bar-fill') as HTMLElement;
    expect(progressFill).toHaveStyle('width: 100%');
    
    const steps = screen.getAllByClassName('progress-step');
    steps.forEach(step => {
      expect(step).toHaveClass('progress-step', 'completed');
    });
  });
});

// Helper function to get element by className since screen doesn't have this by default
function getByClassName(className: string) {
  const element = document.querySelector(`.${className}`);
  if (!element) {
    throw new Error(`Element with class "${className}" not found`);
  }
  return element as HTMLElement;
}

function getAllByClassName(className: string) {
  return Array.from(document.querySelectorAll(`.${className}`)) as HTMLElement[];
}

// Add these methods to screen for easier testing
screen.getByClassName = getByClassName;
screen.getAllByClassName = getAllByClassName;