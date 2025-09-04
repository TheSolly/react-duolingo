import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AudioExercise } from '../../types';
import { validateTextAnswer } from '../../utils/validation';

interface ListeningPromptProps {
  exercise: AudioExercise;
  onAnswerSubmit: (userAnswer: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

function ListeningPrompt({
  exercise,
  onAnswerSubmit,
  disabled = false,
}: ListeningPromptProps) {
  const { t } = useTranslation();
  const [userInput, setUserInput] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setUserInput('');
    setHasSubmitted(false);
    setIsPlaying(false);
    setAudioError(false);

    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [exercise.id, disabled]);

  const handleSubmit = () => {
    if (!userInput.trim() || hasSubmitted) return;

    const isCorrect = validateTextAnswer(userInput, [exercise.answer], {
      caseInsensitive: true,
      trim: true,
    });
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

  const playAudio = () => {
    if (!exercise.audio_url || audioError || isPlaying) return;

    if (audioRef.current) {
      setIsPlaying(true);
      audioRef.current.play().catch(() => {
        setAudioError(true);
        setIsPlaying(false);
      });
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setAudioError(true);
    setIsPlaying(false);
  };

  // Determine if we should show audio controls or fallback
  const hasAudio = exercise.audio_url && !audioError;
  const showFallback = !exercise.audio_url || audioError;

  return (
    <div className="exercise listening-prompt">
      <div className="exercise-header">
        <h2 className="exercise-prompt">{exercise.prompt_en}</h2>
        <p className="exercise-instruction">
          {t('exercises.listeningPrompt.instruction')}
        </p>
      </div>

      <div className="exercise-content">
        {/* Audio Controls or Fallback */}
        <div className="audio-section">
          {hasAudio && (
            <>
              <audio
                ref={audioRef}
                src={exercise.audio_url}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
                preload="metadata"
              />

              <div className="audio-controls">
                <button
                  onClick={playAudio}
                  disabled={disabled || hasSubmitted || isPlaying}
                  className={`play-button ${isPlaying ? 'playing' : ''}`}
                  aria-label={
                    isPlaying
                      ? 'Audio playing'
                      : t('exercises.listeningPrompt.playAudio')
                  }
                >
                  <span className="play-icon" aria-hidden="true">
                    {isPlaying ? '⏸️' : '🔊'}
                  </span>
                  <span className="play-text">
                    {isPlaying
                      ? 'Playing...'
                      : t('exercises.listeningPrompt.playAudio')}
                  </span>
                </button>

                <div className="audio-hint">
                  <span className="hint-text">Click to play the audio</span>
                </div>
              </div>
            </>
          )}

          {showFallback && (
            <div className="audio-fallback" role="alert">
              <div className="fallback-content">
                <div className="fallback-icon" aria-hidden="true">
                  🎧🚫
                </div>
                <div className="fallback-text">
                  <h3>{t('exercises.listeningPrompt.audioNotAvailable')}</h3>
                  <p>For this exercise, imagine you heard:</p>
                </div>
              </div>

              <div className="fallback-prompt">
                <blockquote className="audio-text">
                  "{exercise.fallback_text || exercise.answer}"
                </blockquote>
                <p className="fallback-instruction">
                  Type what you would have heard above
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Answer Input */}
        <div className="input-container">
          <label htmlFor={`input-${exercise.id}`} className="sr-only">
            {t('exercises.listeningPrompt.instruction')}
          </label>

          <input
            ref={inputRef}
            id={`input-${exercise.id}`}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type what you hear..."
            disabled={disabled || hasSubmitted}
            className={`answer-input ${disabled ? 'disabled' : ''}`}
            autoComplete="off"
            spellCheck="false"
            aria-describedby={`input-help-${exercise.id}`}
          />

          <div id={`input-help-${exercise.id}`} className="input-help">
            <span className="character-count">{userInput.length}/100</span>
            <span className="tolerance-hint">
              Case insensitive • Spaces ignored
            </span>
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
              : showFallback
                ? 'Type what you would have heard to continue'
                : 'Play the audio and type what you hear'}
          </div>
        </div>

        {hasSubmitted && (
          <div className="answer-feedback">
            <div className="correct-answer">
              <h4>Correct answer:</h4>
              <p className="expected-answer">"{exercise.answer}"</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListeningPrompt;
