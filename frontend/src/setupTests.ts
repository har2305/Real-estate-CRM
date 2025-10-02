import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  (global as any).TextEncoder = class {
    encode(input: string) {
      return new Uint8Array(Buffer.from(input, 'utf8'));
    }
  };
  (global as any).TextDecoder = class {
    decode(input: Uint8Array) {
      return Buffer.from(input).toString('utf8');
    }
  };
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.location (minimal)
if (!window.location) {
  (window as any).location = {
    href: 'http://localhost:3000',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  };
}

// Mock fetch
Object.defineProperty(window, 'fetch', {
  value: jest.fn(),
  writable: true,
});

// Mock console methods to reduce noise in tests
Object.defineProperty(window, 'console', {
  value: {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  writable: true,
});

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
  writable: true,
});

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
  writable: true,
});
