# D-001 Five-Tool Reference 0.1

**Status:** candidate dimensional-machine reference — not current commissioned capability  
**System branch:** `build/d001-five-tool-0.1`  
**Store candidate:** `GeorgePlattDemo/scan-to-build-store` `0afe6eab5dc3a09351b5ad374f3d41642a6ee403`  
**Current accepted app Store pin remains separate until promotion/testing.**  
**Safety invariant:** **NO BLOOD ON WOOD**

## 1. Decision

D-001 is treated here as a **bounded servo-referenced dimensional machining cell**, not merely a cutoff saw and not a universal CNC.

The machine wall is:

- two fixed saw functions; plus
- five operator-configured, homed, zeroed and verified machining tools.

Tool changes are setup/changeover events. They are not per-job improvisation and do not require an automatic tool changer.

A job may use only the declared machine configuration.

## 2. Reference layout

```text
                         BASE CENTERLINE
                               |
                    -3 in      |      +3 in
                      |        |        |
SAW-L        R1        |        |        |       R2        SAW-R
  |           |        |        |        |        |           |
--+-----------+--------+--------+--------+--------+-----------+-- fence / table datum
              <--------------- board X ----------------------->

                      T1                 T2
              horizontal router    transverse router
              vertical + in/out    across-stock + depth

                                                T3 end router

                         T4 vertical 3/16 pilot drill
                         T5 horizontal 3/16 pilot drill
```

The `-3 in` and `+3 in` center-tool offsets are **REFERENCE_PACKAGING_ASSUMPTION**, not final machine dimensions.

They exist to keep the two orthogonal router functions physically distinct while component selection is open. Final spacing must follow actual spindle bodies, bearings/rails, travel, cutter projection, dust collection, guarding, roller clearance and service access.

## 3. Fixed saw functions

`SAW-L` and `SAW-R` remain fixed machine functions.

They may eventually satisfy:

- square cleanup / finished end;
- bounded single-plane miter where a numeric angle envelope is separately published and tested.

`MITER_LIMITED` is not enough by itself. Until the angle range and datum convention are explicit, a non-zero requested miter stays an unresolved capability request.

## 4. T1 — horizontal center router

**Reference position:** 3 in left of base centerline.  
**Orientation:** horizontal.  
**Motion concept:** controlled up/down position plus in/out engagement while the board remains registered and servo-positioned in X.

Intended feature family:

- bounded edge/corner notch/removal.

The useful relationship is that board X can supply longitudinal motion while T1 addresses the side/edge from a fixed orthogonal orientation.

The Store currently retains `EDGE_NOTCH` demand but does not return support because the numeric T1 travel/depth envelope has not yet been published.

That is deliberate. Component geometry should determine those limits rather than a chat number.

## 5. T2 — transverse router from below

**Reference position:** 3 in right of base centerline.  
**Orientation:** perpendicular to the fence / broad-face machining relationship.  
**Motion concept:** across-stock traverse plus controlled cutting depth.

This is the first newly useful reference capability because existing D-001 Stage-2 numbers already give a bounded starting envelope.

First supported family:

```text
DADO / TRANSVERSE_GROOVE
x from finished end
width
controlled depth
extent = FULL_WIDTH
```

Conservative V0 Store limits are inherited from the already-published Stage-2 mill reference:

- stock width <= 12 in;
- mill stock thickness <= 1.5 in;
- transverse tool travel reference = 14 in;
- dado/groove width <= 1.0 in;
- V0 dado/groove depth <= 0.375 in.

Those are REFERENCE Stage-2 values, not measured machine capacity.

A shelf dado is the clean proof:

```text
board X -> feature location
T2 across-stock motion -> dado extent
T2 depth -> dado depth
```

No user-visible station coordinate is required.

## 6. T3 — end router

**Location:** end station.  
**Role:** precision end treatment/profile using the already-referenced stock relationship.  
**General plunge axis:** not assumed.

The Store recognizes `ROUTED_END` as demand but keeps it unresolved until the cutter/orientation/working envelope is defined from plausible components.

This lets the machine later have more than one process route to an end requirement without encoding the false rule that a router is always more accurate than a saw.

## 7. T4 / T5 — fixed pilot drills

The drills are deliberately narrow.

**T4:** vertical face pilot.  
**T5:** horizontal edge pilot.  
**Diameter:** exactly `3/16 in` (`0.1875 in`).

The user does not choose hole size.

The configurator may ask only for location/orientation. The fixed pilot exists to make a later manual or assembly operation easier, not to become a general boring center.

If another diameter is requested, D-001 refuses it. That refusal is demand data.

The starter depth is a machine-configuration value and remains unmeasured/unpublished in this candidate. It is not exposed as a user choice.

## 8. Stable wall / expressive feature vocabulary

The user should see features, not tool slots.

Candidate feature vocabulary:

- square end;
- angled end, single plane;
- full-width shelf dado / transverse groove;
- edge notch;
- routed end;
- 3/16 face pilot;
- 3/16 edge pilot.

The machine wall stays finite even when combinations become useful.

A part can contain multiple bounded features without becoming free-form CNC programming.

## 9. Capability-gap data

A refusal or unresolved result is evidence about demand.

Retain at least:

- requested feature family;
- material/SKU or material class;
- part-relative requested dimensions;
- current D-001 configuration/capability identity;
- exact refusal/unresolved reason;
- later recurrence count and alternate fulfillment where known.

Repeated demand can justify a component/cutter/setup experiment. It never silently widens the active capability envelope.

## 10. Open-source / inspectable controls candidate

The existing Atlas and S-001 work already establish the correct separation:

```text
part requirement
    -> Store machine-neutral result
    -> machine-site lowering
    -> local controller state
    -> drives / tools
```

Candidate research stack, not a commissioned BOM:

- commodity x86 PC;
- LinuxCNC 2.9 stable line / `linuxcnc-uspace` with Preempt-RT for real hardware;
- Mesa HostMot2 Ethernet hardware as a candidate motion/I/O family;
- closed-loop servo for board X and any axes that require position control;
- VFD or dedicated motor controls for router/saw spindle classes as appropriate;
- pneumatic or servo deploy functions where the mechanism earns that choice;
- local operator controls and local Cycle Start;
- independent engineered safety chain.

Official LinuxCNC references checked 2026-09-12:

- https://linuxcnc.org/documents/ — current release shown as 2.9.10; 2.9 is the current stable line;
- https://linuxcnc.org/downloads/ — `linuxcnc-uspace` supports Preempt-RT and is the hardware-control path;
- LinuxCNC `hm2_eth` documentation lists Mesa Ethernet HostMot2 boards including 7I96S.

**Do not equate five tools with five axes.**

Before selecting interface hardware, count:

- board-X axis;
- T1 position/deploy axes;
- T2 traverse/depth axes;
- any motorized saw-angle axes;
- T3 actuation;
- drill actuation;
- spindle/VFD I/O;
- home/reference sensors;
- board restraint / position-valid inputs;
- operator and mode I/O.

One Mesa card is not assumed sufficient merely because it was useful in the S-001 reference stack.

## 11. Off-the-shelf function classes

The component classes are ordinary industrial practice even though D-001 is not a copy of an OEM machine.

Official manufacturer existence references checked 2026-09-12:

- Hiteco: https://www.hiteco.net/en_US/products — MTC/ATC electrospindles, aggregate units, boring units and other machine-tool components for wood processing;
- Hiteco boring units: https://www.hiteco.net/en/products/boring-unit.c8411 — configurable boring-unit families;
- SCM Morbidelli Z100: https://www.scmgroup.com/en_US/scmwood/products/boring-machines.c880/boring-solutions.20644/morbidelli-z100.561 — published vertical and horizontal drilling spindle functions plus electrospindle capability in commercial woodworking machinery.

These sources establish plausibility of component/function classes only.

They do not establish:

- D-001 component fit;
- D-001 cost;
- OEM endorsement;
- installed hardware;
- safety;
- commissioned performance.

## 12. Atlas relationship

Atlas Parts 4–6 remain **not adopted** field survey/donor material.

Useful donor lessons retained here:

- job carries part truth; machine carries cell truth;
- Store does not emit machine coordinates;
- app/Store do not emit G-code;
- local `POSITION_VALID` matters;
- Cycle Start stays local;
- LinuxCNC/Mesa is a candidate open middle, not an app feature;
- the first machine is a bounded capability family, not a universal CNC.

Ownership of this candidate lives in the current machine engineering/capability-bridge path, not in Atlas.

## 13. Patent alignment

Before promotion, apply `docs/patents/PATENT-ALIGNMENT-GATE.md` against the issued PDFs.

At minimum separate:

- support surface/frame and fence/reference;
- restraint/manipulating roller(s);
- stock X motion;
- sawing relationships;
- additional tooling-way/router/drill relationships;
- current five-tool setup rule and capability-gap capture as later engineering/project extensions where appropriate.

Patent correspondence is not installed capability, safety evidence or a legal conclusion.

## 14. Safety boundary

Adding heads increases the hazard inventory.

Later engineering must resolve guarding, cutter containment, dust collection, stock restraint under side load, safe retract states, tool/roller interference, unexpected motion, restart prevention, electrical isolation, local modes and the E-stop/safety chain.

LinuxCNC, Mesa, Store and the application are process/control layers. They are not the safety case.

**NO BLOOD ON WOOD.**
