# Character Creation V1 Guided Design

## Objective

This document closes `B4 - Character Creation V1 Guided Design` at the product-design level.

It defines:

- the step map for the first guided creator
- which fields are automatic, guided-editable, or manual
- the contract for progression and rule application
- how the current catalog should feed the flow
- what remains intentionally out of scope for `V1`

## Product target

`Character Creation V1 Guided` is the next major product delivery after the current character-area cleanup.

The first release targets:

- `ruleset = dnd-2014-srd`
- `content_mode = canon` by default

The main promise is simple:

- the user should be able to create a valid level-1 canonical character without remembering most rules manually

## Core principles

## 1. Guided first

The primary path should be a step-by-step flow, not a large general-purpose form.

## 2. Canon by default

If the user stays inside the guided path and accepted choices, the result should remain:

- `ruleset = dnd-2014-srd`
- `content_mode = canon`

## 3. Custom later, not blocked

The architecture must leave room for future overrides, but `V1` should not try to solve full homebrew authoring inside the creator.

## 4. Rules before presentation

The system should apply rules through a dedicated derivation layer, not through ad hoc form logic spread across UI components.

## Guided V1 scope

## In scope

- level 1 character creation
- one ruleset: `dnd-2014-srd`
- step-based experience
- automatic application of known catalog-backed baseline rules
- automatic starting values where the rules are clear
- structured persistence into the existing character model
- a review step before final save

## Out of scope

- full multi-level planner
- freeform custom overrides inside the same flow
- on-the-fly creation of custom entities during guided creation
- complete automation for every edge case not yet modeled in the catalog
- deep spell-preparation planning beyond the current trusted data available

## Recommended user flow

The first guided creator should use these steps.

## Step 1. Ruleset and mode

Purpose:

- make the selected baseline explicit

V1 behavior:

- preselect `dnd-2014-srd`
- explain that this path creates a canonical guided draft
- show the current structured form as the fallback manual path, not as the primary default

## Step 2. Identity

Fields:

- character name
- optional short concept or story seed

Why early:

- gives the flow emotional context without needing any rules knowledge first

## Step 3. Species

Fields:

- species
- dependent subspecies if the selected species has one

Rules applied automatically when available:

- base speed
- language grants
- ability score increases
- other species mechanics already represented in catalog summaries or structured mechanics

## Step 4. Class

Fields:

- class
- dependent subclass only if the chosen rules path grants one at level 1

Rules applied automatically when available:

- hit die
- primary saving throw proficiencies
- class-granted proficiencies
- level-1 granted spells or features that already exist in the catalog

## Step 5. Background

Fields:

- background

Rules applied automatically when available:

- granted proficiencies
- granted languages or tools
- baseline background features that already exist in the content model

## Step 6. Ability scores

V1 decision:

- the user assigns base scores
- the system then applies species-based bonuses automatically

Recommended V1 method:

- simple manual entry for the six base scores

Reason:

- it avoids prematurely locking the project into one rolling or point-buy UX before the rules layer is more mature

## Step 7. Derived snapshot

Show computed values before equipment and optional later detail:

- level
- proficiency bonus
- max HP
- current HP
- initiative
- speed
- hit dice

These should be generated from the canonical inputs wherever the rule is known.

## Step 8. Guided choices

This step collects only required level-1 decisions that depend on earlier selections.

Examples:

- class skill choices
- equipment package choice when the class/background data supports it
- granted cantrip or spell selections when the class path requires them
- any other mandatory pick-one or pick-N selection surfaced by the rules layer

This step is the key place where the future architecture must be selection-driven, not hardcoded per page.

## Step 9. Review and save

Show:

- selected identity and lineage path
- selected class path
- final ability scores
- derived combat baseline
- granted proficiencies, feats, spells, and equipment captured during the flow

The user should save from here into the existing character persistence model.

## Field policy

The guided creator needs a strict policy for how fields behave.

## Automatic and locked in V1

These should be derived and not directly edited inside the guided flow:

- `ruleset`
- `content_mode` while the user stays on the canonical path
- character level for V1 if the release is level-1 only
- proficiency bonus
- hit die
- base HP derivation formula
- dependent option lists such as allowed `subspecies` and `subclass`

## Automatic but reviewable

These should be generated by rules and shown clearly, but the user does not need to type them manually:

- speed
- saving throw proficiencies
- language grants
- tool and weapon proficiencies
- granted feat/spell rows when they come directly from known catalog rules
- baseline inventory or attack rows created from guided equipment decisions

## Guided-editable

These are user choices inside the canonical flow:

- name
- species
- subspecies when applicable
- class
- subclass when applicable at level 1
- background
- base ability scores
- required choice points such as skill picks or granted spell picks
- optional story text

## Manual-only for the fallback structured form

These should remain in the existing broad form rather than the first guided path:

- arbitrary attack row authoring
- arbitrary inventory authoring
- arbitrary feat insertion
- arbitrary spell insertion unrelated to guided grants
- freeform note building beyond a minimal story field

## Rule application contract

The implementation should separate four layers.

## 1. Catalog input layer

Inputs come from trusted reusable entities:

- species
- subspecies
- classes
- subclasses
- backgrounds
- spells
- feats
- equipment

## 2. Guided selection state

This stores only what the user explicitly chose.

Examples:

- selected species id
- selected class id
- selected background id
- base ability scores
- choice-point answers

## 3. Derivation layer

This layer computes the character draft produced by the guided state.

It should return at least:

- resolved granted mechanics
- derived numeric values
- required unresolved choice points
- normalized child rows for spells, feats, attacks, inventory, and notes where applicable
- a flag explaining whether the draft is still canonical or has crossed into future custom territory

## 4. Persistence mapping

The derived guided draft should then map into the current character create payload so the app can reuse existing persistence and detail pages.

## Progression contract for V1

The first implementation should not attempt the full leveling engine.

Recommended contract:

- `V1` officially supports only level 1 creation
- all rule derivation is computed for the selected level-1 path
- later sessions can extend the same derivation layer for higher levels without rewriting the UI concept

This keeps the first guided delivery focused while still shaping the architecture correctly.

## Current catalog integration plan

The current repository already has useful building blocks.

## Reuse directly

- `listCharacterCreationCatalog`
- dependent `subspecies` and `subclass` filtering
- expanded spell, feat, and equipment catalogs
- structured character child rows already supported by the persistence layer

## Reuse with a new interpretation

- mechanic-summary data should help explain what a choice grants
- granted spell relationships on classes and subclasses should feed guided automatic additions
- equipment catalog entries should support guided package outcomes instead of only manual picker rows

## New guided-specific layer needed

Add a dedicated guided-domain slice that can:

- resolve the selected path into derivations
- expose required pending choices
- convert results into the current character-create schema

Recommended direction:

- `src/lib/domain/characters/guided/`

Potential modules:

- `guided-state.ts`
- `guided-derivation.ts`
- `guided-choice-points.ts`
- `guided-to-character-input.ts`

## Relationship with the current form

The existing `character-create-form.svelte` should not be discarded immediately.

Near-term product strategy:

- keep the current page as the structured manual builder
- introduce the guided creator as the primary recommended path
- retain the current form as a fallback for advanced editing and transitional coverage

This reduces migration risk and preserves the value already built.

## Save behavior

On successful guided completion, the saved character should:

- persist through the existing create-character repository path
- store the resolved catalog ids already supported by the model
- default to `ruleset = dnd-2014-srd`
- default to `content_mode = canon`

Later, if the user performs unsupported manual overrides in a future custom flow, that same contract can switch the character to `content_mode = custom`.

## UX guidance

The guided creator should feel narrower and calmer than the current large form.

Recommended UX characteristics:

- one primary decision at a time
- summary sidebar or summary cards for previous choices
- clear "granted by this choice" explanation blocks
- clear distinction between required picks and optional detail
- explicit review step before persistence

## Testing direction for implementation

When `B5` starts, the minimum confidence slices should include:

- unit tests for derivation from species, class, and background inputs
- unit tests for dependent choice resolution
- route-level tests for mapping guided output into the existing create action
- browser coverage for the happy-path canonical level-1 creation flow

## Open decisions intentionally deferred

These should not block `B5`, but they should stay visible:

- exact ability-score UX beyond plain base-score entry
- whether subclass appears at level 1 only for eligible class paths or is hidden for most classes in V1
- whether equipment starts with package selection, direct guided picks, or a hybrid
- whether guided V1 includes a compact post-save edit handoff into the broader manual editor

## Outcome of B4

This block should now be treated as closed at the design-contract level.

The next recommended implementation block is:

- `B5 - Character Creation V1 Guided Implementation`
