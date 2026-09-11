# STB-ATLAS-03-ORDER-MEMBRANE-0.1

Part 3 of the Scan-to-Build destination atlas.  
Date: 2026-09-09  
Branch: `GeorgePlattDemo/grok-file` / `wip/app-build-0.1-stabilization`  
Status: **not adopted**. Field survey only.

## 1. Question

When a configured candidate project approaches the Store for an answer, what actually exists off the shelf for offerings, stock answers, pick lists, and machine-neutral operations — and what must stay Store-owned so the app does not become the yard?

## 2. Destination role

Parts 1–2 stop on the user side of the membrane: evidence and a bounded class configuration.

This page is the crossing.

Pinned meaning already in force:

- App §4.2 / source map: Store controls offerings, stock, capability, translation, disposition, fulfillment. The app asks for the answer, not the database.
- App §11: evidence → configuration → material / capability resolution → INFORM / REFUSE / DEFER.
- Store Job 001: job geometry is part-relative. Store emits a machine-neutral operation sequence. Local lowering is not the app.
- Stabilization R-03: Store has documentation, not an adopted app API. Plan the smallest question set.
- Production remains closed. A pick list is not Cycle Start.

Part 3 does not design a Store API and does not pick an ERP.

## 3. What the Store-facing request means here

For this atlas and the first app slice, the crossing is a **Store-facing inquiry/request**, not automatically a commercial order, cart checkout, reservation, or G-code file.

It asks for Store-owned answers such as:

- can this Store offer it
- which stock / SKU / form is represented
- what pick-list presentation could apply
- what machine-neutral operations would be required if accepted
- accept / defer / refuse or insufficient information
- freshness and scope of those answers

A later Store-owned commercial act may create a quote, sales order, reservation, pickup, or other fulfillment record where an owning Store implementation supports it. The application does not create that meaning merely by sending a request.

Price is allowed only when an authoritative Store or explicitly fixture-labeled source exists. Do not invent it to finish a demo.

## 4. Four field stacks that look like a Store

The outside world already built four different “after the drawing” systems. They are easy to steal from the wrong layer.

### 4.1 Lumber-yard POS / dealer ERP

This is the closest analog to a physical Scan-to-Build Store.

Named systems in current LBM use: ECI Spruce, DMSi Agility, Flitch, WoodPro InSight, ACCEO TransActPOS, and similar dealer stacks.

What they actually do:

- sell by piece, linear foot, board foot, bundle
- cut-to-length as a counter ticket
- contractor job accounts
- quotes → sales orders → purchase orders
- pick / load / delivery
- vendor catalog price updates

What they get right:

- stock is real and location-specific
- units of measure are a first-class problem
- a cut length is a sales act, not a CAD export
- refuse / special-order is normal

What they must not become:

- the application
- the governed WorkPacket
- the cell controller

A Spruce ticket can inspire a pick-list *shape*. It cannot own project truth or machine datums.

### 4.2 Generic open-source ERP / MRP

Odoo and ERPNext are the serious free-or-open manufacturing ERPs in 2026. They already have item masters, multi-level BOMs, work orders, routings, pick lists, barcodes, and warehouse locations.

Useful as a *possible later Store implementation substrate*. Not as the Store meaning.

If a future Store runtime needs inventory and pick documents, these are the off-the-shelf cores to evaluate. They do not define Scan-to-Build operations, capability envelopes, or gates.

Do not put Odoo inside the app. Do not let an ERP work order pretend it is SimulationAuthorization.

### 4.3 Cabinet design-to-CNC suites

Cabinet Vision, Microvellum, 2020, Mozaik, and kin take a configured cabinet and emit BOM, cutlist, nest, labels, and often machine programs.

This is the market’s compressed stack: one vendor from pretty picture to spindle.

Scan-to-Build refuses that compression.

Borrow from them only the *consequence order*:

configuration → parts → material demand → operations → disposition

Do not borrow their ownership: they collapse Store, CAM, and controller into one shop system. That is exactly what App §14 forbids.

### 4.4 Sheet cutlist / nest tools

Cutlistor, CutList Plus, MaxCut, Panelizer-class tools. They pack rectangles onto sheets and print a saw plan.

Fine for a sheet-goods fulfillment *helper* inside a Store. Not an order. Not D-001 dimensional lowering. Not a reason to skip stock checks.

## 5. Machine-neutral operations in the field

Industry already tried to stop sending raw axis moves as the job.

| Field object | What it is | Distance from Store translation |
| --- | --- | --- |
| ERP routing / work center ops | “cut, drill, edge-band at these work centers” | Close in spirit. Plant-generic, not cell-specific |
| Cabinet suite machining output | Holes, dados, nests, often builder G-code | Too close to the machine. Wrong side of the membrane |
| STEP-NC / ISO 14649 | Feature- and workstep-level process plan, then the controller makes moves | Closest *standards* analog to “machine-neutral job.” Research and metal/AM more than lumber yards. Not adopted here |
| MTConnect / OPC UA | Live machine status out, not a job in | Status listen later. Not an order format |
| G-code / vendor NC | Local program | Cell / controller only, after lowering |

Store Job 001 already occupies the right slot: a machine-neutral operation sequence that is still part-relative. The field does not give you a drop-in lumber-yard STEP-NC. Do not import ISO 14649 to close the gap. Declare Store ops. Lower them locally.

## 6. What may cross the membrane

Conceptual question set only — not an API freeze:

From app to Store:

- class and configuration identity
- required parts / quantities / material form
- required operations, still part-relative
- evidence / provenance references
- unresolved flags the Store must see

From Store to app:

- offer / stock / capability answers
- freshness
- pick-list presentation (what would be pulled)
- machine-neutral operation sequence, if accepted
- INFORM / REFUSE / DEFER or insufficient-information disposition
- price only if Store-owned or fixture-labeled

The app displays those answers. It does not allocate the board, reserve stock, or create a commercial order merely by receiving an answer.

## 7. What must not cross

- app-invented SKUs or availability
- public-demo `PNC-196` confusion
- Cabinet Vision / Fusion programs labeled as Store ops
- ERP work-order IDs treated as governed authority
- pick list treated as `POSITION_VALID` or Cycle Start
- network presence treated as stock
- the app writing the Store database
- a Store-facing inquiry silently promoted into checkout, reservation, or order semantics

## 8. Distance from the pinned envelope

| Need | Current field | Current Scan-to-Build | Gap |
| --- | --- | --- | --- |
| Ask Store, don’t be Store | Dealer POS and ERP exist | Explicit contract | Smallest question set (R-03), not discovery of the idea |
| Dimensional stock + cut length | LBM POS already sells this | Job 001 / Store Zero describe it | Documentary Store, not a live yard system |
| Pick list | ERP and POS pick documents are mature | Fulfillment is Store-owned | Presentation only in the app |
| Neutral ops | STEP-NC and ERP routings exist; shops still ship G-code | Job 001 already defines the slot | Do not adopt a metal standard to look finished |
| Config → CNC in one suite | Cabinet Vision / Microvellum | Forbidden collapse | Keep refused |
| Live price | LBM catalogs and POS | No invented price | Wait for a Store price source |

Part 3 does not block application planning. It does block building a yard ERP inside the app, and it does block treating any cutlist exporter or Store inquiry as a completed order.

## 9. Foreshadow of Part 4

After Store acceptance, someone still has to turn a neutral operation into motion that references a real board and a real station.

Part 4 is that drop: CAM versus controller, posts, G-code, and why lowering stays in the cell.

## 10. Stop

No ERP chosen.  
No Store API specified.  
No SKU table invented.  
No REF or Store file changed.  
No machine motion.

Next atlas page, when requested: **Part 4 — Neutral ops → machine**.
