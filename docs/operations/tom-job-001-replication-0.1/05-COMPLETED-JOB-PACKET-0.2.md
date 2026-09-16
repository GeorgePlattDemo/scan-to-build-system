# TOM JOB 001 — COMPLETED REFERENCE JOB PACKET 0.2

**Packet ID:** `TOM-JOB-001-REPLICATION-0.2`  
**Project:** Critical Fit  
**Customer profile:** `DEMO-TOM-001`  
**Project ID:** `SIM-CF-TOM-001`  
**Controlling project revision:** `TOM-R001`  
**Transaction mode:** `REFERENCE_SIMULATION`  
**Completion state:** `REFERENCE_SIMULATION_FULFILLED`  
**Physical fabrication:** `NOT CLAIMED`  
**Physical pickup:** `NOT CLAIMED`  
**Safety invariant:** **NO BLOOD ON WOOD**

---

# 1. Why this 0.2 packet exists

The first Tom completed-job binder contained a protocol error: it allowed donor/reference project facts and donor-era fulfillment facts to remain too close to Tom's active transaction record.

That is not acceptable.

Tom may start from a shared demonstration scan and an existing Critical Fit project, but once Tom confirms his own revision, the transaction must be rebuilt from **Tom's project revision**.

This packet therefore applies:

`STB-PROJECT-FORK-AND-TRANSACTION-ISOLATION-0.1`

and the critical gate:

`G-FORK-RECONCILIATION`.

The controlling principle is:

> **Provenance may be inherited. Transaction truth must be regenerated.**

This packet supersedes `04-COMPLETED-JOB-PACKET.md` as the controlling Tom completed-job binder.

The earlier packet remains useful only as the diagnostic record that exposed this protocol error.

---

# 2. Critical reconciliation status

## `G-FORK-RECONCILIATION`

**THIS IS A CRITICAL RECONCILIATION STEP.**

Reference-simulation result:

```text
new projectId belongs to Tom                         PASS
current projectRevision belongs to Tom project      PASS
inherited choices materialized into TOM-R001        PASS
changed width invalidates donor downstream facts    PASS
WorkPacket regenerated from TOM-R001                PASS
BOM/material requirement regenerated from TOM-R001  PASS — reference simulation
Store request regenerated from TOM-R001              PASS — reference simulation
price basis recalculated from TOM-R001               PASS — legacy fixture economics only
Tom offer/order bind Tom lineage                      PASS
Tom Operations Packet binds Tom lineage               PASS
no donor transaction record controls Tom order       PASS
```

This pass establishes transaction-lineage reconciliation only.

It does **not** establish physical D-001 commissioning, physical stock suitability, actual measured tolerance, live payment processing, or physical fabrication authority.

---

# 3. Transaction lineage

```text
STARTING TEMPLATE / PROVENANCE
Critical Fit reference project
        ↓ FORK
TOM PROJECT
SIM-CF-TOM-001
        ↓
TOM-R001
        ↓
SIM-WP-CF-TOM-R001
        ↓
SIM-SZ-REQ-CF-TOM-R001
        ↓
SIM-SZ-RSP-CF-TOM-R001
        ↓
SIM-PRICE-CF-TOM-R001
        ↓
SIM-OFFER-CF-TOM-001
        ↓
SIM-ORDER-CF-TOM-001
        ↓
SIM-PAY0-CF-TOM-001
        ↓
SIM-REL-CF-TOM-001
        ↓
SIM-OP-CF-TOM-001
        ↓
SIM-D001-CF-TOM-001
        ↓
SIM-D001-OUTCOME-CF-TOM-001
        ↓
SIM-CLOSEOUT-CF-TOM-001
        ↓
SIM-CUSTODY-CF-TOM-001
        ↓
SIM-OWNERRECORD-CF-TOM-001
```

The donor/reference project is not part of this active transaction chain after the fork.

It remains provenance only.

---

# 4. F00 — Tom account / actor

```text
accountId        DEMO-TOM-001
actor            TOM
authenticated    true
projectId        SIM-CF-TOM-001
transactionMode  REFERENCE_SIMULATION
```

Tom is the owner of this reference transaction.

No Sarah/reference account ID is permitted to appear as the controlling account on Tom's F02–F15 records.

---

# 5. F01 — Source evidence

## SOURCE EVIDENCE — NOT THE ORDERED PRODUCT

Tom intentionally begins from the same permitted demonstration scan / room fixture used by the Critical Fit reference example.

```text
sourceId     DEMO-CRITICAL-FIT-SCAN-001
sourceClass  DEMO_SHARED_FIXTURE
```

Source/context facts carried by that fixture:

| Source fact | Value | Meaning |
|---|---:|---|
| room/opening width | 45 1/2 in | physical/context reference from shared demo source |
| room height | 94 1/2 in | physical/context reference from shared demo source |
| available depth | 14 1/2 in | physical/context reference from shared demo source |
| mantel reference | 45 in | context/reference feature |
| controlling representation resolution | nearest 1/32 in | representation rule |

These values are allowed to match the earlier reference project because Tom is using the same source fixture.

They are **not** Tom's ordered furniture dimensions merely because they appear in Tom's project record.

The source evidence answers:

> What place / source did Tom start from?

It does not answer:

> What did Tom order?

---

# 6. Starting template / provenance

Tom starts from the existing Critical Fit project/template.

```text
parentProjectRef = CRITICAL-FIT-REFERENCE
relationship     = DERIVED_FROM / STARTING_TEMPLATE
transactionUse   = PROVENANCE_ONLY
```

The donor project may explain why Tom initially sees a 72-in height, 14-in depth, five shelves, Pine, and the existing shelf elevations.

Those donor values cannot remain active transaction facts by inheritance alone.

Before `TOM-R001` is confirmed, each consequential value is copied into Tom's own project state and confirmed as Tom's current choice.

---

# 7. F02 — WHAT TOM ORDERED

This is the controlling ordered definition for the reference transaction.

## Tom's confirmed configuration — `TOM-R001`

| Ordered/configured fact | Tom value | Basis in this transaction |
|---|---:|---|
| unit height | 72 in | inherited starting value, materialized and confirmed by Tom |
| unit width | **43 1/2 in** | changed by Tom |
| unit depth | 14 in | inherited starting value, materialized and confirmed by Tom |
| shelf quantity | 5 | inherited starting value, materialized and confirmed by Tom |
| shelf elevations | 12, 24, 36, 45, 65 in | inherited starting values, materialized and confirmed by Tom |
| material | Pine | inherited starting value, materialized and confirmed by Tom |
| back | none | inherited starting value, materialized and confirmed by Tom |
| fit intent | centered intentional clearance | newly confirmed for Tom revision |
| nominal left clearance | 1 in | derived from Tom fit intent and geometry |
| nominal right clearance | 1 in | derived from Tom fit intent and geometry |

These are now **Tom's values** because they exist in and are confirmed by `TOM-R001`.

They are not active Sarah/reference values even where the numbers are identical.

## Derived Tom geometry

```text
43.500 Tom unit width
-0.750 left side member
-0.750 right side member
=42.000 Tom nominal interior span
```

Therefore:

```text
Tom controlling shelf-part crosswise requirement = 42.000 in
```

The source opening remains 45.500 in, but Tom did **not** order a 45.500-in-wide unit.

The receipt and Operations Packet must reflect 43.500-in unit width and 42.000-in derived interior span.

```text
definitionId   SIM-CF-TOM-R001
projectId      SIM-CF-TOM-001
projectRevision TOM-R001
status         CONFIRMED_REFERENCE
```

---

# 8. Change consequence / invalidation event

Tom's width change invalidates downstream derivations from the donor/reference revision.

Reference event:

```text
invalidationId       SIM-INVALIDATE-CF-TOM-001
changedField         unitWidth
priorStartingValue   45.500 in
TomValue             43.500 in
invalidate           derived geometry
invalidate           BOM/material derivation
invalidate           WorkPacket
invalidate           Store request/response
invalidate           price basis
invalidate           offer/order eligibility
invalidate           Operations Packet
```

The remedy is regeneration from `TOM-R001`.

The remedy is **not** copying the donor BOM, price, or Store answer and editing a dimension label.

---

# 9. F03 — Tom WorkPacket regenerated from TOM-R001

```text
workPacketId    SIM-WP-CF-TOM-R001
projectId       SIM-CF-TOM-001
projectRevision TOM-R001
accountId       DEMO-TOM-001
basis           GENERATED_FROM_TOM_R001
```

The packet carries:

- shared-source evidence references as provenance;
- Tom's 43 1/2-in unit width;
- Tom's 72-in unit height;
- Tom's 14-in unit depth;
- Tom's five shelf elevations;
- Tom's Pine material choice;
- Tom's no-back choice;
- Tom's centered-clearance intent;
- 42.000-in derived interior span;
- project/part relationships;
- regenerated material requirement;
- requested machine-neutral operations;
- labeling requirements;
- unresolved physical/process conditions.

No donor WorkPacket is promoted into Tom's transaction.

No controller code appears here.

---

# 10. Tom BOM / material requirement regenerated from TOM-R001

The current rich Critical Fit configuration logic is replayed against Tom's confirmed revision.

The width change reduces the crosswise finished requirement but does not cross the stock-count threshold in this reference fixture.

The **regenerated Tom result** is therefore:

```text
10 × Pine 1×6×96
 4 × Pine 1×6×72
 1 × Alcove hardware pack
```

Important:

> These quantities are not valid for Tom because the donor project used the same quantities.

They are valid in this reference simulation because the material requirement was **regenerated from `TOM-R001` and independently produced the same represented stock count**.

Record basis:

```text
bomId            SIM-BOM-CF-TOM-R001
projectRevision  TOM-R001
basis             CALCULATED_FROM_PROJECT_REVISION
resultSimilarity  SAME_COUNT_AS_DONOR_BY_REDERIVATION
```

## Retained physical-process snag

The 72-in parent / exact 72-in finished-side question remains unresolved for physical deployment because the Job 1 operating narrative establishes a cleanup/origin face.

Therefore:

```text
physicalProcessClosure = UNRESOLVED — PROCESS_LENGTH_CLOSURE_REQUIRED
```

This does not invalidate the reference-simulation lineage test.

It does block any claim that the represented parent stock has been proven physically sufficient.

---

# 11. F04 — Tom Store request and Store response

A new Store request is generated from Tom's WorkPacket.

```text
storeRequestId    SIM-SZ-REQ-CF-TOM-R001
projectId         SIM-CF-TOM-001
projectRevision   TOM-R001
workPacketId      SIM-WP-CF-TOM-R001
basis             REQUEST_GENERATED_FROM_TOM_R001
```

Requested/current represented material lines:

```text
10 × STB-ZERO-PINE-1X6-96-001
4 × STB-ZERO-PINE-1X6-72-001
1 × STB-ZERO-HW-ALCOVE-PACK-001
```

Requested crosswise finished requirement where applicable:

```text
42.000 in
```

Reference Store response:

```text
storeResponseId   SIM-SZ-RSP-CF-TOM-R001
requestId         SIM-SZ-REQ-CF-TOM-R001
projectRevision   TOM-R001
store             Store Zero reference fixture
machineFamily     D-001
physicalAuthority false
```

Operation dispositions:

| Tom requested requirement | Tom reference disposition |
|---|---|
| Pine material mapping | SUPPORTABLE — reference fixture |
| establish workpiece reference | SUPPORTABLE — Job 1 reference path |
| square crosscut to Tom packet length | SUPPORTABLE — reference D-001 path |
| preserve part identity | SUPPORTABLE |
| labeling | REQUIRED |
| staging / closeout | SUPPORTABLE — reference workflow |
| physical production | NOT CLAIMED |
| 72-in parent/process adequacy | UNRESOLVED — PROCESS_LENGTH_CLOSURE_REQUIRED |

No donor Store response is used as Tom's Store answer.

The fact that Store selects the same SKUs in this simulation is a result of the new Tom request, not transaction inheritance.

---

# 12. F05 — Tom price basis regenerated from TOM-R001

## Material

Reference Store fixture prices:

```text
Pine 1×6×96   $20.99 ea
Pine 1×6×72   $15.74 ea
hardware pack $18.00
```

Tom regenerated material result:

```text
10 × $20.99 = $209.90
4 × $15.74  =  $62.96
               -------
material       $272.86
hardware        $18.00
```

The material subtotal equals the donor/reference total because Tom's regenerated stock counts are the same.

The basis is different:

```text
basis = TOM_R001_REDERIVATION
```

not:

```text
basis = DONOR_ORDER_COPY
```

## Legacy dynamic cycle fixture

The recovered 0.2.2 economics remain non-authoritative because they include historical placeholder recovery assumptions.

For this transaction they are used only as a regression fixture.

Tom's 42.000-in requirement is substituted into the width-sensitive modeled travel component rather than carrying the donor/reference crosswise dimension.

Reference-simulation result:

```text
material                     $272.86
legacy modeled cell replay    $83.48
hardware                       $18.00
                              -------
Tom fixture total             $374.34
```

Price record:

```text
priceBasisId      SIM-PRICE-CF-TOM-R001
projectRevision   TOM-R001
storeResponseId   SIM-SZ-RSP-CF-TOM-R001
basis             LEGACY_FIXTURE_REPLAY_FROM_TOM_R001
amount            374.34 USD
commercialTruth   DEMONSTRATION_ONLY
measured          false
commissioned      false
```

The old recovery values are not promoted to the new machine-recovery standard.

A future compliant price must use the derived machine-recovery model and the exact current revision.

---

# 13. Second `G-FORK-RECONCILIATION` check — before offer/order

Before commercial state is created, the transaction is checked again.

```text
account = DEMO-TOM-001                         PASS
project = SIM-CF-TOM-001                       PASS
revision = TOM-R001                            PASS
WorkPacket = SIM-WP-CF-TOM-R001                PASS
Store response = SIM-SZ-RSP-CF-TOM-R001        PASS
Price basis = SIM-PRICE-CF-TOM-R001            PASS
controlling donor transaction refs             NONE
```

Result:

```text
G-FORK-RECONCILIATION = PASS — REFERENCE_SIMULATION
```

---

# 14. F06 — Tom reference offer

```text
offerId          SIM-OFFER-CF-TOM-001
accountId        DEMO-TOM-001
projectId        SIM-CF-TOM-001
projectRevision  TOM-R001
workPacketId     SIM-WP-CF-TOM-R001
storeResponseId  SIM-SZ-RSP-CF-TOM-R001
priceBasisId     SIM-PRICE-CF-TOM-R001
amount           374.34 USD
status           REFERENCE_OFFER
```

## WHAT THIS OFFER IS FOR

```text
43 1/2-in-wide Critical Fit unit
72-in unit height
14-in unit depth
5 shelves
shelf elevations 12, 24, 36, 45, 65 in
Pine
no back
centered intentional clearance within shared 45 1/2-in source opening
42.000-in derived interior span
```

The room's 45 1/2-in opening appears only as source/context evidence.

It is not the ordered unit width.

---

# 15. F07 — Tom order

Tom accepts the reference offer.

```text
acceptanceId     SIM-ACCEPT-CF-TOM-001
orderId          SIM-ORDER-CF-TOM-001
accountId        DEMO-TOM-001
projectId        SIM-CF-TOM-001
projectRevision  TOM-R001
offerId          SIM-OFFER-CF-TOM-001
amount           374.34 USD
mode             REFERENCE_SIMULATION
```

## WHAT TOM ORDERED

```text
unit width     43.500 in
unit height    72.000 in
unit depth     14.000 in
interior span  42.000 in
shelves        5
material       Pine
back           none
fit intent     centered intentional clearance
```

## Tom order material lines

```text
10 × STB-ZERO-PINE-1X6-96-001
4 × STB-ZERO-PINE-1X6-72-001
1 × STB-ZERO-HW-ALCOVE-PACK-001
```

These are Tom's order lines because they were regenerated and bound to `TOM-R001` before order creation.

---

# 16. F08 — Payment Zero

```text
paymentId      SIM-PAY0-CF-TOM-001
orderId        SIM-ORDER-CF-TOM-001
accountId      DEMO-TOM-001
projectRevision TOM-R001
amount         374.34
currency       USD
processor      DEMO / NONE
paymentMode    REFERENCE_SIMULATION
status         PROCESSED
fundsStatus    AVAILABLE
```

## Payment receipt

**Receipt ID:** `SIM-RECEIPT-PAY-CF-TOM-001`

```text
CUSTOMER: TOM
ORDER: SIM-ORDER-CF-TOM-001
PROJECT REVISION: TOM-R001
AMOUNT: $374.34 USD
STATUS: PAYMENT PROCESSED — DEMONSTRATION TRANSACTION
FUNDS: AVAILABLE — DEMONSTRATION
LIVE MONEY MOVEMENT: NONE
```

No Sarah/reference payment state exists in or controls this transaction.

---

# 17. F09 — Tom simulation release

Payment does not create machine authority.

```text
releaseId                    SIM-REL-CF-TOM-001
orderId                      SIM-ORDER-CF-TOM-001
projectRevision              TOM-R001
workPacketId                 SIM-WP-CF-TOM-R001
simulationAuthorized         true
physicalExecutionAuthorized  false
```

```text
paid != released
released != machine ready
machine ready != Cycle Start
```

---

# 18. F10 — Tom Operations Packet

```text
operationsPacketId  SIM-OP-CF-TOM-001
accountId           DEMO-TOM-001
projectId           SIM-CF-TOM-001
projectRevision     TOM-R001
workPacketId        SIM-WP-CF-TOM-R001
orderId             SIM-ORDER-CF-TOM-001
releaseId           SIM-REL-CF-TOM-001
machineFamily       D-001
mode                REFERENCE_SIMULATION
```

Controlling machine-neutral crosswise requirement:

```text
CROSSCUT finished kept length 42.000 in
```

The packet does not contain or reference the donor/reference 43.875-in Job 1 example as Tom's controlling operation.

Machine-neutral sequence:

```text
LOAD Tom-order identified stock
ESTABLISH workpiece reference
CROSSCUT Tom packet-defined finished kept length 42.000 in where applicable
PERFORM only other Tom-packet admitted operations
RELEASE
LABEL Tom packet-defined part identity
```

No controller-specific motion appears here.

---

# 19. F11 — Tom machine admission

```text
machineJobId        SIM-D001-CF-TOM-001
projectRevision     TOM-R001
operationsPacketId  SIM-OP-CF-TOM-001
workPacketId        SIM-WP-CF-TOM-R001
orderId             SIM-ORDER-CF-TOM-001
mode                REFERENCE_SIMULATION
```

Local readiness simulation:

| Condition | State |
|---|---|
| Tom job active | yes |
| Tom Operations Packet active | yes |
| represented Tom order stock available | yes |
| Store identity reconciled | yes |
| fence/support path | represented clear |
| tools | represented clear/retracted |
| workholding | represented open |
| feed rollers | represented raised |
| longitudinal origin | not yet established |
| physical commissioning | false |
| physical execution authority | false |

The machine sees Tom's job identity and Tom's packet requirement.

No operator re-enters Sarah/reference geometry.

---

# 20. Local simulated Cycle Start

```text
cycleStartEventId            SIM-CYCLESTART-CF-TOM-001
machineJobId                 SIM-D001-CF-TOM-001
projectRevision              TOM-R001
source                       LOCAL_MACHINE_SIMULATION
networkCycleStart            false
applicationCycleStart        false
physicalExecutionAuthorized  false
```

---

# 21. F12 — Tom Job 1 core replay

The preserved Job 1 operating pattern remains:

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
SERVO INDEX TO TOM REQUIRED OPERATION
↓
CUT / MILL / DRILL AS CALLED BY TOM PACKET
↓
REPOSITION WITHIN VALID REFERENCE CHAIN
↓
COMPLETE TOM REQUIRED OPERATIONS
↓
RELEASE
↓
LABEL TOM PART
↓
TOM JOB CART
```

## Representative Tom shelf-part run

### Load

The Tom Operations Packet identifies the Store item and part.

### Establish references

The simulated workpiece is seated to the D-001 reference chain.

```text
POSITION_VALID = false
```

### Establish longitudinal origin

The simulated cleanup/origin cut establishes the fresh origin face.

```text
POSITION_VALID = true
```

### Index to Tom requirement

```text
FINISHED KEPT LENGTH = 42.000 in
```

### Simulated cut outcome

```text
outcomeId               SIM-D001-OUTCOME-CF-TOM-001
projectRevision         TOM-R001
requestedFinishedLength 42.000 in
measuredFinishedLength  NOT_MEASURED
status                   SIMULATED_MACHINE_COMPLETE
```

### Release / label

The reference workflow labels the part with Tom job/part/revision identity and sends it to the Tom job cart.

A correct donor/reference label is not accepted as a Tom label.

---

# 22. Material / outcome reconciliation

Reference-simulation reconciliation distinguishes:

```text
represented Tom order stock
allocated Tom job stock
simulated consumed stock
unused full stock
usable remainder
cutoff / process loss
rejected attempt
Tom labeled finished part
```

Exact physical remnant dimensions are not invented.

```text
materialLedgerId          SIM-MATLEDGER-CF-TOM-001
projectRevision           TOM-R001
actualConsumptionMeasured false
exactRemnantDimensions    UNRESOLVED_UNTIL_PHYSICAL_RUN
```

No donor material ledger is treated as Tom's physical result.

---

# 23. F13 — Tom inspection

```text
inspectionId            SIM-INSPECT-CF-TOM-001
projectRevision         TOM-R001
packetIdentityMatch     true
TomPartIdentityMatch    true
requiredLabels          PRESENT_IN_SIMULATION
physicalDimensions      NOT_MEASURED
physicalTolerancePass   NOT_CLAIMED
status                  REFERENCE_INSPECTION_COMPLETE
```

The nearest-1/32 representation rule does not become a fake physical tolerance.

---

# 24. F14 — Tom staging / pickup ready / custody

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
FULFILLED — REFERENCE SIMULATION
```

Every transition binds:

```text
accountId = DEMO-TOM-001
projectId = SIM-CF-TOM-001
projectRevision = TOM-R001
orderId = SIM-ORDER-CF-TOM-001
```

No donor/reference fulfillment event satisfies Tom's closeout.

---

# 25. Tom closeout reconciliation

| Check | Tom reference result |
|---|---|
| customer/account | `DEMO-TOM-001` |
| project | `SIM-CF-TOM-001` |
| revision | `TOM-R001` |
| WorkPacket | `SIM-WP-CF-TOM-R001` |
| Store response | `SIM-SZ-RSP-CF-TOM-R001` |
| order | `SIM-ORDER-CF-TOM-001` |
| Operations Packet | `SIM-OP-CF-TOM-001` |
| machine job | `SIM-D001-CF-TOM-001` |
| controlling unit width | **43.500 in** |
| controlling interior span | **42.000 in** |
| material lines | regenerated/bound to TOM-R001 |
| labels | Tom lineage represented |
| physical measurement | not claimed |
| 72-in process-length closure | unresolved physical-deployment item retained |
| staged/ready/custody | simulated Tom events only |

Reference closeout result:

```text
REFERENCE_SIMULATION_FULFILLED
```

---

# 26. TOM COMPLETION RECEIPT

## STORE ZERO — DEMONSTRATION COMPLETION RECEIPT

```text
receiptId          SIM-RECEIPT-CF-TOM-001
customerProfile    DEMO-TOM-001
projectId          SIM-CF-TOM-001
projectRevision    TOM-R001
workPacket         SIM-WP-CF-TOM-R001
Store response     SIM-SZ-RSP-CF-TOM-R001
offer              SIM-OFFER-CF-TOM-001
order              SIM-ORDER-CF-TOM-001
payment            SIM-PAY0-CF-TOM-001
release            SIM-REL-CF-TOM-001
Operations Packet  SIM-OP-CF-TOM-001
machine job        SIM-D001-CF-TOM-001
inspection         SIM-INSPECT-CF-TOM-001
closeout           SIM-CLOSEOUT-CF-TOM-001
custody            SIM-CUSTODY-CF-TOM-001
```

## WHAT TOM ORDERED

```text
Critical Fit unit
width          43.500 in
height         72.000 in
depth          14.000 in
interior span  42.000 in
shelves        5
shelf heights  12, 24, 36, 45, 65 in
material       Pine
back           none
fit            centered intentional clearance
```

## SOURCE CONTEXT — NOT ORDER DIMENSIONS

```text
shared demo opening width 45.500 in
shared demo room height   94.500 in
available depth           14.500 in
mantel reference          45.000 in
```

The receipt separates these sections intentionally.

A reader must not mistake the shared-source opening width for Tom's ordered unit width.

## Tom material / order lines

```text
10 × Pine 1×6×96
4 × Pine 1×6×72
1 × Alcove hardware pack
```

Basis:

```text
REGENERATED_FROM_TOM_R001
```

## Tom reference transaction amount

```text
material                    $272.86
legacy Tom cycle replay      $83.48
hardware                      $18.00
                             -------
DEMO TOTAL                   $374.34
```

```text
PAYMENT = PROCESSED — DEMONSTRATION
FUNDS = AVAILABLE — DEMONSTRATION
REFERENCE FULFILLMENT = COMPLETE
PHYSICAL FABRICATION = NOT CLAIMED
PHYSICAL PICKUP = NOT CLAIMED
```

---

# 27. F15 — Tom Owner Record

```text
ownerRecordId  SIM-OWNERRECORD-CF-TOM-001
accountId      DEMO-TOM-001
projectId      SIM-CF-TOM-001
projectRevision TOM-R001
```

Chronology:

1. permitted shared demo scan referenced as source evidence;
2. existing Critical Fit project identified as starting template/provenance;
3. new Tom project `SIM-CF-TOM-001` created;
4. donor/template transaction state excluded from Tom lineage;
5. inherited configuration choices materialized into Tom project state;
6. Tom changed unit width to 43 1/2 in;
7. Tom confirmed retained 72-in height, 14-in depth, five shelf positions, Pine, and no back as his own current values;
8. centered-clearance intent confirmed for Tom;
9. `TOM-R001` confirmed;
10. downstream donor derivations invalidated;
11. 42.000-in interior span regenerated from Tom revision;
12. Tom BOM/material requirement regenerated;
13. regenerated material count happened to equal donor/reference represented count;
14. new Tom WorkPacket issued;
15. new Tom Store request issued;
16. new Tom Store response recorded;
17. Tom price replay recalculated against Tom revision;
18. `G-FORK-RECONCILIATION` passed before offer;
19. Tom reference offer issued;
20. Tom accepted;
21. Tom order created;
22. Tom Payment Zero record processed;
23. separate Tom simulation release issued;
24. Tom Operations Packet issued;
25. Tom D-001 simulation job admitted;
26. Tom local simulated Cycle Start recorded;
27. 42.000-in Tom requirement propagated into machine simulation;
28. Tom outcome/label identities represented;
29. Tom material ledger kept separate from donor history;
30. Tom reference inspection recorded;
31. Tom package staged;
32. Tom pickup-ready event recorded;
33. Tom closeout prepared;
34. Tom simulated custody transfer recorded;
35. Tom completion receipt issued;
36. Tom Owner Record closed for the reference simulation.

The donor/reference project remains visible only as provenance.

It is not rewritten as Tom history and it is not used as Tom transaction truth.

---

# 28. Critical reconciliation proof

This packet demonstrates the specific rule that the prior packet violated:

```text
same scan may remain source evidence
same template may remain provenance
same numerical values may survive after confirmation
same stock count may reappear after recalculation
BUT
Tom's transaction must be regenerated and bound to TOM-R001
```

The test is not whether every number becomes different.

The test is whether every consequential downstream number and state can answer:

> **Which exact customer's exact project revision produced me?**

For this packet, the answer must be:

```text
DEMO-TOM-001
SIM-CF-TOM-001
TOM-R001
```

If the system cannot prove that lineage, the transaction must block with an explicit reconciliation error rather than inherit donor truth.

---

# 29. Remaining implementation items exposed by the corrected packet

The reference-simulation packet is now transaction-isolated, but the runtime still needs implementation work before this becomes live behavior:

1. project fork creates a new durable project ID/revision lineage;
2. inherited choices are materialized into the new project before confirmation;
3. configuration change invalidates downstream dependent records;
4. `G-FORK-RECONCILIATION` becomes an executable fail-closed gate;
5. WorkPacket/BOM regenerate from the current project revision;
6. Store request/response IDs bind current revision;
7. price engine consumes current revision rather than hard-coded alcove geometry;
8. offer/order/payment/release/Operations Packet bind one revision lineage;
9. completed-job receipt renders `WHAT THIS CUSTOMER ORDERED` separately from `SOURCE EVIDENCE`;
10. regression test proves donor transaction IDs cannot leak into a forked job;
11. occurrence-level BOM/nesting and 72-in process-length closure still require real physical-process resolution;
12. D-001 commissioning/tolerance/controller-in-loop proof remains outside this reference simulation.

---

# 30. Final state

```text
PROJECT FORK / TRANSACTION LINEAGE  RECONCILED IN REFERENCE SIMULATION
TOM ORDER DEFINITION               TOM-R001
TOM UNIT WIDTH                     43.500 in
TOM INTERIOR SPAN                  42.000 in
TOM ORDER / PAYMENT / PACKET       TOM LINEAGE ONLY
DONOR PROJECT                      PROVENANCE ONLY
SHARED SCAN                        SOURCE EVIDENCE ONLY
REFERENCE TRANSACTION              FULFILLED
PHYSICAL FABRICATION               NOT CLAIMED
```

**Critical principle:**

> **Copying a project copies a starting definition. It does not copy another customer's transaction.**

**NO BLOOD ON WOOD.**
