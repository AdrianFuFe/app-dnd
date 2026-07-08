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
	deleteManagedSharedFeat,
	derivePrivateFeatFromSharedCatalog,
	listManagedSharedFeats,
	listPrivateFeatsForUser,
	retireManagedSharedFeat,
	updateManagedSharedFeat
} from '$lib/server/repositories/private-feats';
import {
	createPrivateFeatFormValues,
	createPrivateFeatFormValuesFromInput,
	flattenPrivateFeatFormErrors,
	privateFeatFormSchema
} from '$lib/schemas/content/private-feat-form.schema';
import {
	createPrivateSpell,
	derivePrivateSpellFromSharedCatalog,
	listPrivateSpellsForUser
} from '$lib/server/repositories/private-spells';
import {
	createPrivateSpellFormValues,
	flattenPrivateSpellFormErrors,
	privateSpellFormSchema
} from '$lib/schemas/content/private-spell-form.schema';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	if (!locals.supabase) {
		return {
			createdPrivateFeatName: url.searchParams.get('createdPrivateFeat'),
			createdPrivateSpellName: url.searchParams.get('createdPrivateSpell'),
			derivedPrivateFeatName: url.searchParams.get('derivedPrivateFeat'),
			derivedPrivateSpellName: url.searchParams.get('derivedPrivateSpell'),
			publishedSharedFeatName: url.searchParams.get('publishedSharedFeat'),
			publishedSystemFeatName: url.searchParams.get('publishedSystemFeat'),
			updatedSharedFeatName: url.searchParams.get('updatedSharedFeat'),
			retiredSharedFeatName: url.searchParams.get('retiredSharedFeat'),
			deletedSharedFeatName: url.searchParams.get('deletedSharedFeat'),
			createPrivateFeatValues: createPrivateFeatFormValues(),
			createPrivateSpellValues: createPrivateSpellFormValues(),
			editSharedFeatId: null,
			editSharedFeatValues: createPrivateFeatFormValues(),
			roleOperations: {
				canPublishSharedFeats: false,
				canPublishSystemFeats: false,
				canMaintainSharedFeats: false,
				canMaintainSystemFeats: false
			},
			characterCatalog: {
				speciesOptions: [],
				subspeciesOptions: [],
				classOptions: [],
				subclassOptions: [],
				backgroundOptions: []
			},
			manageableSharedFeats: [],
			privateFeats: [],
			privateSpells: [],
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
	const manageableSharedFeats =
		parentData.authorization &&
		(parentData.authorization.globalRole === 'content_editor' ||
			parentData.authorization.globalRole === 'admin')
			? await listManagedSharedFeats(locals.supabase, parentData.authorization)
			: [];
	const editSharedFeatId = url.searchParams.get('editSharedFeat');
	const editableSharedFeat =
		typeof editSharedFeatId === 'string'
			? manageableSharedFeats.find((feat) => feat.id === editSharedFeatId) ?? null
			: null;

	return {
		createdPrivateFeatName: url.searchParams.get('createdPrivateFeat'),
		createdPrivateSpellName: url.searchParams.get('createdPrivateSpell'),
		derivedPrivateFeatName: url.searchParams.get('derivedPrivateFeat'),
		derivedPrivateSpellName: url.searchParams.get('derivedPrivateSpell'),
		publishedSharedFeatName: url.searchParams.get('publishedSharedFeat'),
		publishedSystemFeatName: url.searchParams.get('publishedSystemFeat'),
		updatedSharedFeatName: url.searchParams.get('updatedSharedFeat'),
		retiredSharedFeatName: url.searchParams.get('retiredSharedFeat'),
		deletedSharedFeatName: url.searchParams.get('deletedSharedFeat'),
		createPrivateFeatValues: createPrivateFeatFormValues(),
		createPrivateSpellValues: createPrivateSpellFormValues(),
		editSharedFeatId: editableSharedFeat?.id ?? null,
		editSharedFeatValues: editableSharedFeat
			? createPrivateFeatFormValuesFromInput(editableSharedFeat)
			: createPrivateFeatFormValues(),
		roleOperations: {
			canPublishSharedFeats:
				parentData.authorization?.globalRole === 'content_editor' ||
				parentData.authorization?.globalRole === 'admin',
			canPublishSystemFeats: parentData.authorization?.globalRole === 'admin',
			canMaintainSharedFeats:
				parentData.authorization?.globalRole === 'content_editor' ||
				parentData.authorization?.globalRole === 'admin',
			canMaintainSystemFeats: parentData.authorization?.globalRole === 'admin'
		},
		characterCatalog: await listCharacterCreationCatalog(locals.supabase),
		manageableSharedFeats,
		privateFeats: parentData.session
			? await listPrivateFeatsForUser(locals.supabase, parentData.session.user.id)
			: [],
		privateSpells: parentData.session
			? await listPrivateSpellsForUser(locals.supabase, parentData.session.user.id)
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

		if (parsedForm.response) {
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
	createPrivateSpell: async ({ locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/content');
		}

		if (!locals.supabase) {
			return fail(500, {
				createPrivateSpellFieldErrors: {},
				createPrivateSpellFormError: 'Supabase is not configured yet.',
				createPrivateSpellValues: createPrivateSpellFormValues()
			});
		}

		const authorization = await getAuthorizationContext(locals.supabase, locals.session.user.id);
		requirePermissionScopeAccess(authorization, 'private_content');
		const parsedForm = await parsePrivateSpellCreateForm(request);

		if (parsedForm.response) {
			return parsedForm.response;
		}

		try {
			const spell = await createPrivateSpell(
				locals.supabase,
				locals.session.user.id,
				parsedForm.data
			);
			const createdPrivateSpell = encodeURIComponent(spell.name);

			throw redirect(303, `/app/content?createdPrivateSpell=${createdPrivateSpell}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			const formError =
				error instanceof Error
					? error.message
					: 'The private spell could not be created. Please try again.';

			return fail(400, {
				createPrivateSpellFieldErrors: {},
				createPrivateSpellFormError: formError,
				createPrivateSpellValues: parsedForm.values
			});
		}
	},
	deriveSpell: async ({ locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/content');
		}

		if (!locals.supabase) {
			return fail(500, {
				createPrivateSpellFieldErrors: {},
				createPrivateSpellFormError: 'Supabase is not configured yet.',
				createPrivateSpellValues: createPrivateSpellFormValues()
			});
		}

		const authorization = await getAuthorizationContext(locals.supabase, locals.session.user.id);
		requirePermissionScopeAccess(authorization, 'private_content');

		const formData = await request.formData();
		const sharedSpellId = formData.get('sharedSpellId');

		if (typeof sharedSpellId !== 'string' || sharedSpellId.trim().length === 0) {
			return fail(400, {
				createPrivateSpellFieldErrors: {},
				createPrivateSpellFormError: 'Please choose a valid shared spell to copy.',
				createPrivateSpellValues: createPrivateSpellFormValues()
			});
		}

		try {
			const spell = await derivePrivateSpellFromSharedCatalog(
				locals.supabase,
				locals.session.user.id,
				{ sharedSpellId }
			);
			const derivedPrivateSpell = encodeURIComponent(spell.name);

			throw redirect(303, `/app/content?derivedPrivateSpell=${derivedPrivateSpell}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			return fail(400, {
				createPrivateSpellFieldErrors: {},
				createPrivateSpellFormError:
					error instanceof Error
						? error.message
						: 'The shared spell could not be copied into your private content.',
				createPrivateSpellValues: createPrivateSpellFormValues()
			});
		}
	},
	updateSharedFeat: async ({ locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/content');
		}

		if (!locals.supabase) {
			return fail(500, {
				editSharedFeatFieldErrors: {},
				editSharedFeatFormError: 'Supabase is not configured yet.',
				editSharedFeatId: null,
				editSharedFeatValues: createPrivateFeatFormValues()
			});
		}

		const authorization = await getAuthorizationContext(locals.supabase, locals.session.user.id);
		requirePermissionScopeAccess(authorization, 'shared_content');

		const formData = await request.formData();
		const featId = formData.get('featId');

		if (typeof featId !== 'string' || featId.trim().length === 0) {
			return fail(400, {
				editSharedFeatFieldErrors: {},
				editSharedFeatFormError: 'Please choose a valid shared feat to maintain.',
				editSharedFeatId: null,
				editSharedFeatValues: createPrivateFeatFormValues()
			});
		}

		const parsedForm = parsePrivateFeatCreateValues(Object.fromEntries(formData));

		if (parsedForm.response) {
			return fail(parsedForm.response.status, {
				editSharedFeatFieldErrors: parsedForm.response.data.createPrivateFeatFieldErrors,
				editSharedFeatFormError: parsedForm.response.data.createPrivateFeatFormError,
				editSharedFeatId: featId,
				editSharedFeatValues: parsedForm.values
			});
		}

		try {
			const feat = await updateManagedSharedFeat(locals.supabase, authorization, {
				featId,
				...parsedForm.data
			});
			const updatedSharedFeat = encodeURIComponent(feat.name);
			const editSharedFeat = encodeURIComponent(feat.id);

			throw redirect(
				303,
				`/app/content?editSharedFeat=${editSharedFeat}&updatedSharedFeat=${updatedSharedFeat}`
			);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			if (typeof error === 'object' && error !== null && 'status' in error && error.status === 403) {
				throw error;
			}

			return fail(400, {
				editSharedFeatFieldErrors: {},
				editSharedFeatFormError:
					error instanceof Error
						? error.message
						: 'The shared feat could not be updated.',
				editSharedFeatId: featId,
				editSharedFeatValues: parsedForm.values
			});
		}
	},
	retireSharedFeat: async ({ locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/content');
		}

		if (!locals.supabase) {
			return fail(500, {
				editSharedFeatFieldErrors: {},
				editSharedFeatFormError: 'Supabase is not configured yet.',
				editSharedFeatId: null,
				editSharedFeatValues: createPrivateFeatFormValues()
			});
		}

		const authorization = await getAuthorizationContext(locals.supabase, locals.session.user.id);
		requirePermissionScopeAccess(authorization, 'shared_content');

		const formData = await request.formData();
		const featId = formData.get('featId');

		if (typeof featId !== 'string' || featId.trim().length === 0) {
			return fail(400, {
				editSharedFeatFieldErrors: {},
				editSharedFeatFormError: 'Please choose a valid shared feat to maintain.',
				editSharedFeatId: null,
				editSharedFeatValues: createPrivateFeatFormValues()
			});
		}

		try {
			const feat = await retireManagedSharedFeat(locals.supabase, authorization, featId);
			const retiredSharedFeat = encodeURIComponent(feat.name);

			throw redirect(303, `/app/content?retiredSharedFeat=${retiredSharedFeat}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			if (typeof error === 'object' && error !== null && 'status' in error && error.status === 403) {
				throw error;
			}

			return fail(400, {
				editSharedFeatFieldErrors: {},
				editSharedFeatFormError:
					error instanceof Error ? error.message : 'The shared feat could not be retired.',
				editSharedFeatId: featId,
				editSharedFeatValues: createPrivateFeatFormValues()
			});
		}
	},
	deleteSharedFeat: async ({ locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/content');
		}

		if (!locals.supabase) {
			return fail(500, {
				editSharedFeatFieldErrors: {},
				editSharedFeatFormError: 'Supabase is not configured yet.',
				editSharedFeatId: null,
				editSharedFeatValues: createPrivateFeatFormValues()
			});
		}

		const authorization = await getAuthorizationContext(locals.supabase, locals.session.user.id);
		requirePermissionScopeAccess(authorization, 'shared_content');

		const formData = await request.formData();
		const featId = formData.get('featId');

		if (typeof featId !== 'string' || featId.trim().length === 0) {
			return fail(400, {
				editSharedFeatFieldErrors: {},
				editSharedFeatFormError: 'Please choose a valid shared feat to maintain.',
				editSharedFeatId: null,
				editSharedFeatValues: createPrivateFeatFormValues()
			});
		}

		try {
			const feat = await deleteManagedSharedFeat(locals.supabase, authorization, featId);
			const deletedSharedFeat = encodeURIComponent(feat.name);

			throw redirect(303, `/app/content?deletedSharedFeat=${deletedSharedFeat}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			if (typeof error === 'object' && error !== null && 'status' in error && error.status === 403) {
				throw error;
			}

			return fail(400, {
				editSharedFeatFieldErrors: {},
				editSharedFeatFormError:
					error instanceof Error ? error.message : 'The shared feat could not be deleted.',
				editSharedFeatId: featId,
				editSharedFeatValues: createPrivateFeatFormValues()
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

		if (parsedForm.response) {
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

		if (parsedForm.response) {
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
	return parsePrivateFeatCreateValues(Object.fromEntries(await request.formData()));
}

function parsePrivateFeatCreateValues(rawValues: Record<string, FormDataEntryValue>) {
	const values = createPrivateFeatFormValues(rawValues);
	const parsed = privateFeatFormSchema.safeParse(values);

	if (!parsed.success) {
		return {
			values,
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

async function parsePrivateSpellCreateForm(request: Request) {
	return parsePrivateSpellCreateValues(Object.fromEntries(await request.formData()));
}

function parsePrivateSpellCreateValues(rawValues: Record<string, FormDataEntryValue>) {
	const values = createPrivateSpellFormValues(rawValues);
	const parsed = privateSpellFormSchema.safeParse(values);

	if (!parsed.success) {
		return {
			values,
			response: fail(400, {
				createPrivateSpellFieldErrors: flattenPrivateSpellFormErrors(parsed.error),
				createPrivateSpellFormError: 'Please correct the highlighted private spell fields.',
				createPrivateSpellValues: values
			})
		};
	}

	return {
		data: parsed.data,
		values
	};
}
