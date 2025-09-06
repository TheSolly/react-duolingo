import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
} as Storage;

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock addEventListener/removeEventListener for storage events
const mockEventListeners: { [key: string]: EventListener[] } = {};
Object.defineProperty(window, 'addEventListener', {
  value: jest.fn((event: string, cb: EventListener) => {
    if (!mockEventListeners[event]) {
      mockEventListeners[event] = [];
    }
    mockEventListeners[event].push(cb);
  })
});

Object.defineProperty(window, 'removeEventListener', {
  value: jest.fn((event: string, cb: EventListener) => {
    if (mockEventListeners[event]) {
      const index = mockEventListeners[event].indexOf(cb);
      if (index > -1) {
        mockEventListeners[event].splice(index, 1);
      }
    }
  })
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockEventListeners).forEach(key => {
      delete mockEventListeners[key];
    });
  });

  it('returns initial value when localStorage is empty', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    expect(result.current[0]).toBe('initial');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
  });

  it('returns parsed value from localStorage', () => {
    const testValue = { name: 'John', age: 30 };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testValue));
    
    const { result } = renderHook(() => useLocalStorage('user-data', null));
    
    expect(result.current[0]).toEqual(testValue);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user-data');
  });

  it('saves value to localStorage when updated', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    
    act(() => {
      result.current[1](5);
    });
    
    expect(result.current[0]).toBe(5);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('counter', JSON.stringify(5));
  });

  it('supports function-based updates', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(10));
    
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    
    act(() => {
      result.current[1](prev => prev + 5);
    });
    
    expect(result.current[0]).toBe(15);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('counter', JSON.stringify(15));
  });

  it('handles localStorage read errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('error-key', 'fallback'));
    
    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "error-key":',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('handles localStorage write errors gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage write failed');
    });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('error-key', 'initial'));
    
    act(() => {
      result.current[1]('new value');
    });
    
    expect(result.current[0]).toBe('new value'); // State is still updated
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error setting localStorage key "error-key":',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('handles malformed JSON in localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid json {');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('malformed', 'default'));
    
    expect(result.current[0]).toBe('default');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "malformed":',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('listens for storage events from other tabs', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
    
    const { result } = renderHook(() => useLocalStorage('shared-key', 'default'));
    
    expect(result.current[0]).toBe('initial');
    
    // Simulate storage event from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'shared-key',
      newValue: JSON.stringify('updated from other tab'),
      oldValue: JSON.stringify('initial'),
    });
    
    act(() => {
      // Trigger the storage event listener
      const storageListener = mockEventListeners.storage[0];
      storageListener(storageEvent);
    });
    
    expect(result.current[0]).toBe('updated from other tab');
  });

  it('ignores storage events for different keys', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
    
    const { result } = renderHook(() => useLocalStorage('my-key', 'default'));
    
    // Simulate storage event for different key
    const storageEvent = new StorageEvent('storage', {
      key: 'other-key',
      newValue: JSON.stringify('other value'),
      oldValue: null,
    });
    
    act(() => {
      const storageListener = mockEventListeners.storage[0];
      storageListener(storageEvent);
    });
    
    expect(result.current[0]).toBe('initial'); // Should not change
  });

  it('ignores storage events with null newValue', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
    
    const { result } = renderHook(() => useLocalStorage('my-key', 'default'));
    
    // Simulate storage event with null newValue (key deletion)
    const storageEvent = new StorageEvent('storage', {
      key: 'my-key',
      newValue: null,
      oldValue: JSON.stringify('initial'),
    });
    
    act(() => {
      const storageListener = mockEventListeners.storage[0];
      storageListener(storageEvent);
    });
    
    expect(result.current[0]).toBe('initial'); // Should not change
  });

  it('handles malformed JSON in storage events', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify('initial'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { result } = renderHook(() => useLocalStorage('my-key', 'default'));
    
    // Simulate storage event with malformed JSON
    const storageEvent = new StorageEvent('storage', {
      key: 'my-key',
      newValue: 'invalid json {',
      oldValue: JSON.stringify('initial'),
    });
    
    act(() => {
      const storageListener = mockEventListeners.storage[0];
      storageListener(storageEvent);
    });
    
    expect(result.current[0]).toBe('initial'); // Should not change
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error parsing localStorage key "my-key" from storage event:',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => useLocalStorage('test', 'value'));
    
    expect(window.addEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
    
    unmount();
    
    expect(window.removeEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
  });

  it('works with complex objects', () => {
    const complexObject = {
      user: { id: 1, name: 'John' },
      preferences: { theme: 'dark', notifications: true },
      progress: [1, 2, 3, 4, 5]
    };
    
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockImplementation(() => {}); // Don't throw error
    
    const { result } = renderHook(() => useLocalStorage('complex', complexObject));
    
    act(() => {
      result.current[1]({
        ...complexObject,
        user: { ...complexObject.user, name: 'Jane' }
      });
    });
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'complex', 
      JSON.stringify({
        ...complexObject,
        user: { id: 1, name: 'Jane' }
      })
    );
  });

  it.skip('handles SSR gracefully (when window is undefined)', () => {
    // This test is skipped because jsdom test environment always has window defined
    // In a real SSR environment, this would work correctly
    const originalWindow = global.window;
    
    // Simulate SSR environment
    delete (global as any).window;
    
    const { result } = renderHook(() => useLocalStorage('ssr-test', 'default'));
    
    expect(result.current[0]).toBe('default');
    
    // Restore window
    global.window = originalWindow;
  });
});