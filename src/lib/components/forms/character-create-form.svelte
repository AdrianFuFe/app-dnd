<script lang="ts">
	import type { CharacterCreateFormValues } from '$lib/domain/characters/character-form';
	import type { CharacterCreationCatalog } from '$lib/types/content/character-catalog';

	type CharacterFieldErrors = Partial<Record<keyof CharacterCreateFormValues, string[]>>;

	let {
		catalog,
		values,
		errors = {},
		formError
	}: {
		catalog: CharacterCreationCatalog;
		values: CharacterCreateFormValues;
		errors?: CharacterFieldErrors;
		formError?: string;
	} = $props();

	const abilityFields = [
		{ name: 'strength', label: 'Strength' },
		{ name: 'dexterity', label: 'Dexterity' },
		{ name: 'constitution', label: 'Constitution' },
		{ name: 'intelligence', label: 'Intelligence' },
		{ name: 'wisdom', label: 'Wisdom' },
		{ name: 'charisma', label: 'Charisma' }
	] as const;

	const combatFields = [
		{ name: 'maxHp', label: 'Max HP', min: 1 },
		{ name: 'currentHp', label: 'Current HP', min: 0 },
		{ name: 'temporaryHp', label: 'Temporary HP', min: 0 },
		{ name: 'armorClass', label: 'Armor Class', min: 0 },
		{ name: 'initiative', label: 'Initiative' },
		{ name: 'speed', label: 'Speed', min: 0 }
	] as const;

	function firstError(field: keyof CharacterCreateFormValues): string | undefined {
		return errors[field]?.[0];
	}

	function selectedSpeciesSummary(speciesId: string): string | undefined {
		return catalog.speciesOptions.find((option) => option.id === speciesId)?.summary ?? undefined;
	}

	function selectedClassDetails(classId: string): string | undefined {
		const option = catalog.classOptions.find((entry) => entry.id === classId);

		if (!option) {
			return undefined;
		}

		const hitDie = `Hit die d${option.hitDie}`;
		return option.summary ? `${hitDie}. ${option.summary}` : hitDie;
	}
</script>

<form method="POST" class="space-y-8">
	{#if formError}
		<p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{formError}
		</p>
	{/if}

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="space-y-1">
			<h2 class="text-xl font-semibold text-stone-900">Identity</h2>
			<p class="text-sm text-stone-600">
				Use structured catalog selections for species and class while the rest of the MVP
				stays lightweight and editable.
			</p>
		</div>

		<div class="mt-6 grid gap-4 md:grid-cols-2">
			<label class="block md:col-span-2">
				<span class="mb-1 block text-sm font-medium text-stone-700">Name</span>
				<input
					class="block w-full rounded-lg border-stone-300"
					type="text"
					name="name"
					required
					value={values.name}
				/>
				{#if firstError('name')}
					<p class="mt-1 text-sm text-red-700">{firstError('name')}</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Species</span>
				<select class="block w-full rounded-lg border-stone-300" name="speciesId" value={values.speciesId}>
					<option value="">Select a species</option>
					{#each catalog.speciesOptions as option}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if selectedSpeciesSummary(values.speciesId)}
					<p class="mt-1 text-sm text-stone-500">{selectedSpeciesSummary(values.speciesId)}</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Subrace</span>
				<input
					class="block w-full rounded-lg border-stone-300"
					type="text"
					name="subrace"
					value={values.subrace}
				/>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Class</span>
				<select class="block w-full rounded-lg border-stone-300" name="classId" value={values.classId}>
					<option value="">Select a class</option>
					{#each catalog.classOptions as option}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if selectedClassDetails(values.classId)}
					<p class="mt-1 text-sm text-stone-500">{selectedClassDetails(values.classId)}</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Subclass</span>
				<input
					class="block w-full rounded-lg border-stone-300"
					type="text"
					name="subclass"
					value={values.subclass}
				/>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Level</span>
				<input
					class="block w-full rounded-lg border-stone-300"
					type="number"
					name="level"
					required
					min="1"
					max="20"
					value={values.level}
				/>
				{#if firstError('level')}
					<p class="mt-1 text-sm text-red-700">{firstError('level')}</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Background</span>
				<input
					class="block w-full rounded-lg border-stone-300"
					type="text"
					name="background"
					value={values.background}
				/>
			</label>

			<label class="block md:col-span-2">
				<span class="mb-1 block text-sm font-medium text-stone-700">Story</span>
				<textarea class="block min-h-32 w-full rounded-lg border-stone-300" name="story"
					>{values.story}</textarea
				>
			</label>
		</div>
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="space-y-1">
			<h2 class="text-xl font-semibold text-stone-900">Ability Scores</h2>
			<p class="text-sm text-stone-600">Use the first stat block for the character draft.</p>
		</div>

		<div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each abilityFields as field}
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">{field.label}</span>
					<input
						class="block w-full rounded-lg border-stone-300"
						type="number"
						name={field.name}
						required
						min="1"
						max="30"
						value={values[field.name]}
					/>
					{#if firstError(field.name)}
						<p class="mt-1 text-sm text-red-700">{firstError(field.name)}</p>
					{/if}
				</label>
			{/each}
		</div>
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="space-y-1">
			<h2 class="text-xl font-semibold text-stone-900">Combat Snapshot</h2>
			<p class="text-sm text-stone-600">
				Keep this first pass manual and lightweight so character creation stays unblocked.
			</p>
		</div>

		<div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each combatFields as field}
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">{field.label}</span>
					<input
						class="block w-full rounded-lg border-stone-300"
						type="number"
						name={field.name}
						required
						min={'min' in field ? field.min : undefined}
						value={values[field.name]}
					/>
					{#if firstError(field.name)}
						<p class="mt-1 text-sm text-red-700">{firstError(field.name)}</p>
					{/if}
				</label>
			{/each}

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Hit Dice</span>
				<input
					class="block w-full rounded-lg border-stone-300"
					type="text"
					name="hitDice"
					value={values.hitDice}
				/>
			</label>
		</div>
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="space-y-1">
			<h2 class="text-xl font-semibold text-stone-900">Free-Text Sections</h2>
			<p class="text-sm text-stone-600">
				These are stored as text for the MVP and can become richer data later.
			</p>
		</div>

		<div class="mt-6 grid gap-4 lg:grid-cols-2">
			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Attacks</span>
				<textarea class="block min-h-32 w-full rounded-lg border-stone-300" name="attacks"
					>{values.attacks}</textarea
				>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Spells</span>
				<textarea class="block min-h-32 w-full rounded-lg border-stone-300" name="spells"
					>{values.spells}</textarea
				>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Inventory</span>
				<textarea class="block min-h-32 w-full rounded-lg border-stone-300" name="inventory"
					>{values.inventory}</textarea
				>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Notes</span>
				<textarea class="block min-h-32 w-full rounded-lg border-stone-300" name="notes"
					>{values.notes}</textarea
				>
			</label>
		</div>
	</section>

	<div class="flex flex-wrap gap-3">
		<button
			class="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
			type="submit"
		>
			Create character
		</button>
		<a
			class="rounded-lg border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-400"
			href="/app/characters"
		>
			Back to characters
		</a>
	</div>
</form>
