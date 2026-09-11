# Sheet Model 0.1 — beginning stage

**Status:** first load  
**Evidence class:** REFERENCE beginning-stage model  
**Not:** commissioned sheet machine, tandem cell, or production

Same document shape as the dimensional model. Thinner envelope on purpose.

## 1. What this model is

A Store-callable **beginning-stage** sheet offering:

- one sheet parent;
- one rectangular blank / straight registered cut family;
- label;
- record the chain.

It exists so Store 1 can name a second capability without pretending a full panel cell is installed.

S-001 Cell-spine description and patent sheet figures stay donors. They do not fill missing cells in this model.

## 2. Stock class

| Item | Value | Class |
| --- | --- | --- |
| Form | sheet goods | REFERENCE |
| First published family | rectangular blank from a supported sheet offering | PLANNED / REFERENCE |
| First useful task | UNRESOLVED as physical build; RECTANGULAR_BLANK as published evaluation family | — |
| Size envelope | unpublished pending Store 1 sheet SKU list | UNRESOLVED |

Sheet species, thickness, and on-hand count are Store-owned.

## 3. Finished-part facts consumed

Required when the family is used:

- parent sheet offering;
- finished blank length and width with units;
- quantity;
- part identity;
- operation family `RECTANGULAR_BLANK`.

Not consumed: room geometry, cabinet software files as approved toolpaths, contour splines.

## 4. Refuse list

- dimensional stock sent to this offering;
- contour / nested irregular outline;
- depth-controlled profiling;
- unpublished drill patterns;
- missing units;
- size outside a later published envelope;
- treating a governed simulation fixture as a commissioned machine.

## 5. Machine-neutral sequence

Beginning stage only:

```text
LOAD          parent sheet offering
SEAT          reference edge / plane
REGISTER      blank rectangle on the sheet
CUT           rectangular outline / registered straight cuts
RELEASE
LABEL         job + part identity
```

What moves (sheet, gantry, or both) is machine-local and unpublished.

## 6. Donor seed

Governed Reference pin `18949f16` contains one bounded **sheet-stock simulation** path. That path is the seed for evaluation language. It is not physical evidence.

Atlas 05 treating sheet as its own envelope is accepted as a comparison note only.

## 7. What Store may publish

See [`STORE-SURFACE-0.1.md`](STORE-SURFACE-0.1.md) offering `SHEET-RECT-BLANK-V0`.

Evidence status must stay REFERENCE / UNRESOLVED on physical commissioning.

## 8. Patent alignment

Sheet-support, feed, and tooling-platform relationships exist in the issued grants. This beginning stage **does not** implement them.

Classify any later physical sheet build with the alignment gate. Do not copy a figure into a BOM from this file.

## 9. Relationship to a later cell

A cell claim may mention this offering only after Store 1 actually lists it and the dimensional offering without collapsing them into one invented machine.

## 10. Sources used

- `work/machines/staging/SHEET-MACHINE-STAGING-0.1.md`
- Governed Reference sheet simulation pin `18949f16`
- Atlas Bridge §4 (neutral ops only)
