import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as path from 'path';
import { createLogger, getSpecLogFilePath, releaseLogger, serializeError, writeLog } from './logger';

export default class PlaywrightLoggerReporter implements Reporter {
  onTestBegin(test: TestCase): void {
    const log = this.getTestLogger(test);
    log.debug('Test execution started', { title: test.title, project: test.parent.project()?.name });
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    const log = this.getTestLogger(test);
    const errors = result.errors.map(serializeError);

    if (errors.length > 0) {
      await writeLog(log, 'error', 'Test execution failed', {
        status: result.status,
        expectedStatus: test.expectedStatus,
        errors,
      });
      log.debug('Test execution failure diagnostics', {
        retry: result.retry,
        duration: result.duration,
        errors,
      });
    }
    releaseLogger(log);
  }

  private getTestLogger(test: TestCase) {
    const specFile = path.relative(process.cwd(), test.location.file);
    const context = `${specFile}:${test.parent.project()?.name ?? 'unknown'}:${test.id}`;
    return createLogger(context, getSpecLogFilePath(test.location.file));
  }
}