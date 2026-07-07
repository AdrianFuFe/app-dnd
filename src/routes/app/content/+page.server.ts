import { fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	listCharacterCreationCatalog,
	listExpandedContentCatalog
} from '$lib/server/repositories/catalog';
import {
	getAuthorizationContext,
	requirePermissionScopeAccess
} from '$lib/server/permissions/authorization';
import {
	createPrivateFeat,
	listPrivateFeatsForUser
} from '$lib/server/repositories/private-feats';
import {
	createPrivateFeatFormValues,
	flattenPrivateFeatFormErrors,
	privateFeatFormSchema
} from '$lib/schemas/content/private-feat-form.schema';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	if (!locals.supabase) {
		return {
			createdPrivateFeatName: url.searchParams.get('createdPrivateFeat'),
			createPrivateFeatValues: createPrivateFeatFormValues(),
			characterCatalog: {
				speciesOptions: [],
				subspeciesOptions: [],
				classOptions: [],
				subclassOptions: [],
				backgroundOptions: []
			},
			privateFeats: [],
			sharedCatalog: {
				species: [],
				subspecies: [],
				classes: [],
				subclasses: [],
				backgrounds: [],
				spells: [],
				feats: [],
				equipment: [],
				vocabularies: {
					abilities: [],
					languages: [],
					damageTypes: [],
					spellSchools: [],
					skillProficiencies: [],
					armorProficiencies: [],
					weaponProficiencies: [],
					toolProficiencies: [],
					savingThrowProficiencies: []
				}
			}
		};
	}

	const parentData = await parent();

	return {
		createdPrivateFeatName: url.searchParams.get('createdPrivateFeat'),
		createPrivateFeatValues: createPrivateFeatFormValues(),
		characterCatalog: await listCharacterCreationCatalog(locals.supabase),
		privateFeats: parentData.session
			? await listPrivateFeatsForUser(locals.supabase, parentData.session.user.id)
			: [],
		sharedCatalog: await listExpandedContentCatalog(locals.supabase)
	};
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/content');
		}

		if (!locals.supabase) {
			return fail(500, {
				createPrivateFeatFieldErrors: {},
				createPrivateFeatFormError: 'Supabase is not configured yet.',
				createPrivateFeatValues: createPrivateFeatFormValues()
			});
		}

		const authorization = await getAuthorizationContext(locals.supabase, locals.session.user.id);
		requirePermissionScopeAccess(authorization, 'private_content');

		const rawValues = Object.fromEntries(await request.formData());
		const values = createPrivateFeatFormValues(rawValues);
		const parsed = privateFeatFormSchema.safeParse(values);

		if (!parsed.success) {
			return fail(400, {
				createPrivateFeatFieldErrors: flattenPrivateFeatFormErrors(parsed.error),
				createPrivateFeatFormError: 'Please correct the highlighted private feat fields.',
				createPrivateFeatValues: values
			});
		}

		try {
			const feat = await createPrivateFeat(locals.supabase, locals.session.user.id, parsed.data);
			const createdPrivateFeat = encodeURIComponent(feat.name);

			throw redirect(303, `/app/content?createdPrivateFeat=${createdPrivateFeat}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			const formError =
				error instanceof Error
					? error.message
					: 'The private feat could not be created. Please try again.';

			return fail(400, {
				createPrivateFeatFieldErrors: {},
				createPrivateFeatFormError: formError,
				createPrivateFeatValues: values
			});
		}
	}
};
