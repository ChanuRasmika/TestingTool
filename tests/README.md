# Tests

This folder contains all testing configurations and test files for the project.

## Structure

- `component/` - Component tests using Playwright CT
- `e2e/` - End-to-end tests using Playwright
- `playwright/` - Playwright component testing setup files

## Configuration Files

- `playwright-ct.config.js` - Component testing configuration
- `playwright.config.js` - E2E testing configuration
- `package.json` - Dependencies and scripts

## Running Tests

```bash
# Install dependencies
npm install

# Run component tests
npm run test:component

# Run e2e tests
npm run test:e2e

# Run all tests
npm run test:all

# Run with UI
npm run test:component:ui
npm run test:e2e:headed
```