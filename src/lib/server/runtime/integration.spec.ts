import { describe, expect, it } from 'vitest';
import { getLiveSupabaseConfigurationMessage, getRuntimeIntegrationStatus } from './integration';

describe('getRuntimeIntegrationStatus', () => {
	it('reports missing live Supabase configuration outside E2E mode', () => {
		const status = getRuntimeIntegrationStatus();

		expect(status.mode).toBe('live-supabase');
		expect(status.authBehavior).toBe('supabase-auth');
		expect(status.dataBehavior).toBe('supabase');
		expect(status.liveSupabaseConfigured).toBe(false);
		expect(status.missingLiveEnv).toEqual(
			expect.arrayContaining(['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY'])
		);
	});
});

describe('getLiveSupabaseConfigurationMessage', () => {
	it('explains the missing live configuration keys', () => {
		expect(
			getLiveSupabaseConfigurationMessage({
				mode: 'live-supabase',
				missingLiveEnv: ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY']
			})
		).toContain('PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY');
	});

	it('explains that E2E mode bypasses live Supabase', () => {
		expect(
			getLiveSupabaseConfigurationMessage({
				mode: 'e2e-mock',
				missingLiveEnv: []
			})
		).toContain('APP_E2E mock mode');
	});
});
