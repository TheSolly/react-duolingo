import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AppProvider } from './contexts/AppContext';
import { LessonProvider } from './contexts/LessonContext';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        language: 'en',
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider>
      <LessonProvider>
        {children}
      </LessonProvider>
    </AppProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };