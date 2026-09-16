# Tom Critical Fit — Job 001 Core Run and Closeout

**Package:** `TOM-JOB-001-REPLICATION-0.1`  
**Forms covered:** `STB-F11` through `STB-F15`  
**Core donor:** `STORE-JOB-001.md` at Store pin `3620b35369d70cf49733bbb0b62c0f3d9969b738`

This document does not redesign Job 001. It replays its operating sequence with Tom's identified configuration and keeps all physical claims simulated.

---

# F11 — Machine Admission / Local Readiness

## Received Store-local job

```text
machineJobId       SIM-D001-CF-TOM-001
operationsPacketId SIM-OP-CF-TOM-001
workPacketId       SIM-WP-CF-TOM-R001
orderId            SIM-ORDER-CF-TOM-001
mode               REFERENCE_SIMULATION
```

Store has already reconciled the order and packet far enough to present the declared work.

The machine site does not rediscover the alcove.

The machine site does not decide whether Tom wanted a 43 1/2 in unit.

The machine site receives the finished requirement carried by the packet.

For applicable crosswise shelf parts:

```text
FINISHED KEPT LENGTH = 42.000 in
```

## Local authority checks

The Job 001 donor keeps local control separate from network communication and requires a valid workpiece-position basis before geometry-dependent motion.

Reference readiness record:

| Condition | Simulated state |
|---|---|
| correct job active | yes |
| correct Operations Packet | yes |
| required represented stock available | yes |
| stock / Store identity reconciled | yes |
| fence / support path | represented clear |
| active saws | represented retracted |
| mill / drill stations | represented clear |
| workholding | represented open |
| feed rollers | represented raised |
| workpiece longitudinal position | not yet established |
| physical commissioning | **false** |
| physical execution authority | **false** |

The operator is shown the required Store item and part identity.

No finished dimension is typed manually at the machine.

No cut line is marked.

No project geometry is recreated.

### Snag F11-A — current D-001 is not physically commissioned

A literal physical run cannot truthfully occur from the current evidence.

### Simulated fix

The reference transaction enters:

```text
machineMode = REFERENCE_SIMULATION
```

The exact same authority sequence is exercised, but all machine-state and outcome events are labeled simulated and `physicalExecutionAuthorized = false` remains invariant.

---

# Local Simulated Cycle Start

```text
cycleStartEventId          SIM-CYCLESTART-CF-TOM-001
source                     LOCAL_MACHINE_SIMULATION
networkCycleStart          false
applicationCycleStart      false
physicalExecutionAuthorized false
```

The application does not remotely start the machine.

The Store does not remotely start the machine.

Payment does not start the machine.

Release does not start the machine.

The simulated machine reaches its own local ready state and receives a simulated local Cycle Start.

---

# F12 — Operation Outcomes

## Job 001 operating pattern preserved

For each applicable D-001 component the donor sequence remains:

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

Tom's configuration changes the requested geometry. It does not change this operating language.

---

# One-board replay — applicable shelf component

## 1. Load

The simulated Store item identified by the Operations Packet is presented.

The operator verifies the requested material identity and represented suitability.

The board is placed on the machine support in the declared orientation.

No tape-layout operation occurs.

## 2. Establish lateral and vertical references

Simulated workholding seats the board against the fixed fence and support plane.

The manipulating/feed rollers engage.

The machine now has an orientation basis, but no trustworthy longitudinal origin yet.

```text
POSITION_VALID = false
```

## 3. Establish longitudinal origin

The simulated infeed saw performs the donor's controlled cleanup/origin cut.

The new machined end becomes the longitudinal origin face.

The commercial factory end is no longer treated as the controlling length reference.

```text
POSITION_VALID = true
```

The origin cutoff is recorded as process loss / cutoff, not as a finished part.

## 4. Servo index to Tom's finished requirement

The workpiece moves under the maintained reference chain.

The packet requirement is:

```text
FINISHED KEPT LENGTH = 42.000 in
```

The job does not add blade kerf to Tom's finished dimension.

The machine/process model owns cutter geometry and kept-face transformation.

## 5. Simulated finished cut

The outfeed saw executes the simulated crosscut and retracts.

Reference result:

```text
partOutcome = SIMULATED_MACHINE_COMPLETE
requestedFinishedLength = 42.000 in
measuredFinishedLength  = NOT_MEASURED
```

## 6. Additional operations

Only operations already carried by the accepted packet may occur.

No operator creates another feature because it appears useful.

No machine capability is widened because a prior attempt succeeded.

## 7. Release and label

When the packet-defined operations for the component are complete:

- active tools retract in the simulation;
- motion stops;
- workholding releases;
- the component leaves the maintained position chain;
- the required part label is generated/applied in the reference workflow;
- the identified component moves to the job cart.

Minimum label binding represented here:

```text
projectId
revision
orderId
machineJobId
partId
material line
primary-operation status
record reference
```

Customer name, address and price are not required on every physical part label.

---

# Operator boundary preserved

In the Job 001 replay the operator may:

- retrieve the named stock;
- confirm physical material identity/suitability;
- load in the declared orientation;
- initiate a permitted local cycle;
- observe the cycle;
- STOP WORK;
- report an abnormal condition;
- remove a completed component;
- apply/confirm the prescribed label;
- place the component on the job cart.

The operator may not:

- recreate Tom's project;
- change 42.000 in to another dimension;
- re-measure the room;
- invent an allowance;
- alter Store disposition;
- create a new machine envelope;
- create a new price;
- waive a gate;
- promote the project to inspected / staged / fulfilled merely by saying the part looks good.

---

# Abnormal-cycle path

A simulated cycle is not automatically promoted to a valid part merely because motion occurred.

If the simulated basis loses:

- stable fence contact;
- stable support;
- valid feed position;
- expected tool completion;
- or another required machine-state condition,

then:

```text
POSITION_VALID = false
```

and the affected attempt does not become a completed component.

Reference recovery dispositions remain:

```text
INSPECT_AND_EXPLICITLY_ACCEPT
RECOVER_FROM_VALID_CONDITION
RERUN
REJECT_AND_REPLACE
```

A correct label cannot turn a failed attempt into a correct part.

---

# Job-wide simulated run

The replay exercises every represented D-001 line in the existing Critical Fit / Job 001 fixture.

```text
represented Pine 1x6x96 lines: 10
represented Pine 1x6x72 lines:  4
hardware pack:                    1 sourced line
```

For the 43 1/2 in Tom revision, every applicable crosswise shelf requirement carries `42.000 in` from the same identified definition.

The four 72-in represented side-member lines remain flagged by the earlier `PROCESS_LENGTH_CLOSURE_REQUIRED` snag. They are permitted to pass only in this reference simulation because no physical adequacy is being claimed.

Reference job result:

```text
machineJobId       SIM-D001-CF-TOM-001
status             SIMULATED_PRIMARY_MACHINE_WORK_COMPLETE
physicalRun        false
measuredResult     false
controllerInLoop   false
```

---

# End-of-D-001 reconciliation

Before the simulated job cart moves to staging, the donor's reconciliation is preserved:

- required D-001-routed components accounted for;
- required labels accounted for;
- represented parent-stock lines reconciled;
- unused full stock distinguished from allocated stock;
- usable remnants distinguished from cutoff/scrap;
- rejected / rerun attempts represented if any;
- no allocated material silently converted into consumed material.

### Snag F12-A — current fixture does not yet provide an occurrence-level cut / remnant ledger for the rich Critical Fit configuration

### Simulated fix

The reference transaction creates a **simulated reconciliation event**, but does not invent exact physical cutoff dimensions.

```text
stockBalanceStatus = SIMULATED_RECONCILED
actualConsumptionMeasured = false
exactRemnantDimensions = UNRESOLVED_UNTIL_PHYSICAL_RUN
```

The implementation punch list requires an occurrence-level material ledger before physical deployment.

---

# F13 — Inspection

The current project states numerical resolution to the nearest 1/32 in. That is a representation rule, not an earned physical tolerance.

### Snag F13-A — no measured D-001 tolerance has been established

### Simulated fix

The replay records only logical inspection against packet identity and completion status:

```text
inspectionId          SIM-INSPECT-CF-TOM-001
packetIdentityMatch   true
requiredPartCount     RECONCILED_IN_SIMULATION
requiredLabels        PRESENT_IN_SIMULATION
physicalDimensions    NOT_MEASURED
physicalTolerancePass NOT_CLAIMED
status                REFERENCE_INSPECTION_COMPLETE
```

The system does **not** translate `nearest 1/32 in` into a fake machine tolerance.

A future commissioned cell must earn dimensional acceptance limits through calibration and measured process evidence.

---

# Completion reconciliation

The global completion path is applied without broadening the machine.

Each required line receives a final disposition.

Reference dispositions for this replay:

| Requirement | Final reference disposition |
|---|---|
| primary D-001-routed square cuts | `MACHINE_COMPLETE` — simulated only |
| label requirement | `YARD_COMPLETE` — simulated reference workflow |
| sourced hardware pack | `YARD_COMPLETE` — simulated staging |
| unresolved physical tolerance proof | not a hidden completion claim; retained as nonclaim |
| installation | outside Store fulfillment scope |

If later implementation exposes a real residual operation, it must be represented explicitly rather than being hidden in a generic `complete` state.

---

# F14 — Staging / Fulfillment / Custody

## Staging

The simulated job cart moves to staging only after primary-machine reconciliation.

Staging reunites:

- labeled dimensional components represented by the Job 1 fixture;
- the sourced hardware pack;
- project / assembly relationship information;
- reference closeout documentation.

The donor distinction remains controlling:

> **STAGED does not mean FULFILLED.**

Reference state transitions:

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
FULFILLED
```

No state silently implies the next.

## Closeout checks

The Job 1 closeout table is preserved for Tom:

| Check | Reference result |
|---|---|
| Job identity | reconciled to `SIM-ORDER-CF-TOM-001` |
| Project relationship | bound to `SIM-WP-CF-TOM-R001` |
| Material identity | reference Store lines retained |
| Part completion | reconciled in simulation |
| Part identity | labels represented |
| Machine history | `SIM-D001-CF-TOM-001` bound |
| Exceptions | process-length and physical-measurement nonclaims retained |
| Stock balance | simulated only; exact physical remnants unresolved |
| Other order lines | hardware pack represented |
| Stage tally | reconciled in simulation |

Reference closeout result:

```text
READY FOR PICKUP
```

Tom then completes the simulated custody event:

```text
TRANSFERRED
FULFILLED
```

No physical pickup is claimed.

---

# Customer Receipt

## STORE ZERO — DEMONSTRATION COMPLETION RECEIPT

```text
receiptId          SIM-RECEIPT-CF-TOM-001
customerProfile    DEMO-TOM-001
project            Critical Fit
definition         SIM-CF-TOM-R001
workPacket         SIM-WP-CF-TOM-R001
offer              SIM-OFFER-CF-TOM-001
order              SIM-ORDER-CF-TOM-001
payment             SIM-PAY0-CF-TOM-001
release             SIM-REL-CF-TOM-001
operationsPacket    SIM-OP-CF-TOM-001
machineJob          SIM-D001-CF-TOM-001
inspection          SIM-INSPECT-CF-TOM-001
closeout            SIM-CLOSEOUT-CF-TOM-001
custody             SIM-CUSTODY-CF-TOM-001
```

### Definition received

```text
room opening       45 1/2 in
unit width         43 1/2 in
unit height        72 in
unit depth         14 in
interior span      42.000 in
shelves            5
material           Pine
fit intent         centered intentional clearance (simulated Tom decision)
```

### Reference transaction amount

```text
material                   $272.86
legacy fixture cell model   $83.48
hardware                     $18.00
                            -------
DEMO TOTAL                  $374.34
```

Payment status:

```text
PROCESSED — DEMONSTRATION TRANSACTION
fundsStatus = AVAILABLE — DEMONSTRATION
```

Fulfillment status:

```text
REFERENCE SIMULATION = FULFILLED
PHYSICAL FABRICATION = NOT CLAIMED
PHYSICAL PICKUP      = NOT CLAIMED
```

The receipt is a presentation over the same transaction records. It does not create a second manufacturing truth.

---

# F15 — Owner Record / Chronology

```text
ownerRecordId = SIM-OWNERRECORD-CF-TOM-001
```

The Owner Record retains this chronology:

1. shared demonstration source referenced;
2. Tom demo account established;
3. Critical Fit configuration instantiated;
4. width changed from 45 1/2 in to 43 1/2 in;
5. full-width language became invalid;
6. simulated centered-clearance intent recorded;
7. 42.000-in interior span derived;
8. WorkPacket `SIM-WP-CF-TOM-R001` issued;
9. Store reconciliation performed against reference material/capability data;
10. process-length and BOM-closure snags retained rather than hidden;
11. width-only legacy pricing replay produced `$374.34`;
12. reference offer issued;
13. Tom accepted;
14. order created;
15. Payment Zero processed in demo mode;
16. funds marked available in demo mode;
17. simulation release issued separately;
18. Operations Packet issued;
19. D-001 job admitted for reference simulation;
20. simulated local Cycle Start recorded;
21. workpiece-reference / position-valid sequence exercised;
22. Tom's 42.000-in requirement propagated into the simulated machine job;
23. operation outcomes reconciled without claiming physical measurement;
24. labels represented;
25. stock / remnant record retained as simulated, not measured;
26. inspection completed at reference-record level only;
27. package staged;
28. pickup-ready state recorded;
29. closeout prepared;
30. simulated custody transfer recorded;
31. reference transaction marked fulfilled;
32. payment receipt and completion receipt bound to the Owner Record.

The final state does not erase the intermediate records.

The Owner Record does not reduce the history to `DONE`.

---

# Circuit result

The Job 1 circuit is complete in this reference replay:

```text
TOM ACCOUNT
  ↓
SOURCE EVIDENCE
  ↓
43 1/2 IN CONFIGURATION
  ↓
42.000 IN DERIVED REQUIREMENT
  ↓
WORKPACKET
  ↓
STORE RECONCILIATION
  ↓
REFERENCE PRICE
  ↓
OFFER
  ↓
ORDER
  ↓
PAYMENT ZERO
  ↓
SEPARATE RELEASE
  ↓
OPERATIONS PACKET
  ↓
JOB 1 CORE
  ↓
LOCAL SIMULATED CYCLE START
  ↓
REFERENCE MACHINE OUTCOME
  ↓
LABEL / JOB CART
  ↓
INSPECTION / RECONCILIATION
  ↓
STAGE
  ↓
PICKUP READY
  ↓
CLOSEOUT
  ↓
CUSTODY
  ↓
FULFILLED
  ↓
OWNER RECORD + RECEIPTS
```

What remains is not another architecture pass. The exact gaps required to make this replay executable from one live application state are listed in `03-IMPLEMENTATION-PUNCH-LIST.md`.

**NO BLOOD ON WOOD.**
