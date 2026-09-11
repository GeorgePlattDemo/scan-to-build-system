# Research Cell Staging 0.1

**Status:** current post-app planning surface  
**Physical two-machine cell:** not established  
**Research task:** unresolved  
**Intent:** use one bounded dimensional machine plus one bounded sheet machine to create a real research starting point, not a pretend final factory.

## 1. Why this file exists

The dimensional and sheet machine workstreams are allowed to develop separately.

This file is the convergence surface. It exists to answer:

> When do two bounded machines become one useful Scan-to-Build research cell, and what evidence justifies saying so?

The answer is not “when both machines turn on.”

## 2. Current evidence

- Store Zero and D-001 provide current Stage-2 reference/economic behavior.
- Governed Reference provides bounded simulation/reference behavior and authority separation.
- The Cell spine provides descriptive D-001/S-001 mechanical and control relationships, machine-neutral lowering concepts, local-control boundaries and patent correspondence.
- No admitted evidence currently establishes a commissioned physical two-machine cell.

## 3. Research-cell hypothesis template

Do not fill this by inference. The first physical-cell build should state:

| Question | Current value |
| --- | --- |
| Bounded task / part family | `UNRESOLVED` |
| User/project reason for task | `UNRESOLVED` |
| Material forms | `UNRESOLVED` |
| Dimensional-machine role | `UNRESOLVED` pending current-machine baseline + selected increment |
| Sheet-machine role | `UNRESOLVED` pending first sheet capability selection |
| Shared/secondary operations | `UNRESOLVED` |
| Store 1 material/source path | `UNRESOLVED` |
| Store-visible capability statement | `UNRESOLVED` |
| Machine-neutral handoff | use current boundary; exact job family TBD |
| Local lowering | machine/cell owned; not Store/app |
| Operator role | `UNRESOLVED` |
| Safety/commissioning plan | required before powered pilot; not specified here |
| Success evidence | `UNRESOLVED` |
| Refusal/negative evidence | required |

## 4. Selection criteria for the first task

Prefer a task that:

- is understandable without a long story;
- exercises a real information chain from User/Application through Store to physical work;
- gives each included machine a legitimate reason to exist;
- stays bounded enough to measure;
- exposes at least one meaningful refusal or unsupported condition;
- lets part identity and source material remain traceable;
- produces useful observations about operator burden, cycle behavior, handling, material behavior, yield or economics;
- does not require pretending that unbuilt advanced capability exists.

The task need not use both machines if evidence shows a one-machine path is the better answer. A negative tandem conclusion is legitimate research.

## 5. Store interface to the research cell

Store 1 should not receive the full machine build.

The cell should eventually expose a bounded capability surface containing only what Store needs to decide whether a request can be supported, such as:

- material form/class;
- supported operation classes;
- bounded geometry/envelope limits;
- required prerequisites;
- explicit unsupported conditions;
- capability version and evidence status;
- fulfillment relationship.

The cell keeps local:

- station coordinates;
- controller programs;
- postprocessor details;
- work offsets;
- servo/drive configuration;
- I/O and interlock implementation;
- sensor implementation;
- safety-control implementation;
- lowering details not needed for Store routing.

## 6. Evidence-stage promotion

### Stage 2 today
Reference Store + D-001 modeled/reference capability. Not a physical tandem cell.

### Entry to Stage 3 evidence
A research-cell claim begins only when the physical machines actually have the support/workholding, guarding, controls, interlocks, commissioning and measured behavior required by the existing Stage-3 definition.

Evidence should include both positive and stopped/refused paths.

### Stage 4
The cell is allowed to change. Measured demand, refusals, real cycles, material handling, operator observations and economics determine whether the two-machine architecture is useful and what it should become.

## 7. Required cell-chain record

When a first task is selected, document the chain without gaps:

```text
User 1 declaration / evidence
    ↓
application project revision
    ↓
material + part requirements
    ↓
Store 1 offering / sourcing / capability answer
    ↓
bounded machine-neutral operations
    ↓
local cell lowering
    ↓
Dimensional Machine and/or Sheet Machine
    ↓
part identity / label / staging
    ↓
observed outcome
    ↓
owner / Store record as actually supported
```

For each arrow, identify the owning layer and the record/evidence that crosses it.

## 8. Patent correspondence

The Cell spine already contains a useful tandem/feature correspondence map. Use it as a source aid.

For the selected research task, carry only the correspondence that explains the implemented function. Do not claim that building one useful cell proves the entire patent architecture or that a patent feature establishes safe physical implementation.

## 9. Stop condition

This staging document stops before choosing the task, BOM, controller, safety architecture or commissioning values.

Those decisions move into the detailed machine build documents after the actual starting machines and desired bounded functions are recorded.

**NO BLOOD ON WOOD.**
