import { test as base, expect, type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { createLogger, getSpecLogFilePath, releaseLogger, serializeError, writeLog } from '../utils/logger/logger';
import type winston from 'winston';
import { EditReviewPage } from '../pages/Edit_Review/editReview';

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
  logger: winston.Logger;
  adminPage:    Page;
  translatorPage:   Page;
  reviewerPage: Page;
  ccCheckerPage: Page;

  adminEditReviewPage: EditReviewPage;
  translatorEditReviewPage: EditReviewPage;
  reviewerEditReviewPage: EditReviewPage;
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

function addPageDiagnostics(page: Page, log: winston.Logger, role: string): void {
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') {
      log.debug('Browser console message', {
        role,
        type: message.type(),
        text: message.text(),
        location: message.location(),
      });
    }
  });
  page.on('pageerror', error => {
    log.error('Browser page error', { role, error: serializeError(error) });
  });
  page.on('requestfailed', request => {
    log.debug('Browser request failed', {
      role,
      method: request.method(),
      url: request.url(),
      failure: request.failure(),
    });
  });
}

export const test = base.extend<AuthFixtures>({

  logger: [async ({}, use, testInfo) => {
      const specFile = path.relative(process.cwd(), testInfo.file);
      const context = `${specFile}:${testInfo.project.name}:${testInfo.testId}`;
      const logFile = getSpecLogFilePath(testInfo.file);
      const testLogger = createLogger(context, logFile);
      testLogger.info('Test started', { title: testInfo.title });
      await use(testLogger);
      const errors = testInfo.errors.map(serializeError);
      if (errors.length > 0) {
        await writeLog(testLogger, 'error', 'Test failed', { status: testInfo.status, errors });
        testLogger.debug('Test failure diagnostics', {
          expectedStatus: testInfo.expectedStatus,
          retry: testInfo.retry,
          errors,
        });
      }
      await writeLog(testLogger, 'info', 'Test finished', { status: testInfo.status });
      releaseLogger(testLogger);

      if (testInfo.status !== testInfo.expectedStatus) {
        if (fs.existsSync(logFile)) {
          await testInfo.attach('logger', { path: logFile, contentType: 'text/plain' });
        }
      }
  }, { auto: true }],

  adminPage: async ({ browser, logger }, use) => {
    const page = await makeAuthPage(browser, AUTH.admin);
    addPageDiagnostics(page, logger, 'admin');
    await use(page);
    await page.context().close();
  },

  translatorPage: async ({ browser, logger }, use) => {
    const page = await makeAuthPage(browser, AUTH.translator);
    addPageDiagnostics(page, logger, 'translator');
    await use(page);
    await page.context().close();
  },

  reviewerPage: async ({ browser, logger }, use) => {
    const page = await makeAuthPage(browser, AUTH.reviewer);
    addPageDiagnostics(page, logger, 'reviewer');
    await use(page);
    await page.context().close();
  },

  ccCheckerPage: async ({ browser, logger }, use) => {
    const page = await makeAuthPage(browser, AUTH.ccChecker);
    addPageDiagnostics(page, logger, 'cc-checker');
    await use(page);
    await page.context().close();
  },

  adminEditReviewPage: async ({ adminPage, logger }, use) => {
    await use(new EditReviewPage(adminPage, adminPage.context(), logger));
  },

  translatorEditReviewPage: async ({ translatorPage, logger }, use) => {
    await use(new EditReviewPage(translatorPage,  translatorPage.context(), logger));
  },

  reviewerEditReviewPage: async ({ reviewerPage, logger }, use) => {
    await use(new EditReviewPage(reviewerPage, reviewerPage.context(), logger));
  },
});

export { expect };
