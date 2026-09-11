# Machine / Cell Staging

**Status:** current navigation and planning surface  
**Controlling Stage 1–4 source:** `GeorgePlattDemo/scan-to-build-store`, `stage-2-store-zero-reference`, commit `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d`, `STB-STORE-CELL-STAGES-0.1.md`

This folder preserves the existing Scan-to-Build **Store / cell evidence Stage 1–4** meanings.

Do not reuse the words Stage 1, Stage 2, Stage 3, or Stage 4 for a different physical-machine sequence without a qualifier. Machine fabrication may have its own build phases, but those phases are not the Store/cell evidence stages below.

## Existing evidence stages

| Evidence stage | Existing meaning | Dimensional track | Sheet track | Cell meaning |
| --- | --- | --- | --- | --- |
| **Stage 1 — CUT-001** | One board, one finished requirement, one auditable information chain | Square finished-length reference path | Not established as a Stage-1 machine | No tandem cell claim |
| **Stage 2 — Store Zero + D-001 reference cell** | Callable fictional Store, bounded declared reference capability, deterministic budgetary estimate/refusal | D-001 reference capability exists in Store fixture/model | A separate physical S-001 capability is **not** Store-callable merely because sheet concepts exist elsewhere | Reference/model layer only; not a commissioned physical two-machine cell |
| **Stage 3 — Pilot Store + pilot cell** | Real Store adapter plus physical support/workholding, guarding, access control, safety-rated controls, interlocks, commissioning, validation and measured behavior | Physical dimensional machine may contribute only what is actually commissioned | Physical sheet machine may contribute only what is actually commissioned | This is where a real two-machine pilot/research cell begins to earn evidence |
| **Stage 4 — Evidence-informed system** | Demand, refusals, outcomes, measured cycles, material behavior, operator observations and economics determine mature architecture | Evidence may retain, narrow, expand, or reject earlier assumptions | Same | Cell architecture follows evidence rather than a predetermined final machine |

## Current truth

The current application consumes **Stage-2 Store Zero capability**.

That does not mean a physical Stage-2 machine exists. Current Stage 2 includes modeled/reference D-001 capability and fixture-backed Store behavior.

The current governed reference also contains a tightly bounded sheet simulation fixture. That is reference/simulation evidence. It does not make an S-001 physical machine commissioned or Store-callable.

## Planned physical machine work

Two separate engineering tracks are intended:

### Dimensional machine

Current direction:

- retain the useful bounded dimensional path;
- add more physical capability deliberately;
- keep actual operations limited to what the installed machine can demonstrate;
- use measured results to determine whether proposed additions deserve Store capability declarations.

### Sheet machine

Current direction:

- establish an initial sheet-processing machine;
- use limited automation rather than pretending to build the final universal sheet cell;
- choose enough useful capability to make the second machine meaningful in a research cell;
- leave the exact bounded task unresolved until engineering and project evidence justify it.

### Research cell

The intended research cell consists of the dimensional and sheet tracks operating under a common bounded information/capability architecture.

The fact that two machines exist does not by itself establish a useful cell. A later build package must name:

- the bounded task or work family;
- the material forms involved;
- each machine's declared role;
- the handoff between them, if any;
- local operator roles;
- the Store-visible capability declaration;
- physical safety/commissioning evidence;
- what measured outcome demonstrates that the cell is useful.

## Important numbering note

If the physical machine program informally uses phrases such as “machine build phase 1” or “machine build phase 2,” write **Machine Build Phase** in full.

Under the existing Store/cell evidence definition, a physically supported, guarded, controlled, commissioned pilot belongs to **Stage 3 evidence** even if it happens during an internal “Machine Build Phase 2.”

This distinction prevents one number from describing two different truths.

## Promotion rule

Engineering work becomes Store-visible capability only after its owner can state a bounded, testable declaration supported by evidence.

```text
candidate mechanical feature
    ≠ installed feature
    ≠ commissioned feature
    ≠ declared Store capability
    ≠ project support
    ≠ production authority
```

## Next staging deliverables

The next mechanical planning pass should produce three current documents here, without claiming completion:

1. `DIMENSIONAL-MACHINE-STAGING-0.1.md`
2. `SHEET-MACHINE-STAGING-0.1.md`
3. `RESEARCH-CELL-STAGING-0.1.md`

Each should show current evidence, planned next increment, acceptance evidence, refusal/stopping conditions, and the exact information that may be exposed upstream to Store 1.
