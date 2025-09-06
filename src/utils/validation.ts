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
    normalized = normalized
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Additional Spanish-specific normalizations
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N');
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
    (word, index) =>
      normalizeText(word, { caseInsensitive: false, trim: true }) ===
      normalizeText(correctAnswer[index], {
        caseInsensitive: false,
        trim: true,
      })
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
        normalizeText(userMatch.left, {
          caseInsensitive: false,
          trim: true,
        }) ===
          normalizeText(correctPair.left, {
            caseInsensitive: false,
            trim: true,
          }) &&
        normalizeText(userMatch.right, {
          caseInsensitive: false,
          trim: true,
        }) ===
          normalizeText(correctPair.right, {
            caseInsensitive: false,
            trim: true,
          })
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
  return (
    normalizeText(userAnswer, { caseInsensitive: false, trim: true }) ===
    normalizeText(correctAnswer, { caseInsensitive: false, trim: true })
  );
}

/**
 * Gets helpful feedback for incorrect answers
 */
export function getValidationFeedback(
  userAnswer: string,
  correctAnswers: string[],
  tolerance?: { caseInsensitive: boolean; trim: boolean }
): { isClose: boolean; suggestion?: string; hint?: string } {
  const normalizedUserAnswer = normalizeText(userAnswer, {
    caseInsensitive: tolerance?.caseInsensitive ?? true,
    trim: tolerance?.trim ?? true,
    removeAccents: true,
  });

  // Check if it's just a case/whitespace/accent issue
  const exactMatch = correctAnswers.find(answer => {
    const normalizedAnswer = normalizeText(answer, {
      caseInsensitive: false,
      trim: false,
      removeAccents: false,
    });
    return normalizedAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
  });

  if (exactMatch && exactMatch !== userAnswer) {
    return {
      isClose: true,
      suggestion: exactMatch,
      hint: "Watch your capitalization and spacing!"
    };
  }

  // Check similarity to find close matches
  let closestAnswer = '';
  let highestSimilarity = 0;

  for (const answer of correctAnswers) {
    const similarity = calculateSimilarity(normalizedUserAnswer, normalizeText(answer, {
      caseInsensitive: tolerance?.caseInsensitive ?? true,
      trim: tolerance?.trim ?? true,
      removeAccents: true,
    }));
    
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      closestAnswer = answer;
    }
  }

  if (highestSimilarity > 0.7) {
    return {
      isClose: true,
      suggestion: closestAnswer,
      hint: "You're very close! Check your spelling."
    };
  }

  return { isClose: false };
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
