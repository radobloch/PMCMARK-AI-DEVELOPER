import '@testing-library/jest-dom';

// Polyfill global fetch if needed
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Polyfill TextEncoder / TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock clipboard API for navigator
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  writable: true,
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
