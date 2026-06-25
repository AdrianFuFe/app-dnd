import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { resetE2EMockState } from '$lib/server/e2e/mock-app';
import { isE2EMode } from '$lib/server/e2e/mode';

export const POST: RequestHandler = async () => {
	if (!isE2EMode()) {
		throw error(404, 'Not found');
	}

	resetE2EMockState();

	return json({ ok: true });
};
