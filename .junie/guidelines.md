# Recenzo Development Guidelines

This document provides essential information for developers working on the Recenzo project.

## Build/Configuration Instructions

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- npm (comes with Node.js)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/AlanTaranti/recenzo.git
   cd recenzo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Environment Variables:
   - `BITBUCKET_ACCESS_TOKEN`: Required for Bitbucket API access
   - Set these in your environment or use a `.env` file (not committed to git)

4. Build Configuration:
   - Note: The `prepublishOnly` script references a `build` script that is not currently defined in package.json
   - You may need to add a build script if you plan to publish the package

## Testing Information

### Running Tests

- Run all tests:

  ```bash
  npm run test
  ```

- Run tests with coverage:

  ```bash
  npx vitest run --coverage
  ```

- Run mutation tests:
  ```bash
  npm run killMutants
  ```

### Adding New Tests

1. Create test files in the `test` directory, mirroring the structure of the `src` directory
2. Use the Vitest testing framework with the following pattern:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { YourClass } from '~/path/to/your/class';

describe('YourClass', () => {
  describe('yourMethod', () => {
    it('should do something specific', () => {
      // Arrange
      const instance = new YourClass();

      // Act
      const result = instance.yourMethod();

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

3. For mocking dependencies:

```typescript
// Setup mocks
const mockDependency = {
  someMethod: vi.fn().mockResolvedValue(mockReturnValue),
};

// Create instance with mocked dependency
const instance = new YourClass(mockDependency);

// Verify mock was called correctly
expect(mockDependency.someMethod).toHaveBeenCalledWith(expectedArgs);
```

4. For testing async code:

```typescript
it('should handle async operations', async () => {
  await expect(asyncFunction()).resolves.toBe(expectedValue);
  await expect(failingAsyncFunction()).rejects.toThrow(expectedError);
});
```

5. After creating tests, always run the following commands to ensure code quality:

```bash
# Run all tests to verify functionality
npm run test

# Run mutation tests to ensure test quality
npm run killMutants

# Run linting to ensure code style consistency
npm run lint
```

### Test Example

A simple example of testing string utility functions:

```typescript
// src/utils/string-utils.ts
export function reverseString(str: string): string {
  return str.split('').reverse().join('');
}

export function isPalindrome(str: string): boolean {
  const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return normalized === reverseString(normalized);
}

// test/utils/string-utils.test.ts
import { describe, it, expect } from 'vitest';
import { reverseString, isPalindrome } from '~/utils/string-utils';

describe('String Utils', () => {
  describe('reverseString', () => {
    it('should reverse a string correctly', () => {
      expect(reverseString('hello')).toBe('olleh');
    });
  });

  describe('isPalindrome', () => {
    it('should correctly identify palindromes', () => {
      expect(isPalindrome('racecar')).toBe(true);
      expect(isPalindrome('A man, a plan, a canal: Panama')).toBe(true);
    });

    it('should correctly identify non-palindromes', () => {
      expect(isPalindrome('hello')).toBe(false);
    });
  });
});
```

## Additional Development Information

### Project Structure

- `src/`: Source code
  - `repositories/`: Data access layer (e.g., BitbucketRepository)
  - `services/`: Business logic services
  - `use-cases/`: Application use cases
- `test/`: Test files (mirrors src structure)
  - Currently contains tests for `repositories/` and `use-cases/`

### Code Style and Linting

- ESLint and Prettier are configured for code quality and formatting
- Run linting:
  ```bash
  npm run lint
  ```
- Check linting without fixing:
  ```bash
  npm run lint:check
  ```
- Git hooks (via Husky) ensure code is linted before commit

### Coverage Requirements

- The project maintains a minimum of 80% test coverage for:
  - Lines
  - Functions
  - Branches
  - Statements

### Mutation Testing

- Stryker is used for mutation testing to ensure test quality
- Run mutation tests with:
  ```bash
  npm run killMutants
  ```

### TypeScript Configuration

- The project uses TypeScript with strict type checking
- Configuration is in `tsconfig.json`
- Path aliases: `~` maps to the `src` directory

### Debugging

- For debugging tests, you can use:
  ```bash
  npx vitest --inspect-brk
  ```
  Then connect with Chrome DevTools or VS Code debugger
