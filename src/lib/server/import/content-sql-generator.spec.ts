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
		expect(sql).toContain("'humano'");
		expect(sql).toContain("'clerigo'");
		expect(sql).toContain("'life-domain'");
		expect(sql).toContain("'acolyte'");
		expect(sql).toContain("'bless'");
	});
});
