/// <reference types="node" />
import 'dotenv/config';
import { defineConfig, devices, ReporterDescription } from '@playwright/test';
import { formatIstTimestamp } from './src/utils/logger/logger';

process.env.PLAYWRIGHT_RUN_ID ??= formatIstTimestamp(true).replace(/[: ]/g, '-');

/**
 * Auth flow:
 *
 *  global-setup.ts  →  logs in 4 users in parallel
 *                   →  writes .auth/sf-{role}.json for each
 *
 *  Each project below loads its own .json via storageState.
 *  Tests start already authenticated — no login steps needed in specs.
 *
 *  global-teardown.ts  →  removes .auth/*.json after the run (CI hygiene)
 */

const reporters: ReporterDescription[] = [
  ['list'],
  ['html', { outputFolder: 'reports/playwright-report', open: 'never' }],
  ['allure-playwright', {
    resultsDir: 'reports/allure-results',
    detail: true,
    suiteTitle: true
  }],
];

// Set LOGGING_ENABLED=false to disable the custom Winston-backed reporter for this run.
if (process.env.LOGGING_ENABLED?.toLowerCase() !== 'false') {
  reporters.push(['./src/utils/logger/playwright-logger-reporter.ts']);
}

const roles = [
  { name: 'admin', storageState: '.auth/sf-admin.json' },
  { name: 'translator', storageState: '.auth/sf-translator.json' },
  { name: 'reviewer', storageState: '.auth/sf-reviewer.json' },
  { name: 'cc-checker', storageState: '.auth/sf-cc-checker.json' },
];

const browsers = [
  { name: 'chrome', device: devices['Desktop Chrome'] },
  { name: 'firefox', device: devices['Desktop Firefox'] },
  { name: 'webkit', device: devices['Desktop Safari'] },
];
// Generate projects dynamically based on roles and browsers
const browser_role_projects = browsers.flatMap(({ name: browserName, device }) =>
  roles.map(({ name: roleName, storageState }) => ({
    name: `${browserName}-${roleName}`,
    use: { ...device, storageState },
  }))
);



export default defineConfig({
  testDir: './tests',

  globalSetup:    require.resolve('./tests/global_auth/global-setup'), 
  globalTeardown: require.resolve('./tests/global_auth/global-teardown'),

  fullyParallel: true,
  forbidOnly:    !!process.env.CI,
  retries:       process.env.CI ? 2 : 0,
  workers:       process.env.CI ? 1 : undefined,
  reporter: reporters,
  timeout: 360_000,
  expect: {
    timeout: 15_000,
  },


  use: {
    viewport:          { width: 1280, height: 720 },
    headless:          !!process.env.CI || true,
    trace:             'on-first-retry',
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    actionTimeout:     60_000,
    navigationTimeout: 120_000,
  },

  projects: 
    browser_role_projects,
  
});
