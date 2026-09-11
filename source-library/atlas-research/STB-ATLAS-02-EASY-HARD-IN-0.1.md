# STB-ATLAS-02-EASY-HARD-IN-0.1

Part 2 of the Scan-to-Build destination atlas.  
Date: 2026-09-09  
Branch: `GeorgePlattDemo/grok-file` / `wip/app-build-0.1-stabilization`  
Status: **not adopted**. Field survey only.

## 1. Question

Once something has been captured, how does it enter the application as a project class — the easy door for ordinary work, and the hard door for drawings, models, and takeoffs — so both doors produce the same kind of absorbable candidate intake values and evidence?

## 2. Destination role

Part 1 named capture classes A–F. Part 2 is the intake membrane.

Pinned meaning already in force:

- App §§6–9: the first application is a reusable project-class framework, tested on User 1 Alcove Insert and Classic Picnic Table.
- App §12: native bounded rendering is allowed. General CAD is not the product.
- App §12: outside plans, DXF, SVG, PDF, scans, and meshes enter as evidence through adapters.
- Stabilization R-01: Picnic Table may be planned as a class test. It has no governed make path yet.
- Stabilization input status: model-inferred candidates stay inferred. User confirmation is not verification.

Part 2 does not choose a renderer or parser library.

## 3. Two doors, one class

| Door | User action | What should come out | First-app posture |
| --- | --- | --- | --- |
| Easy | Pick a class. Enter or beam a few permitted parameters. See derived parts update. | Bounded configuration + declared scalars + provenance | Build this first |
| Hard | Bring a file or takeoff made elsewhere. App extracts candidate values/evidence. User accepts, edits, or parks them. | Same candidate intake record shape as the easy door, plus file identity | Adapter seam now, parser later |

Both doors must die at the same later membranes: Store capability, declared machine envelope, governed gates. A prettier DXF does not skip those.

The historic tour already sketched the easy door: type the opening, keep units visible, invalidate confirmation when a number changes. Keep that behavior. Do not keep its packet-as-authority habits.

## 4. Easy door — what the field actually does

The outside world already splits “simple product change” from “open CAD.”

### 4.1 Bounded configurators

Common pattern: a small parameter set drives derived parts, a parts list, and sometimes a sheet cutlist.

Examples in the wild:

- Browser furniture / shelving configurators (Kallax-style grids, panel cabinets).
- Open tools such as Panelizer: place panels, export a CSV cutlist and a nest diagram for sheet goods.
- Three.js / React product configurators that change length, finish, or module count and show a model.

What they get right for Scan-to-Build:

- parameter → derived geometry → part list
- ordinary user never opens Fusion
- a change invalidates the previous list

What they get wrong if copied blindly:

- many emit sheet nests or STLs, not dimensional-lumber operations
- many treat “export CSV” as an order
- almost none ask a Store whether the stock and machine exist
- almost none keep unresolved conditions

Picnic Table belongs on this door: overall length, width, height, seat, material offering. It is a class-structure test, not a licensed make path.

Alcove Insert also belongs on this door first: opening width, depth, height, shelf count, support thickness. That matches how Job 001 and the M1 fixture already talk.

### 4.2 Native app geometry

App §12 already allows structured dimensions, basic 2D/3D view, highlight, and derived feedback. That is the easy-door renderer.

Field building blocks exist (Three.js, browser CAD kernels, FreeCAD as an external author). Selecting one is a later planning pass. This page does not pick.

### 4.3 Easy-door absorbable form

Conceptual only:

- project class identity
- permitted parameters and ranges
- user-entered or beamed scalars with units
- derived members labeled as derived
- which inputs are missing
- which inputs changed since last confirmation

No Store stock allocation. No price unless an authoritative or fixture-labeled source exists.

## 5. Hard door — what the field actually does

People already make the complex thing somewhere else, then try to throw a file over the wall.

### 5.1 Authoring tools the file will come from

| Tool | Role in the field | What a user can hand the app | Use as |
| --- | --- | --- | --- |
| FreeCAD 1.0 / 1.1 | Open parametric CAD + CAM workbench | DXF, SVG, STEP, native FCStd; CAM can also emit G-code | Author outside. App absorbs 2D/declared dims, not G-code |
| Autodesk Fusion | Commercial CAD/CAM | STEP for solids; DXF/DWG from sketches or faces; STL mesh | Same. STEP is collaboration, not an order |
| Onshape | Cloud CAD | STEP, STL, OBJ; sketches and flat faces to DXF/DWG; sheet-metal flats to DXF | Same |
| SketchUp / similar | Fast massing | SKP, plus exported 2D | Evidence / massing. Not cell truth |
| Inkscape, LibreCAD, QCAD | 2D vectors | SVG, DXF | Profile evidence |
| Phone scan tools from Part 1 | Capture | OBJ, DXF floorplan, PDF | Inferred geometry |
| Contractor takeoff | Quantities from plans | PDF markup, Excel/CSV counts and lengths | Demand evidence, not parts |

Neutral interchange that actually moves between these tools:

- **DXF / DWG** — 2D profiles, openings, sketches. Best hard-door candidate for wood parts and alcove outlines.
- **SVG** — same idea, weaker CAD semantics.
- **PDF** — what contractors actually send. Scale must be declared. Measurements extracted from a PDF are candidate values/evidence.
- **STEP** — solid exchange between CAD systems. Too much model for the first app class. Park unless a later class needs it.
- **STL / OBJ / glTF** — mesh. Display or evidence. Not a cut list.
- **CSV / XLSX** — takeoff quantities, cutlists from configurators. Useful if columns are labeled and units exist.
- **G-code / NC** — CAM output. Not an intake format. That is Part 4, after Store translation.

FreeCAD’s 1.1 notes matter only as field fact: DXF import was rebuilt, CAM exists, G-code can leave the same program that made the part. That is exactly the compression Scan-to-Build refuses. The app may later accept a FreeCAD DXF. It may not accept FreeCAD G-code as an order.

### 5.2 Contractor path

Bluebeam, PlanSwift, STACK, and similar turn a scaled PDF into lengths, areas, and counts, then export Excel or CSV.

That is `ActorContext CONTRACTOR` in spirit: a job or takeoff already exists. It is not activated in current M1. Absorbable later as labeled quantities with drawing identity and scale. Not as a WorkPacket.

### 5.3 What extraction can honestly do

From a DXF/SVG: candidate segments, closed profiles, maybe hole circles, units if present.

From a PDF: candidate lengths only after scale is known; otherwise unresolved.

From a CSV cutlist: candidate part names, qty, thickness, length, width.

From a STEP/mesh: display and “there is a solid,” not automatic members of an Alcove or Picnic Table class.

Every extracted number remains a candidate extracted value/evidence item. User review may accept it into the local candidate project, but neither acceptance nor labeling makes it a governed `Observation` or verified fabrication truth. Any future governed handoff must satisfy the owning Observation/ObservationSet contract. Hash the source file. Keep the extractor version. Do not silently tidy geometry into a class.

## 6. What the app may absorb

Same candidate intake/evidence idea as Part 1, plus class context:

- class id (alcove insert, picnic table, or future class)
- door used (easy / hard)
- parameters and raw file payloads
- extracted candidates, separate from adopted local candidate values
- units and scale
- source tool / format / hash
- unresolved: missing scale, mixed units, open profile, unknown layer, G-code attached, no class mapping

Easy-door derivations may update a display model. They do not write Store stock or machine coordinates.

## 7. What the app must not absorb from this market

- FreeCAD, Fusion, or Onshape as the application
- a nest diagram as Store fulfillment
- G-code, Fusion toolpaths, or LinuxCNC programs as intake
- STEP assembly as a project class
- takeoff CSV as a priced order
- “export cutlist” as ProductionExecutionAuthorization
- Picnic Table geometry as proof it is makeable
- public-demo packet / SKU shortcuts from `index.html`

## 8. Distance from the pinned envelope

| Need | Current field | Current Scan-to-Build | Gap |
| --- | --- | --- | --- |
| Easy class parameters | Configurators are common | App contract already requires this | Planning / UI, not discovery |
| Derived part list | Configurators and Panelizer-class tools | Allowed as derivation with attribution | Keep derivation labeled |
| DXF/SVG in | Mature in FreeCAD, Fusion, Onshape, Inkscape | Allowed as evidence adapter | Parser later; seam can be planned now |
| PDF takeoff in | Mature in Bluebeam / PlanSwift / STACK | CONTRACTOR entry exists, unactivated | Do not activate in this atlas |
| CAD-to-G-code in one tool | FreeCAD CAM, Fusion Manufacture | Forbidden as app or Store behavior | Keep split at Store translation |
| General CAD in the app | Huge market | Explicitly deferred | Deferred |

Part 2 does not block the next application-planning pass. It does block building a CAD suite or treating file drop as an order.

## 9. Foreshadow of Part 3

After either door, the object is still on the user side of the membrane.

Part 3 asks: when that candidate project asks the Store for an answer, what off-the-shelf pieces exist for offerings, pick lists, stock answers, and machine-neutral operations — without the app becoming the Store.

## 10. Stop

No renderer chosen.  
No DXF library chosen.  
No class schema frozen.  
No Store or REF change.  
No machine motion.

Next atlas page, when requested: **Part 3 — Order membrane**.
