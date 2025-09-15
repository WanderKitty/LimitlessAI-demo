import { chromium, FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
dotenv.config();

const ENV = {
  storageStatePath: process.env.STORAGE_STATE || '.auth/storageState.json',
  userDataDir: process.env.USER_DATA_DIR || '.auth/chrome-profile',
  appUrl: process.env.APP_URL || 'https://www.limitless.ai/',
  postLoginNeedle: process.env.POST_LOGIN_URL_CONTAINS || '/',
  stateMaxAgeDays: Number(process.env.STATE_MAX_AGE_DAYS || 25),
  loginTimeoutMs: Number(process.env.LOGIN_TIMEOUT_MS || 10 * 60 * 1000),
};

function log(...args: unknown[]) {
  console.log('[global-setup]', ...args);
}

function isFileFresh(filePath: string, maxAgeDays: number): boolean {
  try {
    const st = fs.statSync(filePath);
    const ageDays = (Date.now() - st.mtimeMs) / (1000 * 60 * 60 * 24);
    return ageDays <= maxAgeDays;
  } catch {
    return false;
  }
}

function ensurePaths() {
  fs.mkdirSync(path.dirname(ENV.storageStatePath), { recursive: true });
  fs.mkdirSync(ENV.userDataDir, { recursive: true });
}

/** Adds an init script that disables IndexedDB so apps fall back to localStorage. */
async function disableIndexedDb(context: any) {
  await context.addInitScript(() => {
    const originalIdb = self.indexedDB;
    try {
      Object.defineProperty(self, 'indexedDB', {
        configurable: true,
        get() { return undefined; }
      });
    } catch {}
    if (originalIdb) {
      const proto = Object.getPrototypeOf(originalIdb);
      for (const method of ['open', 'deleteDatabase', 'databases']) {
        try { (proto as any)[method] = () => { throw new Error('IndexedDB disabled'); }; } catch {}
      }
    }
  });
}

/** Waits until the page URL contains the given needle or times out. */
async function waitForPostLoginUrl(page: any, needle: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (page.url().includes(needle)) return;
    await page.waitForTimeout(1000);
  }
  throw new Error('Login not detected within timeout.');
}

module.exports = async function globalSetup(_: FullConfig) {
  if (isFileFresh(ENV.storageStatePath, ENV.stateMaxAgeDays)) return;

  ensurePaths();

  const context = await chromium.launchPersistentContext(ENV.userDataDir, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1280, height: 840 },
  });

  try {
    await disableIndexedDb(context);

    const page = await context.newPage();
    await page.goto(ENV.appUrl, { waitUntil: 'domcontentloaded' });

    log('Please complete login manually in the opened browser.');
    log('Watching for URL containing:', ENV.postLoginNeedle);

    await waitForPostLoginUrl(page, ENV.postLoginNeedle, ENV.loginTimeoutMs);

    await context.storageState({ path: ENV.storageStatePath });
    log('Saved storage state to', ENV.storageStatePath);
  } finally {
    await context.close();
  }
};
