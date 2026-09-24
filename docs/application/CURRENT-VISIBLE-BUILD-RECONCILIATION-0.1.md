# Current Visible Build Reconciliation 0.1

**Status:** ownership and migration record; no runtime change  
**System checkpoint:** `scan-to-build-system@db76da2f1b761dc0f0ff055c4a152b2bb73581e1`  
**Visible source checkpoint:** `scan-to-build-review@7b26dfc45c9832271840d134426e096787156a04`  
**Exact preserved copy:** `apps/stb/public-build/`

## Purpose

The visible public build developed in Review faster than the canonical modular application in System. That made Review both a public proof surface and, unintentionally, a holder of unique application behavior.

The first correction was custody, not redesign: the current visible dependency closure was copied byte-for-byte into System and verified by Git blob identity.

This record answers the next question:

> Which parts belong in the canonical System application, which facts must remain Store-owned, which pieces are Review presentation, and which are transitional history?

The preservation checkpoint remains unchanged while this reconciliation proceeds.

## Controlling ownership

- **Program** — shared definitions, governance, research, evidence and reviewed cross-repository decisions.
- **System** — application behavior, project state, project-specific definitions/configuration, user interaction, Store request/response custody, records, executable application contracts and tests.
- **Store** — catalog/material facts, stock, admitted capability, modeled travel/time, Store economics, fulfillment facts and Store answers.
- **Review** — public review/presentation surface. It may display System and Store results but must not remain the only home of current application behavior.

## Non-negotiable current rules

1. Preservation first. No project is simplified while moving ownership.
2. Actor order remains:
   **Configure → Store Answer → Accept / Pay → Store / Yard → Handoff / Record.**
3. Store-origin material only. No owner-stock fallback.
4. The browser does not become a second Store, catalog, pricing engine or capability evaluator.
5. A fresh Store request must receive a fresh Store evaluation/receipt. Prior answers remain history.
6. Job 1 baseline project truth remains the defined 60 in workpiece and identified two-part X-brace sequence. A longer Store pricing/procurement reference for another variant does not redefine that project.
7. The old universal `$35 setup + $100/hour` recovery is forbidden. An anti-regression assertion that those values are absent is valid evidence and must not be deleted merely because the forbidden values appear in test text.
8. No imported Review file gains authority merely because it was visible or newer.

## Imported source disposition

| Imported file | Present role | Reconciliation disposition |
| --- | --- | --- |
| `system-build-current.html` | Human-visible composition shell and multi-project orchestration | **SYSTEM behavior to reconcile.** Preserve as parity source, but do not make the monolith the permanent runtime architecture. Move missing behavior into the modular System app, then retire the duplicate shell only after parity. |
| `system-build-front-door-0.5.html` | Wrapper/front-door over the older base | **TRANSITIONAL SYSTEM UX source.** Three-entry behavior belongs to System, but System already has current entry/routing modules. Port only missing current behavior/copy; do not keep an iframe wrapper as a second front door. |
| `system-build-base-8d8a9dd.html` | Older base plus current Alcove/project-library behavior used by the visible composition | **MIXED / decompose.** Current Alcove behavior and project-library UX belong to System. Historical base/router duplication does not. Never replace the modular app wholesale with this file. |
| `stb-canonical-journey.js` | Older page/stage navigation helper | **DO NOT PROMOTE AS CANONICAL.** Its stage vocabulary is not the controlling actor-order contract. Preserve as visible-build provenance and mine useful navigation assertions only. |
| `stb-store-handoff-contract.js` | Actor order, artifact map, Store-source metadata, browser material rows and handoff helpers | **SPLIT.** System may own handoff shape, project identity and actor-order behavior. Store pins/catalog rows/prices/capability/economics are Store facts and must not become a browser-side authority. |
| `stb-user-defined-board-store.js` | Browser-side Board Store evaluator/surrogate | **SUPERSEDED FOR CURRENT SYSTEM.** Do not promote. Current System already has the bounded Store client/coordinator/server adapter and fresh-request path. Retain only as parity/history until Review no longer depends on it. |
| `stb-user-defined-board-runtime-bridge.js` | Static Review → hosted System Store bridge | **TRANSITION ADAPTER.** Fresh request/receipt/correlation behavior belongs in System and already has canonical modules. Keep the static bridge only until publication moves to the System-owned surface. |
| `store-zero-canonical-doctrine.js` | Browser copy/presentation of Store doctrine | **STORE-OWNED MEANING / REVIEW PRESENTATION.** Do not create a second Store doctrine in System runtime. The application may present attributed Store facts. |
| `stb-build-guide-spec.js` | Developer/presentation rail | **REVIEW/PRESENTATION.** Useful explanatory material, not domain authority. Keep out of canonical application contracts. |
| `three-frames.html` | Current Start Your Own / Job 1 visible interaction | **SYSTEM UX candidate.** Reconcile against `apps/stb/browser/three-frames.html` and existing `USER_DEFINED_BOARD_V1` modules. Preserve Job 1 facts and Store-origin behavior. Do not overwrite the modular file until parity tests exist. |
| `stb-outdoor-bench-leg-0.1.html` | Outdoor bounded-project visible surface | **SYSTEM project-surface candidate.** Reconcile with the existing picnic/bounded-source engine; keep Outdoor as its own project. Do not borrow Job 1 geometry/economics. |
| `stb-window-seat-space-utilization-0.7.4.html` | Window Seat current visible/gold-standard surface | **SYSTEM project-surface candidate.** Admit through a bounded class/configuration contract rather than as a 0.7.4 monolith. Preserve its project truth and actor handoffs. |
| `stb-start-own-bench-leg-0.1.html` | Artifact named by the handoff contract but not the primary current shell dependency | **LEGACY/COMPATIBILITY DONOR.** Keep only until artifact references/tests are reconciled to the actual Job 1 surface. |
| `stb-store-runtime.json` | Public deployment endpoint configuration | **DEPLOYMENT/PUBLICATION CONFIG.** Not project or Store authority. Keep environment/deployment details out of shared domain semantics. |
| `stb-alcove-store-bridge.js` | Static Review → hosted System Alcove bridge | **TRANSITION ADAPTER.** Preserve request identity, timeout, CORS/freshness and response-binding requirements in System integration tests; do not maintain a second Store client forever. |
| project-tile WebP assets | Visible project-library imagery | **SYSTEM PRESENTATION ASSETS** when the corresponding project library moves into canonical System. |

## What the canonical System already owns

The visible build is not being imported into an empty application.

Current System already contains:

- durable entry/routing and actor context;
- evidence and observation custody;
- project/candidate revision handling;
- Board/User-defined Board request contracts;
- `USER_DEFINED_BOARD_V1` and `ALCOVE_INSERT_V1` Store wire contracts;
- Store client/coordinator modules;
- server-side Store adapter;
- fresh-evaluation hardening;
- current Alcove, Picnic and S-001 derivation engines;
- review/result/record custody;
- Definition Contract tests;
- current Store anti-surrogate rules.

Therefore reconciliation means **fill the missing visible behavior into these owners**, not build a parallel app from the imported HTML.

## Immediate defects exposed by the comparison

### 1. Browser-side Store duplication

The visible `stb-store-handoff-contract.js` contains copied Store catalog rows, including prices.

That was useful to make a static Review surface move, but it violates the current ownership rule if treated as application authority.

**Disposition:** preserve the checkpoint; remove this dependency from the eventual canonical System surface. Material, stock, capability, modeled work and Q must come from the real Store path.

### 2. Two Store paths remain visible in history

The visible composition contains both current runtime-bridge behavior and older browser Store-surrogate artifacts.

**Disposition:** canonical System uses the current fresh Store-request path. The surrogate survives only as source/parity history until the public Review no longer needs it.

### 3. “Canonical journey” naming overstates authority

`stb-canonical-journey.js` carries an older page-stage sequence. The current actor handoff is controlled elsewhere.

**Disposition:** do not rename the current architecture around this file. Mine only useful navigation/refusal assertions.

### 4. Current project surfaces are monolithic

Outdoor and Window Seat have useful current behavior but live as large standalone HTML artifacts.

**Disposition:** preserve exact source; extract project definition/configuration and UI behavior into the existing System project/class architecture one project at a time. No whole-file rewrite.

### 5. Window Seat source references a missing image

The pinned Review source references `elevation-windowseat.png`, but that file is absent from the source commit.

**Disposition:** recorded source defect. Do not invent, substitute or silently fetch another image during reconciliation.

## Review test mining

Twenty-eight Review tests reference the preserved visible-build files. They are **evidence candidates**, not an automatic test suite transplant.

### Admit/re-express in System

These test intents belong in System as behavioral/integration receipts:

- fresh Store request/receipt and public-runtime correlation;
- Job 1 Store-origin material path;
- Job 1 exact project truth and travel-standard request;
- no automatic `72 → 60` preparation cut;
- Job 1 navigation staying on Job 1 until explicit Project Library exit;
- Accept/Pay exposing the intended customer actions while keeping events separate;
- Yard continuous handoff and READY ≠ custody;
- Alcove real/published runtime request binding;
- Alcove correction/revision behavior;
- project-to-Store convergence without cross-project fact leakage;
- Window Seat actor-handoff parity when its class is admitted;
- protected refusal/negative-answer behavior.

Tests currently coupled to Review HTML strings should be rewritten against System modules/DOM contracts where possible rather than copied as permanent source-string tests.

### Keep as Review/presentation tests

- Dev Guide rail coverage/copy;
- pure presentation housekeeping that does not define application state or authority.

### Retire after parity

- tests whose subject is the browser-side `STBUserDefinedBoardStore` surrogate;
- wrapper/iframe-specific assertions after those wrappers cease to be part of the public surface;
- source-string locks that only protect an obsolete filename rather than current behavior.

### Important number distinction

Current tests contain both legitimate negative checks and legitimate alternate-variant checks:

- `$35 / $100/hour` appears in an anti-regression assertion requiring those stale values to be absent.
- the baseline Job 1 definition must not hard-code `parentLengthIn = 72`.
- some 18 in variant tests legitimately expect Store to choose a 72 in pricing/procurement reference under that variant's current demand.

Do not delete those tests by keyword. Judge the assertion.

## Ordered reconciliation sequence

### R1 — Job 1 first

Reason: System already owns the complete `USER_DEFINED_BOARD_V1` Store/runtime path.

1. Compare imported `three-frames.html` with `apps/stb/browser/three-frames.html`.
2. Identify only the missing visible interaction/definition behavior.
3. Port Review Job 1 tests as module/DOM behavior tests.
4. Route all Store facts through current System → Store.
5. Prove current 60 in baseline facts and fresh Store behavior.
6. Keep Review unchanged until System parity is demonstrated.

### R2 — Alcove

Reason: System already owns `ALCOVE_INSERT_V1`.

1. Extract current visible Alcove controls/definition behavior from the preserved base/shell.
2. Reuse current System Alcove engine and Store adapter.
3. Port real-runtime/correction tests.
4. Do not rewrite Window Seat during Alcove work.

### R3 — Outdoor

1. Map the visible Outdoor artifact to the existing Picnic/bounded-source engine.
2. Preserve Outdoor's source-backed definition and independent Store authority.
3. Do not inherit Job 1 economics or material assumptions.

### R4 — Window Seat

1. Admit the class/configuration contract deliberately.
2. Preserve the full current project truth and gold-standard actor handoff.
3. Move Store-owned evaluation/economics out of the monolithic page.
4. Port gold-standard/parity tests.
5. Treat the missing source image as a separate presentation repair, not a reason to change project semantics.

### R5 — Common shell / project library

Only after R1–R4 have canonical System homes:

1. consolidate project navigation/library into the modular System shell;
2. preserve the three front doors;
3. eliminate iframe/wrapper compatibility layers with parity tests;
4. keep Review as the public presentation/launcher surface rather than an application authority.

### R6 — Review thinning

After System parity is proven and the public route can consume the System-owned build:

- Review may keep presentation copy, public explanation and publication glue;
- delete duplicate application behavior from Review only after its public links and tests point to System-owned artifacts;
- do not remove Review history.

## Branch/cleanup implication

Do **not** prune Review/System branches that carry evidence for R1–R5 until the corresponding parity receipts land in System.

Once parity is complete, branch cleanup can use the normal ledger:

`branch → final SHA → merged/superseded/abandoned → retained tag if needed → delete branch`.

## Acceptance condition for “the app lives in System”

The application can be called System-owned only when:

1. the public project's current behavior has a canonical System implementation;
2. Store facts are obtained through Store-owned evaluation rather than browser copies;
3. every project has an identified System class/configuration owner;
4. the required Review behavior tests have equivalent System receipts;
5. public Review can present/launch the System-owned build without carrying unique domain/runtime behavior;
6. the exact pre-reconciliation checkpoint remains recoverable by SHA.

Until then, `apps/stb/public-build/` is the frozen reconciliation source, not the second application.

**NO BLOOD ON WOOD.**
