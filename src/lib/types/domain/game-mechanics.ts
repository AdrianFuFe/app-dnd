export type Ability =
	| 'strength'
	| 'dexterity'
	| 'constitution'
	| 'intelligence'
	| 'wisdom'
	| 'charisma';

export type ProficiencyType = 'skill' | 'weapon' | 'armor' | 'tool' | 'saving_throw';

export type RestType = 'short_rest' | 'long_rest';

export type GameMechanic =
	| { type: 'ability_bonus'; ability: Ability; value: number }
	| { type: 'choose_ability_bonus'; count: number; value: number; allowed?: Ability[] }
	| { type: 'speed'; value: number }
	| { type: 'darkvision'; range: number }
	| { type: 'language'; mode: 'fixed'; language: string }
	| { type: 'choose_language'; count: number }
	| { type: 'proficiency'; proficiencyType: ProficiencyType; value: string }
	| {
			type: 'choose_proficiency';
			proficiencyType: 'skill' | 'tool';
			count: number;
			options: string[];
	  }
	| { type: 'resistance'; damageType: string }
	| { type: 'spell_grant'; spellId: string; ability?: Ability }
	| { type: 'spellcasting'; ability: Ability }
	| { type: 'resource'; name: string; maxFormula: string; resetOn: RestType }
	| { type: 'feature'; featureId: string }
	| {
			type: 'source_derivation';
			source: 'srd-5-1' | 'srd-5-2' | 'user-private' | 'homebrew';
			contentType: 'feat' | 'spell';
			slug: string;
			name: string;
	  }
	| { type: 'note'; text: string };
