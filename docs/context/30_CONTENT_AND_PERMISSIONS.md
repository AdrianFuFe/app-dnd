# Content And Permissions

## Content Sources

- `srd-5-1`
- `user-private`
- future `homebrew`

## Core Rule

SRD content is structured reusable catalog data and should remain distinct from user-owned content.

## Permission Direction

- SRD/system content is readable but not editable through normal user flows
- private content belongs to one user
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
- private user-authored content is still the next missing user-facing workflow

## Import Rule

Content loaded from files must be validated before persistence, including cross-file references where required.
