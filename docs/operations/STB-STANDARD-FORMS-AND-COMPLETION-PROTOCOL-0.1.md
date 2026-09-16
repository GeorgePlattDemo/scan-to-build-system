# STB Standard Forms and Project Completion Protocol 0.1

**Status:** controlling documentation candidate; no runtime behavior changed by this document  
**Applies to:** Scan-to-Build application, Store Zero reference commerce, bounded machine/cell handoff, fulfillment, and Owner Record  
**Reference implementation project:** **Critical Fit** (descriptive subtitle: alcove shelf insert)  
**Safety invariant:** **NO BLOOD ON WOOD**

---

## 1. Purpose

This protocol defines one reusable record and transaction spine for Scan-to-Build projects.

The purpose is to stop creating project-specific downstream summaries that omit facts, collapse authority boundaries, or require a reader to infer what happened.

Every project may have a different intake, narrative, configurator, geometry, Store question, machine family, and outcome. After a project definition becomes consequential, the downstream record structure is common.

The controlling rule is:

> **No abbreviated record types. Only abbreviated views.**

A later project may present fewer words than Critical Fit, but it shall not use a weaker underlying record model.

A complete project record may end in successful completion, refusal, unresolved status, or an intentionally unreached downstream stage. **Fully accounted for does not mean fabricated.**

This protocol is not a customer contract, legal opinion, payment-processing integration, machine commissioning record, or physical production authorization. It is the reference transaction/operations architecture the application must be able to demonstrate truthfully.

---

## 2. Reference presentation depths

The same underlying records may be rendered at three depths.

### 2.1 `FULL_AUDIT`

Used by the Critical Fit reference project.

Expose the complete lineage, including record identities, revisions, Store pin/envelope, material and operation basis, pricing formulas and model identities, transaction state, operations packet, release boundary, machine state, inspection, staging, custody, and Owner Record chronology.

The purpose is to prove that the system has considered and preserved the whole chain.

### 2.2 `STANDARD`

Default for subsequent bounded jobs.

Show, at minimum:

- what was defined;
- what Store accepted, refused, or left unresolved;
- what was ordered;
- included and excluded operations;
- material and price basis;
- order/payment/release status;
- what happened;
- what the customer receives;
- unresolved or unreached stages.

Each important summary shall expose a `VIEW BASIS` / `AUDIT DETAIL` control that resolves to the same durable underlying records used by `FULL_AUDIT`.

### 2.3 `SUMMARY`

Permitted for public/library previews and orientation surfaces.

A summary may omit detail but shall not contradict, upgrade, or replace the underlying record. A summary shall not create transaction, payment, release, machine, or fulfillment authority.

---

## 3. Non-negotiable record rules

### 3.1 No important fact may exist only as display copy

If the interface says:

- `Store supported` — a Store response record exists;
- `paid` — a payment record exists;
- `released` — a release record exists;
- `two straight cuts` — two operations exist in the operations packet;
- `staged` — a staging event exists;
- `fulfilled` — a custody/fulfillment record exists;
- `refused` — the refusal record identifies the exact request, rule/envelope, and reason;
- `unresolved` — the unresolved condition is named and retained.

### 3.2 No silent omission

Every requested consequential material, feature, operation, service, remnant disposition, or completion choice must receive an explicit disposition.

An unsupported request may not disappear simply because the Store or machine cannot perform it.

### 3.3 No silent authority promotion

The following remain distinct:

- owner intent;
- observed fact;
- derived geometry;
- confirmed project definition;
- Store supportability;
- budgetary/reference economics;
- offer;
- acceptance/order;
- payment evidence;
- production release;
- machine admission;
- local readiness;
- local Cycle Start;
- execution outcome;
- inspection;
- staging;
- custody transfer;
- Owner Record.

No earlier stage automatically creates a later authority.

### 3.4 No vague status

Do not use a naked `PENDING`, `PROCESSING`, `OK`, or similar vague label.

When work has not progressed, use an explicit state such as:

- `NOT_REACHED — <reason>`;
- `NOT_APPLICABLE — <reason>`;
- `UNRESOLVED — <named condition>`;
- `REFUSED — <reason code / rule>`;
- `SUPPORTABLE — <basis>`;
- `CONFIRMED — <record/version>`;
- `SUPERSEDED — <new record/version>`;
- `REFERENCE_ONLY — no physical authority`;
- `SIMULATED — no physical event represented`;
- `COMPLETE — <completion evidence>`.

### 3.5 No naked placeholder numbers

Every consequential number shall carry a basis classification:

- `OBSERVED`;
- `DECLARED_POLICY`;
- `CALCULATED`;
- `REFERENCE_MODEL`;
- `MEASURED`;
- `UNRESOLVED`.

A number shall not survive merely because it makes a screen or price look complete.

---

## 4. Common record header

Every standard form shall carry or resolve to these common fields where applicable:

| Field | Requirement |
| --- | --- |
| `formKind` | standard form identity |
| `formVersion` | form/schema version |
| `recordId` | immutable record identity |
| `projectId` | durable project identity |
| `projectRevision` | exact project/configuration revision |
| `accountId` | required once transaction authority is needed; null before that |
| `actorId` / actor class | who created or confirmed the record |
| `createdAt` | timestamp |
| `parentRecordIds` | records this form depends on |
| `sourceRefs` | evidence, Store pin, policy, model, fixture, or other basis |
| `basisClass` | observed / declared / calculated / reference / measured as applicable |
| `recordState` | active, superseded, or otherwise explicitly classified |
| `authorityCreated` | exact authority created, if any; otherwise `NONE` |
| `doesNotEstablish` | important authorities this record explicitly does not create |

A form may add domain-specific fields but may not omit identity and lineage merely to simplify presentation.

---

## 5. Standard forms register

The forms below define the common project-completion spine.

### `STB-F00 — Actor / Account Context`

**Purpose:** establish whether the person may only explore or may enter transaction state.

Required facts:

- actor context: anonymous / demo account / authenticated account / professional context;
- account identity when present;
- owner/project relationship;
- transaction permission.

Rules:

- anonymous visitors may browse, configure, receive Store evaluation, and receive a reference/budgetary price;
- anonymous visitors may **not** accept an offer, create an order, process a demo payment, create production release, or create machine authority;
- a transaction requires an identified account context;
- the demonstration account may be Sarah, but it must be represented as an account/profile record rather than an anonymous visitor magically becoming a buyer.

### `STB-F01 — Intent / Source Evidence`

**Purpose:** preserve what the user brought and what outcome the user wants.

Required facts as applicable:

- original declared need;
- source documents/images/scans/sketches/files;
- actor and timestamp;
- provenance/digest;
- observations extracted separately from the source;
- corrections and later supersession.

Authority created: owner declaration/evidence custody only.

### `STB-F02 — Confirmed Project Definition`

**Purpose:** identify the exact project version the owner is standing behind.

Required facts:

- project/class identity;
- exact configuration inputs;
- derived geometry with formulas/basis;
- requested material requirements;
- requested features;
- requested completion scope;
- intended returned parts/remnants where consequential;
- included and excluded owner work;
- unresolved conditions;
- revision/digest.

Confirmation does **not** create Store support, price acceptance, production release, or machine readiness.

### `STB-F03 — WorkPacket`

**Purpose:** preserve the validated machine-neutral definition of required work.

Required facts:

- project/configuration reference;
- BOM / material requirements;
- part occurrences and identities;
- machine-neutral operations;
- dimensions/features required downstream;
- labeling requirements;
- unresolved conditions;
- packet-validation result;
- WorkPacket identity/digest.

The WorkPacket shall not contain controller code, machine-local coordinates, servo tuning, remote Cycle Start, or fabricated physical outcomes.

### `STB-F04 — Store Evaluation`

**Purpose:** answer whether the exact requirement is supported by the exact Store state being queried.

Required facts:

- Store repository/version pin;
- request/attempt identity;
- Store SKU(s);
- quantity;
- capability/envelope identity;
- each consequential requested operation;
- operation disposition;
- material disposition;
- reason codes;
- unresolved codes;
- evidence class;
- physical/commissioning status when supplied;
- Store-derived geometry where applicable;
- pricing eligibility/status.

Allowed operation dispositions:

- `SUPPORTED`;
- `UNRESOLVED`;
- `REFUSED`;
- `NOT_REQUESTED`.

The complete job may be called supported only when every operation included in the ordered scope has adequate Store coverage.

### `STB-F05 — Price Basis / Budgetary Q`

**Purpose:** explain reproducibly how the reference price was obtained.

The price display and record shall separate at least:

1. material;
2. machine recovery;
3. declared Store operation/service charges;
4. hardware where included;
5. disposal or other explicit service charges;
6. total reference/budgetary `Q`.

Every line shall identify its policy/model/basis.

#### 5.1 Machine recovery

Do not use a fixed unexplained setup placeholder.

The reference machine-recovery method is:

```text
Annual Machine Recovery Cost Pool
  = documented annualized machine/cell capital recovery or depreciation basis
  + planned maintenance and repair
  + machine-attributable utilities
  + tooling/consumable reserve not charged directly to an order
  + documented cell-specific control/software/support cost when included
  + other documented machine-related cost with a causal basis

Machine Recovery Rate
  = Annual Machine Recovery Cost Pool
    / Forecast Productive Machine Hours

Job Machine Recovery
  = Machine Recovery Rate
    * Modeled Occupied Cell Time
```

The rate is **derived**, not declared as an industry-standard dollar amount.

The model shall retain:

- recovery model ID/version;
- included cost-pool categories;
- annual cost-pool total and basis;
- forecast productive machine hours and basis;
- derived recovery rate;
- job occupied-cell minutes/hours;
- cycle model ID/version;
- operation-level modeled time contributions;
- measured/commissioned flags;
- calculation timestamp/version.

Operation count affects recovery by contributing actual modeled occupied time: load/register, deployment/plunge, cut/feed time, index/motion, pass count, retract, tool/changeover time where applicable, inspection/release/label steps included by the model. Do not add an unexplained complexity multiplier.

#### 5.2 Methodological accounting references

The recovery model uses recognized cost-accounting principles as methodological references only.

- **48 CFR 9904.418 (CAS 418)** recognizes a machine-hour base when the relevant indirect-cost pool is predominantly facility-related costs such as depreciation, maintenance, and utilities.
- **DCAA Contract Audit Manual, Chapter 6** recognizes machine hours when machinery is the principal production factor and notes machine-oriented bases such as process time and operation movements.

Sources:

- https://www.acquisition.gov/node/40518/printable/print
- https://www.dcaa.mil/Portals/88/Documents/Guidance/CAM/CAM_Chapter_06_20250225.pdf

Scan-to-Build does **not** claim that Store Zero/3D Solutions is CAS-covered, that these sources prescribe the Store Zero dollar rate, or that a federal-government accounting method is legally required here. The sources support the **method choice**: causally related machine costs allocated over an appropriate machine-use base.

#### 5.3 Straight-cut policy for sheet combination jobs

Store Zero reference policy:

`SZ-SHEET-COMBO-STRAIGHT-CUT-10`

- operation: `FULL_STRAIGHT_CUT`;
- reference service charge: **$10.00 per admitted full straight cut** when connected to a sheet route/combination job;
- the cut must traverse completely from one applicable material boundary to another under the declared machine/envelope relationship;
- no partial/terminating straight cut;
- no retained tabs on the full straight cut;
- partial straight cut request: `REFUSED`;
- tabbed straight cut request: `REFUSED`;
- the exact direction/orientation still must be supported by the applicable Store/machine envelope.

This $10 amount is a **DECLARED_POLICY** reference price, not an industry-standard price.

Any operation charge shall say whether machine recovery is `INCLUDED` or `ADDITIVE` so the price model cannot silently double-count the same recovery basis. Until the specific Store implementation decides otherwise, the policy record must carry that field explicitly.

#### 5.4 Excess-material / disposal policy

Store Zero reference policy:

`SZ-WASTE-20-5`

- determine unconsumed material by SKU;
- sheet-stock consumption basis: area;
- dimensional-stock consumption basis: length unless another declared basis is required;
- intentional returned project components are project output, not waste;
- customer-retained remnants are `CUSTOMER_RETAINED_REMNANT`, not disposal;
- when **more than 20%** of a purchased material SKU remains unconsumed and the customer elects not to take the excess, add one **$5.00** `WASTE_DISPOSAL` charge to the job;
- exactly 20% does not trigger the rule;
- the $5 fee is once per job, not per piece or SKU;
- no disposal fee if the customer takes the qualifying excess.

This $5 amount is a **DECLARED_POLICY** reference amount, not an industry-standard disposal fee.

### `STB-F06 — Reference Offer`

**Purpose:** freeze the exact definition and budgetary/reference commercial terms being presented for acceptance.

Required facts:

- account/project identity;
- project revision;
- WorkPacket digest;
- Store evaluation identity;
- Price Basis identity;
- included material/operations/services;
- explicit exclusions;
- reference/budgetary status;
- offer revision/expiry policy if used;
- acceptance eligibility.

A Store evaluation alone is not an offer. An offer is not an order until accepted.

### `STB-F07 — Order / Acceptance`

**Purpose:** bind an identified account to the exact accepted reference offer and work definition.

Required facts:

- account ID;
- offer ID/version;
- project/WorkPacket identity;
- ordered material lines;
- ordered operation lines;
- services/fees;
- remnant/disposal election;
- total amount;
- acceptance timestamp;
- order ID;
- explicit exclusions.

Order creation requires a non-anonymous account context.

### `STB-F08 — Payment Zero Demonstration Receipt`

**Purpose:** demonstrate the payment-state boundary without representing real external payment processing.

Required facts:

- payment ID;
- order ID;
- account ID;
- amount/currency;
- `paymentMode = REFERENCE_SIMULATION`;
- `processor = DEMO / NONE`;
- created/processed/received timestamps as represented by the demo;
- funds status;
- explicit non-claim that no real card/bank/payment-network transaction occurred.

Reference progression may demonstrate:

```text
PAYMENT_RECORD_CREATED
→ DEMO_PAYMENT_PROCESSED
→ FUNDS_RECEIVED_REFERENCE
→ FUNDS_AVAILABLE_REFERENCE
```

The UI may say **PAYMENT PROCESSED — DEMONSTRATION TRANSACTION** only when the corresponding durable demonstration record exists.

Payment does not itself issue production release.

### `STB-F09 — Production Release`

**Purpose:** explicitly decide whether the exact ordered version may enter the production path.

Required facts:

- order/payment references;
- current Store/evaluation validity;
- WorkPacket identity;
- unresolved blockers;
- release decision;
- release authority/actor;
- timestamp;
- invalidation conditions.

Rules:

```text
paid != released
released != machine ready
machine ready != Cycle Start
```

### `STB-F10 — Operations Packet`

**Purpose:** freeze exactly what was purchased into a machine-neutral execution/fulfillment packet.

The Operations Packet references, rather than replaces, the WorkPacket.

Required facts:

- project/WorkPacket identity;
- order identity;
- Store-selected material identity and quantity;
- part occurrences;
- exact ordered operations and quantities;
- operation coverage/disposition;
- labels;
- requested retained outputs/remnants;
- excluded operations;
- release identity;
- inspection requirements;
- staging/package requirements;
- unresolved/stop conditions.

Every ordered operation must be represented individually. No operation may be reconstructed from prose at the machine or fulfillment stage.

The Operations Packet remains machine-neutral. Machine-local code, coordinates, offsets, I/O, servo tuning, guarding logic, and Cycle Start remain local.

### `STB-F11 — Machine Admission / Local Readiness`

**Purpose:** record the local machine/cell decision without allowing application or Store authority to impersonate machine authority.

Required facts as applicable:

- Operations Packet identity;
- cell/machine/envelope version;
- actual material identity presented;
- local reference/workholding state;
- tooling state;
- local guard/interlock/safety readiness status;
- admitted/refused decision and reason;
- local operator/cell-steward identity where represented;
- local Cycle Start authority status.

For current software/reference demonstrations, physical readiness must remain `NOT_CLAIMED` unless actual evidence exists.

### `STB-F12 — Operation Outcome Record`

**Purpose:** preserve what actually occurred for each operation.

Required facts:

- Operations Packet reference;
- operation ID;
- operation type;
- start/end or simulated event identity as applicable;
- completed/stopped/refused/faulted result;
- consequential measured/observed result;
- deviation/rework if any;
- evidence class;
- physical vs simulated/reference status.

Do not duplicate raw controller telemetry into the Owner Record. Machine-site traces may be retained separately and bound by identity/digest where needed.

### `STB-F13 — Inspection / Reconciliation`

**Purpose:** compare ordered requirements with represented outcome.

Required facts:

- part occurrence identities;
- requested dimensions/features;
- measured/observed outcomes where actual measurement is represented;
- defects/deviations;
- labeling check;
- completeness check;
- accepted/rejected/held disposition;
- evidence status.

A simulated/reference inspection must be labeled as such.

### `STB-F14 — Fulfillment / Staging / Custody`

**Purpose:** preserve the Store/material/package progression without collapsing materially different states.

The following distinctions are mandatory:

```text
on hand != allocated != picked != consumed != staged != fulfilled
```

and:

```text
staged != fulfilled
```

Required facts as applicable:

- material allocation;
- actual consumption;
- returned components/remnants;
- disposed excess and policy basis;
- completed part/package identities;
- staged state;
- ready notice;
- custody/pickup event;
- fulfillment completion.

### `STB-F15 — Owner Record / Final Reconciliation`

**Purpose:** provide one chronological, owner-held account of what actually happened without rewriting history.

At minimum it binds:

- intent/evidence;
- project revisions;
- WorkPacket;
- Store attempts/responses;
- pricing basis;
- offer/order;
- payment demonstration record where used;
- production release;
- Operations Packet;
- machine admission/outcomes where reached;
- inspection;
- staging/custody;
- unresolved/refused/not-reached stages;
- supersession history.

A later successful revision does not erase an earlier STOP or refusal.

---

## 6. Standard customer/order-facing form

Every transactable project shall be able to render a concise order-facing form with these sections.

### `WHAT YOU ARE ORDERING`

Exact project/version, parts, material, quantities, and completion scope.

### `WHAT WE ARE DOING`

Every included operation/service, quantity, and disposition.

### `WHAT WE ARE NOT DOING`

Explicit exclusions, owner-finish work, unsupported operations, installation/hardware/code/structural work not included, and any other consequential non-scope.

### `WHAT YOU GET BACK`

Finished/represented parts, retained project components, customer-selected remnants, labels/package.

### `MATERIAL AND REMNANTS`

Purchased quantity, project consumption, retained output, excess ratio, customer return/disposal election, disposal fee where triggered.

### `PRICE`

Material, machine recovery, declared operation/service charges, hardware, disposal/other charges, total `Q`, and basis/model identities.

### `CURRENT AUTHORITY / STATUS`

What has actually been confirmed, supported, accepted, paid, released, admitted, completed, inspected, staged, and fulfilled — and what has not.

A `VIEW BASIS` disclosure shall resolve from each important line to the durable record that supports it.

---

## 7. Critical Fit reference package

The library/project-facing title shall be **Critical Fit**.

`alcove shelf insert` may be used as a descriptive subtitle or bounded-class description. It shall not replace the project-facing identity merely because the implementation uses an alcove/shelf class internally.

Critical Fit is the first `FULL_AUDIT` reference implementation of this protocol.

Its public/reference package should deliberately expose the complete chain:

1. Intent / evidence;
2. Confirmed definition;
3. WorkPacket;
4. Store evaluation;
5. Price Basis;
6. Offer;
7. Order/acceptance;
8. Payment Zero demonstration;
9. Production Release;
10. Operations Packet;
11. Machine admission/readiness;
12. operation outcomes;
13. inspection/reconciliation;
14. staging/fulfillment/custody;
15. Owner Record.

The package is intentionally more detailed than later projects. Its purpose is to prove the depth of the architecture once, not to force every subsequent user-facing screen to reproduce the same prose.

---

## 8. Migration rule for existing projects

Do **not** clean up historical project screens by inventing facts needed to fill this protocol.

For each existing project:

1. identify the exact current project/version;
2. map existing records to the standard forms;
3. preserve existing Store pins, reason codes, evidence status, and STOPs;
4. create missing record types only from supported existing facts or new explicitly declared policy;
5. mark unsupported downstream stages `NOT_REACHED`, `UNRESOLVED`, or `REFUSED` as appropriate;
6. do not synthesize payment, release, physical execution, inspection, staging, or custody events from narrative donor material;
7. do not silently promote candidate projects into supported projects merely to make the protocol look complete.

Suggested implementation order after this protocol is accepted:

1. **Critical Fit** — full reference package;
2. **Board / CUT-001** — small regression/reference transaction;
3. **Playhouse / S-001** — sheet combination job, Store combo capability and sheet economics;
4. **Picnic Table** — demonstrate the same protocol with legitimate unresolved/STOP conditions;
5. **Window Seat** — demonstrate STOP → human review → revision → rerun while preserving the entire chronology.

The order may change if repository state requires it, but no project gets a custom weaker completion protocol.

---

## 9. Audit test

A `FULL_AUDIT` project should answer each of the following without relying on undocumented conversation context:

- What did the owner originally want?
- What sources/evidence were supplied?
- What exact version was confirmed?
- Where did each controlling dimension come from?
- What material was requested and what material did Store resolve?
- What exact Store/version/envelope evaluated it?
- Which operations were requested?
- Which operations were supported, refused, or unresolved?
- What WorkPacket was evaluated?
- How was every price line calculated or declared?
- What machine-recovery model/rate/time basis was used?
- What did the user actually accept?
- Which account owns the transaction?
- What Payment Zero record exists?
- Did payment create release? (It must not.)
- What exact release record authorized the production path?
- What Operations Packet was handed downstream?
- What material was allocated, picked, consumed, returned, or disposed?
- What machine/cell admitted or refused the work?
- Which operations actually occurred or were only simulated/reference events?
- What inspection/reconciliation occurred?
- What was staged?
- What was actually transferred to the customer?
- What remains unresolved or was never reached?
- What does the Owner Record preserve after all revisions and STOPs?

If any answer exists only as UI prose, the implementation is incomplete.

---

## 10. Current non-claims

Adopting this protocol does not establish:

- a legally binding sales contract;
- a live seller-of-record implementation;
- a real payment processor;
- real funds movement;
- physical stock availability;
- a commissioned D-001 or S-001 machine;
- physical production release;
- machine readiness;
- physical Cycle Start;
- actual fabrication;
- actual inspection;
- actual staging/pickup/custody;
- structural, code, installation, or child-safety approval.

Those claims require their own evidence.

The protocol exists so that when a fact is absent, the system says so explicitly; when a fact exists, its basis and consequence are traceable.

---

## 11. Governing shorthand

The public/simple meaning of this standard is:

> **Keep what the user gave us. Define exactly what the job is. Ask the Store exactly what it can support. Show where the price came from. Bind an identified user to the exact order. Keep payment, release, machine authority, execution, inspection, staging, and custody separate. Account for every requested operation and every material outcome. Preserve the whole chain — including STOPs and things that never happened.**

**NO BLOOD ON WOOD.**
