# Dimensional Machine Staging 0.1

**Status:** current post-app planning surface  
**Present physical control case:** manual radial-arm-saw workflow  
**Current Scan-to-Build physical machine:** not yet established  
**Current program:** `../MACHINE-BUILD-PROGRAM-0.1.md`  
**Reference architecture (Store-backing, not commissioned):** [`../../capability-bridge/D-001-REFERENCE-ARCHITECTURE-0.1.md`](../../capability-bridge/D-001-REFERENCE-ARCHITECTURE-0.1.md)


This file tracks the dimensional path truthfully from the present manual practice through the first digital physical bridge.

## 1. Physical starting point

The actual local physical comparison condition today is:

- radial-arm saw;
- eyes;
- tape measure;
- pencil;
- operator judgment;
- manual positioning and cutting.

That is not a defect to disguise and not a Scan-to-Build machine claim. It is the control case against which the first digital bridge should be compared.

The open research question is whether a practical middle exists between this manual workflow and high-capability factory/robotic fabrication.

## 2. Existing digital/reference evidence

### CUT-001 reference

CUT-001 provides the smallest documented information chain for one dimensional board and one square finished requirement:

- nominal 2×4×6 SPF parent stock;
- 60.000 in finished kept length;
- square crosscut after origin/cleanup;
- label;
- staged pickup.

It is a reference/regression chain. It does not establish a commissioned physical machine.

### Stage-2 Store reference

The current Stage-2 Store source declares D-001 reference capability for Store evaluation/economic modeling, including bounded operation families beyond the square-cut reference.

Those fixture/model values do not describe the present physical machine.

### Patent primary source

The full issued patents are now in `docs/patents/source/`.

The dimensional disclosure includes direct relationships among a support surface/frame, fence/reference, clamping, servo-controlled manipulating roller(s), longitudinal stock movement and sawing, with additional disclosed tooling-way functions in the specification/dependent material.

Those are direct sources for engineering correspondence. They are not evidence that any corresponding hardware is installed today.

### Cell / Atlas sources

The post-app Cell spine and Atlas sources remain useful reference/donor material for machine-neutral lowering, controller boundaries, off-the-shelf/open-source candidates and broader disclosed machine functions.

They do not override the patents or create installed capability.

## 3. Machine Build 1 — Digital Bridge Proof

The next dimensional task is **not** to expand an already-built D-001 machine.

It is to test the smallest credible digital physical bridge:

> Can one digital finished-length requirement position dimensional stock and produce one bounded cut-to-length result without the operator recreating the location with eyes, tape and pencil at the saw?

Minimum intended research scope:

- one bounded dimensional stock class, initially a 2 × 4 class board;
- one controlled stock-reference / positioning path;
- one powered/manipulating roller set or equivalent bounded positioning mechanism selected through engineering;
- one bounded cut-to-length operation;
- off-the-shelf components where practical;
- open-source or openly inspectable control software/language where practical;
- local control and local Cycle Start;
- one measured observed result and retained outcome record.

This is not a general CNC, furniture machine, Store production service, or production-readiness claim.

## 4. Build-1 engineering questions

Before any capability is promoted, the detailed Build-1 document should answer:

1. What exact digital finished-length object crosses into the machine boundary?
2. What neutral operation represents the required cut?
3. How is the stock referenced without pencil layout?
4. What mechanical function advances/positions the stock?
5. How is position established and invalidated?
6. What off-the-shelf mechanical and electrical components are candidates?
7. What controller/open-source stack is a candidate, and what remains machine-local?
8. What local operator actions remain necessary?
9. What guarding, restraint, stopping, isolation and other safety work is required before powered testing?
10. What test and measurement show that the digital requirement produced the intended physical result?
11. What negative/refusal cases must stop the path?
12. What smallest capability statement could later be exposed to Store if the evidence supports it?

## 5. Store-visible surface

Store should eventually see only bounded capability facts such as:

- supported dimensional stock form/range;
- supported operation class;
- relevant length/feature limits;
- capability/envelope version;
- explicit unsupported/refusal conditions;
- evidence status.

Store does not need station coordinates, servo tuning, postprocessor/controller code, I/O wiring, work offsets or detailed internal mechanics to answer the normal capability question.

## 6. Patent correspondence rule

The detailed Build-1 document must use `docs/patents/PATENT-ALIGNMENT-GATE.md`.

At minimum, compare the selected physical functions against the actual issued dimensional-machine claim/specification/figure material and label the relationship accurately.

A Build-1 implementation may be intentionally narrower than the disclosed exemplary dimensional machine. Record that narrowing rather than silently treating the patent figure as a mandatory BOM.

Patent correspondence does not establish safety or commissioning.

## 7. Relationship to Store/Cell evidence stages

- **Stage 1** remains the CUT-001 information-chain reference.
- **Stage 2** remains Store Zero + D-001 reference/model capability.
- **Machine Build 1** is a new physical experiment that tries to earn the first real digital-bridge evidence.
- physical commissioning/measured behavior contributes **Stage-3 evidence** only after the required physical/safety/validation boundary is actually established.

## 8. Next deliverable

Create:

`../engineering/dimensional/DIGITAL-BRIDGE-BUILD-1-0.1.md`

That file may become excruciatingly detailed about candidate mechanics, off-the-shelf components, open-source control, lowering and patent correspondence.

This staging page should remain the short truth/status surface.

**NO BLOOD ON WOOD.**
