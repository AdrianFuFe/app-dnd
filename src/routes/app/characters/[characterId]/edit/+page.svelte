<script lang="ts">
	import CharacterCreateForm from '$lib/components/forms/character-create-form.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function hasManualFormState(): boolean {
		return Boolean(form?.formError) || Object.keys(form?.fieldErrors ?? {}).length > 0;
	}
</script>

<svelte:head>
	<title>App DnD | Edit {data.characterName}</title>
</svelte:head>

<div class="space-y-6">
	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Edit character</p>
		<h1 class="mt-3 text-3xl font-semibold text-stone-900">{data.characterName}</h1>
		<p class="mt-3 max-w-3xl text-base leading-7 text-stone-600">
			Update the same MVP identity, stats, combat, structured attacks, structured spells,
			structured notes, and structured inventory flow used during creation, now anchored to
			this saved draft.
		</p>
		{#if data.guidedHandoff}
			<div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
				<p class="text-sm font-semibold text-amber-950">Guided-to-custom handoff</p>
				<p class="mt-2 max-w-3xl text-sm leading-6 text-amber-900">
					This character came from the guided creator. This editor is the next step for
					deeper control over attacks, spells, inventory, and other structured fields.
				</p>
				<p class="mt-2 max-w-3xl text-sm leading-6 text-amber-900">
					Changes here can intentionally move the draft beyond the canonical guided
					baseline while keeping the same ruleset.
				</p>
			</div>

			<div
				class="mt-4 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4"
				data-testid="guided-current-edit-state"
			>
				<div class="flex flex-wrap items-center gap-3">
					<p class="text-sm font-semibold text-violet-950">Current edit state</p>
					<span
						class="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] {data.currentEditState.contentMode === 'canon'
							? 'border-emerald-300 bg-emerald-100 text-emerald-900'
							: 'border-violet-300 bg-white text-violet-900'}"
					>
						{data.currentEditState.contentMode}
					</span>
				</div>
				<p class="mt-2 max-w-3xl text-sm leading-6 text-violet-900">
					{data.currentEditState.statusSummary}
				</p>
				{#if data.currentEditState.reasonLines.length > 0}
					<ul class="mt-3 space-y-2 text-sm text-violet-900">
						{#each data.currentEditState.reasonLines as line}
							<li>{line}</li>
						{/each}
					</ul>
				{/if}
			</div>

			{#if data.guidedOriginSummary}
				<div
					class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4"
					data-testid="guided-origin-summary"
				>
					<p class="text-sm font-semibold text-sky-950">Guided origin snapshot</p>
					<p class="mt-2 max-w-3xl text-sm leading-6 text-sky-900">
						{data.guidedOriginSummary.statusSummary}
					</p>

					<div class="mt-4 grid gap-3 md:grid-cols-3">
						<div class="rounded-2xl border border-sky-200 bg-white px-4 py-3">
							<p class="text-xs font-medium uppercase tracking-[0.15em] text-sky-700">
								Lineage path
							</p>
							<p class="mt-2 text-sm font-semibold text-sky-950">
								{data.guidedOriginSummary.lineageSummary || 'Not recorded'}
							</p>
						</div>
						<div class="rounded-2xl border border-sky-200 bg-white px-4 py-3">
							<p class="text-xs font-medium uppercase tracking-[0.15em] text-sky-700">
								Class path
							</p>
							<p class="mt-2 text-sm font-semibold text-sky-950">
								{data.guidedOriginSummary.classSummary || 'Not recorded'}
							</p>
						</div>
						<div class="rounded-2xl border border-sky-200 bg-white px-4 py-3">
							<p class="text-xs font-medium uppercase tracking-[0.15em] text-sky-700">
								Background
							</p>
							<p class="mt-2 text-sm font-semibold text-sky-950">
								{data.guidedOriginSummary.backgroundSummary || 'Not recorded'}
							</p>
						</div>
					</div>

					<div class="mt-4 grid gap-4 xl:grid-cols-2">
						<div class="rounded-2xl border border-sky-200 bg-white px-4 py-4">
							<p class="text-sm font-semibold text-sky-950">Auto-applied during guided creation</p>
							{#if data.guidedOriginSummary.grantLines.length === 0}
								<p class="mt-2 text-sm leading-6 text-sky-900">
									No preserved guided grants were found on this draft.
								</p>
							{:else}
								<ul class="mt-3 space-y-2 text-sm text-sky-900">
									{#each data.guidedOriginSummary.grantLines as line}
										<li>{line}</li>
									{/each}
								</ul>
							{/if}
						</div>

						<div class="rounded-2xl border border-sky-200 bg-white px-4 py-4">
							<p class="text-sm font-semibold text-sky-950">Chosen during guided creation</p>
							{#if data.guidedOriginSummary.choiceLines.length === 0}
								<p class="mt-2 text-sm leading-6 text-sky-900">
									No preserved guided choices were found on this draft.
								</p>
							{:else}
								<ul class="mt-3 space-y-2 text-sm text-sky-900">
									{#each data.guidedOriginSummary.choiceLines as line}
										<li>{line}</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</section>

	<CharacterCreateForm
		catalog={data.catalog}
		equipmentCatalog={data.equipmentCatalog}
		featCatalog={data.featCatalog}
		spellCatalog={data.spellCatalog}
		guidedOrigin={data.guidedHandoff}
		guidedInventoryAdopted={data.guidedInventoryAdopted}
		guidedInventoryAdoptHref={data.guidedInventoryAdoptHref}
		guidedNoteAdopted={data.guidedNoteAdopted}
		guidedNoteAdoptHref={data.guidedNoteAdoptHref}
		guidedInventoryPreviewItems={data.guidedInventoryPreviewItems}
		guidedNotePreviewItems={data.guidedNotePreviewItems}
		values={hasManualFormState() ? (form?.values ?? data.values) : data.values}
		errors={form?.fieldErrors ?? {}}
		formError={form?.formError}
		submitLabel="Save changes"
		cancelHref={`/app/characters/${data.characterId}`}
		cancelLabel="Back to detail"
	/>
</div>
