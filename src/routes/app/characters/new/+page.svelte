<script lang="ts">
	import CharacterCreateForm from '$lib/components/forms/character-create-form.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
</script>

<svelte:head>
	<title>App DnD | New Character</title>
</svelte:head>

<div class="space-y-6">
	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">New character</p>
		<h1 class="mt-3 text-3xl font-semibold text-stone-900">Create your first draft.</h1>
		<p class="mt-3 max-w-3xl text-base leading-7 text-stone-600">
			This MVP flow stores identity, ability scores, combat basics, and free-text sections so
			you can start building owned characters before deeper rules automation arrives.
		</p>
	</section>

	<CharacterCreateForm
		catalog={data.catalog}
		values={form?.values ?? data.values}
		errors={form?.fieldErrors}
		formError={form?.formError}
	/>
</div>
