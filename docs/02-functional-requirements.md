# Functional Requirements

## Current Product Direction

`app-dnd` should evolve around one central product goal:

- guided character creation based on a selected ruleset

Everything else should support that goal:

- authentication and user ownership
- reusable structured content
- editorial workflows for shared content
- future custom expansion without breaking the guided baseline

## Core Product Areas

The application is expected to cover these areas:

1. user access and profile management
2. character gallery and character detail
3. guided character creation
4. structured game entities and catalogs
5. editorial content management and review

## Ruleset And Content Mode

Every character and every reusable entity should declare at least these two product properties:

- `ruleset`
- `content_mode`

Recommended semantics:

- `ruleset`: identifies the rule system or version the item follows
- `content_mode`: identifies whether the item follows that ruleset canonically or as a custom variation

Examples:

- `ruleset = dnd-2014-srd`
- `content_mode = canon`

means:

- the item is based on the DND 2014 SRD ruleset
- its structure and content should follow that ruleset faithfully

Another example:

- `ruleset = dnd-2014-srd`
- `content_mode = custom`

means:

- the item is still based on the DND 2014 SRD ruleset
- but it is a custom extension, variation, or homebrew element instead of a strict canonical version

Another future case:

- `ruleset = custom`
- `content_mode = custom`

means:

- the item is fully freeform and does not rely on a formal predefined ruleset

This fully freeform mode should be supported by the model, but its product implementation can wait for a later phase.

## Character Requirements

## Character Ownership

- authenticated users can create and manage only their own characters by default
- characters must remain ownership-safe at the persistence layer
- admin and editorial exceptions should stay explicit and limited

## Character Metadata

Each character should eventually track at least:

- ownership
- `ruleset`
- `content_mode`
- level and progression state
- structured identity and mechanical selections
- derived values and manual overrides when custom behavior appears later

## Character Data Scope

The working character domain should continue to support:

- identity: name, species, subspecies, class, subclass, level, background, story
- stats: strength, dexterity, constitution, intelligence, wisdom, charisma
- combat: hit points, armor class, initiative, speed, hit dice
- attacks
- spells
- inventory
- notes

During the transition, legacy free-text compatibility may remain useful, but the target direction is structured data driven by reusable entities.

## Character Gallery

The authenticated user should have a gallery where they can:

- view their characters
- open character detail
- edit
- delete

Deletion requirement:

- destructive deletion flows should use double confirmation

## Guided Character Creation

## Guided V1 Goal

The next main product milestone is `Character Creation V1 Guided`.

This flow should:

- be step-based
- use one selected `ruleset`
- automate character creation as much as possible
- reduce the need for the user to know the rules manually

## Initial Guided Ruleset

The first guided implementation should target:

- `ruleset = dnd-2014-srd`

## Guided V1 Behavior

The guided flow should help the user choose options step by step and apply the selected rules automatically.

This includes, when available in the catalog and rules layer:

- species and subspecies effects
- class and subclass effects
- initial traits and proficiencies
- movement speed and other inherited base values
- level progression benefits
- hit point growth
- ability score improvements
- feat choices
- other required selection points defined by the selected ruleset

The user should not need to remember every rule manually if they are following the guided canonical path.

## Character Content Mode

Guided creation should distinguish between:

- canonical guided progression
- custom variation

Recommended interpretation:

- if the user follows the selected ruleset faithfully, the resulting character remains `content_mode = canon`
- if the user modifies values or choices outside the canonical rules for that ruleset, the resulting character becomes `content_mode = custom`

## Custom Direction

Custom behavior should influence the architecture from the beginning, but it does not need to be fully implemented in the first guided release.

The system should later support:

- overriding default values
- introducing custom entities that still point to a known ruleset
- creating fully freeform content when needed

## Structured Entity Requirements

The app should support structured reusable entities such as:

- species
- subspecies
- character classes
- subclasses
- backgrounds
- spells
- feats
- equipment
- future rule entities as needed

Each entity should eventually track:

- ownership
- `ruleset`
- `content_mode`
- source metadata where relevant
- editorial state
- visibility
- structured mechanics
- descriptive text

## Content And Editorial Requirements

## Shared Vs Canonical

Shared content and canonical content should not be treated as synonyms.

Recommended distinction:

- shared content: visible for broader reuse
- canonical content: approved content that represents the intended baseline for a ruleset

## Editorial Workflow

The product should support an editorial lifecycle for shared content.

At a minimum, the model should be ready for:

- private custom content
- shared custom content
- content under review
- approved canonical content
- retired content

The exact field names may evolve, but the workflow should support:

- creation
- proposal
- review
- approval
- retirement

## User Roles

The current global roles remain valid:

- `user`
- `content_editor`
- `admin`

### `user`

Can:

- authenticate
- manage own characters
- manage own private content
- consume visible shared content
- create proposals where the workflow allows it

Cannot:

- approve canonical content
- manage other users
- manage roles globally

### `content_editor`

Can:

- do everything `user` can do
- create, edit, review, and maintain shared content
- manage canonical content
- convert reviewed content into final canonical content

This role is expected to be the main editorial role for future user-submitted shared content.

### `admin`

Can:

- do everything `content_editor` can do
- manage users and permissions
- perform global sensitive operations
- maintain full operational control of the system

## Localization Direction

The product should support both Spanish and English content and UI.

Recommended direction:

- start by translating the content that already exists
- continue development by adding both Spanish and English versions of new content
- keep UI text increasingly separated from implementation so i18n can scale cleanly

## Deferred Scope

The following areas remain explicitly deferred compared with the next delivery focus:

- full freeform `ruleset = custom` product workflows
- campaign-level permissions and sharing
- advanced party or DM-only visibility
- complete admin console coverage
- deep automation for every possible rule in every future ruleset
- broad community or social platform features
