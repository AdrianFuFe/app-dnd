# SQL Run Order

Apply the SQL files in this order:

1. `001_initial_schema.sql`
2. `003_content_sources_seed.sql`
3. `004_srd_catalog_seed.sql`
4. `002_initial_rls_policies.sql`
5. `005_character_notes.sql`
6. `006_ruleset_and_editorial_fields.sql`

## Notes

- `001_initial_schema.sql` creates the catalog, character, and profile tables.
- `003_content_sources_seed.sql` inserts the source codes used by catalog rows.
- `004_srd_catalog_seed.sql` is generated from `data/srd-5-1/*.json`.
- `002_initial_rls_policies.sql` enables and defines the first RLS policies.
- `005_character_notes.sql` adds the first character note table and its RLS policies.
- `006_ruleset_and_editorial_fields.sql` aligns characters and reusable content with the
  editorial contract by adding `ruleset_code`, `content_mode`, and where needed
  `editorial_status`.

## Editorial model notes

The schema now carries the near-term editorial model directly:

- characters track `ruleset_code` and `content_mode`
- reusable content tables track `ruleset_code`, `content_mode`, and `editorial_status`
- `visibility` still exists, but should not be treated as a substitute for editorial state

Current allowed values in SQL:

- `content_mode`: `canon`, `custom`
- `editorial_status`: `private_draft`, `shared_draft`, `in_review`, `published`, `retired`

Important interpretation:

- `canon` belongs to `content_mode`, not publication state
- `published` belongs to `editorial_status`, not canonical status
- `public` visibility should not be treated as a synonym for canon

## Regeneration

If catalog JSON changes, regenerate the SRD seed with:

```bash
pnpm generate:content-seed-sql
```
