# Functional Requirements

## Phase 1

The first functional slice now combines two parallel needs:

- personal character management
- reusable rules and catalog content based on SRD 5.1

The app should evolve around a stable content system before deep character automation.

## Immediate Goals

- users can access the app and, in a later iteration, authenticate with Supabase Auth
- each user can create and manage only their own characters
- the project can represent reusable SRD content as structured data
- the project can represent private manual content owned by a user
- content visibility and ownership rules are designed early, even if advanced sharing comes later
- rules automation remains progressive and should not block initial CRUD or import flows

## Character Data

Initial character scope:

- identity: name, race, subrace, class, subclass, level, background, story
- stats: strength, dexterity, constitution, intelligence, wisdom, charisma
- combat: hit points, armor class, initiative, speed, hit dice
- attacks
- spells
- inventory
- notes

During the MVP, free-text fields remain acceptable for character editing. The medium-term target is to relate characters to reusable catalog entities such as species, classes, subclasses, backgrounds, and spells.

## Content Catalog Scope

The app should prepare support for these rule/content families:

- species and subspecies
- character classes and subclasses
- backgrounds
- spells
- equipment
- conditions
- future feats and monsters

Each content item should eventually track:

- source
- ownership
- visibility
- structured mechanics
- optional descriptive text

## Content Sources

The project distinguishes between:

- `srd-5-1` reusable system content
- future SRD revisions if needed
- `user-private` content entered for personal use
- `homebrew` content derived from user customization

## Deferred Scope

The following areas are explicitly postponed:

- campaign-level permission sharing
- advanced party visibility rules
- NPC, location, and monster management UI
- deep rules automation for every mechanic
- public publishing workflows
