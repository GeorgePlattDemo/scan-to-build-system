# Next Engineering Step

The next physical-engineering task is **not** to buy a controller or finish a machine BOM.

It is to turn the strongest existing post-app mechanical sources into two bounded current machine-build plans and one research-cell staging plan.

## Read first

1. `docs/machine/POST-APP-MECHANICAL-SOURCE-MAP.md`
2. `work/machines/staging/README.md`
3. `work/machines/engineering/README.md`
4. source `docs/cell/STB-CELL-0.1.md`
5. source Atlas 04, 05 and 06
6. current Store Stage 1–4 document

## Produce next

### A. Dimensional machine

`work/machines/engineering/dimensional/DIMENSIONAL-MACHINE-BUILD-0.1.md`

Minimum contents:

- present physical state: `UNKNOWN` until explicitly recorded from current evidence;
- desired next bounded functions;
- station/function map;
- mechanics and reference chain;
- workholding and material handling;
- tooling;
- candidate sensors/actuators;
- candidate open/off-the-shelf control stack;
- safety functions that require competent engineering/commissioning;
- machine-neutral op → local lowering examples;
- Store-visible capability surface;
- patent correspondence by function;
- unresolved questions;
- tests/evidence required before a capability may be declared.

### B. Sheet machine

`work/machines/engineering/sheet/SHEET-MACHINE-BUILD-0.1.md`

Use the same structure, adjusted for sheet handling, platform/sheet motion, tooling receiver, workholding, depth datum and the intentionally limited first automation target.

Do not assume all patent modes must be built. Select only what the research objective requires.

### C. Research cell

`work/cell/RESEARCH-CELL-STAGING-0.1.md`

Do not choose the cell task by aesthetics. Name one bounded hypothesis and show:

- what User/Application supplies;
- what Store 1 resolves;
- what neutral work reaches the cell;
- what the dimensional machine does;
- what the sheet machine does;
- where parts/material converge;
- what remains operator work;
- what evidence proves or disproves usefulness;
- what the Store must know and what stays machine-local.

## Branch discipline when build work begins

Use folders for durable subject ownership. Use branches for bounded change sets.

Recommended future branches when actual work starts:

- `plan/dimensional-machine-0.1`
- `plan/sheet-machine-0.1`
- `plan/research-cell-0.1`

Do not create long-lived branches merely to store a category of documents; the canonical reviewed documents should return to `main` when accepted.

## Stop condition

The first machine-planning pass stops before purchasing, wiring, motor sizing, safety-category selection, controller programming or Store capability promotion unless supported by a later explicit engineering instruction and evidence.

**NO BLOOD ON WOOD.**
