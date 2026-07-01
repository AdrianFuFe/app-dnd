import { defineConfig } from '@playwright/test';

export default defineConfig({
	globalSetup: './tests/e2e/global-setup.ts',
	globalTeardown: './tests/e2e/global-teardown.ts',
	use: {
		baseURL: 'http://127.0.0.1:4173'
	},
	testMatch: '**/*.e2e.{ts,js}'
});
