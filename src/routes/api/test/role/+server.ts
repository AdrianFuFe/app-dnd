import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isE2EMode } from '$lib/server/e2e/mode';
import { setE2EMockGlobalRole } from '$lib/server/e2e/mock-app';
import { GLOBAL_ROLES, type GlobalRole } from '$lib/types/permissions/permissions';

function parseRole(role: string | null): GlobalRole {
	if (!role || !GLOBAL_ROLES.includes(role as GlobalRole)) {
		throw error(400, 'Invalid role');
	}

	return role as GlobalRole;
}

export const GET: RequestHandler = async ({ cookies, url }) => {
	if (!isE2EMode()) {
		throw error(404, 'Not found');
	}

	const role = parseRole(url.searchParams.get('role'));

	setE2EMockGlobalRole(role);
	cookies.set('app-e2e-role', role, {
		httpOnly: false,
		path: '/',
		sameSite: 'lax'
	});

	return json({ ok: true, role });
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	if (!isE2EMode()) {
		throw error(404, 'Not found');
	}

	const formData = await request.formData();
	const role = parseRole(formData.get('role')?.toString() ?? null);

	setE2EMockGlobalRole(role);
	cookies.set('app-e2e-role', role, {
		httpOnly: false,
		path: '/',
		sameSite: 'lax'
	});

	return json({ ok: true, role });
};
