# STB-ATLAS-01-CAPTURE-0.1

Part 1 of the Scan-to-Build destination atlas.  
Date: 2026-09-09  
Branch: `GeorgePlattDemo/grok-file` / `wip/app-build-0.1-stabilization`  
Status: **not adopted**. Field survey only.

## 1. Question

From the moment a person has an idea or stands in a place, what actually exists in the outside world to capture that idea into a form an application can absorb — without treating the capture as fabrication truth?

## 2. Destination role

Capture is the first door. It is not the Store, not CAM, and not the saw.

Pinned meaning already in force:

- App §12: outside evidence and imagery enter through bounded adapters. A successful import is evidence, not fabrication authorization.
- App §13: the application may collect declarations, measurements, and evidence, and must display provenance.
- REF / Store Capture: confirmation is not verification. A file hash is identity, not physical truth.
- Current M1 fixture still requires the exact sheet request. Changed geometry cannot borrow that fixture.

Part 1 only names capture classes and current field tools. It does not select an SDK.

## 3. Capture classes

These are the real doors a user already uses. The app needs both an easy door and a later hard door. They must converge on the same candidate intake/evidence shape before any governed handoff. Atlas terminology does not create a governed `Observation`.

| Class | What the user does | Typical output | Fit for first app | Truth status on entry |
| --- | --- | --- | --- | --- |
| A. Typed / spoken declaration | Types an opening, height, quantity, product class | Scalars + units + who entered them | Primary easy path now | Declaration. Unverified until an owning process says otherwise. |
| B. Handheld measured scalar | Tape, folding rule, or laser distance meter; value written or beamed in | One length / area / volume with instrument identity if known | Primary easy path now | Measured evidence / candidate scalar. Still not automatically verified project truth. |
| C. Photo or sketch | Phone photo, marked-up picture, napkin scan | Image + optional overlay numbers | Needed early as evidence, not as geometry | Evidence. Numbers on a photo are still declarations unless separately sourced. |
| D. Room / object scan | Phone LiDAR, photogrammetry, RoomPlan-class mesh | Mesh, point cloud, inferred floor plan, DXF/PDF | Hard door. Adapter later. | Inferred geometry. Model-inferred candidates stay inferred. |
| E. Existing drawing / model | PDF plan, SVG, DXF, SKP, RVT, contractor takeoff | File + extracted candidates | Hard door. Part 2. | Extracted candidate evidence. Provenance retained. |
| F. Survey-grade capture | Terrestrial laser scanner, total station | Registered point cloud, ±mm drawings | Out of first-app scope | Still evidence until a governed verification path exists. |

Easy stuff should enter through A and B. Complex stuff should be creatable in outside tools and absorbed as C–E. The app must not require a user to own CAD in order to enter an alcove opening.

## 4. What the field actually does in 2026

### 4.1 Easy scalar capture

This is the closest match to User 1 on day one.

- Tape and pencil still dominate remodel work.
- Bluetooth laser measures (Bosch GLM “C” series, Leica DISTO, Stabila LD with Measures II) send a distance into an app instead of forcing retyping.
- Vendor apps (Bosch MeasureOn, Stabila Measures II, Lasernote and similar) attach that distance to a sketch wall or a photo.
- Typical published handheld-laser accuracy is on the order of ±1/16 in over common interior ranges. That is an instrument claim, not a Scan-to-Build verification rule.

Absorbable form: a number, a unit, an instrument or method label, a timestamp, and optional photo context.

Do not absorb: the vendor floor-plan editor as architecture.

### 4.2 Phone LiDAR and room scanners

Useful, noisy, and commercially framed as scan-to-CAD.

Named tools in current use:

- Apple RoomPlan / RoomCapture on LiDAR iPhone Pro and iPad Pro. Standard iPhones do not have the sensor. Apple has said non-LiDAR RoomPlan is theoretically possible and not what you would want.
- Capture / viewing apps: Polycam, Scaniverse, Matterport-class walkthroughs.
- Scan-to-drawing services: Canvas / Twindo, Scanbrix, and similar. User walks the room; a service or pipeline returns DWG / SKP / RVT / PDF.
- Contractor overlays: MagicPlan, Elio-class job apps, insurance ESX exports.

What they actually emit:

- Meshes: OBJ, glTF, USDZ, FBX, STL
- Floor-plan drawings: PDF, PNG, SVG, sometimes layered DXF
- Point clouds on paid tiers: LAS, PLY, XYZ, PTS
- BIM-ish: IFC or RVT from a service, not from a raw phone dump

Accuracy, as published by third parties, not as a Scan-to-Build spec:

- iPhone LiDAR is sold for room-scale scoping. Independent writeups cluster around centimeter-level to 1–2% on typical rooms.
- RoomPlan evaluations report both “good enough to quote” results and large misses. One published walkthrough saw more than 30 cm error on a ~6.5 m wall. Errors accumulate. Glass, mirrors, thin trim, and sun wash the sensor out.
- Professional terrestrial scanners used by scan-to-CAD services advertise around ±2 mm. That is a different instrument class and a different price.

The commercial pattern is important: many products do **not** give the user a trustworthy opening. They give a mesh or a drawing, then a human or a paid desk turns it into CAD. That is the same membrane Scan-to-Build already named. The scan is evidence. The desk is not automatic verification.

### 4.3 Photogrammetry without LiDAR

Polycam and similar still capture from ordinary cameras. Good for shape and storytelling. Worse for fit-critical openings. Treat as Class C/D evidence with a lower method grade than a laser scalar.

### 4.4 Why this matters for an alcove

Store Job 001 and the M1 sheet fixture already disagree on openings (45.500 in vs 46.25 in). A phone scan that is “about 46 inches” cannot choose between them. The first usable capture path is still a labeled opening with units, not a mesh that looks like a room.

## 5. What the app may absorb

Minimum absorbable packet for Part 1, conceptual only — not a schema freeze and not a governed `Observation` contract:

- capture class (A–F)
- raw payload (number, image, file, or scan export)
- units
- method / instrument
- actor
- time
- source file identity / hash if a file
- user-confirmed scalars, separately labeled from inferred scalars
- unresolved flags (missing unit, no instrument, scan inferred, glass present, etc.)

That is enough for the easy door and for a later adapter to park a DXF or OBJ without promoting it. Any future governed handoff must satisfy the owning governed Observation/ObservationSet rules rather than relying on atlas labels.

## 6. What the app must not absorb from this market

- RoomPlan or Polycam as the project model
- a mesh as an opening
- a service-returned DWG as verified as-built
- vendor “95–99% ANSI” marketing as a gate
- scan-to-order shortcuts that skip Store capability
- any implication that a phone can authorize a cut

## 7. Distance from the pinned envelope

| Need | Current field | Current Scan-to-Build | Gap |
| --- | --- | --- | --- |
| Easy opening entry | Forms + laser-to-app are mature | App contract already requires this | Implementation, not discovery |
| Photo as context | Universal | Allowed as evidence | Provenance UI |
| Phone scan | Mature as mesh / pretty plan | Allowed only as inferred evidence | Adapter later; do not block Pass planning |
| Scan as controlling dimension | Not actually solved at phone grade | Explicitly forbidden without verification | Keep forbidden |
| Survey-grade as-built | Exists, slow, expensive | Out of first build | Leave parked |

Part 1 does not block the next application-planning pass. It does block any claim that “the user scans the alcove and the machine cuts.”

## 8. Foreshadow of Part 2

Once capture exists, the question becomes two doors into the same class:

- easy: type or beam the opening, pick a class, move
- hard: bring a DXF, PDF, FreeCAD file, or contractor takeoff and have the app extract candidate values/evidence

Part 2 covers those tools. Part 1 stops here.

## 9. Sources consulted for this page

Field survey only. Not adopted as authority.

- Apple RoomPlan limitation writeups and developer-forum guidance on LiDAR vs non-LiDAR
- Polycam export documentation (mesh, floorplan, point-cloud, DXF tiers)
- MagicPlan export documentation (PDF, DXF without dimensions, IFC/OBJ/USDZ)
- Canvas / Twindo, Scanbrix, and contractor LiDAR-app roundups dated 2025–2026
- Bosch MeasureOn / Stabila Measures II / handheld laser Bluetooth workflows
- Pinned App §§12–14, Stabilization Pass 1 capture notes, Store Capture evidence rules

## 10. Stop

No SDK selected.  
No capture schema frozen.  
No Store or REF change.  
No machine motion.

Next atlas page, when requested: **Part 2 — Easy in / hard in**.
