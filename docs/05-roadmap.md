# Roadmap

## Iteration 0

- create project baseline files
- document requirements, architecture, database model, and roadmap
- prepare source folders for upcoming features

## Iteration 1

- align documentation with SRD, content, and permission guidance
- create TypeScript types for content and permissions
- prepare `src/lib/schemas/content`
- install `zod` only when schema validation work begins

## Iteration 2

- install and configure `zod`
- create content schemas and validation tests
- validate local JSON templates and future import files

## Iteration 3

- add content-oriented SQL drafts
- add `content_sources` and core catalog tables
- prepare MVP RLS for SRD and private content
- define seeds/import boundaries

## Iteration 4

- implement local content import and validation workflow
- support versioned files under `data/`
- prepare minimal SRD seeds and private templates

## Iteration 5

- integrate catalog content into character creation and editing
- keep free-text fallbacks during the transition
- complete basic auth and protected app flows with Supabase Auth

## Iteration 6

- stabilize the completed character create/edit workflow with green E2E coverage
- keep session planning documents aligned with the current implementation
- treat broken workflow tests as the first priority before adding wider product scope

Status on 2026-07-07:

- character create/edit/delete E2E flows are green again
- structured note placeholder rows no longer block submit
- the next development focus moves back to product breadth instead of workflow repair

## Iteration 7

- create the first user-facing private/manual content CRUD workflow
- start with one bounded content family such as spells or feats
- preserve clear boundaries between SRD/system content and user-private content

## Iteration 8

- support copying SRD entries into private editable content
- track source metadata for derived private entries
- keep original SRD entries read-only in normal user flows

## Iteration 9

- expose role-aware content behavior for `user`, `content_editor`, and `admin`
- keep role assignment in explicit operator tooling unless a hardened admin console is deliberately added
- add focused tests for permission-sensitive content operations

Status on 2026-07-08:

- authenticated users can create private feats and derive private copies from shared SRD feats
- `content_editor` users can publish validated shared homebrew feats from the app content surface
- `admin` users can publish system-owned feat entries from the same guarded workflow
- authenticated users can also create private spells and derive private copies from shared SRD spells
- `content_editor` users can now publish validated shared homebrew spells from the app content surface
- `admin` users can now publish system-owned spell entries from the same guarded workflow
- role assignment still remains outside the runtime UI and inside operator tooling

## Iteration 10

- add the first bounded shared-content maintenance workflow after publishing
- let editor/admin users review and update shared feat entries without weakening ownership boundaries
- keep normal users read-only for shared and system-owned content
- add focused tests for shared-content update behavior and visibility rules

Status on 2026-07-08:

- editor/admin users can now review shared homebrew feats they are allowed to maintain
- `content_editor` users can update their own shared homebrew feats
- `admin` users can update both shared and system-owned homebrew feats
- shared spell editing is now also available for trusted roles through the app content surface

## Iteration 11

- add explicit lifecycle controls for maintained shared feats
- let trusted roles retire or delete shared homebrew entries through guarded app-side authorization
- keep system-owned lifecycle operations admin-only
- preserve normal-user read-only behavior for shared and system-owned content

Status on 2026-07-08:

- trusted roles can now retire or permanently delete maintained shared feats
- shared spell publishing and maintenance now exist, but spell lifecycle controls are still missing

Status on 2026-07-09:

- trusted roles can now retire or permanently delete maintained shared spells
- the E2E mock runtime now has role-override groundwork for future privileged content browser coverage

## Future Iterations

- advanced permissions and sharing
- campaign-aware visibility
- future campaign and companion features

## Cross-Cutting Workflow

- maintain focused context slices under `docs/context/`
- favor small tasks with proportional validation to reduce token waste
