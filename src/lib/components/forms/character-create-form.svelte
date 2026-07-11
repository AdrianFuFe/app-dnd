<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		createCharacterFormValues,
		type CharacterCreateFormValues
	} from '$lib/domain/characters/character-form';
	import {
		formatMechanicSummaryLines,
		hasMechanicSummary
	} from '$lib/domain/content/mechanic-summary-display';
	import type {
		CharacterCreationCatalog,
		CharacterGrantedSpellLevelGroup
	} from '$lib/types/content/character-catalog';
	import type {
		EquipmentCatalogEntry,
		FeatCatalogEntry,
		SpellCatalogEntry
	} from '$lib/types/content/expanded-content-catalog';

	type CharacterFieldErrors = Partial<Record<keyof CharacterCreateFormValues, string[]>>;
	type CharacterCancelHref = '/app/characters' | `/app/characters/${string}`;
	type InventoryFormItem = {
		equipmentId: string;
		name: string;
		quantity: string;
		description: string;
		weight: string;
		value: string;
		isEquipped: boolean;
	};
	type AttackFormItem = {
		equipmentId: string;
		name: string;
		attackBonus: string;
		damage: string;
		damageType: string;
		range: string;
		description: string;
	};
	type SpellFormItem = {
		spellId: string;
		name: string;
		level: string;
		school: string;
		castingTime: string;
		range: string;
		components: string;
		duration: string;
		description: string;
		isPrepared: boolean;
	};
	type FeatFormItem = {
		featId: string;
		name: string;
		description: string;
	};
	type NoteFormItem = {
		title: string;
		content: string;
	};
	type SpellGrantGroup = {
		key: string;
		title: string;
		entries: SpellCatalogEntry[];
	};

	let {
		catalog,
		equipmentCatalog,
		featCatalog,
		spellCatalog,
		values,
		errors = {},
		formError,
		submitLabel = 'Create character',
		cancelHref = '/app/characters',
		cancelLabel = 'Back to characters'
	}: {
		catalog: CharacterCreationCatalog;
		equipmentCatalog: EquipmentCatalogEntry[];
		featCatalog: FeatCatalogEntry[];
		spellCatalog: SpellCatalogEntry[];
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

	const formSections = [
		{ id: 'identity', label: 'Identity', detail: 'Name, ancestry, class path, background' },
		{ id: 'ability-scores', label: 'Ability Scores', detail: 'Core six ability values' },
		{ id: 'combat-snapshot', label: 'Combat Snapshot', detail: 'HP, AC, initiative, speed' },
		{ id: 'attacks', label: 'Attacks', detail: 'Weapons and attack rows' },
		{ id: 'spells', label: 'Spells', detail: 'Prepared and catalog-linked spells' },
		{ id: 'feats', label: 'Feats', detail: 'Structured feat rows' },
		{ id: 'inventory', label: 'Inventory', detail: 'Gear and equipped items' },
		{ id: 'notes', label: 'Notes', detail: 'Named note sections' }
	] as const;

	let formValues = $state(createCharacterFormValues());
	let attackItems = $state<AttackFormItem[]>([]);
	let spellItems = $state<SpellFormItem[]>([]);
	let featItems = $state<FeatFormItem[]>([]);
	let inventoryItems = $state<InventoryFormItem[]>([]);
	let noteItems = $state<NoteFormItem[]>([]);
	let attackItemsField: HTMLInputElement | null = null;
	let spellItemsField: HTMLInputElement | null = null;
	let featItemsField: HTMLInputElement | null = null;
	let inventoryItemsField: HTMLInputElement | null = null;
	let noteItemsField: HTMLInputElement | null = null;
	let notesField: HTMLInputElement | null = null;

	$effect(() => {
		formValues = { ...values };
		attackItems = parseAttackItems(values.attackItems, values.attacks);
		spellItems = parseSpellItems(values.spellItems, values.spells);
		featItems = parseFeatItems(values.featItems);
		inventoryItems = parseInventoryItems(values.inventoryItems);
		noteItems = parseNoteItems(values.noteItems, values.notes);
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

	function selectedSpeciesMechanicLines(speciesId: string): string[] {
		const option = selectedSpecies(speciesId);
		return option && hasMechanicSummary(option.mechanicSummary)
			? formatMechanicSummaryLines(option.mechanicSummary)
			: [];
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

	function selectedSubspeciesMechanicLines(subspeciesId: string): string[] {
		const option = catalog.subspeciesOptions.find((entry) => entry.id === subspeciesId);
		return option && hasMechanicSummary(option.mechanicSummary)
			? formatMechanicSummaryLines(option.mechanicSummary)
			: [];
	}

	function selectedClassDetails(classId: string): string | undefined {
		const option = catalog.classOptions.find((entry) => entry.id === classId);

		if (!option) {
			return undefined;
		}

		const hitDie = `Hit die d${option.hitDie}`;
		return option.summary ? `${hitDie}. ${option.summary}` : hitDie;
	}

	function selectedClassMechanicLines(classId: string): string[] {
		const option = catalog.classOptions.find((entry) => entry.id === classId);
		return option && hasMechanicSummary(option.mechanicSummary)
			? formatMechanicSummaryLines(option.mechanicSummary)
			: [];
	}

	function selectedClass(classId: string) {
		return catalog.classOptions.find((entry) => entry.id === classId);
	}

	function selectedSubclass(subclassId: string) {
		return catalog.subclassOptions.find((entry) => entry.id === subclassId);
	}

	function availableSubclassOptions(classId: string) {
		const classSlug = selectedClass(classId)?.slug;
		return classSlug
			? catalog.subclassOptions.filter((option) => option.classSlug === classSlug)
			: [];
	}

	function findSpellCatalogEntryBySlug(spellSlug: string) {
		return spellCatalog.find((entry) => entry.slug === spellSlug);
	}

	function spellEntriesForGrantSlugs(spellSlugs: string[]) {
		return spellSlugs.flatMap((spellSlug) => {
			const spell = findSpellCatalogEntryBySlug(spellSlug);
			return spell ? [spell] : [];
		});
	}

	function selectedClassGrantedSpellEntries(classId: string) {
		return spellEntriesForGrantSlugs(selectedClass(classId)?.grantedSpellSlugs ?? []);
	}

	function selectedSubclassGrantedSpellGroups(
		subclassId: string
	): CharacterGrantedSpellLevelGroup[] {
		return selectedSubclass(subclassId)?.grantedSpellsByLevel ?? [];
	}

	function selectedSpellGrantGroups(classId: string, subclassId: string): SpellGrantGroup[] {
		const classOption = selectedClass(classId);
		const subclassOption = selectedSubclass(subclassId);
		const groups: SpellGrantGroup[] = [];
		const classEntries = selectedClassGrantedSpellEntries(classId);

		if (classOption && classEntries.length > 0) {
			groups.push({
				key: `class:${classOption.id}`,
				title: `${classOption.name} granted spells`,
				entries: classEntries
			});
		}

		if (subclassOption) {
			for (const grantGroup of selectedSubclassGrantedSpellGroups(subclassId)) {
				const entries = spellEntriesForGrantSlugs(grantGroup.spellSlugs);

				if (entries.length === 0) {
					continue;
				}

				groups.push({
					key: `subclass:${subclassOption.id}:level:${grantGroup.level}`,
					title: `${subclassOption.name} granted spells at character level ${grantGroup.level}`,
					entries
				});
			}
		}

		return groups;
	}

	function availableSpellCatalogEntries(classId: string, subclassId: string) {
		const classSlug = selectedClass(classId)?.slug;
		const grantedSpellIds = new Set([
			...selectedClassGrantedSpellEntries(classId).map((entry) => entry.id),
			...selectedSubclassGrantedSpellGroups(subclassId)
				.flatMap((group) => spellEntriesForGrantSlugs(group.spellSlugs))
				.map((entry) => entry.id)
		]);

		if (!classSlug && grantedSpellIds.size === 0) {
			return spellCatalog;
		}

		return spellCatalog.filter(
			(entry) =>
				grantedSpellIds.has(entry.id) ||
				!classSlug ||
				entry.classSlugs.length === 0 ||
				entry.classSlugs.includes(classSlug)
		);
	}

	function findSpellCatalogEntryById(spellId: string) {
		return spellCatalog.find((entry) => entry.id === spellId);
	}

	function selectedSpellCatalogId(item: SpellFormItem): string {
		const match = spellCatalog.find(
			(entry) =>
				entry.id === item.spellId ||
				(entry.name === item.name &&
					(item.level.trim().length === 0 || String(entry.level) === item.level))
		);

		return match?.id ?? '';
	}

	function applyCatalogSpell(index: number, spellId: string) {
		const spell = findSpellCatalogEntryById(spellId);

		if (!spell) {
			updateSpellItem(index, { spellId: '' });
			return;
		}

		updateSpellItem(
			index,
			createSpellFormItemFromCatalogSpell(spell, spellItems[index]?.isPrepared)
		);
	}

	function createSpellFormItemFromCatalogSpell(
		spell: SpellCatalogEntry,
		isPrepared = false
	): SpellFormItem {
		return {
			spellId: spell.id,
			name: spell.name,
			level: String(spell.level),
			school: spell.school,
			castingTime: spell.castingTime ?? '',
			range: spell.range ?? '',
			components: spell.components ?? '',
			duration: spell.duration ?? '',
			description: spell.description ?? spell.summary ?? '',
			isPrepared
		};
	}

	function hasSpellCatalogEntry(spellId: string) {
		return spellItems.some(
			(item) => item.spellId === spellId || selectedSpellCatalogId(item) === spellId
		);
	}

	function addGrantedSpell(spellId: string) {
		const spell = findSpellCatalogEntryById(spellId);

		if (!spell || hasSpellCatalogEntry(spellId)) {
			return;
		}

		spellItems = [...spellItems, createSpellFormItemFromCatalogSpell(spell, true)];
	}

	function addGrantedSpellGroup(spells: SpellCatalogEntry[]) {
		const newItems = spells
			.filter((spell) => !hasSpellCatalogEntry(spell.id))
			.map((spell) => createSpellFormItemFromCatalogSpell(spell, true));

		if (newItems.length === 0) {
			return;
		}

		spellItems = [...spellItems, ...newItems];
	}

	function selectedSubclassSummary(subclassId: string): string | undefined {
		return (
			catalog.subclassOptions.find((option) => option.id === subclassId)?.summary ?? undefined
		);
	}

	function selectedSubclassMechanicLines(subclassId: string): string[] {
		const option = catalog.subclassOptions.find((entry) => entry.id === subclassId);
		return option && hasMechanicSummary(option.mechanicSummary)
			? formatMechanicSummaryLines(option.mechanicSummary)
			: [];
	}

	function selectedBackgroundSummary(backgroundId: string): string | undefined {
		return (
			catalog.backgroundOptions.find((option) => option.id === backgroundId)?.summary ??
			undefined
		);
	}

	function selectedBackgroundMechanicLines(backgroundId: string): string[] {
		const option = catalog.backgroundOptions.find((entry) => entry.id === backgroundId);
		return option && hasMechanicSummary(option.mechanicSummary)
			? formatMechanicSummaryLines(option.mechanicSummary)
			: [];
	}

	function handleSpeciesChange(event: Event) {
		const nextSpeciesId = (event.currentTarget as HTMLSelectElement).value;

		formValues =
			nextSpeciesId !== formValues.speciesId
				? { ...formValues, speciesId: nextSpeciesId, subspeciesId: '' }
				: { ...formValues, speciesId: nextSpeciesId };
	}

	function handleClassChange(event: Event) {
		const nextClassId = (event.currentTarget as HTMLSelectElement).value;

		formValues =
			nextClassId !== formValues.classId
				? { ...formValues, classId: nextClassId, subclassId: '' }
				: { ...formValues, classId: nextClassId };
	}

	function addInventoryItem() {
		inventoryItems = [
			...inventoryItems,
			{
				equipmentId: '',
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

	function updateInventoryItem(index: number, patch: Partial<InventoryFormItem>) {
		inventoryItems = inventoryItems.map((item, itemIndex) =>
			itemIndex === index ? { ...item, ...patch } : item
		);
	}

	function addAttackItem() {
		attackItems = [
			...attackItems,
			{
				equipmentId: '',
				name: '',
				attackBonus: '',
				damage: '',
				damageType: '',
				range: '',
				description: ''
			}
		];
	}

	function removeAttackItem(index: number) {
		attackItems = attackItems.filter((_, itemIndex) => itemIndex !== index);
	}

	function updateAttackItem(index: number, patch: Partial<AttackFormItem>) {
		attackItems = attackItems.map((item, itemIndex) =>
			itemIndex === index ? { ...item, ...patch } : item
		);
	}

	function addSpellItem() {
		spellItems = [
			...spellItems,
			{
				spellId: '',
				name: '',
				level: '',
				school: '',
				castingTime: '',
				range: '',
				components: '',
				duration: '',
				description: '',
				isPrepared: false
			}
		];
	}

	function findFeatCatalogEntryById(featId: string) {
		return featCatalog.find((entry) => entry.id === featId);
	}

	function availableAttackEquipmentCatalogEntries() {
		return equipmentCatalog.filter((entry) => entry.isWeapon);
	}

	function findEquipmentCatalogEntryById(equipmentId: string) {
		return equipmentCatalog.find((entry) => entry.id === equipmentId);
	}

	function selectedAttackEquipmentCatalogId(item: AttackFormItem): string {
		const match = equipmentCatalog.find(
			(entry) => entry.id === item.equipmentId || entry.name === item.name
		);

		return match?.id ?? '';
	}

	function selectedInventoryEquipmentCatalogId(item: InventoryFormItem): string {
		const match = equipmentCatalog.find(
			(entry) => entry.id === item.equipmentId || entry.name === item.name
		);

		return match?.id ?? '';
	}

	function applyCatalogAttack(index: number, equipmentId: string) {
		const equipment = findEquipmentCatalogEntryById(equipmentId);

		if (!equipment) {
			updateAttackItem(index, { equipmentId: '' });
			return;
		}

		updateAttackItem(index, {
			equipmentId: equipment.id,
			name: equipment.name,
			damage: equipment.damage ?? '',
			damageType: equipment.damageType ?? '',
			range: equipment.range ?? '',
			description: equipment.description ?? equipment.summary ?? ''
		});
	}

	function applyCatalogInventoryItem(index: number, equipmentId: string) {
		const equipment = findEquipmentCatalogEntryById(equipmentId);

		if (!equipment) {
			updateInventoryItem(index, { equipmentId: '' });
			return;
		}

		updateInventoryItem(index, {
			equipmentId: equipment.id,
			name: equipment.name,
			weight: equipment.weight !== null ? String(equipment.weight) : '',
			value: equipment.value ?? '',
			description: equipment.description ?? equipment.summary ?? ''
		});
	}

	function selectedFeatCatalogId(item: FeatFormItem): string {
		const match = featCatalog.find(
			(entry) => entry.id === item.featId || entry.name === item.name
		);

		return match?.id ?? '';
	}

	function applyCatalogFeat(index: number, featId: string) {
		const feat = findFeatCatalogEntryById(featId);

		if (!feat) {
			updateFeatItem(index, { featId: '' });
			return;
		}

		updateFeatItem(index, {
			featId: feat.id,
			name: feat.name,
			description: feat.description ?? feat.summary ?? ''
		});
	}

	function addFeatItem() {
		featItems = [
			...featItems,
			{
				featId: '',
				name: '',
				description: ''
			}
		];
	}

	function removeFeatItem(index: number) {
		featItems = featItems.filter((_, itemIndex) => itemIndex !== index);
	}

	function updateFeatItem(index: number, patch: Partial<FeatFormItem>) {
		featItems = featItems.map((item, itemIndex) =>
			itemIndex === index ? { ...item, ...patch } : item
		);
	}

	function addNoteItem() {
		noteItems = [
			...noteItems,
			{
				title: '',
				content: ''
			}
		];
	}

	function removeNoteItem(index: number) {
		noteItems = noteItems.filter((_, itemIndex) => itemIndex !== index);
	}

	function updateNoteItem(index: number, patch: Partial<NoteFormItem>) {
		noteItems = noteItems.map((item, itemIndex) =>
			itemIndex === index ? { ...item, ...patch } : item
		);
	}

	function removeSpellItem(index: number) {
		spellItems = spellItems.filter((_, itemIndex) => itemIndex !== index);
	}

	function updateSpellItem(index: number, patch: Partial<SpellFormItem>) {
		spellItems = spellItems.map((item, itemIndex) =>
			itemIndex === index ? { ...item, ...patch } : item
		);
	}

	function attackItemsFieldValue(): string {
		return JSON.stringify(
			attackItems.map((item) => ({
				equipmentId: item.equipmentId.trim().length > 0 ? item.equipmentId : undefined,
				name: item.name,
				attackBonus: item.attackBonus,
				damage: item.damage,
				damageType: item.damageType,
				range: item.range,
				description: item.description
			}))
		);
	}

	function inventoryItemsFieldValue(): string {
		return JSON.stringify(
			inventoryItems.map((item) => ({
				equipmentId: item.equipmentId.trim().length > 0 ? item.equipmentId : undefined,
				name: item.name,
				quantity: item.quantity.trim().length > 0 ? Number(item.quantity) : 1,
				description: item.description,
				weight: item.weight.trim().length > 0 ? Number(item.weight) : undefined,
				value: item.value,
				isEquipped: item.isEquipped
			}))
		);
	}

	function spellItemsFieldValue(): string {
		return JSON.stringify(
			spellItems.map((item) => ({
				spellId: item.spellId.trim().length > 0 ? item.spellId : undefined,
				name: item.name,
				level: item.level.trim().length > 0 ? Number(item.level) : undefined,
				school: item.school,
				castingTime: item.castingTime,
				range: item.range,
				components: item.components,
				duration: item.duration,
				description: item.description,
				isPrepared: item.isPrepared
			}))
		);
	}

	function featItemsFieldValue(): string {
		return JSON.stringify(
			featItems.map((item) => ({
				featId: item.featId.trim().length > 0 ? item.featId : undefined,
				name: item.name,
				description: item.description
			}))
		);
	}

	function noteItemsFieldValue(): string {
		return JSON.stringify(serializeNoteItems(noteItems));
	}

	function notesFieldValue(): string {
		const sanitizedNoteItems = sanitizeNoteItems(noteItems);

		if (sanitizedNoteItems.length === 0) {
			return formValues.notes;
		}

		return sanitizedNoteItems.map((item) => `${item.title}\n${item.content}`).join('\n\n');
	}

	function parseAttackItems(value: string, fallbackText: string): AttackFormItem[] {
		if (value.trim()) {
			try {
				const parsed = JSON.parse(value);

				if (Array.isArray(parsed)) {
					return parsed.map((item) => ({
						equipmentId: typeof item?.equipmentId === 'string' ? item.equipmentId : '',
						name: typeof item?.name === 'string' ? item.name : '',
						attackBonus: typeof item?.attackBonus === 'string' ? item.attackBonus : '',
						damage: typeof item?.damage === 'string' ? item.damage : '',
						damageType: typeof item?.damageType === 'string' ? item.damageType : '',
						range: typeof item?.range === 'string' ? item.range : '',
						description: typeof item?.description === 'string' ? item.description : ''
					}));
				}
			} catch {
				// Fall back to the legacy text mirror below.
			}
		}

		return splitLegacyAttackEntries(fallbackText)
			.map((item) => item.trim())
			.filter((item) => item.length > 0)
			.map((name) => ({
				equipmentId: '',
				name,
				attackBonus: '',
				damage: '',
				damageType: '',
				range: '',
				description: ''
			}));
	}

	function splitLegacyAttackEntries(value: string): string[] {
		if (value.includes('\n') || value.includes('\r')) {
			return value.split(/\r?\n/);
		}

		return value.trim().length > 0 ? [value] : [];
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
				equipmentId: typeof item?.equipmentId === 'string' ? item.equipmentId : '',
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

	function parseNoteItems(value: string, fallbackText: string): NoteFormItem[] {
		if (value.trim()) {
			try {
				const parsed = JSON.parse(value);

				if (Array.isArray(parsed)) {
					return parsed.map((item) => ({
						title: typeof item?.title === 'string' ? item.title : '',
						content: typeof item?.content === 'string' ? item.content : ''
					}));
				}
			} catch {
				// Fall back to the legacy text mirror below.
			}
		}

		if (!fallbackText.trim()) {
			return [];
		}

		return [
			{
				title: 'General Notes',
				content: fallbackText.trim()
			}
		];
	}

	function sanitizeNoteItems(items: NoteFormItem[]): NoteFormItem[] {
		return items.filter(
			(item) => item.title.trim().length > 0 || item.content.trim().length > 0
		);
	}

	function serializeNoteItems(items: NoteFormItem[]) {
		return sanitizeNoteItems(items).map((item) => ({
			title: item.title,
			content: item.content
		}));
	}

	function parseSpellItems(value: string, fallbackText: string): SpellFormItem[] {
		if (value.trim()) {
			try {
				const parsed = JSON.parse(value);

				if (Array.isArray(parsed)) {
					return parsed.map((item) => ({
						spellId: typeof item?.spellId === 'string' ? item.spellId : '',
						name: typeof item?.name === 'string' ? item.name : '',
						level:
							typeof item?.level === 'number' || typeof item?.level === 'string'
								? String(item.level)
								: '',
						school: typeof item?.school === 'string' ? item.school : '',
						castingTime: typeof item?.castingTime === 'string' ? item.castingTime : '',
						range: typeof item?.range === 'string' ? item.range : '',
						components: typeof item?.components === 'string' ? item.components : '',
						duration: typeof item?.duration === 'string' ? item.duration : '',
						description: typeof item?.description === 'string' ? item.description : '',
						isPrepared: item?.isPrepared === true
					}));
				}
			} catch {
				// Fall back to the legacy text mirror below.
			}
		}

		return fallbackText
			.split(/\r?\n|,/)
			.map((item) => item.trim())
			.filter((item) => item.length > 0)
			.map((name) => ({
				spellId: '',
				name,
				level: '',
				school: '',
				castingTime: '',
				range: '',
				components: '',
				duration: '',
				description: '',
				isPrepared: false
			}));
	}

	function parseFeatItems(value: string): FeatFormItem[] {
		if (!value.trim()) {
			return [];
		}

		try {
			const parsed = JSON.parse(value);

			if (!Array.isArray(parsed)) {
				return [];
			}

			return parsed.map((item) => ({
				featId: typeof item?.featId === 'string' ? item.featId : '',
				name: typeof item?.name === 'string' ? item.name : '',
				description: typeof item?.description === 'string' ? item.description : ''
			}));
		} catch {
			return [];
		}
	}

	function syncStructuredFieldValues() {
		if (attackItemsField) {
			attackItemsField.value = attackItemsFieldValue();
		}

		if (spellItemsField) {
			spellItemsField.value = spellItemsFieldValue();
		}

		if (featItemsField) {
			featItemsField.value = featItemsFieldValue();
		}

		if (inventoryItemsField) {
			inventoryItemsField.value = inventoryItemsFieldValue();
		}

		const noteRows = serializeNoteItems(noteItems);

		if (noteItemsField) {
			noteItemsField.value = JSON.stringify(noteRows);
		}

		if (notesField) {
			notesField.value =
				noteRows.length === 0
					? formValues.notes
					: noteRows.map((item) => `${item.title}\n${item.content}`).join('\n\n');
		}
	}

	function structuredDraftCount(): number {
		return (
			attackItems.length +
			spellItems.length +
			featItems.length +
			inventoryItems.length +
			sanitizeNoteItems(noteItems).length
		);
	}

	function selectedIdentityCount(): number {
		return [
			formValues.speciesId,
			formValues.subspeciesId,
			formValues.classId,
			formValues.subclassId,
			formValues.backgroundId
		].filter((value) => value.trim().length > 0).length;
	}
</script>

<form method="POST" class="space-y-8" onsubmit={syncStructuredFieldValues}>
	{#if formError}
		<p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{formError}
		</p>
	{/if}

	<section class="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
			<div class="max-w-2xl space-y-2">
				<h2 class="text-xl font-semibold text-stone-900">Draft overview</h2>
				<p class="text-sm leading-6 text-stone-600">
					Use this pass to keep the current character workflow easier to scan. Jump to any
					section below, then come back later for deeper guided creation.
				</p>
			</div>

			<div class="grid gap-3 sm:grid-cols-3 xl:min-w-[26rem]">
				<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
						Ruleset
					</p>
					<p class="mt-2 text-sm font-semibold text-stone-900">DnD 2014 SRD</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
						Draft mode
					</p>
					<p class="mt-2 text-sm font-semibold text-stone-900">Canon baseline</p>
				</div>
				<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
					<p class="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
						Structured rows
					</p>
					<p class="mt-2 text-sm font-semibold text-stone-900">{structuredDraftCount()}</p>
				</div>
			</div>
		</div>

		<div class="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
				<p class="text-sm font-medium text-stone-500">Draft name</p>
				<p class="mt-2 text-base font-semibold text-stone-900">
					{formValues.name.trim().length > 0 ? formValues.name : 'Not named yet'}
				</p>
			</div>
			<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
				<p class="text-sm font-medium text-stone-500">Identity selections</p>
				<p class="mt-2 text-base font-semibold text-stone-900">{selectedIdentityCount()} / 5</p>
			</div>
			<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
				<p class="text-sm font-medium text-stone-500">Level</p>
				<p class="mt-2 text-base font-semibold text-stone-900">
					{formValues.level.trim().length > 0 ? formValues.level : 'Unset'}
				</p>
			</div>
			<div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
				<p class="text-sm font-medium text-stone-500">Combat baseline</p>
				<p class="mt-2 text-base font-semibold text-stone-900">
					HP {formValues.currentHp || '0'} / {formValues.maxHp || '0'} · AC {formValues.armorClass || '0'}
				</p>
			</div>
		</div>

		<div class="mt-6">
			<p class="text-sm font-medium text-stone-700">Jump to section</p>
			<div class="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				{#each formSections as section (section.id)}
					<a
						class="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm transition hover:border-stone-400 hover:bg-stone-50"
						href={`#${section.id}`}
					>
						<p class="font-semibold text-stone-900">{section.label}</p>
						<p class="mt-1 text-stone-500">{section.detail}</p>
					</a>
				{/each}
			</div>
		</div>

		<input type="hidden" name="rulesetCode" value="dnd-2014-srd" />
		<input type="hidden" name="contentMode" value="canon" />
	</section>

	<section id="identity" class="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
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
				{:else if selectedSpeciesSummary(formValues.speciesId) || selectedSpeciesMechanicLines(formValues.speciesId).length > 0}
					<div class="mt-1 space-y-1 text-sm text-stone-500">
						{#if selectedSpeciesSummary(formValues.speciesId)}
							<p>{selectedSpeciesSummary(formValues.speciesId)}</p>
						{/if}
						{#each selectedSpeciesMechanicLines(formValues.speciesId) as line (line)}
							<p>{line}</p>
						{/each}
					</div>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Subspecies</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="subspeciesId"
					bind:value={formValues.subspeciesId}
					onchange={(event) => {
						formValues = {
							...formValues,
							subspeciesId: (event.currentTarget as HTMLSelectElement).value
						};
					}}
				>
					<option value="">Select a subspecies</option>
					{#each availableSubspeciesOptions(formValues.speciesId) as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('subspeciesId')}
					<p class="mt-1 text-sm text-red-700">{firstError('subspeciesId')}</p>
				{:else if selectedSubspeciesSummary(formValues.subspeciesId) || selectedSubspeciesMechanicLines(formValues.subspeciesId).length > 0}
					<div class="mt-1 space-y-1 text-sm text-stone-500">
						{#if selectedSubspeciesSummary(formValues.subspeciesId)}
							<p>{selectedSubspeciesSummary(formValues.subspeciesId)}</p>
						{/if}
						{#each selectedSubspeciesMechanicLines(formValues.subspeciesId) as line (line)}
							<p>{line}</p>
						{/each}
					</div>
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
				{:else if selectedClassDetails(formValues.classId) || selectedClassMechanicLines(formValues.classId).length > 0}
					<div class="mt-1 space-y-1 text-sm text-stone-500">
						{#if selectedClassDetails(formValues.classId)}
							<p>{selectedClassDetails(formValues.classId)}</p>
						{/if}
						{#each selectedClassMechanicLines(formValues.classId) as line (line)}
							<p>{line}</p>
						{/each}
					</div>
				{/if}
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium text-stone-700">Subclass</span>
				<select
					class="block w-full rounded-lg border-stone-300"
					name="subclassId"
					bind:value={formValues.subclassId}
					onchange={(event) => {
						formValues = {
							...formValues,
							subclassId: (event.currentTarget as HTMLSelectElement).value
						};
					}}
				>
					<option value="">Select a subclass</option>
					{#each availableSubclassOptions(formValues.classId) as option (option.id)}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				{#if firstError('subclassId')}
					<p class="mt-1 text-sm text-red-700">{firstError('subclassId')}</p>
				{:else if selectedSubclassSummary(formValues.subclassId) || selectedSubclassMechanicLines(formValues.subclassId).length > 0}
					<div class="mt-1 space-y-1 text-sm text-stone-500">
						{#if selectedSubclassSummary(formValues.subclassId)}
							<p>{selectedSubclassSummary(formValues.subclassId)}</p>
						{/if}
						{#each selectedSubclassMechanicLines(formValues.subclassId) as line (line)}
							<p>{line}</p>
						{/each}
					</div>
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
				{:else if selectedBackgroundSummary(formValues.backgroundId) || selectedBackgroundMechanicLines(formValues.backgroundId).length > 0}
					<div class="mt-1 space-y-1 text-sm text-stone-500">
						{#if selectedBackgroundSummary(formValues.backgroundId)}
							<p>{selectedBackgroundSummary(formValues.backgroundId)}</p>
						{/if}
						{#each selectedBackgroundMechanicLines(formValues.backgroundId) as line (line)}
							<p>{line}</p>
						{/each}
					</div>
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

	<section
		id="ability-scores"
		class="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
	>
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

	<section
		id="combat-snapshot"
		class="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
	>
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

	<section id="attacks" class="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
			<div class="space-y-1">
				<h2 class="text-xl font-semibold text-stone-900">Attacks</h2>
				<p class="text-sm text-stone-600">
					Track attacks as structured rows so names, bonuses, and damage do not disappear
					into one text block.
				</p>
			</div>
			<button
				class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400"
				type="button"
				onclick={addAttackItem}
			>
				Add attack
			</button>
		</div>

		<input
			type="hidden"
			name="attackItems"
			value={attackItemsFieldValue()}
			bind:this={attackItemsField}
		/>

		{#if firstError('attackItems')}
			<p class="mt-4 text-sm text-red-700">{firstError('attackItems')}</p>
		{/if}

		{#if attackItems.length === 0}
			<p
				class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
			>
				No attacks yet. Add the actions this character actually uses so combat details stay
				scannable.
			</p>
		{:else}
			<div class="mt-6 space-y-4">
				{#each attackItems as item, index (index)}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4" data-note-row>
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">Attack {index + 1}</p>
							<button
								class="text-sm font-medium text-rose-700 transition hover:text-rose-900"
								type="button"
								onclick={() => removeAttackItem(index)}
							>
								Remove
							</button>
						</div>

						<div class="mt-4 grid gap-4 lg:grid-cols-2">
							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Catalog weapon</span
								>
								<select
									class="block w-full rounded-lg border-stone-300"
									value={selectedAttackEquipmentCatalogId(item)}
									onchange={(event) =>
										applyCatalogAttack(
											index,
											(event.currentTarget as HTMLSelectElement).value
										)}
								>
									<option value="">Custom attack or choose from catalog</option>
									{#each availableAttackEquipmentCatalogEntries() as option (option.id)}
										<option value={option.id}>{option.name}</option>
									{/each}
								</select>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Attack name</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									value={item.name}
									oninput={(event) =>
										updateAttackItem(index, {
											equipmentId: '',
											name: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Attack bonus</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									placeholder="+5 to hit"
									value={item.attackBonus}
									oninput={(event) =>
										updateAttackItem(index, {
											attackBonus: (event.currentTarget as HTMLInputElement)
												.value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Damage</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									placeholder="1d8 + 3"
									value={item.damage}
									oninput={(event) =>
										updateAttackItem(index, {
											equipmentId: '',
											damage: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Damage type</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									placeholder="slashing"
									value={item.damageType}
									oninput={(event) =>
										updateAttackItem(index, {
											equipmentId: '',
											damageType: (event.currentTarget as HTMLInputElement)
												.value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Range</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									placeholder="Melee or 20/60 ft."
									value={item.range}
									oninput={(event) =>
										updateAttackItem(index, {
											equipmentId: '',
											range: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Description</span
								>
								<textarea
									class="block min-h-24 w-full rounded-lg border-stone-300"
									value={item.description}
									oninput={(event) =>
										updateAttackItem(index, {
											equipmentId: '',
											description: (
												event.currentTarget as HTMLTextAreaElement
											).value
										})}></textarea>
							</label>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section id="spells" class="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
			<div class="space-y-1">
				<h2 class="text-xl font-semibold text-stone-900">Spells</h2>
				<p class="text-sm text-stone-600">
					Choose from the shared spell catalog when possible, then adjust the row manually
					if this draft needs a variant or extra notes.
				</p>
			</div>
			<button
				class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400"
				type="button"
				onclick={addSpellItem}
			>
				Add spell
			</button>
		</div>

		<input
			type="hidden"
			name="spellItems"
			value={spellItemsFieldValue()}
			bind:this={spellItemsField}
		/>

		{#if firstError('spellItems')}
			<p class="mt-4 text-sm text-red-700">{firstError('spellItems')}</p>
		{/if}

		{#if selectedSpellGrantGroups(formValues.classId, formValues.subclassId).length > 0}
			<div class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
				<div class="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
					<div class="space-y-1">
						<p class="text-sm font-semibold text-emerald-900">
							Granted spell suggestions
						</p>
						<p class="text-sm text-emerald-800">
							The selected class path grants these spells directly. Add only the ones
							this draft should track right now.
						</p>
					</div>
				</div>

				<div class="mt-4 space-y-3">
					{#each selectedSpellGrantGroups(formValues.classId, formValues.subclassId) as group (group.key)}
						<div class="rounded-2xl border border-emerald-200 bg-white/70 p-3">
							<div
								class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
							>
								<div class="space-y-2">
									<p class="text-sm font-medium text-emerald-950">
										{group.title}
									</p>
									<div class="flex flex-wrap gap-2">
										{#each group.entries as spell (spell.id)}
											<button
												class="rounded-full border px-3 py-1 text-sm transition disabled:cursor-default disabled:opacity-70 {hasSpellCatalogEntry(
													spell.id
												)
													? 'border-emerald-200 bg-emerald-100 text-emerald-700'
													: 'border-emerald-300 bg-white text-emerald-900 hover:border-emerald-400'}"
												type="button"
												disabled={hasSpellCatalogEntry(spell.id)}
												onclick={() => addGrantedSpell(spell.id)}
											>
												{spell.name} ({spell.level === 0
													? 'Cantrip'
													: `Level ${spell.level}`})
												{#if hasSpellCatalogEntry(spell.id)}
													added{/if}
											</button>
										{/each}
									</div>
								</div>

								<button
									class="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-900 transition hover:border-emerald-400 disabled:cursor-default disabled:opacity-60"
									type="button"
									disabled={group.entries.every((spell) =>
										hasSpellCatalogEntry(spell.id)
									)}
									onclick={() => addGrantedSpellGroup(group.entries)}
								>
									Add all
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if spellItems.length === 0}
			<p
				class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
			>
				No spells yet. Add only the spells this draft actually needs right now.
			</p>
		{:else}
			<div class="mt-6 space-y-4">
				{#each spellItems as item, index (index)}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">Spell {index + 1}</p>
							<button
								class="text-sm font-medium text-rose-700 transition hover:text-rose-900"
								type="button"
								onclick={() => removeSpellItem(index)}
							>
								Remove
							</button>
						</div>

						<div class="mt-4 grid gap-4 lg:grid-cols-2">
							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Catalog spell</span
								>
								<select
									class="block w-full rounded-lg border-stone-300"
									value={selectedSpellCatalogId(item)}
									onchange={(event) =>
										applyCatalogSpell(
											index,
											(event.currentTarget as HTMLSelectElement).value
										)}
								>
									<option value="">Custom spell or choose from catalog</option>
									{#each availableSpellCatalogEntries(formValues.classId, formValues.subclassId) as option (option.id)}
										<option value={option.id}>
											{option.name} ({option.level === 0
												? 'Cantrip'
												: `Level ${option.level}`})
										</option>
									{/each}
								</select>
								{#if (formValues.classId || formValues.subclassId) && availableSpellCatalogEntries(formValues.classId, formValues.subclassId).length === 0}
									<p class="mt-1 text-sm text-stone-500">
										No shared catalog spells match the currently selected class
										path yet.
									</p>
								{/if}
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Spell name</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									value={item.name}
									oninput={(event) =>
										updateSpellItem(index, {
											spellId: '',
											name: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Spell level</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="number"
									min="0"
									max="9"
									placeholder="0 for cantrip"
									value={item.level}
									oninput={(event) =>
										updateSpellItem(index, {
											spellId: '',
											level: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>School</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									placeholder="Evocation"
									value={item.school}
									oninput={(event) =>
										updateSpellItem(index, {
											spellId: '',
											school: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Casting time</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									placeholder="1 action"
									value={item.castingTime}
									oninput={(event) =>
										updateSpellItem(index, {
											spellId: '',
											castingTime: (event.currentTarget as HTMLInputElement)
												.value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Range</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									placeholder="120 ft."
									value={item.range}
									oninput={(event) =>
										updateSpellItem(index, {
											spellId: '',
											range: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Duration</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									placeholder="Instantaneous"
									value={item.duration}
									oninput={(event) =>
										updateSpellItem(index, {
											spellId: '',
											duration: (event.currentTarget as HTMLInputElement)
												.value
										})}
								/>
							</label>

							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Components</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									placeholder="V, S, M"
									value={item.components}
									oninput={(event) =>
										updateSpellItem(index, {
											spellId: '',
											components: (event.currentTarget as HTMLInputElement)
												.value
										})}
								/>
							</label>

							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Description</span
								>
								<textarea
									class="block min-h-24 w-full rounded-lg border-stone-300"
									value={item.description}
									oninput={(event) =>
										updateSpellItem(index, {
											description: (
												event.currentTarget as HTMLTextAreaElement
											).value
										})}></textarea>
							</label>

							<label class="inline-flex items-center gap-3">
								<input
									class="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
									type="checkbox"
									checked={item.isPrepared}
									onchange={(event) =>
										updateSpellItem(index, {
											isPrepared: (event.currentTarget as HTMLInputElement)
												.checked
										})}
								/>
								<span class="text-sm font-medium text-stone-700">Prepared</span>
							</label>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section id="feats" class="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
			<div class="space-y-1">
				<h2 class="text-xl font-semibold text-stone-900">Feats</h2>
				<p class="text-sm text-stone-600">
					Choose shared catalog feats when possible so the saved draft stays linked to
					trusted content.
				</p>
			</div>
			<button
				class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400"
				type="button"
				onclick={addFeatItem}
			>
				Add feat
			</button>
		</div>

		<input
			type="hidden"
			name="featItems"
			value={featItemsFieldValue()}
			bind:this={featItemsField}
		/>

		{#if firstError('featItems')}
			<p class="mt-4 text-sm text-red-700">{firstError('featItems')}</p>
		{/if}

		{#if featItems.length === 0}
			<p
				class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
			>
				No feats yet. Add the feats this draft already relies on.
			</p>
		{:else}
			<div class="mt-6 space-y-4">
				{#each featItems as item, index (index)}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">Feat {index + 1}</p>
							<button
								class="text-sm font-medium text-rose-700 transition hover:text-rose-900"
								type="button"
								onclick={() => removeFeatItem(index)}
							>
								Remove
							</button>
						</div>

						<div class="mt-4 grid gap-4 lg:grid-cols-2">
							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Catalog feat</span
								>
								<select
									class="block w-full rounded-lg border-stone-300"
									value={selectedFeatCatalogId(item)}
									onchange={(event) =>
										applyCatalogFeat(
											index,
											(event.currentTarget as HTMLSelectElement).value
										)}
								>
									<option value="">Custom feat or choose from catalog</option>
									{#each featCatalog as option (option.id)}
										<option value={option.id}>{option.name}</option>
									{/each}
								</select>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Feat name</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									value={item.name}
									oninput={(event) =>
										updateFeatItem(index, {
											featId: '',
											name: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Description</span
								>
								<textarea
									class="block min-h-24 w-full rounded-lg border-stone-300"
									value={item.description}
									oninput={(event) =>
										updateFeatItem(index, {
											description: (
												event.currentTarget as HTMLTextAreaElement
											).value
										})}></textarea>
							</label>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section
		id="inventory"
		class="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
	>
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

		<input
			type="hidden"
			name="inventoryItems"
			value={inventoryItemsFieldValue()}
			bind:this={inventoryItemsField}
		/>

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
				{#each inventoryItems as item, index (index)}
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
							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Catalog item</span
								>
								<select
									class="block w-full rounded-lg border-stone-300"
									value={selectedInventoryEquipmentCatalogId(item)}
									onchange={(event) =>
										applyCatalogInventoryItem(
											index,
											(event.currentTarget as HTMLSelectElement).value
										)}
								>
									<option value="">Custom item or choose from catalog</option>
									{#each equipmentCatalog as option (option.id)}
										<option value={option.id}>{option.name}</option>
									{/each}
								</select>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Item name</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									value={item.name}
									oninput={(event) =>
										updateInventoryItem(index, {
											equipmentId: '',
											name: (event.currentTarget as HTMLInputElement).value
										})}
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
									value={item.quantity}
									oninput={(event) =>
										updateInventoryItem(index, {
											quantity: (event.currentTarget as HTMLInputElement)
												.value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Value</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									type="text"
									value={item.value}
									oninput={(event) =>
										updateInventoryItem(index, {
											equipmentId: '',
											value: (event.currentTarget as HTMLInputElement).value
										})}
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
									value={item.weight}
									oninput={(event) =>
										updateInventoryItem(index, {
											equipmentId: '',
											weight: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block lg:col-span-2">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Description</span
								>
								<textarea
									class="block min-h-24 w-full rounded-lg border-stone-300"
									value={item.description}
									oninput={(event) =>
										updateInventoryItem(index, {
											equipmentId: '',
											description: (
												event.currentTarget as HTMLTextAreaElement
											).value
										})}></textarea>
							</label>

							<label class="inline-flex items-center gap-3">
								<input
									class="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
									type="checkbox"
									checked={item.isEquipped}
									onchange={(event) =>
										updateInventoryItem(index, {
											isEquipped: (event.currentTarget as HTMLInputElement)
												.checked
										})}
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

	<section id="notes" class="scroll-mt-24 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
			<div class="space-y-1">
				<h2 class="text-xl font-semibold text-stone-900">Notes</h2>
				<p class="text-sm text-stone-600">
					Break loose character notes into named sections so goals, contacts, and open
					threads stay easier to scan than one long text blob.
				</p>
			</div>
			<button
				class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900 transition hover:border-stone-400"
				type="button"
				onclick={addNoteItem}
			>
				Add note section
			</button>
		</div>

		<input
			type="hidden"
			name="noteItems"
			value={noteItemsFieldValue()}
			bind:this={noteItemsField}
		/>
		<input type="hidden" name="notes" value={notesFieldValue()} bind:this={notesField} />

		{#if firstError('noteItems')}
			<p class="mt-4 text-sm text-red-700">{firstError('noteItems')}</p>
		{/if}

		{#if noteItems.length === 0}
			<p
				class="mt-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600"
			>
				No note sections yet. Add only the sections this draft really needs.
			</p>
		{:else}
			<div class="mt-6 space-y-4">
				{#each noteItems as item, index (index)}
					<div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
						<div class="flex items-center justify-between gap-3">
							<p class="text-sm font-semibold text-stone-900">
								Note section {index + 1}
							</p>
							<button
								class="text-sm font-medium text-rose-700 transition hover:text-rose-900"
								type="button"
								onclick={() => removeNoteItem(index)}
							>
								Remove
							</button>
						</div>

						<div class="mt-4 grid gap-4">
							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Section title</span
								>
								<input
									class="block w-full rounded-lg border-stone-300"
									data-note-title
									type="text"
									placeholder="Allies, Goals, Hooks..."
									value={item.title}
									oninput={(event) =>
										updateNoteItem(index, {
											title: (event.currentTarget as HTMLInputElement).value
										})}
								/>
							</label>

							<label class="block">
								<span class="mb-1 block text-sm font-medium text-stone-700"
									>Details</span
								>
								<textarea
									class="block min-h-28 w-full rounded-lg border-stone-300"
									data-note-content
									placeholder="Write the details for this section."
									value={item.content}
									oninput={(event) =>
										updateNoteItem(index, {
											content: (event.currentTarget as HTMLTextAreaElement)
												.value
										})}></textarea>
							</label>
						</div>
					</div>
				{/each}
			</div>
		{/if}
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
