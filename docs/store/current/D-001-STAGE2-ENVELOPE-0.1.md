# D-001 Stage-2 MachineEnvelope — 0.2

Declared reference capability. **Not commissioned. Not Cycle Start. Not generic CNC.**

Every numeric limit is a Stage-2 fixture assumption. Purpose: `fit → operation → modeled minutes → Q`. These numbers do not pre-commit Stage-3 physical design.

Machine-readable copy: `d001-stage2-envelope.mjs` (`D001_STAGE2_ENVELOPE`).

CUT-001 remains a valid regression path. Later work must not break its information/authority boundary. Later work is not required to be a 2×4 square cut.

---

## What this machine is (memory vs fixture)

Three pictures exist. Do not smash them together.

**Patent / cell spine correspondence** (`STB-CELL-0.1`, U.S. 10,768,609 FIG. 5): table and fence on a central base; **three** commonly-controlled manipulating rollers from above; idlers in the table; **a sawing station at each end** (chop, miter-capable); clamp rollers to the fence; vertical and horizontal ways that can carry drill/router heads.

**Your working memory:** radial-arm on one end, chop/miter on the other, two symmetrical rotors in the center, routers not placed.

**This Stage-2 fixture:** two named rollers and two named mill functions, so Store can refuse and price without inventing Stage-3 iron.

```
Y = 0  fence
Z = 0  table
X     along the fence, infeed → outfeed

X=  0   SAW-L     chop / MITER_LIMITED
X= 24   R1        manipulating roller (above)
X= 36   MILL_LONG between the rollers, below/at the work
                  Y travel 0→14 in from fence
                  Z micro-adjust for groove / rabbet / backing
X= 48   R2        manipulating roller (above)
X= 72   SAW-R     square chop
X= -6   MILL_END  outside roller interference

Y tool travel          14.000 in   (spindle reach)
max stock width        12.000 in   (what D-001 will accept)
FEED_X_MAX_LOADED      480 in/min  (index, already in the cycle model)
MILL_CUTTING_FEED       48 in/min
base length               72 in
max parent w/o declared   96 in
  external support
min controlled length     24 in    (R1–R2 spacing)
```

14 in reach is not a 14 in board. Two inches stay unclaimed for tool body, guard, and fence relationship that Stage 3 must actually design.

**Named unresolved, not designed here:** third roller; whether SAW-R is a radial arm; a third vertical-way router/drill; numeric miter range; drill diameter/location envelope; external infeed/outfeed stands; one-roller short-stock mode.

Off-the-shelf names on a drawing are **CANDIDATE labels only** until Stage 3 selects them: commercial chop-saw head, commercial router spindle, pneumatic roller. Do not freeze SKUs here.

---

## Store rule

Store Zero may offer many SKUs. D-001 accepts only the subset that fits this envelope **and** lists the required operation.

Geometry fit is necessary, not sufficient.

```
SKU offered
  → actual W ≤ 12.000
  → thickness in the op family
  → parent length ≤ 96 unless external support is later declared
  → kept length ≥ 24 if two-roller control is required
  → feature Y ≤ 14
  → required op on the offering
  → SUPPORTABLE
else REFUSED with a named reason
```

A pretty Q is not computed as a success path for a refused envelope.

---

## Operations (declared subset)

| Op | Declared | Refuse / unresolved |
|---|---|---|
| `CROSSCUT` | square cleanup + kept length | upstroke; compound miter |
| `MITER_LIMITED` | single-plane limited miter | numeric angle range unresolved |
| `DRILL` | bounded holes | diameter/location envelope unresolved |
| `DADO` / `GROOVE` / `RABBET` | only if the offering lists them | not implied by mill existence |
| `MILL_LONGITUDINAL_PROFILE` | taper; groove/dado along length | any-path 2-axis; carving |
| `MILL_END_PROFILE` | end/foot taper; bounded notch/chamfer | beyond 8 in from the worked end |

Passes for a mill feature:

`passes = ceil(required_total_depth / 0.375)`

Exclusion concept: mill path must not claim the volume of R1, R2, SAW-L, SAW-R. Coordinates inside those names are not free.

---

## Picnic-leg economic proof

Unchanged: `STB-ZERO-SPF-2X4-96-001`, kept 28 in (≥ 24), longitudinal taper, optional end profile. Square Q vs tapered Q must differ because mill minutes were added.

---

## Stage-3 not designed here

Physical support, restraint, workholding, guarding, access control, safety-rated controls, interlocks, stopping/restart, commissioning, measured feeds, PL/SIL, real spindle selection.