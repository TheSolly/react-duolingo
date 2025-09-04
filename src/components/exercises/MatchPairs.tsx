import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MatchPairsExercise } from '../../types';
import { validateMatchPairs } from '../../utils/validation';

interface MatchPairsProps {
  exercise: MatchPairsExercise;
  onAnswerSubmit: (
    userAnswer: Array<{ left: string; right: string }>,
    isCorrect: boolean
  ) => void;
  disabled?: boolean;
}

interface PairItem {
  text: string;
  type: 'left' | 'right';
  originalIndex: number;
  isMatched: boolean;
  matchedWith?: string;
}

function MatchPairs({
  exercise,
  onAnswerSubmit,
  disabled = false,
}: MatchPairsProps) {
  const { t, i18n } = useTranslation();
  const [leftItems, setLeftItems] = useState<PairItem[]>([]);
  const [rightItems, setRightItems] = useState<PairItem[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string>('');
  const [selectedRight, setSelectedRight] = useState<string>('');
  const [matches, setMatches] = useState<
    Array<{ left: string; right: string }>
  >([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    // Shuffle and initialize items
    const shuffledLeftItems = exercise.pairs
      .map((pair, index) => ({
        text: pair.left,
        type: 'left' as const,
        originalIndex: index,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    const shuffledRightItems = exercise.pairs
      .map((pair, index) => ({
        text: pair.right,
        type: 'right' as const,
        originalIndex: index,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setLeftItems(shuffledLeftItems);
    setRightItems(shuffledRightItems);
    setSelectedLeft('');
    setSelectedRight('');
    setMatches([]);
    setHasSubmitted(false);
  }, [exercise.id, exercise.pairs]);

  const handleItemClick = (text: string, type: 'left' | 'right') => {
    if (disabled || hasSubmitted) return;

    const item =
      type === 'left'
        ? leftItems.find((item) => item.text === text)
        : rightItems.find((item) => item.text === text);

    if (item?.isMatched) return;

    if (type === 'left') {
      setSelectedLeft(selectedLeft === text ? '' : text);
      if (selectedRight && selectedLeft !== text) {
        createMatch(text, selectedRight);
      }
    } else {
      setSelectedRight(selectedRight === text ? '' : text);
      if (selectedLeft && selectedRight !== text) {
        createMatch(selectedLeft, text);
      }
    }
  };

  const createMatch = (leftText: string, rightText: string) => {
    const newMatch = { left: leftText, right: rightText };
    setMatches((prev) => [...prev, newMatch]);

    setLeftItems((prev) =>
      prev.map((item) =>
        item.text === leftText
          ? { ...item, isMatched: true, matchedWith: rightText }
          : item
      )
    );
    setRightItems((prev) =>
      prev.map((item) =>
        item.text === rightText
          ? { ...item, isMatched: true, matchedWith: leftText }
          : item
      )
    );

    setSelectedLeft('');
    setSelectedRight('');
  };

  const handleSubmit = () => {
    if (matches.length === 0 || hasSubmitted) return;

    const isCorrect = validateMatchPairs(matches, exercise.pairs);
    onAnswerSubmit([...matches], isCorrect);
    setHasSubmitted(true);
  };

  const clearMatches = () => {
    if (disabled || hasSubmitted) return;

    setLeftItems((prev) =>
      prev.map((item) => ({
        ...item,
        isMatched: false,
        matchedWith: undefined,
      }))
    );
    setRightItems((prev) =>
      prev.map((item) => ({
        ...item,
        isMatched: false,
        matchedWith: undefined,
      }))
    );
    setMatches([]);
    setSelectedLeft('');
    setSelectedRight('');
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    text: string,
    type: 'left' | 'right'
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(text, type);
    }
  };

  const allMatched = matches.length === exercise.pairs.length;

  return (
    <div className="exercise match-pairs">
      <div className="exercise-header">
        <h2 className="exercise-prompt">
          {i18n.language === 'es' && exercise.prompt_es 
            ? exercise.prompt_es 
            : exercise.prompt_en}
        </h2>
        <p className="exercise-instruction">
          {t('exercises.matchPairs.instruction')}
        </p>
      </div>

      <div className="exercise-content">
        <div className="pairs-container">
          <div
            className="left-column"
            role="region"
            aria-label="Left side items to match"
          >
            <h3 className="column-title">English</h3>
            {leftItems.map((item, index) => (
              <button
                key={`left-${index}`}
                className={`pair-item left ${
                  item.isMatched
                    ? 'matched'
                    : selectedLeft === item.text
                      ? 'selected'
                      : ''
                }`}
                onClick={() => handleItemClick(item.text, 'left')}
                onKeyDown={(e) => handleKeyDown(e, item.text, 'left')}
                disabled={disabled || hasSubmitted || item.isMatched}
                aria-label={`${item.text}${item.isMatched ? `, matched with ${item.matchedWith}` : ''}`}
              >
                <span className="pair-text">{item.text}</span>
                {item.isMatched && (
                  <span className="match-indicator" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="connection-area">
            {matches.map((_, index) => (
              <div
                key={`connection-${index}`}
                className="connection-line"
                aria-hidden="true"
              >
                <div className="line"></div>
              </div>
            ))}
          </div>

          <div
            className="right-column"
            role="region"
            aria-label="Right side items to match"
          >
            <h3 className="column-title">Spanish</h3>
            {rightItems.map((item, index) => (
              <button
                key={`right-${index}`}
                className={`pair-item right ${
                  item.isMatched
                    ? 'matched'
                    : selectedRight === item.text
                      ? 'selected'
                      : ''
                }`}
                onClick={() => handleItemClick(item.text, 'right')}
                onKeyDown={(e) => handleKeyDown(e, item.text, 'right')}
                disabled={disabled || hasSubmitted || item.isMatched}
                aria-label={`${item.text}${item.isMatched ? `, matched with ${item.matchedWith}` : ''}`}
              >
                <span className="pair-text">{item.text}</span>
                {item.isMatched && (
                  <span className="match-indicator" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="match-status" aria-live="polite">
          <span className="matches-count">
            {matches.length} of {exercise.pairs.length} pairs matched
          </span>

          {matches.length > 0 && !hasSubmitted && (
            <button
              onClick={clearMatches}
              className="clear-button"
              disabled={disabled}
            >
              Clear All
            </button>
          )}
        </div>

        <div className="exercise-actions">
          <button
            onClick={handleSubmit}
            disabled={!allMatched || hasSubmitted || disabled}
            className="submit-button"
            aria-describedby="submit-help"
          >
            {t('lesson.exercise.checkAnswer')}
          </button>

          <div id="submit-help" className="sr-only">
            {allMatched
              ? `All ${exercise.pairs.length} pairs matched. Press to submit.`
              : `Match all ${exercise.pairs.length} pairs to continue`}
          </div>
        </div>

        {hasSubmitted && (
          <div className="answer-feedback">
            <div className="correct-matches">
              <h4>Correct matches:</h4>
              <ul className="matches-list">
                {exercise.pairs.map((pair, index) => (
                  <li key={index} className="correct-match">
                    <span className="left-item">{pair.left}</span>
                    <span className="match-connector">↔</span>
                    <span className="right-item">{pair.right}</span>
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

export default MatchPairs;
