# Content And Permissions

## Core Product Concepts

All characters and reusable entities should eventually support:

- `ruleset`
- `content_mode`

Recommended meaning:

- `ruleset`: which rule system or version the item follows
- `content_mode`: whether the item follows that ruleset canonically or as a custom variation

Examples:

- `dnd-2014-srd` + `canon`
- `dnd-2014-srd` + `custom`
- future: `custom` + `custom`

## Shared Vs Canonical

Shared content is not automatically canonical content.

Recommended distinction:

- shared: reusable outside one private owner
- canonical: approved baseline content for a ruleset

## Editorial Direction

The product should be ready for a review workflow such as:

- private custom
- shared custom
- in review
- approved canon
- retired

The exact persistence fields may still evolve, but the workflow direction should stay explicit.

## Current Roles

- `user`
- `content_editor`
- `admin`

## Intended Role Direction

### `user`

- manages own characters
- manages own private content
- consumes visible shared content
- may submit shared proposals where enabled

### `content_editor`

- does everything `user` can do
- creates, edits, reviews, and maintains shared content
- manages canonical content
- can convert reviewed content into final canonical content

### `admin`

- does everything `content_editor` can do
- manages users, roles, and other sensitive global operations

## Current Modeling Focus

- species
- subspecies
- classes
- subclasses
- backgrounds
- spells
- feats
- equipment
- character ownership
- current bounded private/shared workflows for feats and spells

## Near-Term Constraint

Do not treat the current feat/spell editorial UI as the final generalized content model.

It should be treated as:

- a useful bounded implementation
- a stepping stone toward a broader ruleset-aware editorial system

## Import Rule

Content loaded from files must be validated before persistence, including cross-file references where required.
