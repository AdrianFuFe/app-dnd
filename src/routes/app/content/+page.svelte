<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
							<h3 class="text-lg font-semibold text-stone-900">{feat.name}</h3>
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
</div>
