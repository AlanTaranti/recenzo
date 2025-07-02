# Recenzo Development Guidelines

This document provides essential information for developers working on the Recenzo project.

## Table of Contents

1. [Architecture & Organization](#architecture--organization)
2. [Build/Configuration Instructions](#buildconfiguration-instructions)
3. [Testing Information](#testing-information)
4. [Development Workflow](#development-workflow)
5. [Contributing Guidelines](#contributing-guidelines)

## Architecture & Organization

The project follows a clean architecture approach with clear separation of concerns:

```
├── src/                  # Application source code
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic services
│   ├── use-cases/        # Application use cases
│   └── index.ts          # Main entry point
├── test/                 # Test files (mirrors src structure)
├── dist/                 # Compiled output
└── ...                   # Configuration files
```

### Main Components

| Component                | Description                                      |
| ------------------------ | ------------------------------------------------ |
| **BitbucketRepository**  | Handles data access to Bitbucket API             |
| **BitbucketService**     | Provides business logic for Bitbucket operations |
| **ReviewerAgentService** | Manages AI-powered code review logic             |
| **ReviewPrUseCase**      | Orchestrates the pull request review process     |

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

## Development Workflow

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

## Contributing Guidelines

We welcome contributions to Recenzo! Here's how you can help:

1. **Fork the Repository**: Create your own fork of the project
2. **Create a Feature Branch**: Make your changes in a new branch
3. **Follow Code Style**: Ensure your code follows our style guidelines
4. **Write Tests**: Add tests for any new functionality
5. **Submit a Pull Request**: For major changes, please open an issue first to discuss what you would like to change

Please make sure to update tests as appropriate and ensure all tests pass before submitting your pull request.
