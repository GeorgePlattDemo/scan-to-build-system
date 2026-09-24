# Atlas Bridge

**Status:** first load  
**Evidence class:** DOCUMENTED working rewrite  
**Donor status of originals:** not adopted / field survey  
**Originals:** [`../../source-library/atlas-research/`](../../source-library/atlas-research/)

This file is the only Atlas text allowed to steer the application and Store surfaces.
Original part files stay donors. Atlas part numbers are not architecture, Store types, Cell objects, or runtime states.

Authority if this file conflicts with an owner: System canonical operational definitions → Store-local facts/capability → Program research/evidence for its own questions → this rewrite. Historical Governed Reference material is provenance, not current authority.

## 0. Borrow-first (app layer)

Before inventing machinery in the application, use ordinary platform tools when they already do the job:

- HTML input and constraint validation for hygiene — never as governed gates;
- inline SVG for bounded 2D views;
- File API for user-selected source bytes;
- Web Crypto digest for local content identity;
- IndexedDB for local project/record persistence;
- native ES modules to separate derivation, records, and views.

Borrow mature pieces. Invent only connective tissue this system actually needs.

## 1. Capture and intake — Application

A scan, photo, drawing, typed number, or file is **candidate evidence**.

- The application may keep name, type, and a fingerprint of the bytes.
- Keeping a source is not a parse and not a confirmation.
- Extracted numbers are candidates until the holder maps them into the active definition.
- Mapping does not mint a governed `Observation` by itself. That word belongs to the governed owner.
- Missing units stay unresolved. The application does not invent inches.
- A correction makes a new record. The old record stays inspectable.

## 2. Easy in / hard in — Application

Easy in (the app may treat as typed fact after the holder enters it):

- finished length, width, thickness with units;
- quantity;
- a mapped project class the app already knows;
- explicit option choices that class publishes.

Hard in (keep as source; do not treat as approved geometry):

- LiDAR / scan files;
- PDF, DXF, SVG, photo;
- contractor cut lists and takeoffs;
- CAD / BIM exports.

If numbers are later pulled from a hard-in file, they arrive as candidates. The holder confirms them like anyone else. Professional arrival does not skip a verb and does not widen the machine envelope.

Unclassified demand stays visible and creates no parts.

## 3. Store membrane — Store

The application may ask the Store a bounded question about a committed revision.

The Store may answer material match, sufficiency, capability, and a budgetary estimate.

The application may not:

- create an order by asking;
- treat `SUPPORTABLE` as acceptance, reservation, or payment;
- treat Q as a quote;
- treat a Store answer as fresh after the definition changes.

A new revision asks again. Commercial order, checkout, and reservation stay Store-owned and later.

## 4. Neutral operations — Store to machine-local

After a definition is complete enough, the Store may attach **part-relative** operations. It does not emit machine coordinates, G-code, or Cycle Start.

Allowed machine-neutral vocabulary for this bench:

```text
LOAD
SEAT          (fence / support references)
CLEANUP       (origin face; commercial end is not the length datum)
INDEX         (controlled travel to the next operation)
CROSSCUT      (finished kept length)
RIP           (finished kept width, only if the model publishes it)
DRILL         (part-relative hole)
MILL          (part-relative groove / pocket)
RELEASE
LABEL
```

Four files stay distinct:

| Layer | Contains | Owner |
| --- | --- | --- |
| Part job | finished size, features, identity | Store, machine-neutral |
| Machine program | that job after lowering | machine-local |
| Controller state | offsets, interlocks, mode | local controller |
| Motion | drives | drives |

The application does not write the last three.

`POSITION_VALID` is machine-local. If the stock moves, validity dies. The application does not vote.

Jog, automatic cycle, and network delivery stay separate. Loss of network must not run motion.

## 5. Shelf (do not load by default)

Atlas 05 envelope bins, Atlas 06 iron families, and Atlas 07 distribution survey remain donors.
They do not become Store capability types or Cell objects because they are useful to read.

## 6. What this rewrite refuses

- app- or Store-emitted G-code, MPR, or CIX;
- one post for every machine;
- remote Cycle Start;
- treating simulation as physical fabrication;
- using controller work-offset numbers as project dimensions;
- filling a missing current definition from the public exhibit.
