# Critical Fit Full Audit Reference 0.1

**Status:** additive implementation reference; no existing journey behavior is superseded by this document  
**Applies to:** `alcove-shelf-blanks` / project-facing name **Critical Fit**  
**Parent protocol:** `docs/operations/STB-STANDARD-FORMS-AND-COMPLETION-PROTOCOL-0.1.md`  
**Governance alignment:** `docs/operations/STB-PROJECT-COMPLETION-GOVERNANCE-ALIGNMENT-0.1.md`  
**Safety invariant:** **NO BLOOD ON WOOD**

---

## 1. Purpose

Critical Fit is the `FULL_AUDIT` reference implementation for the Scan-to-Build standard completion forms.

This pass is visibility-only.

It may:

- identify existing records and their lineage;
- expose exact Store and pricing facts already returned by the accepted application;
- explain what an existing state means and does not mean;
- show explicitly which downstream standard forms do not yet exist;
- identify migration work required before a current record can satisfy the new completion protocol.

It may **not**:

- remove or replace an existing screen;
- remove or replace an existing control;
- reroute the accepted journey;
- change a calculation merely to make the audit look complete;
- convert a donor document into a current runtime record;
- synthesize an order, payment, release, machine event, inspection, staging event, pickup, or physical outcome that did not occur;
- upgrade Store support into production authority;
- upgrade a documentary or simulated result into physical execution;
- streamline existing refusal or unresolved behavior out of view.

The preservation rule is:

> **License to explain is not license to rewrite. Existing behavior remains controlling.**

---

## 2. Identity

The project-facing library name is:

**Critical Fit**

Descriptive subtitle:

**alcove shelf insert**

The accepted runtime class identity remains:

`alcove-shelf-blanks`

This documentation does not rename the class ID or break existing references merely to improve presentation language.

---

## 3. Why Critical Fit is the full reference

Critical Fit is intentionally more verbose than later projects.

Its purpose is to show, once and unabridged, that the application can account for the full path from owner evidence through Store evaluation and onward through the standard completion forms without collapsing authorities or hiding missing stages.

Later projects may use `STANDARD` or `SUMMARY` presentation depth, but the record requirements established here remain the reference.

---

## 4. Current accepted evidence versus standard forms

The existing accepted application is already strong through definition, Store evaluation, Review, Result, and durable project history. The new completion forms extend beyond that current implementation.

The audit therefore distinguishes three conditions:

- `CURRENT` — supported by an existing current record/result;
- `PARTIAL` — some required basis exists, but the standard form itself is not yet issued;
- `NOT REACHED` / `NOT IMPLEMENTED` — the event or authority does not exist and must not be invented.

### `STB-F00 — Actor / Account Context`

**Current state:** `PARTIAL — TRANSACTION ACCOUNT NOT IMPLEMENTED`

Existing application context preserves entry/actor relationship and project identity. It does not yet create the account authority required to accept an offer, create an order, or process Payment Zero.

Anonymous participation remains compatible with browse/configure/Store-price behavior, but not transaction authority.

### `STB-F01 — Intent / Source Evidence`

**Current state:** `CURRENT UPSTREAM RECORD — NOT REWRITTEN BY AUDIT VIEW`

Evidence custody, observations, corrections, and provenance remain owned by the existing application record model.

The Full Audit view references that custody. It does not copy the evidence into a new pseudo-source.

### `STB-F02 — Confirmed Project Definition`

**Current state:** `CURRENT` when a current Review-bound definition exists.

Expose at minimum:

- project ID;
- class ID;
- candidate revision;
- projection ID;
- Review record ID/type;
- Review digest.

The view must repeat the authority boundary:

**confirmed definition != order != payment != release != machine readiness != physical outcome**.

### `STB-F03 — WorkPacket`

**Current state:** `PARTIAL — CURRENT PROJECTION EXISTS; STANDARD F03 FORM NOT YET ISSUED`

The current candidate/projection may supply substantial machine-neutral definition data, and historical WorkPacket examples remain useful donors.

No donor WorkPacket is promoted into a current authoritative packet merely because the standard now expects one.

### `STB-F04 — Store Evaluation`

**Current state:** `CURRENT` when an exact Store answer exists.

The Full Audit view should expose existing Store facts already preserved by the accepted integration, including where returned:

- Store disposition;
- Store SKU;
- request ID;
- attempt ID;
- response ID;
- exact Store pin;
- capability/envelope identity;
- reason codes;
- evidence/physical status;
- measured/commissioned status;
- exact raw Store response under an expandable audit disclosure.

The reader-facing statement remains:

> Store supportability is a Store answer. It is not purchase, production release, machine readiness, Cycle Start, or fabrication.

### `STB-F05 — Price Basis / Budgetary Q`

**Current state:** `CURRENT LEGACY REFERENCE ECONOMICS — MIGRATION REQUIRED` when the accepted Store returns a Q.

Expose the currently returned facts rather than hiding them:

- budgetary Q;
- material amount;
- modeled recovery amount;
- modeled cycle time;
- pricing-engine ID/version;
- cycle-model ID;
- exact raw Store request under expandable audit detail.

However, the current D-001 reference estimator predates the new no-placeholder recovery standard. Any unexplained fixed setup assumption in the accepted legacy estimator is therefore a **migration item**, not something the audit is allowed to relabel as compliant.

The Full Audit view shall say so explicitly.

The new standard recovery model remains controlling for future compliant F05 records:

`documented machine/cell recovery cost pool / forecast productive machine hours x modeled occupied cell time`.

### `STB-F06 — Reference Offer`

**Current state:** `NOT IMPLEMENTED / NOT REACHED`

A Store answer and budgetary Q are not silently promoted into an offer.

### `STB-F07 — Order / Acceptance`

**Current state:** `NOT IMPLEMENTED / NOT REACHED`

No order ID or acceptance event is inferred from configuration, Review, or Store support.

### `STB-F08 — Payment Zero Demonstration Receipt`

**Current state:** `NOT IMPLEMENTED / NOT REACHED`

No demo payment is backfilled into an existing Critical Fit chronology.

When Payment Zero is later implemented, it must create an actual durable demonstration receipt tied to an identified demo/account context and exact order. It remains reference/demo commerce and may not imply real processor or bank settlement.

### `STB-F09 — Production Release`

**Current state:** `NOT IMPLEMENTED / NOT REACHED`

Store support, Review, offer acceptance, or payment do not by themselves constitute production release.

### `STB-F10 — Operations Packet`

**Current state:** `NOT IMPLEMENTED AS STANDARD FORM`

`STORE-JOB-001.md` is a valuable operations/closeout donor, including its distinctions among allocation, picking, consumption, staging, and fulfillment.

It is not automatically an issued Operations Packet for a current Critical Fit runtime record.

The future F10 packet must reference the exact WorkPacket rather than redraw or re-author the project.

### `STB-F11 — Machine Admission / Local Readiness`

**Current state:** `NOT REACHED — PHYSICAL EXECUTION ABSENT`

No machine admission, local Ready, local authorization, or Cycle Start is synthesized.

Machine-local authority remains local.

### `STB-F12 — Operation Outcomes`

**Current state:** `NOT REACHED — NO PHYSICAL OR CURRENT JOB-SPECIFIC SIMULATED OUTCOME ATTACHED`

A documentary reference or historical simulation is not execution of the current project revision.

### `STB-F13 — Inspection`

**Current state:** `NOT REACHED — NO EXECUTION TO INSPECT`

No inspection record or measured part outcome is created merely to complete the form set.

### `STB-F14 — Fulfillment / Custody`

**Current state:** `NOT REACHED — NO PHYSICAL PACKAGE`

The Full Audit should show the missing physical states individually rather than collapse them:

- allocated;
- picked;
- consumed;
- staged;
- fulfilled / custody transferred.

The existing Store Job donor distinction remains important:

> **on hand != allocated != picked != consumed != staged != fulfilled**

and:

> **staged does not mean fulfilled**.

### `STB-F15 — Owner Record / Completion Reconciliation`

**Current state:** `PARTIAL — APPLICATION RESULT RETAINED; COMPLETION FORMS NOT YET IMPLEMENTED`

The current application already preserves Review/result chronology and application events.

The Full Audit view must show that physical outcome and pickup/custody remain absent where they are absent.

The Owner Record is not allowed to turn missing commercial or physical events into narrative completion.

---

## 5. Reader presentation rule

The existing Critical Fit screens remain in place.

The `FULL_AUDIT` presentation is an **additional reader layer** on the existing Result surface. It is not a replacement Result page and it does not become a second source of truth.

The initial implementation may use expandable audit detail so that exact request/response evidence is available without forcing raw JSON into the primary reading path.

The visible layer should favor plain language while preserving exact identifiers and bases underneath.

---

## 6. Preservation checks for implementation

Before this reader layer is considered safe:

1. existing page routes remain unchanged;
2. existing Review buttons/actions remain unchanged;
3. existing Store requests and answers remain unchanged;
4. existing calculations remain unchanged;
5. existing Review/Result status logic remains unchanged;
6. existing refusal/unresolved behavior remains unchanged;
7. existing documentary-reference behavior remains unchanged;
8. existing future-chain disclosure remains unchanged;
9. the new audit renders only for `alcove-shelf-blanks`;
10. other project classes render exactly as before;
11. no new completion record is created merely by viewing the audit;
12. syntax/static-host validation passes;
13. any unavailable browser/runtime suite is reported as not run rather than implied to have passed.

---

## 7. Migration work exposed by the audit

The Full Audit is allowed to reveal missing work. It is not allowed to hide it.

Current expected migration items include:

- issue a real F03 WorkPacket form from existing validated project data without duplicating authority;
- replace legacy placeholder-style D-001 recovery assumptions with the new derived machine-recovery method in a separately governed Store/pricing change;
- implement identified account/profile transaction authority;
- implement reference offer/order forms;
- implement Payment Zero demonstration receipts;
- implement production release as its own authority;
- implement Operations Packet without machine-local controller output;
- implement machine admission/readiness/outcome records only when the applicable simulation/physical boundary supports them;
- implement inspection, staging, custody, and closeout only from real corresponding events.

These items are future implementation work. Their absence is part of the truthful current audit.

---

## 8. Non-claims

This reference and its reader layer do not establish:

- a customer contract;
- live commerce;
- payment processing;
- seller-of-record status;
- physical stock allocation;
- production release;
- commissioned D-001 capability beyond existing evidence;
- machine readiness;
- local Cycle Start;
- physical fabrication;
- inspection;
- staging;
- pickup/custody transfer;
- installed-object completion.

The purpose is narrower and stronger:

> **make the current record and every missing downstream authority visible without changing what actually happened.**

**NO BLOOD ON WOOD.**
