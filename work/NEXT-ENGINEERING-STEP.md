# Next Engineering Step

The next physical-engineering task is **not** to buy a controller, finish a universal machine BOM, or design the final two-machine cell.

It is to define **Machine Build 1 — Digital Bridge Proof** from the real manual control case.

## Current starting point

Physical comparison case:

- radial-arm saw;
- eyes;
- tape measure;
- pencil;
- operator judgment;
- manual positioning/cutting.

No commissioned Scan-to-Build physical machine is claimed today.

## Read first

1. `work/machines/MACHINE-BUILD-PROGRAM-0.1.md`
2. `docs/patents/README.md`
3. `docs/patents/PATENT-ALIGNMENT-GATE.md`
4. full `docs/patents/source/US9720401B2.pdf`
5. full `docs/patents/source/US10768609B2.pdf`
6. `work/machines/staging/DIMENSIONAL-MACHINE-STAGING-0.1.md`
7. `docs/machine/POST-APP-MECHANICAL-SOURCE-MAP.md`
8. source `docs/cell/STB-CELL-0.1.md`
9. Atlas 04, 05 and 06 as donor/reference material
10. current Store Stage 1–4 document

The patents are the direct source for patent wording/correspondence. The Cell and Atlas documents are engineering aids and do not override them.

## Produce next

Create:

`work/machines/engineering/dimensional/DIGITAL-BRIDGE-BUILD-1-0.1.md`

Its job is to answer one bounded question:

> Can one digital finished-length requirement become one physical cut-to-length result on a 2 × 4 class board without recreating the cut location with eyes, tape and pencil at the saw?

Minimum contents:

- manual control case and comparison method;
- exact bounded Build-1 requirement;
- machine-neutral operation passed downstream;
- proposed stock reference / positioning chain;
- candidate roller/feed mechanics or equivalent bounded positioning mechanism;
- candidate off-the-shelf mechanical/electrical components;
- candidate open-source/openly inspectable control stack;
- machine-local lowering/controller boundary;
- local operator role and Cycle Start boundary;
- workholding/restraint concept requiring engineering resolution;
- guarding, stopping, isolation and other safety requirements that must be resolved before powered testing;
- measurement method for the resulting cut;
- positive test evidence;
- negative/refusal cases;
- Store-visible capability surface if and only if the evidence is later earned;
- **Patent correspondence** using `docs/patents/PATENT-ALIGNMENT-GATE.md`;
- explicit intentional differences from exemplary patent embodiments;
- unresolved questions.

## Build-1 patent check

At minimum, compare the intended physical functions directly against the issued dimensional-machine material concerning:

- support surface/frame;
- fence/reference;
- clamping/restraint;
- servo-controlled manipulating roller(s) / controlled stock movement;
- sawing;
- the larger disclosed tooling functions only to the extent needed to explain what Build 1 intentionally does **not** implement.

Do not infer that every patent-disclosed station or tool must be built into the MVP.

Do not infer safety from patent correspondence.

## What comes after Build 1

Only after Build 1 has a physically evidenced bounded capability should **Machine Build 2** connect that capability to Store Zero / Store 1.

Machine Build 3 then asks the larger empirical question of what dimensional/sheet capability should actually be deployed locally, if any.

The sheet machine and tandem research cell should not be allowed to pull Build 1 into unnecessary scope.

## Branch discipline

Use folders for durable subject ownership and branches for bounded change sets.

Recommended branch for the first detailed plan:

`plan/digital-bridge-build-1-0.1`

Return the reviewed canonical build document to `main` when accepted.

## Stop condition

The first Build-1 planning pass stops before powered construction/testing unless the required mechanical, guarding, control and safety work has been separately resolved and explicitly authorized.

**NO BLOOD ON WOOD.**
