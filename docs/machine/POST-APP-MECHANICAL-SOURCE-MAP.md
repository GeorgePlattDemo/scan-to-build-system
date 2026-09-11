# Post-App Mechanical Source Map

This map makes the strongest current machine/cell source family easy to find without treating every older machine document as current authority.

## Primary source family

All four sources below are in `GeorgePlattDemo/grok-file` at accepted app pin:

`4595b4785a2686486e477ce2e70fb3f476285a8d`

| Source | Role | Admission posture |
| --- | --- | --- |
| `docs/cell/STB-CELL-0.1.md` | Tandem Cell, control, interfaces, audit, D-001/S-001 mechanics, lowering, patent correspondence | `KEEP-REFERENCE`; descriptive/candidate status retained |
| `docs/atlas/STB-ATLAS-04-NEUTRAL-OPS-TO-MACHINE-0.1.md` | Part/feature job → post/lowering → controller → drives; field/open-source control survey | `KEEP-DONOR`; not adopted field survey |
| `docs/atlas/STB-ATLAS-05-ENVELOPE-LADDER-0.1.md` | Bounded capability-family comparison; dimensional versus sheet; intro-to-advanced envelope thinking | `KEEP-DONOR`; not adopted field survey |
| `docs/atlas/STB-ATLAS-06-IRON-0.1.md` | Off-the-shelf controller/drive/I/O/workholding/safety families | `KEEP-DONOR`; not adopted field survey |

Read them through `../../work/machines/engineering/README.md`.

## Why these four matter

Together they already establish most of the engineering separation needed for the next physical build:

```text
project / part truth
        ↓
Store machine-neutral requirement
        ↓
cell lowering
        ↓
local program / controller state
        ↓
drives, tooling, workholding, sensing
        ↓
physical evidence
```

The Cell spine ties detailed dimensional and sheet functions to patent correspondence while repeatedly marking unresolved implementation facts. Atlas 04 identifies CAM/post/controller/lowering boundaries. Atlas 05 prevents a first machine from being treated as universal. Atlas 06 identifies realistic open/off-the-shelf implementation families without pretending they are an adopted BOM.

## Current Store/cell stage source

- Repository: `GeorgePlattDemo/scan-to-build-store`
- Branch: `stage-2-store-zero-reference`
- Pin: `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d`
- File: `STB-STORE-CELL-STAGES-0.1.md`

This file controls the current Stage 1–4 evidence vocabulary. See `../../work/machines/staging/README.md`.

## Older public mechanical ontology

- Repository: `GeorgePlattDemo/scan-to-build-review`
- Pin: `ab3e35e54d022928d0dd64aae58679fd893f65d2`
- File: `docs/MACHINE_FUNCTION_KINEMATIC_ONTOLOGY.md`

**Disposition:** `KEEP-DONOR / RECONCILE BEFORE ADMISSION`.

It contains substantial machine labels, safety thinking, patent-derived callouts, states and mechanical concepts, but predates the current subject-specific authority split. It must not become current merely because it is detailed.

Useful content can later be mined into the post-app engineering documents when it passes the current layer, language, capability and evidence tests.

## Patent source posture

The Cell spine contains an existing patent-feature correspondence map adequate for this planning stage. Full patent PDFs remain deferred as primary archival sources.

Future physical engineering should preserve an explicit distinction among:

- patent-disclosed correspondence;
- candidate implementation choice;
- selected prototype component;
- installed component;
- commissioned capability;
- Store-visible capability declaration.

Those are not interchangeable.
