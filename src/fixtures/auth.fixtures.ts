import { test as base, expect, type Page } from '@playwright/test';
import * as path from 'path';

/**
 * Auth fixtures — use these when a single test needs to act as
 * more than one role (e.g. admin creates a project, translator opens it).
 *
 * Usage in a spec:
 *
 *   import { test } from '../fixtures/auth.fixtures';
 *
 *   test('admin invites translator', async ({ adminPage, translatorPage }) => {
 *     await adminPage.goto('...');
 *     await translatorPage.goto('...');
 *   });
 */

type AuthFixtures = {
  adminPage:    Page;
  translatorPage:   Page;
  reviewerPage: Page;
  ccCheckerPage: Page;
};

const AUTH = {
  admin:    path.resolve('.auth/sf-admin.json'),
  translator:   path.resolve('.auth/sf-translator.json'),
  reviewer: path.resolve('.auth/sf-reviewer.json'),
  ccChecker: path.resolve('.auth/sf-cc-checker.json'),
} as const;

/** Creates a new browser context pre-loaded with the given storageState. */
async function makeAuthPage(
  browser: import('@playwright/test').Browser,
  storageStatePath: string,
): Promise<Page> {
  const context = await browser.newContext({ 
    storageState: storageStatePath,
    viewport: { width: 1920, height: 1080 }
  });
  return context.newPage();
}

export const test = base.extend<AuthFixtures>({

  adminPage: async ({ browser }, use) => {
    const page = await makeAuthPage(browser, AUTH.admin);
    await use(page);
    await page.context().close();
  },

  translatorPage: async ({ browser }, use) => {
    const page = await makeAuthPage(browser, AUTH.translator);
    await use(page);
    await page.context().close();
  },

  reviewerPage: async ({ browser }, use) => {
    const page = await makeAuthPage(browser, AUTH.reviewer);
    await use(page);
    await page.context().close();
  },

  ccCheckerPage: async ({ browser }, use) => {
    const page = await makeAuthPage(browser, AUTH.ccChecker);
    await use(page);
    await page.context().close();
  },
});

export { expect };
