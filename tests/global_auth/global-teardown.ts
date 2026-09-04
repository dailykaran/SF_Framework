import * as fs from 'fs';
import * as path from 'path';
import { appendFrameworkLogToSpecLogs, createLogger, getFrameworkLogSize } from '../../src/utils/logger/logger';

const log = createLogger('global-teardown');

/**
 * Global Teardown — runs ONCE after all projects finish.
 *
 * Removes .auth/ session files so stale credentials don't persist
 * between CI runs. Remove this file entirely if you prefer to keep
 * sessions cached locally (faster re-runs during development).
 */

const AUTH_DIR = path.resolve('.auth');

async function globalTeardown(): Promise<void> {
  const startOffset = getFrameworkLogSize();
  log.info('Global authentication teardown started');
  
/*   if (!fs.existsSync(AUTH_DIR)) return;

   const files = fs
    .readdirSync(AUTH_DIR)
    .filter(f => f.endsWith('.json'));

  for (const file of files) {
    fs.rmSync(path.join(AUTH_DIR, file), { force: true });
    log.info('Removed session', { file });
  } */
  // End of session removal loop
  log.info('Auth teardown complete');
  await appendFrameworkLogToSpecLogs(log, startOffset);
}

export default globalTeardown;
