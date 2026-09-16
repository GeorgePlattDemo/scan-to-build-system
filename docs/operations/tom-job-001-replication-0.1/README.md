# Tom Job 001 Replication Package 0.2

**Status:** reference simulation / implementation diagnostic  
**Project:** Critical Fit  
**Demo actor:** Tom  
**Purpose:** replay the established `STORE-JOB-001` operating circuit with one controlled customer-definition change, then surround that circuit with the newer account / offer / payment / release / receipt forms while preserving project-fork transaction isolation.

## START HERE — corrected completed job packet

**Canonical completed reference binder:**

- `05-COMPLETED-JOB-PACKET-0.2.md`

That file is now the controlling Tom completed-job packet.

It applies the project-fork / transaction-isolation rule and binds every active downstream record to:

```text
accountId       DEMO-TOM-001
projectId       SIM-CF-TOM-001
projectRevision TOM-R001
```

The earlier `04-COMPLETED-JOB-PACKET.md` is **superseded as a controlling transaction packet** because it exposed a protocol error: donor/reference facts were allowed to remain too close to Tom's active transaction truth. Keep it only as historical diagnostic evidence of the error that caused this reconciliation rule to be written.

## CRITICAL RECONCILIATION STEP

`G-FORK-RECONCILIATION` is now a load-bearing rule for copied/template projects.

> **Provenance may be inherited. Transaction truth must be regenerated.**

Tom may reuse the same permitted demonstration scan and may begin from the existing Critical Fit project, but after Tom confirms `TOM-R001`:

- inherited configurable choices must exist in Tom's own revision;
- changed inputs invalidate donor/previous downstream derivations;
- Tom's WorkPacket must be regenerated;
- Tom's BOM/material requirement must be regenerated;
- Tom must receive a new Store request/response;
- Tom's price basis must be recalculated;
- Tom's offer/order/payment/release/Operations Packet must bind Tom's revision;
- Tom's machine job, receipt and Owner Record must bind Tom's revision;
- donor transaction records may remain provenance/history only.

Identical regenerated values are allowed. Identical inherited transaction truth is not.

The controlling protocol is:

- `../STB-PROJECT-FORK-AND-TRANSACTION-ISOLATION-0.1.md`

## Controlling donor

Operational donor:

- repository: `GeorgePlattDemo/scan-to-build-store`
- source: `STORE-JOB-001.md`
- examined pin: `3620b35369d70cf49733bbb0b62c0f3d9969b738`

The donor circuit is preserved in this order:

```text
received order + governed WorkPacket
        ↓
Store reconciliation
        ↓
material allocation
        ↓
capability confirmation
        ↓
machine-neutral translation
        ↓
local job validation
        ↓
Ready / Cycle Start
        ↓
establish workpiece reference
        ↓
servo-indexed bounded operations
        ↓
release + label
        ↓
job cart
        ↓
output / stock reconciliation
        ↓
staging
        ↓
closeout
        ↓
READY FOR PICKUP
        ↓
custody transfer
        ↓
FULFILLED
```

This package does **not** redesign that core.

## Source evidence versus what Tom ordered

Tom intentionally reuses the same permitted demonstration source / scan.

Those room/source facts remain source evidence:

```text
opening width   45 1/2 in
room height     94 1/2 in
available depth 14 1/2 in
mantel reference 45 in
```

They are not the ordered-product dimensions.

Tom's confirmed ordered revision is:

```text
unit width      43 1/2 in
unit height     72 in
unit depth      14 in
interior span   42.000 in
shelves         5
material        Pine
back            none
fit intent      centered intentional clearance
```

The corrected packet keeps these categories visibly separate.

## Controlled project change

Tom begins from the existing Critical Fit starting definition and changes:

```text
unit width
45 1/2 in  →  43 1/2 in
```

The other consequential starting choices are materialized into Tom's project and confirmed as Tom's current choices before `TOM-R001` is issued.

The current project rule is **no hidden fit allowance**. Therefore:

```text
43.500 Tom unit width
-0.750 left side member
-0.750 right side member
=42.000 Tom nominal interior span
```

Tom's 43 1/2-in unit sits inside the unchanged 45 1/2-in source opening. Because the old full-width-fit language no longer applies, this package uses one explicitly simulated human resolution:

```text
FIT INTENT = CENTERED_INTENTIONAL_CLEARANCE
nominal left clearance = 1.000 in
nominal right clearance = 1.000 in
```

That simulated decision belongs to Tom's revision. It is not carried from the donor project.

## Truth boundary

This package deliberately completes the **reference transaction** even where live product capability does not yet exist.

Accordingly:

- no real payment occurs;
- no physical D-001 machine is claimed commissioned;
- no physical stock is claimed consumed;
- no real Cycle Start is claimed;
- no real inspection measurement is claimed;
- no real custody transfer is claimed.

Where the existing architecture cannot complete a step honestly, the package records the snag, the simulated resolution, and the implementation item required to make the resolution real.

## Package files

1. `05-COMPLETED-JOB-PACKET-0.2.md`  
   **Canonical reconciled completed binder.** One end-to-end F00–F15 Tom job packet. Separates source evidence, donor provenance, and `WHAT TOM ORDERED`; regenerates downstream transaction facts from `TOM-R001`.

2. `04-COMPLETED-JOB-PACKET.md`  
   **SUPERSEDED / DIAGNOSTIC ONLY.** Preserved because it exposed the donor-state leakage protocol error. Do not use it as Tom's controlling completed-job packet.

3. `01-PROJECT-THROUGH-OPERATIONS-PACKET.md`  
   Earlier detailed F00–F10 diagnostic exhibit. Use with the 0.2 reconciliation rule; donor-era values in this exhibit are not controlling Tom transaction facts.

4. `02-JOB-001-CORE-RUN-AND-CLOSEOUT.md`  
   Detailed F11–F15 Job 001 core replay. The machine sequence remains a donor architecture; Tom's active job identity and geometry come from `TOM-R001` / `SIM-OP-CF-TOM-001`.

5. `03-IMPLEMENTATION-PUNCH-LIST.md`  
   Exact gaps exposed by the replay. This is the implementation backlog; it is not permission to replace or streamline existing good work.

## Preservation rule

**LICENSE TO FIX IS NOT LICENSE TO DESTROY.**

This reconciliation patch is additive. It does not replace the existing Critical Fit configurator, `STORE-JOB-001`, completion path, machine envelopes, Store authority, Review behavior, Owner Record semantics, or fail-closed boundaries.

The corrected test is:

> Can Tom fork the existing project, change one dimension, confirm his own revision, and have every consequential downstream record regenerate from that revision while the donor project remains provenance only?

**NO BLOOD ON WOOD.**
