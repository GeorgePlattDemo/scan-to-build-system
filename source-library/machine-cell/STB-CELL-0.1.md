# STB-CELL-0.1 — Tandem Cell, Control, Interfaces, and Audit

**Status:** Descriptively adopted as a working artifact on `grok-file` only. Not a Store or REF adoption. Production path closed. Candidate objects remain candidate.  
**Authority:** semantic authority remains with the governed reference (`STB-REF`). This file does not redefine WorkPacket, GateResult, SimulationAuthorization, ProductionExecutionAuthorization, Observation, MaterialClass, MaterialSpec, or refusal meaning.  
**New objects in this file:** remain candidate until adopted by their appropriate owning layer: the cell specification, Store `DEFINITIONS.md`, or `STB-REF` as required. Adoption in the cell layer does not automatically promote them into Store or governed semantics.  
**Patent posture:** correspondence to disclosed assemblies and operating modes in U.S. Patent Nos. 9,720,401 and 10,768,609. Not an infringement opinion, not a license, not a construction drawing set.  
**Readers:** cell implementers, app-building systems, and auditors.

How to use this file: implement or audit only what a filled section states. Empty sections still have no requirement force. If a filled sentence contradicts an upstream file, the contradiction is in §15. It is not resolved here by overwriting the source.

Where a mechanical or control detail is not supported by the patents or settled Store/Job 001 language, this file says **unresolved** rather than completing the picture by inference.

---

## Ownership of facts

| Fact class | Owner | This spine may |
|---|---|---|
| Project meaning, gates, packet meaning, sim/production authority | Governed reference (`STB-REF`) | cite |
| Offering, stock projection, Store accept/defer/refuse, Job 001 commercial path | Store (`STORE-ZERO.md`, `STORE-JOB-001.md`, Store `README.md`) | cite; describe cell-side consequences |
| Cell geometry, station maps, controller modes, lowering, cycle records | Cell (this file, once filled and adopted) | define as **candidate** |
| `POSITION_VALID` meaning | Store `DEFINITIONS.md` / Store `README.md` / Job 001 | cite; list invalidation events only; do not mint a second definition |
| Physical event on a specific board or sheet | Machine-local observation / cycle record | record; must not become project truth |

Job 001 remains the worked Store example. This spine must be readable without that story.

---

## 0. Purpose, readers, non-claims

This file is the reference description of the tandem cell an implementer would build toward, and the control/audit surface an app-building system may consume. It is written so a hostile reader can find the iron, the interfaces, and the holes.

It does not claim that D-001 or S-001 has been built, that production authority is issuable in governed v0.2.x, or that a public demo is a machine specification.

As stated in Store `README.md` — Current Status.  
As stated in governed reference — production authorization not issuable; I0.  
As stated in `STORE-JOB-001.md` §21 — Job 001 does not specify registers, fieldbus, encoders, slip sensing, or postprocessor syntax. This spine does not invent those either.

Non-claims:

- This file is not a live machine controller.
- This file is not a second `STB-REF`.
- Cycle Start in a reference narrative is not production authorization.

---

## 1. Authority stack and citation rule

```text
STB-REF (semantics, gates, authority)
        ↓
Store (membrane, stock, capability projection, order)
        ↓
Cell spine (this file: iron, control, interfaces, audit placement)
        ↓
Local controller / operator (motion)
```

As stated in Store `README.md` — Repository Boundary; Core Separation.  
As stated in `STORE-ZERO.md` §27–§28 — project/commerce membrane; store/machine membrane.  
As stated in `CAPTURE-TO-WORKPACKET.md` — packet does not authorize motion.  
As stated in `DEFINITIONS.md` §10 — never-equate list.

Cite, do not rewrite. New terms introduced here are marked **candidate**.

---

## 2. Patent fence (correspondence only)

Correspondence, not an infringement claim.

| Reference-cell feature | Corresponds to |
|---|---|
| Tandem pair under one order / controller path | U.S. 9,720,401 FIG. 1; U.S. 10,768,609 tandem 106 / 204 / 306+307 |
| Local computer 105 delivering instructions; employee load 107; completed materials 108 | U.S. 10,768,609 FIG. 1 narrative |
| Dimensional stock moved along a fence through fixed tooling stations | U.S. 10,768,609 FIG. 5 |
| Sheet machine with servo sheet and/or platform motion, including stencil-type outline and curvilinear routing | U.S. 10,768,609 modes 2–3; FIG. 6–8 |
| Sheet surface-contact pressure plate as depth datum | U.S. 10,768,609 FIG. 7 (709/710) |
| Label of tandem output; secondary station between the machines; optional finish | U.S. 9,720,401 / 10,768,609 FIG. 2–3 (211, 213/308, 212/309) |

Not on the fence: ordinary chop saw, ordinary panel saw, generic CNC, generic ERP, Store membrane, WorkPacket-as-governance.

---

## 3. Cell in the yard

As stated in `STORE-ZERO.md` §4, §18 — Store Zero is an ordinary yard with an employee-operated square crosscut. D-001 and S-001 are added capabilities, not a rewritten history of that saw.  
As stated in `STORE-ASSET-TO-IMPLEMENTATION-MAP.md` — add only the justified gap.

| Name | Role | Owner of the name |
|---|---|---|
| Controller computer 105 | presents job, receives status; not the real-time motion loop | patent correspondence; cell candidate |
| Sheet machine 306 / S-001 | sheet cell | cell candidate |
| Dimensional machine 307 / D-001 | dimensional cell | cell candidate |
| Local control panel per machine | jog / auto / Ready / Cycle Start; preferred “manual” is panel input, not disconnected tools | patent + Job 001 |
| Label maker 211 | part identity after a completed cycle | cell + Store |
| Secondary ops 308 / 213 | hand or portable-tool work, including mode-2 stencil separation | Store + cell |
| Finish 309 / 212 | optional coating | Store |
| Staging | package convergence | Store (`STORE-JOB-001.md` §18) |
| Tool dock 312 | sheet interchangeable heads; patent preferred embodiment does not require a dock on the dimensional machine | patent; cell candidate |

Unresolved: exact floor distances, which side is infeed, and whether a given yard implements one shared panel or two.

---

## 4. Control law

As stated in Store `README.md` — Operating conditions.  
As stated in `STORE-JOB-001.md` §4.  
As stated in `DEFINITIONS.md` §5.  
Patent correspondence: both machines accept CAM control and panel control; “manual” in the preferred embodiments is panel input to servos, including a fast jog, not disconnected hand-cranked tools. Strict manual (tools disconnected from actuators) is disclosed as possible and not preferred.

Three conditions remain separate.

**Local manual / jog.** An operator commands permitted motion through the local panel. Servos may still move the axis. Manual does not mean pushing an automated axis by hand.

**Local automatic.** The cell executes an accepted cell program under local machine control after local Ready / Cycle Start.

**Network.** The network delivers a validated job and receives status. It is not in the real-time motion loop.

> Loss of network communication shall not affect real-time motion, interlocks, state management, or stopping.

Local control owns the active cycle. A mode change is an explicit machine event. A mode change does not silently preserve an automatic workpiece position.

**Candidate events**

| Event | Meaning | Must not mean |
|---|---|---|
| `MODE_JOG` | panel-commanded permitted motion | packet rewrite |
| `MODE_AUTO` | local automatic execution of an accepted cell program | production authorization |
| `READY` | operator asserts load orientation / seating as required by the active job | `POSITION_VALID` |
| `CYCLE_START` | local start of an allowed cycle | remote motion authority |
| `CYCLE_ABORT` | cycle stopped without a completed part | silent scrap-as-part |
| `ESTOP` | hazardous motion stop | project refusal |
| `NETWORK_UP` / `NETWORK_DOWN` | comms state | enable/disable servos |

Unresolved (Appendix E): complete interlock matrix, what Ready samples, whether Ready is latched across mode change, E-stop reset sequence, fieldbus.

---

## 5. `POSITION_VALID` and reference chains

As stated in Store `README.md` — `POSITION_VALID`.  
As stated in `STORE-JOB-001.md` §5, §10–§12.  
As stated in Store `DEFINITIONS.md` — `POSITION_VALID` is machine-local; not readiness, authorization, or part conformance.  
As stated in `DEFINITIONS.md` — datum ≠ origin ≠ machine reference.

`POSITION_VALID` is already defined in the live Store files. This spine does not redefine it. Invalidation events below are cell-side consequences, still **candidate** as a typed event catalog.

When false, the machine must not execute a command whose geometry depends on known workpiece position. It may only safely release, re-establish, or recover under a later specification.

### D-001 chain (two source stories — not merged)

Patent FIG. 5 operating sequence, after clamps and manipulating rollers contact:

- Datum A / y=0 — fence line 503
- Datum B / z=0 — table / base 502, with rollers 504 holding contact
- Datum C / x=0 — automatic centering mechanism **or** operator jog from the panel

Job 001 operating sequence, after seat to fence and table:

- lateral working reference — fence
- vertical working reference — support plane
- longitudinal origin — **fresh face from the first cleanup cut**; factory end is not the length reference
- `POSITION_VALID` for length-dependent motion is false until that origin exists

These are not the same longitudinal rule. See **C-10**.

**Descriptive disposition (C-10):** For D-001 length-dependent motion described in this spine, the operating rule is Job 001: the first cleanup cut establishes the longitudinal origin. Patent Datum C (auto-center or jog) remains disclosed correspondence only. It is not the Store operating rule. Sensing method for that first-cut origin remains unresolved.

Idler rollers 505 are disclosed as protruding about 0.005 in above the table to reduce sliding friction while control is retained. That number is patent-exemplary, not a commissioned tolerance.

### S-001 chain (mode-dependent)

Mode 1 and 2, as disclosed:

- Bottom rollers 619 support and reference the sheet at y=0
- Mode 2: sheet referenced to machine centerline (patent: datum A) by yoke / manipulating rollers; datum B is distance from the bottom rollers
- Top clamping rollers hold the sheet down onto 619 so the sheet cannot migrate upward and lose that reference
- Yokes 612 press the sheet to backing plates 618(A)–(H) in mode 2

Mode 3, as disclosed:

- Sheet (or carrier plate) rigidly affixed to backing plates 618 using pins in hole matrix 620 and/or threaded clamps
- Platform moves in X and Y; sheet does not
- Depth datum is the pressure-plate contact surface on the sheet (709/710), not the backing-plate plane alone

Unresolved: encoder architecture, slip detection, allowable error, how mode-2 attach-points affect `POSITION_VALID`, whether mode-3 pin location is a formal datum or only a fixture location.

Invalidation classes belong in Appendix E. Supported enough to list without inventing sensors:

- loss of fence / plate / roller contact as declared for the active mode
- release of workholding
- mode change
- axis or tool fault
- incomplete saw / mill / drill cycle
- E-stop or abort
- operator declaration that the stick or sheet is no longer the seated workpiece

---

## 6. Machine-neutral operations and lowering

As stated in Store `README.md` — Fixed Tool Geometry.  
As stated in `STORE-JOB-001.md` §3, §7.  
As stated in `DEFINITIONS.md` — WorkPacket ≠ machine program; process plan ≠ G-code; G-code ≠ authority.

The Store emits a bounded machine-neutral sequence. The job supplies finished geometry, part-relative features, operations, and identity. The commissioned cell supplies station locations, tool identity, kerf, kept-face offset, and the transform into machine motion.

Lowering is established at commissioning. It is not authored at Cycle Start. The operator does not type lengths or hole coordinates.

**Candidate objects**

| Object | Holds | Must not hold |
|---|---|---|
| `MachineNeutralOp` | portable operation + part-relative numbers | station coordinates |
| `LoweringRecord` | envelope version + cell config identity + resulting `CellProgramIdentity` | project meaning |
| `CellProgramIdentity` | local controller program / version | WorkPacket |

Example dimensional neutral sequence (Job 001 form, not servo code):

```text
LOAD <store item>
ESTABLISH workpiece reference
CROSSCUT finished kept length <L>
MILL <feature> if required
DRILL <feature> if required
RELEASE
LABEL <part id>
```

The job does not command `L + kerf`. Kerf and kept-face live in the machine/process model.

Example sheet neutral sequence (patent modes; numbers are job-owned when present):

```text
LOAD <sheet store item>
SELECT mode 1 | 2 | 3
ESTABLISH mode references
CUT / ROUT outline | RIP | CROSSCUT as required
RETRACT / RELEASE
[MODE 2] transfer sheet to secondary for attach-point separation
[MODE 3] fixture part or carrier; PROFILE / DRILL at controlled depth
LABEL <part id>
```

Unresolved: postprocessor syntax, whether one `LoweringRecord` covers a whole order or one component, exact envelope schema. Appendix D later.

---

## 7. D-001 dimensional cell

Synthetic added capability, as described in `STORE-JOB-001.md` §3. `STORE-ZERO.md` §18 describes the original employee-operated square-crosscut baseline.  
Hardware correspondence: U.S. 10,768,609 FIG. 5.  
Control sequence correspondence: patent FIG. 5 operation **and** `STORE-JOB-001.md` §8–§16. Where they differ, see C-10.

### Stations and iron

Central base 501 carries table surface 502 and fixed fence 503 (patent: feature tooling referenced from the fence as datum A).

| Callout | Function | Actuation disclosed |
|---|---|---|
| 504 | three commonly-controlled manipulating rollers; feed along the fence; pneumatic downward urge toward the table | ascend/descend via 511 (alignment rails and air cylinders); servo operators 510 drive rotation |
| 505 | idler rollers in the table, opposite 504 | passive; exemplary protrusion ~0.005 in |
| 506 | sawing stations at each end; chop action; miter and compound miter capable | servo chop; blade angle/tilt servo-capable; fixed in one embodiment, movable carriages in another |
| 507 | clamping rollers; hold work to the fence while still allowing longitudinal travel | pneumatic |
| 508 | two vertical rigid ways | lead screw positions tool head 520; plunger 521 extends/retracts tool into the work |
| 509A / 509B | lower and upper horizontal rigid ways | lead screw positions heads 522A / 522B; plungers 523 extend/retract |
| 510 | manipulating-roller servo operators | servo |
| 511 | rotor-assembly up/down apparatus | rails + air cylinders; contact/pressure sensors disclosed at descent |

Patent typical tool fit (exemplary, not a required SKU list): drill on one vertical way, router on the other; drill on one horizontal way, router on the other. Purpose disclosed: routing or drilling from either orientation without a per-job head swap. Preferred patent embodiment: no tool dock on the dimensional machine because those heads stay on the ways.

Single-saw variant is disclosed and called undesirable: it forces end-for-end removal to work the second end. Two-saw fixed base is the easier-to-produce embodiment. Movable-carriage saws are disclosed as a more complex, faster-feed alternative that needs more calibration.

Over-length stock: auxiliary roller stands at input and/or output; machine 307 placed forward in the FIG. 3 layout for that reason. Exact stand geometry: unresolved.

Tool-head tilt beyond lead-screw position + plunger depth is disclosed as possible and explicitly not the patent’s primary concern. Specific head internals: unresolved; patent treats commercial heads as known art.

### Motion language

```text
LOAD onto 502, face/edge to 503
  ↓
CYCLE START
  ↓
507 clamp to fence
  ↓
511/504 descend to contact and hold-down
  ↓
establish A/B (fence/table)
  ↓
establish longitudinal origin   ← see C-10
  ↓
510 feeds the stick to a station
  ↓
506 chop and/or 520/522 plunge
  ↓
reposition along the fence without dropping A/B
  ↓
next station
  ↓
RELEASE 504/507
  ↓
remove part; label; next stick
```

Patent example of same-stick sequencing: drill one end at a station, shift for an end cut, shift negative-X for opposite-end holes, final cut severs the part from parent stock. Remainder of parent may feed the other saw for the next part.

Job 001 adds: first cleanup cut consumes a cutoff; finished kept length is produced by the far saw using commissioned geometry; mill then drill on the same seated board; release ends the position chain unless a later spec says otherwise.

### Operator

Retrieves the named Store item, rejects stock that will not sit on fence and table, loads declared orientation, Ready / Cycle Start, watches the cycle, clears cutoff, pulls the part, confirms label, carts it. Does not type lengths, lay out holes, or invent offsets.

### Refusals (cell-side)

- requested op not in the declared envelope
- stock will not maintain declared references
- `POSITION_VALID` false for a geometry-dependent command
- cycle abort / incomplete tool cycle
- label present does not rescue a failed attempt

Unresolved at this density: feeds and speeds, clamp pressures, saw timing, exact X of each station, which physical saw is “infeed.”

---

## 8. S-001 sheet cell

Added capability. Same Store Zero rule as D-001.  
S-001 in this spine is **patent correspondence and reference-cell description**. It is not a Store-callable capability until Store Zero / Job 001 names it.  
Hardware correspondence: U.S. 10,768,609 FIG. 6–8.  
Modes correspondence: patent specification of modes 1, 2, and 3.

Builds on the conventional backward-leaning retail panel saw (rollers at the bottom, saw on vertical guides). Frame disclosed as rigid welded tubular steel, approximately 10° off vertical. That angle is patent-exemplary.

### Iron

| Callout | Function |
|---|---|
| 601 / 602 | X-axis upper / lower guide rails with helical track 601A / 602A |
| 603 / 604 | Y-axis left / right guide rails with 603A / 604A |
| 605–608 | pinion assemblies X-upper, X-lower, Y-left, Y-right |
| 609 | movable tooling platform |
| 610 | pressure-plate sensing assembly |
| 611 / 705 | receiver for interchangeable saw / router / drill |
| 612 | rotating yokes, left and right; press sheet in mode 2; retract into gap 616 in mode 3 |
| 613–615 | servo, wood-contact rollers, shaft for yoke feed |
| 616 | vertical gap; also disclosed as centerline in the X-Y plane; gap sized so a circular saw can make horizontal cuts (depends on blade diameter — exact gap unresolved) |
| 617 | horizontal gap between upper plates A–D and lower plates E–H |
| 618(A)–(H) | eight backing plates forming one support plane |
| 619 | bottom rollers; y=0 support in modes 1 and 2 |
| 620 | **patent uses 620 twice:** hole matrix in plates 618, and top-edge clamping rollers in mode 2. Do not collapse those parts. See C-11. |
| 701–704 | platform-on-Y detail: rails, bearing mounts, rack, pinion |
| 706–711 | tool lock points, pressure-plate ring, operators, sensing plate, roller bearings, platform underside |
| 800 / 801–805 | interchangeable contour / collet-style head example; drive 803 rotates and controls depth relative to the sheet |

Tool dock 312 stores interchangeable heads. Patent: circular saw on a rotatable base, router, drill; depth along sheet Z. Saw attachment: fixed depth. Drill and router: controlled depth.

### Modes — what moves

| Mode | Sheet | Platform | Typical use as disclosed |
|---|---|---|---|
| 1 | operator / panel-commanded positioning on 619 | panel-commanded; Y pinion may be disengaged and locked at X centerline for conventional-like cuts | precise crosscut or rip from baselines via panel, not disconnected hand pull |
| 2 | servo X via yoke rollers 614 | locked at X centerline; servo Y only | stencil outline; attach points left; operator severs in 308; router can cut curves; circular saw limited to linear/rectangular outline |
| 3 | fixed to 618 or to a carrier plate pinned/clamped to 618 | servo X and Y | higher precision, slower; edge profile, etch, depth-controlled work; may finish a part first shaped in mode 2 |

Mode 2 is disclosed as faster and adequate for most consumer parts. Mode 3 is disclosed as more precise. Mode 2 attach-point corners may be left at abrupt direction changes.

Masonite or similar sacrificial layer is disclosed when the tool must pass through the sheet (through-holes, full-depth work) so the tool does not hit the plate. Material brand is example, not a requirement.

### Depth datum

Pressure plate 709 lowers on operators 708 until bearings 710 contact the sheet. That contact is the datum for tool depth relative to the **sheet surface**. The tool then advances beyond that plane to the commanded depth. Unresolved: contact-force threshold, plate deflection model, whether contact is re-taken after every retract.

### Operator

Opens yokes, slides sheet onto 619, compresses yokes for mode 1/2, selects mode or accepts the presented job, Cycle Start. After mode 2, releases yokes and rolls the sheet to 308 for attach-point cuts (hand or portable saw). For mode 3, fixtures the part or carrier, changes head if instructed, Cycle Start, removes carrier, labels.

Does not invent outline coordinates at the handle.

### Refusals (cell-side)

- mode not declared in the envelope
- circular-saw mode 2 asked to cut a curve
- sheet will not rest on 619 / will not stay against plates
- mode-3 fixture not established
- `POSITION_VALID` false for the active mode’s geometry
- tool head not the commissioned head for the op

Unresolved: rack-vs-other linear actuator choice beyond the disclosed rack-and-pinion example; exact 4×10 / 4×12 support geometry; automatic vs manual yoke-outfeed into 308 (both disclosed).

---

## 9. Shared services

**This section will state** label content vs project meaning; secondary ops; remnant / cutoff / scrap; what returns to stock.

**Citation slots**

- As stated in `STORE-JOB-001.md` §13, §17–§18.
- As stated in `DEFINITIONS.md` — offcut/remnant vs waste/scrap; on hand ≠ consumed.
- U.S. 10,768,609 / 9,720,401 — label maker; secondary station; finish.

Not filled in Stage 3 beyond what §§7–8 already require: mode-2 separation happens in 308; labels follow a completed cycle; failed cycles are not parts.

---

## 10. Interfaces the app may call

The application owns journeys and presentation. As stated in Store `README.md` — applications do not determine Store capability or issue Store authorization. As stated in `STORE-ZERO.md` §24 — the initial membrane is read/query; machine commands are later authority. As stated in governed reference — inspect / validate / run_gates never authorize live motion.

These are **candidate** call families. They are not an API spec and not a schema.

| Call family | App may ask or present | Returns / effect | App may not |
|---|---|---|---|
| Store evaluation | whether this requirement is supportable, unsupported, unavailable, unresolved, deferred, or refused | Store evaluation + freshness context | allocate stock; change price; create a PO |
| Envelope query | declared operations and limits for a named cell (`D-001`, later `S-001` if Store adopts it) | `MachineEnvelope` instance **reference**, using governed meaning | extend the envelope because a cut succeeded |
| Job presentment | which Store item to load, part identity, declared load orientation | operator-facing prompt | write servo setpoints; type kept length; type hole coordinates |
| Neutral-op view | the bounded `MachineNeutralOp` sequence the Store emitted | portable ops + part-relative numbers | treat that sequence as G-code or as the WorkPacket |
| Lowering identity | which `CellProgramIdentity` was bound for this job, if a `LoweringRecord` exists | identity / version only | download or patch controller registers |
| Status listen | cycle state, `POSITION_VALID` as reported, abort, label presented | observation / `CycleRecord` candidate | close interlocks; clear E-stop; force `POSITION_VALID` |
| Sim run | simulation where `SimulationAuthorization` exists | simulation outcome | treat the outcome as fabrication or as production authority |
| Fulfillment status | staged / ready / fulfilled as Store records it | Store commercial state | mark a failed cycle as a part |

Network delivers a validated job and receives status. It is not the motion loop. Loss of this channel does not stop a running local cycle.

No remote `CYCLE_START`. No app-issued `ProductionExecutionAuthorization`. That type exists and is not issuable in governed v0.2.x.

Payload fields beyond the columns above are not specified here.

---

## 11. Credential and audit objects — placement

Governed terms by reference. New names stay **candidate**. No field schemas.

| Object | Layer | What it covers | Must not cover | Status |
|---|---|---|---|---|
| WorkPacket | gov | versioned make-path of governed work | motion | adopted — cite `STB-REF` / Store `DEFINITIONS.md` |
| GateResult / RefusalRecord | gov | gate or refusal | Cycle Start | adopted — cite |
| SimulationAuthorization | gov | the named simulation context only | production | adopted — cite |
| ProductionExecutionAuthorization | gov | production authority type | any current v0.2.x issue | type exists; **not issuable** |
| ResolutionRecord / OutcomeRecord | gov | recorded outcome / resolution | rewrite of project meaning | adopted — cite |
| Store accept / defer / refuse | store | yard evaluation of the request | cell motion | used in Store docs; schema not in this file |
| MachineEnvelope | gov term; store declaration | declared ops and limits | readiness; authorization | term adopted; D-001/S-001 **instance** candidate |
| `POSITION_VALID` | store meaning | workpiece reference chain is or is not valid | readiness; authorization; part quality | meaning in Store `DEFINITIONS.md`; event catalog candidate |
| `MachineNeutralOp` | store/cell | portable operation + part-relative numbers | station coordinates | **candidate** |
| `LoweringRecord` | cell | envelope version + cell config identity + `CellProgramIdentity` | project meaning | **candidate** |
| `CellProgramIdentity` | cell | local program / version | WorkPacket | **candidate** |
| `CycleRecord` | cell | what the cell did this cycle | stock consumption; part acceptance | **candidate** |
| `LabelRecord` | store + cell | job, part id, material line, order relationship | proof the part is good | **candidate** |

Appendix F remains empty of fields. This table is the placement.

Order of force, unchanged:

```text
governed object
  → Store evaluation / envelope instance
    → lowering identity
      → local Ready / Cycle Start
        → POSITION_VALID
          → CycleRecord
            → label / stage / Store close
```

A later object cannot replace an earlier one. A label cannot backfill a missing GateResult. A `CycleRecord` cannot issue production authority.

---

## 12. Execution boundary

As stated in governed reference — I0; simulation-only path; default-deny live motion.  
As stated in Store `README.md` and `STORE-JOB-001.md` §4–§5.

Local automatic still requires local Cycle Start and valid local conditions. Network delivery of a job is not motion.

---

## 13. MCL mapping onto this iron

MCL is a planning label, not a runtime state. Describing full tandem iron here does not jump the Store README build order.

| Label | Proof | Not the same as |
|---|---|---|
| Position-assisted | compare only | not an MCL |
| MCL-1 | one instruction, one board, one reference, one op, one result | D-001 full station set; S-001 |
| MCL-2 | first useful multi-op cell | S-001 required |
| MCL-3/4 | later | implementation debt |

As stated in Store `README.md` and `STORE-JOB-001.md` §6.

---

## 14. What this spine does not authorize

- production execution in v0.2.x software
- remote Cycle Start
- envelope inferred from a successful cut
- Store rewrite of packet dimensions at the tool
- treating a label as proof of a good part
- treating this file as `STB-REF`
- treating patent-exemplary numbers (0.005 in, 10°) as commissioned tolerances
- resolving C-10 by treating patent auto-center as the Store operating rule
- treating S-001 as a live Store capability
- treating miter/compound on 506 as live in the Job 001 D-001 instance
- issuing `ProductionExecutionAuthorization` or remote Cycle Start because this file exists

---

## 15. Upstream conformity tab

Do not silently resolve.

| ID | Finding | Sources | Disposition |
|---|---|---|---|
| C-01 | Store Zero baseline iron is employee square crosscut, not D-001/S-001 | `STORE-ZERO.md` §18 | open — added-cell language kept |
| C-02 | Job 001 specifies D-001 only | `STORE-JOB-001.md` | **descriptive:** S-001 stays patent correspondence; no Store force |
| C-03 | README build order is contract → objects → MCL-1 before MCL-2 | Store `README.md` | open — tandem description ≠ build-order jump |
| C-04 | ProductionExecutionAuthorization not issuable in governed v0.2.x | `STB-REF` | **closed for this spine:** descriptive adoption does not issue it; no remote Cycle Start |
| C-05 | Public demo mixes sheet-nest operations with dimensional 1×6 SKUs | public demo vs Job 001 | open |
| C-06 | Mining corpus has no authority | `MINING-CORPUS.md` | open |
| C-07 | `POSITION_VALID` is defined in live Store `DEFINITIONS.md`, Store `README.md`, and Job 001. Live governed `TERMS-REGISTER.md` is an M1 pointer only; the term was not found as a `STB-REF` object in that register surface | Store DEFINITIONS line on `POSITION_VALID`; governed `TERMS-REGISTER.md` | open — Store-owned meaning; not a REF object until adopted there; spine must cite, not fork |
| C-08 | `LoweringRecord`, `CellProgramIdentity`, `CycleRecord`, `MachineNeutralOp`, `LabelRecord` | this file; not present in Store `DEFINITIONS.md` | open — candidate |
| C-09 | Job 001 fixture numbers vs public demo numbers | Job 001 vs demo | Store-owned; not resolved here |
| C-10 | Longitudinal origin: patent Datum C = auto-center or jog; Job 001 origin = first cleanup cut | U.S. 10,768,609 FIG. 5 operation; Job 001 §10 | **descriptive rule:** Job 001 first-cut origin is the D-001 operating rule here; patent C is correspondence only; sensing still unresolved |
| C-11 | Patent callout 620 used for plate hole matrix and for top clamping rollers | U.S. 10,768,609 FIG. 6 list items 12 and 20 | **open — treat as two parts** |
| C-12 | Patent “manual” includes panel-driven jog; Store/Job 001 “manual/jog” matches that preferred sense; strict disconnected manual is disclosed and not preferred | patent; Job 001 §4 | open — spine follows preferred sense; strict manual unresolved as a required mode |
| C-13 | Saw 506 miter/compound capability is disclosed; Job 001 run is square cutoff + mill + drill | patent FIG. 5; Job 001 | **descriptive synthetic instance:** square crosscut, mill, drill; miter/compound remain disclosed correspondence, not operations adopted for Job 001; no installed or commissioned capability is claimed |
| C-14 | Ownership table previously listed `POSITION_VALID` under cell-define. Live Store already defines it | Stage 2 ownership table vs Store `DEFINITIONS.md` | corrected in ownership table this stage; meaning stays Store-owned |
| C-15 | Patent “datum A/B/C” vs Store `DEFINITIONS.md` caution not to use datum casually | patent FIG. 5/6; DEFINITIONS §1 and §5 | open — patent letters are correspondence names; Job 001 “working reference / origin face” remains the Store wording |
| C-16 | Event names `MODE_JOG`, `MODE_AUTO`, `READY`, `CYCLE_START`, `CYCLE_ABORT`, `ESTOP`, `NETWORK_*` | this file §4; Job 001 uses Ready / Cycle Start in prose | open — candidate typed events; not DEFINITIONS objects |
| C-17 | S-001 is not a named live Store asset. Store Zero names employee square crosscut only; Job 001 names D-001 only | `STORE-ZERO.md` §18; Job 001 | **descriptive:** S-001 has no Store force until Store names it |
| C-18 | Appendix D uses Job 001 fixture values (`43.875 in`, `PNC-196`) as lowering examples | Job 001; App D | open — examples only; not new Store facts |
| C-19 | Appendix F remains empty of fields; §11 is placement only | this file | closed as placement; schemas still not invented |
| C-20 | Governed live tree reachable here is M1 (`STB-BUILD-M1.md`, `TERMS-REGISTER.md`). Production-not-issuable and I0 are cited from that README surface; this walk did not re-open `STB-REF-0.2.5` body text | governed README / TERMS-REGISTER | open — C-04 stands on the live README claim; full REF body not re-parsed this stage |

---

## Appendix A. D-001 parts

Sources: U.S. 10,768,609 FIG. 5 specification; Job 001 names where they already exist. Commissioning values are not invented.

| Callout | Cell name | Function | Motion / actuator class | Notes |
|---|---|---|---|---|
| 501 | base | carries stations and table | structure | preferred contiguous plate for tolerance stack; patent also allows non-contiguous support if work and idlers are supported |
| 502 | table / support plane | vertical support of the stick | structure | Job 001 vertical working reference |
| 503 | fence | lateral reference; tooling referenced from this face | fixed | patent datum A / y=0 |
| 504 | manipulating rollers (3) | longitudinal feed; downward urge to 502 | servo rotation 510; pneumatic/air down via 511 | commonly controlled |
| 505 | idler rollers | low-friction support opposite 504 | passive | patent-exemplary protrusion ~0.005 in — not a commissioned tolerance |
| 506 | end sawing stations (two in preferred) | chop cut; miter / compound-miter capable | servo chop; blade angle/tilt servo-capable | fixed base vs movable-carriage variant; live functions belong in the envelope instance (C-13) |
| 507 | clamping rollers | hold to fence while allowing travel | pneumatic | Job 001 lateral workholding |
| 508 | vertical ways (two) | locate tool head 520 in Y | lead screw | |
| 509A | lower horizontal ways | locate tool head 522A in X | lead screw | |
| 509B | upper horizontal ways | locate tool head 522B in X | lead screw | |
| 510 | roller servo operators | drive 504 | servo | |
| 511 | rotor up/down apparatus | lower 504 to contact | alignment rails + air cylinders; contact/pressure sensors disclosed | threshold unresolved |
| 520 | vertical tool-head assembly | carries drill or router on 508 | lead-screw ride + plunger | patent typical: drill on one vertical way, router on the other |
| 521 | vertical plunger | extend/retract tool into the work | servo plunger | depth numbers unresolved |
| 522A / 522B | horizontal tool-head assemblies | drill or router on 509 | lead-screw ride + plunger | patent typical: one drill, one router |
| 523 | horizontal plungers | extend/retract | servo plunger | |
| — | auxiliary roller stands | support overhang longer than the table | passive / placed | disclosed; geometry unresolved |
| — | local panel | jog / auto / Ready / Cycle Start | operator I/O | preferred manual = panel to servos |
| — | infeed vs outfeed assignment of the two 506 | Job 001 uses first-cut saw then finished-length saw | naming | which physical 506 is which: **unresolved** |

Single-saw variant: disclosed and called undesirable (end-for-end flip). Not part of the D-001 reference pattern.

Tool-head tilt other than way position + plunger: disclosed as possible; not primary. Head internals: known-art; unresolved here.

---

## Appendix B. S-001 parts

Sources: U.S. 10,768,609 FIG. 6–8. Patent callout **620 is two parts** (C-11). Rows stay split.

| Callout | Cell name | Function | Motion / actuator class | Notes |
|---|---|---|---|---|
| — | frame | supports the apparatus | structure | patent-exemplary ~10° off vertical — not a commissioned angle |
| 601 / 601A | X-axis upper rail + helical track | platform X | structure / track | |
| 602 / 602A | X-axis lower rail + track | platform X | structure / track | |
| 603 / 603A | Y-axis left rail + track | platform Y | structure / track | |
| 604 / 604A | Y-axis right rail + track | platform Y | structure / track | |
| 605 / 606 | X pinion upper / lower | drive platform X | servo pinion | rack-and-pinion is the disclosed example, not the only possible linear actuator |
| 607 / 608 | Y pinion left / right | drive platform Y | servo pinion | |
| 609 | tooling platform | carries receiver, pressure plate, tool | X and/or Y per mode | FIG. 6 vs FIG. 7 aspect ratio difference is called insignificant |
| 610 | pressure-plate sensing assembly | sheet-surface contact for depth | servo descend until contact | threshold unresolved |
| 611 / 705 | tool receiver | accepts saw / router / drill | interchangeable | lock points 706 |
| 612 | rotating yokes L/R | mode 2 press sheet to 618; retract in mode 3 | rotate / press / retract | retract into 616 in mode 3 |
| 613 | yoke servos | drive 614 | servo | |
| 614 | yoke wood-contact rollers | mode 2 sheet X feed | servo via 615 | |
| 615 | yoke shafts | couple 613 to 614 | shaft | |
| 616 | vertical gap | yoke stow; also disclosed as X-Y centerline | structure | width depends on saw blade diameter — exact gap unresolved |
| 617 | horizontal gap | between upper plates A–D and lower E–H | structure | mode 3 clamp fixtures may register here |
| 618(A)–(H) | eight backing plates | one support / reference plane | structure | hole matrix and threaded holes for pins/clamps |
| 619 | bottom rollers | sheet support; y=0 in modes 1 and 2 | passive idler | |
| 620a | plate hole matrix | pin / clamp locations in 618 | fixture | patent list item 12 |
| 620b | top-edge clamping rollers | prevent upward migration in mode 2 | clamp | patent list item 20 |
| 701 | platform Y rails (FIG. 7 detail) | same family as 603/604 | structure | |
| 702 | bearing mounts (4) | platform on 701 | linear bearing | |
| 703 / 704 | rack / pinion (FIG. 7) | platform Y | servo | |
| 707–711 | pressure-plate ring, operators, plate, bearings, platform underside | depth datum hardware | servo + contact | contact = sheet-surface datum |
| 800 / 801–805 | example contour / collet head | interchangeable profile tool | rotary + depth actuators 803 | local-machined contour is example, not required catalog |
| 312 | tool dock | store interchangeable heads | storage | sheet machine; not required on D-001 in the preferred patent embodiment |

Saw head on receiver: fixed depth as disclosed. Drill and router: controlled depth. Sacrificial sheet (Masonite named as example) when the tool must pass through.

---

## Appendix C. Mode and station tables

### D-001 stations

| Station | What is there | Workpiece motion to use it | Op class |
|---|---|---|---|
| Fence / table | 503 / 502 | seat | reference |
| Feed | 504 / 505 / 510 / 511 | ±X along fence | index / hold |
| Clamp | 507 | none (holds to fence) | workholding |
| Saw A (506) | chop / miter-capable | X to that saw | crosscut / miter if envelope live |
| Saw B (506) | chop / miter-capable | X to that saw | crosscut / miter if envelope live |
| Vertical way tools | 520 / 521 on 508 | X to station; plunger into face | drill or rout |
| Horizontal way tools | 522 / 523 on 509 | X to station; plunger into edge/face | drill or rout |

Which 506 is Job 001 “first cut” vs “finished length”: unresolved.

### S-001 modes

| Mode | Sheet | Platform | Yokes 612 | 620b clamps | Depth |
|---|---|---|---|---|---|
| 1 | panel-positioned on 619 | panel; may lock at X centerline | as required to handle sheet | as required | saw fixed; drill/router if used unresolved for mode 1 |
| 2 | servo X via 614 | Y only; X locked at centerline | compressed onto 618 | engaged so sheet cannot climb off 619 | pressure-plate datum then tool beyond plane |
| 3 | fixed to 618 or carrier | servo X and Y | retracted into 616 | not the mode-2 climb control | same depth method; through-tool uses sacrificial layer |

Mode 2 outline with circular saw: linear/rectangular only. Curves require a router. Attach points remain; separation is secondary-ops 308.

---

## Appendix D. Lowering examples

No controller syntax. Ownership only. Objects remain **candidate**.

### D-001 — finished kept length

| Field | Owner | Example content |
|---|---|---|
| operation | `MachineNeutralOp` | `CROSSCUT` |
| kept length | job / packet | `43.875 in` |
| kept face | job + process rule | infeed-origin face after establishment |
| parent item | Store | `PNC-196` |
| part identity | job | packet-defined part id |
| which saw | cell config | **unresolved** mapping of Saw A/B |
| kerf | cell config / process model | not added into the job number |
| stop position | lowering | derived from kept length + commissioned saw geometry |
| program identity | `CellProgramIdentity` | local version string after commissioning |

Job command is not `43.875 + kerf`.

### D-001 — part-relative hole

| Field | Owner | Example content |
|---|---|---|
| operation | `MachineNeutralOp` | `DRILL` |
| location | job | part-relative coordinates / feature id |
| depth if required | job | part-relative |
| which head / way | cell config | vertical vs horizontal as commissioned |
| X index of the stick | lowering | transform of part location into feed position |
| plunger depth | lowering | transform into 521/523 command |

### S-001 — mode 2 outline

| Field | Owner | Example content |
|---|---|---|
| operation | `MachineNeutralOp` | `ROUT_OUTLINE` or `SAW_OUTLINE` |
| mode | job + envelope | `2` |
| outline | job | part-relative 2D path |
| attach points | process rule / lowering | disclosed as left attached; exact point count unresolved |
| tool | cell config | router if curves; circular saw if linear only |
| sheet X vs platform Y split | lowering | mode 2 law: sheet supplies X, platform supplies Y |
| stencil separation | Store secondary 308 | not a D/S program step |

`LoweringRecord` **candidate** binds: envelope version, cell config identity, resulting `CellProgramIdentity`. Field list stops there.

---

## Appendix E. Interlocks and invalidation events

No sensors invented. No timing invented.

### Forbids `CYCLE_START` (supported)

| Condition | Source |
|---|---|
| No accepted local job / cell program presented | Job 001 §8; Store operating conditions |
| Named stock not loaded or not the Store item | Job 001 §8–§9 |
| Workholding not in the declared pre-start state (D-001: clamps open, feed up, saws retracted, stations clear) | Job 001 §8 |
| S-001 mode not selected / not in envelope | §8 of this file |
| Network presence used as a substitute for local Ready | Store README; Job 001 §4 |
| ProductionExecutionAuthorization treated as available in v0.2.x | C-04 |

### Clears `POSITION_VALID` (supported enough to list)

| Event | D-001 | S-001 |
|---|---|---|
| Workholding release | 507 / 504 up | yokes open; mode-3 clamps released |
| Loss of declared contact | fence or table contact lost | sheet off 619; climb in mode 2; mode-3 fixture lost |
| Mode change | jog ↔ auto | mode 1/2/3 change |
| Incomplete tool cycle | saw/mill/drill not complete | same |
| Axis or tool fault | Job 001 §16 abort class | same class |
| `ESTOP` / `CYCLE_ABORT` | Job 001 §16 | same |
| Operator declares the workpiece is no longer the seated piece | Job 001 reject/replace | reload |

### E-stop

Stops hazardous motion. Does not refuse a project. Does not consume stock. Does not mint a part. Reset sequence: **unresolved**.

### Explicitly not specified

Encoder architecture, slip detection method, allowable position error, clamp/yoke force setpoints, saw/mill/drill timing, fieldbus, homing procedure, complete interlock matrix. Those remain later-spec items as stated in Job 001 §21.

---

## Appendix F. Credential / audit object catalog

Empty. Stage 4 does not invent schema fields. Placement stays in §11.

---

## Appendix G. Patent figure and feature crosswalk

| Locus | Spine | Corresponds? |
|---|---|---|
| U.S. 9,720,401 FIG. 1 — 101–108 order path into tandem 106 | §2, §3 | yes, as system neighborhood |
| U.S. 9,720,401 / 10,768,609 FIG. 2 — 105, 204, 211 label, 212 finish, 213 secondary | §3, §9 | yes |
| U.S. 10,768,609 FIG. 3 — 306 sheet, 307 dimensional, 308, 309, 312 dock | §3, §7, §8 | yes |
| U.S. 10,768,609 FIG. 5 — 501–523 | §7, App A | yes |
| FIG. 5 op: clamp, rollers down, A=fence, B=table, C=center or jog | §5, §7 | corresponds as **patent story** |
| Job 001 first-cut origin | §5, §7 | corresponds as **Store/Job story**; not the same as patent C (C-10) |
| U.S. 10,768,609 modes 1/2/3 narrative | §8, App C | yes |
| FIG. 6 — 601–619, 612–615, 618 | §8, App B | yes |
| FIG. 6 item 12 holes 620 vs item 20 clamping rollers 620 | App B 620a/620b | two parts; C-11 |
| FIG. 7 — 701–711 pressure plate | §5, §8 | yes; contact = sheet-surface depth datum |
| FIG. 8 — 800–805 tool example | App B | example head, not required catalog |
| FIG. 5 single-saw variant | App A | disclosed; not D-001 reference pattern |
| FIG. 5 movable-carriage saws | App A | disclosed variant; not required |
| Strict disconnected manual | §4, C-12 | disclosed; not preferred; not required mode |
| Consumer CAD pricing UI | patents | **does not correspond** to this spine; app/Store owned |
| Generic chop saw / panel saw / CNC | — | **does not correspond** to the fence |

No claim-by-claim infringement table.

---

## Appendix H. Mined thoughts retained

Empty. Adoption state = not adopted.

---

## Decisions still required before adoption

Recorded on this working artifact for **descriptive** adoption only. Owning files (Store / REF) are not modified.

1. **C-10** — Job 001 first-cut origin is the D-001 operating rule in this spine. Patent auto-center/jog is correspondence. Owner of any later change: Store Job 001 / cell spec. Sensing still unresolved.
2. **Candidate objects** — stay candidate until adopted by their appropriate owning layer: the cell specification, Store `DEFINITIONS.md`, or `STB-REF` as required. Cell-layer adoption does not automatically promote them upstream.
3. **S-001** — descriptive / patent correspondence only. Owner of later Store force: Store Zero / Job 001.
4. **D-001 instance** — described synthetic operations: square crosscut, mill, drill. Miter/compound remain disclosed correspondence, not operations adopted for Job 001. No installed or commissioned capability is claimed. Owner of a later envelope instance: Store.
5. **Production path** — closed. Descriptive adoption does not issue `ProductionExecutionAuthorization` and does not add remote Cycle Start. Owner of any later issue: governed reference.

Still not decided here: C-11 labels, encoders, pressures, timing, Appendix F schemas.

---

## Hostile-read readiness (descriptive only)

Pass criteria: a hostile reader can use this file as the cell description without believing a machine was built, production was authorized, or Store/REF were silently rewritten.

Holds:
- Header states descriptive adoption on `grok-file` only.
- Production closed; I0 / not-issuable cited.
- Candidate names still candidate.
- S-001 has no Store force.
- C-10 chooses a Store operating rule without erasing the patent story.
- C-13 limits the described D-001 instance to Job 001 ops.
- App interfaces cannot start motion.

Fails (still visible, on purpose):
- §9 shared services still a slot.
- Appendix F empty.
- Encoder / slip / pressures / which physical 506 is infeed unresolved.
- Candidate objects not in DEFINITIONS.
- Public demo SKU mix (C-05) untouched.

Verdict: ready as a **descriptive working artifact**. Not ready for production, construction, or commissioning.

---

## Stage 7 close

Exact pre-decision artifact: `GeorgePlattDemo/grok-file` `wip/cell-spine-0.1` `docs/cell/STB-CELL-0.1.md` commit `6137832a79f135933a03b4c4931bd284755b1ee7`.

This revision applies the five descriptive dispositions only. Branch not merged. Store and governed repos not touched.
