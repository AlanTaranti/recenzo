# Recenzo

![Maintenance](https://img.shields.io/maintenance/yes/2025)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![License](https://img.shields.io/github/license/AlanTaranti/recenzo.svg)](LICENSE)

Recenzo is a JS/TS library for custom AI powered Bitbucket code reviews. Fetch PR diffs, analyze changes, and automate reviewer feedback to enforce standards.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Contributing](#contributing)
4. [License](#license)

## Installation

Use your favorite package manager to install recenzo.

npm:

```bash
npm install @taranti/recenzo
```

yarn:

```bash
yarn add @taranti/recenzo
```

## Usage

### Environment Variables

Before using Recenzo, you need to set up the following environment variables:

- `BITBUCKET_ACCESS_TOKEN`: Required for Bitbucket API access
  - [Learn more about Bitbucket Access Tokens](https://support.atlassian.com/bitbucket-cloud/docs/access-tokens/)
- `OPENAI_API_KEY`: Required for AI-powered code reviews
  - [Learn more about OpenAI API Keys](https://platform.openai.com/docs/overview)

You can set these in your environment or use a `.env` file.

### Node

```typescript
import { reviewPullRequest } from '@taranti/recenzo';

// Pull request information
const pullRequestInfo = {
  workspace: 'your-workspace',
  repository: 'your-repository',
  prNumber: 123,
  ignoredFiles: ['package-lock.json'], // optional
};

// Code review instructions
const codeReviewInstruction = {
  commentLanguage: 'en', // Language for comments (e.g., 'en', 'fr', etc.)
  instruction: 'Please review this code for best practices and potential bugs.',
};

// Options (optional)
const options = {
  dryRun: false, // Set to true to preview without posting comments
};

// Review the pull request
// The options parameter is optional and can be omitted
await reviewPullRequest(pullRequestInfo, codeReviewInstruction, options);

// Or without options
await reviewPullRequest(pullRequestInfo, codeReviewInstruction);
```

## Contributing

We welcome contributions to Recenzo! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Project architecture and organization
- Build and configuration instructions
- Testing guidelines and requirements
- Development workflow
- How to submit pull requests

For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
