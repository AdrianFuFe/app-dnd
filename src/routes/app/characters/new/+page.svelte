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
	<section class="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
			New character
		</p>
		<h1 class="mt-3 text-3xl font-semibold text-emerald-950">
			Start with the guided creator.
		</h1>
		<p class="mt-3 max-w-3xl text-base leading-7 text-emerald-900">
			The recommended path is the guided level-1 creator for `dnd-2014-srd`. It keeps the
			flow canonical by default, applies supported rules automatically, and narrows the work
			to the choices that still need your input.
		</p>
		<div class="mt-5 flex flex-wrap gap-3 text-sm">
			<span class="rounded-full border border-emerald-300 bg-white px-3 py-1 font-medium text-emerald-900">
				Recommended
			</span>
			<span class="rounded-full border border-emerald-300 bg-white px-3 py-1 font-medium text-emerald-900">
				Level 1
			</span>
			<span class="rounded-full border border-emerald-300 bg-white px-3 py-1 font-medium text-emerald-900">
				Canon by default
			</span>
		</div>
	</section>

	<section class="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Guided creator</p>
		<h2 class="mt-3 text-2xl font-semibold text-stone-900">
			Character Creation V1 Guided
		</h2>
		<p class="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
			This flow is the primary recommended path for a new structured character. It targets
			`dnd-2014-srd`, level 1, canonical progression, and automatic application of supported
			species, class, background, and granted-content rules.
		</p>
		<p class="mt-3 max-w-3xl text-sm leading-7 text-stone-500">
			The broader manual builder still lives below as the fallback advanced path when you
			need direct control over unsupported or custom details.
		</p>
	</section>

	<CharacterGuidedCreateForm
		catalog={data.guidedCatalog}
		values={form?.guidedValues ?? data.guidedValues}
		errors={form?.guidedFieldErrors}
		formError={form?.guidedFormError}
	/>

	<section class="rounded-3xl border border-stone-200 bg-stone-50 p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Advanced fallback</p>
		<h2 class="mt-3 text-2xl font-semibold text-stone-900">Manual structured draft builder</h2>
		<p class="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
			Use this broader editor only when you need direct control over attacks, spells,
			inventory, feats, and notes beyond what the guided creator currently covers.
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
