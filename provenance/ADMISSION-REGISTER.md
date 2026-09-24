# Admission Register

This register records what has crossed the line into the post-app working baseline.

## Foundation-created documents

The following are current repository-created navigation/working documents, not copied legacy authority:

- root `README.md`;
- `STB-PROJECT-STATE-AND-SOURCE-INDEX.md`;
- `docs/project/*`;
- `docs/definitions/README.md`;
- `provenance/*`;
- `docs/governance/*` navigation and admitted source snapshots;
- `docs/application/*` current application navigation, semantic guardrails and exact source pointers;
- `docs/store/*` Store source/navigation surface;
- `docs/machine/*` post-app machine source map/navigation;
- `docs/cell/*` current Cell/stage source pointers;
- `docs/patents/*` patent-source navigation, exact issued PDFs and alignment gate;
- `work/*` stable post-app working surfaces for intake, Store, machines and Cell.

Repository-created summaries do not replace owner documents. Where a source owns a term or runtime meaning, that source still controls.

## Issued patents admitted as primary sources

The full issued grants are now present in the working repository and are primary sources for patent wording and technical patent correspondence.

### U.S. Patent 9,720,401 B2

- path: `docs/patents/source/US9720401B2.pdf`
- SHA-256: `d6ff401ee0a60720c0d8b9819a0f828e15036deee1882da06dab7282da0311a4`
- disposition: `ADMIT AS-IS / PRIMARY SOURCE`

### U.S. Patent 10,768,609 B2

- path: `docs/patents/source/US10768609B2.pdf`
- SHA-256: `3fd23f9dab7419098162836af25257d2736771bf27196824ad972b479a02b092`
- disposition: `ADMIT AS-IS / PRIMARY SOURCE`

Both repository hashes exactly match the PDFs supplied by George for the September 11, 2026 consolidation session.

Current build work touching patented subject matter uses `docs/patents/PATENT-ALIGNMENT-GATE.md`.

The patents are not a substitute for current capability, commissioning, safety evidence, production authorization, or legal analysis.

## Governed Reference historical admission

Source identity:

- repository: `GeorgePlattDemo/scan-to-build-governed-reference`
- pin: `18949f163718a937f072f4be3a654bb303e53160`
- historical admission: `ADMIT AS-IS` at the time of consolidation
- current cross-repository authority: `GeorgePlattDemo/3d-solutions-program`

Historical source snapshots admitted under `docs/governance/` include the governed README, M1 build guidance, governance/review/security/threat-model material, architecture and authority notes, custody/disclosure/external-processing guidance, fixture/identifier guidance, reference-node explanation, I0 correction, ADR-0008 through ADR-0020, change/validation history, module inventory and selected legal/provenance guidance.

Copying them here does not broaden their original status. Informative/planned source text remains informative/planned.

### Large governed historical sources retained by pin

- `specs/STB-REF-0.2.5.md`
- `plans/STB-PLAN-0.2.5.md`
- `docs/architecture/common-entry-contexts.md`
- `docs/architecture/demand-architecture-traceability.md`
- `foundations/NC_Wood_Demand_as_Architecture_ss1-12_0.3.md` — full private historical source; current admitted research proposition is in Program

See `docs/governance/CONTROLLING-SOURCE-POINTERS.md`.

## Application source dispositions

### Accepted application

- source: `GeorgePlattDemo/grok-file`, `build/app-foundation-0.1`
- pin: `4595b4785a2686486e477ce2e70fb3f476285a8d`
- historical disposition: transferred implementation datum
- current implementation owner: `GeorgePlattDemo/scan-to-build-system/apps/stb/`

The transferred application tree is present in [`apps/stb/`](../apps/stb/) and has continued under System ownership. See [`APP-TRANSFER.md`](APP-TRANSFER.md) for provenance and [`apps/README.md`](../apps/README.md) for current launch/status guidance.

### Frozen application roadmap

- source pin: `985db87a707bd454d7c58419e2cf4d884f00cded`
- disposition: `HISTORICAL PLANNING ANCESTRY`

The roadmap remains provenance. It is not the current application build order.

### Entry/intake contract

- source pin: `2d80b5a7b0e7687c425e100bfa0ff3a833166d42`
- disposition: `ADMIT AFTER REWRITE`

Reason: the locked intake/evidence principles remain useful, but the source document embeds a Stage-2 Store pin that predates the Store pin consumed by the accepted app. Current meaning is reconciled into `work/user-intake/README.md`.

### Application semantic boundaries

- source: transferred app pin, `docs/architecture/STB-SEMANTIC-BOUNDARIES-0.1.md`
- disposition: `HISTORICAL SEMANTIC RECONCILIATION SOURCE`

Current shared meaning is owned by Program `governance/definitions.md`. System's implementation summary is `docs/application/SEMANTIC-GUARDRAILS.md`. The exact donor copy remains at [`source-library/application-current/STB-SEMANTIC-BOUNDARIES-0.1.md`](../source-library/application-current/STB-SEMANTIC-BOUNDARIES-0.1.md) as provenance.

### Stabilization / source-map / structure guidance

- source: accepted app pin
- disposition: `KEEP-REFERENCE`

Use for reconciliation history, owner boundaries, keep/discard decisions, unresolved machine issues and build doctrine. Accepted Build-8 implementation plus later semantic boundaries control where older planning language differs.

## Machine / Cell source dispositions

### Machine Build Program 0.1

- path: `work/machines/MACHINE-BUILD-PROGRAM-0.1.md`
- disposition: `CURRENT POST-APP PROGRAM`

This document now controls the physical machine/research sequence:

- control case — manual radial-arm saw, eyes, tape measure, pencil and operator judgment;
- Machine Build 1 — Digital Bridge Proof;
- Machine Build 2 — Store Integration Proof;
- Machine Build 3 — Research Cell / Deployment Question;
- Machine Build 4 — Frontier.

It does not overwrite Store/Cell evidence Stage 1–4 vocabulary; it gives the physical research program its own explicit numbering.

### Post-app Cell spine

- source: `GeorgePlattDemo/grok-file@4595b4785a2686486e477ce2e70fb3f476285a8d/docs/cell/STB-CELL-0.1.md`
- disposition: `KEEP-REFERENCE`
- source status retained: descriptive working artifact; candidate objects remain candidate; production path closed.

### Atlas 04 — Neutral Ops to Machine

- same accepted app pin
- disposition: `KEEP-DONOR`
- source status retained: not adopted; field survey only.

### Atlas 05 — Envelope Ladder

- same accepted app pin
- disposition: `KEEP-DONOR`
- source status retained: not adopted; field survey only.

### Atlas 06 — Iron

- same accepted app pin
- disposition: `KEEP-DONOR`
- source status retained: not adopted; field survey only.

These sources are indexed from `docs/machine/POST-APP-MECHANICAL-SOURCE-MAP.md` and may inform current machine engineering only through the current Machine Build Program and patent-alignment gate.

### Public Machine Function & Kinematic Ontology

- source: `GeorgePlattDemo/scan-to-build-review@ab3e35e54d022928d0dd64aae58679fd893f65d2/docs/MACHINE_FUNCTION_KINEMATIC_ONTOLOGY.md`
- disposition: `KEEP-DONOR / RECONCILE BEFORE ADMISSION`

Reason: substantial useful mechanical/patent/safety detail, but it predates the current layer and terminology cleanup. Mine item-by-item later; do not adopt wholesale.

## Current Store/cell stage vocabulary

- source: `GeorgePlattDemo/scan-to-build-store`, `stage-2-store-zero-reference`
- pin: `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d`
- file: `STB-STORE-CELL-STAGES-0.1.md`
- disposition: `KEEP-CURRENT`

Its Stage 1–4 meanings remain an evidence vocabulary. They are not the same numbering as Machine Build 1–4.

Directional relationship is documented in `work/machines/MACHINE-BUILD-PROGRAM-0.1.md`.

## New post-app working documents

The following are repository-created current work surfaces:

- `work/machines/staging/DIMENSIONAL-MACHINE-STAGING-0.1.md`
- `work/machines/staging/SHEET-MACHINE-STAGING-0.1.md`
- `work/cell/RESEARCH-CELL-STAGING-0.1.md`
- `work/machines/MACHINE-BUILD-PROGRAM-0.1.md`

They are planning/status surfaces, not automatic capability declarations.

## Explicitly not admitted as current

### Sarah / early demo material

**Disposition:** donor/provenance only; not current baseline.

The early Sarah chain was intentionally a toy/research demonstration and crosses periods of terminology, Store, governance, and authority evolution. Useful behavior may later be recovered only through current owners, language and primary sources.

### Public review and public demo wholesale

**Disposition:** external retained public sources; duplicate System snapshots removed.

The public repositories remain available at their own locations:

- `GeorgePlattDemo/scan-to-build-review`
- `GeorgePlattDemo/Scan-to-Build`

System no longer carries full copied HTML/PDF/document snapshots merely for preservation. Historical source pins remain in provenance records and can be retrieved from the original public repositories when needed.

This deletion changes no current application behavior and does not alter the retained public repositories.

### Transfer Staging / rejected candidates

**Disposition:** archive/provenance candidate; not current baseline.

### Historical machine/cell claims not reconciled above

**Disposition:** pending later review.
