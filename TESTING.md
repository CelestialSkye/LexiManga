# LexiManga Testing Guide

## Overview

LexiManga uses Vitest for unit testing with React Testing Library for component testing.

## Running Tests

### Run all tests once

```bash
npm run test
```

### Watch mode (re-run on file changes)

```bash
npm run test:watch
```

### Run with UI dashboard

```bash
npm run test:ui
```

### Generate coverage report

```bash
npm run test:coverage
```

## Test Structure

Tests are organized in `src/test/` directory:

```
src/test/
├── setup.js                  # Test setup and mocks
├── authService.test.js       # Authentication tests
├── apiService.test.js        # API integration tests
└── utils.test.js             # Utility function tests
```

## Writing Tests

### Basic Test Structure

```javascript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

### Testing Async Functions

```javascript
it('should handle async operations', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});
```

### Mocking Functions

```javascript
import { vi } from 'vitest';

const mockFn = vi.fn().mockReturnValue('value');
expect(mockFn()).toBe('value');
expect(mockFn).toHaveBeenCalled();
```

### Testing with Setup/Teardown

```javascript
describe('Suite', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });
});
```

## Test Coverage

Coverage reports are generated in `coverage/` directory when running:

```bash
npm run test:coverage
```

Current coverage targets:

- Statements: 70%
- Branches: 65%
- Functions: 70%
- Lines: 70%

## Current Test Suites

### Authentication Service (authService.test.js)

- Email validation
- Password strength requirements
- Terms acceptance validation
- Login flow validation
- Password reset functionality

### API Service (apiService.test.js)

- Search query validation
- Pagination parameters
- Translation text validation
- Language support
- Health check responses
- Error handling and retries

### Utilities (utils.test.js)

- Number formatting
- Text truncation
- Date formatting
- Email and URL validation
- Data transformation
- String manipulation
- Math calculations

## Continuous Integration

Tests run automatically on:

- Every push to any branch
- Every pull request to main/develop
- Manual workflow trigger

CI workflow:

1. Install dependencies
2. Run linting
3. Run type checking
4. Run tests
5. If all pass → Build application
6. If all pass → Deploy

See `.github/workflows/ci.yml` for full details.

## Best Practices

### ✅ Do's

- Test behavior, not implementation details
- Use descriptive test names
- One assertion per test when possible
- Mock external dependencies
- Use setup/teardown for common tasks
- Keep tests focused and isolated

### ❌ Don'ts

- Don't test third-party libraries
- Don't create overly complex tests
- Don't skip tests that fail
- Don't test implementation details
- Don't leave pending tests

## Debugging Tests

### Run single test file

```bash
npm run test -- src/test/authService.test.js
```

### Run tests matching pattern

```bash
npm run test -- --grep "validation"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal"
}
```

## Adding Tests to CI/CD

Before committing:

1. Ensure tests pass locally: `npm run test`
2. Check coverage meets targets
3. Add new tests for new features
4. Fix any CI failures before merging

## Resources

- Vitest docs: https://vitest.dev/
- Testing Library docs: https://testing-library.com/
- Jest matchers: https://vitest.dev/api/expect.html

## Example Test Cases by Feature

### Feature: Manga Search

```javascript
it('should search for manga by title', async () => {
  const results = await searchManga('Naruto');
  expect(results).toBeDefined();
  expect(results.length).toBeGreaterThan(0);
});
```

### Feature: User Profile

```javascript
it('should update user profile', async () => {
  const updated = await updateProfile({ name: 'John' });
  expect(updated.name).toBe('John');
});
```

### Feature: Word Management

```javascript
it('should add word to vocabulary', async () => {
  const word = await addWord('hello');
  expect(word.id).toBeDefined();
});
```

---

Last Updated: January 1, 2024
