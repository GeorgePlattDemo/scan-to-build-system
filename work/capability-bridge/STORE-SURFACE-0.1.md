# Store Surface 0.1

**Status:** Mode-2 sheet offering added; Board path unchanged  
**Evidence class:** DOCUMENTED publication map over REFERENCE models  
**Store consumed by the app for Board + Mode-2 sheet:** pin `49d22ce40482a7c2e0169ac1e6df48e0f8384a6d`  
**Prior Board-only pin:** `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d`

This file is what Store 1 may say. It is not a new Store implementation beyond the pinned evaluator.

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
| App fact today | accepted Board vertical asks Store with `BOARD_SQUARE_V1` |
| Machine fact today | REFERENCE (D-001 is a Store-declared reference capability) |
| Physical fact today | NOT CLAIMED |

## 3. Offering `SHEET_MODE2_STENCIL_V1`

Replaces the unpublished beginning-stage row `SHEET-RECT-BLANK-V0` as the callable sheet vertical. Rectangular demand remains as `STRAIGHT_RECT`.

| Field | Publication |
| --- | --- |
| Stock form | sheet goods |
| Operation | `ROUTE_PROFILE` + `RETAIN_TABS` |
| Profile kinds | `STRAIGHT_RECT`, `CURVILINEAR_OUTLINE` |
| Envelope | parent 48×96 in first; min blank 6 in; max route depth 0.75 in |
| Neutral packet | LOAD → SEAT → REGISTER → ROUTE_PROFILE → RETAIN_TABS → RELEASE → SECONDARY_SEPARATION → LABEL |
| App fact | `sheet.mode2.stencil.v1` / request type `SHEET_MODE2_STENCIL_V1` |
| First published SKU | `STB-ZERO-PLY-075-48X96-001` |
| Machine fact today | REFERENCE Mode-2 relationship |
| Physical fact today | NOT CLAIMED |
| Q | material fixture only; process Q UNRESOLVED |

## 3a. Next family `SHEET_MODE2_ARCHED_APERTURE_V0`

**Status:** DOCUMENTED REFERENCE family. Not a second live request type yet.

This is how “curvilinear” becomes a number Store can refuse.

| Field | Publication |
| --- | --- |
| Stock form | sheet goods |
| Outer | `STRAIGHT_RECT` inside parent |
| Aperture | `CIRCULAR_SEGMENT` (chord, rise, radius, units) |
| Ops | `ROUTE_PROFILE`, `RETAIN_TABS` |
| Machine relationship | sheet = X; centerline platform = Y; router = bounded Z; yokes/rollers seat and feed |
| App fact today | not on the wire |
| Machine fact | REFERENCE — see [`S-001-MODE2-REFERENCE-ARCHITECTURE-0.1.md`](S-001-MODE2-REFERENCE-ARCHITECTURE-0.1.md) |
| Physical fact | NOT CLAIMED |

Do not mark live `CURVILINEAR_OUTLINE` jobs as this family. The flag is not the segment.


## 4. How the application should call this

Keep the same split already earned:

- offering lookup;
- job evaluation;
- estimate separate from evaluation;
- one question per committed revision;
- replay on reopen; new question on new revision.

Review in the application still does not place an order.

## 5. Two offerings are not a cell

Store listing both rows above is two callable capabilities.

A later cell document may cite both rows. It may not invent tandem execution, shared Cycle Start, or dual-stream fabrication from this page.

## 6. Sources used

- accepted app Store protocol notes @ `4595b478`
- Stage-2 Store pins `b40cdc60` (Board ancestor) and `49d22ce4` (Mode-2 added)
- dimensional and sheet model files in this folder
- Atlas Bridge §3–4
