# Scan-to-Build Recovery Register 0.1

Checked: 14 September 2026

## Purpose

This register exists to stop recovery work from depending on chat memory, branch names, or whichever file happens to be easiest to find.

It records what is verified, what is controlling for the human-facing application, what technical capability still exists, what is only stranded on branches, and what must not be merged or rewritten until the conflicting sources are reconciled.

This register is subordinate to `STB-CONTROLLED-APP-BASELINE-0.1.md` for the stabilization protocol.

## Current System stabilization state

Repository: `GeorgePlattDemo/scan-to-build-system`

Accepted source used to start stabilization: `main` at `287349c7906b9d0258b60008d030014f7e8afc83`.

Controlled application branch: `stabilize/controlled-app-baseline-0.1`.

First verification-clean controlled-entry checkpoint: `8bf5801e583f844b26d32b23854d9290b51d4593`.

GitHub Actions run `34865963192` completed successfully for that checkpoint. The targeted stabilization workflow passed the unit suite, boundary suite, and controlled-entry browser suite.

This does **not** mean the whole application recovery is complete. It means the first controlled visible checkpoint is verification-clean:

- landing;
- three starting contexts;
- same real Page 1;
- four controlling project doors;
- BUILD GUIDE rail;
- README pill;
- existing project-switch gate preserved;
- window-seat door is functional navigation rather than decoration.

Source-reconciliation work continues on `stabilize/source-reconciliation-0.1`, which descends from that clean checkpoint.

## Human-facing source authority

For this stabilization pass, `stb-app-build-pages-0.9.html` is the controlling product/presentation source for the material it contains.

Fingerprint:

- SHA-256: `c415bfd7047d42f4431384a612171b3ba56fc0d9cc54811c67f54d137860df8e`
- byte size: `217841`

Controlling from that source unless George changes it:

- words;
- wording order;
- drawings and inline imagery;
- page composition;
- project-ribbon order and meaning;
- main-field explanations;
- BUILD GUIDE placement and purpose;
- README pill position at the bottom of the developer rail;
- visible navigation pattern;
- the human purpose represented by each project door.

Do not reduce this source to "inspiration." Do not paraphrase or replace it merely to make existing code easier to reuse.

## Technical authority

The existing repository controls technical truth, including:

- evidence, observation, candidate, revision and record identity;
- Store request/response and refusal semantics;
- machine-family boundaries;
- current admitted capability;
- safety and governance;
- fail-closed behavior;
- commercial/production/physical-execution separation;
- durable record/export/import/reopen behavior.

Where the product source and technical repository do not line up, preserve both and expose the technical condition truthfully as unresolved, blocked, reference-only, historical, or planned. Do not invent authority and do not rewrite the product intent to hide the mismatch.

## Project-door recovery register

### Start your own

**Product role:** open intake and the lowest-friction demonstration that a useful project can begin with one board, one need, or whatever evidence the person already has.

**Human-facing recovery target:**

- wood/material swatches;
- "Grab a board..." floor;
- graduated ways to enter by effort;
- "Bring what you have" intake;
- source / candidate / gap visibility;
- capture and measurement distinction;
- review and record continuity.

**Technical material already present:** Board domain/rule, evidence/observation/candidate handling, durable project records, archive/import/export/reopen paths.

**Status:** partially re-exposed; not yet accepted as complete.

### Critical fit — Shelf insert / alcove

**Product role:** simplest bounded-project proof. A human should be able to understand the problem, make only the choices that belong to them, see derived consequences, and follow the project into current Store/review boundaries.

**Human-facing recovery target:** Claude-controlled alcove drawing, capture explanation, configurator composition, developer rail and exact associated copy.

**Technical material already present:** `alcove-rule.mjs`, `alcove-engine.mjs`, mapped class/configurator machinery, Store/review/record path.

**Status:** next UI checkpoint after source reconciliation. Do not replace the product presentation with the current generic configurator merely because the engine exists.

### Space utilization — Window seat

**Product role:** bounded project intentionally pushed to the present envelope. It exists to expose mixed-family work, qualified human resolution, unresolved conditions, and the point where current capability must stop.

**Human-facing recovery target:** Claude-controlled drawing/copy and the full edge-of-envelope journey.

**Technical/source material already present:** `work/capability-bridge/WINDOW-SEAT-EDGE-CASE-JOURNEY-0.1.md`, `QUALIFIED-RESOLUTION-0.1.md`, dimensional and sheet capability material, existing review/refusal architecture.

**Status:** source material survives. Current executable product-class authority is not assumed. Preserve the door even when the correct outcome is unresolved or reference-only.

### Outdoor build — Picnic tables

**Product role:** easy family expansion that demonstrates reuse. Form and fulfillment scope are separate concerns; frames-only is capability-aware decomposition, not just a discount.

**Human-facing recovery target:** four pictured choices, attached/separate form distinction, complete/frame scope distinction, configurator/review/glossary presentation.

**Technical material already present:** `picnic-rule.mjs`, `picnic-engine.mjs`, `PICNIC-TABLE-CLASS-CANDIDATE-0.2.md`.

**Status:** meaningful domain work survives. Historical donor prices, placeholder SKUs and unsupported structural assumptions are not current authority.

## Dimensional, sheet and curved work

This work is **not gone**.

The current system contains:

- D-001 dimensional/Board work;
- rectangular sheet evaluation;
- S-001 centered arched-sheet configuration;
- S-001 domain/engine code;
- secondary-operation/completion logic;
- tests that protect the canonical centered field and fail-closed behavior.

The product problem is that these capabilities are no longer exposed through a coherent human story. Their future visible placement must be deliberate. Do not delete them merely because they are not yet represented by a controlling project door.

## Store reconciliation — verified facts and result

Repository: `GeorgePlattDemo/scan-to-build-store`.

Store `main`: `3620b35369d70cf49733bbb0b62c0f3d9969b738`.

Historical branch facts:

- `build/store-published-jobs-0.1` = `0023b39a9a59c7cd2c882627c78ef59236f553e4`;
- `build/store-d001-s001-combined-0.1` = `096e99d645d745b1670185f46c75de75f9e59661`;
- canonical centered S-001 functional commit = `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc`;
- centered-field branch head = `0da283c01ae9980b39c94e41437bf34340b7c337`;
- established Stage-2/Board Store commit = `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d`.

Verified genealogy:

1. Store `main` is an ancestor of the later Store work.
2. `b40cdc60...` is an ancestor of the combined D-001/S-001 Store line.
3. `096e99d...` combines the dimensional D-001 and sheet S-001 candidates without broadening either machine envelope.
4. `build/store-published-jobs-0.1` adds only two files beyond that combined base: `store-published-jobs.json` and `store-published-jobs.test.mjs`.
5. The centered S-001 line also descends from `096e99d...` and updates the canonical arched project to the full 96 × 48 in parent with the centered 48 × 36 in work field.
6. `4402abeb...` and the old published-jobs head are divergent, so the old named-job JSON could not simply be copied forward unchanged.
7. From `4402abeb...` to the later centered-field head, the functional Store runtime is unchanged; later commits chiefly strengthen the centered-field test/workflow proof.

### Reconciled Store candidate

Branch: `stabilize/store-reconciliation-0.1`.

Candidate head: `c0a34c180dfd39960f1c90d773f7954e4bd73a1b`.

The candidate uses the newer centered-field Store line and reconciles the two named-job files instead of choosing one historical branch over the other.

The named-job register now matches the current System concepts:

- `square-stick` / Square 2x4;
- `rect-stencil` / Rectangular sheet stencil;
- `arched-opening` / Centered arched cutout in 1/2 in ply.

The arched job now uses the canonical values already used by the System:

- parent: 96 × 48 in;
- centered work field: 48 × 36 in;
- opening width: 36 in;
- straight height: 24 in;
- rise: 12 in;
- derived radius: 19.5 in;
- whole routed profile must remain inside the centered work field.

The reconciliation did **not** create physical-retention proof, edge-routing authority, Cycle Start authority, controller output, or physical fabrication authority.

### Store candidate verification

GitHub Actions run `34869574228` on Store candidate head `c0a34c...` passed the complete eight-file Store test set:

- `d-001-stage2-mill.test.mjs`;
- `d001-five-tool.test.mjs`;
- `d001-stage2-envelope.test.mjs`;
- `s001-mode2-arched.test.mjs`;
- `s001-mode2-envelope.test.mjs`;
- `store-zero-disposition.test.mjs`;
- `store-zero-stage2.test.mjs`;
- `store-published-jobs.test.mjs`.

### Cross-repository System trial

The current accepted System still intentionally names two Store pins:

1. `STORE_PIN = b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` for the established Stage-2/Board Store path.
2. `PUBLISHED_JOB_STORE_PIN = 4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` for the published D-001 / rectangular-sheet / canonical S-001 path.

Those production pins have **not** been changed.

To test consolidation without changing source authority, System GitHub Actions run `34869707774` ephemerally replaced both pins in the CI workspace with the exact reconciled Store candidate `c0a34c180dfd39960f1c90d773f7954e4bd73a1b` and pointed both Store roots at one clean checkout.

The result passed:

- exact candidate identity / clean-checkout gate;
- System `test:store` source-gate suite;
- all three `trial:published-jobs` bounded jobs;
- final clean-checkout verification.

Therefore one reconciled Store state can satisfy both existing System Store relationships in the tested trial. This is evidence that the Store work can be consolidated without rewriting the Store or discarding the accepted Stage-2 path.

**Promotion is still a separate decision.** Do not move Store `main` or the System pins merely because the candidate is newer. Promotion should happen at a deliberate stabilization checkpoint after the visible application work is reviewed.

## What Claude's gap analysis got right

Use as recovery evidence:

- much of the human-facing presentation was lost or never made durable in the current application;
- important Store implementation was stranded on branches rather than gone;
- branch proliferation makes source-of-truth expensive to determine;
- important product copy and imagery need a named, versioned, testable home;
- the app should be rebuilt page-by-page, starting with the real Page 1 and project doors;
- merged/obsolete branches should eventually be cleaned up after truth is reconciled.

## What must not be taken literally without verification

- Do not treat one Store branch as automatically complete simply because it has more files or tests.
- Do not replace all Store pins with a branch HEAD without proving compatibility.
- Do not put all human-facing copy, drawings and editorial rules into `contracts.mjs`; keep presentation authority separate from technical contracts while testing both.
- Do not resurrect historical prices, inventory counts, SKUs, structural rules or physical-machine claims simply because they appear in an old donor.

## Stabilization sequence from here

1. Keep `8bf5801e...` as the first verification-clean controlled-entry checkpoint until George visually accepts it.
2. Keep Store candidate `c0a34c...` as the tested reconciliation candidate; do not promote or repin yet.
3. Recover **Critical fit / Alcove** exactly from the controlling product source onto the current alcove engine.
4. Validate visually and technically before advancing.
5. Recover **Space utilization / Window seat** as the edge-of-envelope demonstrator, preserving unresolved/qualified-resolution boundaries.
6. Recover **Outdoor build / Picnic** on the existing picnic domain work.
7. Recover **Start your own / Bring what you have** completely and tie it to the existing evidence/candidate/record chain.
8. Deliberately place D-001, rectangular sheet and S-001/curvilinear work in the human capability story rather than leaving them hidden.
9. Only then perform branch cleanup, pointer updates and promotion to a new accepted `main` baseline.

## Working rule

For every task:

**requested change > controlling product source > stated acceptance test > accepted technical boundary > implementation convenience**

When one item conflicts with another, stop at the conflict. Do not silently trade away earlier work.

**NO BLOOD ON WOOD.**
