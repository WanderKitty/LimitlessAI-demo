import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

// Load environment variables from .env file
dotenv.config();
const AUDIO_FILE = process.env.AUDIO_FILE || 'utility/fake-mic.padded.wav';
const RESOLVED_AUDIO_FILE = path.isAbsolute(AUDIO_FILE)
  ? AUDIO_FILE
  : path.resolve(process.cwd(), AUDIO_FILE);
const baseArgs = [
  '--use-fake-device-for-media-stream',
  '--use-fake-ui-for-media-stream',
  '--autoplay-policy=no-user-gesture-required',
  '--allow-file-access-from-files',
];

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,
  use: {
    baseURL: 'https://www.limitless.ai/',
    storageState: '.auth/storageState.json',
    trace: 'on-first-retry',
    permissions: ['microphone', 'clipboard-read', 'clipboard-write'],
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'two speakers',
      grep: /\btwo speakers\b/i,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: [
            ...baseArgs,
            `--use-file-for-fake-audio-capture=${path.resolve('utility/twoSpeakers.wav')}`,
          ],
        },
      }
    },
    {
      name: 'one speaker',
      grep: /\bone speaker\b/i,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: [
            ...baseArgs,
            `--use-file-for-fake-audio-capture=${path.resolve('utility/oneSpeaker.wav')}`,
          ],
        },
      },
    },
    {
      name: 'three speakers',
      grep: /\bthree speakers\b/i,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: [
            ...baseArgs,
            `--use-file-for-fake-audio-capture=${path.resolve('utility/threeSpeakers.wav')}`,
          ],
          },
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
  globalSetup: require.resolve('./global-setup.ts'),
});
