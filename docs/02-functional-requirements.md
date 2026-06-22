# Functional Requirements

## Phase 1

The first functional slice targets personal character management:

- users can access the app and, in a later iteration, authenticate with Supabase Auth
- each user can create and manage only their own characters
- character data starts with simple editable inputs
- rules automation is intentionally postponed until the base CRUD is stable

## Character Data

Initial character scope:

- identity: name, race, subrace, class, subclass, level, background, story
- stats: strength, dexterity, constitution, intelligence, wisdom, charisma
- combat: hit points, armor class, initiative, speed, hit dice
- attacks
- spells
- inventory
- notes

## Deferred Scope

The following areas are explicitly postponed:

- campaign management
- shared party visibility
- NPCs, locations, and monsters
- advanced DnD rules automation
- public data sharing
