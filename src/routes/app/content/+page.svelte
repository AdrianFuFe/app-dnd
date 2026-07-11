<script lang="ts">
	import { resolve } from '$app/paths';
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
	const reviewFeatFieldErrors = $derived(
		(form?.reviewSharedFeatFieldErrors ?? {}) as PrivateFeatFormFieldErrors
	);
	const reviewFeatValues = $derived(
		(form?.reviewSharedFeatValues ?? data.reviewSharedFeatValues) as PrivateFeatFormValues
	);
	const createSpellFieldErrors = $derived(
		(form?.createPrivateSpellFieldErrors ?? {}) as PrivateSpellFormFieldErrors
	);
	const createSpellValues = $derived(
		(form?.createPrivateSpellValues ?? data.createPrivateSpellValues) as PrivateSpellFormValues
	);
	const editSharedFeatId = $derived(
		(form?.editSharedFeatId ?? data.editSharedFeatId) as string | null
	);
	const reviewSharedFeatId = $derived(
		(form?.reviewSharedFeatId ?? data.reviewSharedFeatId) as string | null
	);
	const selectedManagedSharedFeat = $derived(
		editSharedFeatId
			? (data.manageableSharedFeats.find((feat) => feat.id === editSharedFeatId) ?? null)
			: null
	);
	const selectedReviewableSharedFeat = $derived(
		reviewSharedFeatId
			? (data.reviewableSharedFeats.find((feat) => feat.id === reviewSharedFeatId) ?? null)
			: null
	);
	const editSharedSpellId = $derived(
		(form?.editSharedSpellId ?? data.editSharedSpellId) as string | null
	);
	const reviewSharedSpellId = $derived(
		(form?.reviewSharedSpellId ?? data.reviewSharedSpellId) as string | null
	);
	const editSharedSpellFieldErrors = $derived(
		(form?.editSharedSpellFieldErrors ?? {}) as PrivateSpellFormFieldErrors
	);
	const editSharedSpellValues = $derived(
		(form?.editSharedSpellValues ?? data.editSharedSpellValues) as PrivateSpellFormValues
	);
	const reviewSharedSpellFieldErrors = $derived(
		(form?.reviewSharedSpellFieldErrors ?? {}) as PrivateSpellFormFieldErrors
	);
	const reviewSharedSpellValues = $derived(
		(form?.reviewSharedSpellValues ?? data.reviewSharedSpellValues) as PrivateSpellFormValues
	);
	const selectedManagedSharedSpell = $derived(
		editSharedSpellId
			? (data.manageableSharedSpells.find((spell) => spell.id === editSharedSpellId) ?? null)
			: null
	);
	const selectedReviewableSharedSpell = $derived(
		reviewSharedSpellId
			? (data.reviewableSharedSpells.find((spell) => spell.id === reviewSharedSpellId) ?? null)
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

	function formatEditorialStatusLabel(value: string): string {
		switch (value) {
			case 'private_draft':
				return 'Private draft';
			case 'shared_draft':
				return 'Shared draft';
			case 'in_review':
				return 'In review';
			case 'published':
				return 'Published';
			case 'retired':
				return 'Retired';
			default:
				return formatSlugLabel(value);
		}
	}

	function formatContentModeLabel(value: string): string {
		return value === 'canon' ? 'Canon' : 'Custom';
	}

	function getEditorialStatusBadgeClass(value: string): string {
		switch (value) {
			case 'published':
				return 'bg-emerald-100 text-emerald-900';
			case 'retired':
				return 'bg-amber-100 text-amber-900';
			case 'in_review':
				return 'bg-sky-100 text-sky-900';
			case 'shared_draft':
				return 'bg-indigo-100 text-indigo-900';
			default:
				return 'bg-stone-100 text-stone-900';
		}
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
			(grant) =>
				`${formatProficiencyTypeLabel(grant.proficiencyType)}: ${formatSlugLabel(grant.value)}`
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

	function reviewSharedFeatFieldError(field: PrivateFeatFormFieldName) {
		return reviewFeatFieldErrors[field]?.[0];
	}

	function reviewSharedFeatValue(field: PrivateFeatFormFieldName) {
		return reviewFeatValues[field];
	}

	function createPrivateSpellFieldError(field: PrivateSpellFormFieldName) {
		return createSpellFieldErrors[field]?.[0];
	}

	function createPrivateSpellValue(field: PrivateSpellFormFieldName) {
		return createSpellValues[field];
	}

	function editSharedSpellFieldError(field: PrivateSpellFormFieldName) {
		return editSharedSpellFieldErrors[field]?.[0];
	}

	function editSharedSpellValue(field: PrivateSpellFormFieldName) {
		return editSharedSpellValues[field];
	}

	function reviewSharedSpellFieldError(field: PrivateSpellFormFieldName) {
		return reviewSharedSpellFieldErrors[field]?.[0];
	}

	function reviewSharedSpellValue(field: PrivateSpellFormFieldName) {
		return reviewSharedSpellValues[field];
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
		{#if data.roleOperations.canPublishSharedFeats || data.roleOperations.canPublishSystemFeats || data.roleOperations.canPublishSharedSpells || data.roleOperations.canPublishSystemSpells}
			<div
				class="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-sm text-indigo-900"
			>
				<p class="font-medium">
					Role-aware content operations are active for this account.
				</p>
				<p class="mt-2">
					{#if data.roleOperations.canPublishSystemFeats || data.roleOperations.canPublishSystemSpells}
						You can publish shared homebrew spells and feats, and promote approved
						entries into system-owned catalog content.
					{:else}
						You can publish shared homebrew spells and feats for broader reuse, but
						system-owned catalog content remains admin-only.
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

	{#if data.roleOperations.canReviewSharedFeats}
		<section class="grid gap-6 xl:grid-cols-[0.9fr,1fr,1fr]">
			<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<div class="flex items-center justify-between gap-4">
					<div>
						<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
							Shared feat review
						</p>
						<h2 class="mt-2 text-2xl font-semibold text-stone-900">
							Editorial review queue
						</h2>
					</div>
					<p class="text-sm text-stone-500">{data.reviewableSharedFeats.length} waiting</p>
				</div>
				<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
					This queue only shows shared feats currently in review. Editors and admins can
					either publish them into the shared catalog or return them to a private draft for
					revision.
				</p>

				{#if data.reviewableSharedFeats.length === 0}
					<p
						class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
					>
						No shared feats are currently waiting for editorial review.
					</p>
				{:else}
					<div class="mt-6 space-y-4">
						{#each data.reviewableSharedFeats as feat (feat.id)}
							<article class="rounded-2xl border border-stone-200 p-4">
								<div class="flex flex-wrap items-start justify-between gap-3">
									<div>
										<h3 class="text-lg font-semibold text-stone-900">
											{feat.name}
										</h3>
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
										<span
											class={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] ${getEditorialStatusBadgeClass(
												feat.editorialStatus
											)}`}
										>
											{formatEditorialStatusLabel(feat.editorialStatus)}
										</span>
										<span
											class="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-stone-900"
										>
											{formatContentModeLabel(feat.contentMode)}
										</span>
										<a
											class="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-700 transition hover:bg-stone-50"
											href={`?reviewSharedFeat=${encodeURIComponent(feat.id)}`}
										>
											Open review editor
										</a>
										<form method="POST">
											<input type="hidden" name="featId" value={feat.id} />
											<div class="flex flex-wrap gap-2">
												<button
													class="rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-amber-900 transition hover:bg-amber-50"
													type="submit"
													formaction="?/returnReviewedSharedFeat"
												>
													Return to private draft
												</button>
												<button
													class="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-stone-700"
													type="submit"
													formaction="?/publishReviewedSharedFeat"
												>
													Publish now
												</button>
											</div>
										</form>
									</div>
								</div>
								<p class="mt-3 text-sm text-stone-600">
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
				<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
					Review editor
				</p>
				<h2 class="mt-2 text-2xl font-semibold text-stone-900">
					Adjust a feat before publication
				</h2>
				<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
					This editor is specific to entries still in `in_review`. It keeps pre-publication
					editorial work separate from published catalog maintenance.
				</p>

				{#if data.reviewedSharedFeatUpdatedName}
					<p class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
						{data.reviewedSharedFeatUpdatedName} was updated and remains in editorial review.
					</p>
				{/if}
				{#if form?.reviewSharedFeatFormError}
					<p class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{form.reviewSharedFeatFormError}
					</p>
				{/if}

				{#if !reviewSharedFeatId}
					<p class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600">
						Choose a shared feat from the review queue to load it into this pre-publication editor.
					</p>
				{:else}
					<form method="POST" class="mt-6 space-y-4">
						<input type="hidden" name="featId" value={reviewSharedFeatId} />
						<div class="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
							<p class="font-medium text-stone-900">Current editorial state</p>
							<p class="mt-2">
								{selectedReviewableSharedFeat
									? `${formatEditorialStatusLabel(selectedReviewableSharedFeat.editorialStatus)} | ${formatContentModeLabel(selectedReviewableSharedFeat.contentMode)}`
									: 'No shared feat selected.'}
							</p>
						</div>
						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700">Feat name</span>
							<input class="block w-full rounded-lg border-stone-300" name="name" type="text" value={reviewSharedFeatValue('name')} />
							{#if reviewSharedFeatFieldError('name')}<p class="mt-1 text-sm text-red-700">{reviewSharedFeatFieldError('name')}</p>{/if}
						</label>
						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700">Summary</span>
							<input class="block w-full rounded-lg border-stone-300" name="summary" type="text" value={reviewSharedFeatValue('summary')} />
							{#if reviewSharedFeatFieldError('summary')}<p class="mt-1 text-sm text-red-700">{reviewSharedFeatFieldError('summary')}</p>{/if}
						</label>
						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700">Description</span>
							<textarea class="block min-h-28 w-full rounded-lg border-stone-300" name="description">{reviewSharedFeatValue('description')}</textarea>
							{#if reviewSharedFeatFieldError('description')}<p class="mt-1 text-sm text-red-700">{reviewSharedFeatFieldError('description')}</p>{/if}
						</label>
						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700">Prerequisites</span>
							<textarea class="block min-h-28 w-full rounded-lg border-stone-300" name="prerequisitesText">{reviewSharedFeatValue('prerequisitesText')}</textarea>
							<p class="mt-1 text-sm text-stone-500">Use one prerequisite per line.</p>
							{#if reviewSharedFeatFieldError('prerequisitesText')}<p class="mt-1 text-sm text-red-700">{reviewSharedFeatFieldError('prerequisitesText')}</p>{/if}
						</label>
						<button class="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700" type="submit" formaction="?/updateReviewedSharedFeat">
							Save review changes
						</button>
					</form>
				{/if}
			</div>

			<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
					Review editor
				</p>
				<h2 class="mt-2 text-2xl font-semibold text-stone-900">
					Adjust a spell before publication
				</h2>
				<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
					This editor is reserved for entries still in `in_review`, so editorial cleanup
					happens separately from published spell maintenance.
				</p>

				{#if data.reviewedSharedSpellUpdatedName}
					<p class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
						{data.reviewedSharedSpellUpdatedName} was updated and remains in editorial review.
					</p>
				{/if}
				{#if form?.reviewSharedSpellFormError}
					<p class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{form.reviewSharedSpellFormError}
					</p>
				{/if}

				{#if !reviewSharedSpellId}
					<p class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600">
						Choose a shared spell from the review queue to load it into this pre-publication editor.
					</p>
				{:else}
					<form method="POST" class="mt-6 space-y-4">
						<input type="hidden" name="spellId" value={reviewSharedSpellId} />
						<div class="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
							<p class="font-medium text-stone-900">Current editorial state</p>
							<p class="mt-2">
								{selectedReviewableSharedSpell
									? `${formatEditorialStatusLabel(selectedReviewableSharedSpell.editorialStatus)} | ${formatContentModeLabel(selectedReviewableSharedSpell.contentMode)}`
									: 'No shared spell selected.'}
							</p>
						</div>
						<div class="grid gap-4 sm:grid-cols-2">
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700">Spell name</span>
								<input class="block w-full rounded-lg border-stone-300" name="name" type="text" value={reviewSharedSpellValue('name')} />
								{#if reviewSharedSpellFieldError('name')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('name')}</p>{/if}
							</label>
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700">Level</span>
								<input class="block w-full rounded-lg border-stone-300" name="level" type="number" min="0" max="9" value={reviewSharedSpellValue('level')} />
								{#if reviewSharedSpellFieldError('level')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('level')}</p>{/if}
							</label>
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700">School</span>
								<input class="block w-full rounded-lg border-stone-300" name="school" type="text" value={reviewSharedSpellValue('school')} />
								{#if reviewSharedSpellFieldError('school')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('school')}</p>{/if}
							</label>
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700">Casting time</span>
								<input class="block w-full rounded-lg border-stone-300" name="castingTime" type="text" value={reviewSharedSpellValue('castingTime')} />
								{#if reviewSharedSpellFieldError('castingTime')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('castingTime')}</p>{/if}
							</label>
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700">Range</span>
								<input class="block w-full rounded-lg border-stone-300" name="range" type="text" value={reviewSharedSpellValue('range')} />
								{#if reviewSharedSpellFieldError('range')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('range')}</p>{/if}
							</label>
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700">Components</span>
								<input class="block w-full rounded-lg border-stone-300" name="components" type="text" value={reviewSharedSpellValue('components')} />
								{#if reviewSharedSpellFieldError('components')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('components')}</p>{/if}
							</label>
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700">Duration</span>
								<input class="block w-full rounded-lg border-stone-300" name="duration" type="text" value={reviewSharedSpellValue('duration')} />
								{#if reviewSharedSpellFieldError('duration')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('duration')}</p>{/if}
							</label>
							<label class="block sm:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700">Materials</span>
								<input class="block w-full rounded-lg border-stone-300" name="materials" type="text" value={reviewSharedSpellValue('materials')} />
								{#if reviewSharedSpellFieldError('materials')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('materials')}</p>{/if}
							</label>
							<label class="block sm:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700">Class slugs</span>
								<textarea class="block min-h-24 w-full rounded-lg border-stone-300" name="classSlugsText">{reviewSharedSpellValue('classSlugsText')}</textarea>
								{#if reviewSharedSpellFieldError('classSlugsText')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('classSlugsText')}</p>{/if}
							</label>
							<label class="block sm:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700">Summary</span>
								<input class="block w-full rounded-lg border-stone-300" name="summary" type="text" value={reviewSharedSpellValue('summary')} />
								{#if reviewSharedSpellFieldError('summary')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('summary')}</p>{/if}
							</label>
							<label class="block sm:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700">Description</span>
								<textarea class="block min-h-28 w-full rounded-lg border-stone-300" name="description">{reviewSharedSpellValue('description')}</textarea>
								{#if reviewSharedSpellFieldError('description')}<p class="mt-1 text-sm text-red-700">{reviewSharedSpellFieldError('description')}</p>{/if}
							</label>
						</div>
						<div class="flex flex-wrap gap-6">
							<label class="flex items-center gap-3 text-sm text-stone-700">
								<input class="rounded border-stone-300" name="concentration" type="checkbox" checked={reviewSharedSpellValues.concentration} />
								<span>Requires concentration</span>
							</label>
							<label class="flex items-center gap-3 text-sm text-stone-700">
								<input class="rounded border-stone-300" name="ritual" type="checkbox" checked={reviewSharedSpellValues.ritual} />
								<span>Can be cast as a ritual</span>
							</label>
						</div>
						<button class="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700" type="submit" formaction="?/updateReviewedSharedSpell">
							Save review changes
						</button>
					</form>
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
					Editors can update, retire, or delete their own published shared homebrew
					feats. Admins can apply the same lifecycle controls to system-owned entries.
				</p>

				{#if data.updatedSharedFeatName}
					<p
						class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
					>
						{data.updatedSharedFeatName} was updated successfully.
					</p>
				{/if}
				{#if data.retiredSharedFeatName}
					<p
						class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
					>
						{data.retiredSharedFeatName} was retired from the shared catalog.
					</p>
				{/if}
				{#if data.returnedSharedFeatName}
					<p
						class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
					>
						{data.returnedSharedFeatName} was returned to a private draft for revision.
					</p>
				{/if}
				{#if data.deletedSharedFeatName}
					<p
						class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
					>
						{data.deletedSharedFeatName} was deleted from shared content.
					</p>
				{/if}

				{#if form?.editSharedFeatFormError}
					<p
						class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
					>
						{form.editSharedFeatFormError}
					</p>
				{/if}

				{#if !editSharedFeatId}
					<p
						class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
					>
						Choose a shared feat from the maintenance list to load it into this editor.
					</p>
				{:else}
					<form method="POST" class="mt-6 space-y-4">
						<input type="hidden" name="featId" value={editSharedFeatId} />

						<div class="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
							<p class="font-medium text-stone-900">Current editorial state</p>
							<p class="mt-2">
								{selectedManagedSharedFeat
									? `${formatEditorialStatusLabel(selectedManagedSharedFeat.editorialStatus)} | ${formatContentModeLabel(selectedManagedSharedFeat.contentMode)}`
									: 'No shared feat selected.'}
							</p>
						</div>

						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700"
								>Feat name</span
							>
							<input
								class="block w-full rounded-lg border-stone-300"
								name="name"
								type="text"
								value={editSharedFeatValue('name')}
							/>
							{#if editSharedFeatFieldError('name')}
								<p class="mt-1 text-sm text-red-700">
									{editSharedFeatFieldError('name')}
								</p>
							{/if}
						</label>

						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700"
								>Summary</span
							>
							<input
								class="block w-full rounded-lg border-stone-300"
								name="summary"
								type="text"
								value={editSharedFeatValue('summary')}
							/>
							{#if editSharedFeatFieldError('summary')}
								<p class="mt-1 text-sm text-red-700">
									{editSharedFeatFieldError('summary')}
								</p>
							{/if}
						</label>

						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700"
								>Description</span
							>
							<textarea
								class="block min-h-28 w-full rounded-lg border-stone-300"
								name="description">{editSharedFeatValue('description')}</textarea
							>
							{#if editSharedFeatFieldError('description')}
								<p class="mt-1 text-sm text-red-700">
									{editSharedFeatFieldError('description')}
								</p>
							{/if}
						</label>

						<label class="block">
							<span class="mb-1 block text-sm font-medium text-stone-700"
								>Prerequisites</span
							>
							<textarea
								class="block min-h-28 w-full rounded-lg border-stone-300"
								name="prerequisitesText"
								>{editSharedFeatValue('prerequisitesText')}</textarea
							>
							<p class="mt-1 text-sm text-stone-500">
								Use one prerequisite per line. Updates are revalidated before
								saving.
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
							Retiring moves this entry from `published` to `retired` and removes it
							from shared browsing without permanently deleting the stored row.
							Deleting removes it permanently from managed shared content.
						</p>
						<p class="mt-2 text-sm leading-6 text-amber-900">
							{#if selectedManagedSharedFeat?.isSystemContent}
								This entry is system-owned, so only admin users should apply
								destructive actions here.
							{:else}
								This action scope is limited to the shared feat you selected and
								should be used only when it should no longer stay in the shared
								catalog.
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

	{#if data.roleOperations.canReviewSharedSpells}
		<section class="grid gap-6 xl:grid-cols-[0.9fr,1fr,1fr]">
			<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<div class="flex items-center justify-between gap-4">
					<div>
						<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
							Shared spell review
						</p>
						<h2 class="mt-2 text-2xl font-semibold text-stone-900">
							Editorial spell queue
						</h2>
					</div>
					<p class="text-sm text-stone-500">{data.reviewableSharedSpells.length} waiting</p>
				</div>
				<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
					This queue only shows shared spells currently in review. Editors and admins can
					either publish them into the shared catalog or return them to a private draft for
					revision.
				</p>

				{#if data.reviewableSharedSpells.length === 0}
					<p
						class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
					>
						No shared spells are currently waiting for editorial review.
					</p>
				{:else}
					<div class="mt-6 space-y-4">
						{#each data.reviewableSharedSpells as spell (spell.id)}
							<article class="rounded-2xl border border-stone-200 p-4">
								<div class="flex flex-wrap items-start justify-between gap-3">
									<div>
										<h3 class="text-lg font-semibold text-stone-900">
											{spell.name}
										</h3>
										<p class="mt-1 text-sm text-stone-500">
											slug: {spell.slug}
										</p>
									</div>
									<div class="flex flex-wrap items-center gap-2">
										<span
											class={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] ${
												spell.isSystemContent
													? 'bg-fuchsia-100 text-fuchsia-900'
													: 'bg-indigo-100 text-indigo-900'
											}`}
										>
											{spell.isSystemContent ? 'System' : 'Shared'}
										</span>
										<span
											class={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] ${getEditorialStatusBadgeClass(
												spell.editorialStatus
											)}`}
										>
											{formatEditorialStatusLabel(spell.editorialStatus)}
										</span>
										<span
											class="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-stone-900"
										>
											{formatContentModeLabel(spell.contentMode)}
										</span>
										<span
											class="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-900"
										>
											{formatSpellLevel(spell.level)}
										</span>
										<a
											class="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-700 transition hover:bg-stone-50"
											href={`?reviewSharedSpell=${encodeURIComponent(spell.id)}`}
										>
											Open review editor
										</a>
										<form method="POST">
											<input type="hidden" name="spellId" value={spell.id} />
											<div class="flex flex-wrap gap-2">
												<button
													class="rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-amber-900 transition hover:bg-amber-50"
													type="submit"
													formaction="?/returnReviewedSharedSpell"
												>
													Return to private draft
												</button>
												<button
													class="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-stone-700"
													type="submit"
													formaction="?/publishReviewedSharedSpell"
												>
													Publish now
												</button>
											</div>
										</form>
									</div>
								</div>
								<p class="mt-3 text-sm text-stone-600">
									{spell.summary ?? spell.description ?? 'No summary yet.'}
								</p>
								<p class="mt-4 text-xs uppercase tracking-[0.16em] text-stone-500">
									Classes: {formatClassList(spell.classSlugs)}
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
					Update a managed shared spell
				</h2>
				<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
					Editors can update, retire, or delete their own published shared homebrew
					spells. Admins can apply the same lifecycle controls to system-owned spell
					entries.
				</p>

				{#if data.updatedSharedSpellName}
					<p
						class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
					>
						{data.updatedSharedSpellName} was updated successfully.
					</p>
				{/if}
				{#if data.retiredSharedSpellName}
					<p
						class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
					>
						{data.retiredSharedSpellName} was retired from the shared catalog.
					</p>
				{/if}
				{#if data.returnedSharedSpellName}
					<p
						class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
					>
						{data.returnedSharedSpellName} was returned to a private draft for revision.
					</p>
				{/if}
				{#if data.deletedSharedSpellName}
					<p
						class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
					>
						{data.deletedSharedSpellName} was deleted from shared content.
					</p>
				{/if}

				{#if form?.editSharedSpellFormError}
					<p
						class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
					>
						{form.editSharedSpellFormError}
					</p>
				{/if}

				{#if !editSharedSpellId}
					<p
						class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
					>
						Choose a shared spell from the maintenance list to load it into this editor.
					</p>
				{:else}
					<form method="POST" class="mt-6 space-y-4">
						<input type="hidden" name="spellId" value={editSharedSpellId} />

						<div class="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
							<p class="font-medium text-stone-900">Current editorial state</p>
							<p class="mt-2">
								{selectedManagedSharedSpell
									? `${formatEditorialStatusLabel(selectedManagedSharedSpell.editorialStatus)} | ${formatContentModeLabel(selectedManagedSharedSpell.contentMode)}`
									: 'No shared spell selected.'}
							</p>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<label class="block sm:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Spell name</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									name="name"
									type="text"
									value={editSharedSpellValue('name')}
								/>
								{#if editSharedSpellFieldError('name')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('name')}
									</p>
								{/if}
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Level</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									name="level"
									type="number"
									min="0"
									max="9"
									value={editSharedSpellValue('level')}
								/>
								{#if editSharedSpellFieldError('level')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('level')}
									</p>
								{/if}
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>School</span
								>
								<select
									class="block w-full rounded-lg border-stone-300"
									name="school"
									value={editSharedSpellValue('school')}
								>
									<option value="">Choose a spell school</option>
									{#each data.sharedCatalog.vocabularies.spellSchools as school (school.slug)}
										<option value={school.slug}>{school.name}</option>
									{/each}
								</select>
								{#if editSharedSpellFieldError('school')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('school')}
									</p>
								{/if}
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Casting time</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									name="castingTime"
									type="text"
									value={editSharedSpellValue('castingTime')}
								/>
								{#if editSharedSpellFieldError('castingTime')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('castingTime')}
									</p>
								{/if}
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Range</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									name="range"
									type="text"
									value={editSharedSpellValue('range')}
								/>
								{#if editSharedSpellFieldError('range')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('range')}
									</p>
								{/if}
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Components</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									name="components"
									type="text"
									value={editSharedSpellValue('components')}
								/>
								{#if editSharedSpellFieldError('components')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('components')}
									</p>
								{/if}
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Duration</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									name="duration"
									type="text"
									value={editSharedSpellValue('duration')}
								/>
								{#if editSharedSpellFieldError('duration')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('duration')}
									</p>
								{/if}
							</label>

							<label class="block sm:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Materials</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									name="materials"
									type="text"
									value={editSharedSpellValue('materials')}
								/>
								{#if editSharedSpellFieldError('materials')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('materials')}
									</p>
								{/if}
							</label>

							<label class="block sm:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Class slugs</span
								>
								<textarea
									class="block min-h-24 w-full rounded-lg border-stone-300"
									name="classSlugsText"
									>{editSharedSpellValue('classSlugsText')}</textarea
								>
								{#if editSharedSpellFieldError('classSlugsText')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('classSlugsText')}
									</p>
								{/if}
							</label>

							<label class="block sm:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Summary</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									name="summary"
									type="text"
									value={editSharedSpellValue('summary')}
								/>
								{#if editSharedSpellFieldError('summary')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('summary')}
									</p>
								{/if}
							</label>

							<label class="block sm:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Description</span
								>
								<textarea
									class="block min-h-28 w-full rounded-lg border-stone-300"
									name="description"
									>{editSharedSpellValue('description')}</textarea
								>
								{#if editSharedSpellFieldError('description')}
									<p class="mt-1 text-sm text-red-700">
										{editSharedSpellFieldError('description')}
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
									checked={editSharedSpellValues.concentration}
								/>
								<span>Requires concentration</span>
							</label>
							<label class="flex items-center gap-3 text-sm text-stone-700">
								<input
									class="rounded border-stone-300"
									name="ritual"
									type="checkbox"
									checked={editSharedSpellValues.ritual}
								/>
								<span>Can be cast as a ritual</span>
							</label>
						</div>

						<button
							class="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
							type="submit"
							formaction="?/updateSharedSpell"
						>
							Save shared spell changes
						</button>
					</form>

					<div class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
						<p class="text-sm font-medium text-amber-950">Lifecycle controls</p>
						<p class="mt-2 text-sm leading-6 text-amber-900">
							Retiring moves this entry from `published` to `retired` and removes it
							from shared browsing without permanently deleting the stored row.
							Deleting removes it permanently from managed shared content.
						</p>
						<p class="mt-2 text-sm leading-6 text-amber-900">
							{#if selectedManagedSharedSpell?.isSystemContent}
								This entry is system-owned, so only admin users should apply
								destructive actions here.
							{:else}
								This action scope is limited to the shared spell you selected and
								should be used only when it should no longer stay in the shared
								catalog.
							{/if}
						</p>
						<div class="mt-4 flex flex-wrap gap-3">
							<form method="POST">
								<input type="hidden" name="spellId" value={editSharedSpellId} />
								<button
									class="rounded-lg border border-amber-300 bg-white px-4 py-3 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
									type="submit"
									formaction="?/retireSharedSpell"
								>
									Retire from shared catalog
								</button>
							</form>
							<form method="POST">
								<input type="hidden" name="spellId" value={editSharedSpellId} />
								<button
									class="rounded-lg bg-rose-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-600"
									type="submit"
									formaction="?/deleteSharedSpell"
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
			<h2 class="mt-2 text-2xl font-semibold text-stone-900">Create your own feat draft</h2>
			<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
				This first private content workflow is owner-scoped. New feats created here stay
				private to your account and do not modify the shared SRD catalog.
			</p>

			{#if data.createdPrivateFeatName}
				<p
					class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
				>
					{data.createdPrivateFeatName} was created as a private feat.
				</p>
			{/if}
			{#if data.derivedPrivateFeatName}
				<p
					class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"
				>
					{data.derivedPrivateFeatName} was copied from the shared SRD catalog into your private
					feats.
				</p>
			{/if}
			{#if data.submittedSharedFeatName}
				<p
					class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"
				>
					{data.submittedSharedFeatName} was submitted for editorial review.
				</p>
			{/if}
			{#if data.publishedSharedFeatName}
				<p
					class="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
				>
					{data.publishedSharedFeatName} is now published for shared reuse.
				</p>
			{/if}
			{#if data.publishedSystemFeatName}
				<p
					class="mt-4 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-800"
				>
					{data.publishedSystemFeatName} was published as system-owned content.
				</p>
			{/if}

			{#if form?.createPrivateFeatFormError}
				<p
					class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
				>
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
						<p class="mt-1 text-sm text-red-700">
							{createPrivateFeatFieldError('name')}
						</p>
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
						<p class="mt-1 text-sm text-red-700">
							{createPrivateFeatFieldError('summary')}
						</p>
					{/if}
				</label>

				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">Description</span>
					<textarea
						class="block min-h-28 w-full rounded-lg border-stone-300"
						name="description"
						placeholder="Describe what this feat changes for the character."
						>{createPrivateFeatValue('description')}</textarea
					>
					{#if createPrivateFeatFieldError('description')}
						<p class="mt-1 text-sm text-red-700">
							{createPrivateFeatFieldError('description')}
						</p>
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
						>{createPrivateFeatValue('prerequisitesText')}</textarea
					>
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
					formaction="?/createPrivateFeat"
				>
					Create private feat
				</button>
				{#if data.roleOperations.canSubmitSharedFeats || data.roleOperations.canPublishSharedFeats || data.roleOperations.canPublishSystemFeats}
					<div
						class="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4"
					>
						<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
							Editorial actions
						</p>
						<p class="mt-2 text-sm text-stone-600">
							These actions reuse the same validated private draft, but apply
							different editorial outcomes. Shared publish keeps the entry reusable for
							trusted maintenance. System publish promotes it into canon-like
							system-owned content.
						</p>
						<div class="mt-4 flex flex-wrap gap-3">
							{#if data.roleOperations.canSubmitSharedFeats}
								<button
									class="rounded-lg border border-sky-300 bg-white px-5 py-3 text-sm font-medium text-sky-900 transition hover:bg-sky-50"
									type="submit"
									formaction="?/submitSharedFeat"
								>
									Submit for editorial review
								</button>
							{/if}
							{#if data.roleOperations.canPublishSharedFeats}
								<button
									class="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
									type="submit"
									formaction="?/publishSharedFeat"
								>
									Publish now as shared feat
								</button>
							{/if}
							{#if data.roleOperations.canPublishSystemFeats}
								<button
									class="rounded-lg bg-fuchsia-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-fuchsia-600"
									type="submit"
									formaction="?/publishSystemFeat"
								>
									Promote now to system feat
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
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">Owner-scoped feat drafts</h2>
				</div>
				<p class="text-sm text-stone-500">{data.privateFeats.length} total</p>
			</div>

			{#if data.privateFeats.length === 0}
				<p
					class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
				>
					No private feats yet. Create one from the form to start building personal
					content without touching the shared SRD baseline.
				</p>
			{:else}
				<div class="mt-6 space-y-4">
					{#each data.privateFeats as feat (feat.id)}
						<article class="rounded-2xl border border-stone-200 p-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h3 class="text-lg font-semibold text-stone-900">
										{feat.name}
									</h3>
									<p class="mt-1 text-sm text-stone-500">slug: {feat.slug}</p>
								</div>
								<div class="flex flex-wrap gap-2">
									<span
										class="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-amber-900"
									>
										Private
									</span>
									<span
										class={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] ${getEditorialStatusBadgeClass(
											feat.editorialStatus
										)}`}
									>
										{formatEditorialStatusLabel(feat.editorialStatus)}
									</span>
									<span
										class="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-stone-900"
									>
										{formatContentModeLabel(feat.contentMode)}
									</span>
									{#if feat.derivation}
										<span
											class="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-sky-900"
										>
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
										<p
											class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500"
										>
											Spellcasting: {formatSpellcastingSummary(
												option.mechanicSummary
											)}
										</p>
									{/if}
									{#if formatProficiencyGrantSummary(option.mechanicSummary)}
										<p
											class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500"
										>
											Proficiencies: {formatProficiencyGrantSummary(
												option.mechanicSummary
											)}
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
										<p
											class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500"
										>
											Languages: {formatLanguageGrantSummary(
												option.mechanicSummary
											)}
										</p>
									{/if}
									{#if formatProficiencyGrantSummary(option.mechanicSummary)}
										<p
											class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500"
										>
											Proficiencies: {formatProficiencyGrantSummary(
												option.mechanicSummary
											)}
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
								<div class="flex flex-wrap items-start justify-end gap-3">
									<div
										class="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-600"
									>
										{#if spell.isSystemContent}
											<span
												class="rounded-full bg-fuchsia-100 px-3 py-1 text-fuchsia-900"
											>
												System
											</span>
										{:else if spell.visibility === 'shared'}
											<span
												class="rounded-full bg-indigo-100 px-3 py-1 text-indigo-900"
											>
												Shared
											</span>
										{/if}
										<span
											class="rounded-full bg-amber-100 px-3 py-1 text-amber-900"
										>
											{formatSpellLevel(spell.level)}
										</span>
										<span
											class="rounded-full bg-sky-100 px-3 py-1 text-sky-900"
										>
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
									<form method="POST">
										<input
											type="hidden"
											name="sharedSpellId"
											value={spell.id}
										/>
										<button
											class="rounded-full bg-stone-900 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-white transition hover:bg-stone-700"
											type="submit"
											formaction="?/deriveSpell"
										>
											Copy to private
										</button>
									</form>
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
			<h2 class="mt-2 text-2xl font-semibold text-stone-900">Create your own spell draft</h2>
			<p class="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
				This first spell workflow stays owner-scoped. Shared SRD spells remain browseable
				below, while new drafts created here stay private to your account.
			</p>

			{#if data.createdPrivateSpellName}
				<p
					class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
				>
					{data.createdPrivateSpellName} was created as a private spell.
				</p>
			{/if}
			{#if data.derivedPrivateSpellName}
				<p
					class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"
				>
					{data.derivedPrivateSpellName} was copied from the shared SRD spell catalog into your
					private spells.
				</p>
			{/if}
			{#if data.submittedSharedSpellName}
				<p
					class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"
				>
					{data.submittedSharedSpellName} was submitted for editorial review.
				</p>
			{/if}
			{#if data.publishedSharedSpellName}
				<p
					class="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800"
				>
					{data.publishedSharedSpellName} is now published for shared reuse.
				</p>
			{/if}
			{#if data.publishedSystemSpellName}
				<p
					class="mt-4 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm text-fuchsia-800"
				>
					{data.publishedSystemSpellName} was published as system-owned content.
				</p>
			{/if}

			{#if form?.createPrivateSpellFormError}
				<p
					class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
				>
					{form.createPrivateSpellFormError}
				</p>
			{/if}

			<form method="POST" class="mt-6 space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="block sm:col-span-2">
						<span class="mb-1 block text-sm font-medium text-stone-700">Spell name</span
						>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="name"
							type="text"
							value={createPrivateSpellValue('name')}
							placeholder="Arc Light"
						/>
						{#if createPrivateSpellFieldError('name')}
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('name')}
							</p>
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
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('level')}
							</p>
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
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('school')}
							</p>
						{/if}
					</label>

					<label class="block">
						<span class="mb-1 block text-sm font-medium text-stone-700"
							>Casting time</span
						>
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
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('range')}
							</p>
						{/if}
					</label>

					<label class="block">
						<span class="mb-1 block text-sm font-medium text-stone-700">Components</span
						>
						<input
							class="block w-full rounded-lg border-stone-300"
							name="components"
							type="text"
							value={createPrivateSpellValue('components')}
							placeholder="V, S, M"
						/>
						<p class="mt-1 text-sm text-stone-500">
							Use a comma-separated list of V, S, and M.
						</p>
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
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('duration')}
							</p>
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
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('materials')}
							</p>
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
							>{createPrivateSpellValue('classSlugsText')}</textarea
						>
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
							<p class="mt-1 text-sm text-red-700">
								{createPrivateSpellFieldError('summary')}
							</p>
						{/if}
					</label>

					<label class="block sm:col-span-2">
						<span class="mb-1 block text-sm font-medium text-stone-700"
							>Description</span
						>
						<textarea
							class="block min-h-28 w-full rounded-lg border-stone-300"
							name="description"
							placeholder="Describe the spell effect in player-facing terms."
							>{createPrivateSpellValue('description')}</textarea
						>
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
				{#if data.roleOperations.canSubmitSharedSpells || data.roleOperations.canPublishSharedSpells || data.roleOperations.canPublishSystemSpells}
					<div
						class="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4"
					>
						<p class="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
							Editorial actions
						</p>
						<p class="mt-2 text-sm text-stone-600">
							These actions reuse the same validated private draft, but apply
							different editorial outcomes. Shared publish keeps the spell reusable for
							trusted maintenance. System publish promotes it into canon-like
							system-owned content.
						</p>
						<div class="mt-4 flex flex-wrap gap-3">
							{#if data.roleOperations.canSubmitSharedSpells}
								<button
									class="rounded-lg border border-sky-300 bg-white px-5 py-3 text-sm font-medium text-sky-900 transition hover:bg-sky-50"
									type="submit"
									formaction="?/submitSharedSpell"
								>
									Submit for editorial review
								</button>
							{/if}
							{#if data.roleOperations.canPublishSharedSpells}
								<button
									class="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
									type="submit"
									formaction="?/publishSharedSpell"
								>
									Publish now as shared spell
								</button>
							{/if}
							{#if data.roleOperations.canPublishSystemSpells}
								<button
									class="rounded-lg bg-fuchsia-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-fuchsia-600"
									type="submit"
									formaction="?/publishSystemSpell"
								>
									Promote now to system spell
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
						Your private spells
					</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">
						Owner-scoped spell drafts
					</h2>
				</div>
				<p class="text-sm text-stone-500">{data.privateSpells.length} total</p>
			</div>

			{#if data.privateSpells.length === 0}
				<p
					class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
				>
					No private spells yet. Create one from the form to start building personal spell
					content without changing the shared SRD spell catalog.
				</p>
			{:else}
				<div class="mt-6 space-y-4">
					{#each data.privateSpells as spell (spell.id)}
						<article class="rounded-2xl border border-stone-200 p-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h3 class="text-lg font-semibold text-stone-900">
										{spell.name}
									</h3>
									<p class="mt-1 text-sm text-stone-500">slug: {spell.slug}</p>
								</div>
								<div
									class="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.14em]"
								>
									<span
										class="rounded-full bg-amber-100 px-3 py-1 text-amber-900"
									>
										Private
									</span>
									<span
										class={`rounded-full px-3 py-1 ${getEditorialStatusBadgeClass(
											spell.editorialStatus
										)}`}
									>
										{formatEditorialStatusLabel(spell.editorialStatus)}
									</span>
									<span
										class="rounded-full bg-stone-100 px-3 py-1 text-stone-900"
									>
										{formatContentModeLabel(spell.contentMode)}
									</span>
									{#if spell.derivation}
										<span
											class="rounded-full bg-sky-100 px-3 py-1 text-sky-900"
										>
											Derived
										</span>
									{/if}
									<span class="rounded-full bg-sky-100 px-3 py-1 text-sky-900">
										{formatSpellLevel(spell.level)}
									</span>
									<span
										class="rounded-full bg-stone-100 px-3 py-1 text-stone-900"
									>
										{formatSlugLabel(spell.school)}
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

							<p class="mt-3 text-sm text-stone-600">
								{spell.summary ?? spell.description ?? 'No summary yet.'}
							</p>
							{#if spell.derivation}
								<p class="mt-3 text-xs uppercase tracking-[0.16em] text-stone-500">
									Derived from {spell.derivation.source}: {spell.derivation.name}
								</p>
							{/if}

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
