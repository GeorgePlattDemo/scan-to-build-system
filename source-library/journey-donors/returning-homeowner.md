# PLACE entry (returning homeowner / project owner)

**entryContext:** `PLACE`  
**Status:** controlling for this repository. PLACE is the only entry context exercised by the current M1 fixture.  
**Actor:** returning homeowner or project owner with at least one holder-controlled project record.

This path resumes work the holder already declared. It does not silently restart, and it does not silently substitute. Stalled work is an explicit state.

## Actor

The holder of a home or project record. They may be the homeowner, or another project owner the record names as holder. A contractor is not this actor; a contractor uses CONTRACTOR, even when working on this home.

Competency: they are expected to recognize their own project. They are not expected to know gates, envelopes, or stock-form families.

## Opening condition

At least one stored `ProjectInstance` (or a conceptual local stand-in that will become one) exists for this holder. Typical cases:

- a simulated project that completed;
- a project that was refused;
- a project that was deferred and left waiting;
- a draft that never reached evaluation;
- a project shared, or previously shared, with a contractor or yard.

M1 identity is not a consumer account system. The M1 fixture is PLACE-context built-in shelving. Front-door persistence (for example a device-local draft) is a candidate convenience, not governed identity.

## Information already available

From the holder-controlled record only:

- prior `DeclaredRecord` text and kind;
- `ProjectInstance` state;
- observations and capture refs already bound;
- prior `MaterialSpec`;
- prior `WorkPacket` versions and `priorRefusalIds`;
- prior `GateResult` set and unresolved list;
- prior `OutcomeRecord` if any;
- permission / share state previously recorded;
- waiting-on codes, if the project stalled.

The path may not fetch “what the yard now has” as if it were already on the record. Current store state is a new inquiry.

## Information the actor must provide

| Field | Why |
| --- | --- |
| Which project they are resuming | Prevents mixing records |
| Whether they are inspecting, revising, or re-submitting | Re-submit is explicit. Opening a project is not re-evaluation. |
| Any revised declared need | New declaration; original preserved |
| Any new measurements | New `Observation`s; old ones remain in history |
| Express permission if they want a notice later | No notice without permission |
| Share or withdrawal decision, if changing access | Contractor or yard access is permissioned |

They must not be asked to re-enter every field that is already on the record unless they choose to revise it.

## Allowed records

Same governed objects as COLD, plus history:

- original `DeclaredRecord` retained;
- new `DeclaredRecord` for a revision (kind `intent` when they mean to proceed);
- new `WorkPacket` **version** if the request changes — packets are not overwritten;
- share-state / consent records as holder-controlled permission, not as production authority;
- stalled-state as an explicit project state, not a hidden flag.

Share values used in the prior overlay remain useful as **candidate** permission labels: `private` | `shareWithContractor` | `shareWithYard`. They write permission. They do not confer production authorization, inventory reservation, or price.

## Unavailable assumptions

- That a prior deferral means stock is now available.
- That a prior simulation handle still works after reload.
- That a prior material class may be swapped for whatever is currently declared.
- That “customers like you also chose…” is allowed.
- That a modeled suggestion from local history is demand, a recommendation, or a price.
- That sharing with a contractor makes the contractor the holder.
- That the home has not changed since the last measurement.
- That PLACE proves code compliance or first-fit of an installed object.

## Stalled projects are explicit states

Do not hide a blocker in a spinner, a cache, or a background job.

| State | Meaning | waiting-on (examples; use exact codes when they apply) |
| --- | --- | --- |
| `planned` | Declared, not yet evaluated | — |
| `pending_evaluation` | Submitted, evaluation not finished | evaluation not yet recorded |
| `accepted_awaiting_simulation` | Node or gates allowed a later simulation request | holder action to request simulation |
| `simulated` | Simulation ran; see `OutcomeRecord` | unresolved list may still be non-empty |
| `deferred` | Named deferral | `STOCK_SNAPSHOT_STALE`, `STOCK_EVIDENCE_MISSING`, `QUANTITY_EVIDENCE_MISSING`, `UNRESOLVED_CONDITION_PRESENT`, `DIMENSIONAL_M1_ENVELOPE_NOT_ACTIVATED` |
| `refused` | Named refusal | waiting-on empty; refusal code is the record |
| `abandoned` | Holder stopped | — |

Refused rows have empty waiting-on. The refusal code stays visible. Deferred rows must show the code that would have to change.

A previous blocker has **not** changed until the holder re-submits and the core says so.

## First user-facing action

Land on the holder’s project list. Do not land on a blank COLD welcome, and do not land inside a contractor dashboard.

List columns:

- class / template;
- state (from the table above);
- last update;
- unresolved count (**never hidden**);
- waiting-on codes;
- share badge.

A suggestions panel, if present, is collapsed by default and must carry `assertionBasis: modeled` from **this holder’s local history only**. Header copy: **Modeled from your local history. Not demand. Not a recommendation.** Never price, never availability, never “customers like you,” never forest-sector volume as supply.

## Possible next actions

- Inspect current state, including unresolved and prior refusals.
- Resume at the last incomplete step.
- Revise declared requirements (new declaration, original preserved, diff shown).
- Re-submit explicitly to see whether a blocker changed.
- Duplicate as a new project (new ids).
- Change permission (private / share with contractor / share with yard) or withdraw it.
- Export `OutcomeRecord` if present.
- Request simulation only when the current version is eligible.
- Abandon.

After reload, simulation handles are dead. Replayed evidence JSON alone fails as forged authorization.

## Handoff to the common core

PLACE already has core objects. The front door loads them, shows them, and — only on explicit holder action — sends a new version through the same evaluator as COLD and CONTRACTOR.

Entry context `PLACE` does not bypass provenance, verification, consent, gate, packet, or authorization requirements. `G-CONSENT` still requires owner authority on a make path.

## Store interaction

Inspecting a project does **not** query the store. Re-submitting does.

When the holder re-submits:

- offering, stock band, and machine capability are consulted as separate facts;
- a new `StockSnapshot` (or its absence) is a new statement, not a quiet update to the old packet;
- unavailable hardwood is a new named DEFER or REFUSE, not a swap to a different species;
- prior simulated fulfillment status is historical.

If the holder has expressly permitted a **type** of notice (for example, “tell me if this deferred stock statement is later declared current”), the system may send that type of notice and no other. No permission, no notice. This package does not implement the notice channel.

## Machine-capability interaction

Same families as every path. A PLACE project that was sheet remains sheet unless the holder explicitly revises the class and form. The path must not “help” by moving a shelf blank onto a dimensional station.

Dimensional M1 envelope remains not activated. Resume does not activate it.

## INFORM / DEFER / REFUSE

| Outcome | Conditions (PLACE) |
| --- | --- |
| INFORM | Holder is inspecting; missing permission for a requested notice type; they asked whether a blocker changed but have not re-submitted; modeled history is shown with its limitation; they need a diff of what they just revised. |
| DEFER | Re-submit still sees missing/stale stock evidence, missing quantity evidence, unresolved required condition, or dimensional envelope not activated. Prior deferral codes may repeat; they are current only because re-evaluation said so. |
| REFUSE | Re-submit fails class, material, form, envelope, mixed form, or live motion; holder tries to overwrite history; a contractor-only change arrives without holder acceptance; pasted simulation JSON; request to treat last year’s accept as today’s cut ticket. |

## Demand as architecture (PLACE interactions)

| Interaction | Stated need | Class | Requested | Supplied | Still missing | Stop | Outcome | Learnable later | Must not retain without a rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| List | Resume my work | From record | List | Holder records | None for listing | — | INFORM (inspect) | Which states confuse holders | Other holders’ projects |
| Inspect refused | Why it stopped | From record | Explanation | Prior codes | Whatever the code names | No silent retry | INFORM | Refusal text quality | Blame the holder |
| Revise dimensions | Different opening | Same class | New observations | New numbers | Verification | Show diff; await submit | INFORM until submit | Common revisions | Inferred remodel of the whole house |
| Re-submit after deferral | Is cherry available yet? | shelving | New evaluation | Prior spec | Current snapshot | Still unavailable | DEFER or REFUSE | Recurring unavailable class | Notice without permission |
| Share with contractor | Let my carpenter see this | From record | Permission change | Holder action | Contractor identity | Withdrawal must work | INFORM | — | Contractor’s other clients |
| Request notice | Tell me if the blocker moves | From record | A specific notice type | Express permission | The event itself | No permission → no notice | INFORM | — | Other notice types |
| Replay old handle | Run it again | From record | Simulation | Copied JSON | Fresh handle | Forged | REFUSE | Handle-lifetime UX | Treat JSON as a secret worth stealing in logs |

## Unresolved information

PLACE must show the unresolved count on the list and the full list on the detail. `STRUCTURAL_SPAN_NOT_EVALUATED` remains visible on the Project A / shelf class. Clearing a stall by hiding unresolved items is forbidden.

## Owner of the next action

| Stop | Next-action owner |
| --- | --- |
| Draft incomplete | Holder |
| Deferred on stock evidence | Holder to re-submit; store test-module to publish a current statement |
| Refused on class or envelope | Holder, by revising the declaration or stopping |
| Share / withdrawal | Holder |
| Notice | Holder (permission) and, later, a separate notice mechanism (not in this pass) |
| Forged handle | Holder to request a new simulation through the core |
| Dimensional envelope | Governed-reference maintainers |

## What is recorded for future improvement

With permission: that a stalled state was inspected; that a holder re-submitted; the code that repeated; the fields they revised (not a covert diff of the home). Recorded inquiries and resolution outcomes only.

## What is explicitly not recorded

- Suggestion clicks as if they were demand.
- Notice-type interest the holder did not permit.
- Contractor viewing behavior, beyond what the holder’s share log requires.
- Cross-holder aggregates.
- “The home is being remodeled” inferred from dimension changes.

## Preserve the original record and show what changed

Revision rules:

1. Do not overwrite the original `DeclaredRecord`.
2. Do not mutate a validated `WorkPacket` in place; issue a new version.
3. Show the holder a diff of declared need, measurements, material class, and form.
4. Never silently substitute new material, dimensions, or capability.
5. `priorRefusalIds` travel forward.

## Acceptance sketch (documentation, not a runtime test)

List a refused project and a simulated one. Open the refused project. See the code and the unresolved count. Resume. Still see `STRUCTURAL_SPAN_NOT_EVALUATED` on the shelf / Project A class. Suggestions, if any, never show a price. A prior deferral is not treated as current availability without an explicit re-submit.
