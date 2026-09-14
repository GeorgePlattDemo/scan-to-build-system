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

Latest verified checkpoint on that line: `8bf5801e583f844b26d32b23854d9290b51d4593`.

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

## Store reconciliation — verified facts

Repository: `GeorgePlattDemo/scan-to-build-store`.

Current `main`: `3620b35369d70cf49733bbb0b62c0f3d9969b738`.

The branch `build/store-published-jobs-0.1` is at `0023b39a9a59c7cd2c882627c78ef59236f553e4`.

Verified relationship:

- Store `main` is the merge base of `build/store-published-jobs-0.1`;
- the published-jobs branch is 14 commits ahead and 0 behind `main`;
- therefore substantial Store implementation work is stranded off `main`, not lost.

However, **do not merge that branch into Store main yet**.

The current system intentionally contains two Store relationships:

1. `STORE_PIN = b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` for the established Stage-2/Board Store path.
2. `PUBLISHED_JOB_STORE_PIN = 4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` for the published D-001 / rectangular-sheet / S-001 trial path.

The canonical centered S-001 commit `4402abeb...` and `build/store-published-jobs-0.1` do **not** form a simple head/ancestor relationship. Their comparison is diverged. Therefore the proposal "merge published-jobs and point everything at the new Store main HEAD" is not currently safe.

The correct Store recovery task is reconciliation, not a blind merge:

- preserve the Stage-2/Board path;
- preserve the published-job work;
- preserve the canonical centered S-001 work;
- compare the divergent Store branches against their common combined base;
- construct one tested Store stabilization candidate;
- only after that candidate passes its Store tests and the System integration tests should Store `main` or either System pin move.

A Store reconciliation branch has been created from current Store `main`:

`stabilize/store-reconciliation-0.1`

No Store runtime changes are authorized merely by this register.

## What Claude's gap analysis got right

Use as recovery evidence:

- much of the human-facing presentation was lost or never made durable in the current application;
- important Store implementation is stranded on branches rather than gone;
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
2. Reconcile Store branches on `stabilize/store-reconciliation-0.1` without changing System pins yet.
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
