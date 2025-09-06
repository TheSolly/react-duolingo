import { 
  validateMultipleChoice, 
  validateTextAnswer, 
  validateWordBankAnswer, 
  validateMatchPairs 
} from '../validation';

describe('validation utilities', () => {
  describe('validateMultipleChoice', () => {
    const exercise = {
      id: 'mc1',
      type: 'multiple_choice' as const,
      prompt_en: 'Test prompt',
      explanation_en: 'Test explanation',
      choices: ['Option A', 'Option B', 'Option C'],
      answer: 'Option B'
    };

    it('validates correct answer', () => {
      const result = validateMultipleChoice('Option B', 'Option B');
      expect(result).toBe(true);
    });

    it('validates incorrect answer', () => {
      const result = validateMultipleChoice('Option A', 'Option B');
      expect(result).toBe(false);
    });

    it('validates case sensitivity', () => {
      const result = validateMultipleChoice('option b', 'Option B');
      expect(result).toBe(false);
    });

    it('handles empty user answer', () => {
      const result = validateMultipleChoice('', 'Option B');
      expect(result).toBe(false);
    });

    it('handles whitespace in user answer', () => {
      const result = validateMultipleChoice(' Option B ', 'Option B');
      expect(result).toBe(true);
    });
  });

  describe('validateTypeAnswer', () => {
    const exercise = {
      id: 'ta1',
      type: 'type_answer' as const,
      prompt_en: 'Test prompt',
      explanation_en: 'Test explanation',
      answer: ['Hello', 'Hi', 'Hey'],
      tolerance: {
        caseInsensitive: true,
        trim: true
      }
    };

    it('validates correct answer exactly', () => {
      const result = validateTextAnswer('Hello', exercise.answer, exercise.tolerance);
      expect(result).toBe(true);
    });

    it('validates alternative correct answers', () => {
      expect(validateTextAnswer('Hi', exercise.answer, exercise.tolerance)).toBe(true);
      expect(validateTextAnswer('Hey', exercise.answer, exercise.tolerance)).toBe(true);
    });

    it('handles case insensitive matching when enabled', () => {
      const result = validateTextAnswer('hello', exercise.answer, exercise.tolerance);
      expect(result).toBe(true);
    });

    it('handles trimming when enabled', () => {
      const result = validateTextAnswer('  Hello  ', exercise.answer, exercise.tolerance);
      expect(result).toBe(true);
    });

    it('validates incorrect answer', () => {
      const result = validateTextAnswer('Goodbye', exercise.answer, exercise.tolerance);
      expect(result).toBe(false);
    });

    it('handles case sensitive mode', () => {
      const caseSensitiveExercise = {
        ...exercise,
        tolerance: { caseInsensitive: false, trim: true }
      };
      
      expect(validateTextAnswer('Hello', caseSensitiveExercise.answer, caseSensitiveExercise.tolerance)).toBe(true);
      expect(validateTextAnswer('hello', caseSensitiveExercise.answer, caseSensitiveExercise.tolerance)).toBe(false);
    });

    it('handles no trimming mode', () => {
      const noTrimExercise = {
        ...exercise,
        tolerance: { caseInsensitive: true, trim: false }
      };
      
      expect(validateTextAnswer('Hello', noTrimExercise.answer, noTrimExercise.tolerance)).toBe(true);
      expect(validateTextAnswer(' Hello ', noTrimExercise.answer, noTrimExercise.tolerance)).toBe(false);
    });

    it('handles empty user answer', () => {
      const result = validateTextAnswer('', exercise.answer, exercise.tolerance);
      expect(result).toBe(false);
    });

    it('handles exercise with single answer string', () => {
      const singleAnswerExercise = {
        ...exercise,
        answer: ['Hello']
      };
      
      expect(validateTextAnswer('Hello', singleAnswerExercise.answer, exercise.tolerance)).toBe(true);
      expect(validateTextAnswer('Hi', singleAnswerExercise.answer, exercise.tolerance)).toBe(false);
    });
  });

  describe('validateWordBank', () => {
    const exercise = {
      id: 'wb1',
      type: 'word_bank' as const,
      prompt_en: 'Test prompt',
      explanation_en: 'Test explanation',
      bank: ['The', 'cat', 'is', 'black', 'dog'],
      answer: ['The', 'cat', 'is', 'black']
    };

    it('validates correct answer in correct order', () => {
      const result = validateWordBankAnswer(['The', 'cat', 'is', 'black'], exercise.answer);
      expect(result).toBe(true);
    });

    it('validates incorrect answer with wrong order', () => {
      const result = validateWordBankAnswer(['cat', 'The', 'is', 'black'], exercise.answer);
      expect(result).toBe(false);
    });

    it('validates incorrect answer with wrong words', () => {
      const result = validateWordBankAnswer(['The', 'dog', 'is', 'black'], exercise.answer);
      expect(result).toBe(false);
    });

    it('validates incorrect answer with missing words', () => {
      const result = validateWordBankAnswer(['The', 'cat', 'is'], exercise.answer);
      expect(result).toBe(false);
    });

    it('validates incorrect answer with extra words', () => {
      const result = validateWordBankAnswer(['The', 'cat', 'is', 'black', 'dog'], exercise.answer);
      expect(result).toBe(false);
    });

    it('handles empty user answer', () => {
      const result = validateWordBankAnswer([], exercise.answer);
      expect(result).toBe(false);
    });

    it('is case sensitive for word matching', () => {
      const result = validateWordBankAnswer(['the', 'cat', 'is', 'black'], exercise.answer);
      expect(result).toBe(false);
    });
  });

  describe('validateMatchPairs', () => {
    const exercise = {
      id: 'mp1',
      type: 'match_pairs' as const,
      prompt_en: 'Test prompt',
      explanation_en: 'Test explanation',
      pairs: [
        { left: 'Hello', right: 'Hola' },
        { left: 'Goodbye', right: 'Adiós' },
        { left: 'Thank you', right: 'Gracias' }
      ]
    };

    it('validates all correct pairs', () => {
      const userAnswer = [
        { left: 'Hello', right: 'Hola' },
        { left: 'Goodbye', right: 'Adiós' },
        { left: 'Thank you', right: 'Gracias' }
      ];
      
      const result = validateMatchPairs(userAnswer, exercise.pairs);
      expect(result).toBe(true);
    });

    it('validates correct pairs in different order', () => {
      const userAnswer = [
        { left: 'Thank you', right: 'Gracias' },
        { left: 'Hello', right: 'Hola' },
        { left: 'Goodbye', right: 'Adiós' }
      ];
      
      const result = validateMatchPairs(userAnswer, exercise.pairs);
      expect(result).toBe(true);
    });

    it('validates incorrect pairs', () => {
      const userAnswer = [
        { left: 'Hello', right: 'Adiós' },
        { left: 'Goodbye', right: 'Hola' },
        { left: 'Thank you', right: 'Gracias' }
      ];
      
      const result = validateMatchPairs(userAnswer, exercise.pairs);
      expect(result).toBe(false);
    });

    it('validates incomplete pairs', () => {
      const userAnswer = [
        { left: 'Hello', right: 'Hola' },
        { left: 'Goodbye', right: 'Adiós' }
      ];
      
      const result = validateMatchPairs(userAnswer, exercise.pairs);
      expect(result).toBe(false);
    });

    it('validates too many pairs', () => {
      const userAnswer = [
        { left: 'Hello', right: 'Hola' },
        { left: 'Goodbye', right: 'Adiós' },
        { left: 'Thank you', right: 'Gracias' },
        { left: 'Extra', right: 'Pair' }
      ];
      
      const result = validateMatchPairs(userAnswer, exercise.pairs);
      expect(result).toBe(false);
    });

    it('handles empty user answer', () => {
      const result = validateMatchPairs([], exercise.pairs);
      expect(result).toBe(false);
    });

    it('is case sensitive for pair matching', () => {
      const userAnswer = [
        { left: 'hello', right: 'Hola' },
        { left: 'Goodbye', right: 'adiós' },
        { left: 'Thank you', right: 'Gracias' }
      ];
      
      const result = validateMatchPairs(userAnswer, exercise.pairs);
      expect(result).toBe(false);
    });

    it('validates pairs with exact string matching', () => {
      const userAnswer = [
        { left: 'Hello', right: 'Hola' },
        { left: 'Goodbye', right: 'Adiós' },
        { left: 'Thank you', right: 'Thank you' } // Wrong pairing
      ];
      
      const result = validateMatchPairs(userAnswer, exercise.pairs);
      expect(result).toBe(false);
    });
  });
});