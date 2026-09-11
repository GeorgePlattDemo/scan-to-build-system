# Dimensional Machine Staging 0.1

**Status:** current post-app planning surface  
**Physical commissioning status:** not established by the admitted repository evidence  
**Owner direction:** increase the useful bounded capability of the dimensional machine before the research-cell build  
**Store/cell evidence-stage vocabulary:** preserved from `STB-STORE-CELL-STAGES-0.1.md`

This file tracks what the dimensional workstream may truthfully claim, what is only reference material, and what evidence is required before Store 1 can expose a capability as current.

## 1. Current evidence

### Stage 1 reference

CUT-001 proves the information chain for one dimensional board and one square finished requirement:

- nominal 2×4×6 SPF parent stock;
- 60.000 in finished kept length;
- square crosscut after origin/cleanup;
- label;
- staged pickup.

This remains the regression/reference chain. It does not establish a commissioned production machine.

### Stage 2 reference

The current Stage-2 Store source declares D-001 reference capability beyond the Stage-1 square-cut path, including bounded `MILL_LONGITUDINAL_PROFILE` and `MILL_END_PROFILE` behavior for Store evaluation/economic modeling.

This is declared reference capability. Mill station geometry, cycle time and related values remain model/fixture facts unless separately measured.

### Cell-spine correspondence

The post-app Cell spine describes a richer dimensional machine family corresponding to the issued patent disclosure, including:

- base/support table;
- fixed fence/reference face;
- manipulating/feed rollers;
- idler support rollers;
- clamping/hold-down;
- end sawing stations;
- vertical and horizontal ways;
- drill/router tool heads;
- local panel / jog / automatic modes;
- local workpiece-reference chain;
- lowering from part-relative neutral operations to local machine actions.

That description is a mechanical/reference spine, not evidence that those functions are installed or commissioned.

## 2. Owner-stated next direction

The next dimensional build is intended to add **some bounded useful capability** to the dimensional machine.

The exact increment should be selected from a real research/use need rather than by trying to implement every disclosed patent function.

Candidate function families already present in current source material include:

- square crosscut;
- bounded milling/profile work;
- drilling;
- routing;
- bounded angle/miter work where later justified;
- indexing while preserving a workpiece reference;
- labeling/part identity.

No item in this list is a present physical claim merely because it appears here.

## 3. First required baseline capture

Before selecting the next build increment, record the **actual dimensional machine as it exists now**.

Minimum baseline record:

| Area | Record |
| --- | --- |
| Structure | frame/base/table/support geometry actually present |
| Reference | actual fence/support/origin method |
| Material handling | how stock is loaded, supported, advanced and removed |
| Workholding | actual clamps/hold-down currently present |
| Cutting | actual saw/tool capability currently present |
| Secondary tools | drill/router/mill capability currently present, if any |
| Motion | axes or actuators actually present |
| Control | current controller/panel/manual controls |
| Sensors | actual installed sensors/feedback |
| Safety | actual guards, E-stop, isolation and other current controls |
| Evidence | photos, drawings, part numbers, measurements, tests |
| Known limits | stock size, travel, repeatability, operations, unresolved faults |

Until that baseline is captured, unsupported physical detail remains `UNKNOWN`.

## 4. Candidate next increment test

For every proposed added function, answer:

1. What project/part requirement needs it?
2. What machine-neutral operation represents that requirement?
3. What mechanical function performs it?
4. What reference/workholding must remain valid?
5. What off-the-shelf or fabricated components are candidates?
6. What local controller action is required?
7. What safety function is required before powered testing?
8. What measurable test proves the function works?
9. What failure/refusal cases must stop the path?
10. What **small Store-visible capability declaration** can be made if the test passes?

Do not expand Store capability before item 8 is supported by evidence.

## 5. Store-visible surface

Store 1 should eventually need only bounded facts such as:

- supported dimensional stock form/range;
- supported operation families;
- dimensional/feature limits relevant to routing;
- tooling prerequisite where consequential;
- capability/envelope version;
- explicit unsupported/refusal conditions;
- evidence status.

The Store does not need controller coordinates, servo tuning, postprocessor code, I/O wiring or internal machine mechanics to answer normal capability questions.

## 6. Evidence-stage progression

### Existing Stage 1
Information-chain reference only.

### Existing Stage 2
Store Zero + D-001 reference/model capability. Current application environment.

### Toward Stage 3
The dimensional workstream begins to contribute Stage-3 evidence only when actual physical support/workholding, controls, guarding/interlocks, commissioning and measured machine behavior exist and are recorded.

### Stage 4
Measured demand, refusals, cycle behavior, material behavior, operator burden, cost/yield and outcomes may change the machine architecture. Stage 4 is not predetermined feature accumulation.

## 7. Next deliverable

Create:

`../engineering/dimensional/DIMENSIONAL-MACHINE-BUILD-0.1.md`

That file may be highly detailed. This staging file should remain the short evidence/status surface.

**NO BLOOD ON WOOD.**
