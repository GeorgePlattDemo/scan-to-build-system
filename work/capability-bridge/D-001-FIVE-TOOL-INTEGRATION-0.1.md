# D-001 Five-Tool Integration 0.1

**Status:** candidate integration; not promoted into the accepted app HTTP/UI path  
**System branch:** `build/d001-five-tool-0.1`  
**Store candidate branch:** `build/d001-five-tool-0.1`  
**Store candidate commit:** `0afe6eab5dc3a09351b5ad374f3d41642a6ee403`

This is the candidate zipper for the broader dimensional-machine wall.

## Chain

```text
USER FEATURE REQUIREMENT
        ↓
app candidate contract
`apps/stb/shared/d001-featured-board.mjs`
        ↓
part-relative Store spec
        ↓
Store candidate
`d001-five-tool.mjs`
        ↓
SUPPORTABLE / REFUSED / UNRESOLVED
+ capability-gap reasons
        ↓
D-001 five-tool reference machine
`work/machines/engineering/dimensional/D001-FIVE-TOOL-REFERENCE-0.1.md`
```

The current accepted `board.square.v1` path remains unchanged and remains the regression control.

## First candidate behavior

| Feature | App can describe | Store candidate result |
| --- | --- | --- |
| square end / base cut-to-length | yes, existing accepted slice | existing support path |
| full-width dado / transverse groove | yes | SUPPORTABLE inside inherited Stage-2 reference limits |
| 3/16 face pilot | yes | SUPPORTABLE as fixed-diameter reference pilot |
| 3/16 edge pilot | yes | SUPPORTABLE as fixed-diameter reference pilot |
| non-zero single-plane miter | yes | UNRESOLVED until numeric miter envelope is published |
| center horizontal-router edge notch | yes | UNRESOLVED until T1 numeric envelope is published |
| routed end | yes | UNRESOLVED until T3 numeric envelope is published |

That distinction is intentional: **the application may retain useful demand before the Store is entitled to call it supportable.**

## App boundary

The app contract accepts only part-relative feature information.

It rejects machine-local fields such as:

- G-code;
- controller identity;
- tool number;
- station coordinate;
- feed rate;
- spindle RPM;
- Cycle Start.

The app deliberately does **not** know the Store's dado depth/width ceiling. A 0.5 in dado can remain valid demand in the app and be refused by the Store candidate because the V0 Store depth ceiling is 0.375 in.

That is the wall working in the right layer.

## Store boundary

The Store candidate owns the five-tool capability declaration and its reasons.

It returns neutral operations only. New five-tool process Q remains unresolved; budgetary material may still be reported where grounded.

The Store records capability gaps rather than silently widening itself.

## Machine boundary

The reference machine owns:

- tool identity/configuration;
- home/zero/reference;
- final center-tool spacing;
- local offsets;
- `POSITION_VALID`;
- lowering/postprocessing;
- I/O and drives;
- local start/jog/modes;
- safety implementation.

The provisional T1/T2 offsets of `-3 in` / `+3 in` are packaging assumptions only.

## Candidate verification

`apps/stb/test/unit/d001-featured-board.test.mjs` checks the app-side wall.

`apps/stb/test/store/d001-five-tool-candidate.test.mjs` is an explicit cross-repository candidate zipper. It requires:

```text
STB_D001_STORE_CANDIDATE_ROOT=<clean checkout at exactly 0afe6eab...>
```

and checks:

- 0.375 in shelf dado: app valid → Store SUPPORTABLE;
- 0.5 in shelf dado: app valid → Store REFUSED;
- 30° miter: app valid → Store UNRESOLVED;
- 3/16 face pilot: app valid → Store SUPPORTABLE;
- exact Store candidate pin and clean working tree.

The test is skipped when that explicit candidate checkout is not supplied. It does not weaken or bypass the accepted app `STORE_PIN`.

## Promotion rule

Do **not** change the accepted application `STORE_PIN` merely because this Store candidate exists.

Promotion requires a later deliberate pass that decides:

1. whether the five-tool candidate semantics are accepted;
2. whether the separate sheet/tab Store candidate must be merged/reconciled first;
3. the final Store commit that contains both accepted bodies of work;
4. full Store + app regression results against that exact commit;
5. whether/when the browser configurator exposes the feature controls.

Until then this branch is a workbench candidate, not current production truth.
