# Operational Closure Rules 0.1

**Owning surface:** Application / Store boundary  
**Status:** bounded implementation rule for `build/app-durable-jobs-0.1`  
**Store candidate:** `GeorgePlattDemo/scan-to-build-store@096e99d645d745b1670185f46c75de75f9e59661`  
**Physical authority:** absent  
**Safety invariant:** **NO BLOOD ON WOOD**

This file records the smallest rules required to move the current application toward durable manufacturable projects without redesigning architecture, widening a machine envelope, weakening Store, or adding controller authority.

## 1. Long stock means unresolved support, not impossible stock

The current D-001 Store envelope remains controlling:

- parent stock longer than 96 in refuses with `PARENT_LENGTH_REQUIRES_UNDECLARED_EXTERNAL_SUPPORT`;
- `externalSupport` remains `UNRESOLVED`;
- the application must not reinterpret that refusal as a claim that long stock is physically impossible.

The current machine/cell engineering source contemplates auxiliary infeed/outfeed roller stands for over-length stock, but their exact support geometry and capacity are unresolved.

Therefore:

```text
Store >96 in refusal
    != "long lumber cannot be handled"

Store >96 in refusal
    == "the support configuration required for this length is not declared
        in the current Store envelope"
```

No application code may silently remove the 96 in gate. Advancing that limit requires a separately evidenced Store-envelope decision.

## 2. One current tab-planning policy

For `SHEET_MODE2_ARCHED_APERTURE_V0`, the current pinned Store already uses:

`S001-STENCIL-TAB-POLICY-V0`

That existing Store policy is the selected reference-planning policy for this application pass. The application does not reproduce or replace its formula.

Current Store policy facts retained for audit:

- placement: `DISTRIBUTED_ARCLENGTH_TRANSITION_AVOIDANCE`;
- reference base count: 4;
- planning reserve: 1;
- planned count is at least the Store policy target;
- the reserve is not a safety factor;
- `physicalRetentionStatus = NOT_MEASURED`;
- bridge width, retained thickness, proven maximum gap, and holding strength remain unmeasured.

The owner-facing audit should retain the policy identity and summary result, not every candidate tab coordinate.

Minimum retained summary:

```text
tabPolicyId
requestedTabCount
plannedTabCount
tabPlanStatus
planningReserveTabs
placement
perimeter_in
arcLength_in
nominalSpacing_in
physicalRetentionStatus
physicalNote
```

The full Store response remains inspectable at the integration boundary when needed. The durable owner/project record does not need to repeat every tab point.

## 3. Decision-level audit, not machine telemetry

The durable project audit exists to answer:

- what requirement was current;
- what material identity was used;
- which Store/envelope version evaluated it;
- whether Store returned SUPPORTABLE / REFUSED / UNRESOLVED / UNAVAILABLE;
- why;
- which derived geometry mattered;
- which pricing basis applied;
- which human decision changed the project;
- which Review digest bound the result.

The durable project audit does not need:

- every sawblade rotation;
- every servo interpolation sample;
- every spindle revolution;
- every raw simulator clock tick;
- controller micro-telemetry duplicated into the owner record.

Machine/controller traces may remain available as machine-site evidence and be bound later by digest/identity if that architecture is activated.

## 4. Envelope -> pricing truth

Pricing is downstream of capability evaluation.

### D-001

When the Store job is `SUPPORTABLE`, the current Store estimator may return:

- material;
- modeled cell recovery;
- modeled `T_job_min`;
- total budgetary `Q`.

These are modeled/reference economics, not measured production economics or a commercial quote.

### S-001

When the Store job is `SUPPORTABLE`, the current Store estimator returns material-only economics:

- material amount;
- `processQ = null`;
- `processQ_status = UNRESOLVED`;
- `Q_basis = MATERIAL_FIXTURE_ONLY`.

The application must not present the S-001 material amount as a complete fabrication price.

### Other dispositions

`REFUSED`, `UNRESOLVED`, and `UNAVAILABLE` do not receive an inferred fabrication estimate from the application.

`NOT_CLAIMED` is an evidence/physical status, not a Store job disposition and not a pricing status.

## 5. Provisional material human-resolution gate

A project may retain an application-owned provisional material identity using the prefix:

`PROVISIONAL-`

It is never a Store SKU and must carry:

```text
status = PROVISIONAL
catalogStatus = NOT_IN_STORE_CATALOG
storeSku = null
storeDisposition = UNRESOLVED
sellingPrice = null
stockStatus = null
supportedOps = null
cellFamily = null
authority = false
```

When the provisional material becomes consequential to supported Review, the application raises:

`HUMAN_RESOLUTION_REQUIRED`

The human has exactly three bounded decisions:

1. `MAP_TO_STORE_OFFERING`
   - select an existing real Store SKU;
   - create a new candidate revision;
   - issue a new Store question;
   - require a new Review;
   - the human decision does **not** create `SUPPORTABLE`.

2. `KEEP_UNRESOLVED`
   - retain the project/material history;
   - complete supported Review remains blocked;
   - unresolved acknowledgment may remain available.

3. `REMOVE_OR_REPLACE`
   - remove it from the active candidate or replace it with another material entry;
   - consequential replacement follows the same resolution path.

There is no `OVERRIDE_STORE_REFUSAL`, `FORCE_SUPPORTABLE`, or local price/capability override.

## 6. Published-job Store answer audit projection

The application may project a compact, bounded answer from the raw candidate Store result.

Keep:

```text
store pin
job id / request type / Store SKU
Store disposition
envelope id
reason codes
unresolved codes
evidenceClass / physicalStatus / commissioned when Store returns them
derived circular-segment summary when applicable
tab-policy summary when applicable
estimate status
material
cell recovery when returned by D-001
processQ status when returned by S-001
Q + Q basis
modeled runtime + cycle model/basis when returned
physicalExecutionAuthorized = false
controllerOutputProduced = false
```

Do not promote missing evidence fields by inference. Do not copy controller language into this record.

## 7. Durable Rect/Arch stop condition

Rect and Arch remain isolated published-job trials until the exact Store candidate is exercised through a complete clean checkout at:

`096e99d645d745b1670185f46c75de75f9e59661`

Required real-Store proof remains:

- SUPPORTABLE happy paths;
- REFUSED and UNRESOLVED paths;
- correct envelope/reason propagation;
- Store-derived arch radius;
- tab-policy result;
- route-depth enforcement;
- REFERENCE / NOT_CLAIMED / commissioned-false evidence where returned;
- rejection of machine-local language;
- no mock, reduced catalog, or copied evaluator.

Only after that gate passes may Rect/Arch be connected to the durable candidate -> Store request -> attempt -> response -> Review -> Record chain.

That sequencing is an operational gate, not bureaucracy: durable records should bind results that have actually been exercised against the exact Store they claim to represent.
