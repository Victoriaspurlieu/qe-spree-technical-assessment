# Spree eCommerce Technical Assessment

This is a technical assessment for Quality Engineering using Spree Commerce platform.

## About Spree Commerce

This project uses [Spree Commerce](https://spreecommerce.org) - the open-source e-commerce platform for Rails. It is a great starting point for any Rails developer to quickly build an e-commerce application.

This starter uses:

* Spree Commerce 5 which includes Admin Dashboard, API and Storefront
* Ruby 3.3 and Ruby on Rails 7.2
* [Devise](https://github.com/heartcombo/devise) for authentication
* [Solid Queue](https://github.com/rails/solid_queue) with Mission Control UI (access only to Spree admins) for background jobs
* [Solid Cache](https://github.com/rails/solid_cache) for excellent caching and performance
* PostgreSQL as a database

## Local Installation

Please follow [Spree Quickstart guide](https://spreecommerce.org/docs/developer/getting-started/quickstart) to setup your Spree application using the Spree starter.

## Deployment

Please follow [Deployment guide](https://spreecommerce.org/docs/developer/deployment/render) to quickly deploy your production-ready Spree application.

## Troubleshooting

### libvips error

If you encounter an error like the following:

```bash
LoadError: Could not open library 'vips.so.42'
```

Please check that libvips is installed with `vips -v`, and if it is not installed, follow [installation instructions here](https://www.libvips.org/install.html).

# E-commerce Test Automation

This project contains end-to-end tests for the Spree e-commerce platform using Playwright.

## Project Structure

```
tests/
├── pages/          # Page Object Models
├── specs/          # Test specifications
├── fixtures/       # Test fixtures and setup
├── utils/          # Utility functions
└── config/         # Configuration files
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

3. Start the Rails server:
```bash
bundle exec rails server
```

## Running Tests

Run all tests:
```bash
npx playwright test
```

Run specific test file:
```bash
npx playwright test tests/specs/cart.spec.ts
```

Run tests in specific browser:
```bash
npx playwright test --project=chromium
```

## Test Reports

After running tests, you can find reports in:
- HTML Report: `test-results/html-report`
- Test Results: `test-results`
- Screenshots: `test-results` (on failure)
- Videos: `test-results` (on first retry)

## Adding New Tests

1. Create a new page object in `tests/pages/` if needed
2. Create a new test file in `tests/specs/`
3. Use the page objects and fixtures in your tests

## Best Practices

- Use Page Object Model for better maintainability
- Keep tests isolated and atomic
- Use meaningful test and variable names
- Add appropriate waits and assertions
- Handle errors gracefully

## CI Integration

The tests are configured to run in CI environments with:
- Retries on failure
- Video capture on first retry
- Screenshots on failure
- HTML report generation
