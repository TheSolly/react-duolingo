import { render, screen, fireEvent } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import MultipleChoice from '../MultipleChoice';

jest.mock('react-i18next');

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

const mockExercise = {
  id: 'mc1',
  type: 'multiple_choice' as const,
  prompt_en: 'What does "Hello" mean in Spanish?',
  explanation_en: 'A common greeting',
  choices: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
  answer: 'Hola'
};

describe('MultipleChoice', () => {
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
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    expect(screen.getByText('What does "Hello" mean in Spanish?')).toBeInTheDocument();
  });

  it('renders all answer choices', () => {
    render(
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    expect(screen.getByText('Hola')).toBeInTheDocument();
    expect(screen.getByText('Adiós')).toBeInTheDocument();
    expect(screen.getByText('Gracias')).toBeInTheDocument();
    expect(screen.getByText('Por favor')).toBeInTheDocument();
  });

  it('allows selecting an answer', () => {
    render(
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const holaOption = screen.getByDisplayValue('Hola');
    fireEvent.click(holaOption);

    expect(holaOption).toBeChecked();
  });

  it('submits correct answer when submit button is clicked', () => {
    render(
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const holaOption = screen.getByDisplayValue('Hola');
    fireEvent.click(holaOption);

    const submitButton = screen.getByText('exercise.submit');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith('Hola', true);
  });

  it('submits incorrect answer when wrong choice is selected', () => {
    render(
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const wrongOption = screen.getByDisplayValue('Adiós');
    fireEvent.click(wrongOption);

    const submitButton = screen.getByText('exercise.submit');
    fireEvent.click(submitButton);

    expect(mockOnAnswerSubmit).toHaveBeenCalledWith('Adiós', false);
  });

  it('disables submit button when no option is selected', () => {
    render(
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const submitButton = screen.getByText('exercise.submit');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when an option is selected', () => {
    render(
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const option = screen.getByDisplayValue('Hola');
    fireEvent.click(option);

    const submitButton = screen.getByText('exercise.submit');
    expect(submitButton).not.toBeDisabled();
  });

  it('disables all inputs when disabled prop is true', () => {
    render(
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
        disabled={true}
      />
    );

    const options = screen.getAllByRole('radio');
    options.forEach(option => {
      expect(option).toBeDisabled();
    });

    const submitButton = screen.getByText('exercise.submit');
    expect(submitButton).toBeDisabled();
  });

  it('allows changing selection between options', () => {
    render(
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const holaOption = screen.getByDisplayValue('Hola');
    const adiosOption = screen.getByDisplayValue('Adiós');

    // Select first option
    fireEvent.click(holaOption);
    expect(holaOption).toBeChecked();
    expect(adiosOption).not.toBeChecked();

    // Select different option
    fireEvent.click(adiosOption);
    expect(holaOption).not.toBeChecked();
    expect(adiosOption).toBeChecked();
  });

  it('renders with proper accessibility attributes', () => {
    render(
      <MultipleChoice
        exercise={mockExercise}
        onAnswerSubmit={mockOnAnswerSubmit}
      />
    );

    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);

    radios.forEach(radio => {
      expect(radio).toHaveAttribute('name', 'mc1-choices');
    });
  });
});