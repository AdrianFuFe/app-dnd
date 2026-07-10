import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export type RuntimeMode = 'e2e-mock' | 'live-supabase';

export interface RuntimeIntegrationStatus {
	authBehavior: 'mock-session' | 'supabase-auth';
	dataBehavior: 'in-memory' | 'supabase';
	liveSupabaseConfigured: boolean;
	missingLiveEnv: string[];
	mode: RuntimeMode;
}

const LIVE_SUPABASE_ENV_KEYS = ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_ANON_KEY'] as const;

function hasNonEmptyValue(value: string | undefined): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

export function getRuntimeIntegrationStatus(): RuntimeIntegrationStatus {
	const missingLiveEnv = LIVE_SUPABASE_ENV_KEYS.filter(
		(key) => !hasNonEmptyValue(publicEnv[key])
	);
	const mode: RuntimeMode = env.APP_E2E === 'true' ? 'e2e-mock' : 'live-supabase';

	return {
		authBehavior: mode === 'e2e-mock' ? 'mock-session' : 'supabase-auth',
		dataBehavior: mode === 'e2e-mock' ? 'in-memory' : 'supabase',
		liveSupabaseConfigured: missingLiveEnv.length === 0,
		missingLiveEnv,
		mode
	};
}

export function getLiveSupabaseConfigurationMessage(
	status: Pick<RuntimeIntegrationStatus, 'mode' | 'missingLiveEnv'>
): string {
	const missingKeys = status.missingLiveEnv.join(', ');

	if (status.mode === 'e2e-mock') {
		return 'The app is running in APP_E2E mock mode. Live Supabase auth and data are bypassed in this mode.';
	}

	if (status.missingLiveEnv.length === 0) {
		return 'Live Supabase runtime is configured.';
	}

	return `Live Supabase runtime is not configured. Add ${missingKeys} to .env to use real auth and data.`;
}
