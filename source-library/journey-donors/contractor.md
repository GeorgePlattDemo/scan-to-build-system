# CONTRACTOR entry

**entryContext:** `CONTRACTOR`  
**Status:** controlling for this repository. Primary subject of this pass. Informative to M1 (CONTRACTOR is not the M1 fixture path).  
**Actor:** a contractor bringing a job, plan, takeoff, or other controlled project information.

Scan-to-Build is not the contractor’s office. It is not Jobber, Buildertrend, JobTread, Procore, Bluebeam, STACK, PlanSwift, CompanyCam, QuickBooks, or a millwork ERP. The contractor keeps those tools. This path accepts a bounded, permissioned request and returns a named resolution.

Companion: [contractor-tool-boundary.md](../architecture/contractor-tool-boundary.md).

## Why this path is different

COLD has an idea. PLACE has a home record. CONTRACTOR has **someone else’s job** plus professional artifacts.

That raises consequence:

- information is often owned by a client, an architect, or a GC, not by the person at the keyboard;
- files look complete while geometry is missing;
- money, schedule, and crew data sit next to the few fields Scan-to-Build may use;
- shop work and field work are easy to mix;
- a competent contractor can still request something the bounded cell cannot do.

The path therefore spends most of its attention on **grade** (supplied / verified / accepted / authorized), **permission**, and **the smallest useful handoff**.

## Actor

A contractor, carpenter, remodeler, small GC, or shop person acting in a commercial capacity. They may be solo or part of a crew. They are not the holder of the home record unless the same person is also the owner and is using PLACE.

| Competency the path may ask them to declare | What it is not |
| --- | --- |
| They can distinguish shop work from field work | A license check |
| They can map a takeoff line onto a published class | Automatic CAD interpretation |
| They can take or attest a field measurement | A surveyor’s stamp |
| They understand a named refusal | Authority to override a gate |

Missing competency → candidate code `COMPETENCY_NOT_DECLARED` (not an M1-activated gate). It defers or informs. It does not authorize.

## Opening condition

The contractor arrives with some combination of:

- a job identifier from their own system;
- a site address or project location;
- plan sheets or other controlled documents;
- takeoff lines;
- field measurements;
- a requested component class;
- schedule or installation constraints;
- unresolved questions (RFIs, punch, “fit TBD”);
- responsibility assignments (who supplies stock, who installs);
- a claim of client or owner permission.

None of that is in Scan-to-Build until they present it and permission is recorded. The dashboard, if any, is a set of **ingest ports**, not a PM suite.

## Information already available

- Published project classes and stock-form families.
- Declared offerings, stock bands, and machine-family records of the virtual store test module.
- Standing refusal conditions, including I0 live-motion refusal.
- Any PLACE project the holder has expressly shared with this contractor (`shareWithContractor` or equivalent permission).
- Nothing else. No crawl of the contractor’s other jobs.

## Information the actor must provide

Required for a first useful evaluation:

1. Contractor identity.
2. Job identifier (opaque, contractor-scoped).
3. Declared need for **this component**, in contractor language.
4. Published project class.
5. Stock form (`sheet` or `dimensional`).
6. Material class (not SKU).
7. Field measurements with unit, or an explicit statement that geometry is missing.
8. Measurement provenance (procedure / instrument class). Instrument class never gates by itself.
9. Shop versus field: which part of the work they want Scan-to-Build to evaluate.
10. Holder or client permission **before** a shared home record is written or a client-identifying document is retained.

Optional, preserved when supplied:

- schedule constraint (note only);
- installation constraint (limitation, not extra operations);
- plan sheet as file evidence;
- takeoff lines for human mapping;
- unresolved questions;
- responsibility assignment for material supply;
- photos as evidence.

## What a contractor may bring (inventory)

| Artifact | Typical source category | Grade on arrival | First-implementation use |
| --- | --- | --- | --- |
| Job identifier | PM / home-service | Supplied | Correlate inquiries; not a Scan-to-Build job register |
| Project location / site facts | PM, job shell | Supplied | Context for the opening; not GPS |
| Plan sheets / controlled documents | Document control, PDF markup | Supplied evidence | File reference only. No geometry extraction |
| Takeoff lines | Estimating / takeoff | Supplied | Human-mapped lines to a published class |
| Field measurements | Tape, laser, notes | Supplied until capture procedure is recorded | Become `Observation`s |
| Requested component classes | Estimate or spoken need | Supplied | Must match a published class |
| Schedule constraints | Scheduling tools | Supplied note | INFORM only; no dispatch |
| Installation constraints | Notes, photos | Supplied limitation | Do not invent operations |
| Unresolved questions | RFI / punch | Supplied text | Stay unresolved until answered by a person |
| Responsibility assignments | Contract / PM | Supplied | Shop vs field; who supplies stock |
| Shop-versus-field distinction | Professional judgment | Supplied, then accepted onto the packet scope | Required |
| Client or owner permissions | Contract, portal, verbal | Supplied until holder accepts | Block shared-record write until accepted |

## Information grades (do not collapse)

| Grade | Contractor-path meaning | Example |
| --- | --- | --- |
| **Supplied** | Presented. Provenance recorded. Not trusted as site truth. | Jobber-shaped CSV; Bluebeam markup export; a PDF |
| **Verified** | A governed capture procedure, or an explicit recorded confirmation, has checked it | Repeat measurements with unit and procedure bound to a feature of interest |
| **Accepted** | The holder has accepted the fact onto the project record | Owner accepts the declared opening; owner permits the contractor to see PLACE |
| **Authorized** | A governed authority object of the correct type | `SimulationAuthorization` only, in M1. Never production in 0.2.x. Contractor files never reach this grade on arrival |

A contractor saying “this is the approved drawing” is still **supplied**. A PM tool “approved” flag is still **supplied**. `G-CONSENT` is not imported from Buildertrend or Procore.

## Allowed records

| Front-door fact | Governed object (do not redefine) | Notes |
| --- | --- | --- |
| Contractor-stated need | `DeclaredRecord` | Holder remains the home record holder when the work is on a home |
| Job-scoped project | `ProjectInstance` | May reference contractor `jobId` as an external key; Scan-to-Build does not own the job |
| Measurements | `Observation` | Unit required for dimensional results |
| Material class + form | `MaterialSpec` | SKU prohibited as identity |
| Bounded request | `WorkPacket` | Does not authorize motion |
| Node evaluation | `JobEvaluationResult` | Distinct from `GateResult` |
| Gates | `GateResult` | Same set as every path |
| Simulation | `SimulationAuthorization` | Policy-constructed from the actual gate set |
| Result | `OutcomeRecord` | `physicalFabricationEligible=false` in M1 |

Candidate contractor-only records (not activated schemas):

- job-shell import result with `mappingStatus: geometry_missing`;
- human token-map of a takeoff line;
- operator / competency assertion with `doesNotConferOperatorAuthority: true`;
- holder-handoff inbox item (a pointer to a PLACE share, not a copy of the home).

## Unavailable assumptions

- That a job import contains openings or cut lists. Official Jobber job-import columns (help article updated 26 August 2026) are a job shell: title, client, address, times, notes, total price. **No geometry.**
- That a PDF plan is a model.
- That a takeoff quantity is an `Observation` of an opening.
- That price on a CSV is a quote Scan-to-Build should keep.
- That owner permission exists because the contractor has the drawings.
- That shop equipment the contractor owns is a Scan-to-Build machine family.
- That mixed sheet and dimensional work can ride in one packet.
- That a competent operator may start a live machine from this path.
- That Scan-to-Build will keep the contractor’s estimate, schedule, or CO log correct.

## First user-facing action

Open a **contractor dashboard with ingest ports**, not a CAD canvas and not a COLD welcome.

Required sentence on first landing:

**Imported jobs, plans, and takeoffs do not contain authorized cuts. Geometry is missing until you capture it or map it. This is not your project manager.**

Then the contractor chooses a port.

## Ingest ports (candidate; file stubs only)

Live OAuth is planned-inactive. First implementation is human-exported files and typed capture.

```
standalone build-to-project
job import (CSV/JSON shell)
site capture
plan / takeoff file
holder-handoff inbox
competency / packet acceptance assertion
```

All ports converge on the same core. None is a shortcut around gates.

### Port A — Standalone build-to-project

The contractor uses the same class → parameters → material steps as COLD, with `entryContext: CONTRACTOR` and a required `jobId`. No file import. Still not custom furniture.

### Port B — Job import (CSV/JSON)

Accept a **job shell** only.

Candidate columns: job title, job number/id, client name (if permitted), street, city, region, postal code, country, notes/instructions. **Drop any price column** (Jobber names one `Total Price`; drop it regardless of vendor).

Result:

- a contractor job row may be created;
- `mappingStatus: geometry_missing` is mandatory;
- UI must say **Imported jobs do not contain openings or cut lists**;
- malformed CSV → no job row.

Do not call this a Jobber integration. It is a file shape some contractors can produce.

### Port C — Site capture

Bind `jobId`. Per opening / feature of interest:

- numeric result + unit;
- procedure (tape, laser, phone);
- actor;
- time;
- optional repeat count and spread;
- photos as evidence references, not as measurements.

Out-of-plumb, out-of-square, and obstruction notes are **limitations**, not extra operations the cell must invent.

This is the intended path from “geometry_missing” to `Observation` records.

### Port D — Plan or takeoff file

- PDF: store as file evidence. Do not extract geometry in the first implementation.
- CSV takeoff: `token,length,width,height,unit,notes`. A **human** maps `token` to a published class or to a published operation token. Unmapped → unresolved, block. Over-specified envelope identifiers supplied by the caller are rejected at authoring. The caller may not declare eligibility.

### Port E — Holder-handoff inbox

PLACE holders may share a project with a contractor. The inbox shows shared `ProjectInstance`s this contractor is permitted to see. Revocation on the PLACE side removes the view on next load. The contractor may not copy the home record into their PM tool through Scan-to-Build.

### Port F — Competency / packet acceptance assertion

The contractor may assert that they have read a packet and accept the shop/field split. That assertion:

- does not confer operator authority;
- does not issue `SimulationAuthorization`;
- does not issue production execution authority;
- is refused or deferred if a later rule requires a declaration and none exists.

## Shop versus field

Scan-to-Build evaluates **shop-side bounded fabrication** against declared stock and declared machine families. Field installation stays with the contractor.

| Shop (may evaluate) | Field (must remain contractor) |
| --- | --- |
| Sheet shelf blanks within a published class | Fastening to the structure |
| Dimensional cleat blanks, if the class is published | Finding studs, plumbing, electrical |
| Simulated crosscut / blank operations on an allowlist | Finish on site, scribe to irregular walls as a craft act |
| Named envelope checks | Occupant protection, dust, working hours |

If the contractor needs the cell to “make it fit the out-of-square alcove” beyond the published class, that is either a new class (future library) or REFUSE. Do not silently add scribe operations.

## Handoff to the common core

Every port, once it has a bounded request:

```
DeclaredRecord (contractor-stated need; holder still owns the home record)
    → ProjectInstance (external jobId allowed)
    → Observation(s) or explicit geometry_missing
    → MaterialSpec
    → draft WorkPacket
    → store JobEvaluationRequest
    → JobEvaluationResult (simulationEligibility = not_evaluated)
    → M1 gates / GateResult set
    → INFORM / DEFER / REFUSE
    → requestSimulation only after sealed accept
    → OutcomeRecord
```

Entry context `CONTRACTOR` is recorded and **does not bypass** provenance, verification, consent, gate, packet, or authorization requirements. A contractor is not an owner for `G-CONSENT` unless they are also the holder and are acting as PLACE.

See [entry-to-store-handoff.md](../architecture/entry-to-store-handoff.md).

## Store interaction

The contractor sees the same virtual store as everyone else.

Rules that bite harder on this path:

- Price on inbound files is dropped, never echoed as a Scan-to-Build quote.
- Node stock statements are simulated. They are not the contractor’s PO and not the lumberyard’s live inventory.
- If the contractor will **supply** the stock, that is a responsibility assignment. The material still needs a `MaterialSpec` and still faces form, envelope, and family checks. “I’ll bring the cherry” does not create a `StockSnapshot`.
- Unavailable hardwood: named DEFER or REFUSE. No species substitution to keep a job moving.
- `MaterialHandlingCapability` without a current snapshot is DEFER (`STOCK_EVIDENCE_MISSING`), not a green light.

## Machine-capability interaction

Sheet family and dimensional family stay distinct. Contractor convenience is not a reason to mix them.

| Request | Machine-family result |
| --- | --- |
| Shelf blanks from sheet | Sheet-stock family only |
| Cleats from dimensional stock | Dimensional-stock family; simulation authorization currently stops at `DIMENSIONAL_M1_ENVELOPE_NOT_ACTIVATED` |
| One packet that needs both | `MIXED_FORM_NOT_SUPPORTED` |
| “Just run it on whatever is free” | REFUSE |
| Live start, G-code, nest for a controller | `REMOTE_LIVE_MOTION_COMMAND_REFUSED` |

Machines are placeholders plus declared interfaces. Do not implement control.

## INFORM / DEFER / REFUSE

| Outcome | Contractor conditions |
| --- | --- |
| INFORM | Job imported with `geometry_missing`; PDF stored as evidence only; price column dropped; shop vs field not yet chosen; they asked for a schedule slot (Scan-to-Build does not schedule); they asked what a bounded class is; holder share is available in the inbox; they need to visit in-store for matching. |
| DEFER | Geometry missing when they requested evaluation; handled material class with no current stock statement; stale snapshot; quantity evidence missing; dimensional envelope not activated; owner permission supplied but not accepted; competency required and not declared; capture present but verification unresolved. |
| REFUSE | Open millwork / custom furniture / CAD-in; unsupported class; unmapped takeoff tokens treated as operations; mixed form; envelope exceeded; form mismatch; unavailable material they asked the system to replace silently; live motion; caller-declared eligibility; forged simulation JSON; bulk import of a client list; request to write production authority; using this path to replace their PM, ERP, or estimating tool. |

## Demand as architecture (contractor interactions)

Each meaningful interaction is a recorded inquiry.

| Interaction | Stated need | Class | Requested | Supplied | Still missing | Stop | Outcome | Learnable later | Must not retain without a rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Open dashboard | Bring a job | None | Orientation | Contractor identity | Job, class, geometry, permission | — | INFORM | — | Their other clients |
| Import job shell | Attach my job | None | Job row | Title, address, notes | Openings, cut list, permission | geometry_missing | INFORM | That shells are mistaken for cut lists | Total Price; GPS |
| Map takeoff | Cut these lines | Unknown tokens | Mapping | CSV lines | Human map | Unmapped token | DEFER / REFUSE | Recurring unpublished tokens | Priced assemblies |
| Site capture | Fit this opening | Chosen class | Observations | Dimensions + unit + procedure | Verification, holder accept | Missing unit | INFORM / REFUSE | Common missing datums | Photo galleries as marketing |
| Ask for cherry sheet | Match millwork | shelving | Material class | Cherry + sheet | Current snapshot | Unavailable | DEFER / REFUSE | Recurring unavailable class | Auto-substitute oak |
| Ask for mill date | Install Friday | Chosen class | Schedule | Need-by note | Everything a scheduler needs | We do not schedule | INFORM | — | Crew locations |
| Holder inbox | Continue their project | From PLACE | Access | Share permission | — | Revoked share | INFORM or stop | — | Home record copy into PM |
| Packet acceptance | I’ll run this in the shop | Chosen class | Competency assertion | Assertion | Authority objects | Assertion ≠ auth | INFORM | Confusion between accept and authorize | Implied license |
| Send to machine | Start the saw | Any | Live motion | Command | Physical safety, operator, production auth | I0 | REFUSE | That the control is requested at all | How to start a machine |
| Mixed job | Shelves + cleats together | mixed | One packet | Both forms | Dual activation that does not exist | Mixed | REFUSE | Demand for sequenced dual-family packets | Fake tandem |

## Unresolved information

Typical contractor unresolved set:

- geometry missing;
- unmapped takeoff tokens;
- `STRUCTURAL_SPAN_NOT_EVALUATED`;
- capture not yet verified;
- holder permission not accepted;
- dimensional M1 envelope not activated;
- stock evidence missing or stale;
- shop vs field not declared;
- installation constraints noted but not evaluated (they are not evaluated in M1).

Unresolved items are never dropped to make a bid look clean.

## Owner of the next action

| Stop | Next-action owner |
| --- | --- |
| geometry_missing | Contractor (site capture) or in-store assisted capture |
| Unmapped token | Contractor (human mapping) |
| Holder permission missing | Holder, via PLACE share or explicit acceptance |
| Stock evidence missing / stale | Store test-module |
| Dimensional envelope | Governed-reference maintainers |
| Competency not declared | Contractor |
| Live motion requested | Nobody. REFUSE. |
| Unpublished class recurring | Future project-library process (not activated) |

## What is recorded for future improvement

With permission:

- published class requested;
- unpublished token or class text (the string they tried to map);
- INFORM/DEFER/REFUSE code;
- geometry_missing versus captured;
- material class requested and whether a current snapshot existed;
- that a mixed-form packet was attempted;
- that live motion was requested (safety-relevant inquiry, not a how-to).

These may later inform project-library additions, material-property research, local stock offerings, workforce training, machine-capability changes, better instructions, and improved refusal explanations. **Do not** activate an improvement registry or participant aggregate in this pass.

## What is explicitly not recorded

- Total price or any bid amount.
- GPS, routing, or vehicle location.
- Payroll, time-clock, or crew lists.
- The contractor’s other clients.
- Full plan sets beyond the designated evidence file.
- RFI/CO dollar values.
- Keystroke-level mapping attempts that never became a declared token.
- Aggregated “contractors in this zip prefer cherry.”

## Possible next actions (after opening)

- Capture geometry for an imported job.
- Map one takeoff line to one published class.
- Open a holder-shared PLACE project.
- Standalone-author a bounded component under a jobId.
- Submit to the core.
- Read a named refusal with the unresolved list.
- Request simulation only on sealed accept (sheet path in current M1).
- Export `OutcomeRecord`.
- Go in-store with the owner for matching or clarification.
- Stop and keep the work in the contractor’s own tools.

## What this path must never become

- Unrestricted CAD.
- ERP or accounting.
- CRM of homeowners.
- Project management.
- A second estimating system.
- A live machine console.

If a feature’s value depends on Scan-to-Build remaining the system of record for the contractor’s business, the feature is out of bounds.

## Acceptance sketch (documentation, not a runtime test)

1. Import a Jobber-shaped CSV that includes a price column → price dropped, `geometry_missing`, no evaluation.
2. Capture three dimensions with units on that job → author a published sheet class → named refusal or simulated sheet outcome.
3. Second path: open a holder-shared PLACE project; contractor cannot become the holder.
4. Third path: standalone CONTRACTOR authoring with a jobId and no import.
5. Dimensional class evaluates at the node if declared, then stops at `DIMENSIONAL_M1_ENVELOPE_NOT_ACTIVATED` before simulation authorization.
6. Mixed form refuses.
7. Adapter / core still rejects serialized or pasted authorization JSON.
8. Live-motion language refuses with `REMOTE_LIVE_MOTION_COMMAND_REFUSED`.

## Patent correspondence

The contractor path is **related to** the disclosures’ idea that a resolved purpose can travel to stock already sitting at a fulfillment location. Shop-versus-field splitting is **consistent with** a bounded cell that does not take over installation. This file does not claim that any contractor adapter satisfies, practices, or proves a patent claim.
