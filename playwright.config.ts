import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: 1,

  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },

  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  timeout: 30_000
});
