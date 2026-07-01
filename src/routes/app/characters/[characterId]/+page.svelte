<script lang="ts">
	import { resolve } from '$app/paths';
	import { calculateAbilityModifier } from '$lib/domain/ability-modifier';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const abilityFields = [
		{ key: 'strength', label: 'STR' },
		{ key: 'dexterity', label: 'DEX' },
		{ key: 'constitution', label: 'CON' },
		{ key: 'intelligence', label: 'INT' },
		{ key: 'wisdom', label: 'WIS' },
		{ key: 'charisma', label: 'CHA' }
	] as const;

	function formatModifier(score: number): string {
		const modifier = calculateAbilityModifier(score);
		return modifier >= 0 ? `+${modifier}` : `${modifier}`;
	}

	function optionalText(value: string | undefined, fallback = 'Not provided yet.'): string {
		return value?.trim() ? value : fallback;
	}

	function formatInventoryMeta(
		value: string | number | undefined,
		suffix?: string
	): string | undefined {
		if (value === undefined || value === '') {
			return undefined;
		}

		return suffix ? `${value} ${suffix}` : String(value);
	}

	function formatAttackMeta(values: Array<string | undefined>): string {
		return values.filter((value) => value && value.trim().length > 0).join(' | ');
	}

	function formatSpellMeta(values: Array<string | undefined>): string {
		return values.filter((value) => value && value.trim().length > 0).join(' | ');
	}
</script>

<svelte:head>
	<title>App DnD | {data.character.name}</title>
</svelte:head>

<div class="space-y-6">
	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div>
				<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
					Character detail
				</p>
				<h1 class="mt-3 text-3xl font-semibold text-stone-900">{data.character.name}</h1>
				<p class="mt-3 max-w-3xl text-base leading-7 text-stone-600">
					Level {data.character.level}
					{#if data.character.race}
						{data.character.race}
					{/if}
					{#if data.character.className}
						{data.character.className}
					{/if}
				</p>
			</div>

			<div class="flex flex-wrap gap-3">
				<a
					class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400"
					href={resolve('/app/characters')}
				>
					Back to characters
				</a>
				<a
					class="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
					href={resolve(`/app/characters/${data.character.id}/edit`)}
				>
					Edit character
				</a>
			</div>
		</div>

		{#if data.updatedName}
			<p
				class="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800"
			>
				{data.updatedName} was updated successfully.
			</p>
		{/if}

		{#if form?.formError}
			<p
				class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
			>
				{form.formError}
			</p>
		{/if}

		<div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
			<p class="text-sm font-semibold text-rose-900">Delete draft</p>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-rose-800">
				Remove this character draft and its current MVP slices from your private roster.
			</p>
			<form class="mt-4" method="POST" action="?/delete">
				<button
					class="rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800"
					type="submit"
				>
					Delete character
				</button>
			</form>
		</div>
	</section>

	<section class="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
		<div class="space-y-4">
			<article class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<h2 class="text-xl font-semibold text-stone-900">Identity</h2>
				<div class="mt-6 grid gap-4 md:grid-cols-2">
					<div>
						<p class="text-sm font-medium text-stone-500">Species</p>
						<p class="mt-1 text-base text-stone-900">
							{data.character.race ?? 'Unspecified ancestry'}
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-stone-500">Subrace</p>
						<p class="mt-1 text-base text-stone-900">
							{optionalText(data.character.subrace)}
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-stone-500">Class</p>
						<p class="mt-1 text-base text-stone-900">
							{optionalText(data.character.className)}
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-stone-500">Subclass</p>
						<p class="mt-1 text-base text-stone-900">
							{optionalText(data.character.subclass)}
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-stone-500">Background</p>
						<p class="mt-1 text-base text-stone-900">
							{optionalText(data.character.background)}
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-stone-500">Last updated</p>
						<p class="mt-1 text-base text-stone-900">
							{new Date(data.character.updatedAt).toLocaleString()}
						</p>
					</div>
				</div>

				<div class="mt-6">
					<p class="text-sm font-medium text-stone-500">Story</p>
					<p class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
						{optionalText(data.character.story)}
					</p>
				</div>
			</article>

			<article class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<h2 class="text-xl font-semibold text-stone-900">Inventory</h2>
				{#if data.character.inventoryItems.length === 0}
					<p class="mt-6 text-sm leading-7 text-stone-600">
						No inventory items recorded yet.
					</p>
				{:else}
					<div class="mt-6 space-y-3">
						{#each data.character.inventoryItems as item (`${item.name}-${item.quantity}`)}
							<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
								<div class="flex flex-wrap items-center gap-2">
									<p class="text-base font-semibold text-stone-900">
										{item.quantity > 1 ? `${item.quantity} x ` : ''}{item.name}
									</p>
									{#if item.isEquipped}
										<span
											class="rounded-full bg-stone-900 px-2 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white"
										>
											Equipped
										</span>
									{/if}
								</div>
								{#if formatInventoryMeta(item.value) || formatInventoryMeta(item.weight, 'lb')}
									<p class="mt-2 text-sm text-stone-600">
										{[
											formatInventoryMeta(item.value),
											formatInventoryMeta(item.weight, 'lb')
										]
											.filter(Boolean)
											.join(' | ')}
									</p>
								{/if}
								{#if item.description}
									<p
										class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700"
									>
										{item.description}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</article>

			<article class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<h2 class="text-xl font-semibold text-stone-900">Attacks, Spells, And Notes</h2>
				<div class="mt-6 space-y-6">
					<div>
						<p class="text-sm font-medium text-stone-500">Attacks</p>
						{#if data.character.attackItems.length === 0}
							<p class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
								{optionalText(data.character.attacks)}
							</p>
						{:else}
							<div class="mt-3 space-y-3">
								{#each data.character.attackItems as attack (`${attack.name}-${attack.damage ?? ''}`)}
									<div
										class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
									>
										<p class="text-base font-semibold text-stone-900">
											{attack.name}
										</p>
										{#if formatAttackMeta( [attack.attackBonus, attack.damageType ? `${attack.damage ?? ''} ${attack.damageType}`.trim() : attack.damage, attack.range] )}
											<p class="mt-2 text-sm text-stone-600">
												{formatAttackMeta([
													attack.attackBonus,
													attack.damageType
														? `${attack.damage ?? ''} ${attack.damageType}`.trim()
														: attack.damage,
													attack.range
												])}
											</p>
										{/if}
										{#if attack.description}
											<p
												class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700"
											>
												{attack.description}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<div>
						<p class="text-sm font-medium text-stone-500">Spells</p>
						{#if data.character.spellItems.length === 0}
							<p class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
								{optionalText(data.character.spells)}
							</p>
						{:else}
							<div class="mt-3 space-y-3">
								{#each data.character.spellItems as spell (`${spell.name}-${spell.level ?? ''}`)}
									<div
										class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
									>
										<div class="flex flex-wrap items-center gap-2">
											<p class="text-base font-semibold text-stone-900">
												{spell.name}
											</p>
											{#if spell.isPrepared}
												<span
													class="rounded-full bg-stone-900 px-2 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white"
												>
													Prepared
												</span>
											{/if}
										</div>
										{#if formatSpellMeta([
											spell.level !== undefined
												? spell.level === 0
													? 'Cantrip'
													: `Level ${spell.level}`
												: undefined,
											spell.school,
											spell.castingTime,
											spell.range,
											spell.duration
										])}
											<p class="mt-2 text-sm text-stone-600">
												{formatSpellMeta([
													spell.level !== undefined
														? spell.level === 0
															? 'Cantrip'
															: `Level ${spell.level}`
														: undefined,
													spell.school,
													spell.castingTime,
													spell.range,
													spell.duration
												])}
											</p>
										{/if}
										{#if spell.components}
											<p class="mt-2 text-sm text-stone-600">
												Components: {spell.components}
											</p>
										{/if}
										{#if spell.description}
											<p
												class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700"
											>
												{spell.description}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<div>
						<p class="text-sm font-medium text-stone-500">Feats</p>
						{#if data.character.featItems.length === 0}
							<p class="mt-2 text-sm leading-7 text-stone-700">No feats recorded yet.</p>
						{:else}
							<div class="mt-3 space-y-3">
								{#each data.character.featItems as feat (`${feat.name}-${feat.featId ?? ''}`)}
									<div
										class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
									>
										<p class="text-base font-semibold text-stone-900">{feat.name}</p>
										{#if feat.description}
											<p class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
												{feat.description}
											</p>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
					<div>
						<p class="text-sm font-medium text-stone-500">Notes</p>
						<p class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
							{optionalText(data.character.notes)}
						</p>
					</div>
				</div>
			</article>
		</div>

		<div class="space-y-4">
			<article class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<h2 class="text-xl font-semibold text-stone-900">Ability Scores</h2>
				<div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
					{#each abilityFields as field (field.key)}
						<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
							<div class="flex items-center justify-between gap-3">
								<p class="text-sm font-medium text-stone-500">{field.label}</p>
								<p class="text-sm font-semibold text-stone-700">
									{formatModifier(data.character[field.key])}
								</p>
							</div>
							<p class="mt-2 text-2xl font-semibold text-stone-900">
								{data.character[field.key]}
							</p>
						</div>
					{/each}
				</div>
			</article>

			<article class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
				<h2 class="text-xl font-semibold text-stone-900">Combat Snapshot</h2>
				<div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
					<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
						<p class="text-sm font-medium text-stone-500">Hit Points</p>
						<p class="mt-2 text-lg font-semibold text-stone-900">
							{data.character.currentHp} / {data.character.maxHp}
						</p>
						<p class="mt-1 text-sm text-stone-600">
							Temp HP: {data.character.temporaryHp}
						</p>
					</div>
					<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
						<p class="text-sm font-medium text-stone-500">Armor Class</p>
						<p class="mt-2 text-2xl font-semibold text-stone-900">
							{data.character.armorClass}
						</p>
					</div>
					<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
						<p class="text-sm font-medium text-stone-500">Initiative</p>
						<p class="mt-2 text-2xl font-semibold text-stone-900">
							{data.character.initiative >= 0
								? `+${data.character.initiative}`
								: data.character.initiative}
						</p>
					</div>
					<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
						<p class="text-sm font-medium text-stone-500">Speed</p>
						<p class="mt-2 text-2xl font-semibold text-stone-900">
							{data.character.speed}
						</p>
					</div>
					<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
						<p class="text-sm font-medium text-stone-500">Hit Dice</p>
						<p class="mt-2 text-lg font-semibold text-stone-900">
							{optionalText(data.character.hitDice)}
						</p>
					</div>
				</div>
			</article>
		</div>
	</section>
</div>
