# Dimensional Machine Engineering

This folder holds the detailed current dimensional-machine build record.

Start with `../../staging/DIMENSIONAL-MACHINE-STAGING-0.1.md` for the present physical truth: the current local control case is still manual and no Scan-to-Build dimensional machine is commissioned.

## Current candidate workbench

`D001-FIVE-TOOL-REFERENCE-0.1.md` is the current candidate expansion under review/build on branch `build/d001-five-tool-0.1`.

It models:

- two fixed saw functions;
- five configured/homed machining tools;
- two orthogonal center routers with provisional `-3 in / +3 in` packaging offsets;
- one end router;
- one vertical fixed `3/16 in` pilot drill;
- one horizontal fixed `3/16 in` pilot drill;
- capability-gap observations when demand crosses the published wall.

The file is **REFERENCE / NOT_CLAIMED**. It does not change the current physical-machine status merely by existing.

The existing accepted `board.square.v1` application path remains the regression/control slice while this broader candidate is tested.

## Detailed build document

A later physical build document should still answer the engineering questions below before installed capability is claimed:

1. current physical machine inventory;
2. selected next bounded physical capability;
3. function → mechanism map;
4. material support/reference/workholding;
5. saw/mill/drill/router stations actually required;
6. actuation candidates;
7. sensing/reference candidates;
8. open/off-the-shelf controller candidates;
9. local I/O and lowering boundary;
10. safety functions and professional review dependencies;
11. candidate BOM with status, source and reason;
12. patent feature correspondence;
13. bench/dry-run/powered test sequence;
14. measured results;
15. refusal/failure cases;
16. Store-visible capability declaration, if earned;
17. unresolved register.

Classify important statements using `../DETAIL-CLASSIFICATION.md`.

Do not turn candidate components into installed facts.
