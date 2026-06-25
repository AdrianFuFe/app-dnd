import { env } from '$env/dynamic/private';

export function isE2EMode(): boolean {
	return env.APP_E2E === 'true';
}
