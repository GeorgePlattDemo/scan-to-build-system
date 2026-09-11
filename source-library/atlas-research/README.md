# STB Atlas 0.1

Working research atlas for the Scan-to-Build destination path.

Repository: `GeorgePlattDemo/grok-file`  
Branch: `wip/app-build-0.1-stabilization`  
Path: `docs/atlas/`  
Status: **not adopted**. Research only. Does not create governed, Store, or Cell authority.

Seven parts written 2026-09-09. This is a complete *research set*, not an adopted specification and not a shopping cart.

## Why this exists

The pinned application contract already names the destination:

evidence → observations → configuration → Store resolution → gates → inform / refuse / defer  
or, where permitted: WorkPacket → SimulationAuthorization → simulated execution → outcome

Physical execution remains a later horizon:

application → governed core → Store → machine-neutral job → cell lowering → local controller → drives / tooling

This atlas looks at the outside world against that stack so a later planning pass can borrow tools without collapsing layers.

## How to use this atlas

The atlas is meant to reduce invention and cognitive load, not add another required reading stack.

For the bounded Pass-3 application slice:

| Relevance | Parts | Use |
| --- | --- | --- |
| Read now | 1–3 | Capture/intake, easy vs hard entry, and the Store membrane directly inform the first app. |
| Boundary reference | 4 | Read when checking that app/Store behavior does not collapse into CAM, lowering, or controller behavior. |
| Deferred horizon | 5–7 | Machine-envelope comparison, iron, and distributed fulfillment are useful future bearings. Do not load them by default into a bounded app implementation task. |

A builder should start with the controlling App/REF/Store/Cell documents, then use only the atlas pages relevant to the current task. More atlas context is not automatically better context.

## Borrow-first shelf

Before inventing a subsystem or adding a dependency, check whether an ordinary platform primitive already satisfies the bounded requirement.

For the first browser-based candidate application, examples worth evaluating before heavier machinery include:

- native HTML input types and constraint validation for ordinary input hygiene — never as governed gates;
- inline SVG for bounded 2D orthographic views and component-linked selection;
- the browser File API for explicit user-selected artifact metadata/content access;
- Web Crypto `digest()` for bounded local content hashing where appropriate;
- IndexedDB for local structured draft/history persistence where appropriate;
- native JavaScript modules for separating derivation, records, views, and adapters without inventing a module system.

These are **borrow-first candidates**, not selected implementation requirements. If a later need exceeds them, choose a stronger tool because the demonstrated requirement justifies it — not because a larger stack is available.

General rule:

> **Borrow mature pieces. Invent only the connective tissue Scan-to-Build actually needs.**

## Parts

| Part | File | Status |
| --- | --- | --- |
| 0. Index | this file | open |
| 1. Capture | [STB-ATLAS-01-CAPTURE-0.1.md](STB-ATLAS-01-CAPTURE-0.1.md) | written 2026-09-09 |
| 2. Easy in / hard in | [STB-ATLAS-02-EASY-HARD-IN-0.1.md](STB-ATLAS-02-EASY-HARD-IN-0.1.md) | written 2026-09-09 |
| 3. Order membrane | [STB-ATLAS-03-ORDER-MEMBRANE-0.1.md](STB-ATLAS-03-ORDER-MEMBRANE-0.1.md) | written 2026-09-09 |
| 4. Neutral ops → machine | [STB-ATLAS-04-NEUTRAL-OPS-TO-MACHINE-0.1.md](STB-ATLAS-04-NEUTRAL-OPS-TO-MACHINE-0.1.md) | written 2026-09-09 |
| 5. Envelope ladder | [STB-ATLAS-05-ENVELOPE-LADDER-0.1.md](STB-ATLAS-05-ENVELOPE-LADDER-0.1.md) | written 2026-09-09 |
| 6. Iron (controllers, servos, workholding) | [STB-ATLAS-06-IRON-0.1.md](STB-ATLAS-06-IRON-0.1.md) | written 2026-09-09 |
| 7. Atoms vs bits (distribution) | [STB-ATLAS-07-ATOMS-VS-BITS-0.1.md](STB-ATLAS-07-ATOMS-VS-BITS-0.1.md) | written 2026-09-09 |

## Rules

- Cite field tools as they exist. Do not invent APIs or accuracy claims.
- Map every tool to an existing membrane: App, REF, Store, Cell, local controller.
- A scan, file, model, extracted value, or model inference remains evidence/candidate input until an owning governed process says otherwise; atlas wording does not mint a governed `Observation`.
- Atlas comparison labels and taxonomies do not become Store, Cell, or governed vocabulary merely because they are useful here.
- A field survey that did not find something is not proof that no such product, company, or workflow exists.
- No new repository. No merge to `main`. No Store or REF edits from this work.
- Production execution remains closed.

## Authority order

Governed Reference → Store → Cell spine → App build contract → this atlas.

This atlas loses any conflict with the sources above.
