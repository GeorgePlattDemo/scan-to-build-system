# S-001 CANONICAL START STATE 0.1

**Status:** candidate machine-design / virtual-validation input  
**Applies to:** `S001_CENTERED_ARCHED_SHEET_V0` / `S001-CENTER-WORK-FIELD-V0`  
**Physical commissioning:** NOT PERFORMED  
**Physical execution authority:** false  
**Safety invariant:** **NO BLOOD ON WOOD**

## Purpose

Define the narrow start condition for the first canonical S-001 full-sheet project without inventing controller authority, sensor performance, correction algorithms, or physical commissioning evidence.

The desired behavior is deliberately conservative:

**mechanics establish the sheet reference; electronics independently monitor whether that reference remains credible.**

The electronic layer is not allowed to turn an invalid mechanical reference into a valid one.

## Existing correspondence

The current cell spine already records the Mode-2 patent correspondence:

- bottom rollers support/reference the sheet;
- the sheet is referenced to the machine centerline by the yoke/manipulating rollers;
- top clamping rollers maintain the declared contact/reference state;
- encoder architecture, slip detection, allowable error and detailed Mode-2 attach-point behavior remain unresolved.

This start-state note narrows that existing correspondence for the canonical project. It does not add a new patent claim or physical capability claim.

## Canonical sheet orientation and field

For the canonical project:

- parent sheet = `96 in` horizontal × `48 in` vertical;
- mechanical sheet reference = centered on machine centerline;
- Store-owned working field = centered `48 in` horizontal × `36 in` vertical;
- the working field therefore leaves `24 in` of parent sheet outside the field at each long-axis end and `6 in` outside the field at top and bottom;
- the complete routed profile must remain inside the working field;
- routing outside this field is refused. There is no edge-work exception in this slice.

The canonical 36 in wide × 36 in overall opening is centered inside that field. It leaves 6 in left/right inside the working field and reaches the field's top/bottom boundary. Relative to the full sheet it leaves 30 in left/right and 6 in top/bottom.

## Mechanical-first reference sequence

The candidate start sequence is:

1. operator loads the declared full sheet in the declared orientation;
2. bottom support/reference rollers carry the sheet in the declared support condition;
3. opposed yoke/manipulating-roller mechanism mechanically establishes the sheet centerline reference;
4. declared top/clamping retention establishes the required contact/workholding state;
5. the mechanical centering mechanism reaches its declared seated/detented/equalized condition;
6. only after the mechanical reference exists may electronic reference-monitor channels evaluate it;
7. local machine state may report `CENTER_REFERENCE_VERIFIED` only when the independent monitor channels agree within a later commissioned tolerance;
8. `POSITION_VALID`, workholding/retention, controller readiness and the modeled safety-permissive chain must all remain true before virtual Cycle Start can become eligible.

Mechanical self-centering is primary because it establishes the physical reference without depending on a software guess about where the sheet is.

## Electronic monitor role

The electronic layer is a **slave monitor / verifier** in this slice.

Candidate monitored facts may include, after hardware selection and commissioning:

- left/right reference-channel agreement;
- yoke/roller position agreement;
- loss of declared center reference;
- loss of sheet contact/retention;
- unexpected reference movement during a cycle;
- channel disagreement or diagnostic fault.

The present design does **not** select an encoder, scanner, safety PLC, fieldbus, tolerance, response time or SIL/PL rating. Those require physical risk assessment, controls design and commissioning evidence.

A monitor may:

- confirm a declared reference condition;
- invalidate `POSITION_VALID`;
- block start;
- request a controlled stop/fault in the virtual controller model;
- create a diagnostic/audit event.

A monitor may not in this slice:

- move the sheet to make an invalid job fit;
- silently change project geometry;
- enlarge the Store working field;
- override a Store refusal;
- bypass workholding or guarding;
- remotely issue Cycle Start;
- continuously rewrite the active cutting path.

## Fail-closed interlock behavior

The candidate machine permissive must treat the following as blocking/fault conditions:

```text
CENTER_REFERENCE_VERIFIED == false
POSITION_VALID == false
WORKHOLDING_CONFIRMED == false
SHEET_RETENTION_CONFIRMED == false
MONITOR_CHANNEL_AGREEMENT == false
SAFETY_CHAIN_HEALTHY == false
GUARDS_CLOSED_LOCKED == false
ESTOP_CHAIN_HEALTHY == false
CONTROLLER_READY == false
PROGRAM_VALID == false
PHYSICAL_IO_ISOLATED == false   [virtual-validation phase]
```

Any required false condition blocks virtual Cycle Start. Loss of a required condition during a virtual cycle causes the declared safe-stop/fault behavior rather than an automatic workaround.

Guard reclosure, restoration of a sensor, or restoration of center-reference agreement must not automatically restart the cycle. A new deliberate start sequence is required.

## Self-verifying / off-the-shelf posture

The physical target should use commercially available, diagnosable components appropriate to the machine risk assessment rather than bespoke safety electronics where a proven industrial component exists.

For physical implementation, the eventual design should favor:

- dual-channel or otherwise appropriately redundant safety inputs where the risk assessment requires them;
- discrepancy detection;
- monitored reset / restart inhibition;
- diagnostic coverage appropriate to the selected safety function;
- safety-rated interlock/relay/controller components where a safety function is being implemented;
- separate standard process sensing where the signal is informational rather than safety-rated.

This document does not name a vendor/model or claim a required PL/SIL/category. That selection cannot be made responsibly without the actual electrical design, stopping behavior, hazard analysis and commissioning plan.

## Automatic in-cycle correction — STOP / unresolved

The user objective includes the possibility that electronic sensing might eventually detect small sheet/reference drift and adjust a job run.

That behavior is **not activated here**.

Before any automatic compensation can exist, a later machine-controls slice must establish at minimum:

- what physical quantity is measured;
- sensor accuracy, repeatability and diagnostics;
- allowable positional error;
- machine/control coordinate frames;
- when compensation is permitted versus mandatory stop;
- maximum allowed correction magnitude/rate;
- interaction with tabs, workholding and cutting load;
- controller implementation and independent validation;
- failure behavior;
- physical commissioning evidence.

Until then:

```text
REFERENCE DISAGREEMENT OR DRIFT
        -> INVALIDATE / STOP
        -> RE-ESTABLISH MECHANICAL REFERENCE
        -> VERIFY
        -> NEW DELIBERATE START
```

No adaptive motion is inferred.

## Audit level

Retain decision-level evidence, not machine microtelemetry in the owner record.

A useful future machine-site record should be able to bind:

- machine/configuration identity;
- canonical work-field identity;
- mechanical-reference state;
- monitor-channel summary / agreement result;
- gate result and reason;
- controller/program identity when that layer is activated;
- virtual run/outcome identity;
- any stop/fault that changed the outcome.

High-rate encoder samples, servo interpolation points, router revolutions and similar machine telemetry belong in machine-site diagnostic evidence when needed, not duplicated into every owner/project record.

## Architectural stops

Do not solve inside this slice:

1. exact electronic sensor/scan technology;
2. sensor tolerance or drift threshold;
3. active compensation during a cut;
4. safety PLC/relay vendor or safety integrity rating;
5. physical I/O map;
6. real controller wiring;
7. physical commissioning or production authority.

Those are separate machine-controls / safety-engineering decisions.
