# STB-ATLAS-06-IRON-0.1

Part 6 of the Scan-to-Build destination atlas.  
Date: 2026-09-09  
Branch: `GeorgePlattDemo/grok-file` / `wip/app-build-0.1-stabilization`  
Status: **not adopted**. Field survey only.

## 1. Question

Once a capability rung is named, what off-the-shelf controllers, drives, I/O, workholding, and safety parts actually exist to hold that rung — without turning this atlas into a commissioned BOM or hiding safety inside the application?

## 2. Destination role

Part 5 named rungs. This page is the iron that could someday hold Rung 1, not a purchase order.

Pinned meaning already in force:

- App §18 / §20: controls, servos, interlocks, and commissioned safety are a separate phase. They are not an application feature.
- Cell spine: jog / auto / network stay separate. `POSITION_VALID` is local. Cycle Start is local.
- Stabilization R-04: workholding, sensing, travels, and interlocks remain unresolved.
- Atlas Part 4: LinuxCNC / Mesa / EtherCAT are candidates for an intro cell that is not a Homag line. FluidNC is a lab shelf.

Part 6 does not size motors, write a wiring diagram, or claim a Performance Level.

## 3. Three controller shelves

The field still sorts into three practical stacks.

| Shelf | What it is | Holds which rung, at most | Not this |
| --- | --- | --- | --- |
| A. FluidNC / GRBL on ESP32 | Cheap step/dir firmware, web UI | Lab axis, proof of a single motion | Tandem lumber cell |
| B. LinuxCNC + Mesa FPGA | Real-time PC, G-code, HAL, probe, ladder | Intro D-001 candidate | Not an OEM woodWOP cell |
| C. EtherCAT PLC / industrial CNC | Beckhoff / OEM bus to servo drives | Production multi-axis, later rungs | Not required to *name* Rung 1 |

Mesa’s current Ethernet step/dir card (7i96S class) is the common open middle: a handful of axes, isolated I/O, spindle analog, expansion. Analog-servo Mesa cards exist when the drives want ±10 V instead of pulses. EtherCAT skips the pulse card and talks to the drive over copper.

Pick a shelf only after a rung and a commissioned machine exist. This page does not pick.

## 4. Drives and actuators

| Class | Field use | Intro-cell reading |
| --- | --- | --- |
| Open-loop stepper | Hobby routers | Silent lost steps. Not a Store cell |
| Closed-loop stepper | Cost-fighter with stall alarm | Possible on early proto axes. Still not a safety argument |
| AC servo, pulse or analog | Production following error | Default for a commissioned Rung 1 if D-001 moves real sticks |
| AC servo, EtherCAT | Multi-axis plant | Later shelf C |
| Induction motor + VFD | Saws and routers as spindles | Saw / spindle class, not an axis substitute |

Closed-loop stepper is not “a servo.” It recovers or alarms missed steps. A true servo runs inner current and velocity loops. Unattended wood against a fence wants the latter, or an honest proto label on the former.

Saws are not FluidNC spindles. A cutoff or arbor motor is a VFD or a fixed saw motor with its own starter, interlock, and dust path.

## 5. Workholding and station iron

D-001 already named the mechanical cast: table, fixed fence, manipulating rollers, idlers, clamps, ways, tool heads. Part 6 only says how the field *actuates* that cast.

Off-the-shelf families, not a kit:

- pneumatic clamps and valves, with pressure proven before motion
- roller / belt transfer with enable tied to mode
- fence as a hard datum, not a rendered line
- proximity or photoeyes as *candidates* for presence — sensing remains R-04
- label printer as an output, not as proof of a good part

OEM wood cells (Part 4) already encode clamp beams in the machine file. An intro D-001 that uses LinuxCNC must put clamp and transfer I/O in HAL / ladder, not in the app.

If the board can walk, `POSITION_VALID` dies. No drive brand changes that.

## 6. Safety is not a HAL pin with a pretty name

The field’s ordinary stop chain for a single cell:

- dual-channel E-stop buttons
- safety relay with monitored reset and EDM on the contactors
- Category / PL taken from a risk assessment (ISO 13849 / IEC 60204), not from a blog
- guards and mode selector that actually change what motion is legal
- drive enables dropped by the safety path, not only by software

A Mesa output is not that chain. LinuxCNC can *see* the relay’s status. It must not *be* the relay.

This atlas does not choose Category 3 versus 4. That is commissioning and a competent safety assessment. “NO BLOOD ON WOOD” stays the invariant. It is not a wiring method.

## 7. Operator and network split

Field operator stations still look like: E-stop, mode, start / hold, jog, overrides.

That maps to the cell-spine split:

- jog is local
- auto Cycle Start is local
- network may present status and deliver a lowered program
- loss of network must not move control into the app

Part 4 already said the app does not jog. Part 6 only adds: the physical buttons and the safety relay are why that rule is cheaper to keep than to “fix in software.”

## 8. What may be borrowed later

- LinuxCNC + Mesa as the open intro-cell candidate
- EtherCAT servos if the commissioned cell is shelf C
- VFD + arbor / spindle practice for saws
- dual-channel E-stop relays as the default stop architecture to evaluate
- pneumatic clamp catalogs as workholding candidates

## 9. What must not be borrowed

- a hobby BOM treated as D-001
- FluidNC as the Store controller
- safety PLC logic invented in this atlas
- app-side enable coils
- “closed-loop stepper” as a completed risk assessment
- any part number as adopted Cell truth

## 10. Distance from the pinned envelope

| Need | Current field | Current Scan-to-Build | Gap |
| --- | --- | --- | --- |
| Open intro controller | LinuxCNC + Mesa is real and cheap | Named as later phase | Commissioning, not app work |
| Production drives | AC servo / EtherCAT | Unresolved | Leave unresolved |
| Workholding | Pneumatics + fence + OEM clamps | D-001 describes, does not commission | R-04 |
| Safety chain | Off-the-shelf dual-channel relays | Invariant only | Assessment later |
| App motion | Every vendor wants a remote UI | Explicitly forbidden | Keep forbidden |

Part 6 does not block application planning. It does block buying a kit “because the atlas listed Mesa.”

## 11. Foreshadow of Part 7

Iron in one room is still atoms in one room. The last page asks who already moves the *job* to the nearest capable cell so boards travel less than ideas.

## 12. Stop

No BOM.  
No motor sizing.  
No safety category claimed.  
No REF, Store, or Cell file changed.  
Production remains closed.

Next atlas page, when requested: **Part 7 — Atoms vs bits**.
