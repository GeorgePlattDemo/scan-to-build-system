# Sheet Machine Staging 0.1

**Status:** current post-app planning surface  
**Physical commissioning status:** not established  
**Owner direction:** build an initial sheet-processing machine with limited automation, sufficient to become a meaningful second machine in a research cell  
**Reference architecture (Store-backing, not commissioned):** [`../../capability-bridge/S-001-MODE2-REFERENCE-ARCHITECTURE-0.1.md`](../../capability-bridge/S-001-MODE2-REFERENCE-ARCHITECTURE-0.1.md)

Exact first useful *published* research family is now Mode-2 stencil, with arched aperture next. Physical commissioning remains unestablished.


This file prevents the planned sheet machine from inheriting capability merely from patent figures, the old public demo, the governed M1 sheet fixture, or the descriptive S-001 Cell spine.

## 1. Current evidence

### Governed reference

The current governed reference contains one tightly bounded **sheet-stock simulation** path. It is simulation/reference evidence only. It does not establish a commissioned sheet machine.

### Cell-spine correspondence

The post-app Cell spine describes S-001 as patent correspondence/reference-cell material, including concepts for:

- support frame and backing plane;
- lower support/reference rollers;
- sheet/feed yokes and manipulating rollers;
- tooling platform motion;
- interchangeable saw/router/drill tooling;
- pressure/contact depth datum;
- fixed-sheet versus moving-sheet modes;
- workholding/carrier concepts;
- local control and lowering.

The Cell spine explicitly states that S-001 has no Store force until Store adopts a real capability declaration.

### Atlas research

Atlas 05 separates sheet processing from the dimensional machine family and treats sheet capability as its own bounded envelope.

Atlas 06 identifies open/off-the-shelf controller, drive, workholding and safety families but adopts no BOM and claims no commissioned capability.

## 2. First-machine rule

Do **not** begin by trying to reproduce every S-001 mode or every patent-disclosed feature.

The first sheet build should answer:

> What is the smallest useful automated sheet capability that creates real learning and can participate meaningfully in a two-machine research cell?

A negative answer to a proposed function is acceptable.

## 3. Candidate capability families

Current source material gives possible research families such as:

- registered straight cut / rip / crosscut;
- bounded rectangular outline;
- routed outline;
- limited contour work;
- drilling;
- depth-controlled routing/profiling;
- indexed or fixed-sheet work;
- labeled/identified output.

These are research candidates, not a first-build requirement list.

## 4. Required selection test

Before choosing the first automated sheet function, answer:

1. What User 1 / Store 1 requirement could legitimately call for it?
2. Does that requirement need sheet stock rather than dimensional stock?
3. What part-relative machine-neutral operation can express it?
4. What support/reference plane is required?
5. What must move: sheet, tooling platform, or both?
6. What workholding/reference condition has to remain valid?
7. What tool family is required?
8. What is the simplest practical actuation/control architecture?
9. What safety boundary is required for powered testing?
10. What test result would justify exposing a bounded sheet capability to Store 1?

If these cannot be answered cleanly, keep the function `UNRESOLVED`.

## 5. First physical baseline record

Once sheet-machine construction begins, capture:

| Area | Record |
| --- | --- |
| Frame/support | actual physical support geometry |
| Sheet reference | actual reference edges/planes/rollers/fixtures |
| Workholding | actual clamp/yoke/carrier method |
| Platform/tool motion | actual axes and travel |
| Tooling | actual saw/router/drill capability |
| Depth reference | actual method and evidence |
| Actuation | installed motors/servos/pneumatics |
| Control | controller, local panel and modes |
| Sensors | installed feedback/presence/reference devices |
| Safety | actual guards, E-stop, isolation, access controls |
| Evidence | part numbers, drawings, photos, measurements, tests |
| Limits | material size/form, travel, operations and known failure cases |

Do not populate missing cells from the patent merely because a corresponding feature exists there.

## 6. Store-visible surface

If the sheet machine earns a capability declaration, Store 1 should see only the bounded facts needed for routing/evaluation:

- supported sheet material/form;
- usable size/envelope limits;
- supported neutral operation classes;
- tooling or fixture prerequisites where consequential;
- explicit unsupported/refusal conditions;
- capability/envelope version;
- evidence status.

Machine-local motion/control detail stays downstream.

## 7. Evidence-stage relationship

The current Store/Cell Stage 2 does **not** make this planned physical sheet machine a current Stage-2 asset.

A physically supported, guarded, controlled, commissioned sheet machine begins to create **Stage-3 evidence** under the existing Store/cell vocabulary.

## 8. Next deliverable

Create:

`../engineering/sheet/SHEET-MACHINE-BUILD-0.1.md`

That document may contain the detailed component/control/patent correspondence. This staging page remains the truthful status surface.

**NO BLOOD ON WOOD.**
