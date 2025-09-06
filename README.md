# React Duolingo Clone

A responsive language learning web application built with React 18, TypeScript, and Vite.

## ✨ Features

- **5 Exercise Types**: Multiple Choice, Type Answer, Word Bank, Match Pairs, Listening Prompt
- **Progress System**: Hearts (3), streak counter, XP rewards, progress tracking
- **Persistence**: Auto-save lesson progress with localStorage
- **Responsive**: Mobile-first design (360px+), English/Spanish i18n
- **Accessible**: ARIA compliant, keyboard navigation, screen readers

## 🛠️ Tech Stack

React 18 • TypeScript • Vite • Context API • CSS3 • react-i18next • Jest • Cypress

## 🗂️ Structure

```
src/
├── components/exercises/    # 5 exercise types + player
├── contexts/               # App & lesson state management
├── hooks/                  # Custom hooks (localStorage, state)
├── utils/                  # Validation, i18n, lesson loading
├── data/                   # JSON lesson files
├── locales/               # English/Spanish translations
└── styles/                # CSS with responsive design
```

## 🚦 Quick Start

```bash
npm install
npm run dev          # Start dev server
npm test             # Run unit tests
npm run test:e2e     # Run E2E tests
```

Open `http://localhost:5173` to view the app.

## 🎮 How It Works

1. **Start**: View lesson overview → Click "Start Lesson"
2. **Practice**: Complete 6 exercises across different types
3. **Progress**: Track hearts (3), streak, XP, and progress bar
4. **Complete**: View performance summary with celebration animation
5. **Persist**: Progress auto-saves, resume on refresh

## 🧪 Testing

**Unit Tests**: Jest + React Testing Library for components and validation  
**E2E Tests**: Cypress for full lesson flow, accessibility, and responsive design  
**Coverage**: State management, localStorage persistence, error handling

## ⚙️ Key Decisions

- **Context + useReducer** for predictable state management
- **localStorage** for automatic progress persistence
- **CSS custom properties** for consistent, responsive design
- **TypeScript strict mode** for type safety
- **Component composition** for reusable, testable code

---

Built using React 18, TypeScript, and Vite
