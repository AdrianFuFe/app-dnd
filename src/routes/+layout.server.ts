import { getLiveSupabaseConfigurationMessage } from '$lib/server/runtime/integration';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		runtimeMessage: getLiveSupabaseConfigurationMessage(locals.runtime),
		runtime: locals.runtime,
		session: locals.session
	};
};
