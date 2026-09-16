# TOM JOB 001 — COMPLETED REFERENCE JOB PACKET

**Packet ID:** `TOM-JOB-001-REPLICATION-0.1`  
**Project:** Critical Fit  
**Customer profile:** `DEMO-TOM-001`  
**Transaction mode:** `REFERENCE_SIMULATION`  
**Completion state:** `REFERENCE_SIMULATION_FULFILLED`  
**Physical fabrication:** `NOT CLAIMED`  
**Physical pickup:** `NOT CLAIMED`  
**Safety invariant:** **NO BLOOD ON WOOD**

---

## 1. Purpose of this packet

This is the canonical completed-job binder for the Tom Job 001 replication.

It binds the entire reference transaction into one place:

```text
ACCOUNT / ACTOR
→ SOURCE EVIDENCE
→ CONFIRMED CONFIGURATION
→ WORKPACKET
→ STORE EVALUATION
→ PRICE BASIS
→ OFFER
→ ORDER
→ PAYMENT ZERO
→ SEPARATE RELEASE
→ OPERATIONS PACKET
→ MACHINE ADMISSION
→ LOCAL SIMULATED CYCLE START
→ OPERATION OUTCOMES
→ INSPECTION
→ STAGING / PICKUP READY
→ CLOSEOUT
→ CUSTODY TRANSFER
→ RECEIPTS
→ OWNER RECORD
```

This packet does not replace the detailed exhibits in this folder. It is the completed binder that ties them together by identity.

Detailed project/commercial basis:

- `01-PROJECT-THROUGH-OPERATIONS-PACKET.md`

Detailed Job 001 run/closeout replay:

- `02-JOB-001-CORE-RUN-AND-CLOSEOUT.md`

Implementation gaps exposed by the replay:

- `03-IMPLEMENTATION-PUNCH-LIST.md`

---

# 2. Packet manifest

| Record | Identity | State |
|---|---|---|
| F00 Actor / Account | `DEMO-TOM-001` | authenticated demo actor |
| F01 Evidence | `DEMO-CRITICAL-FIT-SCAN-001` | shared demo fixture |
| F02 Definition | `SIM-CF-TOM-R001` | confirmed reference |
| F03 WorkPacket | `SIM-WP-CF-TOM-R001` | issued |
| F04 Store response | `SIM-SZ-RSP-CF-TOM-R001` | reference reconciliation complete |
| F05 Price basis | `SIM-PRICE-CF-TOM-R001` | legacy fixture replay / non-authoritative economics |
| F06 Offer | `SIM-OFFER-CF-TOM-001` | accepted |
| F07 Order | `SIM-ORDER-CF-TOM-001` | created |
| F08 Payment | `SIM-PAY0-CF-TOM-001` | processed / funds available in demo mode |
| F09 Release | `SIM-REL-CF-TOM-001` | simulation authorized; physical false |
| F10 Operations Packet | `SIM-OP-CF-TOM-001` | issued |
| F11 Machine job | `SIM-D001-CF-TOM-001` | admitted to reference simulation |
| Cycle Start event | `SIM-CYCLESTART-CF-TOM-001` | local simulated start |
| F12 Outcome | `SIM-D001-OUTCOME-CF-TOM-001` | simulated primary machine work complete |
| F13 Inspection | `SIM-INSPECT-CF-TOM-001` | reference inspection complete |
| F14 Staging | `SIM-STAGE-CF-TOM-001` | staged |
| Pickup ready | `SIM-PICKUPREADY-CF-TOM-001` | pickup ready in simulation |
| Closeout | `SIM-CLOSEOUT-CF-TOM-001` | closeout record prepared |
| Custody | `SIM-CUSTODY-CF-TOM-001` | transferred in simulation |
| Payment receipt | `SIM-RECEIPT-PAY-CF-TOM-001` | issued |
| Completion receipt | `SIM-RECEIPT-CF-TOM-001` | issued |
| F15 Owner Record | `SIM-OWNERRECORD-CF-TOM-001` | complete reference chronology |

No downstream record is allowed to change the meaning of an upstream record.

---

# 3. F00 — Actor / account

```text
accountId       DEMO-TOM-001
actor           TOM
authenticated   true
transactionMode REFERENCE_SIMULATION
```

Tom is treated as a signed-in demonstration user.

Anonymous users may configure and obtain a reference price. They may not accept an offer, create an order, process Payment Zero, or receive a production-release record.

---

# 4. F01 — Source evidence

Tom begins from the same demonstration room / scan used by the existing Critical Fit example.

```text
sourceId      DEMO-CRITICAL-FIT-SCAN-001
sourceClass   DEMO_SHARED_FIXTURE
```

Carried source facts:

| Fact | Value |
|---|---:|
| room / opening width | 45 1/2 in |
| room height | 94 1/2 in |
| available depth | 14 1/2 in |
| mantel reference | 45 in |
| controlling resolution | nearest 1/32 in |

The scan is supporting evidence. Arithmetic performed later does not retroactively make the scan more precise.

### Resolved snag — cross-user evidence custody

This reference uses a shared demo fixture. It does not represent one real customer's private home scan as another customer's private record.

---

# 5. F02 — Tom's confirmed definition

The one requested customer change is:

```text
prior unit width = 45.500 in
Tom unit width   = 43.500 in
```

Everything else is carried forward unless the width change itself forces a consequence.

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

The room opening remains 45 1/2 in.

Tom's unit is 2 in narrower than the opening.

For this simulation Tom explicitly confirms:

```text
fitIntent             CENTERED_INTENTIONAL_CLEARANCE
leftNominalClearance  1.000 in
rightNominalClearance 1.000 in
```

This is recorded as a human decision, not silently inferred from subtraction.

## Derived controlling crosswise dimension

```text
43.500 unit width
-0.750 left side member
-0.750 right side member
=42.000 nominal interior span
```

**Controlling shelf-part crosswise requirement: `42.000 in`.**

```text
definitionId SIM-CF-TOM-R001
status       CONFIRMED_REFERENCE
```

Definition confirmation is not order, payment, release, machine readiness, or Cycle Start.

---

# 6. F03 — WorkPacket

```text
workPacketId SIM-WP-CF-TOM-R001
projectId    SIM-CF-TOM-001
revision     R001
actorId      DEMO-TOM-001
```

The WorkPacket carries:

- source references;
- room/opening context;
- Tom's 43 1/2-in width;
- 72-in height;
- 14-in depth;
- five shelf positions;
- Pine material preference;
- 42.000-in derived interior span;
- part relationships;
- represented material requirements;
- requested machine-neutral operations;
- part / label identities;
- unresolved conditions;
- fit intent.

It contains no controller coordinates and creates no Cycle Start authority.

---

# 7. F04 — Store Zero reconciliation

The Job 001 donor is preserved. After order handoff, Store performs four jobs:

1. reconcile the order with current Store facts;
2. allocate suitable material;
3. translate the accepted part definition into machine-neutral operations D-001 can accept;
4. present a locally validated job for Cycle Start.

## Represented material fixture

```text
10 x STB-ZERO-PINE-1X6-96-001
 4 x STB-ZERO-PINE-1X6-72-001
 1 x STB-ZERO-HW-ALCOVE-PACK-001
```

Reference fixture prices carried by the current Store source:

```text
Pine 1x6x96     $20.99 ea
Pine 1x6x72     $15.74 ea
hardware pack   $18.00
```

Reference material arithmetic:

```text
10 x 20.99 = 209.90
 4 x 15.74 =  62.96
                ------
material       272.86
hardware        18.00
```

## Bounded D-001 basis

```text
envelope     D001-STAGE2-ENVELOPE-0.2
basis        DECLARED_STAGE2_CAPABILITY
measured     false
commissioned false
```

D-001's reference role includes dimensional-stock handling, reference establishment, controlled feed, bounded fixed-station processing, local lowering, release, and labeling.

It does not prove physical commissioning, machine accuracy, guarding, stopping performance, workholding strength, live inventory, controller-in-loop execution, or physical production authorization.

## Requested-operation disposition

| Requested requirement | Reference disposition |
|---|---|
| identified Pine material | SUPPORTABLE — reference fixture |
| workpiece reference establishment | SUPPORTABLE — Job 1 core pattern |
| packet-defined square crosscut | SUPPORTABLE — reference D-001 path |
| part identity preservation | SUPPORTABLE |
| label | REQUIRED |
| staging / closeout | SUPPORTABLE — reference workflow |
| physical production | NOT CLAIMED |

### Retained snag — BOM / stock closure

The rich Critical Fit presentation and the inherited Job 1 material fixture are not yet one occurrence-level part/nesting model.

For this reference replay the inherited material fixture is retained so Job 1 remains traceable. Before physical deployment, the material quantities must be proven against an explicit part-occurrence and stock-nesting record. Failure to close that record must cause `DEFER` or `REFUSE` rather than silent acceptance.

### Retained snag — 72-in parent / 72-in finished side

The Job 1 core establishes a cleanup/origin face before a finished cut. A physically exact 72.000-in finished component cannot be assumed from a 72-in parent if material must be removed first.

For this simulation the inherited 72-in Store lines remain traceable but carry:

```text
PROCESS_LENGTH_CLOSURE_REQUIRED
```

No physical adequacy is claimed.

---

# 8. F05 — Price basis

Recovered fixture engine:

```text
engine       STB-STORE-ZERO-PRICE-1
version      0.2.2
cycleModel   STB-D001-CYCLE-MODEL-S2-0.1
basis        CALCULATED
measured     false
commissioned false
```

The recovered engine remains useful for regression behavior, but it is not current authoritative economics. It still contains the historical placeholder recovery values and hard-coded alcove assumptions.

For the width-only replay, the represented stock quantity remains unchanged and only a small modeled travel component changes.

Reference replay:

```text
material            $272.86
legacy modeled cell  $83.48
hardware              $18.00
                     -------
fixture total         $374.34
```

```text
priceBasis       LEGACY_FIXTURE_REPLAY
transactionPrice 374.34 USD
commercialTruth  DEMONSTRATION_ONLY
```

This amount exists only to exercise the complete transaction circuit. It is not promoted to current commercial truth.

---

# 9. F06 — Offer

```text
offerId      SIM-OFFER-CF-TOM-001
accountId    DEMO-TOM-001
definitionId SIM-CF-TOM-R001
workPacketId SIM-WP-CF-TOM-R001
total        374.34 USD
status       REFERENCE_OFFER
```

The offer references the identified definition, WorkPacket, Store answer, price basis, terms, and disclosed limitations.

No project geometry is retyped into a new source of truth.

---

# 10. F07 — Acceptance / order

Tom accepts the reference offer.

```text
acceptanceId SIM-ACCEPT-CF-TOM-001
orderId      SIM-ORDER-CF-TOM-001
amount       374.34 USD
mode         REFERENCE_SIMULATION
```

The order references the offer and WorkPacket. It does not replace either.

---

# 11. F08 — Payment Zero

```text
paymentId   SIM-PAY0-CF-TOM-001
orderId     SIM-ORDER-CF-TOM-001
accountId   DEMO-TOM-001
amount      374.34
currency    USD
processor   DEMO / NONE
paymentMode REFERENCE_SIMULATION
status      PROCESSED
fundsStatus AVAILABLE
```

## Payment receipt

**Receipt:** `SIM-RECEIPT-PAY-CF-TOM-001`

```text
PAYMENT PROCESSED — DEMONSTRATION TRANSACTION
Amount: $374.34 USD
Processor: DEMO / NONE
Funds: AVAILABLE — DEMONSTRATION
Live money movement: NONE
```

No bank, card network, or live processor is represented.

---

# 12. F09 — Separate release

Payment does not create machine authority.

```text
releaseId                   SIM-REL-CF-TOM-001
orderId                     SIM-ORDER-CF-TOM-001
workPacketId                SIM-WP-CF-TOM-R001
simulationAuthorized        true
physicalExecutionAuthorized false
```

The authority chain remains:

```text
paid ≠ released
released ≠ machine ready
machine ready ≠ Cycle Start
```

---

# 13. F10 — Operations Packet

```text
operationsPacketId SIM-OP-CF-TOM-001
workPacketId       SIM-WP-CF-TOM-R001
orderId            SIM-ORDER-CF-TOM-001
releaseId          SIM-REL-CF-TOM-001
machineFamily      D-001
mode               REFERENCE_SIMULATION
```

Machine-neutral sequence for the applicable Tom shelf requirement:

```text
LOAD identified stock
ESTABLISH workpiece reference
CROSSCUT finished kept length 42.000 in
PERFORM only other admitted packet operations
RELEASE
LABEL packet-defined part identity
```

No controller-specific motion is present.

---

# 14. F11 — Machine admission / local readiness

```text
machineJobId       SIM-D001-CF-TOM-001
operationsPacketId SIM-OP-CF-TOM-001
workPacketId       SIM-WP-CF-TOM-R001
orderId            SIM-ORDER-CF-TOM-001
mode               REFERENCE_SIMULATION
```

Reference readiness:

| Condition | State |
|---|---|
| correct job active | yes |
| correct Operations Packet | yes |
| represented stock available | yes |
| Store identity reconciled | yes |
| fence / support path | represented clear |
| tools | represented clear / retracted |
| workholding | represented open |
| feed rollers | represented raised |
| longitudinal workpiece position | not yet established |
| physical commissioning | false |
| physical execution authority | false |

The machine receives the finished requirement from the packet. The operator does not re-enter 42.000 in and does not re-measure the room.

---

# 15. Local simulated Cycle Start

```text
cycleStartEventId           SIM-CYCLESTART-CF-TOM-001
source                      LOCAL_MACHINE_SIMULATION
networkCycleStart           false
applicationCycleStart       false
physicalExecutionAuthorized false
```

Payment does not start the machine.

Release does not start the machine.

The simulated local machine reaches its own ready condition and receives a simulated local Cycle Start.

---

# 16. F12 — Job 1 core operation replay

The preserved Job 1 operating language is:

```text
LOAD
  ↓
SEAT TO MACHINE REFERENCES
  ↓
HOLD / FEED ENGAGE
  ↓
FIRST CUT ESTABLISHES LONGITUDINAL ORIGIN
  ↓
POSITION_VALID
  ↓
SERVO INDEX TO REQUIRED OPERATION
  ↓
CUT / MILL / DRILL AS CALLED
  ↓
REPOSITION WITHIN VALID REFERENCE CHAIN
  ↓
COMPLETE REQUIRED OPERATIONS
  ↓
RELEASE
  ↓
LABEL
  ↓
JOB CART
```

Tom's width changes the finished requirement. It does not change this machine-language pattern.

## Representative shelf-part run

### Load

The packet-identified Store item is presented and placed in the declared orientation.

### Establish lateral / vertical references

The board is seated to the simulated fence and support chain.

```text
POSITION_VALID = false
```

### Establish longitudinal origin

The donor's cleanup/origin operation is simulated.

```text
POSITION_VALID = true
```

The removed origin material is process loss, not a finished component.

### Index to Tom's requirement

```text
FINISHED KEPT LENGTH = 42.000 in
```

No kerf is added to the customer's finished requirement. Cutter geometry belongs to the machine/process transformation.

### Simulated operation outcome

```text
partOutcome            SIMULATED_MACHINE_COMPLETE
requestedFinishedLength 42.000 in
measuredFinishedLength  NOT_MEASURED
```

### Release / label

The simulated part leaves the maintained reference chain, receives the required identity binding, and is placed on the Job 1 job cart.

Minimum label binding:

```text
projectId
revision
orderId
machineJobId
partId
materialLine
primaryOperationStatus
recordReference
```

## Machine-job outcome

```text
outcomeId         SIM-D001-OUTCOME-CF-TOM-001
machineJobId      SIM-D001-CF-TOM-001
status            SIMULATED_PRIMARY_MACHINE_WORK_COMPLETE
physicalRun       false
measuredResult    false
controllerInLoop  false
```

### Material reconciliation state

```text
stockBalanceStatus        SIMULATED_RECONCILED
actualConsumptionMeasured false
exactRemnantDimensions    UNRESOLVED_UNTIL_PHYSICAL_RUN
```

No exact physical cutoff/remnant dimensions are invented.

---

# 17. F13 — Inspection

The nearest-1/32-in project resolution is not treated as a machine tolerance.

```text
inspectionId          SIM-INSPECT-CF-TOM-001
packetIdentityMatch   true
requiredPartCount     RECONCILED_IN_SIMULATION
requiredLabels        PRESENT_IN_SIMULATION
physicalDimensions    NOT_MEASURED
physicalTolerancePass NOT_CLAIMED
status                REFERENCE_INSPECTION_COMPLETE
```

A physical D-001 tolerance must later be established by commissioning and measured process evidence.

---

# 18. Completion reconciliation

Reference final dispositions:

| Requirement | Final disposition |
|---|---|
| primary D-001 square cuts | `MACHINE_COMPLETE` — simulation only |
| required labels | `YARD_COMPLETE` — simulated workflow |
| hardware pack | `YARD_COMPLETE` — simulated staging |
| physical tolerance proof | NOT CLAIMED |
| installation | outside Store scope |

No residual operation is silently erased.

---

# 19. F14 — Staging / fulfillment / custody

The completion states remain separate:

```text
SIM-STAGE-CF-TOM-001
STAGED
  ↓
SIM-PICKUPREADY-CF-TOM-001
PICKUP_READY
  ↓
SIM-CLOSEOUT-CF-TOM-001
CLOSEOUT_RECORD_PREPARED
  ↓
SIM-CUSTODY-CF-TOM-001
TRANSFERRED
  ↓
REFERENCE_SIMULATION_FULFILLED
```

**STAGED does not mean FULFILLED.**

## Closeout checks

| Check | Result |
|---|---|
| job identity | reconciled to `SIM-ORDER-CF-TOM-001` |
| project relationship | bound to `SIM-WP-CF-TOM-R001` |
| material identity | reference Store lines retained |
| part completion | reconciled in simulation |
| part identity | labels represented |
| machine history | `SIM-D001-CF-TOM-001` bound |
| exceptions | process-length and physical-measurement nonclaims retained |
| stock balance | simulated; exact physical remnants unresolved |
| other order lines | hardware pack represented |
| stage tally | reconciled in simulation |

Reference handoff reaches `READY FOR PICKUP`, then simulated custody reaches `TRANSFERRED`, then the reference transaction reaches `FULFILLED`.

No physical pickup is claimed.

---

# 20. Completion receipt

## STORE ZERO — DEMONSTRATION COMPLETION RECEIPT

```text
receiptId          SIM-RECEIPT-CF-TOM-001
customerProfile    DEMO-TOM-001
project            Critical Fit
definition         SIM-CF-TOM-R001
workPacket         SIM-WP-CF-TOM-R001
offer              SIM-OFFER-CF-TOM-001
order              SIM-ORDER-CF-TOM-001
payment            SIM-PAY0-CF-TOM-001
release            SIM-REL-CF-TOM-001
operationsPacket   SIM-OP-CF-TOM-001
machineJob         SIM-D001-CF-TOM-001
machineOutcome     SIM-D001-OUTCOME-CF-TOM-001
inspection         SIM-INSPECT-CF-TOM-001
closeout           SIM-CLOSEOUT-CF-TOM-001
custody            SIM-CUSTODY-CF-TOM-001
ownerRecord        SIM-OWNERRECORD-CF-TOM-001
```

### Definition received

```text
room opening  45 1/2 in
unit width    43 1/2 in
unit height   72 in
unit depth    14 in
interior span 42.000 in
shelves       5
material      Pine
fit intent    centered intentional clearance — simulated Tom decision
```

### Demonstration transaction amount

```text
material                   $272.86
legacy fixture cell model   $83.48
hardware                     $18.00
                            -------
DEMO TOTAL                  $374.34
```

```text
PAYMENT STATUS       PROCESSED — DEMONSTRATION TRANSACTION
FUNDS STATUS         AVAILABLE — DEMONSTRATION
REFERENCE FULFILLMENT FULFILLED
PHYSICAL FABRICATION NOT CLAIMED
PHYSICAL PICKUP      NOT CLAIMED
```

The receipt is a presentation over the transaction records. It does not create a new manufacturing truth.

---

# 21. F15 — Owner Record

```text
ownerRecordId SIM-OWNERRECORD-CF-TOM-001
```

Chronology:

1. shared demonstration evidence referenced;
2. Tom demo account established;
3. Critical Fit configuration instantiated;
4. unit width changed from 45 1/2 in to 43 1/2 in;
5. prior full-width-fit language became invalid;
6. simulated centered-clearance intent recorded;
7. 42.000-in interior span derived;
8. WorkPacket issued;
9. Store reconciliation performed;
10. BOM / process-length snags retained rather than hidden;
11. width-only fixture pricing produced $374.34;
12. reference offer issued;
13. Tom accepted;
14. order created;
15. Payment Zero processed;
16. demo funds marked available;
17. simulation release issued separately;
18. Operations Packet issued;
19. D-001 job admitted for simulation;
20. simulated local Cycle Start recorded;
21. Job 1 workpiece-reference chain exercised;
22. Tom's 42.000-in requirement propagated into the machine job;
23. operation outcome recorded without claiming physical measurement;
24. labels represented;
25. stock/remnant record retained as simulated, not measured;
26. reference inspection completed;
27. package staged;
28. pickup-ready state recorded;
29. closeout record prepared;
30. simulated custody transfer recorded;
31. reference transaction marked fulfilled;
32. payment receipt and completion receipt bound to the Owner Record.

The final state does not erase intermediate records and is not reduced to a generic `DONE` flag.

---

# 22. Open snags carried with the completed reference packet

A completed reference simulation is allowed to contain unresolved physical/commercial implementation gaps so long as those gaps remain explicit and do not create false authority.

The packet therefore closes with these retained items:

1. rich Critical Fit state and accepted alcove runtime class still need one authoritative project object;
2. fit intent needs a durable user-decision field;
3. full part-occurrence / stock-nesting closure is not yet implemented;
4. the 14-in-deep / 3-across presentation needs exact occurrence/manufacturing closure;
5. 72-in finished side members versus 72-in parent stock requires process-length resolution;
6. pricing must consume the current project revision rather than hard-coded legacy alcove values;
7. the historical `$35` setup / `$100 per hr` recovery values are not current authoritative economics;
8. offer, order, Payment Zero, release, Operations Packet, machine outcome, inspection, staging, custody, and receipts are reference-simulated here and still require durable runtime implementations;
9. occurrence-level material conservation / remnant accounting is still required;
10. physical commissioning, measured tolerance, controller-in-loop validation, and physical execution authority remain unclaimed.

See `03-IMPLEMENTATION-PUNCH-LIST.md` for the full implementation punch list.

---

# 23. Completed packet result

This binder completes the Tom reference transaction as an auditable simulation:

```text
TOM ACCOUNT
→ DEMO SOURCE
→ CRITICAL FIT R001
→ 42.000-IN DERIVED REQUIREMENT
→ WORKPACKET
→ STORE ZERO RECONCILIATION
→ REFERENCE PRICE
→ OFFER
→ ORDER
→ PAYMENT ZERO
→ SEPARATE SIMULATION RELEASE
→ OPERATIONS PACKET
→ JOB 001 CORE
→ LOCAL SIMULATED CYCLE START
→ SIMULATED MACHINE OUTCOME
→ INSPECTION
→ LABEL / JOB CART
→ STAGE
→ PICKUP READY
→ CLOSEOUT
→ SIMULATED CUSTODY
→ COMPLETION RECEIPT
→ OWNER RECORD
```

The circuit is complete **as a reference simulation**.

It does not claim that the remaining punch-list items are implemented physical or commercial capabilities.

**NO BLOOD ON WOOD.**
