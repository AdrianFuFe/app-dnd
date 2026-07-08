# Content And Permissions

## Content Sources

- `srd-5-1`
- `user-private`
- `homebrew`

## Core Rule

SRD content is structured reusable catalog data and should remain distinct from user-owned content.

## Permission Direction

- SRD/system content is readable but not editable through normal user flows
- private content belongs to one user
- shared non-system content is editable only through explicitly authorized editor/admin flows
- visibility must be modeled explicitly
- RLS is the enforcement layer for persisted data

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
- user-private feats now have create and SRD-derivation workflows
- shared and system feat publishing now has an initial role-aware UI surface
- user-private spells now also have create, SRD-derivation, and guarded shared/system publishing workflows
- shared-content editing remains the next missing role-aware workflow for spells

## Import Rule

Content loaded from files must be validated before persistence, including cross-file references where required.
