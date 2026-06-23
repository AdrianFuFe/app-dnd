import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { generateSrdCatalogSeedSql } from '../src/lib/server/import/content-sql-generator.ts';

const outputPath = path.resolve(process.cwd(), 'supabase/sql/004_srd_catalog_seed.sql');
const sql = generateSrdCatalogSeedSql();

writeFileSync(outputPath, `${sql}\n`, 'utf-8');
console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
