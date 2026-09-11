# STB-ATLAS-04-NEUTRAL-OPS-TO-MACHINE-0.1

Part 4 of the Scan-to-Build destination atlas.  
Date: 2026-09-09  
Branch: `GeorgePlattDemo/grok-file` / `wip/app-build-0.1-stabilization`  
Status: **not adopted**. Field survey only.

## 1. Question

After Store acceptance, how does a machine-neutral operation become motion that references a real board and a real station — and which off-the-shelf CAM / post / controller pieces exist — without the application or the Store becoming the real-time machine?

## 2. Destination role

Part 3 stopped at the Store membrane: pick list plus part-relative neutral ops.

This page is the drop into iron.

Pinned meaning already in force:

- App §18: application → Store → machine-neutral job → commissioned cell lowering → local program → local controller → drives.
- Cell spine: job carries part truth; machine carries cell truth. `POSITION_VALID` is local. Jog / auto / network stay separate.
- Store Job 001: Store does not emit machine coordinates.
- App §13: the app shall not generate live-motion commands or invoke Cycle Start.
- Production remains closed.

Part 4 does not choose a controller or write G-code.

## 3. The field already splits four files

Shops that actually cut wood do not send one file from the phone to the spindle. They pass through layers, even when one vendor suite hides them.

| Layer | What it contains | Who owns it in the field | Who must own it here |
| --- | --- | --- | --- |
| Part / feature job | cut this length, drill these holes, from this edge | CAD/CAM or cabinet suite | Store (machine-neutral, part-relative) |
| Machine program | same job after a post, in *this* builder’s language | Post + OEM software | Cell lowering |
| Controller state | work offset, tool table, interlocks, mode | LinuxCNC / Fanuc / OEM CNC | Local controller |
| Motion | step/dir or fieldbus to motors | Drives | Drives |

The public demo collapsed those four. That collapse stays refused.

## 4. CAM is not the controller

### 4.1 What CAM actually emits

FreeCAD CAM, Fusion Manufacture, VCarve, and wood plugins such as SWOOD compute a toolpath: where a cutter should go relative to a programmed part origin.

That path is still not machine language.

A **post processor** then writes a file the *named controller* will accept. Same path, different posts:

- Fanuc / Haas / Siemens / Heidenhain dialects
- GRBL / FluidNC / LinuxCNC dialects
- wood OEM files instead of ISO G-code

Field fact: there is no universal post. Wrong post is how machines crash. Canned cycles, tool-change, spindle words, arcs, and headers all diverge.

### 4.2 What wood plants actually load

Panel and point-to-point cells rarely take Fusion G-code as the shop-floor object.

Named OEM program worlds:

- HOMAG woodWOP — `.mpr` / `.mprx` / `.mprxe`. Macros on a workpiece: drill, route, saw, clamp visualization.
- Biesse bSolid / BiesseWorks — CIX plus worklists. Includes clamp-beam positions, not just cutter XYZ.
- SCM Maestro / Xilog, Felder TPA `.tcn`, HOLZ-HER NC Hops.

SWOOD and similar posts exist *because* each of those is a different language. A DXF is only the feature. The OEM file adds tool, feed, clamp, and origin habits of that cell.

Cabcode-class tools state the distinction cleanly: DXF has the hole. An MPR already chose the 35 mm bit, the feed, and the offset.

That is lowering. It is not Store translation, and it is not an app export.

### 4.3 Open controllers

For a first commissioned cell that is not a HOMAG line:

- **LinuxCNC** — real-time PC control. Reads G-code. Owns G54–G59.3 work offsets, tool table, probe (`G38`), ClassicLadder interlocks. Not a CAM program.
- **FluidNC / GRBL** — small-router firmware. Fine for a lab axis. Not a tandem lumber cell.
- **Mach / UCCNC** — Windows shop controllers. Same rule: they run a posted file. They do not invent stock.

CAM in, controller runs. Never the reverse, and never from the phone.

## 5. Referencing the wood

“Move it to the saw” is two problems: where is the board, and which station is live.

### 5.1 How shops set origin today

- Touch off: jog to the fence or the corner, declare that point G54 X0 Y0.
- Probe / edge finder / touch plate: `G38` toward the face, write the work offset.
- Fixture offset tables: pallet or clamp station already measured.
- OEM macros: woodWOP / bSolid show the workpiece and the clamps in the same program.

LinuxCNC documents the split the cell spine already named:

- machine coordinates (where the iron is)
- work coordinates (where this board’s origin is)
- tool length
- probe result

A program that assumes the board is at X0 without a local reference is a crash.

### 5.2 Scan-to-Build mapping

| Field act | Cell-spine analog | Not this |
| --- | --- | --- |
| Home / machine reference | machine datum | app origin |
| Fence / table / clamp contact | datums A/B/C, `POSITION_VALID` | WorkPacket |
| Touch off / probe | local invalidate / re-validate | Store acceptance |
| Posted program in auto | local Cycle Start | network command |
| Jog | local jog mode | remote UI jog |

Store may say: crosscut 43.875 in from end A on 1×6 stock.  
The cell must still: identify that stick, register it to the fence, prove `POSITION_VALID`, then run the lowered program.

If the board moves, validity dies. The app does not get a vote.

## 6. What may be borrowed later

- CAM tools to *preview* a synthetic path in simulation, labeled simulation.
- A post only after a commissioned machine and controller are declared.
- LinuxCNC / Mesa / EtherCAT as a later Part 6 candidate for the intro cell.
- OEM macro files only if that OEM cell is the commissioned machine.
- Probe and work-offset practice as controls work, not as app features.

## 7. What must not be borrowed

- App- or Store-emitted G-code, MPR, or CIX
- Fusion / FreeCAD CAM as the Store translator
- “one post to rule all machines”
- public-demo removal of the postprocessor
- remote Cycle Start
- treating a successful sim path as `physicalFabricationEligible`
- using G54 numbers as project dimensions

## 8. Distance from the pinned envelope

| Need | Current field | Current Scan-to-Build | Gap |
| --- | --- | --- | --- |
| Neutral job ≠ machine program | Posts and OEM macros exist because they differ | Job 001 + Cell lowering already say this | Commission a cell; don’t invent a post now |
| Reference the board | Touch off, probe, fence, clamp macros | Datums + `POSITION_VALID` | Open engineering (sensing, travel). Keep open |
| Move to station | Transfer, rollers, clamps, beams in OEM files | D-001 rollers / clamps described, not commissioned | Envelope + iron parts |
| Open controller | LinuxCNC is real | Later controls phase | Part 6 |
| Wood OEM stack | woodWOP / bSolid / Maestro | Not assumed for intro cell | Don’t pretend D-001 is a Weeke |

Part 4 does not block application planning. It does block any path that writes motion from the app.

## 9. Foreshadow of Part 5

Before iron is purchased, the destination needs an envelope ladder: intro cell versus later cell. Square cut and drill first; contour and compound later. Geometry that does not fit stops.

## 10. Stop

No post chosen.  
No G-code written.  
No controller specified.  
No REF, Store, or Cell file changed.  
Production remains closed.

Next atlas page, when requested: **Part 5 — Envelope ladder**.
