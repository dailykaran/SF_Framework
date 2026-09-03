# Scripture Forge Playwright Automation Framework

A TypeScript and Playwright test automation framework for Scripture Forge QA at `qa.scriptureforge.org`.

The framework is currently in partial development. It provides role-based authentication, reusable page objects and fixtures, Faker-based test data, synthetic scripture references and question/answer data, structured Winston logging, and Playwright and Allure reporting. Coverage is currently focused on login and the translator Edit & Review smoke flow.

## Technology Stack

- Node.js
- TypeScript
- Playwright Test
- `@faker-js/faker`
- `allure-playwright`
- `allure-commandline`
- `winston`
- dotenv

## Prerequisites

- Node.js and npm installed
- Access to the Scripture Forge QA environment
- Valid test credentials for the four configured roles
- Google/Paratext authentication available for admin, translator, and reviewer users
- Direct Scripture Forge login available for the CC Checker user

## Installation

```powershell
npm install
```

## Environment Configuration

Create a local `.env` file in the project root. Use `.env.example` as the template and replace the sample values with valid QA credentials.

```dotenv
BASE_URL=https://qa.scriptureforge.org/

SF_ADMIN_EMAIL=your-admin-email
SF_ADMIN_PASSWORD=your-admin-password

SF_TRANSLATOR_EMAIL=your-translator-email
SF_TRANSLATOR_PASSWORD=your-translator-password

SF_REVIEWER_EMAIL=your-reviewer-email
SF_REVIEWER_PASSWORD=your-reviewer-password

SF_CC_CHECKER_EMAIL=your-cc-checker-email
SF_CC_CHECKER_PASSWORD=your-cc-checker-password
```

Do not commit `.env`, credentials, or `.auth` session files. They are excluded by `.gitignore`.

## Project Structure

```text
.
├── config/
│   └── environments/
│       └── qa.ts                 # Reserved for QA environment configuration
├── src/
│   ├── base/
│   │   └── base.page.ts          # Shared page-object behavior
│   ├── fixtures/
│   │   └── auth.fixtures.ts      # Authenticated pages and page-object fixtures
│   ├── locators/
│   │   └── selectors.ts          # Shared selectors
│   ├── pages/
│   │   ├── Edit_Review/editReview.ts
│   │   └── login/loginSF_Users.ts
│   ├── test_data/constants/
│   │   ├── asserts.ts            # Assertion and route constants
│   │   └── inputs.ts             # Reusable test inputs
│   └── utils/
│       ├── data/                 # Faker and synthetic scripture data
│       ├── JSONFilesHandler/     # JSON read and update helpers
│       ├── logger/               # Winston logger and Playwright reporter
│       └── waits/                # Smart-wait helpers
├── tests/
│   ├── data/
│   │   └── scripture_generator.spec.ts
│   ├── global_auth/
│   │   ├── global-setup.ts       # Creates or refreshes role session files
│   │   └── global-teardown.ts
│   ├── login/
│   │   ├── sf_admin_user.spec.ts
│   │   ├── sf_cc_user.spec.ts
│   │   └── sf_translator_user.spec.ts
│   └── sf_translator/
│       └── edit_review.spec.ts
├── reports/
│   ├── allure-report/            # Generated Allure HTML report
│   ├── allure-results/           # Allure raw result files
│   ├── logs/                     # Run and per-spec log files
│   └── playwright-report/        # Generated Playwright HTML report
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Authentication Flow

`playwright.config.ts` defines four browser projects:

- `chrome-admin`
- `chrome-translator`
- `chrome-reviewer`
- `chrome-cc-checker`

Before the test run, `tests/global_auth/global-setup.ts`:

1. Reads the role credentials from environment variables.
2. Checks whether `.auth/sf-{role}.json` exists.
3. Validates cookie, Auth0 cache, and JWT expiry values.
4. Reuses a valid session or performs a fresh login when the session is expired.
5. Stores the authenticated browser state in `.auth/`.

The `PLAYWRIGHT_ROLE` environment variable can limit global setup to one role. This is used by CI for the `cc_checker` role. When no role is specified, the configured role sessions are prepared for the browser projects.

The test fixtures use these storage-state files to create authenticated Playwright pages. The current global setup performs live authentication against the QA environment when session files are missing or expired.

## Running Tests

Run the complete suite:

```powershell
npx playwright test
```

Run a specific spec:

```powershell
npx playwright test tests/sf_translator/edit_review.spec.ts
```

Run the synthetic data tests only:

```powershell
npx playwright test tests/data/scripture_generator.spec.ts --project=chrome-admin
```

Run one browser project:

```powershell
npx playwright test --project=chrome-translator
```

Run with the Playwright UI mode:

```powershell
npx playwright test --ui
```

Local runs are headed by default. CI runs headless automatically because `headless` is enabled when `CI` is set. The configuration also enables a 120-second test timeout, a 15-second assertion timeout, and one retry in CI.

To disable the custom Winston-backed reporter for a run, set `LOGGING_ENABLED=false`.

### CI

The GitHub Actions workflow runs on pushes and pull requests targeting `main` or `master`. It currently runs the CC Checker login test with the `chrome-cc-checker` project, generates the Allure report, and uploads the Playwright report, Allure results, and generated Allure report as an artifact retained for 30 days. Configure `BASE_URL`, `SF_CC_CHECKER_EMAIL`, and `SF_CC_CHECKER_PASSWORD` as repository secrets.

## Shared Data Utilities

Import shared generators through the data barrel file:

```typescript
import {
  CommonFakerData,
  getQuestionAnswerForChapter,
  getRandomVerse,
} from '../../src/utils/data';
```

The common Faker generator provides reusable values such as:

- Phone numbers
- Birth dates
- Current dates and times
- Indian addresses
- Names and email addresses
- Prices and descriptions
- Salutations
- Amounts

The scripture generator creates synthetic, non-scriptural test data. It does not bundle real Bible text:

```typescript
const verse = getRandomVerse();
const questionAnswer = getQuestionAnswerForChapter('John', 3);
```

Available scripture functions include:

- `getRandomReference()`
- `getReferenceForChapter(book, chapter)`
- `getRandomVerseText()`
- `getRandomVerse()`
- `getRandomVerses(count)`
- `getRandomQuestionAnswer()`
- `getRandomQuestionAnswers(count)`
- `getQuestionAnswerForChapter(book, chapter)`
- `getQuestionAnswersForChapter(book, chapter, count)`
- `seedScripture(seed)`

## Reports

Each test run produces Playwright HTML output, Allure raw results, and structured logs:

```text
reports/
├── playwright-report/
├── allure-results/
├── allure-report/
└── logs/
```

The custom reporter writes run-level and per-spec log files under `reports/logs/<date>/`. Test code can also create a named logger and write structured events to the current spec log through the helpers in `src/utils/logger/logger.ts`.

Generate the Allure HTML report:

```powershell
npm run allure:generate
```

Open the generated Allure report in a browser:

```powershell
npm run allure:open
```

Generate and open the Allure report in one command:

```powershell
npm run allure:report
```

Open the Playwright report:

```powershell
npx playwright show-report reports/playwright-report
```

To create Allure data, run the Playwright tests first. The Allure reporter is enabled in `playwright.config.ts` and writes raw files to `reports/allure-results`.

## Current Coverage

Implemented:

- Four role-based Playwright projects
- Cached authenticated browser sessions
- Session expiry validation and automatic re-login
- Reusable authentication fixtures
- Shared base page, selectors, waits, JSON helpers, and test constants
- Paratext/Google login flow for admin, translator, and reviewer
- Direct login flow for the CC Checker
- Basic admin project navigation test
- CC Checker project navigation and permission test
- Translator Edit & Review smoke test
- Shared Faker data utilities
- Synthetic scripture references, verse-like text, and question/answer data
- Winston-backed run and per-spec logging
- GitHub Actions workflow for the CC Checker smoke test
- Playwright and Allure report generation

Partial or planned:

- The QA environment module at `config/environments/qa.ts` is currently empty; `BASE_URL` is read directly from `.env`.
- Edit & Review page coverage currently verifies navigation and settings visibility only.
- Translation, review, comments, approvals, and other business workflows are not yet automated.
- Project name `- 03F` is currently hard-coded in the smoke tests.
- `package.json` does not yet contain a general `test` script; commands currently use `npx playwright test`.
- The CI workflow currently covers only the CC Checker smoke test; broader role coverage is not yet enabled.
- Test-data lifecycle management is not yet complete.

## Development Guidelines

- Keep credentials in `.env` or CI secret variables.
- Do not commit `.auth`, `reports`, `test-results`, or other generated artifacts.
- Prefer page objects for UI interaction and fixtures for authenticated roles.
- Import shared data through `src/utils/data/index.ts`.
- Use the shared constants, selectors, waits, JSON helpers, and logger utilities when extending tests.
- Keep synthetic test data deterministic when debugging by calling `seedScripture(seed)`.
- Add focused tests when extending a page object or data generator.

## Troubleshooting

### Missing credentials

Set all required `SF_*_EMAIL` and `SF_*_PASSWORD` variables in `.env`. Global setup fails when a role has missing credentials and a fresh login is required.

### Session expired

Delete the relevant `.auth/sf-{role}.json` file and rerun the test. Global setup will create a fresh session.

### Allure report has no data

Run the tests first, then generate and open the report:

```powershell
npx playwright test tests/data/scripture_generator.spec.ts --project=chrome-admin
npm run allure:generate
npm run allure:open
```

Use `reports/allure-report`, not a root-level `allure-report` path.

### Logging

Logs are written under `reports/logs/` during a run. Set `LOGGING_ENABLED=false` when troubleshooting without the custom logger reporter. The reporter is enabled by default.

### QA login fails

Confirm `BASE_URL`, credentials, network access, and the external Google/Paratext authentication flow. The login setup depends on live QA services and is not a fully isolated local test.
