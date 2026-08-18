import { chromium, FullConfig } from '@playwright/test';
import { LoginUsers } from '../../src/pages/loginSF_Users'; 
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global Setup — runs ONCE before all projects.
 *
 * For each of the 4 users the logic is:
 *
 *  ┌─ Does .auth/sf-{role}.json exist? ──────────────────────────────────────┐
 *  │                                                                          │
 *  │  NO  → performLogin()  → save new JSON                                  │
 *  │                                                                          │
 *  │  YES → isStorageStateValid()?                                            │
 *  │          checks 3 expiry sources:                                        │
 *  │            1. Cookie `expires` timestamps                                │
 *  │            2. Auth0 SPA SDK `@@auth0spajs@@` → expiresAt                │
 *  │            3. Raw JWT `access_token` / `id_token` → exp claim           │
 *  │                                                                          │
 *  │        VALID   → skip (reuse existing JSON)                              │
 *  │        EXPIRED → performLogin() → overwrite JSON with fresh session      │
 *  └──────────────────────────────────────────────────────────────────────────┘
 *
 * All 4 users run through the same logic in parallel.
 */

const baseurl = process.env.BASE_URL ?? '';
const AUTH_DIR  = path.resolve('.auth');

// Re-login this many seconds before actual expiry so tokens never expire
// mid-run. Auth0 access tokens default to 3600 s (1 h); 5 min buffer is safe.
const EXPIRY_BUFFER_SECONDS = 300;

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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely decodes a base64url JWT segment to UTF-8.
 * Handles padding and url-safe character substitutions without
 * extra dependencies (works on all Node.js 14+ runtimes).
 */
function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded  = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  return Buffer.from(padded, 'base64').toString('utf-8');
}

/**
 * Validates the 3 expiry sources inside an existing storageState JSON.
 *
 * IMPORTANT: only call this after confirming the file exists.
 * This function does NOT check fs.existsSync — that is the caller's job.
 *
 * Check 1 — Cookie `expires` timestamps
 *   Playwright stores each cookie's expiry as a Unix timestamp (seconds).
 *   A value of -1 means a session cookie with no explicit expiry; skip those.
 *
 * Check 2 — Auth0 SPA SDK token cache
 *   Auth0 writes tokens to localStorage under keys starting with @@auth0spajs@@.
 *   The value JSON contains `expiresAt` (Unix seconds).
 *
 * Check 3 — Raw JWT fallback
 *   For apps that store access_token / id_token directly in localStorage
 *   (not via the SPA SDK). Decodes the JWT payload and checks the `exp` claim.
 *
 * Returns true  → all checks passed, session is still valid
 * Returns false → at least one source is expired, or JSON is malformed
 */
function isStorageStateValid(filePath: string): boolean {
  let state: {
    cookies?: Array<{ name: string; expires: number }>;
    origins?: Array<{ localStorage?: Array<{ name: string; value: string }> }>;
  };

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return false;
    state = JSON.parse(raw);
  } catch {
    return false; // unreadable or malformed JSON — treat as expired
  }

  // Anything expiring within the buffer window is treated as already expired
  const cutoff = Math.floor(Date.now() / 1000) + EXPIRY_BUFFER_SECONDS;

  // ── Check 1: Cookie expiry ────────────────────────────────────────────────
  for (const cookie of (state.cookies ?? [])) {
    if (
      typeof cookie.expires === 'number' &&
      cookie.expires !== -1 &&          // -1 = session cookie, no expiry
      cookie.expires < cutoff
    ) {
      console.log(
        `   ⚠️  [cookie]     "${cookie.name}" expired at ` +
        `${new Date(cookie.expires * 1000).toISOString()}`,
      );
      return false;
    }
  }

  for (const origin of (state.origins ?? [])) {
    for (const item of (origin.localStorage ?? [])) {

      // ── Check 2: Auth0 SPA SDK token cache ─────────────────────────────
      if (item.name?.startsWith('@@auth0spajs@@')) {
        try {
          const cache = JSON.parse(item.value) as { expiresAt?: number };
          if (typeof cache.expiresAt === 'number' && cache.expiresAt < cutoff) {
            console.log(
              `   ⚠️  [auth0 cache] expiresAt ` +
              `${new Date(cache.expiresAt * 1000).toISOString()}`,
            );
            return false;
          }
        } catch {
          return false; // unparseable cache → treat as expired
        }
      }

      // ── Check 3: Raw JWT exp claim ──────────────────────────────────────
      if (item.name === 'access_token' || item.name === 'id_token') {
        const parts = String(item.value ?? '').split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(decodeBase64Url(parts[1])) as { exp?: number };
            if (typeof payload.exp === 'number' && payload.exp < cutoff) {
              console.log(
                `   ⚠️  [jwt]         "${item.name}" exp reached at ` +
                `${new Date(payload.exp * 1000).toISOString()}`,
              );
              return false;
            }
          } catch {
            return false; // malformed JWT → treat as expired
          }
        }
      }
    }
  }

  return true; // all 3 checks passed
}

/**
 * Runs the Auth0 login flow for one user and writes the authenticated
 * session to disk. Called by loginUser when a fresh session is needed.
 */
async function performLogin(
  browser: import('@playwright/test').Browser,
  user: UserConfig,
): Promise<void> {
  if (!user.email || !user.password) {
    throw new Error(
      `Missing credentials for role "${user.role}". ` +
      `Set SF_${user.role.toUpperCase()}_EMAIL and SF_${user.role.toUpperCase()}_PASSWORD.`,
    );
  }

  const context = await browser.newContext();
  const page    = await context.newPage();
  const loginUsers = new LoginUsers(page, baseurl);

  try {
    if (user.role === 'cc_checker') {
      await loginUsers.CCLogin();
    } else {
      await loginUsers.paratextLogin(user.email, user.password);
    }

    await context.storageState({ path: user.file });
    console.log(`[${user.role}] storageState saved → ${user.file}`);
  } finally {
    await context.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main per-user decision logic
// ─────────────────────────────────────────────────────────────────────────────

async function loginUser(
  browser: import('@playwright/test').Browser,
  user: UserConfig,
): Promise<void> {

  // ── Path 1: JSON does not exist → login and create file ──────────────────
  if (!fs.existsSync(user.file)) {
    console.log(`[${user.role}] no session file — logging in`);
    await performLogin(browser, user);
    return;
  }

  // ── Path 2: JSON exists → validate all 3 expiry sources ──────────────────
  if (isStorageStateValid(user.file)) {
    console.log(`[${user.role}] session valid — skipping login`);
    return;
  }

  // At least one expiry check failed → overwrite with a fresh session
  console.log(`[${user.role}] session expired — re-logging in`);
  await performLogin(browser, user);
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────

async function globalSetup(_config: FullConfig): Promise<void> {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const browser = await chromium.launch();

  try {
    // Same logic runs for all 4 users in parallel
    await Promise.all(USERS.map(user => loginUser(browser, user)));
  } finally {
    await browser.close();
  }

  console.log('\n  Session check complete. Starting test run...\n');
}

export default globalSetup;

