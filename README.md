# Scripture Forge Playwright Automation Framework

A TypeScript and Playwright end-to-end test framework for Scripture Forge. It uses role-based authenticated browser sessions, page objects, shared test-data generators, Winston logging, and Playwright and Allure reporting.
## Stack

- Node.js and TypeScript
- Playwright Test
- dotenv
- `@faker-js/faker`
- Winston
- `allure-playwright` and `allure-commandline`

## Prerequisites
- Node.js and npm
- Access to the target Scripture Forge environment
- Credentials for the roles to be exercised
- Playwright browser binaries

Install dependencies and browser binaries:
```powershell
npm install
npx playwright install
```

## Environment Configuration
Create a root `.env` file with the base URL and only the credentials needed for the roles being run:

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

`.env` and `.auth/` are ignored by Git. Do not commit credentials, exported storage states, or persistent browser profiles.
## Framework Structure

```text
.
|- config/
|  `- environments/              # Environment modules; qa.ts is currently empty
|- src/
|  |- base/                      # Shared page-object behavior
|  |- fixtures/                  # Role pages, page managers, logging, diagnostics
|  |- locators/                  # Centralized selectors
|  |- pages/                     # Login, projects, edit/review, sync, settings, checking
|  |- test_data/constants/       # Reusable routes, assertions, and inputs
|  `- utils/
|     |- data/                   # Faker and synthetic scripture data
|     |- JSONFilesHandler/       # JSON read/update helpers
|     |- logger/                 # Winston logger and Playwright reporter
|     `- waits/                  # Shared wait helpers
|- tests/
|  |- global_auth/               # Persistent-profile setup and teardown
|  |- login/                     # Admin, translator, and CC Checker access checks
|  |- sf_translator/             # Edit & Review and synchronization scenarios
|  |- CC_Checking/               # Questions and Answers coverage
|  `- data/                      # Synthetic scripture-data tests
|- reports/                      # Generated logs and reports
|- playwright.config.ts
`- package.json
```

`PageManager` provides the page objects used by authenticated fixtures. Tests import `test` and `expect` from `src/fixtures/auth.fixtures.ts` to receive role pages and their corresponding page managers.
## Authentication and Projects

Before a run, `tests/global_auth/global-setup.persistent-profile.ts` creates a persistent Chromium profile under `.auth/.chrome-profiles/<role>` for each selected role. It logs in and exports the current browser storage state to:

- `.auth/sf-admin.json`
- `.auth/sf-translator.json`
- `.auth/sf-reviewer.json`
- `.auth/sf-cc-checker.json`

Set `PLAYWRIGHT_ROLE` to one of `admin`, `translator`, `reviewer`, or `cc_checker` to prepare only that role. Without it, setup processes every configured role that has credentials.
The Playwright config dynamically creates 12 projects from this matrix:

| Browser | Roles |
| --- | --- |
| `chrome` | `admin`, `translator`, `reviewer`, `cc-checker` |
| `firefox` | `admin`, `translator`, `reviewer`, `cc-checker` |
| `webkit` | `admin`, `translator`, `reviewer`, `cc-checker` |

Examples include `chrome-translator` and `webkit-cc-checker`. Each project loads that role's exported storage state. Global teardown removes only exported `.auth/*.json` files; persistent profiles remain for later trusted-device logins.
## Running Tests

`package.json` currently contains report scripts only, so invoke Playwright with `npx`.

Run the configured suite:

```powershell
npx playwright test
```

Run one browser-role project:

```powershell
$env:PLAYWRIGHT_ROLE='translator'
npx playwright test --project=chrome-translator
```

Run a focused scenario:

```powershell
$env:PLAYWRIGHT_ROLE='translator'
npx playwright test tests/sf_translator/01_DOK_03.spec.ts --project=chrome-translator
```

Run the data-generator tests:

```powershell
npx playwright test tests/data/scripture_generator.spec.ts --project=chrome-admin
```

Open Playwright UI mode:

```powershell
npx playwright test --ui
```

Current runtime defaults are a 1440 x 900 viewport, a six-minute test timeout, 15-second assertion timeout, one retry, failure traces and screenshots, and failure videos. The current `headless: !!process.env.CI || true` configuration always runs headless, including local runs. Set `LOGGING_ENABLED=false` to omit the custom Winston Playwright reporter.
## Test Coverage

Current checked-in coverage includes:

- Authenticated admin, translator, and CC Checker project access
- Translator Edit & Review navigation and settings visibility
- Admin project connection, translator project joining, and Paratext synchronization cancellation
- CC Checker Questions and Answers navigation
- Synthetic scripture references, verse-like text, and question/answer generators

The scenarios depend on preconfigured project names such as `F03` and `TNN01`, live Scripture Forge services, and valid role permissions. They are integration tests, not isolated unit tests.
## Reports and Logs

Playwright writes generated output to `reports/`:

```text
reports/
|- playwright-report/             # Playwright HTML report
|- allure-results/                # Raw Allure result data
|- allure-report/                 # Generated Allure HTML report
`- logs/<date>/                   # Framework and per-spec Winston logs
```

Generate or open the Allure report:

```powershell
npm run allure:generate
npm run allure:open
npm run allure:report
```

Open the Playwright report:

```powershell
npx playwright show-report reports/playwright-report
```

## CI

`.github/workflows/playwright.yml` runs on pushes and pull requests to `main` and `master`. It installs dependencies and Playwright browsers, runs `tests/login/sf_cc_user.spec.ts` using `chrome-cc-checker`, generates the Allure report, and uploads Playwright, Allure, and log artifacts for 30 days.

Configure these repository secrets for that workflow:

- `BASE_URL`
- `SF_CC_CHECKER_EMAIL`
- `SF_CC_CHECKER_PASSWORD`

## Development Notes

- Keep UI interactions in page objects and obtain them through `PageManager`.
- Reuse shared selectors, constants, waits, JSON helpers, loggers, and data generators instead of duplicating them in specs.
- Use `seedScripture(seed)` when debugging synthetic scripture data deterministically.
- `config/environments/qa.ts` is currently empty; the active base URL comes from `BASE_URL` in `.env`.
- `reports/`, `test-results/`, Playwright reports, `.auth/`, and `node_modules/` are generated or local-only paths.
