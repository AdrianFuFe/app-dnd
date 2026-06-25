<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		createCharacterFormValues,
		type CharacterCreateFormValues
	} from '$lib/domain/characters/character-form';
	import type { CharacterCreationCatalog } from '$lib/types/content/character-catalog';

	type CharacterFieldErrors = Partial<Record<keyof CharacterCreateFormValues, string[]>>;
	type CharacterCancelHref = '/app/characters' | `/app/characters/${string}`;
	type InventoryFormItem = {
		name: string;
		quantity: string;
		description: string;
		weight: string;
		value: string;
		isEquipped: boolean;
	};

	let {
		catalog,
		values,
		errors = {},
		formError,
		submitLabel = 'Create character',
		cancelHref = '/app/characters',
		cancelLabel = 'Back to characters'
	}: {
		catalog: CharacterCreationCatalog;
		values: CharacterCreateFormValues;
		errors?: CharacterFieldErrors;
		formError?: string;
		submitLabel?: string;
		cancelHref?: CharacterCancelHref;
		cancelLabel?: string;
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

	let formValues = $state(createCharacterFormValues());
	let inventoryItems = $state<InventoryFormItem[]>([]);

	$effect(() => {
		formValues = { ...values };
		inventoryItems = parseInventoryItems(values.inventoryItems);
	});

	function firstError(field: keyof CharacterCreateFormValues): string | undefined {
		return errors[field]?.[0];
	}

	function selectedSpecies(speciesId: string) {
		return catalog.speciesOptions.find((option) => option.id === speciesId);
	}

	function selectedSpeciesSummary(speciesId: string): string | undefined {
		return selectedSpecies(speciesId)?.summary ?? undefined;
	}

	function availableSubspeciesOptions(speciesId: string) {
		const speciesSlug = selectedSpecies(speciesId)?.slug;
		return speciesSlug
			? catalog.subspeciesOptions.filter((option) => option.speciesSlug === speciesSlug)
			: [];
	}

	function selectedSubspeciesSummary(subspeciesId: string): string | undefined {
		return (
			catalog.subspeciesOptions.find((option) => option.id === subspeciesId)?.summary ??
			undefined
		);
	}

	function selectedClassDetails(classId: string): string | undefined {
		const option = catalog.classOptions.find((entry) => entry.id === classId);

		if (!option) {
			return undefined;
		}

		const hitDie = `Hit die d${option.hitDie}`;
		return option.summary ? `${hitDie}. ${option.summary}` : hitDie;
	}

	function selectedClass(classId: string) {
		return catalog.classOptions.find((entry) => entry.id === classId);
	}

	function availableSubclassOptions(classId: string) {
		const classSlug = selectedClass(classId)?.slug;
		return classSlug
			? catalog.subclassOptions.filter((option) => option.classSlug === classSlug)
			: [];
	}

	function selectedSubclassSummary(subclassId: string): string | undefined {
		return (
			catalog.subclassOptions.find((option) => option.id === subclassId)?.summary ?? undefined
		);
	}

	function selectedBackgroundSummary(backgroundId: string): string | undefined {
		return (
			catalog.backgroundOptions.find((option) => option.id === backgroundId)?.summary ??
			undefined
		);
	}

	function handleSpeciesChange(event: Event) {
		const nextSpeciesId = (event.currentTarget as HTMLSelectElement).value;

		if (nextSpeciesId !== formValues.speciesId) {
			formValues.subspeciesId = '';
		}

		formValues.speciesId = nextSpeciesId;
	}

	function handleClassChange(event: Event) {
		const nextClassId = (event.currentTarget as HTMLSelectElement).value;

		if (nextClassId !== formValues.classId) {
			formValues.subclassId = '';
		}

		formValues.classId = nextClassId;
	}

	function addInventoryItem() {
		inventoryItems = [
			...inventoryItems,
			{
				name: '',
				quantity: '1',
				description: '',
				weight: '',
				value: '',
				isEquipped: false
			}
		];
	}

	function removeInventoryItem(index: number) {
		inventoryItems = inventoryItems.filter((_, itemIndex) => itemIndex !== index);
	}

	function inventoryItemsFieldValue(): string {
		return JSON.stringify(
			inventoryItems.map((item) => ({
				name: item.name,
				quantity: item.quantity.trim().length > 0 ? Number(item.quantity) : 1,
				description: item.description,
				weight: item.weight.trim().length > 0 ? Number(item.weight) : undefined,
				value: item.value,
				isEquipped: item.isEquipped
			}))
		);
	}

	function parseInventoryItems(value: string): InventoryFormItem[] {
		if (!value.trim()) {
			return [];
		}

		try {
			const parsed = JSON.parse(value);

			if (!Array.isArray(parsed)) {
				return [];
			}

			return parsed.map((item) => ({
				name: typeof item?.name === 'string' ? item.name : '',
				quantity:
					typeof item?.quantity === 'number' || typeof item?.quantity === 'string'
						? String(item.quantity)
						: '1',
				description: typeof item?.description === 'string' ? item.description : '',
				weight:
					typeof item?.weight === 'number' || typeof item?.weight === 'string'
						? String(item.weight)
						: '',
				value: typeof item?.value === 'string' ? item.value : '',
				isEquipped: item?.isEquipped === true
			}));
		} catch {
			return [];
		}
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
				Use structured catalog selections for ancestry, class path, and background while the
				rest of the MVP stays lightweight and editable.
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
					bind:value={formValues.name}
				/>
				{#if firstError('name')}
					<p class="mt-1 text-sm text-red-700">{firstError('name')}</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Species</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="speciesId"
					bind:value={formValues.speciesId}
					onchange={handleSpeciesChange}
				>
					<option value="">Select a species</option>
					{#each catalog.speciesOptions as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('speciesId')}
					<p class="mt-1 text-sm text-red-700">{firstError('speciesId')}</p>
				{:else if selectedSpeciesSummary(formValues.speciesId)}
					<p class="mt-1 text-sm text-stone-500">
						{selectedSpeciesSummary(formValues.speciesId)}
					</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Subspecies</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="subspeciesId"
					bind:value={formValues.subspeciesId}
					onchange={(event) => {
						formValues.subspeciesId = (event.currentTarget as HTMLSelectElement).value;
					}}
				>
					<option value="">Select a subspecies</option>
					{#each availableSubspeciesOptions(formValues.speciesId) as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('subspeciesId')}
					<p class="mt-1 text-sm text-red-700">{firstError('subspeciesId')}</p>
				{:else if selectedSubspeciesSummary(formValues.subspeciesId)}
					<p class="mt-1 text-sm text-stone-500">
						{selectedSubspeciesSummary(formValues.subspeciesId)}
					</p>
				{:else if formValues.speciesId && availableSubspeciesOptions(formValues.speciesId).length === 0}
					<p class="mt-1 text-sm text-stone-500">
						No catalog subspecies are available for this species yet.
					</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Class</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="classId"
					bind:value={formValues.classId}
					onchange={handleClassChange}
				>
					<option value="">Select a class</option>
					{#each catalog.classOptions as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('classId')}
					<p class="mt-1 text-sm text-red-700">{firstError('classId')}</p>
				{:else if selectedClassDetails(formValues.classId)}
					<p class="mt-1 text-sm text-stone-500">
						{selectedClassDetails(formValues.classId)}
					</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Subclass</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="subclassId"
					bind:value={formValues.subclassId}
					onchange={(event) => {
						formValues.subclassId = (event.currentTarget as HTMLSelectElement).value;
					}}
				>
					<option value="">Select a subclass</option>
					{#each availableSubclassOptions(formValues.classId) as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('subclassId')}
					<p class="mt-1 text-sm text-red-700">{firstError('subclassId')}</p>
				{:else if selectedSubclassSummary(formValues.subclassId)}
					<p class="mt-1 text-sm text-stone-500">
						{selectedSubclassSummary(formValues.subclassId)}
					</p>
				{:else if formValues.classId && availableSubclassOptions(formValues.classId).length === 0}
					<p class="mt-1 text-sm text-stone-500">
						No catalog subclasses are available for this class yet.
					</p>
				{/if}
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
					bind:value={formValues.level}
				/>
				{#if firstError('level')}
					<p class="mt-1 text-sm text-red-700">{firstError('level')}</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Background</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="backgroundId"
					bind:value={formValues.backgroundId}
					onchange={(event) => {
						formValues.backgroundId = (event.currentTarget as HTMLSelectElement).value;
					}}
				>
					<option value="">Select a background</option>
					{#each catalog.backgroundOptions as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('backgroundId')}
					<p class="mt-1 text-sm text-red-700">{firstError('backgroundId')}</p>
				{:else if selectedBackgroundSummary(formValues.backgroundId)}
					<p class="mt-1 text-sm text-stone-500">
						{selectedBackgroundSummary(formValues.backgroundId)}
					</p>
				{/if}
			</label>

			<label class="block md:col-span-2">
				<span class="mb-1 block text-sm font-medium text-stone-700">Story</span>
				<textarea
					class="block min-h-32 w-full rounded-lg border-stone-300"
					name="story"
					bind:value={formValues.story}></textarea>
			</label>
		</div>
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="space-y-1">
			<h2 class="text-xl font-semibold text-stone-900">Ability Scores</h2>
			<p class="text-sm text-stone-600">Use the first stat block for the character draft.</p>
		</div>

		<div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each abilityFields as field (field.name)}
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">{field.label}</span>
					<input
						class="block w-full rounded-lg border-stone-300"
						type="number"
						name={field.name}
						required
						min="1"
						max="30"
						bind:value={formValues[field.name]}
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
			{#each combatFields as field (field.name)}
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">{field.label}</span>
					<input
						class="block w-full rounded-lg border-stone-300"
						type="number"
						name={field.name}
						required
						min={'min' in field ? field.min : undefined}
						bind:value={formValues[field.name]}
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
					bind:value={formValues.hitDice}
				/>
			</label>
		</div>
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
			<div class="space-y-1">
				<h2 class="text-xl font-semibold text-stone-900">Inventory</h2>
				<p class="text-sm text-stone-600">
					Track items as structured rows so editing stays clearer than one large notes
					box.
				</p>
			</div>
			<button
				class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400"
				type="button"
				onclick={addInventoryItem}
			>
				Add inventory item
			</button>
		</div>

		<input type="hidden" name="inventoryItems" value={inventoryItemsFieldValue()} />

		{#if firstError('inventoryItems')}
			<p class="mt-4 text-sm text-red-700">{firstError('inventoryItems')}</p>
		{/if}

		{#if inventoryItems.length === 0}
			<p
				class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
			>
				No inventory items yet. Add the gear your character actually carries instead of
				hiding it in a text blob.
			</p>
		{:else}
			<div class="mt-6 space-y-4">
				{#each inventoryItems as item, index (`${index}-${item.name}`)}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">Item {index + 1}</p>
							<button
								class="text-sm font-medium text-rose-700 transition hover:text-rose-900"
								type="button"
								onclick={() => removeInventoryItem(index)}
							>
								Remove
							</button>
						</div>

						<div class="mt-4 grid gap-4 lg:grid-cols-2">
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Item name</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									bind:value={item.name}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Quantity</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="number"
									min="0"
									bind:value={item.quantity}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Value</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									bind:value={item.value}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Weight</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="number"
									min="0"
									step="0.1"
									bind:value={item.weight}
								/>
							</label>

							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Description</span
								>
								<textarea
									class="block min-h-24 w-full rounded-lg border-stone-300"
									bind:value={item.description}></textarea>
							</label>

							<label class="inline-flex items-center gap-3">
								<input
									class="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
									type="checkbox"
									bind:checked={item.isEquipped}
								/>
								<span class="text-sm font-medium text-stone-700"
									>Currently equipped</span
								>
							</label>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="space-y-1">
			<h2 class="text-xl font-semibold text-stone-900">Free-Text Sections</h2>
			<p class="text-sm text-stone-600">
				Keep manual notes for attacks, spells, and general reminders while richer systems
				are still incremental.
			</p>
		</div>

		<div class="mt-6 grid gap-4 lg:grid-cols-2">
			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Attacks</span>
				<textarea
					class="block min-h-32 w-full rounded-lg border-stone-300"
					name="attacks"
					bind:value={formValues.attacks}></textarea>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Spells</span>
				<textarea
					class="block min-h-32 w-full rounded-lg border-stone-300"
					name="spells"
					bind:value={formValues.spells}></textarea>
			</label>

			<label class="block lg:col-span-2">
				<span class="mb-1 block text-sm font-medium text-stone-700">Notes</span>
				<textarea
					class="block min-h-32 w-full rounded-lg border-stone-300"
					name="notes"
					bind:value={formValues.notes}></textarea>
			</label>
		</div>
	</section>

	<div class="flex flex-wrap gap-3">
		<button
			class="rounded-lg bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
			type="submit"
		>
			{submitLabel}
		</button>
		<button
			class="rounded-lg border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:border-stone-400"
			type="button"
			onclick={() => goto(resolve(cancelHref))}
		>
			{cancelLabel}
		</button>
	</div>
</form>
