# Dimensional Model 0.1

**Status:** first load  
**Evidence class:** REFERENCE model  
**Not:** commissioned iron, measured production, or Machine Build 1 proof

Owner of this description: Machine / cell research, published through Store only as the surface in [`STORE-SURFACE-0.1.md`](STORE-SURFACE-0.1.md).

Physical comparison case remains manual radial-arm-saw practice (eyes, tape, pencil, operator judgment). That case is the control. It is not this model.

## 1. What this model is

A Store-callable **reference** capability for dimensional stock:

- one parent stick;
- establish references;
- produce one finished kept length by square crosscut;
- optional later features only if listed below as unpublished;
- label the part;
- record the chain.

This is the information and instruction shape Store 1 may name. It is not a claim that D-001 exists as commissioned hardware.

## 2. Stock class

| Item | Value | Class |
| --- | --- | --- |
| Form | dimensional lumber | REFERENCE fixture |
| First published class | 2×4 class board | REFERENCE |
| First published parent example | nominal 2×4×72 SPF | REFERENCE / CUT-001 chain |
| Usable published finished length | 24 in through 60 in inclusive | IMPLEMENTED in the accepted Board vertical as demand; REFERENCE as machine capability |
| Units | inches required | IMPLEMENTED in app |

Width, thickness, species, price, and on-hand count are Store-owned. This model does not invent them.

## 3. Finished-part facts consumed

Required:

- parent stock identity / offering;
- finished kept length with units;
- quantity;
- part identity;
- square CROSSCUT as the operation.

Not consumed from the alcove opening, slope, or bow. Those are project facts upstream. The machine receives the finished kept length, not the room.

Kerf is machine-local. The job does not say `finished + kerf`.

## 4. Refuse list

Refuse, do not clamp:

- missing units;
- finished length outside the published range;
- non-square end requirement (miter unpublished);
- sheet stock;
- operations not on the published list;
- stock the Store cannot map;
- unresolved conditions that block the requested operation;
- any request that needs remote Cycle Start.

Invalid demand is retained in the application. It is not silently fixed.

## 5. Machine-neutral sequence

For one stick:

```text
LOAD          parent offering
SEAT          fence + support plane
HOLD / FEED   engage without losing seat
CLEANUP       origin face from the rough commercial end
POSITION_VALID  (machine-local)
INDEX         to finished-length station relationship
CROSSCUT      finished kept length
RELEASE
LABEL         job + part identity
```

DRILL and MILL exist in Store Job 001 as described pattern only. They are **unpublished** on this model until a later revision lists them.

## 6. Reference geometry (documentary)

CUT-001 documentary constants, for the information chain only:

- dual-saw span used in that reference: 48 in between blades in the described fixture;
- example kept length: 60.000 in from a 72 in parent;
- origin established by cleanup, not by the factory end.

Those numbers are not machine coordinates the application may send.

Lowering (how this cell turns 60.000 in kept length into axis motion) is machine-local and uncommissioned.

## 7. What Store may publish

See [`STORE-SURFACE-0.1.md`](STORE-SURFACE-0.1.md) offering `DIM-SQUARE-LENGTH-V1`.

Store sees: stock form, operation class, length range, envelope version, refuse list, evidence status.

Store does not see: servo tune, I/O, work offsets, postprocessor, station coordinates.

## 8. Patent alignment (gate, not conclusion)

Read [`PATENTS.md`](PATENTS.md) before changing this envelope.

Intended correspondence to discuss when filling iron plans:

- support / frame;
- fence / reference;
- restraint;
- controlled longitudinal movement;
- sawing.

This model is **intentionally narrower** than exemplary multi-station figures. Narrowing is explicit: one stock class, one square cut-to-length, no claimed drill/mill/router stations.

Correspondence is not commissioning and not safety evidence.

## 9. Relationship to Machine Build 1

Machine Build 1 asks whether this digital finished-length object can become one measured physical cut without pencil layout.

Until that evidence exists, this file remains REFERENCE.

## 10. Sources used

- `work/machines/staging/DIMENSIONAL-MACHINE-STAGING-0.1.md`
- Store Job 001 operating pattern @ `3620b353` (rewritten; exhibit names omitted)
- accepted Board vertical @ `4595b478` for the 24–60 in demand window
- Atlas Bridge §4
