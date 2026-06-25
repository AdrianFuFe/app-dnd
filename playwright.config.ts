import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm build && pnpm preview',
		env: {
			APP_E2E: 'true'
		},
		port: 4173
	},
	testMatch: '**/*.e2e.{ts,js}'
});
