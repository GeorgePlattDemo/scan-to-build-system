# Reference Machine Architecture 0.1

**Status:** current course correction  
**Evidence class:** REFERENCE architecture behind already-published Store capacities  
**Physical status:** NOT CLAIMED  
**Does not replace:** Store pin `ca6a6e01`, Board / Mode-2 app paths, D-001 Stage-2 envelope, `SHEET_MODE2_STENCIL_V1`, `SHEET_MODE2_ARCHED_APERTURE_V0`

Store semantics stay in Store. Machine-control semantics stay at the machine. This file is the missing middle: a **declared reference machine** so each Store envelope is mechanically plausible.

Physical commissioning, measured safety values, controller code, and G-code remain later.

## Why this file exists

A Store object without a corresponding machine relationship is fiction.

A machine BOM without a Store envelope is Atlas again.

Both published capacities therefore carry five layers in parallel:

1. App definition — what the user requires.  
2. Store envelope — what can be supported or refused.  
3. Reference kinematic contract — what must move and stay true.  
4. Candidate implementation stack — commercially available classes that could implement that contract on a research fixture.  
5. Unresolved physical parameters — later measurement, engineering, or safety validation.

Controls are documented under the candidate stack, not inside Store. See [`S-001-MODE2-CONTROLS-REFERENCE-0.1.md`](S-001-MODE2-CONTROLS-REFERENCE-0.1.md).

Two machines. Two envelopes. Not one cell.

| Capacity | Store offering | Detail |
| --- | --- | --- |
| Dimensional square length | `DIM-SQUARE-LENGTH-V1` | [`D-001-REFERENCE-ARCHITECTURE-0.1.md`](D-001-REFERENCE-ARCHITECTURE-0.1.md) |
| Mode-2 sheet stencil | `SHEET_MODE2_STENCIL_V1` plus arched-aperture family | [`S-001-MODE2-REFERENCE-ARCHITECTURE-0.1.md`](S-001-MODE2-REFERENCE-ARCHITECTURE-0.1.md) |

## Layer rules

| Layer | May contain | Must not contain |
| --- | --- | --- |
| App | required geometry, units, quantity, operation family | servo brands, clamp force, G-code |
| Store | offering, envelope numbers already written, SUPPORTABLE / REFUSED / UNRESOLVED, neutral ops, evidence class | controller packets, live inventory as fact, cell-as-plant |
| Kinematic contract | named axes, what moves, what must remain seated, interpolation class, stop-on-lost-position | tuned gains, Cycle Start from the cloud |
| Candidate stack | component *class* and established machinery as plausibility | frozen SKU as commissioned iron |
| Unresolved parameters | named holes | invented numbers treated as spec |

**NO BLOOD ON WOOD.** Candidate stacks are not permission to energize a fixture.

## Patent posture

Issued grants: U.S. 9,720,401 B2 and U.S. 10,768,609 B2.

Correspondence is recorded on each architecture page. Correspondence is not commissioning, not safety evidence, and not a legal conclusion.

Exemplary figures are wider than the first jobs. Narrowing is explicit.

## Commercial baseline posture

Safety Speed and other vertical-panel / chop-saw products establish that adjacent iron already exists. They do not authorize retrofit and do not identity-map to D-001 or S-001.

## What stays true from prior work

- Board vertical and `BOARD_SQUARE_V1` stay intact.  
- Mode-2 Store evaluator and app path stay intact.  
- Generic `CURVILINEAR_OUTLINE` demand does not earn Store support without reconstructable curve geometry.  
- Process Q stays unresolved.  
- Secondary separation stays operator or later.  
- Two offerings are not a tandem cell.
