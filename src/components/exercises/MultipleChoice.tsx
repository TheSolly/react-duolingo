import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MultipleChoiceExercise } from '../../types';
import { validateMultipleChoice } from '../../utils/validation';

interface MultipleChoiceProps {
  exercise: MultipleChoiceExercise;
  onAnswerSubmit: (userAnswer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

function MultipleChoice({
  exercise,
  onAnswerSubmit,
  disabled = false,
}: MultipleChoiceProps) {
  const { t } = useTranslation();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setSelectedAnswer('');
    setHasSubmitted(false);
  }, [exercise.id]);

  const handleSubmit = () => {
    if (!selectedAnswer || hasSubmitted) return;

    const isCorrect = validateMultipleChoice(selectedAnswer, exercise.answer);
    onAnswerSubmit(selectedAnswer, isCorrect);
    setHasSubmitted(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && selectedAnswer && !hasSubmitted) {
      handleSubmit();
    }
  };

  return (
    <div className="exercise multiple-choice">
      <div className="exercise-header">
        <h2 className="exercise-prompt">{exercise.prompt_en}</h2>
        <p className="exercise-instruction">
          {t('exercises.multipleChoice.instruction')}
        </p>
      </div>

      <div className="exercise-content">
        <fieldset className="choices-container">
          <legend className="sr-only">
            {t('exercises.multipleChoice.instruction')}
          </legend>

          {exercise.choices.map((choice, index) => (
            <label
              key={index}
              className={`choice-item ${selectedAnswer === choice ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onKeyDown={handleKeyDown}
              tabIndex={disabled ? -1 : 0}
            >
              <input
                type="radio"
                name={`choice-${exercise.id}`}
                value={choice}
                checked={selectedAnswer === choice}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={disabled}
                aria-describedby={`choice-${index}-description`}
              />

              <div className="choice-content">
                <span className="choice-text">{choice}</span>
                <div className="choice-indicator" aria-hidden="true">
                  {selectedAnswer === choice ? '●' : '○'}
                </div>
              </div>

              <span id={`choice-${index}-description`} className="sr-only">
                {selectedAnswer === choice
                  ? t('accessibility.selectedAnswer', { answer: choice })
                  : ''}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="exercise-actions">
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer || hasSubmitted || disabled}
            className="submit-button"
            aria-describedby="submit-help"
          >
            {t('lesson.exercise.checkAnswer')}
          </button>

          <div id="submit-help" className="sr-only">
            {selectedAnswer
              ? `Selected: ${selectedAnswer}. Press to submit answer.`
              : 'Select an answer to continue'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MultipleChoice;
