import { defineConfig } from '@playwright/test';

export default defineConfig({
	globalSetup: './tests/e2e/global-setup.ts',
	globalTeardown: './tests/e2e/global-teardown.ts',
	// The APP_E2E harness stores mutable state in-process, so resets are global.
	// Keep one worker until the mock runtime is isolated per browser session.
	workers: 1,
	use: {
		baseURL: 'http://localhost:4173'
	},
	testMatch: '**/*.e2e.{ts,js}'
});
