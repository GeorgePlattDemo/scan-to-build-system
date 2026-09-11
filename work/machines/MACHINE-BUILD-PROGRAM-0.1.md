# Machine Build Program 0.1

**Status:** current post-app machine research program  
**Purpose:** define the physical bridge experiment without pretending the middle is already known  
**Primary patent sources:** `../../docs/patents/`  
**Safety invariant:** **NO BLOOD ON WOOD**

## 1. Existing control case

The present physical yard-scale condition is not a commissioned Scan-to-Build machine.

It is the ordinary manual workflow:

```text
board
  ↓
radial-arm saw
  ↓
eyes + tape measure + pencil + operator judgment
  ↓
manual positioning and cut
```

That is the comparison case.

The machine program asks whether there is a useful, affordable, maintainable and governable middle between that manual practice and high-capability factory/robotic fabrication.

A finding that the middle is not useful is a valid result.

## 2. Build 1 — Digital Bridge Proof

### Question

Can one digital finished-length requirement become one bounded physical result on dimensional stock without recreating the cut with eyes, tape and pencil at the saw?

### Minimum intended proof

- one bounded dimensional stock class, initially a 2 × 4 class board;
- one controlled stock-reference / positioning path;
- one set of powered/manipulating rollers or equivalent bounded positioning mechanism selected through engineering;
- one bounded cut-to-length operation;
- off-the-shelf mechanical/electrical components where practical;
- open-source or openly inspectable control language/software where practical;
- local machine control and local Cycle Start;
- observable result and recorded outcome.

This is not a furniture machine and not a general CNC claim.

The proof is the chain:

```text
finished-length requirement
        ↓
machine-neutral bounded operation
        ↓
local lowering / controller interpretation
        ↓
controlled stock reference + positioning
        ↓
bounded cut
        ↓
measured observed result
```

### Patent correspondence

Build 1 should be checked directly against the issued dimensional-machine material, including the disclosed relationship among a support surface/frame, fence/reference, clamping, servo-controlled manipulating roller(s), stock movement and sawing.

Build 1 is intentionally narrower than the full disclosed dimensional machine. It does not need to implement every disclosed tooling way, station or project function to serve as the first research proof.

No patent correspondence establishes safety or commissioned capability.

## 3. Build 2 — Store Integration Proof

### Question

Can the bounded physical capability from Build 1 be connected to the existing Store boundary so the Store can ask what the machine supports without importing machine-local mechanics or controls?

### Why Store Zero exists

Store Zero is not a claim that a fictional retailer is the product.

It is a controlled test fixture that lets the system exercise:

- material identity;
- stock-form assumptions;
- availability state;
- required operation;
- capability fit/refusal;
- modeled/budgetary economics;
- fulfillment relationships;
- application presentation;

before a real retailer or live inventory adapter exists.

Build 2 proves that a machine can be a **callable bounded Store capability**, rather than a standalone automation project.

### Store firewall

Store may know only the bounded facts needed to evaluate/rout work, such as material form, supported operation, envelope limits, capability version and refusal conditions.

Machine-local station coordinates, controller programs, servo tuning, I/O, work offsets, lowering details and safety implementation stay downstream.

### Patent correspondence

Build 2 should check the issued end-to-end/store/material/instruction/pricing lineage directly, while preserving current distinctions between reference budgetary Q and commercial quote/order authority.

## 4. Build 3 — Research Cell / Deployment Question

### Question

Given real physical evidence, Store questions, refusals, operator work, handling, safety, cycle behavior, material behavior and economics, **what capability should actually be deployed locally — if any?**

This is the research program, not a predetermined machine expansion plan.

Expected work may include:

- adding only justified bounded capability to the dimensional path;
- building the smallest useful sheet-processing capability that creates new evidence;
- testing whether dimensional and sheet capability form a useful two-machine research cell;
- comparing the digital bridge against manual/current practice;
- preserving negative/refused paths;
- measuring operator burden, cycle behavior, handling, yield, cost and practical maintainability;
- testing whether special-order or alternate fulfillment is better than adding local machinery for some requirements.

The first deployed local capability is an empirical question.

The fact that two machines can be built does not prove that both should be deployed.

### Patent correspondence

Build 3 may draw from the disclosed tandem dimensional/sheet architecture and related project/label/fulfillment concepts, but the selected research cell should implement only what the research hypothesis actually requires.

The patents remain the source for correspondence. Evidence determines what becomes current capability.

## 5. Build 4 — Frontier

Build 4 preserves the larger possibility space without turning it into an implementation obligation.

It may include:

- richer dimensional processing;
- richer sheet processing;
- more automated material handling;
- broader tooling;
- distributed/local cell models;
- more sophisticated capture and configuration;
- additional project classes;
- deeper machine-site lowering;
- additional fulfillment and special-order relationships;
- other issued-patent correspondence and later research extensions.

Build 4 is not simply “more features.”

Build 3 evidence decides what, if anything, deserves promotion out of the frontier.

## 6. Relationship to existing Store / Cell Stage 1–4 language

The existing Store/Cell Stage vocabulary remains an evidence vocabulary and should not be silently overwritten.

Directional relationship:

| Machine build | Primary question | Existing evidence relationship |
| --- | --- | --- |
| **Build 1** | Can digital information produce one bounded physical dimensional result? | physical realization of the smallest CUT-001-style chain; must earn physical evidence separately |
| **Build 2** | Can that capability plug into Store Zero / Store 1 through the bounded interface? | exercises the Stage-2 Store/reference membrane without pretending Store reference data is physical commissioning |
| **Build 3** | What local capability should actually be deployed? | produces Stage-3 physical/commissioning/measured evidence and begins the real research question |
| **Build 4** | What larger architecture is justified by evidence? | directionally consistent with Stage-4 evidence-informed evolution; not predetermined |

Use **Machine Build** in full when referring to this program so it is not confused with Store/Cell Stage numbers.

## 7. Alignment rule

Every Machine Build document must use `docs/patents/PATENT-ALIGNMENT-GATE.md` and state:

- relevant issued patent source(s);
- claim/specification/figure correspondence where applicable;
- current implementation choice;
- intentional narrowing or divergence;
- unresolved questions;
- evidence required before Store-visible capability changes.

The purpose is an unbroken technical lineage, not a claim that every patent embodiment must be built.

## 8. Immediate next engineering document

The first detailed machine document should now be:

`engineering/dimensional/DIGITAL-BRIDGE-BUILD-1-0.1.md`

It should start from the **manual radial-arm-saw control case** and define the smallest credible component/control stack required to test one digital cut-to-length chain.

It should stop before powered build/testing unless the mechanical, guarding, control and safety work required for that step has been separately resolved.
