# Scan-to-Build Machine Function & Kinematic Ontology
**Patent-Derived Mechanical Reference Layer for WorkPacket Execution**

**Document status:** Canonical repository mechanical-behavior reference layer  
**Version:** MFKO 1.2  
**Maturity:** Pre-commissioning; engineering validation required  
**Recommended location:** `docs/MACHINE_FUNCTION_KINEMATIC_ONTOLOGY.md`  
**Applies to:** Scan-to-Build review · Homeowner Project Record · WorkPacket execution layer  
**Primary uses:** WorkPacket validation, MachineEnvelope definitions, machine-behavior governance, demo generation, animation audits, generated-output conformance, and execution-report design.

> **Controlling note.** This document is the canonical mechanical-behavior reference for the Scan-to-Build repository. It is subordinate to the issued patent specifications and does not replace engineering drawings, safety certification, machine commissioning, OSHA/ANSI/NFPA review, manufacturer instructions, or validated performance testing. Its purpose is to translate the patent-described physical execution layer into stable labels, datums, states, refusal paths, and compliance checks so that WorkPackets, simulations, HTML demos, and generated artifacts cannot invent machine behavior.

---

## 0. Safety doctrine and development-stage gates
### First safety commandment: No Blood on Wood

This ontology describes real machinery, not merely screen behavior. The Scan-to-Build execution layer includes saws, routers, drills, clamps, rollers, servo motion, pinch points, flying chips, stored energy, dust, material handling, and human operators working near physical tools.

**No Blood on Wood** is the governing safety doctrine for the machine layer. The phrase is intentionally blunt. A system that translates homeowner intent into machine execution must never allow elegance, automation, demo value, routing efficiency, or production speed to outrank operator safety.

For this repo, any WorkPacket, MachineEnvelope, animation, simulation, controller-facing pseudo-code, or generated sequence is invalid if it depicts, permits, or normalizes an unsafe condition. A mechanically correct output is not acceptable unless it is also safety-gated.

This document is the repository's mechanical-behavior reference layer. It is **not** a commissioned-machine specification. Before any physical machine is built, operated, piloted, or placed in a commercial environment, qualified engineering and safety professionals must define, test, and approve actual dimensions, tolerances, guarding, interlocks, emergency stops, lockout/tagout procedures, sensor thresholds, tooling specifications, dust collection, PPE requirements, training protocols, certification requirements, inspection routines, maintenance intervals, and applicable regulatory compliance.

### Safety authority hierarchy

Safety is upstream of all demo logic.

| Priority | Controls | Meaning for this ontology |
|---:|---|---|
| 0 | Applicable law, regulation, and safety standards | If a safety requirement applies, it controls over repo vocabulary and demo convenience. |
| 1 | Engineering and safety review | Physical implementation requires qualified review before powered operation. |
| 2 | Guarding, interlocks, LOTO, PPE, training, and certification | Access to machine states depends on satisfied safety conditions. |
| 3 | Machine Function & Kinematic Ontology | Converts safety requirements into states, telemetry gates, refusals, and forbidden depictions. |
| 4 | WorkPacket / MachineEnvelope validation | A packet cannot enter execution unless safety readiness is current. |
| 5 | Demo / animation / generated output | May visualize only states that the ontology permits. |

Where this ontology conflicts with a validated safety requirement, the safety requirement controls. Where a safety condition is unknown, the machine state is refused rather than assumed safe.

### OSHA-aligned baseline categories

This document does not assert OSHA compliance. It reserves the hooks that a later engineering and compliance program must fill. At minimum, the machine layer should be reviewed against the following OSHA-aligned categories:

- general machine guarding for point-of-operation hazards, ingoing nip points, rotating parts, flying chips, sparks, and similar machine-area hazards;
- woodworking machinery requirements for saws, routers, cutting heads, material handling, and woodworking stock;
- lockout/tagout control of hazardous energy during servicing, maintenance, calibration, tool changes, jam clearing, and fault recovery;
- PPE hazard assessment and protective equipment selection for eye, face, hearing, respiratory, hand, and mechanical-irritant exposures;
- guarding of mechanical power-transmission components where belts, pulleys, shafts, gears, chains, or similar drive elements are used;
- documented training and certification for each operator role before access is granted.

OSHA and equivalent safety requirements are not implemented by prose. They must be implemented through guards, interlocks, lockout/tagout procedures, PPE requirements, training records, certification gates, telemetry, refusal logic, inspection routines, and preserved safety events.

### Development-stage safety gates

The machine layer must distinguish between simulation, lab prototype, field pilot, and production deployment. No WorkPacket, demo, or narrative may imply production readiness unless the corresponding stage gate has been satisfied.

| Stage | Description | Required safety posture | Forbidden implication |
|---|---|---|---|
| Stage 0 — Simulation / documentation | No physical machine is operated. | Unsafe depictions refused; cycle time, scrap, atom-miles, and production values marked as model parameters unless measured. | Production readiness, validated OSHA compliance, or real machine commissioning. |
| Stage 1 — Lab / bench prototype | Physical motion under engineering supervision. | Hazard analysis; guarded test plan; emergency-stop test log; LOTO procedure; PPE; dry-run mode; telemetry logging; calibration verification. | Public use, unsupervised operation, homeowner access, live tooling without verified guards/interlocks. |
| Stage 2 — Controlled field pilot | Selected shop, lumberyard, school, or institutional pilot environment. | Site-specific hazard assessment; trained/certified roles; access control; pre-shift inspection; incident/near-miss/refusal log; dust/chip plan; CS halt authority. | Validated production performance, operation outside MachineEnvelope, bypassing safety refusals to complete a job. |
| Stage 3 — Production model | Commissioned deployment after completed engineering and safety program. | Final guarded design; tested interlocks/e-stops; validated LOTO; training records; maintenance schedule; tool limits; sensor thresholds; tolerance/calibration program; regulatory/site review. | Treating a demo or pilot artifact as a commissioned machine specification. |

### Safety states and refusals

Safety is not a paragraph at the front of the document; it is part of the state machine. The following safety states and refusal codes are available to WorkPacket validation, MachineEnvelope validation, execution reporting, animation audit, and generated-output conformance review.

Minimum safety states:

- `MF.STATE.SAFETY_IDLE`
- `MF.STATE.GUARD_VERIFY`
- `MF.STATE.ESTOP_VERIFY`
- `MF.STATE.LOTO_REQUIRED`
- `MF.STATE.CALIBRATION_VERIFY`
- `MF.STATE.EXECUTION_ENVELOPE_VERIFY`
- `MF.STATE.MATERIAL_INSTANCE_VERIFY`
- `MF.STATE.TOOL_REGISTRY_VERIFY`
- `MF.STATE.CONTROLLER_HANDSHAKE`
- `MF.STATE.LOCAL_CONTROLLER_ACTIVE`
- `MF.STATE.OPERATOR_CLEAR`
- `MF.STATE.CLAMP_CONFIRM`
- `MF.STATE.TOOL_POWER_ARMED`
- `MF.STATE.TOOL_POWER_ACTIVE`
- `MF.STATE.FAULT_SAFE_STOP`
- `MF.STATE.STEWARD_REVIEW_REQUIRED`

Safety refusal codes:

- `MF.SAFE.REFUSAL.GUARD_NOT_CONFIRMED`
- `MF.SAFE.REFUSAL.ESTOP_NOT_VERIFIED`
- `MF.SAFE.REFUSAL.LOTO_REQUIRED`
- `MF.SAFE.REFUSAL.OPERATOR_NOT_CLEAR`
- `MF.SAFE.REFUSAL.ROLE_NOT_CERTIFIED`
- `MF.SAFE.REFUSAL.PPE_NOT_CONFIRMED`
- `MF.SAFE.REFUSAL.DUST_COLLECTION_NOT_READY`
- `MF.SAFE.REFUSAL.CALIBRATION_STALE`
- `MF.SAFE.REFUSAL.INTERLOCK_OPEN`
- `MF.SAFE.REFUSAL.UNAPPROVED_TOOL_CHANGE`
- `MF.SAFE.REFUSAL.STORED_ENERGY_NOT_RELIEVED`
- `MF.SAFE.REFUSAL.PRODUCTION_READINESS_NOT_ESTABLISHED`
- `MF.SAFE.REFUSAL.EXECUTION_ENVELOPE_MISSING`
- `MF.SAFE.REFUSAL.MATERIAL_INSTANCE_UNRESOLVED`
- `MF.SAFE.REFUSAL.MATERIAL_DIMENSION_MISMATCH`
- `MF.SAFE.REFUSAL.TOOL_REGISTRY_MISSING`
- `MF.SAFE.REFUSAL.TOOL_CONDITION_EXPIRED`
- `MF.SAFE.REFUSAL.CONTROLLER_HANDSHAKE_MISSING`
- `MF.SAFE.REFUSAL.NETWORK_LOSS_DURING_EXECUTION`
- `MF.SAFE.REFUSAL.REMOTE_LIVE_MOTION_COMMAND`

These refusals are not errors to hide. They are preserved safety events and must be written to the record.

### Safety rule for generated outputs and animation generators

Any animation tool, simulation, UI generator, or model-generated artifact must treat unsafe depiction as a failed output.

If a generated sequence shows a person reaching into a tool envelope, a board being hand-fed into active tooling, a saw chasing moving material, a guard disappearing for visual clarity, a tool change without lockout, a fault without safe retraction, or a role acting outside certification, the output must be rejected and rewritten.

The compliance question is not only: **Is this patent-faithful?**

It is also: **Would this depiction normalize a dangerous act?**

If yes, refuse the depiction.

### Safety references for later engineering review

This repo document should be read as a mechanical-behavior and schema-control artifact, not as a substitute for professional safety review. The following public OSHA standards are baseline references for later engineering and compliance work:

- OSHA 29 CFR 1910.212 — General requirements for all machines.
- OSHA 29 CFR 1910.213 — Woodworking machinery requirements.
- OSHA 29 CFR 1910.147 — Control of hazardous energy / lockout-tagout.
- OSHA 29 CFR 1910.132 — General PPE requirements.

---

## 1. How to use this document
1. **For WorkPacket validation:** map each `fabrication[]` operation to an `MF.OP.*`, `MF.MODE.*`, required machine profile, required states, required telemetry gates, refusal codes, execution-report outputs, and safety prerequisites.
2. **For MachineEnvelope definitions:** declare which machines, operations, states, modes, tools, datums, telemetry gates, safety gates, and tolerances a deployed cell actually supports.
3. **For pre-execution handoff:** require the orchestrator to compile a local controller execution envelope before any D/S state is entered. The machine receives resolved material instances, tool registry references, safety prerequisites, calibration snapshot, and controller authority limits — not a loose SKU list or UI instruction.
4. **For controller boundaries:** live machine motion is owned by the local machine controller/PLC after envelope acceptance. The homeowner record and orchestrator validate, authorize, cancel, and receive reports; they do not remotely step saws, routers, clamps, or feed axes during active cutting.
5. **For safety gating:** refuse execution, simulation, or animation whenever required guards, interlocks, e-stop verification, operator-clear confirmation, LOTO status, PPE requirements, calibration, dust collection, or role certification are unknown, stale, or unsatisfied.
6. **For generated animations and diagrams:** require every visible part to resolve to an `MF.COMP.*`, `MF.MOTION.*`, or `MF.TOOL.*` label, and every movement to follow the state model in Sections 7–11.
7. **For code generation:** treat the tables in Sections 12–15 as schema glue: WorkPacket → MachineEnvelope → state machine → execution report → owner archive.
8. **For refusal logic:** preserve every failed gate as a structured refusal event bound to the exact WorkPacket version.
9. **For generated-output review:** run the checklist in Section 19 before accepting any generated UI, diagram, animation, narrative, or controller-facing pseudo-code.
10. **For repository maintenance:** this document should be read together with `ARCHITECTURE.md`, `MATERIAL_AND_LABOR_ONTOLOGY.md`, WorkPacket schema files, MachineEnvelope schema files, and the patent drawings.
11. **For demos:** story-mode visuals and system-mode records must be two views of the same underlying event sequence.
12. **For engineering:** nulls, scenario values, and model parameters must be replaced by measured, certified values before representing a real deployed machine as commissioned.
13. **For claims discipline:** any lead time, cycle time, scrap, first-fit, atom-miles, or local-value-share number is a scenario parameter unless backed by measured pilot data.

## 2. Governing purpose and authority hierarchy
The Scan-to-Build system is a governed chain from homeowner capture to physical execution:

`capture → define → confirm → fabricate → label → release → install → archive`

The Architecture document frames the Homeowner Project Record as the system of record and imposes four invariants: homeowner control, standardized capture, intelligent routing, and outcome preservation. The Material & Labor Ontology provides the published vocabulary that lets WorkPackets cross the boundaries between owner record, materials, retail SKUs, labor tiers, machines, vendors, installers, finance, and outcomes without losing meaning. This Machine Function & Kinematic Ontology supplies the missing hardware layer: it defines what the machines are, what each component is allowed to do, what physical state transitions must be confirmed, which actors may intervene, and which depictions are forbidden.

### 2.1 Authority hierarchy

| Level | Artifact | Function |
|---:|---|---|
| 1 | Issued patent specifications | Legal and mechanical source. Patent figures and specification control over repo vocabulary. |
| 2 | Machine Function & Kinematic Ontology | Mechanical-behavior reference layer. Converts patent-described components into stable labels, states, telemetry gates, and forbidden depictions. |
| 3 | Material & Labor Ontology | Published language for material nodes, skill tiers, MachineEnvelope concepts, SKU mappings, refusals, and outcomes. |
| 4 | Architecture / Homeowner Project Record | System-of-record, event store, orchestration, routing, packets, quotes, fulfillment, archive, and measurement apparatus. |
| 5 | WorkPacket schema / MachineEnvelope schema | Executable validation contracts: materials, operations, tolerances, roles, routing, state paths, and refusal boundaries. |
| 6 | HTML demo / animation / generated outputs | Visualization of the above. These artifacts are downstream only and may not invent upstream truth. |

### 2.2 Receipt anchors

| Source anchor | Governing point captured here |
|---|---|
| US 10,768,609 Fig. 1 | User input terminal, retailer computer, tool-controller computer, tandem machine, required materials, completed materials. |
| US 10,768,609 Fig. 2 | Mobile/home interface, retail-store computer, label maker/instruction printer, staging area/customer pickup. |
| US 10,768,609 Fig. 5 | Dimensional-stock cell: base/table, fence, clamping rollers, manipulating rollers/rotor assembly, vertical and horizontal ways, tool assemblies. |
| US 10,768,609 Figs. 6–8 | Sheet-processing cell: support frame, backing plates, base rollers, guide rails, yokes/manipulator rollers, tooling platform, pressure/contact sensing, profile tooling. |
| Architecture v2 | Owner-held record; standardized WorkPacket; explainable routing; outcome preservation; event-sourced archive. |
| Material & Labor Ontology | SKUs, vendor terms, machine codes, and labor labels are mappings, not primary truth. |
| Home-twin MVP | Working custody skeleton: verticals × stages, export/import record, event log, packets, quotes, fulfillment, archive. |
| Two-page overview | Sarah’s imperfect alcove is resolved into a fabrication definition before cutting; the demo must preserve that sequence. |

### 2.3 Fact / policy / implementation status

Every statement in this document should be read as one of four classes:

- **Patent-derived fact:** grounded in patent figures or specification language.
- **Repo governance rule:** required by the Architecture or Material & Labor Ontology.
- **Implementation rule:** proposed structure for the demo, schema, or controller-facing mock layer; subject to engineering validation.
- **Scenario parameter:** used for Sarah’s demo or a pilot model; not validated commercial performance unless separately measured.

A generated output that cannot identify which class supports a claim should not present that claim as fact.

---

## 3. Ontology namespace conventions
All machine-function labels use the `MF.` namespace.

| Prefix | Meaning | Example |
|---|---|---|
| `MF.COMP.*` | Physical component | `MF.COMP.FENCE.503` |
| `MF.MOTION.*` | Guide, servo, carriage, axis, or drive motion | `MF.MOTION.SERVO.FEED` |
| `MF.TOOL.*` | Tool head or processing implement | `MF.TOOL.SAW.DIM` |
| `MF.MODE.*` | Governed execution mode | `MF.MODE.DIM_INDEXED_STATION` |
| `MF.OP.*` | Operation class | `MF.OP.CROSSCUT` |
| `MF.SENSE.*` | Sensor or state confirmation | `MF.SENSE.CLAMP_PRESSURE` |
| `MF.STATE.*` | Required machine state | `MF.STATE.D4_INDEX` |
| `MF.SAFE.*` | Safety condition, interlock, refusal, recovery state | `MF.SAFE.REFUSAL.STATE_VIOLATION` |
| `MF.IO.IN.*` | Machine input from WorkPacket/orchestrator | `MF.IO.IN.TOOLPATH` |
| `MF.IO.OUT.*` | Machine output to orchestrator/record | `MF.IO.OUT.EXECUTION_REPORT` |
| `MF.EVENT.*` | Event-log output | `MF.EVENT.CELL.STAGED` |

Patent component numbers may be appended where helpful, e.g., `MF.COMP.FENCE.503`, `MF.COMP.SURFACE.DIM.502`, `MF.COMP.ROLLER.MANIP.DIM.504`, `MF.COMP.ROLLER.CLAMP.507`.

---

## 4. Patent figure mapping table
This table exists to prevent component drift and mislabeling. If a generated artifact depicts a component but cannot map it to this table or to a declared implementation extension, it should be rejected or revised.

### 4.1 System and custody layer

| MF / system label | Patent figure | Patent component / concept | Repo meaning |
|---|---:|---|---|
| `MF.IO.IN.USER_INPUT` | Fig. 1 | User input terminal / consumer inputs | Capture and project intent enter system. |
| `MF.IO.STORE` | Fig. 1 | Retailer’s computer | Store/channel adapter receives packet context. |
| `MF.IO.CONTROLLER` | Fig. 1 | Tool-controller computer | Controller-facing execution interface. |
| `MF.COMP.TANDEM_MACHINE` | Fig. 1 | Tandem machine | Bounded execution cell/habitat. |
| `MF.IO.OUT.COMPLETED_MATERIALS` | Fig. 1 | Project materials as completed | Fabricated/processed materials returned to record. |
| `MF.IO.LABEL_PRINTER` | Fig. 2 | Label maker / instruction printer | Component labels, assembly instructions, release documents. |
| `MF.IO.STAGING` | Fig. 2 | Staging area / customer pickup | Labeled components staged and released. |

### 4.2 Dimensional-stock cell

| MF label | Patent figure | Patent component name / number | Function |
|---|---:|---|---|
| `MF.COMP.SURFACE.DIM.502` | Fig. 5 | Base table top / work surface 502 | Supports dimensional stock; establishes Datum B / Z reference. |
| `MF.COMP.FENCE.503` | Fig. 5 | Fence structure 503 | Fixed fence line; Datum A / Y reference. |
| `MF.COMP.ROLLER.MANIP.DIM.504` | Fig. 5 | Manipulating rollers 504 / manipulating rotor assembly 511 | Descends/applies contact; indexes work along X. |
| `MF.COMP.ROLLER.IDLER.505` | Fig. 5 | Idler/support rollers where shown/described | Passive friction reduction; not a drive element. |
| `MF.TOOL.SAW.DIM.506` | Fig. 5 | Compound miter sawing stations 506 | Cutting / crosscut / sever operations as envelope permits. |
| `MF.COMP.ROLLER.CLAMP.507` | Fig. 5 | Clamping rollers 507 | Pneumatic/actuated pressure against fence. |
| `MF.MOTION.GUIDE.VERTICAL.DIM.508` | Fig. 5 | Vertical rigid ways 508 | Tool-head positioning and controlled engagement/retraction. |
| `MF.MOTION.GUIDE.HORIZ_LOWER.509A` | Fig. 5 | Lower horizontal rigid way 509A | Horizontal tool-head reach/positioning. |
| `MF.MOTION.GUIDE.HORIZ_UPPER.509B` | Fig. 5 | Upper horizontal rigid way 509B | Horizontal tool-head reach/positioning. |
| `MF.MOTION.SERVO.FEED` | Fig. 5 | Manipulating assembly control / longitudinal positioning | Indexes the workpiece to commanded X coordinates. |
| `MF.TOOLHEAD.VERTICAL.520` | Fig. 5 | Tool-head assembly 520 | Tool mounted on vertical way. |
| `MF.TOOLHEAD.HORIZ.522` | Fig. 5 | Tool-head assemblies 522A/522B | Tool mounted on horizontal ways. |
| `MF.MOTION.PLUNGER.521_523` | Fig. 5 | Servo-controlled plunger assemblies 521/523 | Push/retract tool head toward work. |

### 4.3 Sheet-processing cell

| MF label | Patent figure | Patent component name / number | Function |
|---|---:|---|---|
| `MF.COMP.FRAME.SHEET` | Figs. 6–7 | Support frame | Holds backing plates, rails, tooling platform. |
| `MF.COMP.BACKING.PLATE.618` | Fig. 6 | Backing plates 618 | Sheet support plane; prevents unsupported sheet depiction. |
| `MF.COMP.ROLLER.BASE.619` | Fig. 6 | Bottom/base rollers 619 | Sheet edge support and low-friction motion. |
| `MF.COMP.ROLLER.CLAMP.SHEET.620` | Fig. 6 | Clamping rollers 620 | Prevent sheet migration where mode requires. |
| `MF.MOTION.GUIDE.HORIZ_UPPER.SHEET.601` | Fig. 6 | Horizontal guide rail, x-axis upper 601 | Sheet-cell X guidance. |
| `MF.MOTION.GUIDE.HORIZ_LOWER.SHEET.602` | Fig. 6 | Horizontal guide rail, x-axis lower 602 | Sheet-cell X guidance. |
| `MF.MOTION.GUIDE.VERTICAL.SHEET.LEFT.603` | Fig. 6 | Vertical guide rail, y-axis left 603 | Sheet-cell Y guidance. |
| `MF.MOTION.GUIDE.VERTICAL.SHEET.RIGHT.604` | Fig. 6 | Vertical guide rail, y-axis right 604 | Sheet-cell Y guidance. |
| `MF.MOTION.CARRIAGE.TOOL.SHEET.609` | Fig. 6 | Moveable tooling platform 609 | Carries tool receiver/head. |
| `MF.SENSE.PRESSURE_PLATE.610_709` | Figs. 6–7 | Pressure plate sensing assembly 610 / pressure sensing plate 709 | Establishes depth/contact reference normal to sheet surface. |
| `MF.COMP.YOKE.ROT.SHEET.612` | Fig. 6 | Rotating yoke assemblies 612 | Manipulator/hold-down assemblies for sheet operations. |
| `MF.TOOL.RECEIVER.SHEET.611_705` | Figs. 6–7 | Tool receiver 611 / receiver 705 | Receives saw/router/drill/profile tooling. |
| `MF.TOOL.EDGE.PROFILE.800` | Fig. 8 | Profile tool assembly 800 | Interchangeable profile tool / contour head. |

---

## 5. Coordinate frames and datum diagrams
Coordinate drawings in documentation and generated artifacts must be simple, fixed, and mechanically honest. Diagrams are schematic only; they do not replace engineering drawings.

### 5.1 Dimensional-stock cell — top view

```text
DIMENSIONAL CELL — TOP VIEW (SCHEMATIC, NOT TO SCALE)

             +X INDEX DIRECTION
             ---------------------------------------------->

  Datum A / Y=0
  MF.COMP.FENCE.503  ===================================================  FIXED
                      ||  workpiece edge constrained to fence
                      ||
                      ||  [ MF.COMP.WORKPIECE.DIM ]  ---> indexed by
                      ||       dimensional stock          MF.COMP.ROLLER.MANIP.DIM.504
                      ||
                      ||     o      o      o       passive support / idler rollers
                      ||    505    505    505      embedded in/near surface

  Y offsets measure perpendicular to fence.
  X position is established by longitudinal indexing stops/events.
```

### 5.2 Dimensional-stock cell — front/elevation view

```text
DIMENSIONAL CELL — FRONT / SECTION VIEW (SCHEMATIC, NOT TO SCALE)

              MF.COMP.ROLLER.MANIP.DIM.504
            descends, urges work DOWN toward table,
            then rotates to index work along X
                          |
                          v  (downward contact)
                    [ WORKPIECE ]
                          ^
            MF.COMP.ROLLER.IDLER.505 embedded in
            base/table; passive friction reduction

  example vertical-way tool head (Fig. 5 also has horizontal ways):
                         MF.MOTION.GUIDE.VERTICAL.DIM.508
                                      |
                                      v  tool engagement / retract
                                [ MF.TOOL.* ]

  FENCE / Datum A  |  [ WORKPIECE ]  <--- MF.COMP.ROLLER.CLAMP.507
  (Y=0)            |                       lateral pressure toward fence
                   |
  TABLE / Datum B  +=================================================  FIXED
  (Z=0)              MF.COMP.SURFACE.DIM.502

  Datum A is established by the fence; Datum B by the table surface.
  The manipulating roller drives the WORK along X (the fluid axis);
  the tool does not traverse to find the work.
  Z offsets measure normal to the surface.
  Tool engagement may occur only after indexing has halted and hold is confirmed.
```

### 5.3 Sheet-processing cell — front view

```text
SHEET CELL — FRONT VIEW (SCHEMATIC, NOT TO SCALE)

      S-X / horizontal carriage guidance
      <-------------------------------------------------------------->
      MF.MOTION.GUIDE.HORIZ_UPPER.SHEET.601          FIXED RAIL
      ===============================================================
             |                                             |
             |   MF.MOTION.GUIDE.VERTICAL.SHEET.603/604    |  S-Y vertical motion
             |               [ TOOL CARRIAGE 609 ]         v
             |
      ===============================================================
      MF.MOTION.GUIDE.HORIZ_LOWER.SHEET.602          FIXED RAIL

      Sheet seated against:
      MF.COMP.BACKING.PLATE.618  ///////////////////////////////  support plane
      Sheet lower edge rests on:
      MF.COMP.ROLLER.BASE.619    o o o o o o o o o o o o o o o    base rollers

      S-Z / depth is normal to backing plate, confirmed by pressure plate 610/709.
      Pressure plate confirms depth/contact; it does not define global sheet X.
```

### 5.4 Diagram constraint rule

The ASCII diagrams in this document are orientation aids only. They are not a machine drawing, dimensioned layout, CAD reference, or source of geometric truth.

Generated-output tools, visual generators, and animation tools **must not derive spatial relationships from the visual placement, line length, whitespace, or box alignment of the ASCII diagrams.** Spatial logic must be derived strictly from the written datum definitions, component tables, state models, and MachineEnvelope values.

If an ASCII, SVG, canvas, HTML, or slide diagram is generated, it must state which view is being shown, label the fixed reference surfaces, and keep axes consistent with this section. Bounding boxes may not overlap in a way that suggests the fence, backing plates, base, or rails move when they are fixed references. Any generated diagram that conflicts with the datum text must be refused or rewritten, even if it looks visually persuasive.

---

## 6. Physical machine inventory
The patented execution layer is treated as a bounded tandem fabrication habitat with supporting stations:

1. **Sheet-processing cell** — vertical sheet machine for sheet-stock operations, including two-dimensional machining and curvilinear shapes.
2. **Dimensional-stock cell** — manipulating-roller lumber machine for dimensional lumber operations, including indexing, cutting, drilling, routing, edge profiling, and labeled release.
3. **Optional finishing station** — finish, stain, paint, profile finishing, or other governed secondary processing where defined by MachineEnvelope.
4. **Labeling and staging station** — label maker/instruction printer and staging area that bind completed components to assembly instructions and pickup/release.

This habitat must not be reduced to a generic CNC router. The architecture depends on the governed relationship between captured project definition, local material availability, bounded machines, operator/steward oversight, labels, staging, and owner-held record preservation.

---

## 7. Pre-D0 execution envelope and material-instance resolution
The machine cannot evaluate safety, envelope limits, tool requirements, or expected motion from a retail SKU name, a drawing caption, or a UI label. Before any dimensional (`D*`) or sheet (`S*`) state is entered, the orchestrator must compile a controller-facing **execution envelope**.

The execution envelope is the bounded contract that tells the local controller what it is authorized to execute. It binds one immutable WorkPacket version to one eligible MachineEnvelope, one set of resolved material instances, one ordered operation plan, one tool registry snapshot, one calibration snapshot, and one safety-prerequisite set.

### 7.1 Required execution-envelope contents

| Field | Required meaning | Refusal if absent or stale |
|---|---|---|
| `packetVersion` | The exact immutable WorkPacket version authorized for execution. | `MF.SAFE.REFUSAL.EXECUTION_ENVELOPE_MISSING` |
| `machineProfileId` | Eligible machine profile / MachineEnvelope selected by orchestration. | `MF.SAFE.REFUSAL.ENVELOPE_EXCEEDED` or `MF.SAFE.REFUSAL.PRODUCTION_READINESS_NOT_ESTABLISHED` |
| `controllerPolicy` | Whether the controller may run autonomously, segment-by-segment, dry-run only, or simulation only. | `MF.SAFE.REFUSAL.CONTROLLER_HANDSHAKE_MISSING` |
| `materialInstances[]` | Expected physical stock derived from ontology material nodes and channel inventory, not from SKU alone. | `MF.SAFE.REFUSAL.MATERIAL_INSTANCE_UNRESOLVED` |
| `operationPlan[]` | Ordered machine operations mapped to `MF.OP.*`, states, tools, roles, and telemetry gates. | `MF.SAFE.REFUSAL.STATE_VIOLATION` |
| `toolRegistryRefs[]` | Approved tool IDs, geometries, condition, calibration, guard requirements, and CS signoff where required. | `MF.SAFE.REFUSAL.TOOL_REGISTRY_MISSING` or `MF.SAFE.REFUSAL.TOOL_CONDITION_EXPIRED` |
| `safetyPrerequisites[]` | Guard, interlock, e-stop, LOTO, PPE, operator-clear, dust collection, and role-certification gates. | corresponding `MF.SAFE.REFUSAL.*` |
| `calibrationSnapshot` | Current datum, axis, pressure, kerf/bit/tool-offset, and environmental checks. | `MF.SAFE.REFUSAL.CALIBRATION_STALE` |
| `reportingPolicy` | What the controller must report during and after execution. | `MF.SAFE.REFUSAL.TELEMETRY_MISSING` |

### 7.2 Material instances: SKU is not physical truth

A WorkPacket may quote or pick stock by SKU, but a SKU is not the physical identity of the material. The physical identity used by the machine is a `materialInstance` derived from the ontology material node, channel mapping, and confirmation data.

A valid `materialInstance` should include:

```json
{
  "materialInstanceId": "mi.ws-001.cherry-1x8.01",
  "materialNode": "mat.wood.cherry.nc.select.1x8",
  "channelId": "store.greensboro.demo",
  "sku": "CHR-196",
  "skuIsIdentity": false,
  "nominalDimensions": {"thicknessIn": null, "widthIn": null, "lengthIn": null},
  "confirmedDimensions": {"thicknessIn": null, "widthIn": null, "lengthIn": null, "confirmedBy": "OP-MS", "required": true},
  "tolerances": {"dimensionSource": "ontology-or-channel", "confirmedAtLoad": true},
  "condition": {"speciesConfirmed": null, "gradeConfirmed": null, "flatnessAccepted": null, "defectsAccepted": null, "moistureAccepted": null},
  "substitutionPolicy": "owner-approval-required-if-outside-node"
}
```

The machine may rely on the execution envelope for expected dimensions, but it must refuse execution if actual loaded stock materially conflicts with the authorized material instance. A board that shares a SKU label but fails dimension, grade, flatness, moisture, defect, or envelope requirements is not accepted merely because it appears in inventory.

### 7.3 Material verification after loading

State `D1` / `S1` is not a clerical loading step. It is a physical reconciliation between the data packet and the material in the cell. At minimum, the controller or OP-MS process must confirm:

- material present and supported by the required datums;
- material instance ID or pick-list line matches the execution envelope;
- dimensions are within declared tolerance for the operation;
- material condition does not defeat clamping, seating, toolpath safety, or expected fit;
- substitutions are within owner-approved policy;
- any refusal is preserved against the packet version.

If these conditions are not satisfied, the correct result is not operator improvisation. The result is `MF.SAFE.REFUSAL.MATERIAL_DIMENSION_MISMATCH`, `MF.SAFE.REFUSAL.MATERIAL_UNSUITABLE`, or another preserved refusal event.

---

## 8. Controller authority and network boundary
The homeowner record and orchestrator govern meaning, routing, custody, authorization, cancellation, and reporting. They do **not** directly control live cutting motion across a network.

Once a validated execution envelope is accepted, live machine motion is owned by the local controller/PLC or equivalent machine-control layer. The local controller enforces safety interlocks, state transitions, telemetry thresholds, motion limits, and fault recovery. The orchestrator receives events and may cancel future segments, but it does not send ad hoc remote commands such as “plunge now,” “feed now,” or “override clamp.”

### 8.1 Authority boundary

| Function | Owner record / Orchestrator | Local controller / PLC |
|---|---|---|
| WorkPacket meaning and versioning | Owns and validates. | Reads authorized envelope only. |
| Material ontology and SKU mapping | Resolves to material instances. | Verifies loaded material against envelope. |
| MachineEnvelope eligibility | Selects eligible profile. | Confirms machine readiness/current calibration. |
| Live axis motion | No direct live control. | Owns motion execution. |
| Safety interlocks / e-stop / guards | Requires reported readiness. | Enforces locally. |
| Fault recovery | Records/refuses/reroutes. | Executes safe-state transition. |
| Execution reporting | Receives and archives. | Emits controller-time events and reports. |

### 8.2 Network and handshake states

The controller may enter execution only after `MF.STATE.CONTROLLER_HANDSHAKE` succeeds. If the network drops during active execution, the controller must not wait for a remote instruction to become safe. It must follow the local policy declared in the execution envelope.

Allowed controller policies:

| Policy | Meaning | Required behavior on network loss |
|---|---|---|
| `simulationOnly` | No physical machine motion. | Stop simulation and flag report. |
| `dryRunLocal` | Motion without live tooling where physically permitted. | Controlled stop; report. |
| `segmentAutonomous` | Controller may complete only the already-authorized safe segment. | Complete safe segment or enter safe stop according to state. |
| `localSafeStopOnLoss` | Network loss triggers immediate controlled stop. | Enter F0–F7 recovery path. |
| `productionLocalPolicy` | Commissioned controller policy after engineering review. | Follow validated site policy; preserve all events. |

Refusal codes added by this boundary:

- `MF.SAFE.REFUSAL.CONTROLLER_HANDSHAKE_MISSING`
- `MF.SAFE.REFUSAL.NETWORK_LOSS_DURING_EXECUTION`
- `MF.SAFE.REFUSAL.REMOTE_LIVE_MOTION_COMMAND`

A generated demo may show the owner record receiving progress updates. It must not depict the browser UI or cloud orchestrator as directly jogging axes, plunging tools, bypassing interlocks, or remotely rescuing a fault.

---

## 9. State models and telemetry gates
A machine cannot occupy contradictory execution states. A state transition is not authorized merely because the previous step was requested. It is authorized only when required telemetry, interlocks, and role permissions are confirmed. Threshold values are declared by the MachineEnvelope; this ontology defines the required kinds of confirmations.

### 9.1 Dimensional-stock execution sequence

| State | Name | Description | Required confirmations before entry / exit |
|---|---|---|---|
| D0 | Preflight | WorkPacket version, execution envelope, material instances, MachineEnvelope, tool registry, controller policy, role permission, calibration, safety interlocks. | `packetValid`, `executionEnvelopeAccepted`, `materialInstancesResolved`, `controllerHandshakeConfirmed`, `envelopeValid`, `toolRegistryCurrent`, `calibrationCurrent`, `operatorAuthenticated`, `guardVerified`, `estopVerified`, `operatorClear`, `interlocksClosed`, `dustCollectionReady where required`. |
| D1 | Load & sense | OP loads stock against fence/surface; OP-MS verifies material if required. | `materialPresent`, `againstFence`, `onSurface`, `materialAccepted`. |
| D2 | Clamp to fence | Clamping rollers apply pressure toward Datum A. | `clampPressure >= envelope.minClampPressure`, `fenceContactConfirmed`. |
| D3 | Engage drive | Manipulating rollers descend/apply drive contact; feed servo armed but stationary. | `driveContactConfirmed`, `drivePressureWithinRange`, `toolClear == true`. |
| D4 | Index | Feed servo advances workpiece to commanded X coordinate. | `toolActive == false`, `targetXReached`, `positionError <= envelope.indexTolerance`. |
| D5 | Halt & hold | Feed stops; work remains clamped and held. | `feedVelocity == 0`, `holdConfirmed`, `clampPressureStillValid`. |
| D6 | Tool engage | Assigned tool engages through guided assembly; point/path/profile operation executes only inside declared window. | `D5 confirmed`, `toolAtHome before engage`, `operatorClear`, `spindleReady`, `depthWithinEnvelope`. |
| D7 | Retract & clear | Tool retracts fully; dust/chip/tool-clear conditions verified. | `toolClear == true`, `spindleStopped or safe`, `cutComplete`. |
| D8 | Repeat / release | Repeat D4–D7 or release, label, and stage component. | `operationReportWritten`, `labelsReady`, `releaseAllowed`. |

**Dimensional invariant D-A:** Default governed dimensional operations are indexed-station operations: index, halt, hold, engage, retract. Active indexing (`D4`) and tool engagement (`D6`) may not overlap unless a future engineered synchronized-interpolation operation is explicitly declared by MachineEnvelope, safety review, and documentation.

**Dimensional invariant D-B:** The operator does not hand-feed, nudge, or push stock into an active tool in governed mode. Such a depiction is refusal-level invalid unless labeled as forbidden/unsafe.

### 9.2 Sheet-processing execution sequence

| State | Name | Description | Required confirmations before entry / exit |
|---|---|---|---|
| S0 | Preflight | WorkPacket, execution envelope, material instances, sheet size/thickness, tool registry, controller policy, role, calibration, interlock checks. | `packetValid`, `executionEnvelopeAccepted`, `materialInstancesResolved`, `controllerHandshakeConfirmed`, `sheetEnvelopeValid`, `toolRegistryCurrent`, `calibrationCurrent`, `operatorAuthenticated`, `guardVerified`, `estopVerified`, `operatorClear`, `interlocksClosed`, `dustCollectionReady where required`. |
| S1 | Load & seat | Sheet placed on base rollers and leaned/seated against backing plates. OP-MS confirms suitability where required. | `sheetPresent`, `baseSupportConfirmed`, `backingPlateContact`, `materialAccepted`. |
| S2 | Datum/contact confirmation | Pressure/contact sensing establishes local depth reference. | `pressurePlateContact == true`, `surfaceReferenceRecorded`. |
| S3 | Carriage pre-position | Tool carriage moves to lead-in or operation coordinate without cutting. | `toolInactive`, `targetXYReached`, `positionError <= envelope.pathTolerance`. |
| S4 | Plunge to depth | Tool plunges normal to sheet plane to commanded depth. | `noXYTranslationDuringPlunge`, `depthReached`, `depthError <= envelope.depthTolerance`. |
| S5 | Cutting interpolation | Router/saw/contour operations follow validated X/Y path at depth. Drill point operations may skip or zero this state. | `pathValid`, `feedRateWithinEnvelope`, `toolLoadWithinRange`. |
| S6 | Retract & clear | Tool retracts and carriage clears or moves to next operation. | `toolClear`, `spindleStopped or safe`, `pathComplete`. |
| S7 | Repeat / release | Repeat S2–S6 or label/stage sheet component. | `operationReportWritten`, `labelsReady`, `releaseAllowed`. |

**Sheet invariant S-A:** No carriage translation is permitted during the plunge event itself (`S4`). Sheet-machine interpolation is permitted only in `S5`, only after tool-at-depth confirmation, and only along a path validated by the execution envelope and supported by the MachineEnvelope. Controlled path movement after plunge (`S5`) is required for routing/curvilinear sheet operations.

**Sheet invariant S-B:** The sheet must be supported by backing plates and base rollers. An unsupported floating sheet is mechanically invalid.

---

## 10. Fault recovery and safe-state transitions
Successful execution is not enough. The ontology must define what happens when a state cannot continue.

### 10.1 General recovery sequence

Unless an emergency-stop condition requires immediate power isolation, the default controlled recovery path is:

| Recovery state | Label | Required action |
|---|---|---|
| F0 | Fault detected | Detect refusal, telemetry failure, state violation, tool fault, material shift, or steward halt. |
| F1 | Stop motion request | Command immediate halt of feed/carriage translation. Do not initiate any new motion. |
| F2 | Retract if safe | Retract tool to clear position if doing so is safer than holding. If not safe, hold and require CS intervention. |
| F3 | Spindle/tool safe | Stop or safe the spindle/tool according to tool class and emergency condition. |
| F4 | Maintain support/hold | Maintain clamp/support if release would create hazard; otherwise release only after safe confirmation. |
| F5 | Log refusal | Write `MF.IO.OUT.REFUSAL` with state, operation, telemetry, actor, and packet version. |
| F6 | Steward review | Await CS review if fault is mechanical, calibration, state, tool, or safety-related. |
| F7 | Resume / reroute / abandon | Resume only from a declared safe state; otherwise revise packet, reroute, or abandon operation. |

### 10.2 Fault-specific rules

| Fault | Immediate response | Required record |
|---|---|---|
| `STATE_VIOLATION` | Halt motion; retract/safe tool if possible; block automatic continuation. | Offending state pair, operation ID, generated sequence, corrective rewrite. |
| `ENVELOPE_EXCEEDED` before cutting | Refuse before cycle start. | Packet version, exceeded dimension/tool/tolerance, envelope value. |
| `ENVELOPE_EXCEEDED` mid-cycle | Stop motion, retract/safe tool, CS review. | Actual position/load/condition causing fault; revised envelope if applicable. |
| `MATERIAL_UNSUITABLE` | Do not clamp/cut; preserve material rejection. | Material node, SKU mapping, OP-MS ID, defect reason. |
| `CALIBRATION_STALE` | Do not run; require calibration verification. | Machine profile, expired check, required calibration event. |
| `INTERLOCK_OPEN` | Refuse cycle start or halt if opened mid-cycle. | Interlock type, state, actor if known. |
| `GUARD_NOT_CONFIRMED` | Do not arm tool power; require guard verification. | Guard/interlock identifier, state, inspection requirement. |
| `ESTOP_NOT_VERIFIED` | Do not run; require e-stop test or verification. | E-stop status, last test, responsible actor. |
| `LOTO_REQUIRED` | Do not allow tool change, jam clearing, maintenance, or calibration until lockout/tagout condition is satisfied. | Energy source, lockout state, authorized actor. |
| `PPE_NOT_CONFIRMED` | Do not start cycle in a required-PPE workflow. | Required PPE class, actor, role, training record. |
| `DUST_COLLECTION_NOT_READY` | Do not start or continue operation where chip/dust control is required. | Dust/chip system status, operation class, cell ID. |
| `STEWARD_HALT` | Stop current operation in controlled safe path; CS controls restart decision. | Steward ID, reason, photo/notes if available. |
| `CONTROLLER_HANDSHAKE_MISSING` | Do not enter D0/S0. | Envelope ID, controller ID, expected policy, handshake failure. |
| `NETWORK_LOSS_DURING_EXECUTION` | Follow local controller policy: complete authorized safe segment or enter F0–F7 safe stop. | Controller-time event, network-loss state, operation ID, recovery path. |
| `REMOTE_LIVE_MOTION_COMMAND` | Refuse command; do not execute live motion instruction from UI/cloud layer. | Actor/source, attempted command, state, blocked reason. |
| `MATERIAL_DIMENSION_MISMATCH` | Refuse before tooling; preserve actual vs expected dimensions. | MaterialInstance ID, expected/actual dimensions, OP-MS or sensor source. |
| `TOOL_CONDITION_EXPIRED` | Refuse tool power; require CS/tool registry review. | ToolRegistry ID, condition/inspection status, operation class. |

### 10.3 Emergency stop exception

Emergency stop is not a normal refusal. It may interrupt controlled recovery. After any emergency stop, the system may not resume from the interrupted state. It must enter `MF.STATE.CALIBRATION_VERIFY` or a documented restart inspection before accepting a new WorkPacket or continuing a packet.

---

## 11. Calibration and environmental handshakes
Local deployment means machines may sit in retail stores, lumberyards, workforce labs, or pilot cells with varying temperature, dust, humidity, maintenance, and operator conditions. Calibration cannot be implicit.

### 11.1 Calibration state block

| State | Name | Required confirmation |
|---|---|---|
| C0 | Machine identity verified | `machineProfileId`, firmware/controller version, ontology version. |
| C1 | Datum A verified | Dimensional: fence straightness/reference. Sheet: backing-plate plane/contact. |
| C2 | Datum B verified | Dimensional: table/surface reference. Sheet: base roller/support reference. |
| C3 | Axis homed | Feed/carriage/guide axes homed and position feedback valid. |
| C4 | Tool offsets verified | Kerf, bit diameter, tool length, profile head, plunge offset. |
| C5 | Pressure/contact verified | Clamp pressure, drive contact, sheet pressure plate, material support. |
| C6 | Environment recorded | Temperature/humidity/dust collection state where relevant. |
| C7 | Calibration event written | `MF.EVENT.CALIBRATION.*` written to execution report and owner record if packet-specific. |

### 11.2 Calibration events

- `MF.EVENT.CALIBRATION.DATUM_A_VERIFIED`
- `MF.EVENT.CALIBRATION.DATUM_B_VERIFIED`
- `MF.EVENT.CALIBRATION.AXES_HOMED`
- `MF.EVENT.CALIBRATION.TOOL_LENGTH_SET`
- `MF.EVENT.CALIBRATION.KERF_SET`
- `MF.EVENT.CALIBRATION.BIT_DIAMETER_SET`
- `MF.EVENT.CALIBRATION.PRESSURE_PLATE_ZEROED`
- `MF.EVENT.CALIBRATION.CLAMP_PRESSURE_VERIFIED`
- `MF.EVENT.CALIBRATION.DRIVE_CONTACT_VERIFIED`
- `MF.EVENT.CALIBRATION.ENVIRONMENT_RECORDED`

### 11.3 Calibration governance rule

A CS may calibrate, verify, and record offsets. A CS may not redefine the governing datum identities. For example, the dimensional fence remains Datum A and the base remains Datum B; a calibration event may record deviation or adjustment but cannot make a moving fixture the new governing reference without a new MachineEnvelope and engineering review.

---

## 12. WorkPacket → machine-function cross-reference
This is the glue between repository schema and mechanical truth.

| WorkPacket / schema field | MF / related label | Meaning and validation use |
|---|---|---|
| `workPacket.id` | `MF.IO.IN.PACKET_VERSION` | Execution binds to a specific immutable packet version. |
| `workPacket.ontologyVersion` | `ontologyVersion`, `mfkoVersion` | Material/Labor ontology and machine-function ontology versions used for validation. |
| `captureReferences[]` | `MF.SAFE.REFUSAL.CAPTURE_CONFIDENCE_LOW` | Low-confidence capture can refuse routing before machine validation. |
| `bom[].materialNode` | Material Ontology node | Primary material identity; never a SKU. |
| `bom[].skuMappings[]` | `MF.IO.IN.SKU_MAPPING` | Channel-specific stock/price mapping; not identity. |
| `materialInstances[]` | `MF.IO.IN.MATERIAL_INSTANCE` | Resolved physical stock expected by controller; includes nominal/confirmed dimensions and condition gates. |
| `executionEnvelope` | `MF.STATE.EXECUTION_ENVELOPE_VERIFY` | Controller-facing contract compiled before D0/S0. |
| `controllerPolicy` | `MF.STATE.CONTROLLER_HANDSHAKE` | Declares local controller authority and network-loss behavior. |
| `fabrication[].type` | `MF.OP.*` | Operation class: crosscut, drill, contour, profile, finish, label. |
| `fabrication[].mode` | `MF.MODE.*` | Required execution mode. Must be supported by MachineEnvelope. |
| `fabrication[].machineProfileId` | MachineEnvelope | Identifies eligible machine profile. |
| `fabrication[].machineFunctionRefs[]` | `MF.COMP.*`, `MF.MOTION.*`, `MF.TOOL.*` | Required components and motion systems. |
| `fabrication[].stateSequence[]` | `MF.STATE.*` | Required D/S/C/F state path. |
| `fabrication[].telemetryGates[]` | `MF.SENSE.*`, `MF.SAFE.INTERLOCK.*` | Required confirmations before state transition. |
| `machineRequirements[].ops` | `MF.OP.*`, `MF.TOOL.*` | Tool heads and operation classes required. |
| `machineRequirements[].toolRegistryRefs[]` | `MF.TOOL.*` plus tool ID | Approved physical tool identity, geometry, condition, calibration, and guard requirements. |
| `machineRequirements[].envelopeClass` | MachineEnvelope capability boundary | Physical limits, tooling, tolerance, modes, role requirements. |
| `labor[].requiredTier` | `OP`, `OP-MS`, `CS`, `INST`, `VER`, `OA` | Role permission; vague job titles do not authorize machine operations. |
| `validation.refusals[].code` | `MF.SAFE.REFUSAL.*` | Structured refusal taxonomy. |
| `executionReportRef` | `MF.IO.OUT.EXECUTION_REPORT` | Machine report returned to orchestrator and owner record; distinguishes simulation from physical execution. |
| `labels[]` | `MF.IO.OUT.LABELS`, `MF.OP.LABEL` | Printed component labels and instructions. |
| `fulfillment.staging` | `MF.IO.OUT.STAGED`, `MF.EVENT.CELL.STAGED` | Components staged and ready for pickup/release. |
| `outcome.metrics` | `MF.IO.OUT.SCRAP`, cycle-time fields, first-fit fields | Instrumented results, not marketing claims. |

### 12.1 Minimal schema extension sketch

```ts
type MachineFunctionRef =
  | `MF.COMP.${string}`
  | `MF.MOTION.${string}`
  | `MF.TOOL.${string}`
  | `MF.SENSE.${string}`
  | `MF.SAFE.${string}`;

type MaterialInstance = {
  materialInstanceId: string;
  materialNode: string;
  channelId: string;
  sku?: string;              // channel mapping only; never identity
  skuIsIdentity: false;
  nominalDimensions: Record<string, number | null>;
  confirmedDimensions?: Record<string, number | string | boolean | null>;
  condition?: Record<string, boolean | string | null>;
  substitutionPolicy: string;
};

type ExecutionEnvelope = {
  envelopeId: string;
  packetVersion: string;
  machineProfileId: string;
  controllerPolicy: 'simulationOnly' | 'dryRunLocal' | 'segmentAutonomous' | 'localSafeStopOnLoss' | 'productionLocalPolicy';
  materialInstances: MaterialInstance[];
  operationPlan: FabricationOperation[];
  toolRegistryRefs: string[];
  safetyPrerequisites: string[];
  calibrationSnapshotId: string;
  reportingPolicy: string;
};

type FabricationOperation = {
  opId: string;
  workPacketVersion: string;
  componentId: string;
  operation: `WP.OP.${string}`;
  operationClass: `MF.OP.${string}`;
  requiredMode: `MF.MODE.${string}`;
  machineProfileId: string;
  materialInstanceRefs: string[];
  controllerPolicy?: ExecutionEnvelope['controllerPolicy'];
  machineFunctionRefs: MachineFunctionRef[];
  requiredStates: string[];
  telemetryGates: string[];
  requiredRoles: string[];
  toolRegistryRefs?: string[];
  refusalCodes: string[];
  tolerance?: {
    linearIn?: number;
    angularDeg?: number;
    depthIn?: number;
    source: 'packet' | 'envelope' | 'scenarioParameter';
  };
  scenarioParameter?: boolean;
};
```

---

## 13. MachineEnvelope → state-machine compatibility
A MachineEnvelope must declare not merely what operations a cell supports, but which states and telemetry gates it can perform and report.

### 13.1 Envelope compatibility table

| MachineEnvelope profile | Supported operation classes | Required state model | Interpolation permission | Notes |
|---|---|---|---|---|
| `cell.dimensional.indexed.v1` | `MF.OP.CROSSCUT`, `MF.OP.MITER`, `MF.OP.POINT`, `MF.OP.SEVER` | D0–D8 | No D4/D6 overlap. | Default dimensional demonstration mode. |
| `cell.dimensional.profile.v1` | `MF.OP.EDGE.PROFILE` | D0–D8 plus CS setup | Only if declared; profile engagement must be specified. | Requires CS setup/signoff. |
| `cell.sheet.point.v1` | `MF.OP.POINT`, drill pattern | S0–S4, S6–S7 | No path interpolation required. | Drill/plunge operations. |
| `cell.sheet.contour.v1` | `MF.OP.ROUT.CONTOUR`, `MF.OP.ROUT.STENCIL`, `MF.OP.LINEAR_CUT` | S0–S7 | S5 required. | Curvilinear/2D sheet operations. |
| `cell.sheet.fixed.v1` | `MF.OP.EDGE.PROFILE`, high-precision fixed-sheet operations | S0–S7 plus CS fixture/calibration | S5 permitted after S4. | Requires fixture/datum verification. |
| `cell.finish.v1` | `MF.OP.FINISH.SPRAY`, `MF.OP.FINISH.STAIN` | Finish states to be separately declared | No machining interpolation. | Optional finishing station. |

### 13.2 Validation rules

1. A WorkPacket operation is valid only if at least one eligible MachineEnvelope supports the operation class, mode, required states, telemetry gates, tool, role, and tolerance.
2. An operation requiring `S5` cannot route to a sheet envelope that supports only point operations.
3. A dimensional operation requiring indexed-station behavior cannot depict or request moving-stock cutting unless a synchronized interpolation envelope exists and is separately validated.
4. A profile operation requiring CS setup cannot route to an OP-only channel.
5. A WorkPacket may decompose across sheet and dimensional cells, but each decomposed operation must retain the original packet version and material identity.

---

## 14. Tool registry and tooling readiness
The ontology may name an operation class such as `MF.OP.CROSSCUT` and a tool class such as `MF.TOOL.SAW.DIM`, but a physical machine cannot safely execute from class labels alone. Before a controller accepts an execution envelope, each required tool must resolve to an approved tool-registry entry.

### 14.1 Required tool-registry fields

| Field | Meaning | Validation use |
|---|---|---|
| `toolRegistryId` | Unique physical or configured tool identity. | Binds execution report to actual tool used. |
| `toolClass` | `MF.TOOL.*` class. | Confirms operation/tool compatibility. |
| `machineProfileIds[]` | Machines on which the tool may be used. | Prevents cross-machine assumption. |
| `geometry` | Kerf, diameter, length, profile, bit radius, cutting width, or other relevant geometry. | Required for tolerances/toolpaths. |
| `allowedRanges` | RPM, feed, depth/pass, plunge, material classes, or duty limits. | Enforced by MachineEnvelope/controller. |
| `condition` | Sharpness/inspection/remaining-use/expiry state where applicable. | May trigger `MF.SAFE.REFUSAL.TOOL_CONDITION_EXPIRED`. |
| `calibrationRef` | Offset, kerf, tool length, bit diameter, profile setup. | Links to calibration snapshot. |
| `guardRequirements[]` | Guarding/interlock requirements tied to the tool. | Blocks tool power if unsatisfied. |
| `changeoverRole` | Required role for install/changeover, usually CS for non-routine tooling. | Blocks OP-only tool changes. |
| `lotoRequiredForChangeover` | Whether hazardous-energy control is required before changeover. | Triggers LOTO gate. |

### 14.2 Tool-change rule

A tool change is not a UI action. It is a physical intervention. Any tool change, profile-head change, bit/blade replacement, jam clearing, or maintenance access shall require the appropriate safety state, role authority, and lockout/tagout condition before the tool envelope is accessed.

The system may present a tool as unavailable, expired, uncalibrated, or requiring CS setup. It may not instruct an OP to improvise, bypass a guard, hand-adjust a cutting head, or continue with an unregistered substitute.

### 14.3 Tool data in simulations

For Stage 0 simulation, tool geometry may be a scenario parameter. In any physical pilot or production claim, tool geometry, offsets, and condition must be measured or approved values. A demo must not present simulated kerf, cycle time, cutting rate, or tool wear as measured machine performance.

---

## 15. Operations, roles, and component mapping
### 15.1 Operation taxonomy

| Operation class | Label | Meaning |
|---|---|---|
| Point operation | `MF.OP.POINT` | Drill or plunge at a single validated coordinate. |
| Indexed station cut | `MF.OP.CROSSCUT`, `MF.OP.MITER`, `MF.OP.SEVER` | Dimensional stock indexed to station, held, cut, retracted. |
| Linear cut | `MF.OP.LINEAR_CUT` | Straight sheet or dimensional cut where supported. |
| Contour route | `MF.OP.ROUT.CONTOUR` | Sheet routing / curvilinear path after plunge. |
| Stencil route | `MF.OP.ROUT.STENCIL` | Validated 2D path, typically sheet contour mode. |
| Edge profile | `MF.OP.EDGE.PROFILE` | Profile head or router operation along validated edge. |
| Finish | `MF.OP.FINISH.SPRAY`, `MF.OP.FINISH.STAIN` | Optional governed finishing operation. |
| Label / stage | `MF.OP.LABEL`, `MF.OP.STAGE` | Non-cutting release operations binding parts to instructions and pickup. |

### 15.2 Dimensional operation mapping

| WorkPacket operation | Required mode | Required components | Required role | Required sequence |
|---|---|---|---|---|
| `WP.OP.DIM.CROSSCUT` | `MF.MODE.DIM_INDEXED_STATION` | `MF.COMP.FENCE.503`, `MF.COMP.SURFACE.DIM.502`, `MF.COMP.ROLLER.CLAMP.507`, `MF.COMP.ROLLER.MANIP.DIM.504`, `MF.MOTION.SERVO.FEED`, `MF.TOOL.SAW.DIM.506` | OP; OP-MS if material confirmation required | D0→D1→D2→D3→D4→D5→D6→D7→D8 |
| `WP.OP.DIM.DRILL_PATTERN` | `MF.MODE.DIM_INDEXED_POINT` | Fence, surface, clamp, manip rollers, feed servo, drill head | OP | D0–D5→point plunge→D7–D8 |
| `WP.OP.DIM.EDGE_PROFILE` | `MF.MODE.DIM_PROFILE_VALIDATED` | Fence, clamp, carriage/tool, profile/router head | CS setup + OP execution | D0–D5→validated profile engagement→D7–D8 |
| `WP.OP.DIM.SEVER_COMPONENT` | `MF.MODE.DIM_INDEXED_STATION` | Same as crosscut plus release/stage | OP | D0–D8 plus label/stage event |

### 15.3 Sheet operation mapping

| WorkPacket operation | Required mode | Required components | Required role | Required sequence |
|---|---|---|---|---|
| `WP.OP.SHEET.ROUT_CONTOUR` | `MF.MODE.SHEET_CONTOUR` | Backing plates, base rollers, carriage, router, pressure/contact sensing | OP; OP-MS if material confirmation required | S0→S1→S2→S3→S4→S5→S6→S7 |
| `WP.OP.SHEET.DRILL_PATTERN` | `MF.MODE.SHEET_POINT` | Backing plates, base rollers, carriage, drill, pressure/contact sensing | OP | S0→S1→S2→S3→S4→S6→S7 |
| `WP.OP.SHEET.LINEAR_CUT` | `MF.MODE.SHEET_LINEAR` | Backing plates, base rollers, carriage, saw/router | OP | S0–S7 |
| `WP.OP.SHEET.EDGE_PROFILE` | `MF.MODE.SHEET_PROFILE_VALIDATED` | Edge/profile head, fixture if needed | CS setup + OP execution | S0–S7 with steward setup event |

---

## 16. Human roles, permissions, and refusal authority
Vague labels such as “carpenter,” “tech,” or “handyman” do not grant authority. A WorkPacket names required roles; the capability registry proves whether a person/channel holds them.

| Role | Code | Permitted actions | Forbidden actions |
|---|---|---|---|
| Owner / owner agent | `OA` | Approve substitutions, verify outcome, assemble owner-scope labeled parts where packet permits. | Operate fabrication cell unless separately certified. |
| Standard operator | `OP` | Load material, initiate approved sequence, monitor, apply labels, stage components. | Edit CAM geometry, override envelope, bypass interlocks, redefine datums. |
| Material-sensing operator | `OP-MS` | Confirm species, grade, flatness, moisture, defect suitability; reject material before clamping/seating. | Override envelope or toolpath. |
| Cell steward | `CS` | Tool changeover, fixture setup, calibration verification, steward halt/refusal, setup signoff. | Redefine governing datum identities. |
| Installer | `INST` / `INST-S` | Site installation under scoped packet; verify site interface where authorized. | Operate fabrication cell unless separately certified. |
| Verifier / inspector | `VER` | Independent verification, as-built deltas, closure support. | Execute machine operations unless separately certified. |

### 16.1 Refusal vectors

| Refusal | Code | Trigger | Effect |
|---|---|---|---|
| Capture confidence low | `MF.SAFE.REFUSAL.CAPTURE_CONFIDENCE_LOW` | Scan/measurements insufficient for requested tolerance or site interface. | WorkPacket revision required. |
| Envelope exceeded | `MF.SAFE.REFUSAL.ENVELOPE_EXCEEDED` | Required dimension, reach, tool, tolerance, mode, or material outside MachineEnvelope. | Refuse before execution or enter fault recovery if detected mid-cycle. |
| Material unsuitable | `MF.SAFE.REFUSAL.MATERIAL_UNSUITABLE` | OP-MS rejects stock for grade, species, defect, flatness, moisture, or movement risk. | Preserve refusal; reroute or substitute only under policy. |
| SKU unavailable | `MF.SAFE.REFUSAL.SKU_UNAVAILABLE` | Channel cannot map ontology material node to available SKU/stock. | Quote/routing refusal, not material-identity failure. |
| Calibration stale | `MF.SAFE.REFUSAL.CALIBRATION_STALE` | Calibration interval expired or datum check failed. | CS verification required. |
| Tool unavailable | `MF.SAFE.REFUSAL.TOOL_UNAVAILABLE` | Required tool/profile head not installed, certified, or available. | Reroute or CS setup required. |
| State violation | `MF.SAFE.REFUSAL.STATE_VIOLATION` | Attempted overlap of forbidden states or motion during plunge. | Stop/rewrite/refuse. |
| Interlock open | `MF.SAFE.REFUSAL.INTERLOCK_OPEN` | Guard, e-stop, dust collection, clamp/pressure, or operator-clear interlock not satisfied. | No cycle start or controlled stop. |
| Guard not confirmed | `MF.SAFE.REFUSAL.GUARD_NOT_CONFIRMED` | Required guard or point-of-operation protection not verified. | Do not arm tool power. |
| E-stop not verified | `MF.SAFE.REFUSAL.ESTOP_NOT_VERIFIED` | Emergency stop readiness not current. | Block cycle start; require verification. |
| Lockout/tagout required | `MF.SAFE.REFUSAL.LOTO_REQUIRED` | Tool change, maintenance, calibration, jam clearing, or fault recovery requires hazardous-energy control. | Block machine access until satisfied by authorized role. |
| Operator not clear | `MF.SAFE.REFUSAL.OPERATOR_NOT_CLEAR` | Operator, steward, or bystander may be inside hazard zone. | No motion or tool power. |
| PPE not confirmed | `MF.SAFE.REFUSAL.PPE_NOT_CONFIRMED` | Required protective equipment condition not confirmed for the role/operation. | Refuse start or require role confirmation. |
| Dust collection not ready | `MF.SAFE.REFUSAL.DUST_COLLECTION_NOT_READY` | Required chip/dust collection or extraction not ready. | Refuse tool activation. |
| Production readiness not established | `MF.SAFE.REFUSAL.PRODUCTION_READINESS_NOT_ESTABLISHED` | Machine is demo/pilot-only or missing commissioned readiness records. | Block production claim or production WorkPacket. |
| Telemetry missing | `MF.SAFE.REFUSAL.TELEMETRY_MISSING` | Required confirmation absent or stale. | Block transition. |
| Steward halt | `MF.SAFE.REFUSAL.STEWARD_HALT` | CS observes unsafe or unanticipated condition. | Preserved event; WorkPacket requires review. |

Refusals are data, not errors. They must be written to the owner-held record and bound to the packet version that produced them.

---

## 17. Execution report schema
The machine does not merely cut. It reports the execution, refusals, materials, labels, staging, and calibration context back to the owner-held record.

### 17.1 Required machine inputs

| Input | Source | Label |
|---|---|---|
| Packet version | Record / Orchestrator | `MF.IO.IN.PACKET_VERSION` |
| Execution envelope | Orchestrator → local controller | `MF.IO.IN.EXECUTION_ENVELOPE` |
| Controller policy | Execution envelope | `MF.IO.IN.CONTROLLER_POLICY` |
| Material list | Packet BOM | `MF.IO.IN.MATERIAL_LIST` |
| Material instances | Execution envelope | `MF.IO.IN.MATERIAL_INSTANCE` |
| SKU mapping | Channel adapter | `MF.IO.IN.SKU_MAPPING` |
| Operation list/toolpath | Orchestrator / controller | `MF.IO.IN.TOOLPATH` |
| Tool registry references | Execution envelope / capability registry | `MF.IO.IN.TOOL_REGISTRY` |
| Mode requirements | MachineEnvelope | `MF.IO.IN.MODE` |
| Tolerance requirements | Packet / envelope | `MF.IO.IN.TOLERANCE` |
| Required roles | Capability registry | `MF.IO.IN.ROLE_REQUIREMENTS` |
| Label set | Packet / document context | `MF.IO.IN.LABEL_SET` |

### 17.2 Required machine outputs

| Output | Destination | Label |
|---|---|---|
| Execution report | Orchestrator / owner record | `MF.IO.OUT.EXECUTION_REPORT` |
| Operation timestamps | Event store | `MF.IO.OUT.OP_TIMESTAMPS` |
| Controller event log | Orchestrator / owner record | `MF.IO.OUT.CONTROLLER_EVENT_LOG` |
| Material consumed | Outcome metrics | `MF.IO.OUT.MATERIAL_CONSUMED` |
| Scrap/offcut report | Outcome metrics | `MF.IO.OUT.SCRAP` |
| Refusal report | Record / orchestrator | `MF.IO.OUT.REFUSAL` |
| Label print event | Document context / printer | `MF.IO.OUT.LABELS` |
| Staging event | Record / fulfillment | `MF.IO.OUT.STAGED` |
| Pickup/release event | Record / channel | `MF.IO.OUT.RELEASED` |

### 17.3 Complete execution report skeleton

```json
{
  "executionReportId": "exec.ws-001.001",
  "reportType": "machine.executionReport",
  "executionMode": "simulation | dryRunLocal | physicalPilot | production",
  "packetVersion": "wp.sarah-alcove.v3",
  "executionEnvelopeId": "env.ws-001.v3.cell-dim.001",
  "machineProfileId": "cell.dimensional.indexed.v1",
  "controllerId": "controller.local.demo-001",
  "controllerPolicy": "segmentAutonomous",
  "machineEnvelopeVersion": "machineEnvelope/1.1-demo",
  "mfkoVersion": "mfko/1.2",
  "ontologyVersion": "ontology/2026.demo",
  "channelId": "store.greensboro.demo",
  "timebase": {
    "controllerStartedAt": null,
    "controllerCompletedAt": null,
    "orchestratorReceivedAt": null,
    "recordWrittenAt": null,
    "note": "Controller time, orchestrator receipt time, and record-write time are distinct."
  },
  "actors": {
    "operator": {"role": "OP", "certificationId": "demo-op-001"},
    "materialSensingOperator": {"role": "OP-MS", "certificationId": "demo-opms-001", "required": true},
    "cellSteward": {"role": "CS", "certificationId": "demo-cs-001", "required": false}
  },
  "materialInstances": [
    {
      "materialInstanceId": "mi.ws-001.cherry-1x8.01",
      "materialNode": "mat.wood.cherry.nc.select.1x8",
      "sku": "CHR-196",
      "skuIsIdentity": false,
      "nominalDimensions": {"thicknessIn": null, "widthIn": null, "lengthIn": null},
      "confirmedDimensions": {"thicknessIn": null, "widthIn": null, "lengthIn": null, "required": true},
      "condition": {"gradeConfirmed": null, "flatnessAccepted": null, "defectsAccepted": null, "moistureAccepted": null}
    }
  ],
  "safetyReadiness": {
    "guardVerified": null,
    "estopVerified": null,
    "interlocksClosed": null,
    "operatorClear": null,
    "ppeConfirmed": null,
    "dustCollectionReady": null,
    "productionReadinessEstablished": false
  },
  "calibration": {
    "calibrationSetId": "cal.dim.2026-06-15.001",
    "events": [
      "MF.EVENT.CALIBRATION.DATUM_A_VERIFIED",
      "MF.EVENT.CALIBRATION.DATUM_B_VERIFIED",
      "MF.EVENT.CALIBRATION.KERF_SET",
      "MF.EVENT.CALIBRATION.CLAMP_PRESSURE_VERIFIED"
    ],
    "currentAtStart": true
  },
  "toolRegistry": [
    {
      "toolRegistryId": "tool.saw.dim.506.demo",
      "toolClass": "MF.TOOL.SAW.DIM.506",
      "geometry": {"kerfIn": null, "diameterIn": null},
      "conditionCurrent": null,
      "calibrationRef": "cal.dim.2026-06-15.001",
      "scenarioParameter": true
    }
  ],
  "operations": [
    {
      "opId": "op.dim.crosscut.001",
      "componentId": "WS-02-FACE-RAIL",
      "opClass": "MF.OP.CROSSCUT",
      "workPacketOperation": "WP.OP.DIM.CROSSCUT",
      "requiredMode": "MF.MODE.DIM_INDEXED_STATION",
      "materialInstanceRefs": ["mi.ws-001.cherry-1x8.01"],
      "toolRegistryRefs": ["tool.saw.dim.506.demo"],
      "stateSequence": ["D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"],
      "stateLog": [
        {"state": "D0", "enteredAtController": null, "exitedAtController": null, "telemetry": {"executionEnvelopeAccepted": true, "controllerHandshakeConfirmed": true}},
        {"state": "D1", "enteredAtController": null, "exitedAtController": null, "telemetry": {"materialInstanceVerified": null}},
        {"state": "D2", "enteredAtController": null, "exitedAtController": null, "telemetry": {"clampPressureConfirmed": true}},
        {"state": "D4", "enteredAtController": null, "exitedAtController": null, "telemetry": {"targetXReached": true}},
        {"state": "D6", "enteredAtController": null, "exitedAtController": null, "telemetry": {"toolEngaged": true, "remoteLiveCommand": false}}
      ],
      "materialConsumed": [{"materialInstanceId": "mi.ws-001.cherry-1x8.01", "quantity": 1, "unit": "board"}],
      "scrap": {"quantity": null, "unit": null, "scenarioParameter": true},
      "result": "complete",
      "refusalEvents": []
    }
  ],
  "networkEvents": [
    {"event": "controllerHandshake", "result": "accepted", "atController": null},
    {"event": "progressReport", "result": "reported", "atController": null, "receivedByOrchestrator": null}
  ],
  "labelsPrinted": ["WS-01", "WS-02", "WS-03"],
  "staging": {"staged": true, "event": "MF.EVENT.CELL.STAGED"},
  "cycleTime": {
    "totalSeconds": null,
    "scenarioParameter": true,
    "segments": {
      "preflightSeconds": null,
      "loadSenseSeconds": null,
      "clampSeconds": null,
      "indexSeconds": [],
      "toolEngageSeconds": [],
      "cutPathSeconds": [],
      "labelSeconds": null,
      "stagingSeconds": null
    }
  },
  "outcomeMetricsRef": "outcome.ws-001"
}
```

---

## 18. Sarah’s alcove example — end-to-end mechanical trace
Sarah’s project is the demo anchor because it ties all layers together. She captures an awkward alcove/window-seat bay; the record preserves wall lines, floor slope, the half-inch wall bow, alignment preferences, trim match, material preference, and buildability confirmation. The packet is not a drawing and not a SKU list. It is a versioned fabrication definition.

### 18.1 Example component decomposition

| Packet component | Material class | Likely cell | Example operations | Notes |
|---|---|---|---|---|
| `WS-01 SEAT LID` | Component from sheet or dimensional stock | Sheet or dimensional, depending design | linear cut, edge profile, drill pattern | Must map to material node and SKU. |
| `WS-02 FACE RAIL` | Component from dimensional stock | Dimensional | crosscut, drill, edge profile | Indexed station operations. |
| `WS-03 SIDE PANEL L` | Component from sheet stock | Sheet | contour route / scribe edge | Handles wall bow / site interface. |
| `WS-04 SIDE PANEL R` | Component from sheet stock | Sheet | contour route / drill pattern | Bound to captured envelope. |
| `WS-05 NAILER` | Component from dimensional stock | Dimensional | crosscut / drill | Hidden support. |
| `PLY-1 BACKER` | Component from sheet stock | Sheet | linear cut / drill pattern | Label-driven assembly. |

### 18.2 SKU mapping and material-instance rule

A store SKU may appear in the pick list and quote, but it is not the material identity. The ontology material node is primary; the channel adapter maps it to local SKU, price, stock, and timestamp. Before machine acceptance, the orchestrator resolves that mapping into one or more `materialInstances[]` with expected physical dimensions and confirmation requirements.

```json
{
  "materialNode": "mat.wood.cherry.nc.select.1x8",
  "channelId": "store.greensboro.demo",
  "sku": "CHR-196",
  "stockQty": 2,
  "priceCents": null,
  "asOf": "scenario-parameter",
  "materialInstances": [
    {
      "materialInstanceId": "mi.ws-001.cherry-1x8.01",
      "skuIsIdentity": false,
      "nominalDimensions": {"thicknessIn": null, "widthIn": null, "lengthIn": null},
      "confirmedDimensionsRequired": true,
      "conditionConfirmationRequired": ["grade", "flatness", "defects", "moisture where relevant"]
    }
  ]
}
```

### 18.3 Example operation trace

| Component | Operation | Machine | State sequence |
|---|---|---|---|
| Face rail | `WP.OP.DIM.CROSSCUT` | Dimensional cell | D0→D1→D2→D3→D4→D5→D6→D7→D8 |
| Side panel L | `WP.OP.SHEET.ROUT_CONTOUR` | Sheet cell | S0→S1→S2→S3→S4→S5→S6→S7 |
| Seat lid | `WP.OP.SHEET.DRILL_PATTERN` | Sheet cell | S0→S1→S2→S3→S4→S6→S7 |
| Edge profile | `WP.OP.DIM.EDGE_PROFILE` or `WP.OP.SHEET.EDGE_PROFILE` | Determined by component | Requires CS setup if profile head/tool change required. |

### 18.4 Archive closeout

After fabrication, the system returns: label set printed; component staging event; pickup/release event; installation or owner-assembly milestone; owner verification; outcome record with as-built deltas, warranty, scrap, atom-miles, first-fit status, and lessons for the next project.

The final claim is not merely that a part was cut. The final claim is: **the owner-held record now contains the as-built result, so the next project begins from a better record than the previous one.**

---

## 19. Forbidden depictions and generated-output conformance
### 19.1 Mechanical forbidden depictions

- Do not show the dimensional saw chasing a moving board along the feed axis.
- Do not show active feed/indexing and tool engagement at the same time unless a synchronized interpolation envelope is explicitly declared and validated.
- Do not swap the functions of clamping rollers and manipulating rollers.
- Do not show idler rollers as powered drive rollers.
- Do not show the fence, base, backing plates, or guide rails drifting, flexing, or translating as if they are not references.
- Do not show a sheet floating without backing plate and base support.
- Do not treat the pressure/contact head as the global sheet X datum.
- Do not eliminate sheet cutting interpolation; router/curvilinear operations require tool-at-depth path movement after plunge.
- Do not show an operator hand-feeding stock into an active tool in governed mode.
- Do not show a person reaching into the tool envelope, pinch-point zone, roller nip point, or guarded area during active or armed machine states.
- Do not remove guards or interlocks for visual clarity.
- Do not show tool change, maintenance, jam clearing, or calibration without a lockout/tagout or tool-power-disabled condition.
- Do not show a fault recovery that skips safe stop, tool retract/hold decision, power safeing, and steward review.
- Do not show PPE, dust collection, or operator-clear requirements as optional when the operation requires them.
- Do not show an installer operating the fabrication cell unless separately certified as OP/CS.
- Do not show OP or OP-MS editing CAM geometry.
- Do not show carriage translation during plunge; distinguish plunge from cutting interpolation.

### 19.2 Governance forbidden depictions

- Do not make a SKU the primary material identity.
- Do not make CAM/machine code the packet identity.
- Do not allow a vendor/channel format to leak inward as WorkPacket truth.
- Do not erase refusals; preserve them as record events.
- Do not imply validated commercial lead time, cycle time, scrap, emissions, or first-fit performance unless measured.
- Do not show the vendor/store/fabricator replacing the homeowner as record holder.
- Do not show outcome closeout without owner verification or authorized verifier event.

### 19.3 Generated-output conformance checklist

Before accepting any generated output, answer every item:

- [ ] All visible components map to `MF.COMP.*`, `MF.MOTION.*`, or `MF.TOOL.*` labels.
- [ ] All operations map to `MF.OP.*` and WorkPacket operation fields.
- [ ] All modes map to `MF.MODE.*` and a MachineEnvelope that supports them.
- [ ] All dimensional motions follow D0–D8 or a declared, validated exception.
- [ ] All sheet motions follow S0–S7, with plunge and cutting interpolation separated.
- [ ] All calibration assumptions are either current, recorded, or refused.
- [ ] All state transitions have telemetry or interlock gates.
- [ ] Required guard, e-stop, operator-clear, LOTO, PPE, dust collection, and role-certification conditions are either confirmed or refused.
- [ ] No visual simplification removes a guard, interlock, support, clamp, or safety boundary.
- [ ] No forbidden depictions appear.
- [ ] Datums A/B/C are respected and not visually redefined.
- [ ] No tool engagement occurs during dimensional indexing.
- [ ] No carriage translation occurs during sheet plunge.
- [ ] OP, OP-MS, CS, INST, VER, and OA actions remain within role permissions.
- [ ] SKUs are mappings, not material identity.
- [ ] Refusals are preserved as events.
- [ ] Cycle-time/scrap/atom-mile/first-fit values are marked as scenario parameters unless measured.

### 19.4 Generated-output conformance block

```text
Before accepting generated output, audit it against `docs/MACHINE_FUNCTION_KINEMATIC_ONTOLOGY.md`.

1. Identify every depicted machine component and map it to an MF.COMP, MF.MOTION, or MF.TOOL label.
2. Identify every movement and map it to a valid D, S, C, or F state sequence.
3. Confirm that dimensional indexing and tool engagement do not overlap unless explicitly declared by MachineEnvelope and safety review.
4. Confirm that sheet plunge and cutting interpolation are distinct: no carriage translation during plunge; controlled path movement only after plunge where required.
5. Confirm that SKUs are channel mappings, not material identity.
6. Confirm that operator, OP-MS, CS, installer, verifier, and owner-agent actions remain inside their role boundaries.
7. Confirm that guard, e-stop, LOTO, PPE, dust collection, operator-clear, and calibration prerequisites are satisfied or refused.
8. If any step violates the ontology, emit the relevant MF.SAFE.REFUSAL.* code, identify the offending state/component, and rewrite the sequence.
```

---

## 20. Repo integration requirements
Add this file as:

`docs/MACHINE_FUNCTION_KINEMATIC_ONTOLOGY.md`

Recommended companion additions, framed as future implementation artifacts rather than files included in this public review package unless separately present:

1. `packages/ontology/machineFunction.ts` — label enums and state constants.
2. `packages/schema/machineEnvelope.ts` — deployable machine capability schema.
3. `packages/schema/executionReport.ts` — report schema returned to owner record.
4. `packages/schema/workPacket.ts` update — `fabrication[].machineFunctionRefs[]`, `stateSequence[]`, `telemetryGates[]`.
5. `docs/GENERATED_OUTPUT_CONFORMANCE.md` — optional short-form conformance wrapper referencing this document without replacing it.
6. `home-twin-app.html` update — Sarah demo events should use the same state labels.
7. `docs/SAFETY_STAGE_GATES.md` or equivalent engineering-owned safety plan — physical implementation requirements, hazard analysis, guarding, LOTO, PPE, training, and certification records.
8. Optional `docs/MACHINE_FUNCTION_TEST_VECTORS.md` — pass/fail examples for generated-output audits.

Minimum linkage test:

```ts
function validateFabricationOperation(op: FabricationOperation, env: MachineEnvelope): ValidationResult {
  assert(env.supportedOperations.includes(op.operationClass));
  assert(env.supportedModes.includes(op.requiredMode));
  assert(op.requiredStates.every(s => env.supportedStates.includes(s)));
  assert(op.telemetryGates.every(g => env.telemetryGates.includes(g)));
  assert(op.machineFunctionRefs.every(ref => env.componentsOrTools.includes(ref)));
  assert(op.requiredRoles.every(role => env.certifiedRoles.includes(role)));
  return { ok: true };
}
```

---

## 21. Closing statement
This document is the mechanical dictionary for the Scan-to-Build repo. It does not replace the patents. It prevents the repo, demo, and generated-output tooling from drifting away from them.

The controlling chain is:

1. The homeowner record holds the truth.
2. The WorkPacket carries only validated, versioned scope.
3. The Material & Labor Ontology defines what the packet means.
4. The MachineEnvelope defines what a given cell can safely execute.
5. The Machine Function & Kinematic Ontology defines how the hardware is allowed to behave.
6. The execution report returns results, refusals, labels, staging, metrics, and outcome events to the owner record.

A demo may be beautiful, but it must be subordinate to this chain. If an animation, UI, code generator, or sales narrative violates the machine states, telemetry gates, role boundaries, datums, or packet semantics described here, it is not merely a design issue. It is a governance failure and must be corrected before publication.
