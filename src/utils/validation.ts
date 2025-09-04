/**
 * Normalizes text for comparison by handling case, whitespace, and basic accent removal
 */
export function normalizeText(
  text: string,
  options: {
    caseInsensitive?: boolean;
    trim?: boolean;
    removeAccents?: boolean;
  } = {}
): string {
  let normalized = String(text || '');

  if (options.trim !== false) {
    normalized = normalized.trim();
  }

  if (options.caseInsensitive !== false) {
    normalized = normalized.toLowerCase();
  }

  if (options.removeAccents) {
    // Remove common accents and diacritics
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Replace multiple whitespace with single space
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}

/**
 * Validates a user's text answer against expected answers
 */
export function validateTextAnswer(
  userAnswer: string,
  correctAnswers: string[],
  tolerance: { caseInsensitive: boolean; trim: boolean } = {
    caseInsensitive: true,
    trim: true,
  }
): boolean {
  const normalizedUserAnswer = normalizeText(userAnswer, {
    caseInsensitive: tolerance.caseInsensitive,
    trim: tolerance.trim,
    removeAccents: true,
  });

  return correctAnswers.some(
    (answer) =>
      normalizeText(answer, {
        caseInsensitive: tolerance.caseInsensitive,
        trim: tolerance.trim,
        removeAccents: true,
      }) === normalizedUserAnswer
  );
}

/**
 * Validates word bank answers by checking if the sequence matches
 */
export function validateWordBankAnswer(
  userAnswer: string[],
  correctAnswer: string[]
): boolean {
  if (userAnswer.length !== correctAnswer.length) {
    return false;
  }

  return userAnswer.every(
    (word, index) => normalizeText(word) === normalizeText(correctAnswer[index])
  );
}

/**
 * Validates match pairs by ensuring all pairs are correctly matched
 */
export function validateMatchPairs(
  userMatches: Array<{ left: string; right: string }>,
  correctPairs: Array<{ left: string; right: string }>
): boolean {
  if (userMatches.length !== correctPairs.length) {
    return false;
  }

  return userMatches.every((userMatch) =>
    correctPairs.some(
      (correctPair) =>
        normalizeText(userMatch.left) === normalizeText(correctPair.left) &&
        normalizeText(userMatch.right) === normalizeText(correctPair.right)
    )
  );
}

/**
 * Validates multiple choice answer
 */
export function validateMultipleChoice(
  userAnswer: string,
  correctAnswer: string
): boolean {
  return normalizeText(userAnswer) === normalizeText(correctAnswer);
}

/**
 * Calculates similarity between two strings (for partial credit or hints)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
