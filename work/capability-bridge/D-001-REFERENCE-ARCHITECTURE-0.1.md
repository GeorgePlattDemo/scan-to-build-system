# D-001 Reference Architecture 0.1

**Status:** REFERENCE architecture for an already-callable Store offering  
**Store offering:** `DIM-SQUARE-LENGTH-V1`  
**App definition:** `board.square.v1`  
**Stage-2 envelope:** `D001-STAGE2-ENVELOPE-0.2` at store pin ancestor `b40cdc60`; still valid under `49d22ce4`  
**Physical status:** NOT CLAIMED

This backs the Board envelope with a machine that could be built and tested. It does not commission that machine.

## 1. App definition

User requires one finished board:

- parent is a listed dimensional offering, 2×4 class first;
- finished kept length with units, 24 in through 60 in inclusive;
- quantity 1 ea;
- operation `CROSSCUT`;
- square ends.

The app does not send kerf, station coordinates, or roller velocity.

## 2. Store envelope

Already published. Store may `SUPPORTABLE` only when:

- form is dimensional, not sheet;
- offering lists `CROSSCUT`;
- kept length is inside 24–60 in;
- stock width / thickness / parent length fit the Stage-2 fixture numbers;
- cell family includes `D-001`.

Refuse sheet, missing units, length outside the range, unpublished miter as the Board job.

Neutral packet:

```text
LOAD → SEAT → CLEANUP → INDEX → CROSSCUT → LABEL
```

Budgetary Q may use modeled time. That time is not measured.

## 3. Reference kinematic contract

What must be true for the envelope to be mechanically real:

| Name | Role |
| --- | --- |
| Fence | Y = 0 reference. Stock remains registered to it while moving in X. |
| Table / support plane | Z = 0 support. Stock does not lift off during index or cut. |
| X | Longitudinal feed along the fence. Implemented by servo-controlled manipulating roller(s). |
| SAW-L | Infeed-end station. Cleanup / origin face, or limited chop. Not a drawing axis. |
| SAW-R | Outfeed-end station. Square finishing crosscut. Not a drawing axis. |
| R1, R2 | Named manipulating rollers. Stage-2 names two. Patent FIG. 5 names three. Third remains unresolved. |

Motion class for this job: **index, then station cycle**. Not two-axis contour interpolation.

Sequence that must physically occur:

1. Load parent on table against fence.  
2. Seat: rollers descend / engage so stock cannot walk off Y = 0.  
3. Cleanup cut establishes the origin face from the commercial end.  
4. Position-valid: origin face is known relative to the finishing blade.  
5. Index X until the finishing-blade relationship equals kept length (kerf is machine-local).  
6. SAW-R cycles through and returns.  
7. Release. Label.

Lost seat, lost encoder, or unexpected motion ⇒ stop. No remote Cycle Start.

Stage-2 documentary spans (fixture, not commissioned iron): R1 at 24 in, R2 at 48 in, SAW-R at 72 in on a 72 in base; min controlled length 24 in because two-roller control is assumed.

## 4. Candidate implementation stack

Classes only. No frozen vendor SKU. No controller code.

| Function | Candidate class | Why plausible | Not implied |
| --- | --- | --- | --- |
| Frame / table / fence | Welded or bolted machine table with a straight fenceable edge | Ordinary woodworking machinery practice | Production cell |
| Manipulating rollers | Driven urethane or knurled feed rollers on a powered raise/lower, two stations along X | Patent: servo-controlled manipulating roller driving stock along the fence; Stage-2 R1/R2 | Third roller installed |
| Roller actuation | Closed-loop rotary servo or stepper-with-encoder plus gearbox | Need repeatable index of kept length | A brand is the invention |
| Raise/lower | Pneumatic or servo-driven yoke/arm so rollers engage after load | Patent: rollers ascend/descend and urge stock to the table | A force number |
| SAW-R | Commercial square chop / upcut saw head, local actuation, guarded | Patent: end sawing station, chopping action under servo control | Miter range published |
| SAW-L | Same class or a simpler cleanup saw | Dual-end disclosure | Both heads must be radial-arm |
| Length feedback | Motor encoder on the feed, and/or a linear encoder / known-pitch roller diameter with slip detection later | Index must be more than “count steps and hope” | Slip compensation is solved |
| Controller class | Local two-or-more-axis motion controller or inspectable open controller that can: home, index a distance, fire a station I/O, e-stop | Digital bridge proof in Machine Build 1 | Cloud control, G-code from the app |
| Cycle Start | Local guarded hold-to-run or equivalent local start | Safety invariant | App/Store start |
| Label | Printed or marked part identity after release | Store/app record already exists | Automated print is commissioned |

Off-the-shelf chop-saw heads and industrial feed rollers exist. That is why this envelope is not fictional. Selecting a head is Stage-3 engineering, not this page.

## 5. Unresolved physical parameters

Do not fill these with chat numbers.

- clamp / roller down-force;
- allowable slip before stop;
- encoder-to-inch calibration on real stock surfaces;
- kerf of the installed blade;
- SAW-L versus SAW-R identity (chop vs radial arm);
- third manipulating roller;
- parent support beyond 96 in;
- dust, guarding geometry, electrical classification;
- measured cycle minutes;
- whether a part shorter than R1–R2 may run on one roller.

## Patent notes

| Contract element | Issued relationship | Grant |
| --- | --- | --- |
| Table + fence + sliding stock | surface/frame supporting dimensional lumber; fence along which the piece can slide | 9,720,401 B2 / 10,768,609 B2 |
| Driven index | “servo-controlled manipulating roller to selectively drive the piece of dimensional lumber along the fence” | both |
| End saws | “sawing stations at each end”; “two sawing stations fixed to the base”; circular saw under servo control; chopping action | both |
| Roller engage | rollers with ability to ascend/descend; urge board toward the table | 10,768,609 B2 FIG. 5 language |

Narrower than the figure: no claimed mill, drill, or miter on this first job.

## Build posture

Machine Build 1 remains: one 2×4-class stick, one digital kept length, one square cut, local start, recorded result. This architecture is the reference that makes that proof about a real machine family rather than a floating Store flag.
