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
	createSharedFeat,
	derivePrivateFeatFromSharedCatalog,
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
			derivedPrivateFeatName: url.searchParams.get('derivedPrivateFeat'),
			publishedSharedFeatName: url.searchParams.get('publishedSharedFeat'),
			publishedSystemFeatName: url.searchParams.get('publishedSystemFeat'),
			createPrivateFeatValues: createPrivateFeatFormValues(),
			roleOperations: {
				canPublishSharedFeats: false,
				canPublishSystemFeats: false
			},
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
		derivedPrivateFeatName: url.searchParams.get('derivedPrivateFeat'),
		publishedSharedFeatName: url.searchParams.get('publishedSharedFeat'),
		publishedSystemFeatName: url.searchParams.get('publishedSystemFeat'),
		createPrivateFeatValues: createPrivateFeatFormValues(),
		roleOperations: {
			canPublishSharedFeats:
				parentData.authorization?.globalRole === 'content_editor' ||
				parentData.authorization?.globalRole === 'admin',
			canPublishSystemFeats: parentData.authorization?.globalRole === 'admin'
		},
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
		const parsedForm = await parsePrivateFeatCreateForm(request);

		if ('response' in parsedForm) {
			return parsedForm.response;
		}

		try {
			const feat = await createPrivateFeat(
				locals.supabase,
				locals.session.user.id,
				parsedForm.data
			);
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
				createPrivateFeatValues: parsedForm.values
			});
		}
	},
	deriveFeat: async ({ locals, request }) => {
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

		const formData = await request.formData();
		const sharedFeatId = formData.get('sharedFeatId');

		if (typeof sharedFeatId !== 'string' || sharedFeatId.trim().length === 0) {
			return fail(400, {
				createPrivateFeatFieldErrors: {},
				createPrivateFeatFormError: 'Please choose a valid shared feat to copy.',
				createPrivateFeatValues: createPrivateFeatFormValues()
			});
		}

		try {
			const feat = await derivePrivateFeatFromSharedCatalog(
				locals.supabase,
				locals.session.user.id,
				{ sharedFeatId }
			);
			const derivedPrivateFeat = encodeURIComponent(feat.name);

			throw redirect(303, `/app/content?derivedPrivateFeat=${derivedPrivateFeat}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			return fail(400, {
				createPrivateFeatFieldErrors: {},
				createPrivateFeatFormError:
					error instanceof Error
						? error.message
						: 'The shared feat could not be copied into your private content.',
				createPrivateFeatValues: createPrivateFeatFormValues()
			});
		}
	},
	publishSharedFeat: async ({ locals, request }) => {
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
		requirePermissionScopeAccess(authorization, 'shared_content');

		const parsedForm = await parsePrivateFeatCreateForm(request);

		if ('response' in parsedForm) {
			return parsedForm.response;
		}

		try {
			const feat = await createSharedFeat(locals.supabase, locals.session.user.id, {
				...parsedForm.data,
				visibility: 'shared',
				isSystemContent: false
			});
			const publishedSharedFeat = encodeURIComponent(feat.name);

			throw redirect(303, `/app/content?publishedSharedFeat=${publishedSharedFeat}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			return fail(400, {
				createPrivateFeatFieldErrors: {},
				createPrivateFeatFormError:
					error instanceof Error
						? error.message
						: 'The feat could not be published to shared content.',
				createPrivateFeatValues: parsedForm.values
			});
		}
	},
	publishSystemFeat: async ({ locals, request }) => {
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
		requirePermissionScopeAccess(authorization, 'system_content');

		const parsedForm = await parsePrivateFeatCreateForm(request);

		if ('response' in parsedForm) {
			return parsedForm.response;
		}

		try {
			const feat = await createSharedFeat(locals.supabase, locals.session.user.id, {
				...parsedForm.data,
				visibility: 'public',
				isSystemContent: true
			});
			const publishedSystemFeat = encodeURIComponent(feat.name);

			throw redirect(303, `/app/content?publishedSystemFeat=${publishedSystemFeat}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			return fail(400, {
				createPrivateFeatFieldErrors: {},
				createPrivateFeatFormError:
					error instanceof Error
						? error.message
						: 'The feat could not be published as system content.',
				createPrivateFeatValues: parsedForm.values
			});
		}
	}
};

async function parsePrivateFeatCreateForm(request: Request) {
	const rawValues = Object.fromEntries(await request.formData());
	const values = createPrivateFeatFormValues(rawValues);
	const parsed = privateFeatFormSchema.safeParse(values);

	if (!parsed.success) {
		return {
			response: fail(400, {
				createPrivateFeatFieldErrors: flattenPrivateFeatFormErrors(parsed.error),
				createPrivateFeatFormError: 'Please correct the highlighted private feat fields.',
				createPrivateFeatValues: values
			})
		};
	}

	return {
		data: parsed.data,
		values
	};
}
