# Tom Job 001 Replication Package 0.1

**Status:** reference simulation / implementation diagnostic  
**Project:** Critical Fit  
**Demo actor:** Tom  
**Purpose:** replay the established `STORE-JOB-001` operating circuit with one controlled customer-definition change, then surround that circuit with the newer account / offer / payment / release / receipt forms.

## START HERE — completed job packet

**Canonical completed reference binder:**

- `04-COMPLETED-JOB-PACKET.md`

That file is the single completed-job packet for Tom. It binds F00–F15, the transaction identities, Payment Zero receipt, separate release, Operations Packet, Job 001 machine replay, inspection, staging, closeout, custody, completion receipt, retained snags, and Owner Record into one inspectable artifact.

The other files in this folder are its detailed exhibits and implementation punch list.

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

## Controlled project change

Tom reuses the same Critical Fit demonstration source / scan and the same project choices shown in the current rich configurator, with one customer change:

```text
unit width
45 1/2 in  →  43 1/2 in
```

All other project values remain inherited unless the width change itself forces a mathematical consequence or exposes an existing contradiction.

The current project rule is **no hidden fit allowance**. Therefore:

```text
43.500 unit width
-0.750 left side member
-0.750 right side member
=42.000 nominal interior span
```

Tom's 43 1/2 in unit sits inside the unchanged 45 1/2 in room opening. Because the old full-width-fit language no longer applies, this package uses one explicitly simulated human resolution:

```text
FIT INTENT = CENTERED_INTENTIONAL_CLEARANCE
nominal left clearance = 1.000 in
nominal right clearance = 1.000 in
```

That simulated decision is called out as a simulation, not silently inferred as historical fact.

## Truth boundary

This package deliberately completes the **reference transaction** even where live product capability does not yet exist.

Accordingly:

- no real payment occurs;
- no physical D-001 machine is claimed commissioned;
- no physical stock is claimed consumed;
- no real Cycle Start is claimed;
- no real inspection measurement is claimed;
- no real custody transfer is claimed.

Where the existing architecture cannot complete a step honestly, the package records:

1. the snag;
2. why the existing circuit cannot simply pretend past it;
3. a separately labeled simulated resolution;
4. the implementation item required to make that resolution real.

## Package files

1. `04-COMPLETED-JOB-PACKET.md`  
   **Canonical completed binder.** One end-to-end F00–F15 job packet with transaction record identities, receipts, Job 001 replay, closeout, Owner Record and retained snags.

2. `01-PROJECT-THROUGH-OPERATIONS-PACKET.md`  
   Detailed F00–F10 exhibit: actor, source, configuration, WorkPacket, Store answer, dynamic price replay, offer, order, Payment Zero, release, Operations Packet.

3. `02-JOB-001-CORE-RUN-AND-CLOSEOUT.md`  
   Detailed F11–F15 exhibit: the Job 001 donor circuit replayed with Tom's identified definition, including local run simulation, outcome reconciliation, staging, closeout, receipt, custody and Owner Record.

4. `03-IMPLEMENTATION-PUNCH-LIST.md`  
   Exact gaps exposed by the replay. This is the implementation backlog; it is not permission to replace or streamline existing good work.

## Preservation rule

**LICENSE TO FIX IS NOT LICENSE TO DESTROY.**

This reference package is additive. It does not replace the existing Critical Fit configurator, `STORE-JOB-001`, completion path, machine envelopes, Store authority, Review behavior, Owner Record semantics, or fail-closed boundaries.

The test is simple:

> Can one 2-inch customer change propagate from the accepted configuration through Store, the existing Job 1 core, closeout and the owner record without anyone redrawing, retyping, silently dropping an operation, or changing authority?

**NO BLOOD ON WOOD.**
