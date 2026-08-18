/// <reference types="node" />
import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

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

export default defineConfig({
  testDir: './tests',

  globalSetup:    require.resolve('./tests/global_auth/global-setup'), 
  globalTeardown: require.resolve('./tests/global_auth/global-teardown'),

  fullyParallel: true,
  forbidOnly:    !!process.env.CI,
  retries:       process.env.CI ? 2 : 0,
  workers:       process.env.CI ? 1 : undefined,
  reporter:      'html',
  timeout: 120_000,
  expect: {
    timeout: 15_000,
  },

  use: {
    viewport:          { width: 1920, height: 1080 },
    headless: false,
    trace:             'on-first-retry',
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    actionTimeout:     60_000,
    navigationTimeout: 120_000,
  },

  projects: [
    // ── Admin ─────────────────────────────────────────────────────────────
    {
      name: 'chrome-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/sf-admin.json',
      },
    },

    // ── Editor / Translator ───────────────────────────────────────────────
    {
      name: 'chrome-translator',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/sf-translator.json',
      },
    },

    // ── Reviewer ──────────────────────────────────────────────────────────
    {
      name: 'chrome-reviewer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/sf-reviewer.json',
      },
    },

    // ── CC Checker ─────────────────────────────────────────────────────────
    {
      name: 'chrome-cc-checker',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/sf-cc-checker.json',
      },
    },
  ],
});
