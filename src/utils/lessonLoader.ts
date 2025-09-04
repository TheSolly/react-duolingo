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
 * Loads lesson data with error handling
 */
export async function loadLesson(lessonId: string): Promise<Lesson> {
  try {
    // In a real app, this would be an API call
    // For now, we only have one lesson
    if (lessonId !== 'lesson-basics-1') {
      throw new Error(`Lesson with id "${lessonId}" not found`);
    }

    // Validate lesson data structure
    const lesson = lessonData as Lesson;

    if (
      !lesson.id ||
      !lesson.title ||
      !lesson.exercises ||
      !Array.isArray(lesson.exercises)
    ) {
      throw new Error('Invalid lesson data structure');
    }

    if (lesson.exercises.length === 0) {
      throw new Error('Lesson must contain at least one exercise');
    }

    // Validate each exercise
    lesson.exercises.forEach((exercise, index) => {
      if (!exercise.id || !exercise.type || !exercise.prompt_en) {
        throw new Error(`Invalid exercise data at index ${index}`);
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
