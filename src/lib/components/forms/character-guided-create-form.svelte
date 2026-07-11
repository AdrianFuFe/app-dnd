<script lang="ts">
	import {
		createDefaultGuidedCharacterInput,
		createGuidedCharacterFormValues,
		deriveGuidedCharacterDraft,
		inspectGuidedCharacterChoices,
		type GuidedCharacterCatalog,
		type GuidedCharacterFormValues
	} from '$lib/domain/characters/guided-character';

	type GuidedFieldName = keyof GuidedCharacterFormValues;
	type GuidedFieldErrors = Partial<Record<GuidedFieldName, string[]>>;
	type ChoiceEntry = {
		key: string;
		value: string;
	};

	let {
		catalog,
		values,
		errors = {},
		formError
	}: {
		catalog: GuidedCharacterCatalog;
		values: GuidedCharacterFormValues;
		errors?: GuidedFieldErrors;
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

	const combatOverrideFields = [
		{ name: 'overrideMaxHp', label: 'Max HP', min: 0 },
		{ name: 'overrideCurrentHp', label: 'Current HP', min: 0 },
		{ name: 'overrideTemporaryHp', label: 'Temporary HP', min: 0 },
		{ name: 'overrideArmorClass', label: 'Armor Class', min: 0 },
		{ name: 'overrideInitiative', label: 'Initiative', min: -20 },
		{ name: 'overrideSpeed', label: 'Speed', min: 0 }
	] as const;

	let formValues = $state(createGuidedCharacterFormValues(createDefaultGuidedCharacterInput()));
	let languageChoices = $state<ChoiceEntry[]>([]);
	let proficiencyChoices = $state<ChoiceEntry[]>([]);
	let equipmentChoices = $state<ChoiceEntry[]>([]);

	$effect(() => {
		formValues = { ...values };
		languageChoices = parseChoiceEntries(values.languageChoices);
		proficiencyChoices = parseChoiceEntries(values.proficiencyChoices);
		equipmentChoices = parseChoiceEntries(values.equipmentChoices);
	});

	function parseChoiceEntries(value: string): ChoiceEntry[] {
		if (!value.trim()) {
			return [];
		}

		try {
			const parsed = JSON.parse(value);
			return Array.isArray(parsed)
				? parsed.flatMap((entry) =>
						typeof entry === 'object' &&
						entry !== null &&
						typeof entry.key === 'string' &&
						typeof entry.value === 'string'
							? [{ key: entry.key, value: entry.value }]
							: []
					)
				: [];
		} catch {
			return [];
		}
	}

	function choiceEntriesFieldValue(items: ChoiceEntry[]): string {
		return JSON.stringify(items);
	}

	function firstError(field: GuidedFieldName): string | undefined {
		return errors[field]?.[0];
	}

	function selectedSpecies() {
		return catalog.speciesOptions.find((option) => option.id === formValues.speciesId);
	}

	function availableSubspeciesOptions() {
		const speciesSlug = selectedSpecies()?.slug;
		return speciesSlug
			? catalog.subspeciesOptions.filter((option) => option.speciesSlug === speciesSlug)
			: [];
	}

	function selectedClass() {
		return catalog.classOptions.find((option) => option.id === formValues.classId);
	}

	function availableSubclassOptions() {
		const classSlug = selectedClass()?.slug;
		return classSlug
			? catalog.subclassOptions.filter((option) => option.classSlug === classSlug)
			: [];
	}

	function handleSpeciesChange(event: Event) {
		const nextSpeciesId = (event.currentTarget as HTMLSelectElement).value;
		formValues =
			nextSpeciesId !== formValues.speciesId
				? { ...formValues, speciesId: nextSpeciesId, subspeciesId: '' }
				: { ...formValues, speciesId: nextSpeciesId };
		resetChoiceEntries();
	}

	function handleClassChange(event: Event) {
		const nextClassId = (event.currentTarget as HTMLSelectElement).value;
		formValues =
			nextClassId !== formValues.classId
				? { ...formValues, classId: nextClassId, subclassId: '' }
				: { ...formValues, classId: nextClassId };
		resetChoiceEntries();
	}

	function resetChoiceEntries() {
		languageChoices = [];
		proficiencyChoices = [];
		equipmentChoices = [];
	}

	function derivePreview() {
		try {
			if (
				!formValues.speciesId ||
				!formValues.classId ||
				!formValues.backgroundId ||
				!formValues.name.trim()
			) {
				return null;
			}

			return deriveGuidedCharacterDraft(catalog, {
				name: formValues.name,
				story: formValues.story.trim() || undefined,
				speciesId: formValues.speciesId,
				subspeciesId: formValues.subspeciesId || undefined,
				classId: formValues.classId,
				subclassId: formValues.subclassId || undefined,
				backgroundId: formValues.backgroundId,
				strength: Number(formValues.strength || '0'),
				dexterity: Number(formValues.dexterity || '0'),
				constitution: Number(formValues.constitution || '0'),
				intelligence: Number(formValues.intelligence || '0'),
				wisdom: Number(formValues.wisdom || '0'),
				charisma: Number(formValues.charisma || '0'),
				overrideMaxHp: formValues.overrideMaxHp ? Number(formValues.overrideMaxHp) : undefined,
				overrideCurrentHp: formValues.overrideCurrentHp
					? Number(formValues.overrideCurrentHp)
					: undefined,
				overrideTemporaryHp: formValues.overrideTemporaryHp
					? Number(formValues.overrideTemporaryHp)
					: undefined,
				overrideArmorClass: formValues.overrideArmorClass
					? Number(formValues.overrideArmorClass)
					: undefined,
				overrideInitiative: formValues.overrideInitiative
					? Number(formValues.overrideInitiative)
					: undefined,
				overrideSpeed: formValues.overrideSpeed ? Number(formValues.overrideSpeed) : undefined,
				languageChoices,
				proficiencyChoices,
				equipmentChoices
			});
		} catch {
			return null;
		}
	}

	const preview = $derived(derivePreview());

	function deriveChoiceResolution() {
		try {
			if (!formValues.speciesId || !formValues.classId || !formValues.backgroundId) {
				return null;
			}

			return inspectGuidedCharacterChoices(catalog, {
				name: formValues.name || 'New Character',
				story: formValues.story.trim() || undefined,
				speciesId: formValues.speciesId,
				subspeciesId: formValues.subspeciesId || undefined,
				classId: formValues.classId,
				subclassId: formValues.subclassId || undefined,
				backgroundId: formValues.backgroundId,
				strength: Number(formValues.strength || '10'),
				dexterity: Number(formValues.dexterity || '10'),
				constitution: Number(formValues.constitution || '10'),
				intelligence: Number(formValues.intelligence || '10'),
				wisdom: Number(formValues.wisdom || '10'),
				charisma: Number(formValues.charisma || '10'),
				overrideMaxHp: formValues.overrideMaxHp ? Number(formValues.overrideMaxHp) : undefined,
				overrideCurrentHp: formValues.overrideCurrentHp
					? Number(formValues.overrideCurrentHp)
					: undefined,
				overrideTemporaryHp: formValues.overrideTemporaryHp
					? Number(formValues.overrideTemporaryHp)
					: undefined,
				overrideArmorClass: formValues.overrideArmorClass
					? Number(formValues.overrideArmorClass)
					: undefined,
				overrideInitiative: formValues.overrideInitiative
					? Number(formValues.overrideInitiative)
					: undefined,
				overrideSpeed: formValues.overrideSpeed ? Number(formValues.overrideSpeed) : undefined,
				languageChoices,
				proficiencyChoices,
				equipmentChoices
			});
		} catch {
			return null;
		}
	}

	const choiceResolution = $derived(deriveChoiceResolution());

	function selectedValues(items: ChoiceEntry[], key: string): string[] {
		return items.filter((entry) => entry.key === key).map((entry) => entry.value);
	}

	function toggleChoice(
		group: 'language' | 'proficiency' | 'equipment',
		key: string,
		value: string,
		maxCount: number
	) {
		const source =
			group === 'language'
				? languageChoices
				: group === 'proficiency'
					? proficiencyChoices
					: equipmentChoices;
		const selected = selectedValues(source, key);
		const isSelected = selected.includes(value);
		const nextBase = source.filter((entry) => !(entry.key === key && entry.value === value));

		if (isSelected) {
			if (group === 'language') {
				languageChoices = nextBase;
			} else if (group === 'proficiency') {
				proficiencyChoices = nextBase;
			} else {
				equipmentChoices = nextBase;
			}

			return;
		}

		if (selected.length >= maxCount) {
			return;
		}

		const nextItems = [...nextBase, { key, value }];

		if (group === 'language') {
			languageChoices = nextItems;
		} else if (group === 'proficiency') {
			proficiencyChoices = nextItems;
		} else {
			equipmentChoices = nextItems;
		}
	}

	function isChoiceSelected(
		group: 'language' | 'proficiency' | 'equipment',
		key: string,
		value: string
	): boolean {
		const source =
			group === 'language'
				? languageChoices
				: group === 'proficiency'
					? proficiencyChoices
					: equipmentChoices;
		return selectedValues(source, key).includes(value);
	}
</script>

<form method="POST" action="?/guided" class="space-y-6">
	<input type="hidden" name="languageChoices" value={choiceEntriesFieldValue(languageChoices)} />
	<input
		type="hidden"
		name="proficiencyChoices"
		value={choiceEntriesFieldValue(proficiencyChoices)}
	/>
	<input type="hidden" name="equipmentChoices" value={choiceEntriesFieldValue(equipmentChoices)} />

	<section class="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
		<div class="space-y-2">
			<p class="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
				Guided level 1
			</p>
			<h2 class="text-2xl font-semibold text-stone-900">
				Build a canonical `dnd-2014-srd` draft step by step.
			</h2>
			<p class="max-w-3xl text-sm leading-7 text-stone-600">
				This guided slice now includes validated language and proficiency picks where the
				current catalog exposes them, while still saving through the same stable character
				persistence path.
			</p>
		</div>

		{#if formError}
			<p class="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				{formError}
			</p>
		{/if}
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step 1</p>
		<h3 class="mt-2 text-xl font-semibold text-stone-900">Identity</h3>

		<div class="mt-5 grid gap-4 lg:grid-cols-2">
			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Character name</span>
				<input
					class="block w-full rounded-lg border-stone-300"
					name="name"
					type="text"
					value={formValues.name}
					oninput={(event) =>
						(formValues = {
							...formValues,
							name: (event.currentTarget as HTMLInputElement).value
						})}
				/>
				{#if firstError('name')}
					<p class="mt-1 text-sm text-red-700">{firstError('name')}</p>
				{/if}
			</label>

			<label class="block lg:col-span-2">
				<span class="mb-1 block text-sm font-medium text-stone-700">Story seed</span>
				<textarea
					class="block min-h-24 w-full rounded-lg border-stone-300"
					name="story"
					oninput={(event) =>
						(formValues = {
							...formValues,
							story: (event.currentTarget as HTMLTextAreaElement).value
						})}>{formValues.story}</textarea
				>
			</label>
		</div>
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step 2</p>
		<h3 class="mt-2 text-xl font-semibold text-stone-900">Lineage and path</h3>

		<div class="mt-5 grid gap-4 lg:grid-cols-2">
			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Species</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="speciesId"
					value={formValues.speciesId}
					onchange={handleSpeciesChange}
				>
					<option value="">Choose species</option>
					{#each catalog.speciesOptions as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('speciesId')}
					<p class="mt-1 text-sm text-red-700">{firstError('speciesId')}</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Subspecies</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="subspeciesId"
					value={formValues.subspeciesId}
					onchange={(event) => {
						formValues = {
							...formValues,
							subspeciesId: (event.currentTarget as HTMLSelectElement).value
						};
						resetChoiceEntries();
					}}
				>
					<option value="">No subspecies</option>
					{#each availableSubspeciesOptions() as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('subspeciesId')}
					<p class="mt-1 text-sm text-red-700">{firstError('subspeciesId')}</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Class</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="classId"
					value={formValues.classId}
					onchange={handleClassChange}
				>
					<option value="">Choose class</option>
					{#each catalog.classOptions as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('classId')}
					<p class="mt-1 text-sm text-red-700">{firstError('classId')}</p>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Subclass</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="subclassId"
					value={formValues.subclassId}
					onchange={(event) => {
						formValues = {
							...formValues,
							subclassId: (event.currentTarget as HTMLSelectElement).value
						};
						resetChoiceEntries();
					}}
				>
					<option value="">No subclass at this step</option>
					{#each availableSubclassOptions() as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('subclassId')}
					<p class="mt-1 text-sm text-red-700">{firstError('subclassId')}</p>
				{/if}
			</label>

			<label class="block lg:col-span-2">
				<span class="mb-1 block text-sm font-medium text-stone-700">Background</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="backgroundId"
					value={formValues.backgroundId}
					onchange={(event) => {
						formValues = {
							...formValues,
							backgroundId: (event.currentTarget as HTMLSelectElement).value
						};
						resetChoiceEntries();
					}}
				>
					<option value="">Choose background</option>
					{#each catalog.backgroundOptions as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('backgroundId')}
					<p class="mt-1 text-sm text-red-700">{firstError('backgroundId')}</p>
				{/if}
			</label>
		</div>
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step 3</p>
		<h3 class="mt-2 text-xl font-semibold text-stone-900">Base ability scores</h3>
		<p class="mt-2 text-sm text-stone-600">
			Enter the base scores first. Guided ancestry bonuses are applied automatically in the
			preview and on save.
		</p>

		<div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each abilityFields as field (field.name)}
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-stone-700">{field.label}</span>
					<input
						class="block w-full rounded-lg border-stone-300"
						name={field.name}
						type="number"
						min="1"
						max="20"
						value={formValues[field.name]}
						oninput={(event) =>
							(formValues = {
								...formValues,
								[field.name]: (event.currentTarget as HTMLInputElement).value
							})}
					/>
					{#if firstError(field.name)}
						<p class="mt-1 text-sm text-red-700">{firstError(field.name)}</p>
					{/if}
				</label>
			{/each}
		</div>
	</section>

	<section class="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Step 4</p>
		<h3 class="mt-2 text-xl font-semibold text-amber-950">Optional combat overrides</h3>
		<p class="mt-2 text-sm text-amber-900">
			Leave these blank to stay on the canonical guided path. Any real override here will
			mark the draft as custom for this ruleset.
		</p>

		<div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each combatOverrideFields as field (field.name)}
				<label class="block">
					<span class="mb-1 block text-sm font-medium text-amber-950">{field.label}</span>
					<input
						class="block w-full rounded-lg border-amber-300 bg-white"
						name={field.name}
						type="number"
						min={field.min}
						value={formValues[field.name]}
						oninput={(event) =>
							(formValues = {
								...formValues,
								[field.name]: (event.currentTarget as HTMLInputElement).value
							})}
					/>
					{#if firstError(field.name)}
						<p class="mt-1 text-sm text-red-700">{firstError(field.name)}</p>
					{/if}
				</label>
			{/each}
		</div>
	</section>

	{#if choiceResolution && (choiceResolution.languageChoices.length || choiceResolution.proficiencyChoices.length || choiceResolution.equipmentChoices.length)}
		<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
			<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step 5</p>
			<h3 class="mt-2 text-xl font-semibold text-stone-900">Guided choices</h3>
			<p class="mt-2 text-sm text-stone-600">
				Complete the required language and proficiency picks that this lineage, class path,
				and background generate.
			</p>

			<div class="mt-5 space-y-5">
				{#each choiceResolution.languageChoices as choice (choice.key)}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">
								Language choice
							</p>
							<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
								{selectedValues(languageChoices, choice.key).length}/{choice.count} chosen
							</p>
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each choice.options as option (option.slug)}
								<button
									type="button"
									class="rounded-full border px-3 py-1 text-sm transition {isChoiceSelected('language', choice.key, option.slug)
										? 'border-emerald-300 bg-emerald-100 text-emerald-900'
										: 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'}"
									onclick={() => toggleChoice('language', choice.key, option.slug, choice.count)}
								>
									{option.name}
								</button>
							{/each}
						</div>
					</div>
				{/each}

				{#each choiceResolution.proficiencyChoices as choice (choice.key)}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">
								{choice.proficiencyType === 'skill' ? 'Skill choice' : 'Tool choice'}
							</p>
							<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
								{selectedValues(proficiencyChoices, choice.key).length}/{choice.count} chosen
							</p>
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each choice.options as option (option.slug)}
								<button
									type="button"
									class="rounded-full border px-3 py-1 text-sm transition {isChoiceSelected('proficiency', choice.key, option.slug)
										? 'border-emerald-300 bg-emerald-100 text-emerald-900'
										: 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'}"
									onclick={() =>
										toggleChoice('proficiency', choice.key, option.slug, choice.count)}
								>
									{option.name}
								</button>
							{/each}
						</div>
					</div>
				{/each}

				{#each choiceResolution.equipmentChoices as choice (choice.key)}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">Equipment package</p>
							<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
								{selectedValues(equipmentChoices, choice.key).length}/{choice.count} chosen
							</p>
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each choice.options as option (option.slug)}
								<button
									type="button"
									class="rounded-full border px-3 py-1 text-sm transition {isChoiceSelected('equipment', choice.key, option.slug)
										? 'border-emerald-300 bg-emerald-100 text-emerald-900'
										: 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'}"
									onclick={() => toggleChoice('equipment', choice.key, option.slug, choice.count)}
								>
									{option.name}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			{#if firstError('languageChoices') || firstError('proficiencyChoices') || firstError('equipmentChoices')}
				<p class="mt-4 text-sm text-red-700">
					{firstError('languageChoices') ??
						firstError('proficiencyChoices') ??
						firstError('equipmentChoices')}
				</p>
			{/if}
		</section>
	{/if}

	<section class="rounded-3xl border border-stone-200 bg-stone-950 p-6 text-stone-50 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Step 6</p>
		<h3 class="mt-2 text-xl font-semibold">Derived preview</h3>

		{#if preview}
			<div class="mt-5 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
				<div class="space-y-5">
					<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{#each abilityFields as field (field.name)}
							<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
								<p class="text-xs uppercase tracking-[0.15em] text-stone-400">{field.label}</p>
								<p class="mt-2 text-2xl font-semibold">
									{preview.character[field.name]}
								</p>
							</div>
						{/each}
					</div>

					<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">HP</p>
							<p class="mt-2 text-2xl font-semibold">{preview.preview.maxHp}</p>
						</div>
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">AC</p>
							<p class="mt-2 text-2xl font-semibold">{preview.preview.armorClass}</p>
						</div>
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">Initiative</p>
							<p class="mt-2 text-2xl font-semibold">
								{preview.preview.initiative >= 0 ? '+' : ''}{preview.preview.initiative}
							</p>
						</div>
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">Speed</p>
							<p class="mt-2 text-2xl font-semibold">{preview.preview.speed}</p>
						</div>
					</div>
				</div>

				<div class="space-y-4">
					<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
						<p class="text-sm font-semibold text-stone-100">Content profile</p>
						<div class="mt-3 flex flex-wrap gap-2">
							<span class="rounded-full border border-sky-400/40 bg-sky-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-sky-100">
								Ruleset {preview.preview.rulesetCode}
							</span>
							<span
								class="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] {preview.preview.contentMode === 'canon'
									? 'border-emerald-400/40 bg-emerald-300/10 text-emerald-100'
									: 'border-amber-400/40 bg-amber-300/10 text-amber-100'}"
							>
								Mode {preview.preview.contentMode}
							</span>
						</div>
						{#if preview.preview.customizationReasonLines.length === 0}
							<p class="mt-3 text-sm text-stone-400">
								This guided draft is still following the canonical path.
							</p>
						{:else}
							<ul class="mt-3 space-y-2 text-sm text-stone-300">
								{#each preview.preview.customizationReasonLines as line}
									<li>{line}</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
						<p class="text-sm font-semibold text-stone-100">Auto-applied bonuses</p>
						{#if preview.preview.abilityBonuses.length === 0}
							<p class="mt-2 text-sm text-stone-400">No direct ability bonuses resolved yet.</p>
						{:else}
							<ul class="mt-3 space-y-2 text-sm text-stone-300">
								{#each preview.preview.abilityBonuses as bonus}
									<li>{bonus.ability}: +{bonus.value}</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
						<p class="text-sm font-semibold text-stone-100">Granted spells</p>
						{#if preview.preview.grantedSpellItems.length === 0}
							<p class="mt-2 text-sm text-stone-400">No granted spells resolved at level 1.</p>
						{:else}
							<ul class="mt-3 space-y-2 text-sm text-stone-300">
								{#each preview.preview.grantedSpellItems as spell}
									<li>{spell.name}</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
						<p class="text-sm font-semibold text-stone-100">Derived inventory</p>
						{#if preview.preview.derivedInventoryItems.length === 0}
							<p class="mt-2 text-sm text-stone-400">No inventory resolved yet.</p>
						{:else}
							<ul class="mt-3 space-y-2 text-sm text-stone-300">
								{#each preview.preview.derivedInventoryItems as item}
									<li>{item.quantity}x {item.name}</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
						<p class="text-sm font-semibold text-stone-100">Derived attacks</p>
						{#if preview.preview.derivedAttackItems.length === 0}
							<p class="mt-2 text-sm text-stone-400">No weapon attacks resolved yet.</p>
						{:else}
							<ul class="mt-3 space-y-2 text-sm text-stone-300">
								{#each preview.preview.derivedAttackItems as attack}
									<li>
										{attack.name}
										{#if attack.attackBonus || attack.damage || attack.damageType || attack.range}
											<span class="text-stone-500">
												({[
													attack.attackBonus,
													attack.damageType
														? `${attack.damage ?? ''} ${attack.damageType}`.trim()
														: attack.damage,
													attack.range
												]
													.filter(Boolean)
													.join(' | ')})
											</span>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					{#if preview.preview.resolvedChoiceLines.length > 0}
						<div class="rounded-2xl border border-emerald-400/40 bg-emerald-300/10 p-4">
							<p class="text-sm font-semibold text-emerald-100">Resolved guided choices</p>
							<ul class="mt-3 space-y-2 text-sm text-emerald-50/90">
								{#each preview.preview.resolvedChoiceLines as line}
									<li>{line}</li>
								{/each}
							</ul>
						</div>
					{/if}

					{#if preview.preview.pendingChoiceLines.length > 0}
						<div class="rounded-2xl border border-amber-400/40 bg-amber-300/10 p-4">
							<p class="text-sm font-semibold text-amber-100">Still required</p>
							<ul class="mt-3 space-y-2 text-sm text-amber-50/90">
								{#each preview.preview.pendingChoiceLines as line}
									<li>{line}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<p class="mt-4 text-sm text-stone-300">
				Complete the guided selections above to preview the canonical level-1 draft.
			</p>
		{/if}
	</section>

	<div class="flex flex-wrap gap-3">
		<button
			class="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400"
			type="submit"
		>
			Save guided draft
		</button>
	</div>
</form>
