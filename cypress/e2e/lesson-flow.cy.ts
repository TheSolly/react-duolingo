describe('Complete Lesson Flow', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/');
    
    // Clear localStorage to start fresh each test
    cy.clearLocalStorage();
  });

  it('completes a full 6-exercise lesson journey', () => {
    // 1. Verify lesson start screen appears
    cy.contains('Basic Spanish Phrases').should('be.visible');
    cy.contains('6 exercises').should('be.visible');
    cy.contains('~3 mins').should('be.visible');
    
    // Check initial user stats
    cy.contains('3').should('be.visible'); // hearts
    cy.contains('0').should('be.visible'); // streak (initially 0)
    cy.contains('0').should('be.visible'); // XP (initially 0)
    
    // Check exercise type badges
    cy.get('.exercise-type-badge.multiple_choice').should('be.visible');
    cy.get('.exercise-type-badge.type_answer').should('be.visible');
    cy.get('.exercise-type-badge.word_bank').should('be.visible');
    cy.get('.exercise-type-badge.match_pairs').should('be.visible');
    
    // Start the lesson
    cy.contains('Start Lesson').click();
    
    // 2. Exercise 1: Multiple Choice - "Hello" = "Hola"
    cy.contains('What does "Hello" mean in Spanish?').should('be.visible');
    
    // Check progress bar shows 1/6
    cy.contains('Exercise 1 of 6').should('be.visible');
    
    // Select correct answer
    cy.contains('Hola').click();
    cy.contains('Check Answer').click();
    
    // Verify correct feedback
    cy.contains('Correct!').should('be.visible');
    cy.get('.feedback-banner.correct').should('be.visible');
    
    // Continue to next exercise
    cy.contains('Continue').click();
    
    // 3. Exercise 2: Type Answer - Type "Goodbye" in Spanish
    cy.contains('Type "Goodbye" in Spanish').should('be.visible');
    cy.contains('Exercise 2 of 6').should('be.visible');
    
    // Type correct answer
    cy.get('input[placeholder*="type"]').type('Adiós');
    cy.contains('Check Answer').click();
    
    // Verify correct feedback and continue
    cy.contains('Correct!').should('be.visible');
    cy.contains('Continue').click();
    
    // 4. Exercise 3: Word Bank - "The cat is black"
    cy.contains('Construct the sentence').should('be.visible');
    cy.contains('Exercise 3 of 6').should('be.visible');
    
    // Click words in correct order
    cy.contains('.word-chip', 'The').click();
    cy.contains('.word-chip', 'cat').click();
    cy.contains('.word-chip', 'is').click();
    cy.contains('.word-chip', 'black').click();
    
    cy.contains('Check Answer').click();
    cy.contains('Correct!').should('be.visible');
    cy.contains('Continue').click();
    
    // 5. Exercise 4: Multiple Choice - "Thank you" = "Gracias"
    cy.contains('What does "Thank you" mean in Spanish?').should('be.visible');
    cy.contains('Exercise 4 of 6').should('be.visible');
    
    cy.contains('Gracias').click();
    cy.contains('Check Answer').click();
    cy.contains('Correct!').should('be.visible');
    cy.contains('Continue').click();
    
    // 6. Exercise 5: Match Pairs
    cy.contains('Match the pairs').should('be.visible');
    cy.contains('Exercise 5 of 6').should('be.visible');
    
    // Click pairs to match them
    cy.contains('.pair-left', 'Cat').click();
    cy.contains('.pair-right', 'Gato').click();
    
    cy.contains('.pair-left', 'Dog').click();
    cy.contains('.pair-right', 'Perro').click();
    
    cy.contains('.pair-left', 'Water').click();
    cy.contains('.pair-right', 'Agua').click();
    
    cy.contains('Check Answer').click();
    cy.contains('Correct!').should('be.visible');
    cy.contains('Continue').click();
    
    // 7. Exercise 6: Type Answer - Final exercise
    cy.contains('Type "Water" in Spanish').should('be.visible');
    cy.contains('Exercise 6 of 6').should('be.visible');
    
    cy.get('input[placeholder*="type"]').type('Agua');
    cy.contains('Check Answer').click();
    cy.contains('Correct!').should('be.visible');
    cy.contains('Continue').click();
    
    // 8. Verify lesson completion screen
    cy.contains('Lesson Complete!').should('be.visible');
    cy.contains('🎉').should('be.visible'); // Celebration emoji
    
    // Check final stats
    cy.contains('60 XP').should('be.visible'); // 6 exercises * 10 XP each
    cy.contains('Streak: 6').should('be.visible'); // All correct
    cy.contains('Hearts: 3').should('be.visible'); // No mistakes
    
    // Performance summary
    cy.contains('Perfect Score!').should('be.visible');
    cy.contains('6/6 correct').should('be.visible');
    
    // Check for restart option
    cy.contains('Start New Lesson').should('be.visible');
  });

  it('handles incorrect answers and heart loss', () => {
    // Start lesson
    cy.visit('/');
    cy.contains('Start Lesson').click();
    
    // Exercise 1: Select wrong answer
    cy.contains('What does "Hello" mean in Spanish?').should('be.visible');
    cy.contains('Adiós').click(); // Wrong answer
    cy.contains('Check Answer').click();
    
    // Verify incorrect feedback
    cy.contains('Incorrect').should('be.visible');
    cy.get('.feedback-banner.incorrect').should('be.visible');
    
    // Check heart loss
    cy.contains('Hearts: 2').should('be.visible'); // Lost 1 heart
    
    // Continue after wrong answer
    cy.contains('Continue').click();
    
    // Verify we can still progress
    cy.contains('Exercise 2 of 6').should('be.visible');
  });

  it('shows lesson progress persistence', () => {
    // Start lesson and complete first exercise
    cy.visit('/');
    cy.contains('Start Lesson').click();
    
    // Complete first exercise
    cy.contains('Hola').click();
    cy.contains('Check Answer').click();
    cy.contains('Continue').click();
    
    // Verify we're on second exercise
    cy.contains('Exercise 2 of 6').should('be.visible');
    
    // Refresh the page
    cy.reload();
    
    // Should resume from where we left off
    cy.contains('Exercise 2 of 6').should('be.visible');
    cy.contains('Type "Goodbye" in Spanish').should('be.visible');
  });

  it('handles lesson restart functionality', () => {
    // Complete the entire lesson first
    cy.visit('/');
    cy.contains('Start Lesson').click();
    
    // Quickly complete all exercises (simplified)
    for (let i = 1; i <= 6; i++) {
      // Skip detailed interactions, just verify progress
      cy.contains(`Exercise ${i} of 6`).should('be.visible');
      
      // Handle different exercise types
      if (i === 1 || i === 4) {
        // Multiple choice
        cy.get('input[type="radio"]').first().click();
      } else if (i === 2 || i === 6) {
        // Type answer
        cy.get('input[placeholder*="type"]').type('test');
      } else if (i === 3) {
        // Word bank
        cy.get('.word-chip').first().click();
        cy.get('.word-chip').eq(1).click();
        cy.get('.word-chip').eq(2).click();
        cy.get('.word-chip').eq(3).click();
      } else if (i === 5) {
        // Match pairs
        cy.get('.pair-left').first().click();
        cy.get('.pair-right').first().click();
        cy.get('.pair-left').eq(1).click();
        cy.get('.pair-right').eq(1).click();
        cy.get('.pair-left').eq(2).click();
        cy.get('.pair-right').eq(2).click();
      }
      
      cy.contains('Check Answer').click();
      
      if (i < 6) {
        cy.contains('Continue').click();
      }
    }
    
    // Should reach completion screen
    cy.contains('Lesson Complete!').should('be.visible');
    
    // Click restart
    cy.contains('Start New Lesson').click();
    
    // Should return to lesson start
    cy.contains('Basic Spanish Phrases').should('be.visible');
    cy.contains('Start Lesson').should('be.visible');
  });

  it('maintains responsive design on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport(375, 667); // iPhone SE size
    
    cy.visit('/');
    
    // Check that lesson start is properly displayed on mobile
    cy.contains('Basic Spanish Phrases').should('be.visible');
    cy.get('.lesson-start').should('be.visible');
    
    // Start lesson
    cy.contains('Start Lesson').click();
    
    // Check exercise layout on mobile
    cy.get('.exercise-container').should('be.visible');
    cy.get('.progress-bar').should('be.visible');
    cy.get('.streak-hearts').should('be.visible');
    
    // Verify mobile-friendly interactions work
    cy.contains('Hola').click();
    cy.contains('Check Answer').should('be.visible').click();
  });

  it('provides proper accessibility features', () => {
    cy.visit('/');
    
    // Check for proper ARIA labels and roles
    cy.get('[role="progressbar"]').should('exist');
    cy.get('[aria-live="polite"]').should('exist');
    
    // Start lesson
    cy.contains('Start Lesson').click();
    
    // Check exercise accessibility
    cy.get('[role="radiogroup"]').should('exist'); // Multiple choice
    cy.get('input[aria-describedby]').should('exist');
    
    // Test keyboard navigation
    cy.get('body').tab(); // Should focus first interactive element
    cy.focused().should('be.visible');
  });

  it('handles error states gracefully', () => {
    // Test with intentionally broken localStorage
    cy.window().then((win) => {
      // Mock localStorage to throw errors
      cy.stub(win.localStorage, 'setItem').throws('QuotaExceededError');
    });
    
    cy.visit('/');
    
    // Should still work despite localStorage errors
    cy.contains('Basic Spanish Phrases').should('be.visible');
    cy.contains('Start Lesson').click();
    
    // Should be able to proceed with exercises
    cy.contains('Exercise 1 of 6').should('be.visible');
  });
});