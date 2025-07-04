# Recenzo

[![npm version](https://img.shields.io/npm/v/@taranti/recenzo.svg)](https://www.npmjs.org/package/@taranti/recenzo)
[![install size](https://img.shields.io/badge/dynamic/json?url=https://packagephobia.com/v2/api.json?p=@taranti/recenzo&query=$.install.pretty&label=install%20size)](https://packagephobia.now.sh/result?p=@taranti/recenzo)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/@taranti/recenzo)](https://bundlephobia.com/package/@taranti/recenzo@latest)

![Maintenance](https://img.shields.io/maintenance/yes/2025)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![License](https://img.shields.io/github/license/AlanTaranti/recenzo.svg)](LICENSE)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=AlanTaranti_recenzo&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=AlanTaranti_recenzo)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=AlanTaranti_recenzo&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=AlanTaranti_recenzo)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=AlanTaranti_recenzo&metric=coverage)](https://sonarcloud.io/summary/new_code?id=AlanTaranti_recenzo)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=AlanTaranti_recenzo&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=AlanTaranti_recenzo)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=AlanTaranti_recenzo&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=AlanTaranti_recenzo)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=AlanTaranti_recenzo&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=AlanTaranti_recenzo)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=AlanTaranti_recenzo&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=AlanTaranti_recenzo)

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
import recenzo from '@taranti/recenzo';

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
await recenzo.reviewPullRequest(pullRequestInfo, codeReviewInstruction, options);

// Or without options
await recenzo.reviewPullRequest(pullRequestInfo, codeReviewInstruction);
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
