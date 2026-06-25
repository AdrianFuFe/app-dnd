import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/database/supabase';
import type { CharacterCreateInput } from '$lib/types/domain/character';

type E2EMockSupabaseClient = SupabaseClient<Database> & {
	__appE2E: true;
};

type E2ECharacterRecord = CharacterCreateInput & {
	id: string;
	updatedAt: string;
	userId: string;
};

const E2E_USER_ID = 'e2e-user-1';
const E2E_USER_EMAIL = 'talia@example.test';

const initialCharacters: E2ECharacterRecord[] = [
	{
		id: 'char-e2e-1',
		userId: E2E_USER_ID,
		updatedAt: '2026-06-25T09:00:00.000Z',
		name: 'Talia Stormstep',
		speciesId: 'species-elf',
		classId: 'class-wizard',
		race: 'Elf',
		className: 'Wizard',
		subclass: 'Evocation',
		level: 3,
		background: 'Sage',
		story: 'Archivist turned explorer.',
		strength: 8,
		dexterity: 14,
		constitution: 13,
		intelligence: 16,
		wisdom: 12,
		charisma: 10,
		maxHp: 20,
		currentHp: 18,
		temporaryHp: 0,
		armorClass: 13,
		initiative: 2,
		speed: 30,
		hitDice: '3d6',
		attacks: 'Quarterstaff',
		spells: 'Magic Missile',
		inventory: 'Spellbook',
		notes: 'Tracks ley lines.'
	}
];

const state = {
	characters: initialCharacters.map((character) => ({ ...character }))
};

export function isE2EMockSupabaseClient(
	value: unknown
): value is E2EMockSupabaseClient {
	return typeof value === 'object' && value !== null && '__appE2E' in value;
}

export function createE2EMockSupabaseClient(): SupabaseClient<Database> {
	return {
		__appE2E: true,
		auth: {
			signOut: async () => ({ error: null })
		},
		from(table: string) {
			if (table === 'profiles') {
				return {
					upsert: async () => ({ error: null })
				};
			}

			throw new Error(`Unsupported E2E mock table: ${table}`);
		}
	} as unknown as E2EMockSupabaseClient;
}

export function getE2EMockSession(): Session {
	return {
		access_token: 'app-dnd-e2e-access-token',
		refresh_token: 'app-dnd-e2e-refresh-token',
		token_type: 'bearer',
		expires_in: 3600,
		expires_at: 1_900_000_000,
		user: {
			id: E2E_USER_ID,
			email: E2E_USER_EMAIL,
			aud: 'authenticated',
			app_metadata: {
				provider: 'email',
				providers: ['email']
			},
			user_metadata: {
				display_name: 'Talia Test'
			},
			created_at: '2026-06-25T09:00:00.000Z'
		}
	} as Session;
}

export function listE2ECharactersForUser(userId: string) {
	return state.characters
		.filter((character) => character.userId === userId)
		.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
		.map((character) => ({
			id: character.id,
			name: character.name,
			level: character.level,
			race: character.race ?? null,
			className: character.className ?? null,
			updatedAt: character.updatedAt
		}));
}

export function getE2ECharacterForUser(userId: string, characterId: string) {
	const character = state.characters.find(
		(entry) => entry.userId === userId && entry.id === characterId
	);

	return character ? { ...character } : null;
}

export function deleteE2ECharacterForUser(userId: string, characterId: string) {
	const index = state.characters.findIndex(
		(entry) => entry.userId === userId && entry.id === characterId
	);

	if (index === -1) {
		return null;
	}

	const [deletedCharacter] = state.characters.splice(index, 1);

	return {
		id: deletedCharacter.id,
		name: deletedCharacter.name
	};
}
