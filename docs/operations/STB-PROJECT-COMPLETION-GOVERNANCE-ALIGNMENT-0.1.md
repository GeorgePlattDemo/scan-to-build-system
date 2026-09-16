# STB Project Completion Governance Alignment 0.1

**Status:** controlling documentation candidate; docs only; no runtime behavior changed  
**Companion standard:** `docs/operations/STB-STANDARD-FORMS-AND-COMPLETION-PROTOCOL-0.1.md`  
**Branch:** `docs/project-completion-protocol-0.1`  
**Parent baseline:** `GeorgePlattDemo/scan-to-build-system@138d0c01b62193012e5c5c891723b7dd47407119`  
**Safety invariant:** **NO BLOOD ON WOOD**

---

## 1. Purpose

This document records how the new standard project-completion forms fit the existing Scan-to-Build governance architecture.

The completion protocol is not a new parallel architecture. It is a downstream standardization layer that must remain subordinate to the existing system boundaries already established in the application, Store integration, governed-reference material, machine/cell planning, and Owner Record rules.

The controlling idea is:

> **New local roads may be added, but they must enter the existing interstate through the established ramps.**

No form, pricing rule, payment demonstration, operations packet, fulfillment event, or project-specific presentation may bypass the existing authority chain.

---

## 2. Existing controlling boundaries preserved

The completion protocol inherits and shall not weaken these existing boundaries.

### 2.1 Evidence does not become verified fact by display

Original sources, observations, corrections, derived geometry, configuration, and confirmed project definition remain distinguishable.

A screen rendering does not promote the authority of the underlying evidence.

### 2.2 Configuration does not create Store authority

A project may describe material, geometry, features, parts, and desired operations.

Only Store evaluation against a declared Store state may establish Store supportability for the exact request.

The application shall not copy a Store rule into local UI logic and then treat the copied rule as Store authority.

### 2.3 Store supportability does not create fabrication authority

`SUPPORTABLE` means the Store can answer the bounded Store question under the declared envelope/evidence basis.

It does not mean:

- production release;
- machine readiness;
- local Cycle Start;
- physical execution;
- inspection success;
- fulfillment.

### 2.4 Price does not create commercial acceptance

A budgetary/reference price is an economic result.

It does not create an offer, acceptance, order, payment, or release unless the corresponding durable records are created.

### 2.5 Payment does not create production release

Payment Zero may demonstrate transaction state.

A processed demo payment may satisfy one commercial prerequisite, but it does not itself authorize production.

Production release remains a separate authority record.

### 2.6 Production release does not create machine readiness

A released job may enter the production path only to the degree permitted by the applicable Store, operations packet, machine admission, and local readiness rules.

The machine/cell site retains authority over:

- installed tooling;
- workholding/reference state;
- actual machine envelope;
- local offsets/transforms;
- feeds/speeds;
- guards/interlocks;
- local Ready state;
- local Cycle Start;
- faults/stops;
- physical outcome evidence.

### 2.7 Application and Store do not emit machine-local control

The application and Store may carry machine-neutral work requirements.

They shall not emit or represent as normal project/order output:

- G-code;
- controller code;
- servo coordinates;
- I/O sequences;
- tuning values;
- remote Cycle Start;
- machine-local safety bypasses.

### 2.8 STOP and UNRESOLVED are durable outcomes

A STOP, refusal, or unresolved condition is not a UI failure to hide.

It remains attached to the exact project/request/revision that produced it.

A later revision does not erase the earlier result.

### 2.9 Owner Record records actual events only

The Owner Record may preserve definitions, requests, decisions, Store answers, demo/reference transaction events, simulated events, and physical events, but each must retain its actual evidence class.

The Owner Record shall not convert:

- reference into measured;
- simulated into physical;
- planned into performed;
- staged into fulfilled;
- requested into completed.

---

## 3. Existing repository surfaces this protocol must align with

This document does not replace the following existing sources. Implementations shall reconcile against them before changing runtime behavior.

### Application / durable records

- `docs/application/CURRENT-APP-SUMMARY.md`
- `apps/stb/browser/data/repository.mjs`
- existing evidence / observation / candidate / Store request / Review / Result / Record continuity

The current application baseline already establishes immutable/durable record behavior and explicitly records that live order/payment/fulfillment/physical execution were absent at the accepted source baseline.

### Operational closure

- `work/capability-bridge/OPERATIONAL-CLOSURE-0.1.md`

This remains controlling for:

- Store refusal semantics;
- tab-policy custody;
- decision-level audit versus machine telemetry;
- pricing downstream of Store capability;
- provisional material handling;
- bounded Store answer projection;
- refusal to infer fabrication prices where Store has not earned them.

### Future chain

- `apps/stb/browser/ui/future-chain.mjs`

Its distinction among Definition, Commercial, Payment, Fulfillment, and Machine domains remains conceptually controlling.

The new forms make that chain durable and auditable; they do not collapse those domains into one giant status.

### Store job / fulfillment donor

The Store repository's existing `STORE-JOB-001.md` remains a primary donor for:

- order-to-WorkPacket relationship;
- allocation and pick distinctions;
- machine-neutral work handoff;
- part identity and labeling;
- staging;
- closeout;
- the invariant that `staged` does not mean `fulfilled`.

### Machine planning

- `work/machines/staging/SHEET-MACHINE-STAGING-0.1.md`
- `work/machines/engineering/sheet/SHEET-MACHINE-BUILD-0.1.md`
- dimensional-machine engineering/staging sources already accepted in the repository

These remain controlling for the distinction between software/reference capability and physically established machine capability.

The completion protocol may carry requested operations and machine-neutral operations packets, but it shall not silently widen a physical machine envelope.

---

## 4. Decisions now committed as new completion-policy candidates

The following decisions were made after reviewing the current application, Store, pricing, machine, and project surfaces.

They are new reference-policy candidates. They are not retroactive claims that historical jobs already used them.

### 4.1 One record spine, multiple presentation depths

The standard forms protocol defines `STB-F00` through `STB-F15` as the common downstream record spine.

Presentation may be:

- `FULL_AUDIT`;
- `STANDARD`;
- `SUMMARY`.

The underlying record type does not become weaker merely because the UI is shorter.

**Rule:** no abbreviated record types; only abbreviated views.

### 4.2 Critical Fit is the full reference implementation

Project-facing name: **Critical Fit**  
Descriptive subtitle: **alcove shelf insert**

Critical Fit will be the first project brought through the complete forms protocol with the most explicit audit presentation.

Its purpose is to prove the full chain once at visible depth.

Later jobs may use `STANDARD` presentation while retaining the same underlying record discipline.

### 4.3 No naked placeholders

Every consequential number must carry one of these basis classes:

- `OBSERVED`;
- `DECLARED_POLICY`;
- `CALCULATED`;
- `REFERENCE_MODEL`;
- `MEASURED`;
- `UNRESOLVED`.

A placeholder amount shall not remain merely because it produces a complete-looking total.

The previously used unexplained `$35 setup` amount is not adopted as a controlling standard.

### 4.4 Machine recovery is derived

The machine-recovery method is based on a documented machine/cell recovery cost pool divided by forecast productive machine hours, multiplied by modeled occupied cell time for the job.

Operation count affects recovery through modeled time contributions, not through an unexplained complexity multiplier.

Recognized cost-accounting sources may be cited as methodological references for the choice of machine-hour/process-time bases, but they do not prescribe the Store Zero dollar rate.

The completion standard cites:

- 48 CFR 9904.418 / CAS 418;
- DCAA Contract Audit Manual, Chapter 6.

No claim is made that Store Zero or 3D Solutions is legally subject to those federal cost-accounting standards.

### 4.5 Sheet-combination straight-cut policy

Policy ID:

`SZ-SHEET-COMBO-STRAIGHT-CUT-10`

Reference policy:

- `FULL_STRAIGHT_CUT` on an admitted sheet combination job;
- `$10.00` per admitted full straight cut;
- the cut must run boundary-to-boundary under the applicable envelope;
- no partial terminating straight cut;
- no tabs on the full straight cut;
- partial request is refused;
- tabbed straight-cut request is refused;
- orientation/direction must still be supported by Store/machine evidence;
- policy must declare whether machine recovery is included or additive so recovery cannot be silently double-counted.

The `$10.00` amount is `DECLARED_POLICY`, not an industry-standard charge.

### 4.6 Excess-material / waste-disposal policy

Policy ID:

`SZ-WASTE-20-5`

Reference policy:

- calculate unconsumed purchased material by SKU;
- sheet material uses area as the default consumption basis;
- dimensional material uses length unless another declared basis applies;
- intentional returned components are project output, not waste;
- customer-retained remnants are not waste;
- if more than 20% of a purchased material SKU remains and the customer elects not to take it, add one `$5.00` `WASTE_DISPOSAL` charge per job;
- exactly 20% does not trigger the fee;
- customer takes qualifying excess -> no disposal fee.

The `$5.00` amount is `DECLARED_POLICY`, not an industry-standard disposal charge.

### 4.7 Anonymous exploration versus transaction authority

Anonymous users may:

- browse;
- select a bounded project;
- configure;
- inspect geometry;
- submit a Store evaluation;
- receive a budgetary/reference price.

Anonymous users may not:

- accept an offer;
- create an order;
- process Payment Zero;
- issue production release;
- create machine authority.

An account/profile context is required before commercial acceptance/order state.

A demo account such as Sarah must be represented as an account/profile record rather than as an anonymous visitor who silently gains transaction authority.

### 4.8 Payment Zero is durable reference/demo commerce

Payment Zero may demonstrate:

`order created -> payment requested -> payment processed -> payment received -> funds available`

Each transition must have an explicit record/basis.

A Payment Zero receipt must state that it is a reference/demo transaction and must not claim that a real processor, card network, bank transfer, or live funds movement occurred.

Payment Zero does not create production release by itself.

### 4.9 Operations Packet does not replace the WorkPacket

The WorkPacket remains the validated machine-neutral definition.

The Operations Packet references the exact WorkPacket and adds the transaction/Store/release facts necessary to move the ordered work toward a machine/cell.

It shall not redraw, reinterpret, or silently simplify the project definition.

### 4.10 No requested operation may disappear

Every consequential requested operation gets an explicit Store/order disposition.

A job cannot be called fully supported merely because one operation is supported while another requested operation was omitted from the downstream card.

Allowed operation dispositions remain explicit, e.g.:

- `SUPPORTED`;
- `UNRESOLVED`;
- `REFUSED`;
- `NOT_REQUESTED`.

### 4.11 Full accounting does not require successful fabrication

A project may have a complete audit trail while ending at:

- Store refusal;
- unresolved material;
- qualified-review requirement;
- missing commercial prerequisite;
- unreleased state;
- machine refusal;
- simulated completion only.

Unreached downstream forms remain explicit rather than disappearing.

---

## 5. Sarah / S-001 project decisions preserved without overclaiming capability

The current Sarah playhouse narrative is useful because it establishes desired outcome and material disposition.

The machine-facing record must remain operation/geometry based.

Current intended project facts include:

- one 48 x 96 in reference sheet;
- nominal 1/2 in plywood reference material;
- canonical centered S-001 work field remains governed by the accepted class/envelope definitions until separately revised;
- primary routed arched opening/profile with retained tabs according to the applicable rule/policy;
- retained center material is intentional project output, not automatic waste;
- two requested full straight sheet cuts may be part of the combination job only when Store/capability coverage exists for them;
- large returned remnants remain customer property when the customer elects to retain them;
- owner-side tab removal / hardware / installation remain outside the fabrication order unless separately added and supported.

The application may explain the human outcome on the Scan/Intent page.

The machine/operations view should reduce that outcome to:

- material identity;
- bounded geometry;
- operation sequence;
- retention requirements;
- explicit full straight cuts;
- labels/part identity;
- applicable support/refusal status.

The machine does not need to know that the center may become shutters. It needs to know the accepted operation and part/output definitions.

The current S-001 reference proof shall not be silently widened to claim physical saw capability merely because the project now requests straight cuts.

---

## 6. Migration rule for existing projects

Existing jobs shall be brought to the standard only after the standard is accepted.

Migration is evidence-preserving, not history-rewriting.

### 6.1 Backfill only what can be supported

A historical/current project may be mapped into the new forms using existing records and repository evidence.

Do not create fictitious historical payment, release, execution, inspection, staging, or fulfillment events merely to make all forms green.

### 6.2 Missing downstream events remain explicit

Use states such as:

- `NOT_REACHED — commerce not implemented at this project version`;
- `UNRESOLVED — process economics not established`;
- `REFERENCE_ONLY — no physical execution represented`;
- `NOT_APPLICABLE — operation not part of ordered scope`.

### 6.3 Earlier STOPs remain visible

When a later project revision resolves a previous blocker, preserve both:

- the earlier stopped/refused/unresolved record;
- the later revised record and new outcome.

### 6.4 Do not standardize by flattening project identity

Project-facing identities may remain meaningful.

For example:

- **Critical Fit** remains the project/library identity;
- `alcove shelf insert` is descriptive content;
- Store/machine class IDs remain technical identities;
- record forms bind those identities without replacing the user-facing project name.

---

## 7. Governance alignment matrix

| New completion surface | Must inherit from | May add | Must not do |
| --- | --- | --- | --- |
| `F00 Actor/Account` | entry/actor context | transaction eligibility | infer identity or authority |
| `F01 Intent/Evidence` | evidence custody | completion-specific refs | rewrite source evidence |
| `F02 Definition` | project/class/config rules | completion scope | create Store authority |
| `F03 WorkPacket` | existing packet/governance rules | standardized refs | emit controller code |
| `F04 Store Evaluation` | exact Store pin/envelope | operation coverage projection | copy/override Store authority |
| `F05 Price Basis` | Store supportability + pricing sources | derived recovery / declared policies | price unsupported work as supported |
| `F06 Offer` | account + exact definition + price | offer identity | pretend Store response alone is contract/order |
| `F07 Order` | accepted offer | order identity/election | permit anonymous transaction |
| `F08 Payment Zero` | order/account | demo payment chronology | claim live money movement |
| `F09 Production Release` | commercial prerequisites + governance | release record | imply machine readiness |
| `F10 Operations Packet` | WorkPacket + Store/order/release | execution handoff facts | redraw/reinterpret project |
| `F11 Machine Admission` | machine-local envelope/readiness | local admission evidence | remote Cycle Start |
| `F12 Operation Outcomes` | machine-local execution evidence | outcome records | promote planned/simulated to physical |
| `F13 Inspection` | required dimensions/features/outcomes | inspection evidence | claim unperformed measurement |
| `F14 Fulfillment/Custody` | Store job/closeout semantics | staging/notice/custody events | equate staged with fulfilled |
| `F15 Owner Record` | all prior immutable records | reconciled chronology | invent missing events |

---

## 8. Required implementation discipline

Before runtime implementation of this standard:

1. verify exact repository/branch/commit;
2. map each proposed form to existing durable objects before creating new objects;
3. prefer extending shared contracts over project-specific cards;
4. do not widen Store or machine envelopes to make a demo complete;
5. add negative/refusal tests for each new capability or policy;
6. keep pricing-model assumptions inspectable;
7. preserve exact source and Store pins in audit records;
8. preserve account/order/payment/release/machine boundaries in tests;
9. do not rewrite historical records to the new standard without evidence;
10. implement Critical Fit first as the full reference path;
11. use the same underlying record spine for later projects with reduced presentation depth;
12. inspect diffs for unrelated loss before any commit/merge.

---

## 9. Acceptance test for the new standard

The standard is working when a cold reviewer can start from one project and answer, without relying on conversation context:

- who the actor/account was;
- what the user wanted;
- what evidence was supplied;
- what exact definition was confirmed;
- what WorkPacket represented it;
- which Store/version evaluated it;
- which operations were supported, unresolved, or refused;
- how every consequential price line was derived or declared;
- what offer was presented;
- who accepted it;
- what order resulted;
- what demo/reference payment event occurred;
- whether production release was issued;
- what operations packet entered the production path;
- whether a machine admitted it;
- what was simulated or physically executed;
- what was inspected;
- what was staged;
- what was transferred to the customer;
- what remnants/waste disposition applied;
- which events did not occur;
- what the Owner Record retained.

If a claimed state cannot be traced to its basis, the standard has not been satisfied.

---

## 10. Current posture

This governance-alignment document and the companion standard forms protocol are documentation candidates only.

They do not by themselves:

- change application runtime behavior;
- change Store code/catalog/envelopes;
- create S-001 straight-cut support;
- create a new machine-recovery dollar rate;
- create live commerce;
- process real payment;
- issue real production release;
- commission a machine;
- authorize powered testing;
- represent physical fabrication.

The next implementation step, after acceptance of the standard, is to map **Critical Fit** against `STB-F00` through `STB-F15` and identify which objects already exist, which need extension, and which are genuinely absent.

**NO BLOOD ON WOOD.**
