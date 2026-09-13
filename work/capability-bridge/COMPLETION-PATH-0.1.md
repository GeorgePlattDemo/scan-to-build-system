# Global Project Completion Path 0.1

**Status:** candidate operational contract  
**Scope:** all bounded Scan-to-Build projects routed through D-001, S-001, or a later bounded cell capability  
**Safety invariant:** **NO BLOOD ON WOOD**

## 1. Purpose

A machine result is not the same thing as a completed customer project.

Scan-to-Build machines are deliberately bounded production augmentation. They are not required to perform every possible operation, tool change, setup, finish step, packaging step, or delivery task.

The completion path exists to make the remainder explicit rather than hiding it.

```text
PROJECT DEFINITION
        ↓
STORE / MATERIAL / CAPABILITY
        ↓
PRIMARY MACHINE OPERATIONS
        ↓
MACHINE OUTCOME
        ↓
SECONDARY OPERATIONS / ASSIGNMENTS
        ↓
INSPECTION / COMPLETION CHECK
        ↓
LABEL
        ↓
STAGE
        ↓
PICKUP or DELIVERY
        ↓
CUSTODY TRANSFER
        ↓
PROJECT CLOSEOUT RECORD
```

This path does not broaden Store support, machine envelopes, controller authority, or physical execution authority.

## 2. Core rule: partial machine work stays partial

If the finished requirement is a `3/8 in` hole and D-001 can only produce a `3/16 in` pilot at that location, the project is not allowed to say `hole complete`.

The truthful record is:

```text
FINISHED REQUIREMENT
3/8 in hole

PRIMARY MACHINE CONTRIBUTION
3/16 in pilot

RESIDUAL OPERATION
final drill to 3/8 in
```

The residual operation must then receive an explicit completion disposition.

No machine limitation may disappear by wording.

## 3. Two decisions are required for a residual operation

A secondary operation is not resolved merely because the customer clicks an option.

### Customer decision

The customer may choose only from options that the project is permitted to offer, for example:

- `YARD_SECONDARY`;
- `CUSTOMER_COMPLETES`;
- `THIRD_PARTY_COMPLETES`.

The customer may accept or decline an offered option.

The customer does **not**:

- change Store disposition;
- change a machine envelope;
- create yard capability;
- waive a refusal;
- authorize physical machine motion.

### Yard / cell-steward decision

After the customer chooses an option, the yard must independently accept or reject the completion plan.

This applies even when the customer proposes to finish the remaining work personally.

The yard is allowed to say, for example:

> We will hand off this part with the 3/16 in pilot and the final 3/8 in drill assigned to you.

or:

> We do not accept this project for handoff in that incomplete state.

For yard-performed secondary work, an actual declared secondary-service reference is required. The completion layer may not invent one.

## 4. Authority model

The current application contract uses three roles.

| Role | Positive authority | Explicitly not allowed |
| --- | --- | --- |
| **CUSTOMER** | choose or decline an offered secondary-completion option | Store override, machine override, yard acceptance, closeout promotion, physical execution authority |
| **CELL_STEWARD** | accept/reject completion plan; accept/reject declared yard secondary service; confirm secondary completion; confirm labels; stage; record custody transfer; close project | Store override, envelope widening, unsafe bypass, controller-program invention |
| **OPERATOR** | **STOP WORK** and **REPORT CONDITION** only | reinterpret job, substitute operation, change tool requirement, accept customer choice, accept/reject completion plan, change Store answer, change price, waive gate, mark final completion, stage, transfer custody, close project, authorize machine capability |

A yard owner may hold or delegate the `CELL_STEWARD` role.

The role is the authority boundary. Job title alone does not create authority.

### Operator rule

The operator boundary is intentionally firm:

> **An operator may stop or report. An operator may not promote state.**

If an operator performs physical work under an already accepted and released local process, that fact may be observed/reported. The authoritative transition to `secondary complete`, `staged`, `ready`, `custody transferred`, or `closed` belongs to the cell steward or to a separately approved self-verifying system rule. No such automatic promotion rule is activated by this document.

## 5. Store firewall

The completion path is downstream of the Store decision.

A Store result other than `SUPPORTABLE` does not become supportable because a secondary operation is available.

If a project intends to split a finished feature into:

```text
machine contribution
+
secondary completion
```

that split must be explicit in the project/completion definition. It must not be an after-the-fact reinterpretation of a Store refusal.

Examples:

- permitted: Store supports the declared `3/16 in PILOT_DRILL`; completion plan separately carries `FINAL_DRILL_TO_3/8`;
- not permitted: Store refuses `DRILL_3/8`, then the application silently calls the refused job `SUPPORTABLE` because a person could drill it later.

## 6. Completion line

Each required feature or operation that reaches completion planning should retain at least:

```text
lineId
finished requirement
primary machine contribution
residual operation, if any
allowed secondary options
selected option
customer decision
cell-steward decision
secondary service reference, if yard-owned
secondary execution status, if yard-owned
final completion disposition
```

Expected final line dispositions are:

- `MACHINE_COMPLETE`;
- `YARD_COMPLETE`;
- `ASSIGNED_TO_CUSTOMER`;
- `ASSIGNED_TO_THIRD_PARTY`;
- `UNRESOLVED`;
- `REFUSED`.

`ASSIGNED_TO_CUSTOMER` does not mean the physical feature is complete. It means the yard and customer have explicitly accepted that the remaining work transfers with custody.

## 7. Completion gate

A project is not ready for handoff until all required lines have a permitted, accepted disposition and the non-machining closeout work is complete.

```text
G-COMPLETION

Store disposition SUPPORTABLE?
NO → BLOCK
YES ↓

Every required operation has a final completion disposition?
NO → BLOCK / CUSTOMER OR STEWARD DECISION REQUIRED
YES ↓

Required yard secondary work complete?
NO → BLOCK
YES ↓

Labels applied?
NO → BLOCK
YES ↓

Staged?
NO → BLOCK
YES ↓

Pickup ready or delivery arranged?
NO → BLOCK
YES ↓

Closeout record prepared?
NO → BLOCK
YES ↓

READY FOR HANDOFF
```

Custody transfer changes the project from `READY_FOR_HANDOFF` to `CLOSED`.

## 8. Labels

Physical parts should use the custom-paint-can model: every physical object or package carries enough identity to bind the atoms back to the durable project record.

Minimum useful label fields:

```text
project ID
part ID
revision
material
finished definition summary
primary-operation status
secondary-operation status / assignment
handoff status
record reference / QR target
```

By default the physical part label should **not** contain:

- customer name;
- customer address;
- price.

Those belong in the commercial/custody record, not on every part.

A QR code or equivalent reference should resolve to the owner/project record. It should not be treated as the record itself.

## 9. Staging and fulfillment

A completed part is not automatically a completed handoff.

The closeout path distinguishes:

- `STAGED`;
- `PICKUP_READY`;
- `DELIVERY_ARRANGED`;
- `TRANSFERRED`.

Pickup and delivery are fulfillment states, not machine states.

If delivery is arranged, the delivery method/provider, grouping/package identity, and custody handoff should be recorded at the appropriate layer. This document does not invent a carrier integration or live delivery service.

## 10. One closeout truth, two receipt depths

There should be one canonical project closeout record.

Individual and contractor receipts are presentation profiles over that same underlying truth.

### Individual profile

Recommended sections:

- project identity;
- parts and materials;
- what was done;
- what remains or is assigned;
- pickup/delivery;
- durable record reference.

### Contractor profile

Recommended additional depth:

- revision and part schedule;
- material/SKU basis;
- primary operations;
- secondary operations;
- inspection dispositions;
- label/package IDs;
- staging groups;
- custody transfer;
- exceptions;
- durable record reference.

The contractor profile does not create different manufacturing truth. It exposes more of the same record.

## 11. Audit level

The closeout audit should capture decisions and consequences, not machine microtelemetry.

Keep:

```text
project / revision
part identity
Store question / answer identity
primary machine outcome reference
completion lines
customer decisions
cell-steward decisions
secondary-service references
secondary completion status
inspection disposition
label/package IDs
staging state
pickup/delivery state
custody transfer
exceptions
closeout record identity
```

Do not duplicate every sawblade rotation, servo sample, or controller event into the owner receipt. Machine execution evidence may remain in a downstream machine/outcome record and be bound by identity/digest when required.

## 12. Implementation contract

The executable application contract is:

`apps/stb/shared/completion-contract.mjs`

It currently establishes:

- role/action authority matrix;
- explicit partial-operation handling;
- customer then steward decision sequence;
- yard-secondary service reference requirement;
- Store-refusal firewall;
- handoff and closeout gates;
- part-label data contract;
- individual/contractor receipt profiles;
- operator `STOP/REPORT ONLY` rule.

This does not yet create controller authority, order/payment capability, a live yard service catalog, carrier integration, or physical commissioning.

**NO BLOOD ON WOOD.**
