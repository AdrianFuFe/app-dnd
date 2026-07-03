export interface JsonObject {
	[key: string]: JsonValue | undefined;
}

export type JsonArray = JsonValue[];

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface Database {
	public: {
		Tables: {
			character_combat_stats: {
				Row: {
					character_id: string;
					max_hp: number;
					current_hp: number;
					temporary_hp: number;
					armor_class: number;
					initiative: number;
					speed: number;
					hit_dice: string | null;
				};
				Insert: {
					character_id: string;
					max_hp?: number;
					current_hp?: number;
					temporary_hp?: number;
					armor_class?: number;
					initiative?: number;
					speed?: number;
					hit_dice?: string | null;
				};
				Update: {
					character_id?: string;
					max_hp?: number;
					current_hp?: number;
					temporary_hp?: number;
					armor_class?: number;
					initiative?: number;
					speed?: number;
					hit_dice?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'character_combat_stats_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: true;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					}
				];
			};
			character_stats: {
				Row: {
					character_id: string;
					strength: number;
					dexterity: number;
					constitution: number;
					intelligence: number;
					wisdom: number;
					charisma: number;
				};
				Insert: {
					character_id: string;
					strength?: number;
					dexterity?: number;
					constitution?: number;
					intelligence?: number;
					wisdom?: number;
					charisma?: number;
				};
				Update: {
					character_id?: string;
					strength?: number;
					dexterity?: number;
					constitution?: number;
					intelligence?: number;
					wisdom?: number;
					charisma?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'character_stats_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: true;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					}
				];
			};
			character_inventory_items: {
				Row: {
					id: string;
					character_id: string;
					equipment_id: string | null;
					name: string;
					quantity: number;
					description: string | null;
					weight: number | null;
					value: string | null;
					is_equipped: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					character_id: string;
					equipment_id?: string | null;
					name: string;
					quantity?: number;
					description?: string | null;
					weight?: number | null;
					value?: string | null;
					is_equipped?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					character_id?: string;
					equipment_id?: string | null;
					name?: string;
					quantity?: number;
					description?: string | null;
					weight?: number | null;
					value?: string | null;
					is_equipped?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'character_inventory_items_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'character_inventory_items_equipment_id_fkey';
						columns: ['equipment_id'];
						isOneToOne: false;
						referencedRelation: 'equipment';
						referencedColumns: ['id'];
					}
				];
			};
			character_notes: {
				Row: {
					id: string;
					character_id: string;
					title: string;
					content: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					character_id: string;
					title: string;
					content: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					character_id?: string;
					title?: string;
					content?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'character_notes_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					}
				];
			};
			character_attacks: {
				Row: {
					id: string;
					character_id: string;
					equipment_id: string | null;
					name: string;
					attack_bonus: string | null;
					damage: string | null;
					damage_type: string | null;
					range: string | null;
					description: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					character_id: string;
					equipment_id?: string | null;
					name: string;
					attack_bonus?: string | null;
					damage?: string | null;
					damage_type?: string | null;
					range?: string | null;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					character_id?: string;
					equipment_id?: string | null;
					name?: string;
					attack_bonus?: string | null;
					damage?: string | null;
					damage_type?: string | null;
					range?: string | null;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'character_attacks_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'character_attacks_equipment_id_fkey';
						columns: ['equipment_id'];
						isOneToOne: false;
						referencedRelation: 'equipment';
						referencedColumns: ['id'];
					}
				];
			};
			character_feats: {
				Row: {
					id: string;
					character_id: string;
					feat_id: string | null;
					name: string;
					description: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					character_id: string;
					feat_id?: string | null;
					name: string;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					character_id?: string;
					feat_id?: string | null;
					name?: string;
					description?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'character_feats_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'character_feats_feat_id_fkey';
						columns: ['feat_id'];
						isOneToOne: false;
						referencedRelation: 'feats';
						referencedColumns: ['id'];
					}
				];
			};
			character_spells: {
				Row: {
					id: string;
					character_id: string;
					spell_id: string | null;
					name: string;
					level: number | null;
					school: string | null;
					casting_time: string | null;
					range: string | null;
					components: string | null;
					duration: string | null;
					description: string | null;
					is_prepared: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					character_id: string;
					spell_id?: string | null;
					name: string;
					level?: number | null;
					school?: string | null;
					casting_time?: string | null;
					range?: string | null;
					components?: string | null;
					duration?: string | null;
					description?: string | null;
					is_prepared?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					character_id?: string;
					spell_id?: string | null;
					name?: string;
					level?: number | null;
					school?: string | null;
					casting_time?: string | null;
					range?: string | null;
					components?: string | null;
					duration?: string | null;
					description?: string | null;
					is_prepared?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'character_spells_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: false;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'character_spells_spell_id_fkey';
						columns: ['spell_id'];
						isOneToOne: false;
						referencedRelation: 'spells';
						referencedColumns: ['id'];
					}
				];
			};
			character_text_sections: {
				Row: {
					character_id: string;
					attacks: string | null;
					spells: string | null;
					inventory: string | null;
					notes: string | null;
				};
				Insert: {
					character_id: string;
					attacks?: string | null;
					spells?: string | null;
					inventory?: string | null;
					notes?: string | null;
				};
				Update: {
					character_id?: string;
					attacks?: string | null;
					spells?: string | null;
					inventory?: string | null;
					notes?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'character_text_sections_character_id_fkey';
						columns: ['character_id'];
						isOneToOne: true;
						referencedRelation: 'characters';
						referencedColumns: ['id'];
					}
				];
			};
			character_classes: {
				Row: {
					id: string;
					owner_user_id: string | null;
					source_id: string;
					visibility: string;
					slug: string;
					name: string;
					hit_die: number;
					primary_abilities: string[];
					saving_throw_proficiencies: string[];
					armor_proficiencies: string[];
					weapon_proficiencies: string[];
					tool_proficiencies: string[];
					skill_choices: JsonValue;
					starting_equipment: JsonValue;
					spellcasting_ability: string | null;
					progression: JsonValue;
					summary: string | null;
					description: string | null;
					mechanics: JsonValue;
					is_system_content: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					owner_user_id?: string | null;
					source_id: string;
					visibility?: string;
					slug: string;
					name: string;
					hit_die: number;
					primary_abilities?: string[];
					saving_throw_proficiencies?: string[];
					armor_proficiencies?: string[];
					weapon_proficiencies?: string[];
					tool_proficiencies?: string[];
					skill_choices?: JsonValue;
					starting_equipment?: JsonValue;
					spellcasting_ability?: string | null;
					progression?: JsonValue;
					summary?: string | null;
					description?: string | null;
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					owner_user_id?: string | null;
					source_id?: string;
					visibility?: string;
					slug?: string;
					name?: string;
					hit_die?: number;
					primary_abilities?: string[];
					saving_throw_proficiencies?: string[];
					armor_proficiencies?: string[];
					weapon_proficiencies?: string[];
					tool_proficiencies?: string[];
					skill_choices?: JsonValue;
					starting_equipment?: JsonValue;
					spellcasting_ability?: string | null;
					progression?: JsonValue;
					summary?: string | null;
					description?: string | null;
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			characters: {
				Row: {
					id: string;
					user_id: string;
					species_id: string | null;
					subspecies_id: string | null;
					class_id: string | null;
					subclass_id: string | null;
					background_id: string | null;
					name: string;
					race: string | null;
					subrace: string | null;
					class_name: string | null;
					subclass: string | null;
					level: number;
					background: string | null;
					story: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					species_id?: string | null;
					subspecies_id?: string | null;
					class_id?: string | null;
					subclass_id?: string | null;
					background_id?: string | null;
					name: string;
					race?: string | null;
					subrace?: string | null;
					class_name?: string | null;
					subclass?: string | null;
					level?: number;
					background?: string | null;
					story?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					species_id?: string | null;
					subspecies_id?: string | null;
					class_id?: string | null;
					subclass_id?: string | null;
					background_id?: string | null;
					name?: string;
					race?: string | null;
					subrace?: string | null;
					class_name?: string | null;
					subclass?: string | null;
					level?: number;
					background?: string | null;
					story?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			content_sources: {
				Row: {
					id: string;
					code: string;
					name: string;
					license: string | null;
					attribution: string | null;
					is_system_source: boolean;
					created_at: string;
				};
				Insert: {
					id?: string;
					code: string;
					name: string;
					license?: string | null;
					attribution?: string | null;
					is_system_source?: boolean;
					created_at?: string;
				};
				Update: {
					id?: string;
					code?: string;
					name?: string;
					license?: string | null;
					attribution?: string | null;
					is_system_source?: boolean;
					created_at?: string;
				};
				Relationships: [];
			};
			feats: {
				Row: {
					id: string;
					owner_user_id: string | null;
					source_id: string;
					visibility: string;
					slug: string;
					name: string;
					prerequisites: string[];
					summary: string | null;
					description: string | null;
					mechanics: JsonValue;
					is_system_content: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					owner_user_id?: string | null;
					source_id: string;
					visibility?: string;
					slug: string;
					name: string;
					prerequisites?: string[];
					summary?: string | null;
					description?: string | null;
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					owner_user_id?: string | null;
					source_id?: string;
					visibility?: string;
					slug?: string;
					name?: string;
					prerequisites?: string[];
					summary?: string | null;
					description?: string | null;
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			equipment: {
				Row: {
					id: string;
					owner_user_id: string | null;
					source_id: string;
					visibility: string;
					slug: string;
					name: string;
					category: string;
					summary: string | null;
					description: string | null;
					weight: number | null;
					value: string | null;
					damage: string | null;
					damage_type: string | null;
					range_text: string | null;
					properties: string[];
					is_weapon: boolean;
					is_equippable: boolean;
					mechanics: JsonValue;
					is_system_content: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					owner_user_id?: string | null;
					source_id: string;
					visibility?: string;
					slug: string;
					name: string;
					category: string;
					summary?: string | null;
					description?: string | null;
					weight?: number | null;
					value?: string | null;
					damage?: string | null;
					damage_type?: string | null;
					range_text?: string | null;
					properties?: string[];
					is_weapon?: boolean;
					is_equippable?: boolean;
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					owner_user_id?: string | null;
					source_id?: string;
					visibility?: string;
					slug?: string;
					name?: string;
					category?: string;
					summary?: string | null;
					description?: string | null;
					weight?: number | null;
					value?: string | null;
					damage?: string | null;
					damage_type?: string | null;
					range_text?: string | null;
					properties?: string[];
					is_weapon?: boolean;
					is_equippable?: boolean;
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			profiles: {
				Row: {
					id: string;
					display_name: string | null;
					global_role: import('$lib/types/permissions/permissions').GlobalRole;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					display_name?: string | null;
					global_role?: import('$lib/types/permissions/permissions').GlobalRole;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					display_name?: string | null;
					global_role?: import('$lib/types/permissions/permissions').GlobalRole;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			spells: {
				Row: {
					id: string;
					owner_user_id: string | null;
					source_id: string;
					visibility: string;
					slug: string;
					name: string;
					level: number;
					school: string;
					casting_time: string | null;
					range_text: string | null;
					components: string | null;
					materials: string | null;
					duration: string | null;
					concentration: boolean;
					ritual: boolean;
					class_slugs: string[];
					summary: string | null;
					description: string | null;
					mechanics: JsonValue;
					is_system_content: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					owner_user_id?: string | null;
					source_id: string;
					visibility?: string;
					slug: string;
					name: string;
					level: number;
					school: string;
					casting_time?: string | null;
					range_text?: string | null;
					components?: string | null;
					materials?: string | null;
					duration?: string | null;
					concentration?: boolean;
					ritual?: boolean;
					class_slugs?: string[];
					summary?: string | null;
					description?: string | null;
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					owner_user_id?: string | null;
					source_id?: string;
					visibility?: string;
					slug?: string;
					name?: string;
					level?: number;
					school?: string;
					casting_time?: string | null;
					range_text?: string | null;
					components?: string | null;
					materials?: string | null;
					duration?: string | null;
					concentration?: boolean;
					ritual?: boolean;
					class_slugs?: string[];
					summary?: string | null;
					description?: string | null;
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			species: {
				Row: {
					id: string;
					owner_user_id: string | null;
					source_id: string;
					visibility: string;
					slug: string;
					name: string;
					summary: string | null;
					description: string | null;
					size: string | null;
					base_speed: number | null;
					languages: string[];
					subspecies_slugs: string[];
					mechanics: JsonValue;
					is_system_content: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					owner_user_id?: string | null;
					source_id: string;
					visibility?: string;
					slug: string;
					name: string;
					summary?: string | null;
					description?: string | null;
					size?: string | null;
					base_speed?: number | null;
					languages?: string[];
					subspecies_slugs?: string[];
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					owner_user_id?: string | null;
					source_id?: string;
					visibility?: string;
					slug?: string;
					name?: string;
					summary?: string | null;
					description?: string | null;
					size?: string | null;
					base_speed?: number | null;
					languages?: string[];
					subspecies_slugs?: string[];
					mechanics?: JsonValue;
					is_system_content?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
		CompositeTypes: Record<string, never>;
	};
}
