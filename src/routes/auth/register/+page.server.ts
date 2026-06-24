import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { authFormSchema } from '$lib/schemas/auth/auth-form.schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) {
		throw redirect(302, '/app');
	}
};

export const actions: Actions = {
	default: async ({ locals, request, url }) => {
		if (!locals.supabase) {
			return fail(500, {
				error: 'Supabase is not configured yet.'
			});
		}

		const formData = Object.fromEntries(await request.formData());
		const parsed = authFormSchema.safeParse(formData);

		if (!parsed.success) {
			return fail(400, {
				error: 'Please enter a valid email and password.',
				email: String(formData.email ?? '')
			});
		}

		const emailRedirectTo = new URL('/auth/login', url).toString();
		const { data, error } = await locals.supabase.auth.signUp({
			...parsed.data,
			options: {
				emailRedirectTo
			}
		});

		if (error) {
			return fail(400, {
				error: error.message,
				email: parsed.data.email
			});
		}

		if (!data.session) {
			return {
				message: 'Check your email to confirm your account.',
				email: parsed.data.email
			};
		}

		throw redirect(302, '/app');
	}
};
