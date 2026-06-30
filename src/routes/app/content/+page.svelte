<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function formatSpellLevel(level: number): string {
		return level === 0 ? 'Cantrip' : `Level ${level}`;
	}

	function formatClassList(classSlugs: string[]): string {
		return classSlugs.length > 0 ? classSlugs.join(', ') : 'General';
	}

	function formatPrerequisites(prerequisites: string[]): string {
		return prerequisites.length > 0 ? prerequisites.join(' | ') : 'None';
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
			This protected area now exposes the structured spell and feat slices already seeded into
			the app so future character and admin flows can build on a real read model.
		</p>
		<div class="mt-6 grid gap-4 sm:grid-cols-2">
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Spells</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">{data.catalog.spells.length}</p>
				<p class="mt-2 text-sm text-stone-600">
					Sorted by level and ready for future selection UI.
				</p>
			</div>
			<div class="rounded-2xl bg-stone-100 p-4">
				<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Feats</p>
				<p class="mt-2 text-3xl font-semibold text-stone-900">{data.catalog.feats.length}</p>
				<p class="mt-2 text-sm text-stone-600">
					Includes prerequisite text so later validation can stay catalog-backed.
				</p>
			</div>
		</div>
	</section>

	<section class="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Spells</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">SRD-backed spell entries</h2>
				</div>
				<p class="text-sm text-stone-500">{data.catalog.spells.length} total</p>
			</div>

			{#if data.catalog.spells.length === 0}
				<p class="mt-6 text-sm text-stone-600">No shared spell entries are available yet.</p>
			{:else}
				<div class="mt-6 space-y-4">
					{#each data.catalog.spells as spell (spell.id)}
						<article class="rounded-2xl border border-stone-200 p-4">
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h3 class="text-lg font-semibold text-stone-900">{spell.name}</h3>
									<p class="mt-1 text-sm text-stone-600">
										{spell.summary ?? 'No summary yet.'}
									</p>
								</div>
								<div
									class="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-600"
								>
									<span class="rounded-full bg-amber-100 px-3 py-1 text-amber-900">
										{formatSpellLevel(spell.level)}
									</span>
									<span class="rounded-full bg-sky-100 px-3 py-1 text-sky-900">
										{spell.school}
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

		<div class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<div class="flex items-center justify-between gap-4">
				<div>
					<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Feats</p>
					<h2 class="mt-2 text-2xl font-semibold text-stone-900">Reusable feat entries</h2>
				</div>
				<p class="text-sm text-stone-500">{data.catalog.feats.length} total</p>
			</div>

			{#if data.catalog.feats.length === 0}
				<p class="mt-6 text-sm text-stone-600">No shared feat entries are available yet.</p>
			{:else}
				<div class="mt-6 space-y-4">
					{#each data.catalog.feats as feat (feat.id)}
						<article class="rounded-2xl border border-stone-200 p-4">
							<h3 class="text-lg font-semibold text-stone-900">{feat.name}</h3>
							<p class="mt-2 text-sm text-stone-600">
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
	</section>
</div>
