<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>App DnD | Characters</title>
</svelte:head>

<div class="space-y-6">
	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div>
				<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
					Characters
				</p>
				<h1 class="mt-3 text-3xl font-semibold text-stone-900">
					Character management starts here.
				</h1>
				<p class="mt-3 max-w-3xl text-base leading-7 text-stone-600">
					Create personal character drafts with the first MVP fields, then iterate on
					deeper content wiring in the next blocks.
				</p>
			</div>

			<a
				class="inline-flex rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
				href={resolve('/app/characters/new')}
			>
				New character
			</a>
		</div>

		{#if data.createdName}
			<p
				class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
			>
				{data.createdName} was created successfully.
			</p>
		{/if}

		{#if data.updatedName}
			<p
				class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"
			>
				{data.updatedName} was updated successfully.
			</p>
		{/if}

		{#if data.deletedName}
			<p
				class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
			>
				{data.deletedName} was deleted successfully.
			</p>
		{/if}
	</section>

	{#if data.characters.length === 0}
		<section class="rounded-3xl border border-dashed border-stone-300 bg-stone-50 p-6">
			<h2 class="text-lg font-semibold text-stone-900">No characters yet</h2>
			<p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
				Your private roster is empty. Start with one draft and the app will keep the first
				identity, stats, combat, and structured notes slices together.
			</p>
		</section>
	{:else}
		<section class="grid gap-4 lg:grid-cols-2">
			{#each data.characters as character (character.id)}
				<article class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
					<div class="flex items-start justify-between gap-4">
						<div>
							<p class="text-sm font-medium text-stone-500">
								Level {character.level}
							</p>
							<h2 class="mt-2 text-2xl font-semibold text-stone-900">
								{character.name}
							</h2>
							<p class="mt-3 text-sm leading-6 text-stone-600">
								{character.race ?? 'Unspecified ancestry'}
								{#if character.className}
									- {character.className}
								{/if}
							</p>
						</div>

						<a
							class="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400"
							href={resolve(`/app/characters/${character.id}`)}
						>
							View details
						</a>
					</div>
				</article>
			{/each}
		</section>
	{/if}
</div>
