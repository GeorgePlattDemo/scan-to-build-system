# Application Controlling Source Pointers

This file records the application sources that matter to the post-app working baseline.

A pointer preserves source identity. It does not automatically admit every historical statement inside a source.

## Accepted implementation

- Repository: `GeorgePlattDemo/grok-file`
- Branch: `build/app-foundation-0.1`
- Pin: `4595b4785a2686486e477ce2e70fb3f476285a8d`
- App: `apps/stb/`
- App status document: `apps/stb/README.md`
- Semantic boundaries: `docs/architecture/STB-SEMANTIC-BOUNDARIES-0.1.md`

**Disposition:** current implementation / current application language.

## Frozen application roadmap

- Repository: `GeorgePlattDemo/grok-file`
- Branch: `plan/app-master-roadmap-0.1`
- Freeze commit: `985db87a707bd454d7c58419e2cf4d884f00cded`
- File: `docs/app/STB-APP-MASTER-ROADMAP-0.1.md`

**Disposition:** current application build/page/source roadmap. Read through the later semantic-boundary interpretation where wording such as confirm, quote, offer, or current is ambiguous.

## Entry / intake contract

- Repository: `GeorgePlattDemo/grok-file`
- Branch: `plan/app-entry-intake-contract-0.1`
- Pin: `2d80b5a7b0e7687c425e100bfa0ff3a833166d42`
- File: `docs/app/STB-ENTRY-INTAKE-CONTRACT-0.1.md`

**Disposition:** `ADMIT AFTER REWRITE`.

The locked evidence/intake principles remain useful. The document contains an embedded Stage-2 Store pin (`8713b76a...`) that predates the Store pin consumed by the accepted app (`b40cdc60...`). Do not copy the stale dependency into new current work. The reconciled working intake surface is `../../work/user-intake/README.md`.

## Application build contract

At accepted app pin `4595b4785a2686486e477ce2e70fb3f476285a8d`:

- `docs/app/STB-APP-BUILD-0.1.md`

**Disposition:** current guidance / implementation lineage. Particularly useful for layer responsibilities, bounded-machine posture, User 1 transition, machine/controller horizon, and what prior demo behavior not to carry forward.

## Application source map

At accepted app pin:

- `docs/app/STB-APP-SOURCE-MAP-0.1.md`

**Disposition:** provenance/reference. Its authority-order rule remains useful; newer accepted app/Store pins control where they differ.

## Application stabilization report

At accepted app pin:

- `docs/app/STB-APP-STABILIZATION-0.1.md`

**Disposition:** current reconciliation history / donor decisions. Important for known public-demo and Sarah exclusions, unresolved machine R-04, and prior-work keep/discard decisions.

## Application structure plan

At accepted app pin:

- `docs/app/STB-APP-STRUCTURE-0.1.md`

**Disposition:** current implementation-planning reference. Use only to the extent consistent with the accepted Build-8 implementation and later semantic-boundary cleanup.

## Machine / Cell guidance embedded in app source

At accepted app pin:

- `docs/cell/STB-CELL-0.1.md`
- `docs/atlas/STB-ATLAS-04-NEUTRAL-OPS-TO-MACHINE-0.1.md`
- `docs/atlas/STB-ATLAS-05-ENVELOPE-LADDER-0.1.md`
- `docs/atlas/STB-ATLAS-06-IRON-0.1.md`

These are indexed in `../machine/POST-APP-MECHANICAL-SOURCE-MAP.md` and `../../work/machines/engineering/README.md`.

## Historical implementation ancestor

`prototype/sarah-alcove-tour` remains donor/provenance only.

Do not use it to supply current application semantics, Store behavior, WorkPacket authority, material facts or machine capability.
