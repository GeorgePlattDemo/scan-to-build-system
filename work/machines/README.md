# Machine Work Surface

This directory separates **what capability must be demonstrated** from **how the iron is actually built**.

## `staging/`

The staging surface answers:

- What evidence level are we at?
- What can the dimensional machine truthfully do?
- What can the sheet machine truthfully do?
- What can the two-machine cell truthfully do together?
- What remains reference, modeled, planned, commissioned, measured, or refused?

It preserves the existing Store/Cell Stage 1–4 vocabulary rather than inventing another incompatible stage numbering system.

## `engineering/`

The engineering surface answers:

- What physical machine architecture is under consideration?
- What stations, references, workholding, tooling, sensing and actuators are required?
- Which off-the-shelf components or open-source controls could implement them?
- How is a machine-neutral operation lowered locally?
- What belongs to the controller rather than the Store or app?
- Which machine features correspond to the issued patent disclosures?
- What is still unresolved and must be measured or commissioned?

The engineering surface may become extremely detailed. That detail must remain downstream of Store/project meaning.

Current controller/safety engineering entry point:

- [`engineering/CONTROLLER-IN-LOOP-SAFETY-0.1.md`](engineering/CONTROLLER-IN-LOOP-SAFETY-0.1.md) — controller-in-loop target, fail-closed virtual safety architecture, audit boundary, and physical-authority separation.

## `simulator/`

The simulator surface holds executable machine-site simulation code that must remain isolated from physical I/O unless a separately approved physical-machine build explicitly changes that boundary.

Current implementation:

- [`simulator/README.md`](simulator/README.md) — safety-kernel status and limits;
- `simulator/safety-interlock.mjs` — D-001/S-001 fail-closed safety state machine;
- `simulator/safety-interlock.test.mjs` — adversarial safety tests.

The simulator may earn virtual evidence. It does not create Store capability, physical commissioning, or fabrication authority.

## Working split

```text
STAGING
truthful evidence level
        ↓
ENGINEERING
candidate physical solution
        ↓
SIMULATOR
controller/state feasibility evidence
        ↓
COMMISSIONING / MEASUREMENT
actual machine truth
        ↓
STAGING UPDATE
only the evidence earned by the build
```

A proposed component does not create capability. A successful isolated movement does not create a Store envelope. A patent-described feature does not prove an installed capability.

**NO BLOOD ON WOOD.**
