import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import StreakHearts from '../StreakHearts';

jest.mock('react-i18next');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('StreakHearts', () => {
  const mockT = jest.fn((key: string, options?: any) => {
    if (key === 'accessibility.currentStreak') {
      return `Current streak: ${options?.streak}`;
    }
    if (key === 'accessibility.heartsRemaining') {
      return `Hearts remaining: ${options?.count}`;
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

  it('renders streak count and icon', () => {
    render(<StreakHearts hearts={3} streak={5} />);
    
    expect(screen.getByText('🔥')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders correct number of hearts when full', () => {
    render(<StreakHearts hearts={3} streak={5} maxHearts={3} />);
    
    const filledHearts = screen.getAllByText('❤️');
    const emptyHearts = screen.queryAllByText('🤍');
    
    expect(filledHearts).toHaveLength(3);
    expect(emptyHearts).toHaveLength(0);
  });

  it('renders correct number of hearts when partially empty', () => {
    render(<StreakHearts hearts={2} streak={5} maxHearts={3} />);
    
    const filledHearts = screen.getAllByText('❤️');
    const emptyHearts = screen.getAllByText('🤍');
    
    expect(filledHearts).toHaveLength(2);
    expect(emptyHearts).toHaveLength(1);
  });

  it('renders all empty hearts when hearts is 0', () => {
    render(<StreakHearts hearts={0} streak={5} maxHearts={3} />);
    
    const filledHearts = screen.queryAllByText('❤️');
    const emptyHearts = screen.getAllByText('🤍');
    
    expect(filledHearts).toHaveLength(0);
    expect(emptyHearts).toHaveLength(3);
  });

  it('handles custom maxHearts value', () => {
    render(<StreakHearts hearts={4} streak={5} maxHearts={5} />);
    
    const filledHearts = screen.getAllByText('❤️');
    const emptyHearts = screen.getAllByText('🤍');
    
    expect(filledHearts).toHaveLength(4);
    expect(emptyHearts).toHaveLength(1);
  });

  it('displays accessibility text for streak', () => {
    render(<StreakHearts hearts={3} streak={7} />);
    
    const streakElement = screen.getByLabelText('Current streak: 7');
    expect(streakElement).toBeInTheDocument();
  });

  it('displays accessibility text for hearts', () => {
    render(<StreakHearts hearts={2} streak={5} />);
    
    expect(screen.getByText('Hearts remaining: 2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<StreakHearts hearts={3} streak={5} className="custom-class" />);
    
    const container = screen.getByText('🔥').closest('.streak-hearts');
    expect(container).toHaveClass('streak-hearts', 'custom-class');
  });

  it('hearts have correct CSS classes based on filled state', () => {
    render(<StreakHearts hearts={2} streak={5} maxHearts={3} />);
    
    const heartElements = screen.getAllByText(/[❤️🤍]/);
    
    // First two should be filled
    expect(heartElements[0].closest('.heart')).toHaveClass('heart', 'filled');
    expect(heartElements[1].closest('.heart')).toHaveClass('heart', 'filled');
    
    // Third should be empty
    expect(heartElements[2].closest('.heart')).toHaveClass('heart', 'empty');
  });

  it('streak count has correct aria-label', () => {
    render(<StreakHearts hearts={3} streak={10} />);
    
    const streakCount = screen.getByText('10');
    expect(streakCount).toHaveAttribute('aria-label', 'Current streak: 10');
  });

  it('hearts text is live region for screen readers', () => {
    render(<StreakHearts hearts={1} streak={5} />);
    
    const heartsText = screen.getByText('Hearts remaining: 1').closest('.hearts-text');
    expect(heartsText).toHaveAttribute('aria-live', 'polite');
  });

  it('handles zero streak correctly', () => {
    render(<StreakHearts hearts={3} streak={0} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByLabelText('Current streak: 0')).toBeInTheDocument();
  });
});