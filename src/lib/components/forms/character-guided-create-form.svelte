<script lang="ts">
	import {
		createDefaultGuidedCharacterInput,
		createGuidedCharacterFormValues,
		deriveGuidedCharacterDraft,
		getGuidedChoiceInvalidSelectedValues,
		getGuidedChoiceSelectedValues,
		getGuidedChoiceValidSelectedValues,
		humanizeGuidedChoiceValue,
		inspectGuidedCharacterChoices,
		sanitizeGuidedChoiceEntries,
		type GuidedCharacterCatalog,
		type GuidedCharacterFormValues,
		type GuidedChoiceEntry,
		type GuidedEquipmentEntry
	} from '$lib/domain/characters/guided-character';
	import type { GameMechanic } from '$lib/types/domain/game-mechanics';

	type GuidedFieldName = keyof GuidedCharacterFormValues;
	type GuidedFieldErrors = Partial<Record<GuidedFieldName, string[]>>;

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

	let formValues = $state(createGuidedCharacterFormValues(createDefaultGuidedCharacterInput()));
	let languageChoices = $state<GuidedChoiceEntry[]>([]);
	let proficiencyChoices = $state<GuidedChoiceEntry[]>([]);
	let equipmentChoices = $state<GuidedChoiceEntry[]>([]);

	$effect(() => {
		formValues = { ...values };
		languageChoices = parseChoiceEntries(values.languageChoices);
		proficiencyChoices = parseChoiceEntries(values.proficiencyChoices);
		equipmentChoices = parseChoiceEntries(values.equipmentChoices);
	});

	function parseChoiceEntries(value: string): GuidedChoiceEntry[] {
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

	function choiceEntriesFieldValue(items: GuidedChoiceEntry[]): string {
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
			? catalog.subclassOptions.filter(
					(option) => option.classSlug === classSlug && option.startsAtLevel === 1
				)
			: [];
	}

	function selectedBackground() {
		return catalog.backgroundOptions.find((option) => option.id === formValues.backgroundId);
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
				languageChoices,
				proficiencyChoices,
				equipmentChoices
			});
		} catch {
			return null;
		}
	}

	const choiceResolution = $derived(deriveChoiceResolution());

	function pendingChoiceReviewLines() {
		if (!choiceResolution) {
			return [];
		}

		const lines: string[] = [];

		for (const choice of choiceResolution.languageChoices) {
			const remaining = choice.count - choice.selected.length;

			if (remaining > 0) {
				lines.push(
					`Choose ${remaining} more ${remaining === 1 ? 'language' : 'languages'} for ${choice.key}.`
				);
			}
		}

		for (const choice of choiceResolution.proficiencyChoices) {
			const remaining = choice.count - choice.selected.length;

			if (remaining > 0) {
				lines.push(
					`Choose ${remaining} more ${choice.proficiencyType} ${remaining === 1 ? 'proficiency' : 'proficiencies'} for ${choice.key}.`
				);
			}
		}

		for (const choice of choiceResolution.equipmentChoices) {
			const remaining = choice.count - choice.selected.length;

			if (remaining > 0) {
				lines.push(`Choose ${remaining} more equipment package for ${choice.key}.`);
			}
		}

		return lines;
	}

	const reviewPendingLines = $derived(pendingChoiceReviewLines());
	const canSaveGuidedDraft = $derived(Boolean(preview) && reviewPendingLines.length === 0);

	function choiceOptionSlugs(options: Array<{ slug: string }>): string[] {
		return options.map((option) => option.slug);
	}

	function removeChoiceValue(
		group: 'language' | 'proficiency' | 'equipment',
		key: string,
		value: string
	) {
		const source =
			group === 'language'
				? languageChoices
				: group === 'proficiency'
					? proficiencyChoices
					: equipmentChoices;
		const nextItems = source.filter((entry) => !(entry.key === key && entry.value === value));

		if (group === 'language') {
			languageChoices = nextItems;
		} else if (group === 'proficiency') {
			proficiencyChoices = nextItems;
		} else {
			equipmentChoices = nextItems;
		}
	}

	function toggleChoice(
		group: 'language' | 'proficiency' | 'equipment',
		key: string,
		value: string,
		maxCount: number,
		allowedValues: string[]
	) {
		const source =
			group === 'language'
				? languageChoices
				: group === 'proficiency'
					? proficiencyChoices
					: equipmentChoices;
		const sanitizedSource = sanitizeGuidedChoiceEntries(source, key, allowedValues);
		const selected = getGuidedChoiceSelectedValues(sanitizedSource, key);
		const isSelected = selected.includes(value);
		const nextBase = sanitizedSource.filter(
			(entry) => !(entry.key === key && entry.value === value)
		);

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
		return getGuidedChoiceSelectedValues(source, key).includes(value);
	}

	function guidedChoiceCardTestId(
		group: 'language' | 'proficiency' | 'equipment',
		key: string,
		proficiencyType?: string
	): string {
		if (group === 'language') {
			return `guided-language-choice-${key}`;
		}

		if (group === 'proficiency') {
			return `guided-${proficiencyType ?? 'proficiency'}-choice-${key}`;
		}

		return `guided-equipment-choice-${key}`;
	}

	function guidedChoiceOptionTestId(key: string, value: string): string {
		return `guided-choice-option-${key}-${value}`;
	}

	function guidedProficiencyBonus(level: number): number {
		return Math.floor((level - 1) / 4) + 2;
	}

	function summarizeEquipmentEntry(entry: GuidedEquipmentEntry): string {
		if (entry.type === 'item') {
			const equipment = catalog.equipmentCatalog.find((item) => item.slug === entry.id);
			const name = equipment?.name ?? humanizeGuidedChoiceValue(entry.id);
			return `${entry.quantity ?? 1}x ${name}`;
		}

		const optionNames = entry.options.map(
			(slug) =>
				catalog.equipmentCatalog.find((item) => item.slug === slug)?.name ??
				humanizeGuidedChoiceValue(slug)
		);
		return `Choose 1: ${optionNames.join(', ')}`;
	}

	function summarizeMechanicLine(mechanic: GameMechanic): string | null {
		if (mechanic.type === 'ability_bonus') {
			return `${humanizeGuidedChoiceValue(mechanic.ability)} +${mechanic.value}`;
		}

		if (mechanic.type === 'choose_ability_bonus') {
			const allowed = mechanic.allowed?.map((ability) => humanizeGuidedChoiceValue(ability)).join(', ');
			return allowed
				? `Choose ${mechanic.count} ability score ${mechanic.count === 1 ? 'bonus' : 'bonuses'} (+${mechanic.value}) from ${allowed}`
				: `Choose ${mechanic.count} ability score ${mechanic.count === 1 ? 'bonus' : 'bonuses'} (+${mechanic.value})`;
		}

		if (mechanic.type === 'speed') {
			return `Speed ${mechanic.value}`;
		}

		if (mechanic.type === 'darkvision') {
			return `Darkvision ${mechanic.range} ft.`;
		}

		if (mechanic.type === 'language') {
			return `Language: ${humanizeGuidedChoiceValue(mechanic.language)}`;
		}

		if (mechanic.type === 'choose_language') {
			return `Choose ${mechanic.count} ${mechanic.count === 1 ? 'language' : 'languages'}`;
		}

		if (mechanic.type === 'proficiency') {
			return `${humanizeGuidedChoiceValue(mechanic.proficiencyType)} proficiency: ${humanizeGuidedChoiceValue(mechanic.value)}`;
		}

		if (mechanic.type === 'choose_proficiency') {
			const optionNames = mechanic.options.map((option) => humanizeGuidedChoiceValue(option)).join(', ');
			return `Choose ${mechanic.count} ${humanizeGuidedChoiceValue(mechanic.proficiencyType)} ${mechanic.count === 1 ? 'proficiency' : 'proficiencies'}: ${optionNames}`;
		}

		if (mechanic.type === 'resistance') {
			return `Resistance: ${humanizeGuidedChoiceValue(mechanic.damageType)}`;
		}

		if (mechanic.type === 'spell_grant') {
			const spell = catalog.spellCatalog.find((entry) => entry.slug === mechanic.spellId);
			return `Granted spell: ${spell?.name ?? humanizeGuidedChoiceValue(mechanic.spellId)}`;
		}

		if (mechanic.type === 'spellcasting') {
			return `Spellcasting ability: ${humanizeGuidedChoiceValue(mechanic.ability)}`;
		}

		if (mechanic.type === 'resource') {
			return `${mechanic.name} (${mechanic.maxFormula}, resets on ${humanizeGuidedChoiceValue(mechanic.resetOn)})`;
		}

		if (mechanic.type === 'feature') {
			return `Feature: ${humanizeGuidedChoiceValue(mechanic.featureId)}`;
		}

		if (mechanic.type === 'note') {
			return mechanic.text;
		}

		return null;
	}

	function summarizeOptionGrantLines(
		option:
			| {
					summary: string | null;
					mechanics: GameMechanic[];
					baseSpeed?: number | null;
					hitDie?: number;
					startingEquipment?: GuidedEquipmentEntry[];
			  }
			| undefined
	): string[] {
		if (!option) {
			return [];
		}

		const lines: string[] = [];

		if (option.summary?.trim()) {
			lines.push(option.summary.trim());
		}

		if (typeof option.baseSpeed === 'number') {
			lines.push(`Base speed: ${option.baseSpeed}`);
		}

		if (typeof option.hitDie === 'number') {
			lines.push(`Hit die: d${option.hitDie}`);
		}

		for (const mechanic of option.mechanics) {
			const line = summarizeMechanicLine(mechanic);

			if (line && !lines.includes(line)) {
				lines.push(line);
			}
		}

		for (const entry of option.startingEquipment ?? []) {
			const line = `Starting equipment: ${summarizeEquipmentEntry(entry)}`;

			if (!lines.includes(line)) {
				lines.push(line);
			}
		}

		return lines;
	}

	function selectedGuidedMechanics(): GameMechanic[] {
		return [
			...(selectedSpecies()?.mechanics ?? []),
			...(availableSubspeciesOptions().find((option) => option.id === formValues.subspeciesId)?.mechanics ??
				[]),
			...(selectedClass()?.mechanics ?? []),
			...(availableSubclassOptions().find((option) => option.id === formValues.subclassId)?.mechanics ?? []),
			...(selectedBackground()?.mechanics ?? [])
		];
	}

	function summarizeAutoGrantedChoiceStepLines(): string[] {
		const lines: string[] = [];

		for (const mechanic of selectedGuidedMechanics()) {
			if (
				mechanic.type !== 'language' &&
				mechanic.type !== 'proficiency' &&
				mechanic.type !== 'spell_grant'
			) {
				continue;
			}

			const line = summarizeMechanicLine(mechanic);

			if (line && !lines.includes(line)) {
				lines.push(line);
			}
		}

		for (const entry of [
			...(selectedClass()?.startingEquipment ?? []),
			...(selectedBackground()?.startingEquipment ?? [])
		]) {
			if (entry.type !== 'item') {
				continue;
			}

			const line = `Starting equipment: ${summarizeEquipmentEntry(entry)}`;

			if (!lines.includes(line)) {
				lines.push(line);
			}
		}

		return lines;
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

	<section
		class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
		data-testid="guided-identity-step"
	>
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

	<section
		class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
		data-testid="guided-species-step"
	>
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step 2</p>
		<h3 class="mt-2 text-xl font-semibold text-stone-900">Species</h3>
		<p class="mt-2 text-sm text-stone-600">
			Choose the lineage path first so the guided builder can resolve dependent subspecies,
			language grants, and ancestry bonuses.
		</p>

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
		</div>

		{#if selectedSpecies() || formValues.subspeciesId}
			<div
				class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
				data-testid="guided-species-grants"
			>
				<p class="text-sm font-semibold text-emerald-950">Granted by this choice</p>
				{#if selectedSpecies()}
					<p class="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-emerald-800">
						{selectedSpecies()?.name}
					</p>
					<ul class="mt-2 space-y-2 text-sm text-emerald-950">
						{#each summarizeOptionGrantLines(selectedSpecies()) as line}
							<li>{line}</li>
						{/each}
					</ul>
				{/if}
				{#if formValues.subspeciesId}
					<p class="mt-4 text-xs font-medium uppercase tracking-[0.15em] text-emerald-800">
						{availableSubspeciesOptions().find((option) => option.id === formValues.subspeciesId)?.name}
					</p>
					<ul class="mt-2 space-y-2 text-sm text-emerald-950">
						{#each summarizeOptionGrantLines(availableSubspeciesOptions().find((option) => option.id === formValues.subspeciesId)) as line}
							<li>{line}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}

	</section>

	<section
		class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
		data-testid="guided-class-step"
	>
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step 3</p>
		<h3 class="mt-2 text-xl font-semibold text-stone-900">Class</h3>
		<p class="mt-2 text-sm text-stone-600">
			Choose the class path next. Eligible level-1 subclasses appear automatically when the
			current catalog grants one at this stage.
		</p>

		<div class="mt-5 grid gap-4 lg:grid-cols-2">
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
		</div>

		{#if selectedClass() || formValues.subclassId}
			<div
				class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
				data-testid="guided-class-grants"
			>
				<p class="text-sm font-semibold text-emerald-950">Granted by this choice</p>
				{#if selectedClass()}
					<p class="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-emerald-800">
						{selectedClass()?.name}
					</p>
					<ul class="mt-2 space-y-2 text-sm text-emerald-950">
						{#each summarizeOptionGrantLines(selectedClass()) as line}
							<li>{line}</li>
						{/each}
					</ul>
				{/if}
				{#if formValues.subclassId}
					<p class="mt-4 text-xs font-medium uppercase tracking-[0.15em] text-emerald-800">
						{availableSubclassOptions().find((option) => option.id === formValues.subclassId)?.name}
					</p>
					<ul class="mt-2 space-y-2 text-sm text-emerald-950">
						{#each summarizeOptionGrantLines(availableSubclassOptions().find((option) => option.id === formValues.subclassId)) as line}
							<li>{line}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}

	</section>

	<section
		class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
		data-testid="guided-background-step"
	>
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step 4</p>
		<h3 class="mt-2 text-xl font-semibold text-stone-900">Background</h3>
		<p class="mt-2 text-sm text-stone-600">
			Finish the core origin selections with the background that grants the remaining trained
			skills, languages, tools, and starting context.
		</p>

		<div class="mt-5 grid gap-4 lg:grid-cols-2">
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

		{#if selectedBackground()}
			<div
				class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
				data-testid="guided-background-grants"
			>
				<p class="text-sm font-semibold text-emerald-950">Granted by this choice</p>
				<p class="mt-3 text-xs font-medium uppercase tracking-[0.15em] text-emerald-800">
					{selectedBackground()?.name}
				</p>
				<ul class="mt-2 space-y-2 text-sm text-emerald-950">
					{#each summarizeOptionGrantLines(selectedBackground()) as line}
						<li>{line}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</section>

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step 5</p>
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

	{#if choiceResolution && (choiceResolution.languageChoices.length || choiceResolution.proficiencyChoices.length || choiceResolution.equipmentChoices.length)}
		<section
			class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
			data-testid="guided-choices-section"
		>
			<p class="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Step 6</p>
			<h3 class="mt-2 text-xl font-semibold text-stone-900">Guided choices</h3>
			<p class="mt-2 text-sm text-stone-600">
				Fixed grants from your selected lineage, class path, and background are already
				applied. Only the required picks in this step still need your input.
			</p>

			{#if summarizeAutoGrantedChoiceStepLines().length > 0}
				<div
					class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4"
					data-testid="guided-auto-grants-summary"
				>
					<p class="text-sm font-semibold text-emerald-950">Already applied automatically</p>
					<ul class="mt-3 space-y-2 text-sm text-emerald-950">
						{#each summarizeAutoGrantedChoiceStepLines() as line}
							<li>{line}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div class="mt-5 space-y-5">
				{#each choiceResolution.languageChoices as choice (choice.key)}
					<div
						class="rounded-2xl border border-stone-200 bg-stone-50 p-4"
						data-testid={guidedChoiceCardTestId('language', choice.key)}
					>
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">
								Required language choice
							</p>
							<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
								{getGuidedChoiceValidSelectedValues(languageChoices, choice.key, choiceOptionSlugs(choice.options))
									.length}/{choice.count} chosen
							</p>
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each choice.options as option (option.slug)}
								<button
									type="button"
									data-testid={guidedChoiceOptionTestId(choice.key, option.slug)}
									class="rounded-full border px-3 py-1 text-sm transition {isChoiceSelected('language', choice.key, option.slug)
										? 'border-emerald-300 bg-emerald-100 text-emerald-900'
										: 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'}"
									onclick={() =>
										toggleChoice(
											'language',
											choice.key,
											option.slug,
											choice.count,
											choiceOptionSlugs(choice.options)
										)}
								>
									{option.name}
								</button>
							{/each}
						</div>
						{#if getGuidedChoiceInvalidSelectedValues(languageChoices, choice.key, choiceOptionSlugs(choice.options)).length > 0}
							<div
								class="mt-3 rounded-2xl border border-amber-300 bg-amber-100/70 px-3 py-3 text-sm text-amber-950"
								data-testid={`guided-invalid-choice-${choice.key}`}
							>
								<p class="font-medium">Some submitted picks are no longer valid for this choice.</p>
								<div class="mt-2 flex flex-wrap gap-2">
									{#each getGuidedChoiceInvalidSelectedValues(languageChoices, choice.key, choiceOptionSlugs(choice.options)) as invalidValue (invalidValue)}
										<button
											type="button"
											class="rounded-full border border-amber-400 bg-white px-3 py-1 text-xs font-medium text-amber-900 transition hover:border-amber-500"
											data-testid={`guided-invalid-choice-clear-${choice.key}-${invalidValue}`}
											onclick={() => removeChoiceValue('language', choice.key, invalidValue)}
										>
											Remove {humanizeGuidedChoiceValue(invalidValue)}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}

				{#each choiceResolution.proficiencyChoices as choice (choice.key)}
					<div
						class="rounded-2xl border border-stone-200 bg-stone-50 p-4"
						data-testid={guidedChoiceCardTestId('proficiency', choice.key, choice.proficiencyType)}
					>
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">
								{choice.proficiencyType === 'skill'
									? 'Required skill choice'
									: 'Required tool choice'}
							</p>
							<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
								{getGuidedChoiceValidSelectedValues(proficiencyChoices, choice.key, choiceOptionSlugs(choice.options))
									.length}/{choice.count} chosen
							</p>
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each choice.options as option (option.slug)}
								<button
									type="button"
									data-testid={guidedChoiceOptionTestId(choice.key, option.slug)}
									class="rounded-full border px-3 py-1 text-sm transition {isChoiceSelected('proficiency', choice.key, option.slug)
										? 'border-emerald-300 bg-emerald-100 text-emerald-900'
										: 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'}"
									onclick={() =>
										toggleChoice(
											'proficiency',
											choice.key,
											option.slug,
											choice.count,
											choiceOptionSlugs(choice.options)
										)}
								>
									{option.name}
								</button>
							{/each}
						</div>
						{#if getGuidedChoiceInvalidSelectedValues(proficiencyChoices, choice.key, choiceOptionSlugs(choice.options)).length > 0}
							<div
								class="mt-3 rounded-2xl border border-amber-300 bg-amber-100/70 px-3 py-3 text-sm text-amber-950"
								data-testid={`guided-invalid-choice-${choice.key}`}
							>
								<p class="font-medium">Some submitted picks are no longer valid for this choice.</p>
								<div class="mt-2 flex flex-wrap gap-2">
									{#each getGuidedChoiceInvalidSelectedValues(proficiencyChoices, choice.key, choiceOptionSlugs(choice.options)) as invalidValue (invalidValue)}
										<button
											type="button"
											class="rounded-full border border-amber-400 bg-white px-3 py-1 text-xs font-medium text-amber-900 transition hover:border-amber-500"
											data-testid={`guided-invalid-choice-clear-${choice.key}-${invalidValue}`}
											onclick={() => removeChoiceValue('proficiency', choice.key, invalidValue)}
										>
											Remove {humanizeGuidedChoiceValue(invalidValue)}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}

				{#each choiceResolution.equipmentChoices as choice (choice.key)}
					<div
						class="rounded-2xl border border-stone-200 bg-stone-50 p-4"
						data-testid={guidedChoiceCardTestId('equipment', choice.key)}
					>
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">
								Required equipment package
							</p>
							<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
								{getGuidedChoiceValidSelectedValues(equipmentChoices, choice.key, choiceOptionSlugs(choice.options))
									.length}/{choice.count} chosen
							</p>
						</div>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each choice.options as option (option.slug)}
								<button
									type="button"
									data-testid={guidedChoiceOptionTestId(choice.key, option.slug)}
									class="rounded-full border px-3 py-1 text-sm transition {isChoiceSelected('equipment', choice.key, option.slug)
										? 'border-emerald-300 bg-emerald-100 text-emerald-900'
										: 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'}"
									onclick={() =>
										toggleChoice(
											'equipment',
											choice.key,
											option.slug,
											choice.count,
											choiceOptionSlugs(choice.options)
										)}
								>
									{option.name}
								</button>
							{/each}
						</div>
						{#if getGuidedChoiceInvalidSelectedValues(equipmentChoices, choice.key, choiceOptionSlugs(choice.options)).length > 0}
							<div
								class="mt-3 rounded-2xl border border-amber-300 bg-amber-100/70 px-3 py-3 text-sm text-amber-950"
								data-testid={`guided-invalid-choice-${choice.key}`}
							>
								<p class="font-medium">Some submitted picks are no longer valid for this choice.</p>
								<div class="mt-2 flex flex-wrap gap-2">
									{#each getGuidedChoiceInvalidSelectedValues(equipmentChoices, choice.key, choiceOptionSlugs(choice.options)) as invalidValue (invalidValue)}
										<button
											type="button"
											class="rounded-full border border-amber-400 bg-white px-3 py-1 text-xs font-medium text-amber-900 transition hover:border-amber-500"
											data-testid={`guided-invalid-choice-clear-${choice.key}-${invalidValue}`}
											onclick={() => removeChoiceValue('equipment', choice.key, invalidValue)}
										>
											Remove {humanizeGuidedChoiceValue(invalidValue)}
										</button>
									{/each}
								</div>
							</div>
						{/if}
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

	<section
		class="rounded-3xl border border-stone-200 bg-stone-950 p-6 text-stone-50 shadow-sm"
		data-testid="guided-derived-snapshot-step"
	>
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-emerald-300">Step 7</p>
		<h3 class="mt-2 text-xl font-semibold">Derived snapshot</h3>
		<p class="mt-2 max-w-3xl text-sm text-stone-300">
			Review the canonical level-1 baseline that the guided rules path generates from your
			current selections.
		</p>

		{#if preview}
			<div class="mt-5 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
				<div class="space-y-5">
					<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">Level</p>
							<p class="mt-2 text-2xl font-semibold">{preview.character.level}</p>
						</div>
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">
								Proficiency Bonus
							</p>
							<p class="mt-2 text-2xl font-semibold">
								+{guidedProficiencyBonus(preview.character.level)}
							</p>
						</div>
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">Hit Dice</p>
							<p class="mt-2 text-2xl font-semibold">{preview.preview.hitDice}</p>
						</div>
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">Ruleset</p>
							<p class="mt-2 text-lg font-semibold">{preview.preview.rulesetCode}</p>
						</div>
					</div>

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
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">Max HP</p>
							<p class="mt-2 text-2xl font-semibold">{preview.preview.maxHp}</p>
						</div>
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">Current HP</p>
							<p class="mt-2 text-2xl font-semibold">{preview.preview.currentHp}</p>
						</div>
						<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
							<p class="text-xs uppercase tracking-[0.15em] text-stone-400">Armor Class</p>
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
						<p class="text-sm font-semibold text-stone-100">Guided path status</p>
						<div class="mt-3 flex flex-wrap gap-2">
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
								This guided draft is still following the canonical path for
								`dnd-2014-srd`.
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
						<p class="text-sm font-semibold text-stone-100">Granted proficiencies and languages</p>
						{#if preview.preview.grantedFeatureLines.length === 0}
							<p class="mt-2 text-sm text-stone-400">
								No automatic proficiencies or language grants resolved yet.
							</p>
						{:else}
							<ul class="mt-3 space-y-2 text-sm text-stone-300">
								{#each preview.preview.grantedFeatureLines as line}
									<li>{line}</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div class="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
						<p class="text-sm font-semibold text-stone-100">Ability bonuses applied</p>
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
						<p class="text-sm font-semibold text-stone-100">Derived equipment</p>
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

	<section
		class="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm"
		data-testid="guided-review-step"
	>
		<p class="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Step 8</p>
		<h3 class="mt-2 text-xl font-semibold text-stone-900">Review and save</h3>

		{#if preview || reviewPendingLines.length > 0}
			<div class="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">Name</p>
					<p class="mt-2 text-sm font-semibold text-stone-900">
						{formValues.name.trim() || 'Choose a name'}
					</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
						Lineage
					</p>
					<p class="mt-2 text-sm font-semibold text-stone-900">
						{selectedSpecies()?.name ?? 'Choose species'}
						{#if formValues.subspeciesId}
							{` / ${availableSubspeciesOptions().find((option) => option.id === formValues.subspeciesId)?.name ?? ''}`}
						{/if}
					</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">Class path</p>
					<p class="mt-2 text-sm font-semibold text-stone-900">
						{selectedClass()?.name ?? 'Choose class'}
						{#if formValues.subclassId}
							{` / ${availableSubclassOptions().find((option) => option.id === formValues.subclassId)?.name ?? ''}`}
						{/if}
					</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-[0.15em] text-stone-500">
						Background
					</p>
					<p class="mt-2 text-sm font-semibold text-stone-900">
						{selectedBackground()?.name ?? 'Choose background'}
					</p>
				</div>
			</div>

			{#if preview}
				<div class="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
						<p class="text-sm font-semibold text-stone-900">Final ability scores</p>
						<div class="mt-3 grid gap-3 sm:grid-cols-2">
							{#each abilityFields as field (field.name)}
								<div class="rounded-2xl border border-stone-200 bg-white px-4 py-3">
									<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
										{field.label}
									</p>
									<p class="mt-2 text-lg font-semibold text-stone-900">
										{preview.character[field.name]}
									</p>
								</div>
							{/each}
						</div>
					</div>

					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
						<p class="text-sm font-semibold text-stone-900">Derived combat baseline</p>
						<div class="mt-3 grid gap-3 sm:grid-cols-2">
							<div class="rounded-2xl border border-stone-200 bg-white px-4 py-3">
								<p class="text-xs uppercase tracking-[0.15em] text-stone-500">Level</p>
								<p class="mt-2 text-lg font-semibold text-stone-900">
									{preview.character.level}
								</p>
							</div>
							<div class="rounded-2xl border border-stone-200 bg-white px-4 py-3">
								<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
									Proficiency Bonus
								</p>
								<p class="mt-2 text-lg font-semibold text-stone-900">
									+{guidedProficiencyBonus(preview.character.level)}
								</p>
							</div>
							<div class="rounded-2xl border border-stone-200 bg-white px-4 py-3">
								<p class="text-xs uppercase tracking-[0.15em] text-stone-500">Max HP</p>
								<p class="mt-2 text-lg font-semibold text-stone-900">
									{preview.preview.maxHp}
								</p>
							</div>
							<div class="rounded-2xl border border-stone-200 bg-white px-4 py-3">
								<p class="text-xs uppercase tracking-[0.15em] text-stone-500">Current HP</p>
								<p class="mt-2 text-lg font-semibold text-stone-900">
									{preview.preview.currentHp}
								</p>
							</div>
							<div class="rounded-2xl border border-stone-200 bg-white px-4 py-3">
								<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
									Armor Class
								</p>
								<p class="mt-2 text-lg font-semibold text-stone-900">
									{preview.preview.armorClass}
								</p>
							</div>
							<div class="rounded-2xl border border-stone-200 bg-white px-4 py-3">
								<p class="text-xs uppercase tracking-[0.15em] text-stone-500">
									Initiative
								</p>
								<p class="mt-2 text-lg font-semibold text-stone-900">
									{preview.preview.initiative >= 0 ? '+' : ''}{preview.preview.initiative}
								</p>
							</div>
							<div class="rounded-2xl border border-stone-200 bg-white px-4 py-3">
								<p class="text-xs uppercase tracking-[0.15em] text-stone-500">Speed</p>
								<p class="mt-2 text-lg font-semibold text-stone-900">
									{preview.preview.speed}
								</p>
							</div>
							<div class="rounded-2xl border border-stone-200 bg-white px-4 py-3">
								<p class="text-xs uppercase tracking-[0.15em] text-stone-500">Hit Dice</p>
								<p class="mt-2 text-lg font-semibold text-stone-900">
									{preview.preview.hitDice}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
					<p class="text-sm font-semibold text-emerald-950">Save summary</p>
					<div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
						<div class="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
							<p class="text-xs uppercase tracking-[0.15em] text-emerald-700">Granted spells</p>
							<p class="mt-2 text-sm font-semibold text-emerald-950">
								{preview.preview.grantedSpellItems.length}
							</p>
						</div>
						<div class="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
							<p class="text-xs uppercase tracking-[0.15em] text-emerald-700">Inventory items</p>
							<p class="mt-2 text-sm font-semibold text-emerald-950">
								{preview.preview.derivedInventoryItems.length}
							</p>
						</div>
						<div class="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
							<p class="text-xs uppercase tracking-[0.15em] text-emerald-700">Derived attacks</p>
							<p class="mt-2 text-sm font-semibold text-emerald-950">
								{preview.preview.derivedAttackItems.length}
							</p>
						</div>
						<div class="rounded-2xl border border-emerald-200 bg-white px-4 py-3">
							<p class="text-xs uppercase tracking-[0.15em] text-emerald-700">Pending picks</p>
							<p class="mt-2 text-sm font-semibold text-emerald-950">
								{preview.preview.pendingChoiceLines.length}
							</p>
						</div>
					</div>

					<p class="mt-4 text-sm text-emerald-900">
						The full granted details and derived equipment remain visible in the derived
						snapshot above. This final step is focused on confirming the saved outcome.
					</p>
				</div>
			{/if}

			{#if reviewPendingLines.length > 0}
				<div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
					<p class="text-sm font-semibold text-amber-950">
						Finish the remaining guided choices before saving.
					</p>
					<ul class="mt-3 space-y-2 text-sm text-amber-900">
						{#each reviewPendingLines as line}
							<li>{line}</li>
						{/each}
					</ul>
				</div>
			{:else}
				<p class="mt-5 text-sm text-stone-600">
					This guided draft is ready to save through the canonical level-1 path.
				</p>
			{/if}
		{:else}
			<p class="mt-4 text-sm text-stone-600">
				Complete the earlier steps to unlock the final guided review.
			</p>
		{/if}

		<div class="mt-5 flex flex-wrap gap-3">
			<button
				class="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-200 disabled:text-emerald-800"
				type="submit"
				disabled={!canSaveGuidedDraft}
			>
				Save guided draft
			</button>
		</div>
	</section>
</form>
