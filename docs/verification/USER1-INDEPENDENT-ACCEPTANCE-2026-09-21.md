# User 1 independent acceptance contract — 2026-09-21

This record is frozen before production edits for the bounded User 1 integration repair.

## Starting checkpoints

- Review: `GeorgePlattDemo/scan-to-build-review@740b510a9688c60e20af93179979dc83fe6b602f`
- System: `GeorgePlattDemo/scan-to-build-system@228e005d565ab918c5c3be52efc0bf3e99d2f5d7`
- Store: `GeorgePlattDemo/scan-to-build-store@ab8a4c5d470c310f27fef82683611622ab976168`

Each supplied checkpoint was verified identical to its repository `main` before this record was created.

## Defined reference job

Expected project truth:

- one 60 in workpiece;
- two 16 in members;
- parallel face-miter ends;
- three modeled saw cuts at a nonzero reference angle;
- one centered `SPOT_ON_LOCATION` operation per part;
- spot location 8 in along each 16 in part;
- fixed declared 3/16 in spot tool;
- no generic finished-hole depth claim;
- no automatic 72→60 preparation operation;
- no Store-selected SKU length inserted into project geometry;
- no physical execution or allocation authority.

## Required capability outcomes

With the remaining demand complete:

- 30° → `SUPPORTABLE`;
- 45° → `SUPPORTABLE`;
- 46° → `REFUSED` by Store, not malformed at the application boundary;
- missing required spot location → `UNRESOLVED` with `SPOT_LOCATION_REQUIRED` retained in the concise response consumed by the application;
- no spot requested → no spot operation and no spot charge.

At the exact Store checkpoint above, the complete 30° reference request is expected to return a modeled value of **$54.82**. This is acceptance evidence for this checkpoint, not an application constant.

## Sequence arithmetic

For a 60 in workpiece, two 16 in parts, and three 0.125 in kerfs:

`60 - 16 - 0.125 - 16 - 0.125 - 0.125 = 27.625 in`

Expected retained remainder: **27.625 in**.

The software retained-control rule must be checked separately. Passing that software rule is not evidence of physical-machine validation.

## Evidence rule

If observed evidence contradicts any expectation above, report the discrepancy. Do not change this record to make the candidate pass.

Acceptance evidence must come from:
- the exact pinned Store source;
- the real System adapter;
- the actual promoted application structure;
- captured definition/result/revision identity;
- before/after and bounded fault-detection checks.

Mocked responses, source-string searches, build success, screenshots, and newly-written implementation-agreement tests are supplemental only.
