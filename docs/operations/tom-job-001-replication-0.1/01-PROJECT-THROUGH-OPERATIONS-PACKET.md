# Tom Critical Fit — Project Through Operations Packet

**Package:** `TOM-JOB-001-REPLICATION-0.1`  
**Forms covered:** `STB-F00` through `STB-F10`  
**Transaction mode:** `REFERENCE_SIMULATION`

---

# F00 — Actor / Account Context

```text
accountId       DEMO-TOM-001
actor           TOM
authenticated   true
transactionMode REFERENCE_SIMULATION
```

Tom is treated as a signed-in demo user.

Anonymous users may reach configuration and budgetary pricing. They may not accept an offer, create an order, process Payment Zero, or create a production-release record.

**Simulated resolution used here:** a durable demo profile exists for Tom and owns this reference transaction.

---

# F01 — Intent / Source Evidence

Tom starts from the same demonstration room / scan used by the existing Critical Fit example.

The source facts remain:

| Source / carried fact | Value |
|---|---:|
| room / opening width | 45 1/2 in |
| room height | 94 1/2 in |
| available depth | 14 1/2 in |
| mantel reference | 45 in |
| scan | same demonstration source |
| controlling resolution | nearest 1/32 in |

The scan remains supporting evidence. It is not promoted to a more precise measurement merely because later arithmetic is precise.

### Snag F01-A — source custody across demo users

A real private home scan must not be copied into another customer's record merely because it is convenient for a demonstration.

### Simulated fix

Classify this source as:

```text
sourceClass = DEMO_SHARED_FIXTURE
sourceId    = DEMO-CRITICAL-FIT-SCAN-001
```

Tom receives a new project reference to the shared demo fixture. The source itself is not rewritten as Tom's private capture.

---

# F02 — Confirmed Project Definition

## The one requested customer change

```text
prior unit width = 45.500 in
Tom unit width   = 43.500 in
```

Everything else remains the same current Critical Fit configuration unless the width change itself causes a derived consequence.

| Configured fact | Tom value |
|---|---:|
| unit height | 72 in |
| unit width | **43 1/2 in** |
| unit depth | 14 in |
| shelf quantity | 5 |
| shelf elevations | 12, 24, 36, 45, 65 in |
| material | Pine |
| back | none |
| side-member thickness | 3/4 in each |

## Step-by-step resolution

### 1 · Start with the room

The 94 1/2 in room height remains source context. It is not the unit height.

### 2 · Retain the unit height

Tom keeps the current 72 in unit height.

### 3 · Change only the width

Tom changes the unit from 45 1/2 in wide to 43 1/2 in wide.

The room opening remains 45 1/2 in.

Therefore:

```text
45.500 opening
-43.500 unit
= 2.000 in total nominal difference
```

### Snag F02-A — the old full-width-fit statement is now false

The application cannot carry the old `full-width fit` explanation forward after the customer deliberately selects a narrower unit.

### Simulated fix

Tom confirms:

```text
fitIntent = CENTERED_INTENTIONAL_CLEARANCE
leftNominalClearance  = 1.000 in
rightNominalClearance = 1.000 in
```

This is explicitly a simulated Tom decision. The arithmetic can identify a 2-in difference; it cannot invent the human reason.

### 4 · Retain depth

14 in remains the chosen unit depth inside the 14 1/2 in available depth.

### 5 · Retain shelves

Tom keeps five shelves at 12, 24, 36, 45 and 65 in.

### 6 · Retain material

Tom keeps Pine.

## Derived definition

The current project rule is no hidden fit allowance.

```text
43.500 unit width
-0.750 left side member
-0.750 right side member
=42.000 nominal interior span
```

**Tom controlling crosswise shelf-part length:** `42.000 in`

This value replaces the old Job 001 example length wherever the current Tom revision is the source.

```text
definitionId = SIM-CF-TOM-R001
status       = CONFIRMED_REFERENCE
```

Definition confirmation still does not mean order, payment, release, machine readiness or Cycle Start.

---

# F03 — Governed WorkPacket

```text
workPacketId = SIM-WP-CF-TOM-R001
projectId    = SIM-CF-TOM-001
revision     = R001
actorId      = DEMO-TOM-001
```

The packet carries, without redrawing:

- source/evidence references;
- the 45 1/2 in room opening;
- Tom's 43 1/2 in unit width;
- 72 in unit height;
- 14 in unit depth;
- five shelf elevations;
- Pine material preference;
- 42.000 in derived interior span;
- configured part relationships;
- material requirements;
- requested manufacturing operations;
- part identities / label requirements;
- unresolved conditions;
- the simulated centered-clearance decision.

The packet is machine-neutral. It does not contain servo coordinates, controller syntax or Cycle Start authority.

---

# F04 — Store Zero Evaluation

The Job 001 donor gives Store four jobs after order handoff:

1. reconcile the order with current Store facts;
2. allocate suitable physical stock;
3. translate the accepted part definition into machine-neutral operations D-001 can accept;
4. present a locally validated job for Cycle Start.

Tom follows the same four-job circuit.

## Material lines carried by the current Critical Fit demonstration

```text
10 x Pine 1x6x96
 4 x Pine 1x6x72
 1 x alcove hardware pack
```

Current Store fixture identities:

```text
STB-ZERO-PINE-1X6-96-001
STB-ZERO-PINE-1X6-72-001
STB-ZERO-HW-ALCOVE-PACK-001
```

Current reference selling prices represented by the Store fixture:

```text
1x6x96 = $20.99 ea
1x6x72 = $15.74 ea
hardware pack = $18.00
```

Material subtotal:

```text
10 x 20.99 = 209.90
 4 x 15.74 =  62.96
                 -----
material       = 272.86
hardware       =  18.00
```

## D-001 bounded-machine basis

Reference envelope:

```text
D001-STAGE2-ENVELOPE-0.2
basis       DECLARED_STAGE2_CAPABILITY
measured    false
commissioned false
```

The reference cell models dimensional stock handling, workpiece registration, controlled X feed, bounded saw/mill/drill stations, local lowering and labeling.

It does **not** prove:

- physical commissioning;
- actual machine accuracy;
- guarding adequacy;
- stopping performance;
- workholding strength;
- live inventory;
- production authorization;
- controller-in-loop execution.

## Requested operation coverage for the Job 1 replay

| Operation | Tom replay disposition |
|---|---|
| reconcile identified Pine material | SUPPORTABLE — reference fixture |
| establish workpiece reference | SUPPORTABLE — Job 1 core concept |
| square crosscut to packet-defined shelf length | SUPPORTABLE — reference D-001 path |
| preserve job / part identity | SUPPORTABLE — reference path |
| label completed component | REQUIRED — completion path |
| staging / closeout | SUPPORTABLE — reference workflow |
| physical production | NOT CLAIMED |

### Snag F04-A — current rich configurator and old Job 001 are not yet one reconciled part/BOM object

The current rich screen says `14 in deep`, `3 across`, `5 shelves`, while the recovered Job 001 / pricing path carries a stock-count shortcut rather than a complete occurrence/nesting record.

### Simulated fix

For this replay, the **customer definition remains unchanged** and the existing represented Store material lines remain the Job 1 fulfillment fixture.

Before physical deployment, the implementation must generate an explicit part-occurrence manifest and prove that the represented stock quantities close that manifest. If it cannot, Store must `DEFER` or `REFUSE`; it may not hide the discrepancy.

### Snag F04-B — 72-in finished height versus 72-in parent stock

The Job 1 operating narrative establishes a cleanup/origin face before the finished cut. A physically exact 72.000-in finished member cannot be assumed from a 72-in parent if material must be removed first.

### Simulated fix

The replay keeps the inherited 72-in Store line so the Job 1 donor remains traceable, but marks this line `PROCESS_LENGTH_CLOSURE_REQUIRED`.

A real implementation must either:

- map the side member to longer parent stock;
- use a separately validated process that does not consume required finished length;
- or refuse the material/process pairing.

No physical adequacy is claimed by this simulation.

---

# F05 — Dynamic Price Basis

## Recovered Job-1-era engine

```text
engine     STB-STORE-ZERO-PRICE-1
version    0.2.2
cycleModel STB-D001-CYCLE-MODEL-S2-0.1
basis      CALCULATED
measured   false
commissioned false
```

The recovered engine is valuable as a deterministic regression fixture, but it is **not compliant with the new economics standard** because it still contains the previously identified placeholder recovery assumptions and older hard-coded alcove geometry.

## Width-only propagation test

If the old 0.2.2 calculation is replayed and only the crosswise retained length is reduced by 2 in, the modeled travel component changes slightly while the represented stock count remains the same.

The width-only regression fixture produces approximately:

```text
material            $272.86
legacy modeled cell  $83.48
hardware              $18.00
                     -------
fixture total         $374.34
```

This is the correct **behavioral lesson**: changing a dimension does not necessarily create a large price change when stock quantity and operation count remain unchanged.

### Snag F05-A — the fixture amount is not current authoritative economics

The old engine still embeds the historical `$35` setup and `$100/hr` values and hard-coded project assumptions.

### Simulated fix

For this end-to-end transaction only:

```text
priceBasis       = LEGACY_FIXTURE_REPLAY
transactionPrice = 374.34 USD
commercialTruth  = DEMONSTRATION_ONLY
```

The payment simulation uses that fixture amount solely so the entire circuit can be exercised.

Before this becomes a real Store offer, the engine must be replaced by the new derived machine-recovery model and must consume the exact current project revision rather than a hard-coded alcove helper.

---

# F06 — Reference Offer

```text
offerId       SIM-OFFER-CF-TOM-001
accountId     DEMO-TOM-001
definitionId  SIM-CF-TOM-R001
workPacketId  SIM-WP-CF-TOM-R001
storeBasis    Store Zero reference fixture
total         374.34 USD
status        REFERENCE_OFFER
```

The offer binds the exact revision, material basis, Store answer, pricing basis, terms and unresolved/non-physical disclosures.

No geometry is retyped into the offer.

---

# F07 — Order / Acceptance

Tom accepts the reference offer.

```text
acceptanceId  SIM-ACCEPT-CF-TOM-001
orderId       SIM-ORDER-CF-TOM-001
amount        374.34 USD
mode          REFERENCE_SIMULATION
```

The order references the offer and WorkPacket. It does not replace them.

---

# F08 — Payment Zero Demonstration Receipt

```text
paymentId     SIM-PAY0-CF-TOM-001
orderId       SIM-ORDER-CF-TOM-001
accountId     DEMO-TOM-001
amount        374.34
currency      USD
processor     DEMO / NONE
paymentMode   REFERENCE_SIMULATION
status        PROCESSED
fundsStatus   AVAILABLE
```

Visible receipt statement:

> **PAYMENT PROCESSED — DEMONSTRATION TRANSACTION**

No bank, card network or live processor is represented. No real money moved.

---

# F09 — Production Release

Payment availability does not become machine authority.

A separate reference release is issued:

```text
releaseId                   SIM-REL-CF-TOM-001
orderId                     SIM-ORDER-CF-TOM-001
workPacketId                SIM-WP-CF-TOM-R001
simulationAuthorized        true
physicalExecutionAuthorized false
```

**paid ≠ released**  
**released ≠ machine ready**  
**machine ready ≠ Cycle Start**

---

# F10 — Operations Packet

```text
operationsPacketId SIM-OP-CF-TOM-001
workPacketId       SIM-WP-CF-TOM-R001
orderId            SIM-ORDER-CF-TOM-001
releaseId          SIM-REL-CF-TOM-001
machineFamily      D-001
mode               REFERENCE_SIMULATION
```

The packet carries the Job 1 machine-neutral pattern, with Tom's identified crosswise length substituted wherever that part requirement is applicable:

```text
LOAD identified stock
ESTABLISH workpiece reference
CROSSCUT finished kept length 42.000 in   # applicable Tom shelf parts
PERFORM only other already-admitted packet operations
RELEASE
LABEL packet-defined part identity
```

The packet does not contain controller-specific motion.

## Handoff to the preserved Job 1 core

At this point the newer surrounding layers stop adding authority.

The next stages deliberately reuse the established Job 1 circuit:

```text
Store-local reconciliation
→ allocation / pick
→ local job validation
→ Ready / Cycle Start
→ workpiece reference
→ bounded operation
→ release / label
→ job cart
→ reconciliation
→ staging
→ closeout
→ custody
```

That replay is recorded in `02-JOB-001-CORE-RUN-AND-CLOSEOUT.md`.

**NO BLOOD ON WOOD.**
