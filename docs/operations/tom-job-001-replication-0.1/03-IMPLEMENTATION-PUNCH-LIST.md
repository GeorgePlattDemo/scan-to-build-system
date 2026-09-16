# Tom Job 001 Replication — Implementation Punch List

**Package:** `TOM-JOB-001-REPLICATION-0.1`  
**Purpose:** exact implementation deltas exposed by replaying the existing Job 001 circuit with Tom's 43 1/2 in Critical Fit configuration.

This is **not** a redesign list.

The operating core already exists as the donor. The work below is what must surround and connect that core so one identified configuration can actually drive the entire transaction without manual reinterpretation.

---

# P0 — one authoritative configurator state

## P0-01 — unify the rich Critical Fit definition and the accepted alcove runtime object

Current problem:

- the reader-facing Critical Fit configuration carries room height, unit height, unit width, depth, shelf elevations, material and fit intent;
- the accepted `alcove-shelf-blanks` class still centers on a smaller six-input shelf-blank definition.

Required result:

One identified project revision must carry every consequential Critical Fit value needed downstream.

No downstream view may reconstruct missing values from prose.

---

## P0-02 — make fit intent a first-class value

Tom proves that a width change can make inherited prose false.

Required fields should distinguish at least:

```text
openingWidth
unitWidth
fitIntent
leftNominalClearance
rightNominalClearance
```

The application may derive arithmetic clearance.

It may not invent the customer's reason or fit strategy.

---

# P0 — definition → part / BOM closure

## P0-03 — generate an occurrence-level part manifest

The configurator currently exposes enough information to describe the unit, but the Job 1 / pricing fixture does not yet prove every physical occurrence from that definition.

Required result:

```text
project revision
→ part occurrences
→ each finished part definition
→ each requested operation
→ parent-material requirement
```

Every part must have an identity before Store allocation.

---

## P0-04 — reconcile the 14-in shelf-depth / `3 across` statement

The current presentation must explicitly explain how the 14-in finished depth is achieved from the selected material strategy.

Required result:

- exact component widths;
- any required rip / mill / joining operation;
- Store disposition for each operation;
- no hidden operation.

If the existing material strategy cannot close, Store must `DEFER` or `REFUSE` rather than silently call the BOM complete.

---

## P0-05 — close finished-length versus parent-length process loss

The current 72-in configured unit height and represented 72-in parent stock conflict with the Job 1 origin-cleanup concept unless a validated process preserves enough usable length.

Required result:

Store material resolution must account for:

```text
finished requirement
+ process / origin loss where applicable
+ cutter / kerf accounting
<= usable parent stock
```

Possible valid outcomes:

- longer parent SKU selected;
- separately validated origin method;
- different Store path;
- refusal.

Do not solve this by changing the customer's finished dimension.

---

## P0-06 — add explicit nesting / parent-stock allocation

Stock quantity must derive from the occurrence manifest rather than from a shelf-count shortcut.

Required chain:

```text
part occurrences
→ nesting / cut plan
→ parent stock count
→ predicted remnants
→ actual consumption later
```

---

# P0 — Store / operation coverage

## P0-07 — one operation-coverage row for every requested operation

Allowed values:

```text
SUPPORTED
REFUSED
UNRESOLVED
NOT_APPLICABLE
```

No requested operation may disappear between configuration and Operations Packet.

---

## P0-08 — preserve Store as independent authority

The application may prepare the question.

Store owns:

- offering identity;
- SKU mapping;
- reference stock state;
- declared capability/envelope;
- support/defer/refuse disposition;
- commercial/reference Store facts.

The completion layer may not turn a Store refusal into supportability after the fact.

---

# P0 — pricing

## P0-09 — remove hard-coded Alcove geometry from the price entry point

The current pricing helper must stop owning project facts such as:

- fixed 45.5 width;
- hidden 0.125 allowance;
- old 65-in side-member assumption.

Required result:

The pricing request consumes the exact identified project / WorkPacket revision.

---

## P0-10 — replace the old placeholder machine-recovery assumptions

The historical `$35 setup + $100/hr` values remain useful only as legacy fixture evidence.

Required result:

```text
annual documented machine/cell recovery cost pool
÷ forecast productive machine hours
= derived machine recovery rate
```

Job recovery then derives from modeled occupied cell time and explicitly declared operation/service policies.

Every input receives a basis such as:

```text
OBSERVED
DECLARED_POLICY
CALCULATED
REFERENCE_MODEL
MEASURED
UNRESOLVED
```

---

## P0-11 — preserve dynamic-price causality

Tom's width test should become an automated regression:

```text
change width once
→ derived span changes
→ machine-neutral requested length changes
→ modeled travel time changes
→ price changes only where the economic basis changes
```

A dimension may change without changing stock count or price materially.

The application must not fabricate a price movement merely to make the UI feel dynamic.

---

# P0 — configurator completeness

## P0-12 — every finished configurator must carry the minimum reader-visible evidence package

At minimum:

1. challenge / intended outcome;
2. source / captured conditions;
3. step-by-step resolution;
4. editable choices;
5. reasons for consequential choices;
6. visible derived arithmetic;
7. drawing / representation tied to the same state;
8. resulting definition;
9. part / BOM requirement;
10. material resolution;
11. requested operations;
12. dynamic reference economics;
13. price basis;
14. bounded machine / cell description;
15. machine capabilities;
16. machine limitations and evidence status;
17. Store packet preview;
18. Store authority limits;
19. exclusions / unresolved items;
20. version / propagation identity;
21. authority boundaries;
22. reconciliation / build guide.

**Template the completeness, not the prose.**

Critical Fit is the full reference implementation.

---

# P0 — account / commerce wrapper

## P0-13 — account gate

Anonymous users may:

- browse;
- configure;
- run Store evaluation;
- inspect price.

An identified profile is required to:

- accept offer;
- create order;
- process Payment Zero;
- proceed toward release.

---

## P0-14 — durable reference offer

Offer must bind:

```text
account
project revision
WorkPacket
Store response
price basis
terms version
amount
```

No geometry is retyped into the offer.

---

## P0-15 — durable order / acceptance record

Acceptance creates a new order record referencing the offer.

It does not mutate the historical offer into an order.

---

## P0-16 — Payment Zero state chain

Implement durable reference events:

```text
PAYMENT_REQUESTED
PAYMENT_PROCESSED
PAYMENT_RECEIVED
FUNDS_AVAILABLE
```

Required receipt fields include:

```text
paymentId
orderId
accountId
amount
currency
processor = DEMO / NONE
paymentMode = REFERENCE_SIMULATION
status
fundsStatus
```

No live money movement is implied.

---

## P0-17 — production release is separate

Payment does not create release.

Release does not create machine readiness.

Required invariant:

```text
paid != released
released != machineReady
machineReady != CycleStart
```

---

# P0 — Operations Packet / machine boundary

## P0-18 — issue one standard Operations Packet

The Operations Packet references the frozen WorkPacket and Store-selected facts.

It carries:

- identified material lines;
- part identities;
- admitted machine-neutral operations;
- operation coverage dispositions;
- order/release identities;
- unresolved conditions;
- labeling requirement.

It does **not** carry application-generated controller code.

---

## P0-19 — bounded machine panel on every finished configurator

For D-001 show at minimum:

```text
cell ID
envelope/version
stock bounds
admitted operation families
reference/modeled status
measured status
commissioned status
important unresolved physical limits
physical-execution authority = false until earned
```

The same pattern applies to S-001 with its own envelope and limits.

---

## P0-20 — durable machine-admission / readiness record

The job should record:

- packet identity;
- active job identity;
- required stock/material match;
- local readiness state;
- position/reference state;
- machine mode;
- local Cycle Start event.

The network/application cannot manufacture local readiness.

---

# P0 — result / material conservation

## P0-21 — occurrence-level operation outcomes

Each required operation should produce or reference an outcome record.

The Owner Record does not need every servo sample, but it must be able to answer:

- what was required;
- what operation was attempted;
- whether it completed;
- which part resulted;
- which exception/retry occurred.

---

## P0-22 — material ledger

Required material states include:

```text
on hand
allocated
picked
consumed
unused full stock
usable remnant
cutoff / kerf / process loss
rejected stock
staged
```

These are not interchangeable.

The >20% / $5 disposal policy can only be applied honestly after material conservation is explicit.

---

## P0-23 — separate resolution from physical tolerance

`nearest 1/32 in` is a data/representation resolution.

It is not machine capability evidence.

Physical tolerance fields remain `UNRESOLVED` until commissioning / measurement earns them.

---

# P0 — completion / closeout

## P0-24 — steward-owned completion transitions

Keep distinct:

```text
INSPECTED
LABELED
STAGED
PICKUP_READY / DELIVERY_ARRANGED
CLOSEOUT_RECORD_PREPARED
TRANSFERRED
CLOSED / FULFILLED
```

An operator may stop/report and physically perform prescribed work, but may not silently promote authoritative project state.

---

## P0-25 — mandatory label binding

Every physical part/package leaving the production stream needs durable identity back to the project record.

Minimum useful fields:

```text
project ID
part ID
revision
material
operation/completion status
handoff status
record reference / QR target
```

Do not put customer address or price on every part label by default.

---

## P0-26 — one canonical closeout truth, multiple views

Create one closeout record.

Customer and contractor receipts are presentation depths over that same record.

Do not create a second receipt-only version of manufacturing truth.

---

## P0-27 — Owner Record chronology

The Owner Record references the actual transaction / execution / closeout records.

It must not collapse the history into `DONE` or rewrite simulated activity as physical history.

---

# P0 — regression proof

## P0-28 — Tom two-inch propagation test

This replay should become a permanent end-to-end regression fixture.

Starting state:

```text
Critical Fit reference
unitWidth = 45.500
```

Mutation:

```text
unitWidth = 43.500
```

Expected derived fact:

```text
interiorSpan = 42.000
```

The test must prove that the same revision flows through:

```text
CONFIGURATOR
→ DRAWING
→ RESULTING DEFINITION
→ PART MANIFEST
→ MATERIAL / BOM
→ STORE REQUEST
→ STORE RESPONSE
→ PRICE BASIS
→ REVIEW
→ OFFER
→ ORDER
→ PAYMENT ZERO
→ RELEASE
→ OPERATIONS PACKET
→ MACHINE JOB
→ OUTCOMES
→ INSPECTION
→ STAGING
→ RECEIPT
→ OWNER RECORD
```

Any stale 45 1/2-in/full-width interpretation downstream where Tom's 43 1/2-in revision controls is a test failure.

---

# Recommended implementation order

Do **not** tackle these as independent redesign projects.

Use the existing interstate:

```text
1. one Critical Fit state
2. occurrence/BOM closure
3. Store operation coverage
4. current-state pricing input
5. account / offer / order / Payment Zero
6. release
7. Operations Packet
8. reuse Job 001 core
9. durable simulated outcomes
10. completion / closeout / receipt
11. owner chronology
12. Tom propagation regression
```

At each step:

- preserve existing good screens and records;
- add missing detail;
- do not streamline content out;
- do not broaden machine capability silently;
- do not invent historical events;
- commit coherent checkpoints;
- inspect diffs for unrelated loss.

# Acceptance criterion

The replay is ready to become the reference implementation when a reviewer can change Tom's width once and then trace that exact identified revision from the source evidence to the final receipt without finding:

- a retyped geometry value;
- a stale prior dimension;
- a missing requested operation;
- an unexplained price;
- a Store disposition invented by the application;
- an application-generated machine authority;
- a simulated event represented as physical fact;
- or an Owner Record that rewrites history.

That is the punch list produced by the Job 1 replication.

**LICENSE TO FIX IS NOT LICENSE TO DESTROY.**  
**NO BLOOD ON WOOD.**
