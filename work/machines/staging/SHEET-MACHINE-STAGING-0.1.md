# Sheet Machine Staging 0.1

**Status:** current post-app planning surface  
**Physical commissioning status:** not established  
**Owner direction:** build an initial sheet-processing machine with limited automation, sufficient to become a meaningful second machine in a research cell  
**First useful task candidate:** `S001_CENTERED_ARCHED_SHEET_V0` — one centered routed arched opening in 1/2 in plywood; physical capability remains unproven

This file prevents the planned sheet machine from inheriting capability merely from patent figures, the old public demo, the governed M1 sheet fixture, or the descriptive S-001 Cell spine.

## 1. Current evidence

### Governed reference

The current governed reference contains one tightly bounded **sheet-stock simulation** path. It is simulation/reference evidence only. It does not establish a commissioned sheet machine.

### Accepted application / Store proof

The accepted application now contains the canonical bounded project `S001_CENTERED_ARCHED_SHEET_V0` and the published Store request `SHEET_MODE2_ARCHED_APERTURE_V0`.

The software/reference project fixes:

- one 48 × 96 in parent sheet;
- nominal 1/2 in plywood reference material;
- one centered 48 × 36 in working field;
- opening width, straight-side height, and arch rise as the bounded project inputs;
- a routed internal profile;
- retained tabs / attach points;
- selective downstream tab separation;
- labeling;
- no S-001 drilling in this round.

The exact Store-backed software path has demonstrated bounded evaluation and refusal behavior. That is **software/reference evidence only**. It does not establish installed tooling, physical workholding, measured retention, measured cycle time, controller-in-loop validation, or physical execution authority.

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

> Can the smallest credible sheet-machine experiment preserve a known sheet reference and produce one bounded internal routed profile — three straight sides with an arched top — from the same machine-neutral definition already exercised by the application and Store reference path?

The current **candidate** for that experiment is the canonical centered arched opening because it is useful, visually inspectable, bounded, already represented in the application, and capable of producing meaningful negative/refusal evidence.

Selecting it as the research-function candidate does **not** promote it to commissioned capability.

## 3. Candidate Build-1 sheet envelope

Use the existing software/reference definition as the demand-side starting point, not as a statement of physical machine performance:

| Item | Candidate bounded demand |
| --- | --- |
| Parent form | one sheet |
| Reference parent | 48 × 96 in |
| Reference thickness | nominal 1/2 in |
| Working field | centered 48 × 36 in |
| Variable project inputs | opening width; straight-side height; arch rise |
| Required neutral operation | `ROUTE_PROFILE` |
| Retention | retained tabs / attach points |
| Secondary work | selective tab separation after primary routed profile |
| Drilling | not admitted in this round |
| Labeling | required before part/package leaves the primary cell stream |

The physical machine may ultimately require a narrower envelope. It must not be widened merely because the software can describe a larger one.

## 4. Candidate capability families

Current source material gives possible research families such as:

- registered straight cut / rip / crosscut;
- bounded rectangular outline;
- routed outline;
- limited contour work;
- drilling;
- depth-controlled routing/profiling;
- indexed or fixed-sheet work;
- labeled/identified output.

For the first candidate experiment, only the functions needed by the centered routed opening should be treated as in-scope research. The other families remain candidates, not first-build requirements.

## 5. Required selection test

Before physical construction or powered testing, answer:

1. What User 1 / Store 1 requirement legitimately calls for this routed opening?
2. Does that requirement need sheet stock rather than dimensional stock?
3. What part-relative machine-neutral operation expresses it?
4. What support/reference plane is required?
5. What must move: sheet, tooling platform, or both?
6. What workholding/reference condition has to remain valid through the complete profile?
7. What router/tool family is required for the straight and curved portions?
8. What is the simplest practical actuation/control architecture?
9. What safety boundary is required for powered testing?
10. What measured test result would justify exposing any bounded physical S-001 capability to Store 1?

The application/Store reference answers questions 1–3 at the software level. Questions 4–10 remain physical engineering work and must not be inferred from the software proof.

## 6. First physical baseline record

Once sheet-machine construction begins, capture:

| Area | Record |
| --- | --- |
| Frame/support | actual physical support geometry |
| Sheet reference | actual reference edges/planes/rollers/fixtures |
| Workholding | actual clamp/yoke/carrier method |
| Platform/tool motion | actual axes and travel |
| Tooling | actual router capability used for the bounded profile |
| Depth reference | actual method and evidence |
| Actuation | installed motors/servos/pneumatics |
| Control | controller, local panel and modes |
| Sensors | installed feedback/presence/reference devices |
| Safety | actual guards, E-stop, isolation, access controls |
| Evidence | part numbers, drawings, photos, measurements, tests |
| Limits | material size/form, travel, operations and known failure cases |

Do not populate missing cells from the patent merely because a corresponding feature exists there.

## 7. Positive and negative evidence target

A useful first test record should preserve both success and refusal evidence.

Positive evidence, if earned, should include at minimum:

- actual parent sheet identity and measured condition;
- established physical reference state;
- bounded profile definition used;
- local operator actions;
- local Cycle Start event;
- measured resulting opening geometry;
- observed tab/retention condition;
- observed surface/cut condition;
- any interruption, correction, or manual secondary separation;
- labeled outcome identity.

Negative/refusal evidence should include conditions such as:

- requested profile outside the physically established work field;
- lost or unverified sheet reference;
- insufficient or unverified workholding;
- unsupported material/thickness;
- unsupported route depth/tooling;
- tool, axis, interlock, or reference fault;
- request for drilling or another operation not admitted by this first physical envelope;
- any condition requiring remote Cycle Start.

## 8. Store-visible surface

If the sheet machine later earns a physical capability declaration, Store 1 should see only the bounded facts needed for routing/evaluation:

- supported sheet material/form;
- usable size/envelope limits;
- supported neutral operation classes;
- tooling or fixture prerequisites where consequential;
- explicit unsupported/refusal conditions;
- capability/envelope version;
- evidence status.

Machine-local motion/control detail stays downstream.

## 9. Evidence-stage relationship

The current Store/Cell Stage 2 does **not** make this planned physical sheet machine a current Stage-2 asset.

The canonical S-001 application and Store path are accepted **software/reference** evidence. A physically supported, guarded, controlled, commissioned sheet machine begins to create **Stage-3 evidence** only after its physical/safety/validation boundary is actually established.

## 10. Next deliverable

Create and maintain:

`../engineering/sheet/SHEET-MACHINE-BUILD-0.1.md`

That document may contain the detailed component/control/patent correspondence and test plan. This staging page remains the truthful status surface.

**NO BLOOD ON WOOD.**
