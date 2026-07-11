<script lang="ts">
	import { resolve } from '$app/paths';
	import { calculateAbilityModifier } from '$lib/domain/ability-modifier';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let deleteConfirmed = $state(false);
	let deleteConfirmationName = $state('');
	let deletePromptError = $state<string | null>(null);

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

	function findEquipmentCatalogEntry(equipmentId: string | undefined) {
		return data.equipmentCatalog.find((entry) => entry.id === equipmentId);
	}

	function formatRuleset(value: string): string {
		return value === 'dnd-2014-srd' ? 'DnD 2014 SRD' : value;
	}

	function isDeleteReady(): boolean {
		return deleteConfirmed && deleteConfirmationName.trim() === data.character.name;
	}

	function guardDeleteSubmit(event: SubmitEvent) {
		if (isDeleteReady()) {
			deletePromptError = null;
			return;
		}

		event.preventDefault();
		deletePromptError = 'Confirm the delete checkbox and type the exact character name.';
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
				<span
					class="rounded-full bg-stone-100 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-700"
				>
					{formatRuleset(data.character.rulesetCode)}
				</span>
				<span
					class="rounded-full bg-emerald-100 px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-emerald-800"
				>
					{data.character.contentMode}
				</span>
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

		{#if data.createdName}
			<p
				class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
			>
				{data.createdName} was created successfully.
			</p>
		{/if}

		{#if data.guidedHandoff}
			<div class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
				<p class="text-sm font-semibold text-amber-950">Guided build saved</p>
				<p class="mt-2 max-w-2xl text-sm leading-6 text-amber-900">
					This draft was created through the guided path. You can keep it on the canonical
					track as-is, or continue in the full editor when you want to tune attacks,
					spells, inventory, or other fields beyond the guided baseline.
				</p>
				<p class="mt-2 text-sm leading-6 text-amber-900">
					Further manual changes may move the character from <strong>canon</strong> to
					<strong>custom</strong> for the same ruleset.
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<a
						class="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-400"
						href={resolve(`/app/characters/${data.character.id}/edit`)}
					>
						Continue In Full Editor
					</a>
					<a
						class="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-950 transition hover:border-amber-400"
						href={resolve('/app/characters')}
					>
						Back To Gallery
					</a>
				</div>
			</div>
		{/if}

		{#if form?.formError}
			<p
				class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
			>
				{form.formError}
			</p>
		{/if}

		<div class="mt-6 grid gap-3 md:grid-cols-4">
			<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
				<p class="text-sm font-medium text-stone-500">Level</p>
				<p class="mt-2 text-2xl font-semibold text-stone-900">{data.character.level}</p>
			</div>
			<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
				<p class="text-sm font-medium text-stone-500">Structured attacks</p>
				<p class="mt-2 text-2xl font-semibold text-stone-900">
					{data.character.attackItems.length}
				</p>
			</div>
			<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
				<p class="text-sm font-medium text-stone-500">Structured spells</p>
				<p class="mt-2 text-2xl font-semibold text-stone-900">
					{data.character.spellItems.length}
				</p>
			</div>
			<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
				<p class="text-sm font-medium text-stone-500">Inventory rows</p>
				<p class="mt-2 text-2xl font-semibold text-stone-900">
					{data.character.inventoryItems.length}
				</p>
			</div>
		</div>

		<div class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4">
			<p class="text-sm font-semibold text-rose-900">Delete draft</p>
			<p class="mt-2 max-w-2xl text-sm leading-6 text-rose-800">
				Remove this character draft and its current MVP slices from your private roster.
				This action now requires explicit confirmation.
			</p>
			<form class="mt-4" method="POST" action="?/delete" onsubmit={guardDeleteSubmit}>
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-rose-900">
						Type the character name to confirm
					</span>
					<input
						class="block w-full rounded-lg border-rose-300 bg-white"
						type="text"
						name="confirmName"
						bind:value={deleteConfirmationName}
					/>
				</label>
				<label class="mt-4 inline-flex items-center gap-3">
					<input
						class="rounded border-rose-300 text-rose-700 focus:ring-rose-500"
						type="checkbox"
						name="confirmDelete"
						bind:checked={deleteConfirmed}
					/>
					<span class="text-sm font-medium text-rose-900">
						I understand this deletes the draft permanently
					</span>
				</label>
				{#if deletePromptError}
					<p class="mt-4 text-sm text-rose-800">{deletePromptError}</p>
				{/if}
				<button
					class="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-300"
					type="submit"
					disabled={!isDeleteReady()}
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
									{#if item.equipmentId}
										<span
											class="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-800"
										>
											Catalog item
										</span>
									{/if}
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
								{#if findEquipmentCatalogEntry(item.equipmentId)}
									<p
										class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500"
									>
										{findEquipmentCatalogEntry(item.equipmentId)?.category}
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
				<h2 class="text-xl font-semibold text-stone-900">
					Attacks, Spells, Feats, And Notes
				</h2>
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
										{#if attack.equipmentId}
											<span
												class="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium uppercase tracking-[0.16em] text-sky-800"
											>
												Catalog weapon
											</span>
										{/if}
										{#if findEquipmentCatalogEntry(attack.equipmentId)?.properties.length}
											<p
												class="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500"
											>
												{findEquipmentCatalogEntry(
													attack.equipmentId
												)?.properties.join(' | ')}
											</p>
										{/if}
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
										{#if formatSpellMeta( [spell.level !== undefined ? (spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`) : undefined, spell.school, spell.castingTime, spell.range, spell.duration] )}
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
							<p class="mt-2 text-sm leading-7 text-stone-700">
								No feats recorded yet.
							</p>
						{:else}
							<div class="mt-3 space-y-3">
								{#each data.character.featItems as feat (`${feat.name}-${feat.featId ?? ''}`)}
									<div
										class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
									>
										<p class="text-base font-semibold text-stone-900">
											{feat.name}
										</p>
										{#if feat.description}
											<p
												class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700"
											>
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
						{#if data.character.noteItems.length === 0}
							<p class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700">
								{optionalText(data.character.notes)}
							</p>
						{:else}
							<div class="mt-3 space-y-3">
								{#each data.character.noteItems as note (`${note.title}-${note.content}`)}
									<div
										class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
									>
										<p class="text-base font-semibold text-stone-900">
											{note.title}
										</p>
										<p
											class="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700"
										>
											{note.content}
										</p>
									</div>
								{/each}
							</div>
						{/if}
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
