import { fail, isRedirect, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	listCharacterCreationCatalog,
	listExpandedContentCatalog
} from '$lib/server/repositories/catalog';
import {
	createAuthorizationContext,
	getAuthorizationContext,
	requirePermissionScopeAccess
} from '$lib/server/permissions/authorization';
import { isE2EMode } from '$lib/server/e2e/mode';
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
	createSharedSpell,
	deleteManagedSharedSpell,
	derivePrivateSpellFromSharedCatalog,
	listManagedSharedSpells,
	listPrivateSpellsForUser,
	retireManagedSharedSpell,
	updateManagedSharedSpell
} from '$lib/server/repositories/private-spells';
import {
	createPrivateSpellFormValuesFromInput,
	createPrivateSpellFormValues,
	flattenPrivateSpellFormErrors,
	privateSpellFormSchema
} from '$lib/schemas/content/private-spell-form.schema';
import { GLOBAL_ROLES, type AuthorizationContext, type GlobalRole } from '$lib/types/permissions/permissions';

function resolveContentE2ERoleOverride(input: {
	cookies: { get: (name: string) => string | undefined };
	url?: URL;
}): GlobalRole | null {
	if (!isE2EMode()) {
		return null;
	}

	const requestedRole = input.url?.searchParams.get('e2eRole') ?? input.cookies.get('app-e2e-role');

	if (!requestedRole || !GLOBAL_ROLES.includes(requestedRole as GlobalRole)) {
		return null;
	}

	return requestedRole as GlobalRole;
}

async function getContentAuthorizationContext(input: {
	cookies: { get: (name: string) => string | undefined };
	e2eRole?: GlobalRole;
	supabase: SupabaseRequestClient;
	url?: URL;
	userId: string;
}): Promise<AuthorizationContext> {
	const e2eRole =
		input.e2eRole ??
		resolveContentE2ERoleOverride({
			cookies: input.cookies,
			url: input.url
		});

	return e2eRole
		? createAuthorizationContext(input.userId, e2eRole)
		: await getAuthorizationContext(input.supabase, input.userId);
}

export const load: PageServerLoad = async ({ cookies, locals, url, parent }) => {
	if (!locals.supabase) {
		return {
			createdPrivateFeatName: url.searchParams.get('createdPrivateFeat'),
			createdPrivateSpellName: url.searchParams.get('createdPrivateSpell'),
			derivedPrivateFeatName: url.searchParams.get('derivedPrivateFeat'),
			derivedPrivateSpellName: url.searchParams.get('derivedPrivateSpell'),
			publishedSharedFeatName: url.searchParams.get('publishedSharedFeat'),
			publishedSystemFeatName: url.searchParams.get('publishedSystemFeat'),
			publishedSharedSpellName: url.searchParams.get('publishedSharedSpell'),
			publishedSystemSpellName: url.searchParams.get('publishedSystemSpell'),
			updatedSharedFeatName: url.searchParams.get('updatedSharedFeat'),
			updatedSharedSpellName: url.searchParams.get('updatedSharedSpell'),
			retiredSharedFeatName: url.searchParams.get('retiredSharedFeat'),
			deletedSharedFeatName: url.searchParams.get('deletedSharedFeat'),
			retiredSharedSpellName: url.searchParams.get('retiredSharedSpell'),
			deletedSharedSpellName: url.searchParams.get('deletedSharedSpell'),
			createPrivateFeatValues: createPrivateFeatFormValues(),
			createPrivateSpellValues: createPrivateSpellFormValues(),
			editSharedFeatId: null,
			editSharedFeatValues: createPrivateFeatFormValues(),
			editSharedSpellId: null,
			editSharedSpellValues: createPrivateSpellFormValues(),
			roleOperations: {
				canPublishSharedFeats: false,
				canPublishSystemFeats: false,
				canPublishSharedSpells: false,
				canPublishSystemSpells: false,
				canMaintainSharedFeats: false,
				canMaintainSystemFeats: false,
				canMaintainSharedSpells: false,
				canMaintainSystemSpells: false
			},
			characterCatalog: {
				speciesOptions: [],
				subspeciesOptions: [],
				classOptions: [],
				subclassOptions: [],
				backgroundOptions: []
			},
			manageableSharedFeats: [],
			manageableSharedSpells: [],
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
	const e2eRole = locals.e2eRole ?? resolveContentE2ERoleOverride({ cookies, url });
	const authorization =
		e2eRole && parentData.session
			? createAuthorizationContext(parentData.session.user.id, e2eRole)
			: parentData.authorization;
	const manageableSharedFeats =
		authorization &&
		(authorization.globalRole === 'content_editor' || authorization.globalRole === 'admin')
			? await listManagedSharedFeats(locals.supabase, authorization)
			: [];
	const manageableSharedSpells =
		authorization &&
		(authorization.globalRole === 'content_editor' || authorization.globalRole === 'admin')
			? await listManagedSharedSpells(locals.supabase, authorization)
			: [];
	const editSharedFeatId = url.searchParams.get('editSharedFeat');
	const editableSharedFeat =
		typeof editSharedFeatId === 'string'
			? manageableSharedFeats.find((feat) => feat.id === editSharedFeatId) ?? null
			: null;
	const editSharedSpellId = url.searchParams.get('editSharedSpell');
	const editableSharedSpell =
		typeof editSharedSpellId === 'string'
			? manageableSharedSpells.find((spell) => spell.id === editSharedSpellId) ?? null
			: null;

	return {
		createdPrivateFeatName: url.searchParams.get('createdPrivateFeat'),
		createdPrivateSpellName: url.searchParams.get('createdPrivateSpell'),
		derivedPrivateFeatName: url.searchParams.get('derivedPrivateFeat'),
		derivedPrivateSpellName: url.searchParams.get('derivedPrivateSpell'),
		publishedSharedFeatName: url.searchParams.get('publishedSharedFeat'),
		publishedSystemFeatName: url.searchParams.get('publishedSystemFeat'),
		publishedSharedSpellName: url.searchParams.get('publishedSharedSpell'),
		publishedSystemSpellName: url.searchParams.get('publishedSystemSpell'),
		updatedSharedFeatName: url.searchParams.get('updatedSharedFeat'),
		updatedSharedSpellName: url.searchParams.get('updatedSharedSpell'),
		retiredSharedFeatName: url.searchParams.get('retiredSharedFeat'),
		deletedSharedFeatName: url.searchParams.get('deletedSharedFeat'),
		retiredSharedSpellName: url.searchParams.get('retiredSharedSpell'),
		deletedSharedSpellName: url.searchParams.get('deletedSharedSpell'),
		createPrivateFeatValues: createPrivateFeatFormValues(),
		createPrivateSpellValues: createPrivateSpellFormValues(),
		editSharedFeatId: editableSharedFeat?.id ?? null,
		editSharedFeatValues: editableSharedFeat
			? createPrivateFeatFormValuesFromInput(editableSharedFeat)
			: createPrivateFeatFormValues(),
		editSharedSpellId: editableSharedSpell?.id ?? null,
		editSharedSpellValues: editableSharedSpell
			? createPrivateSpellFormValuesFromInput(editableSharedSpell)
			: createPrivateSpellFormValues(),
		roleOperations: {
			canPublishSharedFeats:
				authorization?.globalRole === 'content_editor' || authorization?.globalRole === 'admin',
			canPublishSystemFeats: authorization?.globalRole === 'admin',
			canPublishSharedSpells:
				authorization?.globalRole === 'content_editor' || authorization?.globalRole === 'admin',
			canPublishSystemSpells: authorization?.globalRole === 'admin',
			canMaintainSharedFeats:
				authorization?.globalRole === 'content_editor' || authorization?.globalRole === 'admin',
			canMaintainSystemFeats: authorization?.globalRole === 'admin',
			canMaintainSharedSpells:
				authorization?.globalRole === 'content_editor' || authorization?.globalRole === 'admin',
			canMaintainSystemSpells: authorization?.globalRole === 'admin'
		},
		characterCatalog: await listCharacterCreationCatalog(locals.supabase),
		manageableSharedFeats,
		manageableSharedSpells,
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
	createPrivateFeat: async ({ locals, request }) => {
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
	publishSharedSpell: async ({ cookies, locals, request }) => {
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

		const authorization = await getContentAuthorizationContext({
			cookies,
			e2eRole: locals.e2eRole,
			supabase: locals.supabase,
			userId: locals.session.user.id
		});
		requirePermissionScopeAccess(authorization, 'shared_content');

		const parsedForm = await parsePrivateSpellCreateForm(request);

		if (parsedForm.response) {
			return parsedForm.response;
		}

		try {
			const spell = await createSharedSpell(locals.supabase, locals.session.user.id, {
				...parsedForm.data,
				visibility: 'shared',
				isSystemContent: false
			});
			const publishedSharedSpell = encodeURIComponent(spell.name);

			throw redirect(303, `/app/content?publishedSharedSpell=${publishedSharedSpell}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			return fail(400, {
				createPrivateSpellFieldErrors: {},
				createPrivateSpellFormError:
					error instanceof Error
						? error.message
						: 'The spell could not be published to shared content.',
				createPrivateSpellValues: parsedForm.values
			});
		}
	},
	publishSystemSpell: async ({ cookies, locals, request }) => {
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

		const authorization = await getContentAuthorizationContext({
			cookies,
			e2eRole: locals.e2eRole,
			supabase: locals.supabase,
			userId: locals.session.user.id
		});
		requirePermissionScopeAccess(authorization, 'system_content');

		const parsedForm = await parsePrivateSpellCreateForm(request);

		if (parsedForm.response) {
			return parsedForm.response;
		}

		try {
			const spell = await createSharedSpell(locals.supabase, locals.session.user.id, {
				...parsedForm.data,
				visibility: 'public',
				isSystemContent: true
			});
			const publishedSystemSpell = encodeURIComponent(spell.name);

			throw redirect(303, `/app/content?publishedSystemSpell=${publishedSystemSpell}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			return fail(400, {
				createPrivateSpellFieldErrors: {},
				createPrivateSpellFormError:
					error instanceof Error
						? error.message
						: 'The spell could not be published as system content.',
				createPrivateSpellValues: parsedForm.values
			});
		}
	},
	updateSharedSpell: async ({ cookies, locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/content');
		}

		if (!locals.supabase) {
			return fail(500, {
				editSharedSpellFieldErrors: {},
				editSharedSpellFormError: 'Supabase is not configured yet.',
				editSharedSpellId: null,
				editSharedSpellValues: createPrivateSpellFormValues()
			});
		}

		const authorization = await getContentAuthorizationContext({
			cookies,
			e2eRole: locals.e2eRole,
			supabase: locals.supabase,
			userId: locals.session.user.id
		});
		requirePermissionScopeAccess(authorization, 'shared_content');

		const formData = await request.formData();
		const spellId = formData.get('spellId');

		if (typeof spellId !== 'string' || spellId.trim().length === 0) {
			return fail(400, {
				editSharedSpellFieldErrors: {},
				editSharedSpellFormError: 'Please choose a valid shared spell to maintain.',
				editSharedSpellId: null,
				editSharedSpellValues: createPrivateSpellFormValues()
			});
		}

		const parsedForm = parsePrivateSpellCreateValues(Object.fromEntries(formData));

		if (parsedForm.response) {
			return fail(parsedForm.response.status, {
				editSharedSpellFieldErrors: parsedForm.response.data.createPrivateSpellFieldErrors,
				editSharedSpellFormError: parsedForm.response.data.createPrivateSpellFormError,
				editSharedSpellId: spellId,
				editSharedSpellValues: parsedForm.values
			});
		}

		try {
			const spell = await updateManagedSharedSpell(locals.supabase, authorization, {
				spellId,
				...parsedForm.data
			});
			const updatedSharedSpell = encodeURIComponent(spell.name);
			const editSharedSpell = encodeURIComponent(spell.id);

			throw redirect(
				303,
				`/app/content?editSharedSpell=${editSharedSpell}&updatedSharedSpell=${updatedSharedSpell}`
			);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			if (typeof error === 'object' && error !== null && 'status' in error && error.status === 403) {
				throw error;
			}

			return fail(400, {
				editSharedSpellFieldErrors: {},
				editSharedSpellFormError:
					error instanceof Error ? error.message : 'The shared spell could not be updated.',
				editSharedSpellId: spellId,
				editSharedSpellValues: parsedForm.values
			});
		}
	},
	retireSharedSpell: async ({ cookies, locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/content');
		}

		if (!locals.supabase) {
			return fail(500, {
				editSharedSpellFieldErrors: {},
				editSharedSpellFormError: 'Supabase is not configured yet.',
				editSharedSpellId: null,
				editSharedSpellValues: createPrivateSpellFormValues()
			});
		}

		const authorization = await getContentAuthorizationContext({
			cookies,
			e2eRole: locals.e2eRole,
			supabase: locals.supabase,
			userId: locals.session.user.id
		});
		requirePermissionScopeAccess(authorization, 'shared_content');

		const formData = await request.formData();
		const spellId = formData.get('spellId');

		if (typeof spellId !== 'string' || spellId.trim().length === 0) {
			return fail(400, {
				editSharedSpellFieldErrors: {},
				editSharedSpellFormError: 'Please choose a valid shared spell to maintain.',
				editSharedSpellId: null,
				editSharedSpellValues: createPrivateSpellFormValues()
			});
		}

		try {
			const spell = await retireManagedSharedSpell(locals.supabase, authorization, spellId);
			const retiredSharedSpell = encodeURIComponent(spell.name);

			throw redirect(303, `/app/content?retiredSharedSpell=${retiredSharedSpell}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			if (typeof error === 'object' && error !== null && 'status' in error && error.status === 403) {
				throw error;
			}

			return fail(400, {
				editSharedSpellFieldErrors: {},
				editSharedSpellFormError:
					error instanceof Error ? error.message : 'The shared spell could not be retired.',
				editSharedSpellId: spellId,
				editSharedSpellValues: createPrivateSpellFormValues()
			});
		}
	},
	deleteSharedSpell: async ({ cookies, locals, request }) => {
		if (!locals.session) {
			throw redirect(302, '/auth/login?redirectTo=/app/content');
		}

		if (!locals.supabase) {
			return fail(500, {
				editSharedSpellFieldErrors: {},
				editSharedSpellFormError: 'Supabase is not configured yet.',
				editSharedSpellId: null,
				editSharedSpellValues: createPrivateSpellFormValues()
			});
		}

		const authorization = await getContentAuthorizationContext({
			cookies,
			e2eRole: locals.e2eRole,
			supabase: locals.supabase,
			userId: locals.session.user.id
		});
		requirePermissionScopeAccess(authorization, 'shared_content');

		const formData = await request.formData();
		const spellId = formData.get('spellId');

		if (typeof spellId !== 'string' || spellId.trim().length === 0) {
			return fail(400, {
				editSharedSpellFieldErrors: {},
				editSharedSpellFormError: 'Please choose a valid shared spell to maintain.',
				editSharedSpellId: null,
				editSharedSpellValues: createPrivateSpellFormValues()
			});
		}

		try {
			const spell = await deleteManagedSharedSpell(locals.supabase, authorization, spellId);
			const deletedSharedSpell = encodeURIComponent(spell.name);

			throw redirect(303, `/app/content?deletedSharedSpell=${deletedSharedSpell}`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			if (typeof error === 'object' && error !== null && 'status' in error && error.status === 403) {
				throw error;
			}

			return fail(400, {
				editSharedSpellFieldErrors: {},
				editSharedSpellFormError:
					error instanceof Error ? error.message : 'The shared spell could not be deleted.',
				editSharedSpellId: spellId,
				editSharedSpellValues: createPrivateSpellFormValues()
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
