<script lang="ts">
	import CharacterCreateForm from '$lib/components/forms/character-create-form.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
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
		<div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
			<p class="text-sm font-semibold text-amber-950">Guided-to-custom handoff</p>
			<p class="mt-2 max-w-3xl text-sm leading-6 text-amber-900">
				If this character started in the guided creator, this editor is the next step for
				deeper control. Changes here can intentionally move the draft beyond the canonical
				guided baseline while keeping the same ruleset.
			</p>
		</div>
	</section>

	<CharacterCreateForm
		catalog={data.catalog}
		equipmentCatalog={data.equipmentCatalog}
		featCatalog={data.featCatalog}
		spellCatalog={data.spellCatalog}
		values={form?.values ?? data.values}
		errors={form?.fieldErrors ?? {}}
		formError={form?.formError}
		submitLabel="Save changes"
		cancelHref={`/app/characters/${data.characterId}`}
		cancelLabel="Back to detail"
	/>
</div>
