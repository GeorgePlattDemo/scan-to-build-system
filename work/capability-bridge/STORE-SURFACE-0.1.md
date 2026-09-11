# Store Surface 0.1

**Status:** first load  
**Evidence class:** DOCUMENTED publication map over REFERENCE models  
**Store consumed by the app today:** Stage-2 pin `b40cdc60` (`BOARD_SQUARE_V1` / offering lookup)

This file is what Store 1 may say. It is not a new Store implementation.

## 1. Rules of speech

The Store may publish:

- offering identity;
- stock form;
- operation class;
- numeric envelope that a model file already states;
- `SUPPORTABLE` / unsupported / unresolved;
- budgetary Q when the Store evaluation produced one;
- machine-neutral instruction list from the model;
- evidence status (`REFERENCE`, `IMPLEMENTED` demand-side, `NOT CLAIMED` physical).

The Store may not publish:

- G-code, MPR, CIX, servo steps;
- live inventory counts unless a later Store 1 source owns them;
- staged pickup as a physical fact;
- measured cycle time from a model;
- a cell name as if two offerings were one commissioned plant.

## 2. Offering `DIM-SQUARE-LENGTH-V1`

| Field | Publication |
| --- | --- |
| Stock form | dimensional lumber, 2×4 class first |
| Operation | square CROSSCUT to finished kept length |
| Envelope | 24 in–60 in inclusive |
| Neutral packet | LOAD → SEAT → CLEANUP → INDEX → CROSSCUT → LABEL |
| App fact today | accepted Board vertical asks Stage-2 Store with `BOARD_SQUARE_V1` |
| Machine fact today | REFERENCE (D-001 is a Store-declared reference capability) |
| Physical fact today | NOT CLAIMED |

Example instruction packet the Store may attach after a supported evaluation:

```text
LOAD <offering>
SEAT fence+support
CLEANUP origin face
INDEX finished kept length <L> in
CROSSCUT square
LABEL <partId>
```

## 3. Offering `SHEET-RECT-BLANK-V0`

| Field | Publication |
| --- | --- |
| Stock form | sheet goods |
| Operation | RECTANGULAR_BLANK |
| Envelope | unpublished numeric size; refuse contour |
| Neutral packet | LOAD → SEAT → REGISTER → CUT → LABEL |
| App fact today | not an implemented first-vertical path |
| Machine fact today | REFERENCE beginning-stage model only |
| Physical fact today | NOT CLAIMED |

Do not answer `SUPPORTABLE` for sheet from dimensional logic.

## 4. How the application should call this

Current implemented call remains the Stage-2 pin.

Future Store 1 calls should keep the same split already earned:

- offering lookup;
- job evaluation;
- estimate separate from evaluation;
- one question per committed revision;
- replay on reopen; new question on new revision.

Review in the application still does not place an order.

## 5. Two offerings are not a cell

Store 1 listing both rows above is two callable capabilities.

A later cell document may cite both rows. It may not invent tandem execution, shared Cycle Start, or dual-stream fabrication from this page.

## 6. Sources used

- accepted app Store protocol notes @ `4595b478`
- Stage-2 Store pin `b40cdc60`
- dimensional and sheet model files in this folder
- Atlas Bridge §3–4
