# Machine Engineering — Next-Step Surface

**Status:** stable navigation surface for deep mechanical work  
**Purpose:** keep detailed machine engineering easy to find without pushing it into the Store or application.

This is the next-step engineering bucket for Scan-to-Build.

The strongest post-app mechanical source family already exists. It should be reconciled and developed here rather than rebuilding machine concepts from the early public demo.

## Primary post-app engineering spine

Read in this order:

1. **Cell spine** — `GeorgePlattDemo/grok-file`, accepted app pin `4595b4785a2686486e477ce2e70fb3f476285a8d`, `docs/cell/STB-CELL-0.1.md`
   - descriptive working artifact;
   - GR → Store → Cell → local controller boundary;
   - D-001 and S-001 mechanics;
   - machine-neutral operations and lowering;
   - local control / network separation;
   - candidate audit objects;
   - patent feature correspondence;
   - explicit unresolved engineering.

2. **Atlas 04 — Neutral Ops to Machine** — same pin, `docs/atlas/STB-ATLAS-04-NEUTRAL-OPS-TO-MACHINE-0.1.md`
   - Store part/feature job ≠ machine program ≠ controller state ≠ motion;
   - CAM/post/controller field split;
   - FreeCAD/Fusion/VCarve/SWOOD and wood-OEM file worlds as field examples;
   - LinuxCNC / FluidNC / GRBL / Mach / UCCNC context;
   - referencing/touch-off/probe/work offsets;
   - no app- or Store-emitted G-code.

3. **Atlas 05 — Envelope Ladder** — same pin, `docs/atlas/STB-ATLAS-05-ENVELOPE-LADDER-0.1.md`
   - bounded machine-family comparisons;
   - dimensional versus sheet distinction;
   - early square-cut / angle / drill / mill / sheet / contour / advanced capability comparison;
   - no invented commissioned travel or capability.

4. **Atlas 06 — Iron** — same pin, `docs/atlas/STB-ATLAS-06-IRON-0.1.md`
   - off-the-shelf control/drive/I/O/workholding/safety families;
   - LinuxCNC + Mesa as an open intro-cell candidate, not an adopted controller;
   - EtherCAT / industrial controller horizon;
   - stepper / closed-loop stepper / AC servo / VFD distinctions;
   - pneumatics, transfer, reference surfaces and sensing candidates;
   - hard separation between ordinary controls and safety-rated stop architecture;
   - no adopted BOM, motor sizing, or safety category.

These sources are useful because they were written after the current layer boundaries were established. Their status still matters: the Cell spine is descriptive/candidate; Atlas 04–06 are field surveys, **not adopted specifications**.

## Older machine ontology

The public review repository contains `docs/MACHINE_FUNCTION_KINEMATIC_ONTOLOGY.md`.

Disposition here: **KEEP-DONOR / RECONCILE BEFORE ADMISSION**.

It contains substantial useful patent-derived labels, machine concepts, safety thinking, states, and feature descriptions, but it predates the current App / Store / Governed / Cell ownership cleanup and should not be copied wholesale into current engineering authority.

Mine it later for content that survives the current boundaries.

## Engineering layers

Keep these separate even when one implementation tool spans more than one layer:

| Layer | Holds |
| --- | --- |
| Part requirement | finished dimensions, part-relative features, identity, required operation class |
| Store / machine-neutral | selected material/item, declared capability fit, portable bounded operation sequence |
| Cell lowering | local station choice, tool identity, kerf/kept-face logic, work references, transform into a commissioned local program |
| Controller state | homing/work offsets, tool table, mode, I/O, interlocks, program state |
| Motion / drives | actual commanded axes, motors, valves, spindles and actuators |
| Physical evidence | observed cycle, faults, measurements, outcome, maintenance/commissioning facts |

Do not collapse those layers into one “machine file.”

## Dimensional engineering bucket

Future detailed dimensional work belongs under a `dimensional/` subfolder and may include:

- base / table / fence geometry;
- material support and over-length handling;
- feed/index mechanism;
- clamps and hold-down;
- saw station(s);
- mill/router/drill stations;
- reference establishment and invalidation;
- tooling registry;
- actuator selection;
- sensing candidates;
- controller and I/O candidates;
- local lowering;
- commissioning measurements;
- failure/refusal cases;
- patent correspondence by feature.

The current Cell spine already provides a useful D-001 cast and identifies what is still unresolved. Do not convert patent-exemplary dimensions or mechanisms into commissioned requirements without engineering evidence.

## Sheet engineering bucket

Future detailed sheet work belongs under a `sheet/` subfolder and may include:

- frame and support plane;
- bottom support/reference rollers;
- yokes / sheet-feed mechanism;
- tooling platform motion;
- fixed versus moving sheet modes;
- tool receiver and tool changes;
- pressure/contact depth datum;
- sacrificial support;
- workholding / carrier concepts;
- controller and I/O candidates;
- local lowering;
- commissioning measurements;
- failure/refusal cases;
- patent correspondence by feature.

The current Cell spine describes S-001 as patent correspondence/reference-cell material only. S-001 does not become Store-callable capability until an owning Store/cell source adopts actual evidence.

## Off-the-shelf and open-source research rule

Research may identify commercially available components and open-source software that could implement a required function.

For every candidate record:

- required function;
- machine feature/station it serves;
- candidate product/software;
- interface and constraints;
- source documentation;
- reason it fits;
- safety role, if any;
- what it **does not** establish;
- status: research / selected-for-prototype / installed / commissioned / rejected.

A catalog part number is not machine capability. Open-source availability is not safety validation.

## Patent correspondence

The machine engineering surface should maintain an explicit feature correspondence register so an implementer can follow the chain from project requirement to physical function without using the patent as runtime authority.

Recommended fields:

| Field | Meaning |
| --- | --- |
| Project / part requirement | What the finished part needs |
| Neutral operation | Portable operation class |
| Machine function | Physical function required |
| Machine / station | Dimensional, sheet, shared service, or secondary operation |
| Patent correspondence | Figure/callout/specification locus where useful |
| Current implementation | What is actually selected/installed |
| Evidence | test/commissioning/source record |
| Store-visible declaration | only the bounded capability the Store needs to know |
| Unresolved | remaining engineering gap |

Patent correspondence explains lineage. It does not replace engineering, safety review, commissioning, or Store capability evidence.

## Store firewall

Only a bounded declaration should travel back upstream to Store, such as:

- supported stock form;
- supported operation;
- dimensional envelope;
- tooling prerequisite;
- quantity/batch condition where relevant;
- known unsupported/refusal conditions;
- capability/envelope version;
- whether the capability is reference, commissioned, or measured.

Keep out of ordinary Store records unless genuinely required:

- axis coordinates;
- postprocessor implementation;
- G-code / OEM program text;
- servo tuning;
- motor/drive part numbers;
- safety relay wiring;
- PLC/HAL ladder details;
- sensor thresholds that are purely local machine control;
- tool-change mechanics;
- machine-maintenance internals.

The Store needs to know **what the cell can truthfully support**, not how every bearing and bit makes it happen.

## Operational authority at the yard / cell

The machine and fulfillment surfaces use a firm human-authority split.

A site owner may hold or delegate the **CELL_STEWARD** role. The cell steward may be granted bounded authority to accept/reject a completion plan, accept/reject declared yard secondary work, confirm completion records, stage identified parts, record custody transfer, and close the project.

The **OPERATOR** role is intentionally different.

> **Operator authority is STOP / REPORT only. An operator may not promote state.**

An operator must not be allowed to:

- reinterpret a project requirement;
- substitute an operation or tool requirement;
- change a Store disposition;
- widen an envelope;
- accept a customer's secondary-work choice on behalf of the yard;
- waive a gate;
- change price or commercial terms;
- mark a project ready for handoff;
- transfer custody;
- close a project;
- create controller or production authority.

If an operator performs physical work under an already accepted local process, the operator may report the condition/outcome. Promotion to an authoritative completion, staging, custody, or closeout state belongs to the cell steward or to a separately approved self-verifying rule. No automatic promotion rule is established here.

The cross-project completion contract is documented in:

`../../capability-bridge/COMPLETION-PATH-0.1.md`

and implemented in:

`apps/stb/shared/completion-contract.mjs`

## Immediate engineering deliverable

The next deep mechanical pass should reconcile the Cell spine + Atlas 04–06 into three new post-app planning documents without yet buying parts or claiming commissioning:

1. `dimensional/DIMENSIONAL-MACHINE-BUILD-0.1.md`
2. `sheet/SHEET-MACHINE-BUILD-0.1.md`
3. `../staging/RESEARCH-CELL-STAGING-0.1.md`

The first two may become excruciatingly detailed. The staging document should stay short, evidence-based, and readable.

**NO BLOOD ON WOOD.**
