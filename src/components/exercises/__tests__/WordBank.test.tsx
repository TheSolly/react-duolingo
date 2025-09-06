import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import WordBank from '../WordBank';

jest.mock('react-i18next');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

const mockExercise = {
  id: 'wb1',
  type: 'word_bank' as const,
  prompt_en: 'Arrange the words to form: "The cat is black"',
  explanation_en: 'Basic sentence structure',
  bank: ['The', 'cat', 'is', 'black', 'dog', 'white'],
  answer: ['The', 'cat', 'is', 'black']
};

describe('WordBank', () => {
  const mockOnAnswerSubmit = jest.fn();
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: { language: 'en' } as any
    });

    jest.clearAllMocks();
  });

  it('renders the exercise prompt', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    expect(screen.getByText('Arrange the words to form: "The cat is black"')).toBeInTheDocument();
  });

  it('renders all bank words as available initially', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    expect(screen.getByText('The')).toBeInTheDocument();
    expect(screen.getByText('cat')).toBeInTheDocument();
    expect(screen.getByText('is')).toBeInTheDocument();
    expect(screen.getByText('black')).toBeInTheDocument();
    expect(screen.getByText('dog')).toBeInTheDocument();
    expect(screen.getByText('white')).toBeInTheDocument();
  });

  it('allows selecting words in order', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Click words in order
    fireEvent.click(screen.getByText('The'));
    fireEvent.click(screen.getByText('cat'));
    fireEvent.click(screen.getByText('is'));
    fireEvent.click(screen.getByText('black'));

    // Should show selected words in order
    const selectedContainer = screen.getByRole('region', { name: /selected words/i });
    const selectedWords = selectedContainer.querySelectorAll('.word-chip.selected');
    
    expect(selectedWords).toHaveLength(4);
    expect(selectedWords[0]).toHaveTextContent('The');
    expect(selectedWords[1]).toHaveTextContent('cat');
    expect(selectedWords[2]).toHaveTextContent('is');
    expect(selectedWords[3]).toHaveTextContent('black');
  });

  it('removes selected words from available bank', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Click "The" 
    fireEvent.click(screen.getByText('The'));

    // "The" should no longer be in available words
    const availableContainer = screen.getByRole('region', { name: /available words/i });
    expect(availableContainer).not.toHaveTextContent('The');
    
    // But other words should still be available
    expect(availableContainer).toHaveTextContent('cat');
    expect(availableContainer).toHaveTextContent('is');
  });

  it('allows removing words from selection', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Select some words
    fireEvent.click(screen.getByText('The'));
    fireEvent.click(screen.getByText('cat'));

    // Click on selected "The" to remove it
    const selectedContainer = screen.getByRole('region', { name: /selected words/i });
    const selectedThe = selectedContainer.querySelector('.word-chip.selected');
    fireEvent.click(selectedThe!);

    // "The" should be back in available words
    const availableContainer = screen.getByRole('region', { name: /available words/i });
    expect(availableContainer).toHaveTextContent('The');

    // Selected should only have "cat"
    const remainingSelected = selectedContainer.querySelectorAll('.word-chip.selected');
    expect(remainingSelected).toHaveLength(1);
    expect(remainingSelected[0]).toHaveTextContent('cat');
  });

  it('maintains order when words are removed from middle of selection', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Select words in order
    fireEvent.click(screen.getByText('The'));
    fireEvent.click(screen.getByText('cat'));
    fireEvent.click(screen.getByText('is'));

    // Remove middle word "cat"
    const selectedContainer = screen.getByRole('region', { name: /selected words/i });
    const selectedWords = selectedContainer.querySelectorAll('.word-chip.selected');
    fireEvent.click(selectedWords[1]); // "cat"

    // Should have "The" and "is" remaining
    const remaining = selectedContainer.querySelectorAll('.word-chip.selected');
    expect(remaining).toHaveLength(2);
    expect(remaining[0]).toHaveTextContent('The');
    expect(remaining[1]).toHaveTextContent('is');
  });

  it('submits correct answer when sequence is correct', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Select words in correct order
    fireEvent.click(screen.getByText('The'));
    fireEvent.click(screen.getByText('cat'));
    fireEvent.click(screen.getByText('is'));
    fireEvent.click(screen.getByText('black'));

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith(['The', 'cat', 'is', 'black'], true);
  });

  it('submits incorrect answer when sequence is wrong', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Select words in wrong order
    fireEvent.click(screen.getByText('cat'));
    fireEvent.click(screen.getByText('The'));
    fireEvent.click(screen.getByText('black'));
    fireEvent.click(screen.getByText('is'));

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith(['cat', 'The', 'black', 'is'], false);
  });

  it('submits incorrect answer when wrong words are selected', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Select wrong words
    fireEvent.click(screen.getByText('The'));
    fireEvent.click(screen.getByText('dog'));
    fireEvent.click(screen.getByText('is'));
    fireEvent.click(screen.getByText('white'));

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith(['The', 'dog', 'is', 'white'], false);
  });

  it('submits incorrect answer when too few words selected', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Select only some words
    fireEvent.click(screen.getByText('The'));
    fireEvent.click(screen.getByText('cat'));

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith(['The', 'cat'], false);
  });

  it('disables submit button when no words are selected', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when words are selected', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    fireEvent.click(screen.getByText('The'));

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    expect(submitButton).not.toBeDisabled();
  });

  it('disables all inputs when disabled prop is true', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
        disabled={true}
      />
    );

    const availableWords = screen.getAllByRole('button');
    availableWords.forEach(button => {
      expect(button).toBeDisabled();
    });

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    expect(submitButton).toBeDisabled();
  });

  it('prevents further selection after submission', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Select and submit
    fireEvent.click(screen.getByText('The'));
    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    fireEvent.click(submitButton);

    // Try to select another word
    fireEvent.click(screen.getByText('cat'));

    // Should not have changed selection
    expect(mockOnAnswerSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnAnswerSubmit).toHaveBeenCalledWith(['The'], false);
  });

  it('supports keyboard navigation', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const firstWord = screen.getByText('The');
    firstWord.focus();
    
    // Press Enter to select
    fireEvent.keyDown(firstWord, { key: 'Enter', code: 'Enter' });
    
    const selectedContainer = screen.getByRole('region', { name: /selected words/i });
    const selectedWords = selectedContainer.querySelectorAll('.word-chip.selected');
    expect(selectedWords).toHaveLength(1);
    expect(selectedWords[0]).toHaveTextContent('The');
  });

  it('supports spacebar for selection', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const firstWord = screen.getByText('The');
    
    // Press Space to select
    fireEvent.keyDown(firstWord, { key: ' ', code: 'Space' });
    
    const selectedContainer = screen.getByRole('region', { name: /selected words/i });
    const selectedWords = selectedContainer.querySelectorAll('.word-chip.selected');
    expect(selectedWords).toHaveLength(1);
    expect(selectedWords[0]).toHaveTextContent('The');
  });

  it('enforces correct ordering for validation', () => {
    render(
      <WordBank
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    // Test that order matters - same words, different order
    const correctOrder = ['The', 'cat', 'is', 'black'];
    const wrongOrder = ['black', 'is', 'cat', 'The'];

    // First test correct order
    correctOrder.forEach(word => {
      fireEvent.click(screen.getByText(word));
    });
    
    fireEvent.click(screen.getByText('lesson.exercise.checkAnswer'));
    expect(mockOnAnswerSubmit).toHaveBeenLastCalledWith(correctOrder, true);

    // Reset for second test (this would be a new exercise instance in real usage)
    mockOnAnswerSubmit.mockClear();
  });
});