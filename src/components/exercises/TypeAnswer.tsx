import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TypeAnswerExercise } from '../../types';
import { validateTextAnswer, getValidationFeedback } from '../../utils/validation';

interface TypeAnswerProps {
  exercise: TypeAnswerExercise;
  onAnswerSubmit: (userAnswer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

function TypeAnswer({
  exercise,
  onAnswerSubmit,
  disabled = false,
}: TypeAnswerProps) {
  const { t, i18n } = useTranslation();
  const [userInput, setUserInput] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ isClose: boolean; suggestion?: string; hint?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUserInput('');
    setHasSubmitted(false);
    setFeedback(null);
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [exercise.id, disabled]);

  const handleSubmit = () => {
    if (!userInput.trim() || hasSubmitted) return;

    const isCorrect = validateTextAnswer(
      userInput,
      exercise.answer,
      exercise.tolerance
    );
    
    // Get feedback for wrong answers
    if (!isCorrect) {
      const validationFeedback = getValidationFeedback(
        userInput,
        exercise.answer,
        exercise.tolerance
      );
      setFeedback(validationFeedback);
    }
    
    onAnswerSubmit(userInput.trim(), isCorrect);
    setHasSubmitted(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && userInput.trim() && !hasSubmitted) {
      handleSubmit();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled && !hasSubmitted) {
      setUserInput(event.target.value);
    }
  };

  return (
    <div className="exercise type-answer">
      <div className="exercise-header">
        <h2 className="exercise-prompt">
          {i18n.language === 'es' && exercise.prompt_es 
            ? exercise.prompt_es 
            : exercise.prompt_en}
        </h2>
        <p className="exercise-instruction">
          {t('exercises.typeAnswer.instruction')}
        </p>
      </div>

      <div className="exercise-content">
        <div className="input-container">
          <label htmlFor={`input-${exercise.id}`} className="sr-only">
            {t('exercises.typeAnswer.instruction')}
          </label>

          <input
            ref={inputRef}
            id={`input-${exercise.id}`}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t('exercises.typeAnswer.placeholder')}
            disabled={disabled || hasSubmitted}
            className={`answer-input ${disabled ? 'disabled' : ''}`}
            autoComplete="off"
            spellCheck="false"
            aria-describedby={`input-help-${exercise.id}`}
          />

          <div id={`input-help-${exercise.id}`} className="input-help">
            <span className="character-count">{userInput.length}/100</span>
            {exercise.tolerance && (
              <span className="tolerance-hint">
                {exercise.tolerance.caseInsensitive && t('exercises.typeAnswer.caseInsensitive')}
                {exercise.tolerance.caseInsensitive &&
                  exercise.tolerance.trim &&
                  ' • '}
                {exercise.tolerance.trim && t('exercises.typeAnswer.spacesIgnored')}
              </span>
            )}
          </div>
        </div>

        <div className="exercise-actions">
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || hasSubmitted || disabled}
            className="submit-button"
            aria-describedby={`submit-help-${exercise.id}`}
          >
            {t('lesson.exercise.checkAnswer')}
          </button>

          <div id={`submit-help-${exercise.id}`} className="sr-only">
            {userInput.trim()
              ? `Your answer: "${userInput}". Press to submit.`
              : 'Type your answer to continue'}
          </div>
        </div>

        {hasSubmitted && (
          <div className="answer-feedback">
            {feedback && feedback.isClose && (
              <div className="feedback-hint">
                <p className="hint-text">{feedback.hint}</p>
                {feedback.suggestion && (
                  <p className="suggestion">
                    <strong>Try:</strong> "{feedback.suggestion}"
                  </p>
                )}
              </div>
            )}
            <div className="correct-answers">
              <h4>Accepted answers:</h4>
              <ul>
                {exercise.answer.map((answer, index) => (
                  <li key={index} className="accepted-answer">
                    "{answer}"
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TypeAnswer;
