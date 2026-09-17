import { test as base, expect, type Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { createLogger, getSpecLogFilePath, releaseLogger, serializeError, writeLog } from '../utils/logger/logger';
import type winston from 'winston';
import { PageManager } from '../pages/pageManager';
import { beforeAfterEach } from '../utils/beforeAfter/beforeAfterEach';

/**
 * Auth fixtures — use these when a single test needs to act as
 * more than one role (e.g. admin creates a project, translator opens it).
 *
 * Usage in a spec:
 *
 *   import { test } from '../fixtures/auth.fixtures';
 *
 *   test('admin invites translator', async ({ adminPages, translatorPages }) => {
 *     await adminPages.myProjects.openProject('F03');
 *     await translatorPages.editReview.open('F03');
 *   });
 */

type AuthFixtures = {
  logger: winston.Logger;
  adminPage:    Page;
  translatorPage:   Page;
  reviewerPage: Page;
  ccCheckerPage: Page;

  // Page Managers per role
  adminPages: PageManager;
  translatorPages: PageManager;
  reviewerPages: PageManager;
  ccCheckerPages: PageManager;
};

const AUTH = {
  admin:    path.resolve(`${process.env.ADMIN}`),
  translator:   path.resolve(`${process.env.TRANSLATOR}`),
  reviewer: path.resolve(`${process.env.REVIEWER}`),
  ccChecker: path.resolve(`${process.env.CC_CHECKER}`),
} as const;

const SESSION_FILE = {
  admin: AUTH.admin,
  translator: AUTH.translator,
  reviewer: AUTH.reviewer,
  ccChecker: AUTH.ccChecker,
} as const;

/** Creates a new browser context pre-loaded with the given storageState. */
async function makeAuthPage(
  browser: import('@playwright/test').Browser,
  storageStatePath: string,
): Promise<Page> {
  const context = await browser.newContext({ 
    storageState: storageStatePath,
    viewport: { width: 1440, height: 900}
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
    await new beforeAfterEach(page).checkAuthentication(SESSION_FILE.admin);
    await use(page);
    await page.context().close();
  },

  translatorPage: async ({ browser, logger }, use) => {
    const page = await makeAuthPage(browser, AUTH.translator);
    addPageDiagnostics(page, logger, 'translator');
    await new beforeAfterEach(page).checkAuthentication(SESSION_FILE.translator);
    await use(page);
    await page.context().close();
  },

  reviewerPage: async ({ browser, logger }, use) => {
    const page = await makeAuthPage(browser, AUTH.reviewer);
    addPageDiagnostics(page, logger, 'reviewer');
    await new beforeAfterEach(page).checkAuthentication(SESSION_FILE.reviewer);
    await use(page);
    await page.context().close();
  },

  ccCheckerPage: async ({ browser, logger }, use) => {
    const page = await makeAuthPage(browser, AUTH.ccChecker);
    addPageDiagnostics(page, logger, 'cc-checker');
    await new beforeAfterEach(page).checkAuthentication(SESSION_FILE.ccChecker);
    await use(page);
    await page.context().close();
  },

  adminPages: async ({ adminPage, logger }, use) => {
    await use(new PageManager(adminPage, adminPage.context(), logger));
  },

  translatorPages: async ({ translatorPage, logger }, use) => {
    await use(new PageManager(translatorPage, translatorPage.context(), logger));
  },

  reviewerPages: async ({ reviewerPage, logger }, use) => {
    await use(new PageManager(reviewerPage, reviewerPage.context(), logger));
  },

  ccCheckerPages: async ({ ccCheckerPage, logger }, use) => {
    await use(new PageManager(ccCheckerPage, ccCheckerPage.context(), logger));
  },
  
});

export { expect, PageManager };
