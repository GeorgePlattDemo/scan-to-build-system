# Contractor tool boundary

**Status:** controlling for this repository.  
**Purpose:** identify the smallest useful contractor handoff. Not a large integration program.  
**Claim limit:** Scan-to-Build does **not** currently integrate with any tool named here. Names are representative of categories in current practice.

This file is the companion to [docs/journeys/contractor.md](../journeys/contractor.md). The journey file specifies the CONTRACTOR entry path. This file specifies what may cross the boundary from software the contractor already uses.

## Governing limit

Scan-to-Build is not:

- a CAD or BIM authoring system;
- an ERP;
- a CRM;
- a project-management system;
- an estimating or accounting package;
- a document-control vault;
- a time-clock or payroll system.

A contractor keeps those systems. Scan-to-Build accepts a **bounded, permissioned, provenance-bearing request** for a published project class and returns a named INFORM, DEFER, or REFUSE plus, when eligible, a simulation-only evaluation. That is the whole commercial posture of this pass.

## Information grades

Every inbound field has a grade. The grade is not inferred from the filename.

| Grade | Meaning | May influence |
| --- | --- | --- |
| Supplied | The contractor provided it. Provenance recorded. Not yet checked. | Authoring a draft only |
| Verified | A governed procedure has checked it, or an explicit human confirmation is recorded | Observations and capture refs |
| Accepted | The holder has accepted it onto the project record | `DeclaredRecord` / `ProjectInstance` content |
| Authorized | A governed authority object of the correct type exists | Simulation only, in M1. Never production in 0.2.x |

A CSV from an estimating tool is **supplied**. A contractor saying “these numbers are field-checked” is still **supplied** until the capture procedure is recorded. Owner permission is **accepted** only when the holder records it. Nothing arriving from contractor software is **authorized**.

## Smallest useful handoff (first implementation)

One job, one bounded component, one permission, one measurement set, one material class, one stock form.

| Field | Required? | Grade on arrival | Notes |
| --- | --- | --- | --- |
| Contractor identity | Yes | Supplied | Who is presenting the job |
| Job identifier in the contractor’s system | Yes | Supplied | Opaque string. Scan-to-Build does not become the job register |
| Project location (site facts the component must fit) | Yes, at least as text | Supplied | Address or opening identifier; not GPS tracking |
| Bounded project class | Yes | Supplied, then selected from published list | Not a free CAD model |
| Requested stock form | Yes | Supplied | `sheet` or `dimensional`. Mixed refused |
| Requested material class | Yes | Supplied | Not a SKU |
| Field measurements with unit | Yes for a make-path evaluation | Supplied until capture procedure is recorded | Unit required on dimensional results |
| Measurement provenance | Yes | Supplied | Instrument class never gates by itself |
| Holder or client permission to use the information | Yes before a shared record is written | Must become accepted | Contractor possession of a plan is not owner permission |
| Shop versus field distinction | Yes | Supplied | What Scan-to-Build may evaluate vs what stays on site |
| Unresolved questions | Optional but preserved | Supplied | Never dropped |
| Schedule constraint | Optional | Supplied | Informational only. Not a scheduler |
| Installation constraint | Optional | Supplied | Limitation, not extra operations |
| Plan sheet or takeoff line | Optional | Supplied as evidence | PDF is a file reference, not geometry. CSV lines need human mapping |

Anything else stays in the contractor’s system.

The first implementation is **file-shaped stubs**: a human exports a CSV or JSON, a human maps tokens, Scan-to-Build records the mapping. Live OAuth is planned-inactive.

## What Scan-to-Build may return

| Return | First implementation |
| --- | --- |
| Named INFORM, with missing-field list | Yes |
| Named DEFER, with code | Yes |
| Named REFUSE, with code | Yes |
| Holder-readable explanation | Yes |
| Unresolved list, never hidden | Yes |
| Simulated evaluation outcome, if sealed accept and M1 path allow | Yes, simulation only |
| `OutcomeRecord` export | Yes, if one exists |
| Price, quote, or bid | No |
| Reservation or purchase order | No |
| Production schedule or crew dispatch | No |
| G-code, nested cut files, or controller commands | No |
| Updated estimate in the contractor’s estimating tool | No |
| Change-order dollar amount | No |

## Category analysis

For each category: what could potentially enter, what Scan-to-Build could return, what must remain in the contractor’s system, what permission or provenance is required, and what is out of scope for the first implementation.

Representative tools were checked against primary vendor documentation or official help in this pass, except where marked unresolved.

### 1. Estimating and takeoff

**Representative tools (verified this pass)**

| Tool | What the vendor documents | Source |
| --- | --- | --- |
| Bluebeam Revu | PDF markup and measurement on the drawing; Markups list tracks quantities and can export CSV or XML summaries | [Bluebeam support: Markups List](https://support.bluebeam.com/user-manual/menus/window/markups-list.html); [PDF markup for estimators](https://www.bluebeam.com/resources/pdf-markup-for-estimators-2026-guide/) |
| STACK | Cloud takeoff and estimating: linear, area, count, volume; items and assemblies; proposals | [STACK takeoff](https://www.stackct.com/takeoff/); [STACK pricing/capabilities](https://www.stackct.com/takeoff-and-estimate-pricing) |
| PlanSwift (ConstructConnect) | Digital takeoff and estimating on PDF/DWG/image; assemblies and cost reports | [ConstructConnect PlanSwift](https://www.constructconnect.com/products/planswift) |
| JobTread | Lists takeoff and estimating among construction PM features | [JobTread](https://www.jobtread.com/) |
| Buildertrend Takeoff | Digital blueprint takeoff that feeds the Buildertrend job | [Buildertrend takeoff](https://buildertrend.com/blog/buildertrend-takeoff/) |

**Could potentially enter Scan-to-Build**

- Human-mapped quantity lines that correspond to a published component class (count, length, width, thickness, unit, notes).
- A PDF plan sheet as **evidence** (file reference), not as interpreted geometry.
- Opening identifiers or room names as text.

**Could return**

- Whether a mapped line is a supported class.
- INFORM / DEFER / REFUSE per line or per bounded packet.
- Unresolved geometry if the takeoff has no fit-to-opening measurements.

**Must remain in the contractor’s system**

- Assemblies, waste factors, labor hours, unit prices, markups, proposal text, bid-day strategy, competitor coverage.

**Permission / provenance**

- The takeoff is contractor work product. Sharing it with Scan-to-Build requires the contractor’s disclosed use and, if owner-identifying, holder permission.
- Mapping of a takeoff token onto a Scan-to-Build operation or class is a **human** act. Auto-mapping is out of the first implementation.
- Unmapped tokens become unresolved (`UNKNOWN_OPERATION` or class unsupported) and block. They are not guessed.

**First-implementation out of scope**

- Reading Bluebeam, STACK, or PlanSwift project databases.
- Priced assemblies.
- AI auto-count as if it were a verified `Observation`.
- Bid-level imports (an entire house takeoff as one packet).

### 2. Project management

**Representative tools (verified this pass)**

| Tool | What the vendor documents | Source |
| --- | --- | --- |
| Procore | Project tools including RFIs, change events, documents | [Procore RFIs](https://support.procore.com/products/online/user-guide/project-level/rfi) |
| Buildertrend | End-to-end residential builder PM: schedule, estimate, budget, change orders, documents, client portal | [Buildertrend FAQs](https://buildertrend.com/frequently-asked-questions/) |
| JobTread | Construction estimating and project management | [JobTread](https://www.jobtread.com/) |
| Jobber | Home-service jobs, quotes, work orders, scheduling | [Jobber features](https://www.getjobber.com/features/) |
| Houzz Pro | Software platform for construction and design professionals | [Houzz Pro help](https://pro.houzz.com/pro-help/r/how-to-export-content-from-another-software) |

**CoConstruct.** Houzz Pro help still documents CoConstruct export as of 25 August 2026. Third-party industry write-ups in 2026 describe CoConstruct as maintenance-only and closed to new customers. An official Buildertrend sunset notice was **not retrieved** this pass. Treat CoConstruct as **not a live new-customer product** and do not design a new adapter for it. Mark the official sunset statement **unresolved**.

**Could potentially enter**

- Job or project identifier, title, site address, client display name (if permitted).
- Notes that the contractor explicitly selects to send.
- A pointer that a PLACE holder has shared a project (`shareWithContractor`).

**Could return**

- Status of the Scan-to-Build inquiry against that job identifier: draft, deferred, refused, simulated.
- Unresolved list.

**Must remain**

- The project as a whole: budget, Gantt, daily logs, punch, client portal, selections, allowances, warranty.

**Permission / provenance**

- A contractor PM record is not a holder-controlled home record. Cross-writing requires holder permission.
- Client names and addresses are user-provided information, not a marketing list.

**First-implementation out of scope**

- Two-way project sync.
- Creating Scan-to-Build projects from every new Jobber or Buildertrend job.
- Live OAuth.
- Treating a PM “approved” flag as governed authorization.

### 3. Scheduling

**Representative tools (verified this pass)**

| Tool | What the vendor documents | Source |
| --- | --- | --- |
| Jobber | Calendar, crew assignment, routing, recurring jobs | [Jobber scheduling](https://www.getjobber.com/features/scheduling/) |
| Buildertrend | Project scheduling as a core feature | [Buildertrend FAQs](https://buildertrend.com/frequently-asked-questions/) |
| JobTread | Tasks and scheduling | [JobTread](https://www.jobtread.com/) |

**Could potentially enter**

- A contractor-stated need-by date or on-site window, as a **constraint note**.

**Could return**

- Nothing that looks like a production slot.
- INFORM that Scan-to-Build does not schedule crews or machines.

**Must remain**

- Crew calendars, drive-time optimization, GPS, dispatch, recurring-visit series.

**Permission / provenance**

- Schedule data often includes customer occupancy. Do not ingest GPS or routing trails.

**First-implementation out of scope**

- Calendar sync.
- Promising a mill date.
- Reading Jobber GPS / vehicle location (Jobber documents live vehicle GPS; that stream must not enter).

### 4. Document control

**Representative tools (verified this pass)**

| Tool | What the vendor documents | Source |
| --- | --- | --- |
| Procore Documents | Central repository for files of any type; folders, permissions, revisions, download tracking | [Procore Documents](https://support.procore.com/products/online/user-guide/project-level/documents) |
| Bluebeam | PDF as the controlled drawing; markup history | [Bluebeam Markups List](https://support.bluebeam.com/user-manual/menus/window/markups-list.html) |

**Could potentially enter**

- A specific plan sheet the contractor designates, stored as a file reference.
- Revision identifier as text, if supplied.

**Could return**

- That the file was recorded as evidence.
- That geometry was **not** extracted.

**Must remain**

- The vault, permission matrix, revision comparison, bidder folders, model viewers.

**Permission / provenance**

- Controlled documents often carry owner, architect, and contractor rights. Ingest only a copy the contractor is permitted to disclose, with the disclosed-use recorded.
- Scan-to-Build does not become the record copy of the contract documents.

**First-implementation out of scope**

- BIM/IFC interpretation.
- Automatic sheet indexing.
- Keeping document control in sync.

### 5. Field measurement

**Representative tools (verified this pass)**

| Tool | What the vendor documents | Source |
| --- | --- | --- |
| CompanyCam | Jobsite photo and video documentation bound to a project; markup on photos | [CompanyCam photo documentation](https://companycam.com/photo-documentation); [How to take photos](https://companycam.com/resources/classes/how-to-take-photos-and-videos) |
| Jobber job import | Jobs have addresses, notes, instructions — not openings or cut lists | [Jobber Import Jobs](https://help.getjobber.com/en/articles/import-jobs/) (help article updated 26 August 2026) |

Tape, laser distance meter, and notebook remain ordinary practice. They are procedures, not products. A procedure name may be recorded on an `Observation`.

**Could potentially enter**

- Typed measurements with unit, feature of interest, procedure, actor, time.
- Photographs as **evidence**, not as automatic dimensions.
- Repeat count and spread, if the actor supplies them.

**Could return**

- Whether required observations for the class are present.
- `G-GEOM-COMPLETE` style missing-field INFORM (the gate itself remains in the core).
- Refusal to treat a photo gallery as availability or as a measurement.

**Must remain**

- The contractor’s photo archive, marketing galleries, before/after sales albums.

**Permission / provenance**

- Photos of a home are holder-sensitive. Require disclosed use and holder permission before they attach to a shared record.
- Instrument class (tape / phone / laser) is provenance. It never closes a gate by itself.

**First-implementation out of scope**

- Live CompanyCam API.
- Photogrammetry or point-cloud pipelines.
- Treating a photo as an `Observation.result`.

**Jobber-shaped file stub (candidate, not an integration)**

Jobber’s official job-import columns include Job Title, Instructions, Job Number, Client Name, Notes, Street 1, City, State/Province, Zip/Postal Code, Country, times, Assigned To, and **Total Price**. That is a job shell. It contains **no openings and no cut list**. If a future stub accepts a Jobber-shaped CSV:

- drop `Total Price`;
- set mapping status to `geometry_missing`;
- do not treat instructions text as measurements.

This is a file shape, not an OAuth client, and not a claim that Jobber’s GraphQL API was inspected this pass.

### 6. Change orders and RFIs

**Representative tools (verified this pass)**

| Tool | What the vendor documents | Source |
| --- | --- | --- |
| Procore RFIs | Organized RFI workflow; official responses; links toward change events / potential change orders | [Procore RFIs](https://support.procore.com/products/online/user-guide/project-level/rfi); [Revise an RFI](https://support.procore.com/products/online/user-guide/project-level/rfi/tutorials/revise-an-rfi) |
| Procore Change Events | Track potential cost and schedule impact of changes | [Procore Change Events](https://v2.support.procore.com/product-manuals/change-events-project) |
| Buildertrend Change Orders | Document scope, cost, schedule change; digital owner approval; job-cost connection | [Buildertrend change orders](https://buildertrend.com/project-management/construction-change-order-software/); [help: Change Order Overview](https://helpcenter.buildertrend.net/s/article/Change-Order-Overview) |
| JobTread | Lists change orders | [JobTread](https://www.jobtread.com/) |

**Could potentially enter**

- A contractor-stated change in the **declared need** or in requested dimensions, as a new declaration, not as a dollar change order.
- An unresolved question copied as text (an RFI is not an `Observation`).

**Could return**

- Whether the revised declared need still fits a published class.
- A new evaluation. Prior `WorkPacket` versions remain; revision is a new version, not an overwrite.

**Must remain**

- Cost codes, markup, owner-signature dollars, AIA billing, schedule-impact days as contractual instruments.

**Permission / provenance**

- A change that affects the home requires holder acceptance. Contractor-only approval is not enough.
- Do not ingest priced line items.

**First-implementation out of scope**

- Creating Procore RFIs or Buildertrend change orders.
- Dollar sync.
- Treating “owner signed the CO” in a PM tool as `G-CONSENT`. Consent is a governed gate on the Scan-to-Build record.

### 7. Procurement and material tracking

**Representative tools**

Contractor procurement commonly lives in the same PM/ERP suite (Procore commitments, Buildertrend POs, JobTread POs). A dedicated live inventory feed is out of scope. QuickBooks and similar accounting packages remain entirely out.

**Could potentially enter**

- A requested material class and form.
- A contractor note that they will supply the stock (shop or field), as a **responsibility assignment**, not as availability.

**Could return**

- Whether the **node** (simulated store) currently states that class, with the usual snapshot caveats.
- REFUSE or DEFER if unavailable. No invented substitute.

**Must remain**

- Purchase orders, vendor prices, receipts, SKU catalogs, deliveries, backorders.

**Permission / provenance**

- Node stock statements are simulated and time-bounded. They are not a contractor’s PO.
- Contractor-supplied stock still needs a `MaterialSpec` and still faces machine-family and envelope gates.

**First-implementation out of scope**

- Any procurement API.
- SKU identity.
- Reservation.
- Accounting.

### 8. Time and workforce coordination

**Representative tools (verified this pass)**

| Tool | What the vendor documents | Source |
| --- | --- | --- |
| Jobber | Crew assignment, team availability, mobile job view | [Jobber scheduling](https://www.getjobber.com/features/scheduling/) |
| JobTread | Time tracking | [JobTread](https://www.jobtread.com/) |

ClockShark, ExakTime, and similar time-clock products are common in the category. Their current vendor documentation was **not independently retrieved** this pass; they are named only as category examples and remain unverified here.

**Could potentially enter**

- A named responsible person for shop versus field, as text.
- A competency assertion that the contractor is willing to make (operator acceptance of a packet is **not** authorization — see the contractor journey).

**Could return**

- `COMPETENCY_NOT_DECLARED` if a later rule requires a declaration and none exists.
- INFORM that Scan-to-Build does not dispatch crews.

**Must remain**

- Timesheets, payroll, GPS time clocks, crew locations, overtime rules.

**Permission / provenance**

- Workforce data is holder-sensitive for the contractor’s business. Do not ingest it.
- Operator acceptance, if recorded, carries `doesNotConferOperatorAuthority`. It does not issue `SimulationAuthorization` or production authority.

**First-implementation out of scope**

- Time-clock integration.
- Certification registries beyond a simple declared competency flag, and even that flag is candidate, not M1-activated.

## Category summary

| Category | May enter (first impl.) | May return | Stays in contractor system | Permission | Out of scope now |
| --- | --- | --- | --- | --- | --- |
| Estimating / takeoff | Human-mapped lines; PDF as evidence | Named class fit; INFORM/DEFER/REFUSE | Prices, assemblies, bids | Contractor disclosed use; human mapping | Live takeoff APIs; AI counts as observations |
| Project management | Job id, title, address, selected notes | Inquiry status | The project itself | Holder permission to share | OAuth, two-way sync |
| Scheduling | Optional need-by note | “We do not schedule” | Calendars, GPS, dispatch | No GPS ingest | Calendar sync, mill slots |
| Document control | Designated sheet as file ref | Evidence recorded, no geometry extracted | Vault and revisions | Disclosure rights | BIM, auto-index |
| Field measurement | Units, procedure, photos as evidence | Completeness INFORM; geometry gates in core | Photo archive | Holder permission for home photos | Live camera APIs, point clouds |
| Change orders / RFIs | Revised declared need; unresolved question text | New versioned evaluation | Dollar COs, official RFI workflow | Holder acceptance of home-affecting changes | Dollar sync; PM approval as G-CONSENT |
| Procurement | Material class; who supplies stock | Simulated node statement or refusal | POs, SKUs, accounting | No SKU identity | Inventory APIs |
| Time / workforce | Shop/field responsibility; optional competency declaration | Competency-missing deferral | Timesheets, payroll, GPS | No workforce ingest | Time clocks |

## File-stub shapes (candidate)

These are documentation shapes for a later implementation. They are not schemas in this repository and not activated M1 objects.

**Job shell (CSV/JSON)**

```
jobId, title, street1, city, region, postalCode, country, notes
```

Drop price columns if present. Result: `geometry_missing` until capture.

**Takeoff lines (CSV)**

```
token, length, width, height, unit, notes
```

Human maps `token` to a published class or operation. Unmapped → unresolved, block.

**Site capture (JSON-like conceptual)**

```
jobId, featureOfInterest, observableProperty, result, unit, procedure, madeBy, resultTime, photos[]
```

Photos are evidence references. `result` is numeric with unit. This shape is intended to become `Observation` records in the core; this package does not redefine `Observation`.

## What must never cross the boundary

- Total price, unit price, markup, or bid.
- GPS / live location streams.
- Payroll and time-clock records.
- Other clients of the contractor, by bulk export.
- Contract documents as if Scan-to-Build were the legal vault.
- CAD/BIM models treated as already-authorized geometry.
- Any command that sounds like live motion, nesting for a controller, or “send to machine.”
- Eligibility statements written by the caller.

## Recurring unresolved requests (future only)

If many contractor handoffs stop on the same missing class, missing material property, missing stock band, or unclear refusal text, that pattern may later inform:

- project-library additions;
- material-property research;
- local stock offerings;
- workforce training;
- machine-capability changes;
- better instructions;
- improved refusal explanations.

Do not activate an improvement registry or participant aggregate in this pass. Any later mechanism needs its own ownership, permission, retention, and suppression rules.

## Stopping rule

If a proposed contractor feature requires Scan-to-Build to keep the estimate, the schedule, the CO log, or the crew correct, it is the wrong feature. Return to the smallest useful handoff.
