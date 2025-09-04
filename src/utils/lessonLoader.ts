import {
  Lesson,
  MultipleChoiceExercise,
  TypeAnswerExercise,
  WordBankExercise,
  MatchPairsExercise,
  AudioExercise,
} from '../types';
import lessonData from '../data/lesson-basics-1.json';

/**
 * Test function to simulate various error conditions
 * Usage: Add ?error=malformed to URL to test
 */
function simulateError() {
  const urlParams = new URLSearchParams(window.location.search);
  const errorType = urlParams.get('error');
  
  switch (errorType) {
    case 'malformed':
      throw new Error('Lesson data is malformed or missing required fields. Please try refreshing the page.');
    case 'empty':
      throw new Error('This lesson appears to be empty. Please contact support if this problem persists.');
    case 'notfound':
      throw new Error('Lesson "advanced-1" not found. Please check the lesson ID and try again.');
    case 'network':
      throw new Error('Unable to load lesson data. Please check your internet connection and try again.');
  }
}

/**
 * Loads lesson data with comprehensive error handling
 */
export async function loadLesson(lessonId: string): Promise<Lesson> {
  try {
    // Check for simulated errors (for testing) - always run this first
    simulateError();
    
    // In a real app, this would be an API call
    // For now, we only have one lesson
    if (lessonId !== 'lesson-basics-1') {
      throw new Error(`Lesson "${lessonId}" not found. Please check the lesson ID and try again.`);
    }

    // Validate that lesson data exists
    if (!lessonData) {
      throw new Error('Lesson data is empty or corrupted. Please refresh the page or contact support.');
    }

    // Validate lesson data structure
    const lesson = lessonData as Lesson;

    if (
      !lesson.id ||
      !lesson.title ||
      !lesson.exercises ||
      !Array.isArray(lesson.exercises)
    ) {
      throw new Error('Lesson data is malformed or missing required fields. Please try refreshing the page.');
    }

    if (lesson.exercises.length === 0) {
      throw new Error('This lesson appears to be empty. Please contact support if this problem persists.');
    }

    // Validate each exercise
    lesson.exercises.forEach((exercise, index) => {
      if (!exercise.id || !exercise.type || !exercise.prompt_en) {
        throw new Error(`Exercise ${index + 1} is missing required data. Please try refreshing the page.`);
      }

      // Type-specific validation
      switch (exercise.type) {
        case 'multiple_choice': {
          const mcExercise = exercise as MultipleChoiceExercise;
          if (
            !mcExercise.choices ||
            !Array.isArray(mcExercise.choices) ||
            !mcExercise.answer
          ) {
            throw new Error(
              `Invalid multiple choice exercise at index ${index}`
            );
          }
          if (!mcExercise.choices.includes(mcExercise.answer)) {
            throw new Error(
              `Answer not found in choices for exercise at index ${index}`
            );
          }
          break;
        }

        case 'type_answer': {
          const taExercise = exercise as TypeAnswerExercise;
          if (!taExercise.answer || !Array.isArray(taExercise.answer)) {
            throw new Error(`Invalid type answer exercise at index ${index}`);
          }
          break;
        }

        case 'word_bank': {
          const wbExercise = exercise as WordBankExercise;
          if (
            !wbExercise.bank ||
            !Array.isArray(wbExercise.bank) ||
            !wbExercise.answer ||
            !Array.isArray(wbExercise.answer)
          ) {
            throw new Error(`Invalid word bank exercise at index ${index}`);
          }
          // Check that all answer words are in the bank
          const missingWords = wbExercise.answer.filter(
            (word: string) => !wbExercise.bank.includes(word)
          );
          if (missingWords.length > 0) {
            throw new Error(
              `Answer words not found in bank for exercise at index ${index}: ${missingWords.join(', ')}`
            );
          }
          break;
        }

        case 'match_pairs': {
          const mpExercise = exercise as MatchPairsExercise;
          if (!mpExercise.pairs || !Array.isArray(mpExercise.pairs)) {
            throw new Error(`Invalid match pairs exercise at index ${index}`);
          }
          mpExercise.pairs.forEach((pair, pairIndex: number) => {
            if (!pair.left || !pair.right) {
              throw new Error(
                `Invalid pair at index ${pairIndex} in exercise ${index}`
              );
            }
          });
          break;
        }

        case 'listening_prompt': {
          const lpExercise = exercise as AudioExercise;
          if (!lpExercise.answer) {
            throw new Error(
              `Invalid listening prompt exercise at index ${index}`
            );
          }
          break;
        }
      }
    });

    return lesson;
  } catch (error) {
    console.error('Failed to load lesson:', error);
    throw error;
  }
}

/**
 * Gets the estimated time for a lesson in minutes
 */
export function getEstimatedTime(lesson: Lesson): number {
  const baseTimePerExercise = 1; // 1 minute base time
  const typeMultipliers = {
    multiple_choice: 0.5,
    type_answer: 1,
    word_bank: 1.2,
    match_pairs: 1.5,
    listening_prompt: 1.3,
  };

  const totalTime = lesson.exercises.reduce((total, exercise) => {
    const multiplier = typeMultipliers[exercise.type] || 1;
    return total + baseTimePerExercise * multiplier;
  }, 0);

  return Math.ceil(totalTime);
}

/**
 * Gets all available lessons
 */
export async function getAvailableLessons(): Promise<
  Array<{ id: string; title: string; estimatedTime: number }>
> {
  try {
    // In a real app, this would fetch from an API
    const lesson = await loadLesson('lesson-basics-1');
    return [
      {
        id: lesson.id,
        title: lesson.title,
        estimatedTime: getEstimatedTime(lesson),
      },
    ];
  } catch (error) {
    console.error('Failed to get available lessons:', error);
    return [];
  }
}
