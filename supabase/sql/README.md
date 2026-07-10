# SQL Run Order

Apply the SQL files in this order:

1. `001_initial_schema.sql`
2. `003_content_sources_seed.sql`
3. `004_srd_catalog_seed.sql`
4. `002_initial_rls_policies.sql`
5. `005_character_notes.sql`

## Notes

- `001_initial_schema.sql` creates the catalog, character, and profile tables.
- `003_content_sources_seed.sql` inserts the source codes used by catalog rows.
- `004_srd_catalog_seed.sql` is generated from `data/srd-5-1/*.json`.
- `002_initial_rls_policies.sql` enables and defines the first RLS policies.
- `005_character_notes.sql` adds the first character note table and its RLS policies.

## Regeneration

If catalog JSON changes, regenerate the SRD seed with:

```bash
pnpm generate:content-seed-sql
```
