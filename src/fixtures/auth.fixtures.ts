import { test as base, expect, type Page, type TestInfo } from '@playwright/test';
import { mergeVideos, type RecordedVideo } from '../utils/video/mergeVideos';
import * as path from 'path';
import * as fs from 'fs';
import { createLogger, getSpecLogFilePath, releaseLogger, serializeError, writeLog } from '../utils/logger/logger';
import type winston from 'winston';
import { PageManager } from '../pages/pageManager';
const log = createLogger('auth.fixtures');

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
  videoTracker: VideoTracker;
  adminRole:    Page;
  translatorRole:   Page;
  reviewerRole: Page;
  ccCheckerRole: Page;

  // Page Managers per role
  adminRolePages: PageManager;
  translatorRolePages: PageManager;
  reviewerRolePages: PageManager;
  ccCheckerRolePages: PageManager;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Run global setup first.`);
  }
  return path.resolve(value);
}

const AUTH = {
  admin:    requireEnv('ADMIN'),
  translator:   requireEnv('TRANSLATOR'),
  reviewer: requireEnv('REVIEWER'),
  ccChecker: requireEnv('CC_CHECKER'),
} as const;

type VideoMode = 'off' | 'on' | 'retain-on-failure' | 'on-first-retry';

/** Collects the per-role recordings of one test so they can be merged into a single file per spec. */
interface VideoTracker {
  record: boolean;
  dir: string;
  size?: { width: number; height: number };
  clips: { role: string; page: Page; startedAt: number }[];
}

function resolveVideoMode(option: unknown): VideoMode {
  if (typeof option === 'string') return option as VideoMode;
  if (option && typeof option === 'object' && 'mode' in option) return (option as { mode: VideoMode }).mode;
  return 'off';
}

function shouldRecordVideo(mode: VideoMode, testInfo: TestInfo): boolean {
  return mode === 'on' || mode === 'retain-on-failure' || (mode === 'on-first-retry' && testInfo.retry === 1);
}

const slug = (text: string): string => text.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

/**
 * Creates a new browser context pre-loaded with the given storageState.
 * Contexts from browser.newContext() don't inherit the config `use.video`, so it is applied here.
 */
async function makeAuthPage(
  browser: import('@playwright/test').Browser,
  storageStatePath: string,
  tracker: VideoTracker,
  role: string,
): Promise<Page> {
  const viewport = { width: 1440, height: 900 };
  const context = await browser.newContext({
    storageState: storageStatePath,
    viewport,
    ...(tracker.record && { recordVideo: { dir: path.join(tracker.dir, role), size: tracker.size ?? viewport } }),
  });
  const page = await context.newPage();
  if (tracker.record) tracker.clips.push({ role, page, startedAt: Date.now() });
  return page;
}

/**
 * Runs after all role contexts are closed: produces ONE video per test (spec),
 * merging the roles side by side when more than one role was used, and keeps it per `use.video`.
 */
async function finalizeVideos(tracker: VideoTracker, testInfo: TestInfo, mode: VideoMode): Promise<void> {
  if (!tracker.clips.length) return;

  const failed = testInfo.status !== testInfo.expectedStatus;
  const keep = mode === 'on' || mode === 'on-first-retry' || failed;

  const clips: RecordedVideo[] = [];
  for (const { role, page, startedAt } of tracker.clips) {
    const file = await page.video()?.path().catch(() => undefined);
    if (file && fs.existsSync(file)) clips.push({ role, file, startedAt });
  }

  if (keep && clips.length) {
    const specName = path.basename(testInfo.file).replace(/\.(spec|test)\.[jt]s$/, '');
    const output = testInfo.outputPath(`${specName}-${slug(testInfo.title)}.webm`);
    let attached = false;
    if (clips.length === 1) {
      fs.copyFileSync(clips[0].file, output);
      attached = true;
    } else {
      attached = mergeVideos(clips, output);
    }
    if (attached) {
      await testInfo.attach('video', { path: output, contentType: 'video/webm' });
    } else {
      for (const clip of clips) {
        await testInfo.attach(`video-${clip.role}`, { path: clip.file, contentType: 'video/webm' });
      }
      return; // keep the raw clips since they were attached
    }
  }
  fs.rmSync(tracker.dir, { recursive: true, force: true });
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

function checkAuthentication(SESSION_FILEPATH: string): void {
  const sessionFile = path.resolve(SESSION_FILEPATH);
  // Step 1: Check file exists on disk before use the page
  if (!fs.existsSync(sessionFile)) {
    throw new Error(`Auth session not found: ${sessionFile}. Run global setup first.`);
  }else{
    log.info(`session.json found at: ${sessionFile}`);
  }
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

  videoTracker: async ({}, use, testInfo) => {
    const videoOption = testInfo.project.use.video;
    const mode = resolveVideoMode(videoOption);
    const tracker: VideoTracker = {
      record: shouldRecordVideo(mode, testInfo),
      dir: testInfo.outputPath('role-videos'),
      size: typeof videoOption === 'object' ? videoOption?.size : undefined,
      clips: [],
    };
    await use(tracker);
    await finalizeVideos(tracker, testInfo, mode);
  },

  adminRole: async ({ browser, logger, videoTracker }, use) => {
    checkAuthentication(AUTH.admin);
    const page = await makeAuthPage(browser, AUTH.admin, videoTracker, 'admin');
    addPageDiagnostics(page, logger, 'admin');
    await use(page);
    await page.context().close();
  },

  translatorRole: async ({ browser, logger, videoTracker }, use) => {
    checkAuthentication(AUTH.translator);
    const page = await makeAuthPage(browser, AUTH.translator, videoTracker, 'translator');
    addPageDiagnostics(page, logger, 'translator');
    await use(page);
    await page.context().close();
  },

  reviewerRole: async ({ browser, logger, videoTracker }, use) => {
    checkAuthentication(AUTH.reviewer);
    const page = await makeAuthPage(browser, AUTH.reviewer, videoTracker, 'reviewer');
    addPageDiagnostics(page, logger, 'reviewer');
    await use(page);
    await page.context().close();
  },

  ccCheckerRole: async ({ browser, logger, videoTracker }, use) => {
    checkAuthentication(AUTH.ccChecker);
    const page = await makeAuthPage(browser, AUTH.ccChecker, videoTracker, 'cc-checker');
    addPageDiagnostics(page, logger, 'cc-checker');
    await use(page);
    await page.context().close();
  },

  adminRolePages: async ({ adminRole, logger }, use) => {
    await use(new PageManager(adminRole, adminRole.context(), logger));
  },

  translatorRolePages: async ({ translatorRole, logger }, use) => {
    await use(new PageManager(translatorRole, translatorRole.context(), logger));
  },

  reviewerRolePages: async ({ reviewerRole, logger }, use) => {
    await use(new PageManager(reviewerRole, reviewerRole.context(), logger));
  },

  ccCheckerRolePages: async ({ ccCheckerRole, logger }, use) => {
    await use(new PageManager(ccCheckerRole, ccCheckerRole.context(), logger));
  },
  
});

export { expect, PageManager };
