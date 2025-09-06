/// <reference types="cypress" />

describe('Complete Lesson Flow', () => {
  beforeEach(() => {
    // Clear localStorage first to ensure clean state
    cy.clearLocalStorage();

    // Visit the application
    cy.visit('/');

    // Wait for the app to finish loading and display lesson content
    cy.get('.app-loading', { timeout: 10000 }).should('not.exist');
  });

  it('completes full 6-exercise flow: wrong once → lose heart → finish → see XP & streak', () => {
    // 1. Verify lesson start screen appears
    cy.contains('Basics 1 — Greetings').should('be.visible');
    cy.contains('6 exercises').should('be.visible');
    cy.contains('3 min').should('be.visible');

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
    cy.contains('Select the translation for: Hello').should('be.visible');

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

    // 3. Exercise 2: Type Answer - Type "Thank you" in Spanish
    cy.contains('Type the translation for: Thank you').should('be.visible');
    cy.contains('Exercise 2 of 6').should('be.visible');

    // Type correct answer
    cy.get('input[placeholder*="Type your answer here"]').type('gracias');
    cy.contains('Check Answer').click();

    // Verify correct feedback and continue
    cy.contains('Correct!').should('be.visible');
    cy.contains('Continue').click();

    // 4. Exercise 3: Word Bank - "See you later" - MAKE A MISTAKE HERE
    cy.contains('Build: See you later').should('be.visible');
    cy.contains('Exercise 3 of 6').should('be.visible');

    // Click words in WRONG order to lose a heart
    cy.contains('.word-chip', 'luego').click();
    cy.contains('.word-chip', 'hasta').click(); // This is the wrong order

    cy.contains('Check Answer').click();
    cy.contains('Incorrect').should('be.visible');
    cy.get('.feedback-banner.incorrect').should('be.visible');

    // Verify heart loss - check visual hearts (should have 2 ❤️ and 1 🤍)
    cy.get('.hearts-container .heart.filled').should('have.length', 2);
    cy.get('.hearts-container .heart.empty').should('have.length', 1);
    cy.contains('Continue').click();

    // 5. Exercise 4: Match Pairs
    cy.contains('Match pairs').should('be.visible');
    cy.contains('Exercise 4 of 6').should('be.visible');

    // Match the pairs
    cy.contains('.pair-item.left', 'Hello').click();
    cy.contains('.pair-item.right', 'Hola').click();

    cy.contains('.pair-item.left', 'Goodbye').click();
    cy.contains('.pair-item.right', 'Adiós').click();
    cy.contains('Check Answer').click();
    cy.contains('Correct!').should('be.visible');
    cy.contains('Continue').click();

    // 6. Exercise 5: Multiple Choice - "Goodbye" = "Adiós"
    cy.contains('Select the translation for: Goodbye').should('be.visible');
    cy.contains('Exercise 5 of 6').should('be.visible');

    cy.contains('Adiós').click();
    cy.contains('Check Answer').click();
    cy.contains('Correct!').should('be.visible');
    cy.contains('Continue').click();

    // 7. Exercise 6: Type Answer - Final exercise - "Please"
    cy.contains('Type the translation for: Please').should('be.visible');
    cy.contains('Exercise 6 of 6').should('be.visible');

    cy.get('input[placeholder*="Type your answer here"]').type('por favor');
    cy.contains('Check Answer').click();
    cy.contains('Correct!').should('be.visible');
    cy.contains('Continue').click();

    // 8. Verify lesson completion screen
    cy.contains('Lesson Complete!').should('be.visible');
    cy.contains('🎉').should('be.visible'); // Celebration emoji

    // Check final stats (5 correct out of 6, one wrong answer)
    cy.contains('+50').should('be.visible'); // XP is displayed as +{xp}
    cy.contains('5').should('be.visible'); // 5 correct answers in streak display

    // Performance summary
    cy.contains('Congratulations!').should('be.visible');
    cy.contains('5/6').should('be.visible');

    // Check for restart option
    cy.contains('Restart Lesson').should('be.visible');
  });

  it('handles incorrect answers and heart loss', () => {
    // Start lesson
    cy.visit('/');
    cy.contains('Start Lesson').click();

    // Exercise 1: Select wrong answer
    cy.contains('Select the translation for: Hello').should('be.visible');
    cy.contains('Adiós').click(); // Wrong answer
    cy.contains('Check Answer').click();

    // Verify incorrect feedback
    cy.contains('Incorrect').should('be.visible');
    cy.get('.feedback-banner.incorrect').should('be.visible');

    // Check heart loss
    cy.get('.hearts-container .heart.filled').should('have.length', 2); // Lost 1 heart

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
    cy.contains('Type the translation for: Thank you').should('be.visible');
  });

  it('handles lesson restart functionality', () => {
    // Start by testing the restart functionality during the lesson
    cy.visit('/');
    cy.get('.app-loading', { timeout: 10000 }).should('not.exist');
    cy.contains('Start Lesson').click();

    // Complete first exercise
    cy.contains('Exercise 1 of 6').should('be.visible');
    cy.contains('Hola').click();
    cy.contains('Check Answer').click();
    cy.contains('Continue').click();

    // Verify we're in the lesson
    cy.contains('Exercise 2 of 6').should('be.visible');

    // Clear localStorage to simulate fresh restart
    cy.clearLocalStorage();
    cy.visit('/');
    cy.get('.app-loading', { timeout: 10000 }).should('not.exist');

    // Should be able to start fresh lesson
    cy.contains('Basics 1 — Greetings').should('be.visible');
    cy.contains('Start Lesson').should('be.visible');
    
    // Verify lesson can be restarted
    cy.contains('Start Lesson').click();
    cy.contains('Exercise 1 of 6').should('be.visible');
  });

  it('maintains responsive design on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport(375, 667); // iPhone SE size

    cy.visit('/');

    // Wait for loading to complete
    cy.get('.app-loading', { timeout: 10000 }).should('not.exist');

    // Check that lesson start is properly displayed on mobile
    cy.contains('Basics 1 — Greetings').should('be.visible');
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

  it('maintains responsive design at 360px without overflow', () => {
    // Set 360px viewport as required
    cy.viewport(360, 640);

    cy.visit('/');
    cy.get('.app-loading', { timeout: 10000 }).should('not.exist');

    // Check that no horizontal overflow occurs - body should not have horizontal scroll
    cy.get('body').should(($el) => {
      const overflowX = $el.css('overflow-x');
      expect(overflowX).to.not.equal('scroll');
    });

    cy.get('html').should(($el) => {
      const overflowX = $el.css('overflow-x');
      expect(overflowX).to.not.equal('scroll');
    });

    // Check that lesson content fits within viewport
    cy.contains('Basics 1 — Greetings').should('be.visible');
    cy.contains('Start Lesson').should('be.visible');

    // Start lesson and check exercise fits
    cy.contains('Start Lesson').click();
    cy.get('.exercise-container').should('be.visible');

    // Verify exercise elements are within viewport bounds
    cy.get('.exercise-container').then(($el) => {
      expect($el[0].scrollWidth).to.be.lte(360);
    });
  });

  it('provides proper accessibility features', () => {
    cy.visit('/');
    cy.get('.app-loading', { timeout: 10000 }).should('not.exist');

    // Check for discernible button names on lesson start
    cy.get('button')
      .contains('Start Lesson')
      .should('be.visible')
      .should('have.text', 'Start Lesson'); // Discernible name

    // Start lesson
    cy.contains('Start Lesson').click();

    // Check for proper ARIA labels and roles after lesson starts
    cy.get('[role="progressbar"]').should('exist');
    cy.get('[aria-live="polite"]').should('exist');

    // Check exercise accessibility
    cy.get('fieldset.choices-container').should('exist'); // Multiple choice fieldset acts as radiogroup
    cy.get('input[aria-describedby]').should('exist');

    // Test keyboard interactions on form elements first
    cy.get('input[type="radio"]').first().focus().should('be.focused');
    
    // Select an answer to enable the Check Answer button
    cy.contains('Hola').click();
    
    // Check for discernible button names in exercise
    cy.contains('Check Answer')
      .should('be.visible')
      .and('contain.text', 'Check Answer'); // Discernible name

    // Test that buttons are keyboard accessible (now that button is enabled)
    cy.get('button').contains('Check Answer').should('not.be.disabled').focus().should('be.focused');
  });

  it('handles error states gracefully', () => {
    // Test with intentionally broken localStorage
    cy.window().then((win) => {
      // Mock localStorage to throw errors
      cy.stub(win.localStorage, 'setItem').throws('QuotaExceededError');
    });

    cy.visit('/');
    cy.get('.app-loading', { timeout: 10000 }).should('not.exist');

    // Should still work despite localStorage errors
    cy.contains('Basics 1 — Greetings').should('be.visible');
    cy.contains('Start Lesson').click();

    // Should be able to proceed with exercises
    cy.contains('Exercise 1 of 6').should('be.visible');
  });
});
