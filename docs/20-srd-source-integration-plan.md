# SRD Source Integration Plan

## Objective

Use `SRD_CC_v5.1.pdf` as the reference source to finish the `dnd-2014-srd` ruleset implementation without replacing the current structured content pipeline.

## Current reality in this repository

The project already has a working structured-content path:

- source data in `data/srd-5-1`
- schema validation in `scripts/validate-content.ts`
- SQL seed generation in `scripts/generate-content-seed-sql.ts`
- guided character derivation in `src/lib/domain/characters/guided-character.ts`

So the right approach is not "build everything directly from the PDF at runtime".

The right approach is:

1. use the PDF as source-of-truth reference
2. convert its content into structured JSON files
3. validate those files
4. generate SQL seeds
5. expand the guided derivation layer to consume the new mechanics

## Current structured coverage snapshot

At the time this document was created, the structured SRD catalog is still partial:

- `species`: 2
- `subspecies`: 2
- `classes`: 3
- `subclasses`: 4
- `backgrounds`: 2
- `spells`: 31
- `feats`: 6
- `equipment`: 33

That is enough to support a first guided flow, but not enough to claim full SRD 5.1 coverage.

## Practical implication

The PDF can absolutely be used to complete the application, but it should be treated as:

- a content reference
- a rules reference
- an auditing source for missing entities and missing mechanics

It should not bypass the current JSON -> validation -> seed pipeline.

## Recommended implementation phases

## Phase 1. Complete the structured content catalog

Expand `data/srd-5-1` so it includes the missing canonical entities for:

- species
- subspecies
- classes
- subclasses
- backgrounds
- spells
- feats
- equipment

Each addition should preserve the current file schemas and validation rules.

## Phase 2. Complete rule mechanics on catalog entries

It is not enough to add names and descriptions.

Each relevant entity should carry the mechanics needed by guided creation, especially:

- ability bonuses
- fixed languages
- language choices
- proficiencies
- proficiency choices
- spell grants
- spellcasting metadata
- starting equipment
- level-based subclass spell grants
- feature references and notes

## Phase 3. Expand guided derivation coverage

As catalog coverage grows, the next derivation improvements should focus on:

- more level-1 class choice points
- more spell-grant behavior
- better equipment-package resolution
- broader automatic attack derivation
- stronger explanation lines in guided review and detail handoff

## Phase 4. Seed and end-to-end verification

After each significant content expansion:

1. run `pnpm validate:content`
2. run `pnpm report:srd-coverage`
3. run `pnpm generate:content-seed-sql`
4. apply the SQL seed updates when needed
5. run the guided tests

## Working rule for future sessions

When using the PDF as source material, every new rule or entity should end in one of these places:

- structured JSON in `data/srd-5-1`
- schema support if a new mechanic shape is needed
- derivation support if the guided creator must apply it automatically
- tests if the new content affects guided behavior

## Immediate next recommended task

The next most valuable task is:

- expand the partial SRD dataset so the guided creator covers a much larger canonical level-1 set

The support command for tracking progress is:

- `pnpm report:srd-coverage`
