<script lang="ts">
	import CharacterCreateForm from '$lib/components/forms/character-create-form.svelte';
	import CharacterGuidedCreateForm from '$lib/components/forms/character-guided-create-form.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<svelte:head>
	<title>App DnD | New Character</title>
</svelte:head>

<div class="space-y-6">
	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">New character</p>
		<h1 class="mt-3 text-3xl font-semibold text-stone-900">Create a structured character draft.</h1>
		<p class="mt-3 max-w-3xl text-base leading-7 text-stone-600">
			This is the current manual builder: it stores identity, ability scores, combat
			basics, structured attacks, structured spells, structured notes, and a structured
			inventory so you can keep building owned characters while the guided creator is
			prepared.
		</p>
	</section>

	<section class="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Guided creator</p>
		<h2 class="mt-3 text-2xl font-semibold text-amber-950">
			`Character Creation V1 Guided` is the next planned path.
		</h2>
		<p class="mt-3 max-w-3xl text-sm leading-7 text-amber-900">
			The design contract for the first guided flow is now documented in
			<code>docs/19-character-creation-v1-guided-design.md</code>. The planned first
			release targets `dnd-2014-srd`, level 1, canonical progression, and automatic
			application of supported species, class, background, and granted-content rules.
		</p>
	</section>

	<CharacterGuidedCreateForm
		catalog={data.guidedCatalog}
		values={form?.guidedValues ?? data.guidedValues}
		errors={form?.guidedFieldErrors}
		formError={form?.guidedFormError}
	/>

	<section class="rounded-3xl border border-stone-200 bg-stone-50 p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Manual fallback</p>
		<h2 class="mt-3 text-2xl font-semibold text-stone-900">Structured draft builder</h2>
		<p class="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
			Use this broader editor when you need direct control over attacks, spells, inventory,
			feats, and notes before the guided flow covers more rule-driven choice points.
		</p>
	</section>

	<CharacterCreateForm
		action="?/manual"
		catalog={data.catalog}
		equipmentCatalog={data.equipmentCatalog}
		featCatalog={data.featCatalog}
		spellCatalog={data.spellCatalog}
		values={form?.values ?? data.values}
		errors={form?.fieldErrors}
		formError={form?.formError}
	/>
</div>
