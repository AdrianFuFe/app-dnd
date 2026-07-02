import { describe, expect, it } from 'vitest';
import { generateSrdCatalogSeedSql } from './content-sql-generator.ts';

describe('generateSrdCatalogSeedSql', () => {
	it('includes inserts for the current SRD catalog files', () => {
		const sql = generateSrdCatalogSeedSql();

		expect(sql).toContain('insert into species');
		expect(sql).toContain('insert into subspecies');
		expect(sql).toContain('insert into character_classes');
		expect(sql).toContain('insert into subclasses');
		expect(sql).toContain('insert into backgrounds');
		expect(sql).toContain('insert into spells');
		expect(sql).toContain('insert into feats');
		expect(sql).toContain('insert into equipment');
		expect(sql).toContain("'humano'");
		expect(sql).toContain("'clerigo'");
		expect(sql).toContain("'mago'");
		expect(sql).toContain("'life-domain'");
		expect(sql).toContain("'school-of-evocation'");
		expect(sql).toContain("'acolyte'");
		expect(sql).toContain("'bless'");
		expect(sql).toContain("'guiding-bolt'");
		expect(sql).toContain("'magic-missile'");
		expect(sql).toContain("'athlete'");
		expect(sql).toContain("'heavily-armored'");
		expect(sql).toContain("'observant'");
		expect(sql).toContain("'quarterstaff'");
		expect(sql).toContain("'spellbook'");
		expect(sql).toContain('"type":"choice"');
		expect(sql).toContain('"quantity":5');
		expect(sql).toContain("array['comun', 'elfico']::text[]");
		expect(sql).toContain("array['choose:any:2']::text[]");
	});
});
