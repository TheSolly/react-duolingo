import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WordBankExercise } from '../../types';
import { validateWordBankAnswer } from '../../utils/validation';

interface WordBankProps {
  exercise: WordBankExercise;
  onAnswerSubmit: (userAnswer: string[], isCorrect: boolean) => void;
  disabled?: boolean;
}

function WordBank({
  exercise,
  onAnswerSubmit,
  disabled = false,
}: WordBankProps) {
  const { t } = useTranslation();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    setSelectedWords([]);
    setAvailableWords([...exercise.bank]);
    setHasSubmitted(false);
  }, [exercise.id, exercise.bank]);

  const handleWordClick = (word: string, fromSelected = false) => {
    if (disabled || hasSubmitted) return;

    if (fromSelected) {
      // Remove word from selected and add back to available
      setSelectedWords((prev) => prev.filter((w) => w !== word));
      setAvailableWords((prev) => [...prev, word]);
    } else {
      // Add word to selected and remove from available
      setSelectedWords((prev) => [...prev, word]);
      setAvailableWords((prev) => prev.filter((w) => w !== word));
    }
  };

  const handleSubmit = () => {
    if (selectedWords.length === 0 || hasSubmitted) return;

    const isCorrect = validateWordBankAnswer(selectedWords, exercise.answer);
    onAnswerSubmit([...selectedWords], isCorrect);
    setHasSubmitted(true);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    word: string,
    fromSelected = false
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleWordClick(word, fromSelected);
    }
  };

  const clearSelection = () => {
    if (disabled || hasSubmitted) return;

    setAvailableWords([...exercise.bank]);
    setSelectedWords([]);
  };

  return (
    <div className="exercise word-bank">
      <div className="exercise-header">
        <h2 className="exercise-prompt">{exercise.prompt_en}</h2>
        <p className="exercise-instruction">
          {t('exercises.wordBank.instruction')}
        </p>
      </div>

      <div className="exercise-content">
        <div className="answer-area">
          <div
            className={`selected-words ${selectedWords.length === 0 ? 'empty' : ''}`}
            aria-label="Selected words for answer"
            role="region"
          >
            {selectedWords.length === 0 ? (
              <span className="placeholder-text">
                Tap words below to build your answer
              </span>
            ) : (
              selectedWords.map((word, index) => (
                <button
                  key={`selected-${index}`}
                  className="word-chip selected"
                  onClick={() => handleWordClick(word, true)}
                  onKeyDown={(e) => handleKeyDown(e, word, true)}
                  disabled={disabled || hasSubmitted}
                  aria-label={`Remove "${word}" from answer`}
                >
                  {word}
                  <span className="remove-icon" aria-hidden="true">
                    ×
                  </span>
                </button>
              ))
            )}
          </div>

          {selectedWords.length > 0 && !hasSubmitted && (
            <button
              onClick={clearSelection}
              className="clear-button"
              disabled={disabled}
              aria-label="Clear all selected words"
            >
              Clear
            </button>
          )}
        </div>

        <div className="word-bank-area">
          <div
            className="available-words"
            role="region"
            aria-label="Available words to choose from"
          >
            {availableWords.map((word, index) => (
              <button
                key={`available-${word}-${index}`}
                className="word-chip available"
                onClick={() => handleWordClick(word, false)}
                onKeyDown={(e) => handleKeyDown(e, word, false)}
                disabled={disabled || hasSubmitted}
                aria-label={`Add "${word}" to answer`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div className="exercise-actions">
          <button
            onClick={handleSubmit}
            disabled={selectedWords.length === 0 || hasSubmitted || disabled}
            className="submit-button"
            aria-describedby="submit-help"
          >
            {t('lesson.exercise.checkAnswer')}
          </button>

          <div id="submit-help" className="sr-only">
            {selectedWords.length > 0
              ? `Your answer: "${selectedWords.join(' ')}". Press to submit.`
              : 'Select words to build your answer'}
          </div>
        </div>

        {hasSubmitted && (
          <div className="answer-feedback">
            <div className="correct-answer">
              <h4>Correct answer:</h4>
              <p className="expected-answer">"{exercise.answer.join(' ')}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WordBank;
