import { chromium, FullConfig } from '@playwright/test';
import { LoginUsers } from '../../src/pages/login/loginSF_Users';
import * as fs from 'fs';
import * as path from 'path';
import { clearFrameworkLog, createLogger, pruneOldLogs, serializeError } from '../../src/utils/logger/logger';

const log = createLogger('global-setup');

/**
 * EXPERIMENTAL — persistent Chrome profile variant of global-setup.ts.
 *
 * Same 4-user login/refresh logic as global-setup.ts, except each role logs
 * in through its own persistent Chrome profile (chromium.launchPersistentContext)
 * with a locked userAgent/locale/timezone. This keeps Google's "trusted device"
 * cookies across runs so the phone tap-number challenge only appears once per
 * role (on that role's very first login), instead of on every run.
 *
 * To try this out, point playwright.config.ts's globalSetup at this file:
 *   globalSetup: require.resolve('./tests/global_auth/global-setup.persistent-profile'),
 * Once verified, merge the changes back into global-setup.ts and delete this file.
 */

const baseurl = process.env.BASE_URL ?? '';
const AUTH_DIR      = path.resolve('.auth');
// Persisted per-role Chrome profiles so Google recognizes the device and skips the tap-number challenge
const PROFILE_ROOT   = path.resolve('.auth', '.chrome-profiles');
const FIXED_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

interface UserConfig {
  role:     string;
  email:    string;
  password: string;
  file:     string;
}

const USERS: UserConfig[] = [
  {
    role:     'admin',
    email:    process.env.SF_ADMIN_EMAIL     ?? '',
    password: process.env.SF_ADMIN_PASSWORD  ?? '',
    file:     path.join(AUTH_DIR, 'sf-admin.json'),
  },
  {
    role:     'translator',
    email:    process.env.SF_TRANSLATOR_EMAIL    ?? '',
    password: process.env.SF_TRANSLATOR_PASSWORD ?? '',
    file:     path.join(AUTH_DIR, 'sf-translator.json'),
  },
  {
    role:     'reviewer',
    email:    process.env.SF_REVIEWER_EMAIL    ?? '',
    password: process.env.SF_REVIEWER_PASSWORD ?? '',
    file:     path.join(AUTH_DIR, 'sf-reviewer.json'),
  },
  {
    role:     'cc_checker',
    email:    process.env.SF_CC_CHECKER_EMAIL    ?? '',
    password: process.env.SF_CC_CHECKER_PASSWORD ?? '',
    file:     path.join(AUTH_DIR, 'sf-cc-checker.json'),
  },
];

/**
 * Runs the Auth0 login flow for one user through a persistent Chrome profile
 * and writes the authenticated session to disk.
 */
async function performLogin(user: UserConfig): Promise<void> {
  if (!user.email || !user.password) {
    throw new Error(
      `Missing credentials for role "${user.role}". ` +
      `Set SF_${user.role.toUpperCase()}_EMAIL and SF_${user.role.toUpperCase()}_PASSWORD.`,
    );
  }

  const userDataDir = path.join(PROFILE_ROOT, user.role);
  fs.mkdirSync(userDataDir, { recursive: true });

  // launchPersistentContext (not launch + newContext) is what actually keeps the profile/cookies across runs
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless:   true,
    args:       ['--no-sandbox'],
    viewport:   { width: 1280, height: 720 },
    userAgent:  FIXED_USER_AGENT,
    locale:     'en-US',
    timezoneId: 'America/New_York',
  });
  const page = await context.newPage();
  const loginUsers = new LoginUsers(page, baseurl);

  try {
    if (user.role === 'cc_checker') {
      await loginUsers.CCLoginPersistentProfile();
    } else {
      await loginUsers.paratextLoginPersistentProfile(user.email, user.password);
    }

    await context.storageState({ path: user.file });
    log.info(`[${user.role}] storageState saved`, { file: user.file });
  } finally {
    await context.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main per-user decision logic
// ─────────────────────────────────────────────────────────────────────────────

async function loginUser(user: UserConfig): Promise<void> {

  // ── no credentials in .env → skip this role entirely ──────────────────────
  if (!user.email || !user.password) {
    log.warn(`[${user.role}] skipping login - no credentials set in .env`);
    return;
  }

  // Trust the persisted Chrome profile instead of the exported storageState's
  // token expiry; Google/Auth0 recognizes the device and re-auths silently
  // even after the old JSON's tokens have expired.
  const userDataDir = path.join(PROFILE_ROOT, user.role);
  const hasProfile = fs.existsSync(userDataDir) && fs.existsSync(user.file);
  log.info(`[${user.role}] ${hasProfile ? 'reusing trusted profile' : 'first-time login'} - logging in`);
  await performLogin(user);
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

async function globalSetup(_config: FullConfig): Promise<void> {
  clearFrameworkLog();
  pruneOldLogs();
  log.info('Global authentication setup started (persistent-profile variant)');
  log.debug('Global setup configuration', {
    baseUrl: baseurl,
    selectedRole: process.env.PLAYWRIGHT_ROLE ?? 'all',
    users: USERS.map(user => user.role),
  });
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.mkdirSync(PROFILE_ROOT, { recursive: true });

  try {
    const selectedRole = process.env.PLAYWRIGHT_ROLE;
    const usersToLogin = selectedRole
      ? USERS.filter((user) => user.role === selectedRole)
      : USERS;

    if (selectedRole && usersToLogin.length === 0) {
      throw new Error(`Unknown PLAYWRIGHT_ROLE: "${selectedRole}"`);
    }

    for (const user of usersToLogin) {
      log.debug(`[${user.role}] checking authentication state`, { file: user.file });
      await loginUser(user);
    }
  } catch (error) {
    log.error('Global authentication setup failed', { error: serializeError(error) });
    log.debug('Global setup failure diagnostics', { error: serializeError(error) });
    throw error;
  }

  log.info('Session check complete. Starting test run.');
}

export default globalSetup;
