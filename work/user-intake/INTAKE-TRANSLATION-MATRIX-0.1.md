# Intake Translation Matrix 0.1

**Status:** candidate architecture matrix — not a field-survey result  
**Owner:** Application  
**Branch:** `build/app-intake-authority-0.1`

This document describes the common intake/translation problem the application now exposes. It does **not** claim that the listed formats are all parsed, supported, or commercially accepted.

The purpose is to separate four questions that are easy to collapse:

1. Can the application **receive/preserve** the source?
2. Can it **display or inspect** the source?
3. Can it **create attributable observations** from the source?
4. Can any resulting value become part of a **candidate definition**, and if so, by what explicit act?

A fifth question remains separate from all four:

5. Has the holder **reviewed/confirmed** the resulting project version?

Reading, displaying, parsing, or mapping does not answer question 5.

## Status vocabulary

| Status | Meaning |
| --- | --- |
| `IMPLEMENTED` | present in the accepted application behavior |
| `CANDIDATE UI` | presented on this branch without new domain authority |
| `PLANNED` | named direction; not implemented |
| `RESEARCH NEEDED` | format/field/domain work remains before a bounded claim is possible |
| `NOT CLAIMED` | deliberately outside present capability |

## Source / intake matrix

| Starting material | Preserve source | Inspect/display | Observation path | Candidate path | Current note |
| --- | --- | --- | --- | --- | --- |
| Plain-language need | `IMPLEMENTED` | text | entered observation | remains unclassified unless explicitly mapped/handled | A sentence is valid demand evidence; no phantom parts are created. |
| Manual measurement | `IMPLEMENTED` | field value | entered measurement with unit/role | explicit mapping to a candidate input where supported | Missing/unsupported units remain unresolved; values are not guessed. |
| Pick-a-Board bounded entry | n/a as external file | rendered bounded input | direct bounded input + observations | Board definition path | Current implemented vertical; finite inch length slice only. |
| JPEG / PNG photo or sketch | `IMPLEMENTED` | `IMPLEMENTED` display | manual observation may be attached to source location/context | explicit later mapping only | Display does not measure the image. No vision-derived dimensions are claimed. |
| PDF drawing | `IMPLEMENTED` | `IMPLEMENTED` PDF display | manual observation may cite the drawing/page | explicit later mapping only | No OCR, scale extraction, or drawing-semantic extraction is claimed. |
| Raw takeoff / cut-list text | `IMPLEMENTED` | text | original retained + manual takeoff-row observations | candidate mapping is bounded by existing inputs | File parsing is not implemented. |
| CSV / spreadsheet cut list | source may be retained as a file where accepted by generic evidence path; structured parsing is not established | opaque unless supported by browser/source path | `PLANNED` structured import | `PLANNED` | Research required for column mapping, units, revision, quantity, material, features, and conflicts. |
| Scan / point-cloud / RoomPlan-like file | source may be retained as opaque evidence | native interpretation not implemented | `PLANNED` | `PLANNED` | A scan is evidence/context until specific observations are established and reviewed. |
| CAD / BIM / structured model | source may be retained as opaque evidence | native interpretation not implemented | `PLANNED` | `PLANNED` | No DXF/DWG/STEP/IFC/Revit semantic extraction claim. |
| Previous Scan-to-Build owner archive | `IMPLEMENTED` import as separate/local record path | `IMPLEMENTED` inspection | historical records remain historical | resume/copy according to current archive rules | Imported Store answers/reviews do not become current authority automatically. |
| Multiple sources for one project | `IMPLEMENTED` evidence collection | each source according to its display type | observations remain attributable to their source | candidate may use explicit mapped observations | Format differences do not create separate projects. |
| Unsupported/opaque file | `IMPLEMENTED` where generic evidence limits permit retention | opaque | none automatically | none automatically | Preserve identity/bytes where possible; say what cannot be interpreted. |

## Common field vocabulary

This is the current candidate common denominator for research and future adapters. It is intentionally broader than the implemented Board vertical.

### Identity

Potential fields:

- project / job identity;
- customer or professional reference;
- source artifact identity;
- drawing/file number;
- revision/version;
- part number or line identifier;
- previous project/part relationship.

**Current state:** project/source/revision identity exist in the application record architecture; professional document-control vocabulary needs broader research.

### Intent

Potential fields:

- what is being made, replaced, changed, or fitted;
- one part / several parts / assembly;
- new / repeat / replacement work;
- where the result is used.

**Current state:** plain-language need can be retained; general intent classification is not implemented as an authority-bearing parser.

### Quantity

Potential fields:

- part count;
- sets/assemblies;
- repeat pattern;
- unit of quantity.

**Current state:** Board uses `1 ea`; takeoff rows collect quantity/unit manually. General structured quantity import needs research.

### Geometry

Potential fields:

- overall/finished dimensions;
- opening/site dimensions;
- stock dimensions;
- thickness;
- length/width/depth;
- angles/radii;
- feature locations/spacing;
- tolerances;
- allowances/clearances;
- datums/reference edges;
- approximate versus controlling measurements.

**Current state:** bounded Board length and manual measurement observations are implemented. General geometry grammar is incomplete.

### Material

Potential fields:

- generic material;
- species/product;
- grade;
- thickness/form;
- finish/treatment/color;
- exact SKU when supplied;
- customer-supplied material;
- unknown material.

**Current state:** Store owns actual offering/item identity. Intake may state a requirement or description but does not silently promote appearance/text into Store identity.

### Feature requirements

Human-facing examples:

- cut to length;
- rip to width;
- hole/bore;
- slot/groove/dado;
- notch;
- routed end/profile;
- edge treatment;
- opening/cutout;
- label;
- other requested feature.

**Current state:** broader feature vocabulary exists on the capability bridge/candidate machine work, but the accepted application does not yet expose a general feature configurator. Machine stations, coordinates, G-code, controller commands, and toolpaths are not application fields.

### Fit / site context

Potential fields:

- opening/space;
- adjacent surfaces;
- obstacles/interference;
- level/plumb/square conditions;
- capture evidence;
- critical interfaces.

**Current state:** evidence and measurements can be retained; broad site-geometry resolution is not implemented.

### Reference evidence

Potential fields:

- photo;
- sketch;
- scan;
- drawing;
- PDF;
- takeoff;
- cut list;
- BOM;
- CAD/BIM;
- spreadsheet;
- note;
- prior record;
- external reference.

**Current state:** several are active as display/manual-observation paths; others are opaque/planned. Source evidence is not automatically a controlling definition.

### Schedule / fulfillment preference

Potential fields:

- requested date/window;
- pickup/delivery preference;
- professional job reference;
- later custody/handoff preferences.

**Current state:** not part of the current bounded intake implementation. A requested date must not become a promise merely because it is entered.

### Uncertainty / basis

Required concepts for the general model:

- stated by holder;
- entered manually;
- read/extracted from source;
- derived from other values;
- approximate;
- missing;
- conflicting;
- unsupported;
- unresolved;
- user-reviewed/confirmed.

**Current state:** source, observations, unresolved reasons, mappings, revisions, review, and history already provide part of this architecture. A complete common assertion/basis object for all intake classes is not yet settled.

## Translation rules

The candidate baseline is:

```text
SOURCE
  ↓ preserve identity / bytes where possible
OBSERVATION
  ↓ attributable statement about the source or holder input
CANDIDATE INPUT
  ↓ explicit use in a proposed definition
DERIVED VALUE
  ↓ basis remains visible
PROJECT REVISION
  ↓ holder review / correction / unresolved handling
CONFIRMED DEFINITION
```

Never silently jump from SOURCE to CONFIRMED DEFINITION.

## Conflict rule

Two sources that disagree remain two sources.

A future general conflict engine should be able to represent at least:

```text
field / concept
source A value + basis
source B value + basis
conflict status
who is allowed to resolve it
resolution / new observation
resulting project revision
```

Current candidate UI states this rule, but arbitrary cross-source conflict detection is **NOT IMPLEMENTED**.

## Gap-closing / configurator rule

The general configurator should ask only for the delta.

Examples:

- no observations yet → ask what the person is trying to make/change/replace;
- source retained but no usable observation → ask what the source reliably establishes;
- usable observation not mapped → ask whether it belongs in the candidate;
- missing unit → ask for unit, do not infer;
- conflicting observations → ask the proper owner to resolve;
- professional-judgment condition → route to holder/rule/qualified-person classification rather than ask the customer to guess;
- complete candidate → review the definition instead of continuing a questionnaire.

The current candidate branch implements only a lightweight UI prompt from visible current gaps. It is not yet a full general gap engine.

## Research targets created by this matrix

Future field research can now target specific unknowns instead of “forms in general”:

1. common professional identity/revision fields across drawings, takeoffs, RFQs, work orders, and cut lists;
2. quantity/unit conventions;
3. dimension/tolerance/datums conventions by source type;
4. drawing-versus-model conflict precedence practices;
5. material description versus exact product/SKU conventions;
6. feature/operation vocabularies that remain machine-neutral;
7. CSV/XLSX import patterns;
8. CAD/BIM/IFC/DXF/STEP intake boundaries;
9. scan/point-cloud evidence and confidence/basis conventions;
10. professional standing / qualified-resolution routing;
11. schedule/fulfillment preference fields that do not accidentally create promises;
12. privacy/minimum-necessary rules for customer and contractor files.

## Not claimed

This matrix does not mean Scan-to-Build accepts every file type, understands every source, or can fabricate every described project.

**The door can be wide because the gate is explicit.**

**NO BLOOD ON WOOD.**
