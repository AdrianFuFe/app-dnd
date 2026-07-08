<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { ContentMechanicSummary } from '$lib/types/content/mechanic-summary';
	import type {
		PrivateFeatFormFieldErrors,
		PrivateFeatFormFieldName,
		PrivateFeatFormValues
	} from '$lib/schemas/content/private-feat-form.schema';
	import type {
		PrivateSpellFormFieldErrors,
		PrivateSpellFormFieldName,
		PrivateSpellFormValues
	} from '$lib/schemas/content/private-spell-form.schema';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	const createFeatFieldErrors = $derived(
		(form?.createPrivateFeatFieldErrors ?? {}) as PrivateFeatFormFieldErrors
	);
	const createFeatValues = $derived(
		(form?.createPrivateFeatValues ?? data.createPrivateFeatValues) as PrivateFeatFormValues
	);
	const editFeatFieldErrors = $derived(
		(form?.editSharedFeatFieldErrors ?? {}) as PrivateFeatFormFieldErrors
	);
	const editFeatValues = $derived(
		(form?.editSharedFeatValues ?? data.editSharedFeatValues) as PrivateFeatFormValues
	);
	const createSpellFieldErrors = $derived(
		(form?.createPrivateSpellFieldErrors ?? {}) as PrivateSpellFormFieldErrors
	);
	const createSpellValues = $derived(
		(form?.createPrivateSpellValues ?? data.createPrivateSpellValues) as PrivateSpellFormValues
	);
	const editSharedFeatId = $derived((form?.editSharedFeatId ?? data.editSharedFeatId) as string | null);
	const selectedManagedSharedFeat = $derived(
		editSharedFeatId
			? data.manageableSharedFeats.find((feat) => feat.id === editSharedFeatId) ?? null
			: null
	);

	function formatCountLabel(count: number, singular: string, plural: string): string {
		return `${count} ${count === 1 ? singular : plural}`;
	}

	function formatSlugLabel(value: string): string {
		return value
			.split('-')
			.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
			.join(' ');
	}

	function formatSpellLevel(level: number): string {
		return level === 0 ? 'Cantrip' : `Level ${level}`;
	}

	function formatClassList(classSlugs: string[]): string {
		return classSlugs.length > 0 ? classSlugs.map(formatSlugLabel).join(', ') : 'General';
	}

	function formatPrerequisites(prerequisites: string[]): string {
		return prerequisites.length > 0 ? prerequisites.join(' | ') : 'None';
	}

	function formatEquipmentMeta(values: Array<string | number | null>): string {
		return values
			.filter((value) => value !== null && value !== '')
			.map((value) => String(value))
			.join(' | ');
	}

	function countProficiencyVocabularyEntries(): number {
		const { vocabularies } = data.sharedCatalog;

		return (
			vocabularies.skillProficiencies.length +
			vocabularies.armorProficiencies.length +
			vocabularies.weaponProficiencies.length +
			vocabularies.toolProficiencies.length +
			vocabularies.savingThrowProficiencies.length
		);
	}

	function formatProficiencyTypeLabel(value: string): string {
		return value === 'saving_throw' ? 'Saving throw' : formatSlugLabel(value);
	}

	function formatLanguageGrantSummary(summary: ContentMechanicSummary): string | null {
		if (summary.languageGrants.length === 0) {
			return null;
		}

		return summary.languageGrants
			.map((grant) =>
				grant.kind === 'fixed'
					? formatSlugLabel(grant.language)
					: `Choose ${grant.count} language${grant.count === 1 ? '' : 's'}`
			)
			.join(' | ');
	}

	function formatProficiencyGrantSummary(summary: ContentMechanicSummary): string | null {
		const parts = summary.proficiencyGrants.map(
			(grant) => `${formatProficiencyTypeLabel(grant.proficiencyType)}: ${formatSlugLabel(grant.value)}`
		);

		for (const choice of summary.proficiencyChoices) {
			parts.push(
				`Choose ${choice.count} ${formatProficiencyTypeLabel(choice.proficiencyType).toLowerCase()}${choice.count === 1 ? '' : 's'} from ${choice.options.map(formatSlugLabel).join(', ')}`
			);
		}

		return parts.length > 0 ? parts.join(' | ') : null;
	}

	function formatSpellcastingSummary(summary: ContentMechanicSummary): string | null {
		return summary.spellcastingAbilities.length > 0
			? summary.spellcastingAbilities.map(formatSlugLabel).join(' | ')
			: null;
	}

	function createPrivateFeatFieldError(field: PrivateFeatFormFieldName) {
		return createFeatFieldErrors[field]?.[0];
	}

	function createPrivateFeatValue(field: PrivateFeatFormFieldName) {
		return createFeatValues[field];
	}

	function editSharedFeatFieldError(field: PrivateFeatFormFieldName) {
		return editFeatFieldErrors[field]?.[0];
	}

	function editSharedFeatValue(field: PrivateFeatFormFieldName) {
		return editFeatValues[field];
	}

	function createPrivateSpellFieldError(field: PrivateSpellFormFieldName) {
		return createSpellFieldErrors[field]?.[0];
	}

	function createPrivateSpellValue(field: PrivateSpellFormFieldName) {
		return createSpellValues[field];
	}
</script>

<svelte:head>
	<title>App DnD | Content</title>
</svelte:head>

<div class="space-y-6">
	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Content</p>
		<h1 class="mt-3 text-3xl font-semibold text-stone-900">Browse the shared rules catalog.</h1>
		<p class="mt-3 max-w-3xl text-base leading-7 text-stone-600">
			This protected area now reflects the broader structured SRD baseline the app is using,
			not just the newer spell, feat, and equipment slices.
		</p>
		<p class="mt-3 max-w-3xl text-sm text-stone-500">
			It now also exposes shared vocabulary domains like abilities, languages, spell schools,
			damage types, and proficiency lists so future import and form work can reuse one typed
			read model.
		</p>
		<p class="mt-3 max-w-3xl text-sm text-stone-500">
			The same shared entries below currently feed
			{formatCountLabel(
				data.characterCatalog.speciesOptions.length,
				'species selector',
				'species selectors'
			)},
			{formatCountLabel(
				data.characterCatalog.classOptions.length,
				'class selector',
				'class selectors'
			)}, and
			{formatCountLabel(
				data.characterCatalog.backgroundOptions.length,
				'background selector',
				'background selectors'
			)}
			in the live character forms.
		</p>
		{#if data.roleOperations.canPublishSharedFeats || data.roleOperations.canPublishSystemFeats}
			<div class="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-sm text-indigo-900">
				<p class="font-medium">Role-aware content operations are active for this account.</p>
				<p class="mt-2">
					{#if data.roleOperations.canPublishSystemFeats}
						You can publish shared homebrew feats and promote approved entries into
						system-owned catalog content.
					{:else}
						You can publish shared homebrew feats for broader reuse, but system-owned
						catalog content remains admin-only.
					{/if}
				</p>
			</div>
		{/if}
		<div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
					Species
				</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{data.sharedCatalog.species.length}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Shared ancestry entries available across the app.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
					Subspecies
				</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{data.sharedCatalog.subspecies.length}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Nested ancestry options already linked to their parent species.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
					Classes
				</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{data.sharedCatalog.classes.length}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Class paths with subclass filtering already connected to live forms.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
					Subclasses
				</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{data.sharedCatalog.subclasses.length}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Specialized class branches grouped by their parent class.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
					Backgrounds
				</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{data.sharedCatalog.backgrounds.length}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Reusable origins available for structured character selection.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Spells</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{data.sharedCatalog.spells.length}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Sorted by level and already reused in structured spell rows.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Feats</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{data.sharedCatalog.feats.length}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Includes prerequisite text so validation can stay catalog-backed.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
					Equipment
				</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{data.sharedCatalog.equipment.length}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Shared gear already powering attack and inventory selectors.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
					Languages
				</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{data.sharedCatalog.vocabularies.languages.length}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Shared language vocabulary validated alongside SRD species and backgrounds.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
					Proficiencies
				</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">
					{countProficiencyVocabularyEntries()}
				</p>
				<p class="mt-2 text-sm text-stone-600">
					Skill, armor, weapon, tool, and saving throw vocabularies.
				</p>
			</div>
		</div>
	</section>

	{#if data.roleOperations.canMaintainSharedFeats}
		<section class="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
			<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<div class="flex items-center justify-between gap-4">
					<div>
						<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
							Shared feat maintenance
						</p>
						<h2 class="mt-2 text-2xl font-semibold text-stone-900">
							Review trusted shared entries
						</h2>
					</div>
					<p class="text-sm text-stone-500">{data.manageableSharedFeats.length} total</p>
				</div>
				<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
					This queue only shows shared homebrew feats your current role is allowed to
					maintain. Normal users never see this workflow.
				</p>

				{#if data.manageableSharedFeats.length === 0}
					<p class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600">
						No maintainable shared feats yet. Publish one first, or use an admin account to
						review system-owned entries.
					</p>
				{:else}
					<div class="mt-6 space-y-4">
						{#each data.manageableSharedFeats as feat (feat.id)}
							<article class="rounded-2xl border border-stone-200 p-4">
								<div class="flex flex-wrap items-start justify-between gap-3">
									<div>
										<h3 class="text-lg font-semibold text-stone-900">{feat.name}</h3>
										<p class="mt-1 text-sm text-stone-500">slug: {feat.slug}</p>
									</div>
									<div class="flex flex-wrap items-center gap-2">
										<span
											class={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] ${
												feat.isSystemContent
													? 'bg-fuchsia-100 text-fuchsia-900'
													: 'bg-indigo-100 text-indigo-900'
											}`}
										>
											{feat.isSystemContent ? 'System' : 'Shared'}
										</span>
										<a
											class={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition ${
												editSharedFeatId === feat.id
													? 'bg-stone-500 hover:bg-stone-500'
													: 'bg-stone-900 hover:bg-stone-700'
											}`}
											href={`?editSharedFeat=${feat.id}`}
										>
											{editSharedFeatId === feat.id ? 'Editing' : 'Edit'}
										</a>
									</div>
								</div>
								<p class="mt-3 text-sm text-stone-600">
									{feat.summary ?? feat.description ?? 'No summary yet.'}
								</p>
								<p class="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
									Prerequisites
								</p>
								<p class="mt-2 text-sm text-stone-700">
									{formatPrerequisites(feat.prerequisites)}
								</p>
							</article>
						{/each}
					</div>
				{/if}
			</div>

			<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
					Maintenance editor
				</p>
				<h2 class="mt-2 text-2xl font-semibold text-stone-900">
					Update a managed shared feat
				</h2>
				<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
					Editors can update, retire, or delete their own shared homebrew feats. Admins
					can apply the same lifecycle controls to system-owned entries.
				</p>

				{#if data.updatedSharedFeatName}
					<p class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
						{data.updatedSharedFeatName} was updated successfully.
					</p>
				{/if}
				{#if data.retiredSharedFeatName}
					<p class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
						{data.retiredSharedFeatName} was retired from the shared catalog.
					</p>
				{/if}
				{#if data.deletedSharedFeatName}
					<p class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
						{data.deletedSharedFeatName} was deleted from shared content.
					</p>
				{/if}

				{#if form?.editSharedFeatFormError}
					<p class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{form.editSharedFeatFormError}
					</p>
				{/if}

				{#if !editSharedFeatId}
					<p class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600">
						Choose a shared feat from the maintenance list to load it into this editor.
					</p>
				{:else}
					<form method="POST" class="mt-6 space-y-4">
						<input type="hidden" name="featId" value={editSharedFeatId} />

						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700">Feat name</span>
							<input
								class="block w-full rounded-lg border-stone-300"
								name="name"
								type="text"
								value={editSharedFeatValue('name')}
							/>
							{#if editSharedFeatFieldError('name')}
								<p class="mt-1 text-sm text-red-700">{editSharedFeatFieldError('name')}</p>
							{/if}
						</label>

						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700">Summary</span>
							<input
								class="block w-full rounded-lg border-stone-300"
								name="summary"
								type="text"
								value={editSharedFeatValue('summary')}
							/>
							{#if editSharedFeatFieldError('summary')}
								<p class="mt-1 text-sm text-red-700">{editSharedFeatFieldError('summary')}</p>
							{/if}
						</label>

						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700">Description</span>
							<textarea
								class="block min-h-28 w-full rounded-lg border-stone-300"
								name="description"
							>{editSharedFeatValue('description')}</textarea>
							{#if editSharedFeatFieldError('description')}
								<p class="mt-1 text-sm text-red-700">
									{editSharedFeatFieldError('description')}
								</p>
							{/if}
						</label>

						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700">Prerequisites</span>
							<textarea
								class="block min-h-28 w-full rounded-lg border-stone-300"
								name="prerequisitesText"
							>{editSharedFeatValue('prerequisitesText')}</textarea>
							<p class="mt-1 text-sm text-stone-500">
								Use one prerequisite per line. Updates are revalidated before saving.
							</p>
							{#if editSharedFeatFieldError('prerequisitesText')}
								<p class="mt-1 text-sm text-red-700">
									{editSharedFeatFieldError('prerequisitesText')}
								</p>
							{/if}
						</label>

						<button
							class="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
							type="submit"
							formaction="?/updateSharedFeat"
						>
							Save shared feat changes
						</button>
					</form>

					<div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
						<p class="text-sm font-medium text-amber-950">Lifecycle controls</p>
						<p class="mt-2 text-sm leading-6 text-amber-900">
							Retiring removes this feat from shared browsing without permanently deleting
							the stored row. Deleting removes it permanently from managed shared content.
						</p>
						<p class="mt-2 text-sm leading-6 text-amber-900">
							{#if selectedManagedSharedFeat?.isSystemContent}
								This entry is system-owned, so only admin users should apply destructive
								actions here.
							{:else}
								This action scope is limited to the shared feat you selected and should be
								used only when it should no longer stay in the shared catalog.
							{/if}
						</p>
						<div class="mt-4 flex flex-wrap gap-3">
							<form method="POST">
								<input type="hidden" name="featId" value={editSharedFeatId} />
								<button
									class="rounded-lg border border-amber-300 bg-white px-4 py-3 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
									type="submit"
									formaction="?/retireSharedFeat"
								>
									Retire from shared catalog
								</button>
							</form>
							<form method="POST">
								<input type="hidden" name="featId" value={editSharedFeatId} />
								<button
									class="rounded-lg bg-rose-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
									type="submit"
									formaction="?/deleteSharedFeat"
								>
									Delete permanently
								</button>
							</form>
						</div>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<section class="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
				Private feats
			</p>
			<h2 class="mt-2 text-2xl font-semibold text-stone-900">
				Create your own feat draft
			</h2>
			<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
				This first private content workflow is owner-scoped. New feats created here stay
				private to your account and do not modify the shared SRD catalog.
			</p>

			{#if data.createdPrivateFeatName}
				<p class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
					{data.createdPrivateFeatName} was created as a private feat.
				</p>
			{/if}
			{#if data.derivedPrivateFeatName}
				<p class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
					{data.derivedPrivateFeatName} was copied from the shared SRD catalog into your
					private feats.
				</p>
			{/if}
			{#if data.publishedSharedFeatName}
				<p class="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
					{data.publishedSharedFeatName} was published to the shared homebrew catalog.
				</p>
			{/if}
			{#if data.publishedSystemFeatName}
				<p class="mt-4 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-800">
					{data.publishedSystemFeatName} was published as system-owned content.
				</p>
			{/if}

			{#if form?.createPrivateFeatFormError}
				<p class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{form.createPrivateFeatFormError}
				</p>
			{/if}

			<form method="POST" class="mt-6 space-y-4">
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">Feat name</span>
					<input
						class="block w-full rounded-lg border-stone-300"
						name="name"
						type="text"
						value={createPrivateFeatValue('name')}
						placeholder="Observant Echo"
					/>
					{#if createPrivateFeatFieldError('name')}
						<p class="mt-1 text-sm text-red-700">{createPrivateFeatFieldError('name')}</p>
					{/if}
				</label>

				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">Summary</span>
					<input
						class="block w-full rounded-lg border-stone-300"
						name="summary"
						type="text"
						value={createPrivateFeatValue('summary')}
						placeholder="Short player-facing summary"
					/>
					{#if createPrivateFeatFieldError('summary')}
						<p class="mt-1 text-sm text-red-700">{createPrivateFeatFieldError('summary')}</p>
					{/if}
				</label>

				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">Description</span>
					<textarea
						class="block min-h-28 w-full rounded-lg border-stone-300"
						name="description"
						placeholder="Describe what this feat changes for the character."
					>{createPrivateFeatValue('description')}</textarea>
					{#if createPrivateFeatFieldError('description')}
						<p class="mt-1 text-sm text-red-700">{createPrivateFeatFieldError('description')}</p>
					{/if}
				</label>

				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">
						Prerequisites
					</span>
					<textarea
						class="block min-h-28 w-full rounded-lg border-stone-300"
						name="prerequisitesText"
						placeholder="One per line, for example:&#10;level:4&#10;ability:intelligence:13&#10;spellcasting"
					>{createPrivateFeatValue('prerequisitesText')}</textarea>
					<p class="mt-1 text-sm text-stone-500">
						Use one prerequisite per line. Supported formats match the validated content
						schema.
					</p>
					{#if createPrivateFeatFieldError('prerequisitesText')}
						<p class="mt-1 text-sm text-red-700">
							{createPrivateFeatFieldError('prerequisitesText')}
						</p>
					{/if}
				</label>

				<button
					class="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
					type="submit"
				>
					Create private feat
				</button>
				{#if data.roleOperations.canPublishSharedFeats || data.roleOperations.canPublishSystemFeats}
					<div class="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4">
						<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
							Privileged publishing
						</p>
						<p class="mt-2 text-sm text-stone-600">
							These actions reuse the same validated feat draft, but publish it beyond your
							private workspace. Role assignment still stays outside the runtime UI.
						</p>
						<div class="mt-4 flex flex-wrap gap-3">
							{#if data.roleOperations.canPublishSharedFeats}
								<button
									class="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
									type="submit"
									formaction="?/publishSharedFeat"
								>
									Publish shared feat
								</button>
							{/if}
							{#if data.roleOperations.canPublishSystemFeats}
								<button
									class="rounded-lg bg-fuchsia-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-fuchsia-600"
									type="submit"
									formaction="?/publishSystemFeat"
								>
									Publish system feat
								</button>
							{/if}
						</div>
					</div>
				{/if}
			</form>
		</div>

		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
						Your private feats
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">
						Owner-scoped content
					</h2>
				</div>
				<p class="text-sm text-stone-500">{data.privateFeats.length} total</p>
			</div>

			{#if data.privateFeats.length === 0}
				<p class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600">
					No private feats yet. Create one from the form to start building personal
					content without touching the shared SRD baseline.
				</p>
			{:else}
				<div class="mt-6 space-y-4">
					{#each data.privateFeats as feat (feat.id)}
						<article class="rounded-2xl border border-stone-200 p-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h3 class="text-lg font-semibold text-stone-900">{feat.name}</h3>
									<p class="mt-1 text-sm text-stone-500">slug: {feat.slug}</p>
								</div>
								<div class="flex flex-wrap gap-2">
									<span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-900">
										Private
									</span>
									{#if feat.derivation}
										<span class="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-sky-900">
											Derived
										</span>
									{/if}
								</div>
							</div>

							<p class="mt-3 text-sm text-stone-600">
								{feat.summary ?? feat.description ?? 'No summary yet.'}
							</p>
							{#if feat.derivation}
								<p class="mt-3 text-xs uppercase tracking-[0.16em] text-stone-500">
									Derived from {feat.derivation.source}: {feat.derivation.name}
								</p>
							{/if}

							<p class="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
								Prerequisites
							</p>
							<p class="mt-2 text-sm text-stone-700">
								{formatPrerequisites(feat.prerequisites)}
							</p>
						</article>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<section class="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
						Foundations
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">
						Shared ancestry and class baseline
					</h2>
				</div>
				<p class="text-sm text-stone-500">
					{formatCountLabel(
						data.sharedCatalog.subspecies.length,
						'subspecies',
						'subspecies'
					)}
					/
					{formatCountLabel(
						data.sharedCatalog.subclasses.length,
						'subclass',
						'subclasses'
					)}
				</p>
			</div>

			<div class="mt-6 grid gap-4 lg:grid-cols-2">
				<article class="rounded-2xl border border-stone-200 p-4">
					<div class="flex items-center justify-between gap-3">
						<h3 class="text-lg font-semibold text-stone-900">Species</h3>
						<p class="text-xs uppercase tracking-[0.16em] text-stone-500">
							{data.sharedCatalog.species.length}
						</p>
					</div>
					{#if data.sharedCatalog.species.length === 0}
						<p class="mt-4 text-sm text-stone-600">
							No species entries are available yet.
						</p>
					{:else}
						<div class="mt-4 space-y-3">
							{#each data.sharedCatalog.species as option (option.id)}
								<div class="rounded-2xl bg-stone-50 px-3 py-3">
									<div class="flex items-center justify-between gap-3">
										<p class="font-medium text-stone-900">{option.name}</p>
										{#if option.baseSpeed !== null}
											<span
												class="text-xs uppercase tracking-[0.16em] text-stone-500"
											>
												{option.baseSpeed} ft
											</span>
										{/if}
									</div>
									<p class="mt-2 text-sm text-stone-600">
										{option.summary ?? 'No summary yet.'}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				</article>

				<article class="rounded-2xl border border-stone-200 p-4">
					<div class="flex items-center justify-between gap-3">
						<h3 class="text-lg font-semibold text-stone-900">Subspecies</h3>
						<p class="text-xs uppercase tracking-[0.16em] text-stone-500">
							{data.sharedCatalog.subspecies.length}
						</p>
					</div>
					{#if data.sharedCatalog.subspecies.length === 0}
						<p class="mt-4 text-sm text-stone-600">
							No subspecies entries are available yet.
						</p>
					{:else}
						<div class="mt-4 space-y-3">
							{#each data.sharedCatalog.subspecies as option (option.id)}
								<div class="rounded-2xl bg-stone-50 px-3 py-3">
									<div class="flex items-center justify-between gap-3">
										<p class="font-medium text-stone-900">{option.name}</p>
										<span
											class="text-xs uppercase tracking-[0.16em] text-stone-500"
										>
											{formatSlugLabel(option.speciesSlug)}
										</span>
									</div>
									<p class="mt-2 text-sm text-stone-600">
										{option.summary ?? 'No summary yet.'}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				</article>

				<article class="rounded-2xl border border-stone-200 p-4">
					<div class="flex items-center justify-between gap-3">
						<h3 class="text-lg font-semibold text-stone-900">Classes</h3>
						<p class="text-xs uppercase tracking-[0.16em] text-stone-500">
							{data.sharedCatalog.classes.length}
						</p>
					</div>
					{#if data.sharedCatalog.classes.length === 0}
						<p class="mt-4 text-sm text-stone-600">
							No class entries are available yet.
						</p>
					{:else}
						<div class="mt-4 space-y-3">
							{#each data.sharedCatalog.classes as option (option.id)}
								<div class="rounded-2xl bg-stone-50 px-3 py-3">
									<div class="flex items-center justify-between gap-3">
										<p class="font-medium text-stone-900">{option.name}</p>
										<span
											class="text-xs uppercase tracking-[0.16em] text-stone-500"
										>
											d{option.hitDie}
										</span>
									</div>
									<p class="mt-2 text-sm text-stone-600">
										{option.summary ?? 'No summary yet.'}
									</p>
									{#if formatSpellcastingSummary(option.mechanicSummary)}
										<p class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
											Spellcasting: {formatSpellcastingSummary(option.mechanicSummary)}
										</p>
									{/if}
									{#if formatProficiencyGrantSummary(option.mechanicSummary)}
										<p class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
											Proficiencies: {formatProficiencyGrantSummary(option.mechanicSummary)}
										</p>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</article>
				<article class="rounded-2xl border border-stone-200 p-4">
					<div class="flex items-center justify-between gap-3">
						<h3 class="text-lg font-semibold text-stone-900">Subclasses</h3>
						<p class="text-xs uppercase tracking-[0.16em] text-stone-500">
							{data.sharedCatalog.subclasses.length}
						</p>
					</div>
					{#if data.sharedCatalog.subclasses.length === 0}
						<p class="mt-4 text-sm text-stone-600">
							No subclass entries are available yet.
						</p>
					{:else}
						<div class="mt-4 space-y-3">
							{#each data.sharedCatalog.subclasses as option (option.id)}
								<div class="rounded-2xl bg-stone-50 px-3 py-3">
									<div class="flex items-center justify-between gap-3">
										<p class="font-medium text-stone-900">{option.name}</p>
										<span
											class="text-xs uppercase tracking-[0.16em] text-stone-500"
										>
											{formatSlugLabel(option.classSlug)}
										</span>
									</div>
									<p class="mt-2 text-sm text-stone-600">
										{option.summary ?? 'No summary yet.'}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				</article>

				<article class="rounded-2xl border border-stone-200 p-4 lg:col-span-2">
					<div class="flex items-center justify-between gap-3">
						<h3 class="text-lg font-semibold text-stone-900">Backgrounds</h3>
						<p class="text-xs uppercase tracking-[0.16em] text-stone-500">
							{data.sharedCatalog.backgrounds.length}
						</p>
					</div>
					{#if data.sharedCatalog.backgrounds.length === 0}
						<p class="mt-4 text-sm text-stone-600">
							No background entries are available yet.
						</p>
					{:else}
						<div class="mt-4 grid gap-3 md:grid-cols-2">
							{#each data.sharedCatalog.backgrounds as option (option.id)}
								<div class="rounded-2xl bg-stone-50 px-3 py-3">
									<p class="font-medium text-stone-900">{option.name}</p>
									<p class="mt-2 text-sm text-stone-600">
										{option.summary ?? 'No summary yet.'}
									</p>
									{#if formatLanguageGrantSummary(option.mechanicSummary)}
										<p class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
											Languages: {formatLanguageGrantSummary(option.mechanicSummary)}
										</p>
									{/if}
									{#if formatProficiencyGrantSummary(option.mechanicSummary)}
										<p class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
											Proficiencies: {formatProficiencyGrantSummary(option.mechanicSummary)}
										</p>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</article>
			</div>
		</div>

		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
						Spells
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">
						SRD-backed spell entries
					</h2>
				</div>
				<p class="text-sm text-stone-500">{data.sharedCatalog.spells.length} total</p>
			</div>

			{#if data.sharedCatalog.spells.length === 0}
				<p class="mt-6 text-sm text-stone-600">
					No shared spell entries are available yet.
				</p>
			{:else}
				<div class="mt-6 space-y-4">
					{#each data.sharedCatalog.spells as spell (spell.id)}
						<article class="rounded-2xl border border-stone-200 p-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h3 class="text-lg font-semibold text-stone-900">
										{spell.name}
									</h3>
									<p class="mt-1 text-sm text-stone-600">
										{spell.summary ?? 'No summary yet.'}
									</p>
								</div>
								<div
									class="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-600"
								>
									<span
										class="rounded-full bg-amber-100 px-3 py-1 text-amber-900"
									>
										{formatSpellLevel(spell.level)}
									</span>
									<span class="rounded-full bg-sky-100 px-3 py-1 text-sky-900">
										{spell.school}
									</span>
									{#if spell.concentration}
										<span
											class="rounded-full bg-rose-100 px-3 py-1 text-rose-900"
										>
											Concentration
										</span>
									{/if}
									{#if spell.ritual}
										<span
											class="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900"
										>
											Ritual
										</span>
									{/if}
								</div>
							</div>

							<dl class="mt-4 grid gap-3 text-sm text-stone-600 sm:grid-cols-3">
								<div>
									<dt class="font-medium text-stone-900">Casting time</dt>
									<dd class="mt-1">{spell.castingTime ?? 'Not specified'}</dd>
								</div>
								<div>
									<dt class="font-medium text-stone-900">Range</dt>
									<dd class="mt-1">{spell.range ?? 'Not specified'}</dd>
								</div>
								<div>
									<dt class="font-medium text-stone-900">Duration</dt>
									<dd class="mt-1">{spell.duration ?? 'Not specified'}</dd>
								</div>
							</dl>

							<p class="mt-4 text-xs uppercase tracking-[0.16em] text-stone-500">
								Classes: {formatClassList(spell.classSlugs)}
							</p>
						</article>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<section class="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
				Private spells
			</p>
			<h2 class="mt-2 text-2xl font-semibold text-stone-900">
				Create your own spell draft
			</h2>
			<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
				This first spell workflow stays owner-scoped. Shared SRD spells remain browseable
				below, while new drafts created here stay private to your account.
			</p>

			{#if data.createdPrivateSpellName}
				<p class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
					{data.createdPrivateSpellName} was created as a private spell.
				</p>
			{/if}

			{#if form?.createPrivateSpellFormError}
				<p class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{form.createPrivateSpellFormError}
				</p>
			{/if}

			<form method="POST" class="mt-6 space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="block sm:col-span-2">
						<span class="mb-1 block text-sm font-medium text-stone-700">Spell name</span>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="name"
							type="text"
							value={createPrivateSpellValue('name')}
							placeholder="Arc Light"
						/>
						{#if createPrivateSpellFieldError('name')}
							<p class="mt-1 text-sm text-red-700">{createPrivateSpellFieldError('name')}</p>
						{/if}
					</label>

					<label class="block">
						<span class="mb-1 block text-sm font-medium text-stone-700">Level</span>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="level"
							type="number"
							min="0"
							max="9"
							value={createPrivateSpellValue('level')}
						/>
						{#if createPrivateSpellFieldError('level')}
							<p class="mt-1 text-sm text-red-700">{createPrivateSpellFieldError('level')}</p>
						{/if}
					</label>

					<label class="block">
						<span class="mb-1 block text-sm font-medium text-stone-700">School</span>
						<select
							class="block w-full rounded-lg border-stone-300"
							name="school"
							value={createPrivateSpellValue('school')}
						>
							<option value="">Choose a spell school</option>
							{#each data.sharedCatalog.vocabularies.spellSchools as school (school.slug)}
								<option value={school.slug}>{school.name}</option>
							{/each}
						</select>
						{#if createPrivateSpellFieldError('school')}
							<p class="mt-1 text-sm text-red-700">{createPrivateSpellFieldError('school')}</p>
						{/if}
					</label>

					<label class="block">
						<span class="mb-1 block text-sm font-medium text-stone-700">Casting time</span>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="castingTime"
							type="text"
							value={createPrivateSpellValue('castingTime')}
							placeholder="1 action"
						/>
						{#if createPrivateSpellFieldError('castingTime')}
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('castingTime')}
							</p>
						{/if}
					</label>

					<label class="block">
						<span class="mb-1 block text-sm font-medium text-stone-700">Range</span>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="range"
							type="text"
							value={createPrivateSpellValue('range')}
							placeholder="60 feet"
						/>
						{#if createPrivateSpellFieldError('range')}
							<p class="mt-1 text-sm text-red-700">{createPrivateSpellFieldError('range')}</p>
						{/if}
					</label>

					<label class="block">
						<span class="mb-1 block text-sm font-medium text-stone-700">Components</span>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="components"
							type="text"
							value={createPrivateSpellValue('components')}
							placeholder="V, S, M"
						/>
						<p class="mt-1 text-sm text-stone-500">Use a comma-separated list of V, S, and M.</p>
						{#if createPrivateSpellFieldError('components')}
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('components')}
							</p>
						{/if}
					</label>

					<label class="block">
						<span class="mb-1 block text-sm font-medium text-stone-700">Duration</span>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="duration"
							type="text"
							value={createPrivateSpellValue('duration')}
							placeholder="Instantaneous"
						/>
						{#if createPrivateSpellFieldError('duration')}
							<p class="mt-1 text-sm text-red-700">{createPrivateSpellFieldError('duration')}</p>
						{/if}
					</label>

					<label class="block sm:col-span-2">
						<span class="mb-1 block text-sm font-medium text-stone-700">Materials</span>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="materials"
							type="text"
							value={createPrivateSpellValue('materials')}
							placeholder="Only when components include M"
						/>
						{#if createPrivateSpellFieldError('materials')}
							<p class="mt-1 text-sm text-red-700">{createPrivateSpellFieldError('materials')}</p>
						{/if}
					</label>

					<label class="block sm:col-span-2">
						<span class="mb-1 block text-sm font-medium text-stone-700">
							Class slugs
						</span>
						<textarea
							class="block min-h-24 w-full rounded-lg border-stone-300"
							name="classSlugsText"
							placeholder="One per line, for example:&#10;mago&#10;clerigo"
						>{createPrivateSpellValue('classSlugsText')}</textarea>
						<p class="mt-1 text-sm text-stone-500">
							Optional. Leave blank for a general spell draft.
						</p>
						{#if createPrivateSpellFieldError('classSlugsText')}
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('classSlugsText')}
							</p>
						{/if}
					</label>

					<label class="block sm:col-span-2">
						<span class="mb-1 block text-sm font-medium text-stone-700">Summary</span>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="summary"
							type="text"
							value={createPrivateSpellValue('summary')}
							placeholder="Short player-facing summary"
						/>
						{#if createPrivateSpellFieldError('summary')}
							<p class="mt-1 text-sm text-red-700">{createPrivateSpellFieldError('summary')}</p>
						{/if}
					</label>

					<label class="block sm:col-span-2">
						<span class="mb-1 block text-sm font-medium text-stone-700">Description</span>
						<textarea
							class="block min-h-28 w-full rounded-lg border-stone-300"
							name="description"
							placeholder="Describe the spell effect in player-facing terms."
						>{createPrivateSpellValue('description')}</textarea>
						{#if createPrivateSpellFieldError('description')}
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('description')}
							</p>
						{/if}
					</label>
				</div>

				<div class="flex flex-wrap gap-6">
					<label class="flex items-center gap-3 text-sm text-stone-700">
						<input
							class="rounded border-stone-300"
							name="concentration"
							type="checkbox"
							checked={createSpellValues.concentration}
						/>
						<span>Requires concentration</span>
					</label>
					<label class="flex items-center gap-3 text-sm text-stone-700">
						<input
							class="rounded border-stone-300"
							name="ritual"
							type="checkbox"
							checked={createSpellValues.ritual}
						/>
						<span>Can be cast as a ritual</span>
					</label>
				</div>

				<button
					class="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
					type="submit"
					formaction="?/createPrivateSpell"
				>
					Create private spell
				</button>
			</form>
		</div>

		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
						Your private spells
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">
						Owner-scoped spell drafts
					</h2>
				</div>
				<p class="text-sm text-stone-500">{data.privateSpells.length} total</p>
			</div>

			{#if data.privateSpells.length === 0}
				<p class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600">
					No private spells yet. Create one from the form to start building personal
					spell content without changing the shared SRD spell catalog.
				</p>
			{:else}
				<div class="mt-6 space-y-4">
					{#each data.privateSpells as spell (spell.id)}
						<article class="rounded-2xl border border-stone-200 p-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h3 class="text-lg font-semibold text-stone-900">{spell.name}</h3>
									<p class="mt-1 text-sm text-stone-500">slug: {spell.slug}</p>
								</div>
								<div class="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.14em]">
									<span class="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
										Private
									</span>
									<span class="rounded-full bg-sky-100 px-3 py-1 text-sky-900">
										{formatSpellLevel(spell.level)}
									</span>
									<span class="rounded-full bg-stone-100 px-3 py-1 text-stone-900">
										{formatSlugLabel(spell.school)}
									</span>
									{#if spell.concentration}
										<span class="rounded-full bg-rose-100 px-3 py-1 text-rose-900">
											Concentration
										</span>
									{/if}
									{#if spell.ritual}
										<span class="rounded-full bg-emerald-100 px-3 py-1 text-emerald-900">
											Ritual
										</span>
									{/if}
								</div>
							</div>

							<p class="mt-3 text-sm text-stone-600">
								{spell.summary ?? spell.description ?? 'No summary yet.'}
							</p>

							<dl class="mt-4 grid gap-3 text-sm text-stone-600 sm:grid-cols-3">
								<div>
									<dt class="font-medium text-stone-900">Casting time</dt>
									<dd class="mt-1">{spell.castingTime ?? 'Not specified'}</dd>
								</div>
								<div>
									<dt class="font-medium text-stone-900">Range</dt>
									<dd class="mt-1">{spell.range ?? 'Not specified'}</dd>
								</div>
								<div>
									<dt class="font-medium text-stone-900">Duration</dt>
									<dd class="mt-1">{spell.duration ?? 'Not specified'}</dd>
								</div>
							</dl>

							<p class="mt-4 text-xs uppercase tracking-[0.16em] text-stone-500">
								Classes: {formatClassList(spell.classSlugs)}
							</p>
							{#if spell.components}
								<p class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
									Components: {spell.components}
									{#if spell.materials}
										| Materials: {spell.materials}
									{/if}
								</p>
							{/if}
						</article>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<section class="grid gap-6 xl:grid-cols-[0.8fr,1.2fr]">
		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
						Feats
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">
						Reusable feat entries
					</h2>
				</div>
				<p class="text-sm text-stone-500">{data.sharedCatalog.feats.length} total</p>
			</div>

			{#if data.sharedCatalog.feats.length === 0}
				<p class="mt-6 text-sm text-stone-600">No shared feat entries are available yet.</p>
			{:else}
				<div class="mt-6 space-y-4">
					{#each data.sharedCatalog.feats as feat (feat.id)}
						<article class="rounded-2xl border border-stone-200 p-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<h3 class="text-lg font-semibold text-stone-900">{feat.name}</h3>
								<form method="POST">
									<input type="hidden" name="sharedFeatId" value={feat.id} />
									<button
										class="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-stone-700"
										type="submit"
										formaction="?/deriveFeat"
									>
										Copy to private
									</button>
								</form>
							</div>
							<p class="mt-2 text-sm text-stone-600">
								{feat.summary ?? feat.description ?? 'No summary yet.'}
							</p>
							<p
								class="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-stone-500"
							>
								Prerequisites
							</p>
							<p class="mt-2 text-sm text-stone-700">
								{formatPrerequisites(feat.prerequisites)}
							</p>
						</article>
					{/each}
				</div>
			{/if}
		</div>

		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
						Equipment
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">
						Shared gear and weapon entries
					</h2>
				</div>
				<p class="text-sm text-stone-500">{data.sharedCatalog.equipment.length} total</p>
			</div>

			{#if data.sharedCatalog.equipment.length === 0}
				<p class="mt-6 text-sm text-stone-600">
					No shared equipment entries are available yet.
				</p>
			{:else}
				<div class="mt-6 space-y-4">
					{#each data.sharedCatalog.equipment as entry (entry.id)}
						<article class="rounded-2xl border border-stone-200 p-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h3 class="text-lg font-semibold text-stone-900">
										{entry.name}
									</h3>
									<p class="mt-1 text-sm text-stone-600">
										{entry.summary ?? entry.description ?? 'No summary yet.'}
									</p>
								</div>
								<div
									class="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-600"
								>
									<span
										class="rounded-full bg-stone-100 px-3 py-1 text-stone-900"
									>
										{formatSlugLabel(entry.category)}
									</span>
									{#if entry.isWeapon}
										<span
											class="rounded-full bg-amber-100 px-3 py-1 text-amber-900"
										>
											Weapon
										</span>
									{/if}
									{#if entry.isEquippable}
										<span
											class="rounded-full bg-sky-100 px-3 py-1 text-sky-900"
										>
											Equippable
										</span>
									{/if}
								</div>
							</div>

							{#if formatEquipmentMeta( [entry.value, entry.weight !== null ? `${entry.weight} lb` : null, entry.damage, entry.damageType, entry.range] )}
								<p class="mt-4 text-sm text-stone-600">
									{formatEquipmentMeta([
										entry.value,
										entry.weight !== null ? `${entry.weight} lb` : null,
										entry.damage,
										entry.damageType,
										entry.range
									])}
								</p>
							{/if}

							{#if entry.properties.length > 0}
								<p class="mt-3 text-xs uppercase tracking-[0.16em] text-stone-500">
									Properties: {entry.properties.join(' | ')}
								</p>
							{/if}
						</article>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<section class="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
						Vocabularies
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">
						Ability-adjacent SRD mechanics
					</h2>
				</div>
				<p class="text-sm text-stone-500">
					{formatCountLabel(
						data.sharedCatalog.vocabularies.abilities.length,
						'ability',
						'abilities'
					)}
					/
					{formatCountLabel(
						data.sharedCatalog.vocabularies.languages.length,
						'language',
						'languages'
					)}
				</p>
			</div>

			<div class="mt-6 space-y-5">
				<article class="rounded-2xl border border-stone-200 p-4">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
						Abilities
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each data.sharedCatalog.vocabularies.abilities as entry (entry.slug)}
							<span
								class="rounded-full bg-stone-100 px-3 py-2 text-sm text-stone-700"
							>
								{entry.name}
							</span>
						{/each}
					</div>
				</article>

				<article class="rounded-2xl border border-stone-200 p-4">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
						Languages
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each data.sharedCatalog.vocabularies.languages as entry (entry.slug)}
							<span class="rounded-full bg-amber-50 px-3 py-2 text-sm text-amber-900">
								{entry.name}
							</span>
						{/each}
					</div>
				</article>

				<div class="grid gap-4 md:grid-cols-2">
					<article class="rounded-2xl border border-stone-200 p-4">
						<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
							Spell Schools
						</p>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each data.sharedCatalog.vocabularies.spellSchools as entry (entry.slug)}
								<span class="rounded-full bg-sky-50 px-3 py-2 text-sm text-sky-900">
									{entry.name}
								</span>
							{/each}
						</div>
					</article>

					<article class="rounded-2xl border border-stone-200 p-4">
						<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
							Damage Types
						</p>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each data.sharedCatalog.vocabularies.damageTypes as entry (entry.slug)}
								<span
									class="rounded-full bg-rose-50 px-3 py-2 text-sm text-rose-900"
								>
									{entry.name}
								</span>
							{/each}
						</div>
					</article>
				</div>
			</div>
		</div>

		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
						Proficiencies
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">
						Shared proficiency vocabularies
					</h2>
				</div>
				<p class="text-sm text-stone-500">{countProficiencyVocabularyEntries()} total</p>
			</div>

			<div class="mt-6 grid gap-4 md:grid-cols-2">
				<article class="rounded-2xl border border-stone-200 p-4">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
						Skills
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each data.sharedCatalog.vocabularies.skillProficiencies as entry (entry.slug)}
							<span
								class="rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
							>
								{entry.name}
							</span>
						{/each}
					</div>
				</article>

				<article class="rounded-2xl border border-stone-200 p-4">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
						Saving Throws
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each data.sharedCatalog.vocabularies.savingThrowProficiencies as entry (entry.slug)}
							<span
								class="rounded-full bg-violet-50 px-3 py-2 text-sm text-violet-900"
							>
								{entry.name}
							</span>
						{/each}
					</div>
				</article>

				<article class="rounded-2xl border border-stone-200 p-4">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
						Armor
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each data.sharedCatalog.vocabularies.armorProficiencies as entry (entry.slug)}
							<span
								class="rounded-full bg-stone-100 px-3 py-2 text-sm text-stone-700"
							>
								{entry.name}
							</span>
						{/each}
					</div>
				</article>

				<article class="rounded-2xl border border-stone-200 p-4">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
						Weapons
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each data.sharedCatalog.vocabularies.weaponProficiencies as entry (entry.slug)}
							<span
								class="rounded-full bg-stone-100 px-3 py-2 text-sm text-stone-700"
							>
								{entry.name}
							</span>
						{/each}
					</div>
				</article>

				<article class="rounded-2xl border border-stone-200 p-4 md:col-span-2">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
						Tools
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each data.sharedCatalog.vocabularies.toolProficiencies as entry (entry.slug)}
							<span
								class="rounded-full bg-stone-100 px-3 py-2 text-sm text-stone-700"
							>
								{entry.name}
							</span>
						{/each}
					</div>
				</article>
			</div>
		</div>
	</section>
</div>
