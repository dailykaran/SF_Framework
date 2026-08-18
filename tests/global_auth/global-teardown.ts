import * as fs from 'fs';
import * as path from 'path';

/**
 * Global Teardown — runs ONCE after all projects finish.
 *
 * Removes .auth/ session files so stale credentials don't persist
 * between CI runs. Remove this file entirely if you prefer to keep
 * sessions cached locally (faster re-runs during development).
 */

const AUTH_DIR = path.resolve('.auth');

async function globalTeardown(): Promise<void> {
  if (!fs.existsSync(AUTH_DIR)) return;

/*   const files = fs
    .readdirSync(AUTH_DIR)
    .filter(f => f.endsWith('.json'));

  for (const file of files) {
    fs.rmSync(path.join(AUTH_DIR, file), { force: true });
    console.log(`🗑️   Removed session: ${file}`);
  }

  console.log('\n🧹  Auth teardown complete.\n'); */
}

export default globalTeardown;
