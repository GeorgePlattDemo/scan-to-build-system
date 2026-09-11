# Entry to store handoff

**Status:** controlling for this repository.  
**Runtime:** not activated by this package.  
**Store:** virtual store test module. Not live inventory, pricing, scheduling, or fulfillment.

This file specifies how COLD, PLACE, and CONTRACTOR — and the assisted in-store channel — reach the same virtual store and the same machine-family records. The store does not become a second core. The store does not issue fabrication authority.

## What the virtual store is

The virtual store is a **test module** representing declared facts a fulfillment node is willing to stand behind in simulation:

| Store concept | Meaning in this package | Must not be treated as |
| --- | --- | --- |
| Declared material offering | A material class and stock form the node will consider | A SKU, a purchase, or a reservation |
| Declared stock band | A time-bounded simulated quantity or dimension band | Live warehouse quantity |
| Material properties and limitations | Declared handling limits, regulated-product notes, unsuitable uses | A structural calculation or code opinion |
| Machine-family capability | Sheet-stock family or dimensional-stock family the node has declared | Permission to operate a machine |
| Station envelope | Declared working envelope and allowed simulated operations for a station | A controller, G-code stream, or live axis |
| Refusal condition | Named reason the node will not proceed | A suggestion engine |
| Reference-node evaluation disposition | A reference-node statement of accept / defer / refuse after evaluation | A ship date, ticket, or cut list for a physical cell |

These concepts stay separate. A node may handle maple as a class and still have no current stock statement. A node may have a current stock statement and still lack a machine family that can work that form. A node may have the machine family and still refuse the project class.

In the M1.4 candidate test module, the closest activated types are `ProjectClassCapability`, `MaterialHandlingCapability`, `StockSnapshot`, `StationCapability`, `ReferenceCell`, `JobEvaluationRequest`, and `JobEvaluationResult`. This package does not invent a live offering API in front of them.

## What the machines are

The machines are **not fully integrated**. This package uses placeholders and declared interfaces only.

The patents distinguish a machine for sheet-material stock from a machine for dimensional wood stock. This package is **related to** that distinction. It does not claim that the test module practices the tandem combination.

| Family | Role | Current M1 posture |
| --- | --- | --- |
| Sheet-stock | Simulated operations on sheet goods | Candidate sheet envelope may support simulation after sealed accept |
| Dimensional-stock | Simulated operations on dimensional lumber | Node evaluation may accept; simulation authorization stops with `DIMENSIONAL_M1_ENVELOPE_NOT_ACTIVATED` |

A mixed sheet-plus-dimensional job requires both families. `MIXED_FORM_NOT_SUPPORTED` remains a refusal even if both families are declared, until a later activation explicitly supports mixed jobs. A one-machine node is not the tandem combination described by the patent disclosures.

Do not implement machine control, G-code transmission, production scheduling, or live inventory in this pass.

## Common handoff object (conceptual)

Every path, before it may ask the store anything consequential, must be able to state:

1. **Actor and entry context** — COLD, PLACE, CONTRACTOR, or IN_STORE (channel, not a fourth core).
2. **Holder** — who controls the record that will be written.
3. **Permission** — disclosed use of the supplied information, including withdrawal.
4. **Declared need** — owner language, becoming a `DeclaredRecord` in the governed core. This package does not redefine that object.
5. **Project class** — a bounded class, not a free design. Current orientation classes: `interior.fit_to_opening.shelving` (sheet), `interior.cleat.blocking` (dimensional), `interior.panel.blank` (sheet).
6. **Observations** — measurements with units and provenance, or an explicit gap. Instrument class never closes a gate by itself.
7. **Material class and stock form** — sheet or dimensional. Not a SKU.
8. **Requested operations** — from a published allowlist. Unknown operations remain unresolved and block.
9. **Unresolved list** — never dropped, never silently filled.

That bundle is the front-door product. The store evaluates it. The store does not complete it.

## Handoff sequence

All remote paths and the in-store channel use the same sequence after the front door has a bounded request:

```
declared need
    → ProjectInstance (holder-controlled)
    → Observations / capture refs (or explicit missing)
    → MaterialSpec (class and form, not SKU)
    → draft WorkPacket (does not authorize motion)
    → store evaluation (JobEvaluationRequest → JobEvaluationResult)
    → M1 gates (GateResult set)
    → INFORM, DEFER, or REFUSE
    → SimulationAuthorization only if policy-constructed from the actual GateResult set
    → simulated events
    → OutcomeRecord
```

`JobEvaluationResult` is not a `GateResult`. A `GateResult` is not a `SimulationAuthorization`. A `SimulationAuthorization` is not execution. Copied evidence JSON is not a handle.

On the node-evaluation step, `simulationEligibility` remains `not_evaluated`. Simulation is a later, separate request that requires a sealed accept.

## Path differences at the store boundary

| Topic | COLD | PLACE | CONTRACTOR | IN_STORE |
| --- | --- | --- | --- | --- |
| Opening record | None | Existing `ProjectInstance` and prior outcomes | Job shell and/or holder-shared project | Walk-in need, possibly with staff-assisted capture |
| What the store may assume | Nothing about the home, the actor, or prior work | Only what is on the holder-controlled record | Only what is supplied, permissioned, and mapped | Only what is captured or confirmed in the visit, plus any presented holder record |
| Staff assistance | None | None, unless the holder later visits | None, unless the contractor is physically present | Allowed: clarification, richer scanning, matching |
| Silent substitution | Forbidden | Forbidden | Forbidden | Forbidden |
| Gate bypass | Forbidden | Forbidden | Forbidden | Forbidden |
| Price | Deferred / rejected | Deferred / rejected | Dropped on ingest; not returned as a quote | Deferred / rejected |
| Unavailable hardwood | INFORM or REFUSE by name | Re-evaluate the stalled state; do not invent an alternative | REFUSE or DEFER by name; do not substitute species | Same; staff may explain, not override |

## What the store may return

Returned information is always a **named evaluation**, never an invented product.

| Return | When | What it is not |
| --- | --- | --- |
| INFORM | The request is understood, and the next act is education, a missing-field list, or a pointer to an in-store visit | A recommendation engine |
| DEFER | A handled class or declared capability exists, but current evidence is missing, stale, or not yet activated | A promise that stock will arrive |
| REFUSE | Project class, material class, form, envelope, operation, mixed-form, live-motion, or safety rule fails | An invitation to keep designing until it fits |
| Sealed accept + optional simulation request | Every required condition for simulated evaluation has passed | Production authorization |

Owner-readable explanation and technical explanation travel together. A refused hardwood request names the class and the reason. It does not offer oak because cherry is unavailable. It does not widen a board. It does not switch sheet work onto the dimensional family.

## Machine-capability interaction

The store consults machine-family records as **declared interfaces**:

- Does a sheet-stock station exist for this node?
- Does a dimensional-stock station exist?
- Does the requested form match the assigned family?
- Are the requested operations on that family's allowlist?
- Are required datums present?
- Is the bound envelope version the loaded envelope version?

If capability is absent, the outcome is a recorded refusal or deferral. If the dimensional family is declared but the M1 envelope is not activated, the job may pass node evaluation and still stop before simulation authorization.

Placeholders permitted in this pass:

- `StationCapability` records already in the reference-node test module.
- Envelope identifiers already bound in M1 (`stb:envelope:cell.sheet.v1` and the synthetic dimensional test boundary).
- Operation tokens already used in simulation (`simulate_crosscut`, `simulate_shelf_blank`, `simulate_rip`) plus any candidate tokens that remain unresolved until a published allowlist exists.

Do not add a fourth machine-capability class. Do not implement a virtual controller.

## Failure and refusal at the handoff

These codes already exist in the reference-node ports and must be preserved, not paraphrased into softer UX copy:

| Code | Typical front-door reading |
| --- | --- |
| `PROJECT_CLASS_UNSUPPORTED` | That bounded class is not in the consideration set. |
| `MATERIAL_CLASS_UNSUPPORTED` | That material class is not handled. |
| `STOCK_NOT_AVAILABLE` | Current snapshot is explicitly unavailable. |
| `STOCK_DIMENSION_UNAVAILABLE` | Requested usable dimensions exceed the offering. |
| `STOCK_EVIDENCE_MISSING` | Class is handled; no current stock statement. |
| `STOCK_SNAPSHOT_STALE` | Named or only snapshots are expired. |
| `QUANTITY_EVIDENCE_MISSING` | Quantity was requested; snapshot omits quantity. |
| `QUANTITY_UNSATISFIED` | Requested quantity exceeds the simulated statement. |
| `OPERATION_UNSUPPORTED` | Operation is not on the station allowlist. |
| `ENVELOPE_EXCEEDED` | Station and axis identified. |
| `FORM_MISMATCH` | Requested form does not match the offering form. |
| `MACHINE_MISSING` | Required sheet or dimensional machine is not installed. |
| `MACHINE_FORM_MISMATCH` | Assigned machine does not accept the stock form. |
| `DIMENSIONAL_M1_ENVELOPE_NOT_ACTIVATED` | Dimensional capability is fixture-declared only. |
| `REMOTE_LIVE_MOTION_COMMAND_REFUSED` | I0 path. No live motion. |
| `MIXED_FORM_NOT_SUPPORTED` | Sheet and dimensional in one job, still refused. |

A front door that hides these codes, or that auto-selects a different material, has left the architecture.

## Demand as architecture at this boundary

Each store interaction is a **recorded inquiry**, not covert tracking.

Record, when permission allows:

- stated need;
- project class;
- information requested and supplied;
- information still missing;
- the INFORM / DEFER / REFUSE outcome and the named code;
- what remains unresolved.

Do not record, infer, share, or aggregate without an explicit rule:

- browsing that never became a declared need;
- “customers like you”;
- price sensitivity;
- inferred household occupancy or income;
- contractor client lists beyond the permissioned job;
- GPS trails from field apps;
- biometric or continuous-location streams.

Recurring unresolved requests may later inform project-library additions, material-property research, local stock offerings, workforce training, machine-capability changes, better instructions, or improved refusal explanations. Those are **future mechanisms**. This pass does not activate an improvement registry or a participant aggregate.

## What this handoff must not do

- Authorize physical fabrication or live machine motion.
- Treat a store accept as a `GateResult` or a `SimulationAuthorization`.
- Collapse offering, availability, and capability.
- Route sheet work to a dimensional family, or the reverse, to “make it work.”
- Invent structural adequacy, first-fit, code compliance, or a millwork alternative.
- Accept a caller-created eligibility statement. The caller may not declare eligibility.
