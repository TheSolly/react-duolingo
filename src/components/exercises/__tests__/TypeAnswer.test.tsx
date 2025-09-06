import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import TypeAnswer from '../TypeAnswer';

jest.mock('react-i18next');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

const mockExercise = {
  id: 'ta1',
  type: 'type_answer' as const,
  prompt_en: 'Type "Hello" in Spanish',
  explanation_en: 'A common greeting',
  answer: ['Hola', 'hola'],
  tolerance: {
    caseInsensitive: true,
    trim: true
  }
};

describe('TypeAnswer', () => {
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
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    expect(screen.getByText('Type "Hello" in Spanish')).toBeInTheDocument();
  });

  it('renders input field with placeholder', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('allows typing in the input field', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    fireEvent.change(input, { target: { value: 'Hola' } });

    expect(input).toHaveValue('Hola');
  });

  it('submits correct answer', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    fireEvent.change(input, { target: { value: 'Hola' } });

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith('Hola', true);
  });

  it('submits incorrect answer', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    fireEvent.change(input, { target: { value: 'Adiós' } });

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith('Adiós', false);
  });

  it('handles case insensitive matching', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    fireEvent.change(input, { target: { value: 'HOLA' } });

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith('HOLA', true);
  });

  it('handles whitespace trimming', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    fireEvent.change(input, { target: { value: '  Hola  ' } });

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith('Hola', true);
  });

  it('disables submit button when input is empty', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when input has text', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    fireEvent.change(input, { target: { value: 'test' } });

    const submitButton = screen.getByText('lesson.exercise.checkAnswer');
    expect(submitButton).not.toBeDisabled();
  });

  it('disables input and submit when disabled prop is true', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
        disabled={true}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    const submitButton = screen.getByText('lesson.exercise.checkAnswer');

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('submits on Enter key press', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    fireEvent.change(input, { target: { value: 'Hola' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith('Hola', true);
  });

  it('does not submit on Enter when input is empty', () => {
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnAnswerSubmit).not.toHaveBeenCalled();
  });

  it('matches multiple possible answers', () => {
    const { unmount } = render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const input = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    
    // Test first possible answer
    fireEvent.change(input, { target: { value: 'Hola' } });
    fireEvent.click(screen.getByText('lesson.exercise.checkAnswer'));
    expect(mockOnAnswerSubmit).toHaveBeenCalledWith('Hola', true);

    // Unmount and test second possible answer with new instance
    unmount();
    render(
      <TypeAnswer
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );
    
    const newInput = screen.getByPlaceholderText('exercises.typeAnswer.placeholder');
    fireEvent.change(newInput, { target: { value: 'hola' } });
    fireEvent.click(screen.getByText('lesson.exercise.checkAnswer'));
    expect(mockOnAnswerSubmit).toHaveBeenLastCalledWith('hola', true);
  });
});