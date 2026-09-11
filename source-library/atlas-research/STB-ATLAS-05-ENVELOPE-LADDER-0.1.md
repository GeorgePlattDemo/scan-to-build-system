# STB-ATLAS-05-ENVELOPE-LADDER-0.1

Part 5 of the Scan-to-Build destination atlas.  
Date: 2026-09-09  
Branch: `GeorgePlattDemo/grok-file` / `wip/app-build-0.1-stabilization`  
Status: **not adopted**. Field survey only.

## 1. Question

What bounded capability envelopes should the destination compare from an intro cell to a more capable cell, so a project class can be accepted, reconfigured, deferred, or refused — without pretending the first machine is a universal furniture plant?

## 2. Destination role

Parts 1–4 got a job to the cell door. This page is a field-comparison view of what that door might eventually need to distinguish.

Pinned meaning already in force:

- App §17: first machine is a useful bounded family, not a universal furniture machine. Full compound-miter is not assumed. Geometry that cannot be made on the commissioned envelope must not silently pass.
- Stabilization R-04: exact deployed envelope, travels, sensing, workholding, and interlocks remain unresolved. Correspondence is not installed capability.
- Cell spine: D-001 is a synthetic added-machine narrative. S-001 is descriptive. Neither is commissioned.
- Cell spine / Store already use MCL planning language. Atlas rungs below do **not** replace, extend, or reinterpret MCL.
- Current M1: only the exact sheet fixture reaches simulation. Dimensional and mixed execution are inactive.

Part 5 does not invent travels, blade diameters, a capability schema, or a BOM.

### Atlas vocabulary rule

The Rung 0–6 labels below are **research comparison bins only**. They are not runtime states, Store capability types, Cell objects, MCL replacements, or adopted implementation requirements.

A Store does not “declare an Atlas rung” merely because this page exists. If a later owning source finds the comparison useful, that source must explicitly adopt its own capability vocabulary or mapping.

## 3. How the field already ladders machines

Wood shops do not buy “a CNC.” They buy bounded families of capability.

| Field rung | Typical iron | What it is good at | What it is not |
| --- | --- | --- | --- |
| Manual / chop / cutoff | Sliding miter, CNC cutoff saw | Square or single-angle crosscut to length | Furniture as a system |
| Dimensional drill line | Gang or traversing drills on 2x stock | Repeat holes in 2x4 / 2x6 class stock | Contours |
| 3-axis nested router | Flat table, vacuum, sheet | Profile, pocket, vertical drill in sheet | End-boring, long sticks |
| Point-to-point / pod-and-rail | Clamps + boring block + spindle | Holes and grooves on already-cut panels, often five-side | Fast nested sheet yield |
| 4-axis | Added rotary or indexing | Legs, spindles, a second face without flipping every time | Freeform sculpture |
| 5-axis / mass-timber cell | Tilted spindle, long beam beds | Compound joints, LVL/CLT notches | First Store cell |
| Cabinet vendor cell | Homag / Biesse / SCM line | That builder’s envelope only | Portable to D-001 by file copy |

Field consensus is blunt: most cabinet work is 3-axis. 5-axis is a catalog upgrade, not a default. Point-to-point and nested routers are different envelopes, not two names for one machine.

A picnic-table leg with compound angles is a later comparison class. An alcove shelf blank can live on an earlier one.

## 4. Field-comparison ladder

These are planning comparisons, not commissioned claims and not adopted MCL semantics.

### Rung 0 — Simulation only

Current governed truth is simulation-only.

- Exact M1 sheet fixture
- `physicalFabricationEligible=false`
- Displayed dimensions do not promote capability

### Rung 1 — Intro dimensional cell comparison (D-001 family)

Roughly corresponds to the useful-but-bounded direction in App §17 and the cell-spine D-001 story:

- registered stick against a fence / table
- square crosscut
- index / transfer between stations
- label / identify the part
- stock form: dimensional boards in a declared size class

Not implied by this comparison:

- compound miter
- free contour
- five-side panel boring
- sheet nesting as the primary path
- live sensing beyond what commissioning later proves

Alcove shelf lengths and square cuts could fit this comparison *if* an owning Store/Cell capability model later declares equivalent real capability. They do not belong to a commissioned machine today.

### Rung 2 — Bounded angle comparison

Single-plane miter or a declared angle set on registered dimensional stock.

Picnic Table starts to feel this comparison. It still cannot claim makeability from geometry alone.

### Rung 3 — Registered drill / simple mill comparison

Holes and shallow pockets on a stick or blank that is already located. Tooling and hole catalogs would need to be declared by the owning capability model.

### Rung 4 — Sheet-cell comparison (S-001 family)

Nested or fixtured sheet work. Separate envelope from D-001. Current M1 simulation lives conceptually near this material form, not as proof the sheet cell is commissioned.

Mixing D-001 and S-001 in one silent “the machine” is how SKUs and stock forms got confused in the public demo.

### Rung 5 — Contour / limited 3-axis comparison

Profiles and limited curvilinear work inside a stated travel and tool set.

### Rung 6 — Later advanced comparison

Compound-miter, simultaneous 5-axis, mass-timber beam cells, full vendor PTP lines. Valid future machine families. Not the intro deployment. Not implied by rendering a pretty leg.

## 5. How a class may use this comparison

Consequence only, not a new API or capability contract:

1. Class derives required operations (square cut, angle, hole, nest, contour…).
2. Store answers against the site’s **actual adopted capability declaration**.
3. The atlas comparison may help a human reason about whether that capability is early, intermediate, or advanced.
4. Outcomes remain owned by the real source: accept; accept after bounded config change; alternate fulfillment; defer; refuse.

That is App §17. The atlas labels are only a map so later planning does not confuse fundamentally different machine families.

Examples, still not activation:

- User 1 alcove square shelves → field-comparison Rung 1 or 4 depending on stock form. Current M1 remains simulation-only with a sheet fixture.
- Picnic Table square top slats → early dimensional comparison. Angled legs → bounded-angle comparison or later. Hardware / load → still R-01, governed.
- Sculpted corbel → advanced comparison. Refuse or defer on an intro cell unless an owning capability source says otherwise.

## 6. What the field must not overwrite

- Patent figures are correspondence, not a commissioned envelope.
- A 5-axis LVL cell (45 ft beds, structural notches) is a different industry.
- A $30k five-side panel driller is not D-001.
- A hobby 3-axis router envelope is not a Store declaration.
- “It rendered” is not a capability promotion.
- An Atlas rung is not an MCL value or Store capability declaration.

R-04 stays open: travels, kerf, clamp zones, probe, dust, interlocks, and installed tools are commissioning facts. This page does not fill them in.

## 7. Distance from the pinned envelope

| Need | Current field | Current Scan-to-Build | Gap |
| --- | --- | --- | --- |
| Bounded first machine | Cutoff + 3-axis shops are common machine families | App §17 already says bounded | Adopt owner capability vocabulary later; do not use atlas labels as authority |
| Separate sheet vs stick | Nesting vs PTP is a known fork | D-001 and S-001 already split | Keep split in Store capability |
| Angle / drill as later | Common upgrade path | App §17 lists them as family, not first-day | Later owner mapping, not atlas runtime tags |
| Compound / 5-axis | Explicit upgrade | Explicitly not assumed | Keep not assumed |
| Commissioned numbers | OEM spec sheets | Unresolved (R-04) | Leave unresolved |

Part 5 does not block application planning. It does block a class that is “buildable because we drew it,” and it does not create a new capability ontology.

## 8. Foreshadow of Part 6

Once a capability family is eventually declared by an owning source, someone still has to pick controllers, servos, workholding, and safety parts that can *hold* it. That is iron. It is not an app feature.

## 9. Stop

No travels invented.  
No tool list adopted.  
No MCL redefined.  
No Store capability type created.  
No D-001 commissioning claimed.  
No REF, Store, or Cell file changed.  
Production remains closed.

Next atlas page, when requested: **Part 6 — Iron**.
