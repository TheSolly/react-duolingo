# React Duolingo Clone

A modern, responsive language learning web application inspired by Duolingo, built with React 18, TypeScript, and Vite.

## 🚀 Features

### Core Functionality
- **5 Interactive Exercise Types**:
  - Multiple Choice: Select the correct answer from options
  - Type Answer: Type the correct translation or answer
  - Word Bank: Assemble sentences from provided word chips
  - Match Pairs: Connect related items or translations
  - Listening Prompt: Audio exercises with text fallback
  
- **Progress Tracking System**:
  - Hearts system (3 hearts, lose 1 on wrong answers)
  - Streak counter for consecutive correct answers
  - XP (Experience Points) system with rewards
  - Real-time progress bar during lessons

- **Persistent State Management**:
  - localStorage integration for lesson progress
  - Automatic save/restore of user progress
  - Error recovery and state validation

### User Experience
- **Responsive Design**: Mobile-first approach supporting 360px+ screens
- **Internationalization**: English and Spanish language support
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Smooth Animations**: CSS transitions and micro-interactions
- **Error Handling**: Comprehensive error boundaries and validation

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **State Management**: Context API with useReducer pattern
- **Styling**: CSS3 with custom properties and responsive design
- **Internationalization**: react-i18next for multi-language support
- **Testing**: Jest + React Testing Library + Cypress E2E
- **Code Quality**: ESLint + Prettier with TypeScript strict mode

## 📦 Project Structure

```
src/
├── components/           # React components
│   ├── exercises/       # Exercise type components
│   │   ├── MultipleChoice.tsx
│   │   ├── TypeAnswer.tsx
│   │   ├── WordBank.tsx
│   │   ├── MatchPairs.tsx
│   │   └── ListeningPrompt.tsx
│   ├── ExercisePlayer.tsx   # Main exercise orchestrator
│   ├── LessonStart.tsx      # Lesson preview screen
│   ├── CompletionScreen.tsx # Lesson completion celebration
│   ├── ProgressBar.tsx      # Progress visualization
│   ├── StreakHearts.tsx     # Hearts and streak display
│   ├── FeedbackBanner.tsx   # Immediate answer feedback
│   └── ErrorBoundary.tsx    # Error handling wrapper
├── contexts/            # React Context providers
│   ├── AppContext.tsx   # Global app state
│   └── LessonContext.tsx # Lesson-specific state
├── hooks/              # Custom React hooks
│   ├── useLessonState.ts # Lesson state management
│   └── useLocalStorage.ts # localStorage utilities
├── types/              # TypeScript type definitions
│   ├── lesson.types.ts  # Lesson and exercise types
│   └── index.ts        # Type exports
├── utils/              # Utility functions
│   ├── validation.ts   # Answer validation logic
│   ├── lessonLoader.ts # Lesson data loading
│   ├── storage.ts      # localStorage utilities
│   └── i18n.ts         # Internationalization setup
├── data/               # Static lesson data
│   └── lesson-basics-1.json
├── locales/            # Translation files
│   ├── en.json         # English translations
│   └── es.json         # Spanish translations
├── styles/             # CSS styles
│   └── globals.css     # Global styles and responsive design
└── test/               # Test configuration
    └── setup.ts        # Jest test setup
```

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TheSolly/react-duolingo.git
   cd react-duolingo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application running.

### Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build production-ready application
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Open Cypress for end-to-end testing
- `npm run test:e2e:headless` - Run E2E tests headlessly

## 🎯 How to Use

### Starting a Lesson
1. Launch the application in your browser
2. View the lesson overview with exercise count and types
3. Check your current hearts (3), streak count, and XP
4. Click "Start Lesson" to begin

### Exercise Types

**Multiple Choice**
- Read the prompt or question
- Select one answer from the provided options
- Submit your choice

**Type Answer**
- Read the prompt (e.g., translation request)
- Type your answer in the input field
- Answer validation includes case-insensitive matching and trimming

**Word Bank**
- Read the target sentence or phrase
- Click word chips in the correct order to build the answer
- Selected words appear in the answer area
- Click words in the answer area to remove them

**Match Pairs**
- Connect related items by clicking pairs
- Items highlight when selected
- Click matching pairs to connect them
- All pairs must be matched to complete

**Listening Prompt**
- Listen to audio pronunciation (when available)
- Type what you heard
- Fallback text provided when audio is unavailable

### Progress System
- **Hearts**: Start with 3 hearts, lose 1 for incorrect answers
- **Streak**: Consecutive correct answers increase your streak
- **XP**: Earn experience points for correct answers
- **Progress**: Visual progress bar shows lesson completion

### Lesson Completion
- Complete all 6 exercises to finish the lesson
- View your performance summary
- Celebrate with the completion animation
- Start a new lesson or retry the current one

## 🧪 Testing

The project includes comprehensive testing setup:

### Unit Tests (Jest + React Testing Library)
```bash
npm test                # Run all unit tests
npm run test:watch      # Watch mode for development
```

### End-to-End Tests (Cypress)
```bash
npm run test:e2e        # Open Cypress Test Runner
npm run test:e2e:headless  # Run E2E tests in CI mode
```

### Test Coverage
- Component rendering and user interactions
- State management and context providers
- Exercise validation logic
- localStorage persistence
- Error boundary handling
- Responsive design across device sizes

## 🔧 Configuration

### Environment Setup
The application works out of the box with sensible defaults. Key configurations:

- **Vite Config**: `vite.config.ts` - Build and dev server settings
- **TypeScript**: `tsconfig.json` - Strict type checking enabled
- **ESLint**: `.eslintrc.cjs` - Code quality rules
- **Jest**: `jest.config.js` - Testing framework configuration

### Customization Options
- **Lesson Data**: Add new lessons in `src/data/`
- **Translations**: Update `src/locales/` for new languages
- **Styling**: Modify CSS custom properties in `src/styles/globals.css`
- **Exercise Types**: Extend `src/types/lesson.types.ts` for new exercise formats

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Responsive**: Optimized for devices 360px and wider
- **Accessibility**: WCAG 2.1 AA compliance for screen readers and keyboard navigation

## 🚀 Performance

- **Bundle Size**: Optimized with Vite's tree shaking
- **Code Splitting**: Dynamic imports for optimal loading
- **Lazy Loading**: Components loaded as needed
- **Caching**: localStorage for persistent state management
- **Responsive Images**: Optimized for different screen densities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Run linting: `npm run lint`
6. Run tests: `npm test`
7. Commit changes: `git commit -m "Description"`
8. Push to branch: `git push origin feature-name`
9. Submit a pull request

### Development Guidelines
- Follow TypeScript strict mode requirements
- Maintain test coverage above 80%
- Use semantic commit messages
- Update documentation for new features
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Design inspiration from Duolingo's language learning platform
- React and TypeScript communities for excellent tooling
- Contributors to the open-source libraries used in this project

---

**Happy Learning!** 🎓 Start your language learning journey with this interactive React application.