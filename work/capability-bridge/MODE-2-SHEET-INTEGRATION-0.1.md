# Mode-2 sheet integration 0.1

**Status:** REFERENCE capability integration  
**Evidence class:** REFERENCE Store capacity; IMPLEMENTED demand path in `apps/stb/`  
**Physical status:** NOT CLAIMED  
Live Store offering remains `SHEET_MODE2_STENCIL_V1`. The next documented family is `SHEET_MODE2_ARCHED_APERTURE_V0`. Machine backing: [`S-001-MODE2-REFERENCE-ARCHITECTURE-0.1.md`](S-001-MODE2-REFERENCE-ARCHITECTURE-0.1.md).


This document is the durable record of how a bounded sheet component travels from user definition to Store Zero and back. It is not a machine commissioning record.

## Purpose

Prove the Scan-to-Build chain for one sheet family:

USER REQUIREMENT → APPLICATION → STORE ZERO → CAPABILITY EVALUATION → SUPPORTABLE / REFUSE / UNRESOLVED → BUDGETARY Q WHERE GROUNDED → REVIEW / RESULT → OWNER RECORD

The physical machine is not built in this pass.

## Demand as Architecture

Cutting wood is established industrial practice. The Scan-to-Build question is how a project requirement becomes structured, retained information that can be checked against material, manufacturing capability, cost, and constraints without being reinterpreted at every handoff.

Most physical building blocks already exist commercially. The remaining study delta is the disclosed Mode-2 relationship plus the information chain that carries demand to that boundary.

## Two chains

Information / talk chain:

user need → evidence → observations → part definition → committed revision → Ask Store → capability evaluation → result → Review → Owner Record

Tool / manufacturing-requirement chain:

part definition → material form → geometry/process requirement → Store capability → Mode-2 reference model → machine-neutral work requirement → later machine-site translation → later physical validation

They meet at the Store capability boundary. Servo and controller language do not cross the application contract.

## Issued patent boundary

Read from `docs/patents/source/`.

U.S. 10,768,609 B2 claim language includes two-dimensional machining operations on sheet material stock, including curvilinear shapes. That phrase is not paraphrased away.

U.S. 9,720,401 B2 specification language includes:

- “Any two-dimensional form can be shaped using mode 2 if a routing head is used for cutting”
- “stenciling the desired form”
- stencil-type meaning: the formed shape remains attached at selected points and is later separated
- secondary separation by the operator using small power or hand tools
- an end-to-end integrated consumer project system (intent, evaluation/pricing, fabrication instructions, labeling, fulfillment)

This integration does not implement every issued claim. Mode 3 remains outside the active build.

## Safety Speed commercial baseline

Official manufacturer pages reviewed 2026-09-11. No endorsement, partnership, license, or infringement conclusion is claimed.

| Product | Official URL | What the source establishes | What it does not establish |
| --- | --- | --- | --- |
| H5-64 vertical panel saw | https://safetyspeed.com/products/machines/vertical-panel-saws/h5-64-panel-saw/ | Vertical panel architecture; material rollers; guided travel; panel processing | Mode-2 sheet-as-X axis; stencil tabs; Scan-to-Build Store evaluation |
| SR5U saw/router combo | https://safetyspeed.com/products/machines/saw-router-combos/sr5u-panel-saw-and-router-combo/ | Combined saw and router on a vertical panel machine; adjustable floating router head; guide tubes; material rollers | Coordinated sheet-X / tool-Y Mode-2 relationship; commissioned S-001 |
| SpeedWorx automated panel saw | https://safetyspeed.com/products/automated-panel-saw/speedworx-automated-panel-saw/ | Automated panel positioning; automated carriage motion; published X/Y/Z/C cutting functions | Identity with the patented Mode-2 yoke/roller sheet feed; stencil retention |

Manufacturer PDFs linked from those pages may be used as further literature. They do not authorize modification of OEM machines.

## Bounded Mode-2 study delta

After subtracting commercially established vertical panel support, rollers, guided carriage, saw processing, router processing, plunge/float depth, electronic measurement, and powered positioning, the remaining study delta is:

- the sheet itself functions as the coordinated X machining axis through servo-controlled manipulation
- a centerline router platform supplies coordinated Y movement
- bounded Z depth
- straight and curvilinear two-dimensional profiles
- retained stencil attachment points for later separation

That delta is REFERENCE. It is not commissioned.

## Store capability

Store Zero pin for this integration:

`GeorgePlattDemo/scan-to-build-store` branch `build/sheet-mode2-storezero-0.1`  
commit `49d22ce40482a7c2e0169ac1e6df48e0f8384a6d`

Evaluator: `evaluateSheetMode2Job`  
Envelope: `S001-MODE2-STENCIL-V1`  
Published SKU used by the app: `STB-ZERO-PLY-075-48X96-001`

Dimensional `BOARD_SQUARE_V1` / `evaluateJob` remains intact. Sheet stock sent through D-001 is refused (`SHEET_NOT_D001`).

Budgetary Q is material fixture only. Process Q is UNRESOLVED.

## Application definition

Kind: `sheet.mode2.stencil.v1`  
Request type / scope: `SHEET_MODE2_STENCIL_V1`

The application defines:

- profile kind `STRAIGHT_RECT` or `CURVILINEAR_OUTLINE`
- blank length and width in inches
- tab count ≥ 1
- bounded route depth
- one published sheet SKU
- one Store question per committed revision

It does not calculate supportability and does not emit toolpaths.

## Fixtures / tests

Store: `s001-mode2-envelope.test.mjs` plus existing Stage-2 suites.

Application: unit wire tests for the sheet contract; Store wrapper tests against the exact pin when `STB_STORE_ZERO_ROOT` is that checkout.

## Refusals

Unsupported profile, missing tabs, dimensional stock, offerings without `ROUTE_PROFILE`/`RETAIN_TABS`, oversized blanks, machine-local language, and missing required fields.

## Safety / authority

**NO BLOOD ON WOOD.**

No retrofit procedure. No defeated guards. No remote Cycle Start. Support never becomes fabrication authority.

## Later physical research questions

Guarding; router/spindle containment; material restraint; sheet-position loss; reversal/backlash; router side load; workpiece lift; emergency stop; dust collection; control/electrical safety; commissioning; accuracy; repeatability. An established OEM could eventually build or collaborate on a research implementation. No OEM has agreed to participate.
