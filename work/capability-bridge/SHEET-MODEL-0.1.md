# Sheet Model 0.1 — Mode-2 2D stencil routing

**Status:** evolved from beginning-stage rectangular blank  
**Evidence class:** REFERENCE  
**Physical status:** NOT CLAIMED  
**Capability id:** `SHEET_MODE2_STENCIL_V1`

The beginning-stage `RECTANGULAR_BLANK` family remains the ancestor of `STRAIGHT_RECT`. It is not erased. Contour work now has a second declared family, `CURVILINEAR_OUTLINE`, still without a CAD kernel.

## 1. What this model is

A Store-callable Mode-2 REFERENCE offering:

- one sheet parent;
- a straight-sided component or a component with a curvilinear outline;
- retained stencil tabs / attachment points;
- later secondary separation, not claimed automated;
- label;
- record the chain.

S-001 cell-spine description and patent sheet figures stay donors. They do not fill missing cells in this model.

## 2. Stock class

| Item | Value | Class |
| --- | --- | --- |
| Form | sheet goods | REFERENCE |
| First published families | `STRAIGHT_RECT`, `CURVILINEAR_OUTLINE` | REFERENCE |
| Parent envelope | 48 in × 96 in first; smaller parent from offering fields | REFERENCE |
| Minimum blank | 6 in on each side | REFERENCE TEST ENVELOPE |
| Max route depth | 0.75 in, and not thicker than stock | REFERENCE TEST ENVELOPE |
| Size / accuracy / cycle time as production facts | unpublished | UNRESOLVED / NOT CLAIMED |

Sheet species, thickness, and fixture on-hand count are Store-owned.

## 3. Finished-part facts consumed

Required:

- parent sheet offering;
- `profileKind`;
- finished blank length and width with units;
- integer tab count ≥ 1;
- bounded route depth;
- quantity;
- part identity;
- operation family `ROUTE_PROFILE` + `RETAIN_TABS`.

Not consumed: room geometry, cabinet software files as approved toolpaths, spline editors, G-code.

`STRAIGHT_RECT` versus `CURVILINEAR_OUTLINE` is the smallest geometry distinction that proves straight versus curvilinear demand. It is not a toolpath.

## 4. Refuse list

- dimensional stock sent to this offering;
- offering without Mode-2 ops;
- unsupported profile kind;
- depth-controlled Mode-3 surface machining;
- unpublished drill patterns;
- missing units or missing tab count;
- size outside the published parent;
- machine-local language (spline, toolpath, G-code, controller);
- treating a governed simulation fixture as a commissioned machine.

## 5. Machine-neutral sequence

```text
LOAD          parent sheet offering
SEAT          reference edge / plane
REGISTER      blank on the sheet
ROUTE_PROFILE straight or curvilinear two-dimensional outline
RETAIN_TABS   selected attachment points remain
RELEASE
SECONDARY_SEPARATION   later; not claimed automated
LABEL         job + part identity
```

What moves (sheet in X, tool in Y, bounded Z) is declared in the Mode-2 relationship. Axis translation remains machine-local and unpublished as controller code.

## 6. Donor seed

Governed Reference pin `18949f16` contains one bounded sheet-stock simulation path. That path remains a seed for evaluation language. It is not physical evidence.

Beginning-stage file history: this document previously published only `RECTANGULAR_BLANK`. That family is now `STRAIGHT_RECT`.

## 7. What Store may publish

See [`STORE-SURFACE-0.1.md`](STORE-SURFACE-0.1.md) offering `SHEET_MODE2_STENCIL_V1`.

Evidence status must stay REFERENCE / NOT CLAIMED on physical commissioning.

## 8. Patent alignment

Sheet-support, feed, tooling-platform, curvilinear, and stencil-attachment relationships exist in the issued grants. This model declares them as REFERENCE. It does not implement them in iron.

Classify any later physical sheet build with the alignment gate. Do not copy a figure into a BOM from this file.

## 9. Relationship to a later cell

A cell claim may mention this offering only after Store actually lists it and the dimensional offering without collapsing them into one invented machine.

## 10. Sources used

- `work/machines/staging/SHEET-MACHINE-STAGING-0.1.md`
- Governed Reference sheet simulation pin `18949f16`
- Atlas Bridge §4 (neutral ops only)
- issued patents `US9720401B2` and `US10768609B2`
- [`MODE-2-SHEET-INTEGRATION-0.1.md`](MODE-2-SHEET-INTEGRATION-0.1.md)
