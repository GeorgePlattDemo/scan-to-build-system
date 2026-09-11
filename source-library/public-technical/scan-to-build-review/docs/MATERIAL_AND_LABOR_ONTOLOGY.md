# Material and Labor Ontology — Published Language Specification

**Document:** `docs/MATERIAL_AND_LABOR_ONTOLOGY.md`
**Status:** Specification for review — pilot-stage; values marked as model parameters are not validated results
**Applies to:** Scan-to-Build review / Home as Twin (U.S. Patents 9,720,401 · 10,768,609)
**Companion documents:** `docs/ARCHITECTURE.md` (system architecture, v2), `docs/WORKPACKET_EXAMPLES.md` (illustrative WorkPacket contracts)

> **Review status:** This document is a review specification, not an implementation guarantee. Schemas and examples are illustrative reference contracts for pilot evaluation.

This specification governs the shared vocabulary — the *published language* — that WorkPackets use to cross boundaries between the homeowner record, materials, retail SKUs, labor tiers, machines, vendors, installers, finance, and outcomes without losing meaning.

The four system invariants apply to every section of this document:

1. **The homeowner controls the record.**
2. **Capture is standardized.**
3. **Routing is intelligent, explainable, and governed.**
4. **Outcomes are preserved and returned to the homeowner record.**

---

## 1. Purpose and scope

### 1.1 Why the ontology exists

The system's thesis is that precise, governed data should travel before atoms move. That substitution only works if every party that touches a WorkPacket reads the same meaning from it. A packet that means one thing to the homeowner, a slightly different thing to the orchestrator, and a third thing to a fabrication cell is not governed data — it is the traditional re-measurement-and-re-entry model wearing a JSON costume.

The ontology is the controlled vocabulary that makes "standardized capture" a contract rather than a format. It defines what a material *is*, what a labor task *requires*, what a machine *can safely do*, and what a refusal *means* — in terms that are stable across vendors, stores, cells, installers, and time.

### 1.2 The ontology is a published language

In domain-driven design terms, the ontology is a **Published Language**: a versioned, curated reference model that every bounded context (Record, Orchestration, Channels, Settlement) consumes read-only. No channel, vendor, or service may mutate the vocabulary it validates against. Changes occur on a curation cadence through governed versioning (`ontology/<year>.<rev>`), and every WorkPacket pins the ontology version it was validated against, permanently.

### 1.3 Why SKUs, vendor terms, machine codes, and labor labels cannot be the primary truth

Each of these is real and necessary — and each is the *wrong* primary truth, for a specific reason:

| Candidate truth | Why it fails as primary truth |
|---|---|
| **Retail SKU** | A SKU is one retailer's inventory key for one moment in its catalog. SKUs change, lapse, and differ across stores carrying physically identical stock. A packet keyed to a SKU is locked to one channel — which violates owner control of routing and reintroduces information arbitrage. |
| **Vendor product terms** | Vendor names ("Series 400 Insert," "ProFlash WRB") are marketing identities. Two vendors' equivalent products share no common key; one vendor's renamed product silently breaks references. |
| **Machine codes** | A CAM program or tool-head ID describes *how one machine executes*, not *what the component is*. Tying packets to machine codes makes the packet unroutable to any other capable cell. |
| **Labor labels** | Job titles ("carpenter," "handyman," "tech") carry no enforceable meaning. Routing labor safely requires defined, certifiable scopes — not titles. |

The ontology is the layer all of these map *to*. A SKU is a channel-specific fulfillment mapping of a MaterialSpec. A machine code is one cell's execution of an operation type. A labor label is, at best, an informal alias for a defined tier. The mappings are first-class data (§7); the ontology nodes are the meaning.

### 1.4 Scope of this document

This document defines: the domain vocabulary (§3); the material ontology (§4); the labor ontology (§5); the MachineEnvelope ontology (§6); SKU and channel mapping rules (§7); the refusal taxonomy (§8); schema and database extensions (§9–10); two proof cases with complete JSON examples — Woodwork (fabrication proof, §11) and Windows (orchestration proof, §12) — outcome examples (§13); governance rules (§14); and pilot measurement notes (§15).

Out of scope: pricing strategy, partner commercial terms, UI specification, and any claim of validated economic results. All economic and sustainability figures in this document are **pilot-measurable variables**, defined so the event store can measure them; none are asserted as proven.

---

## 2. Core principle: packet meaning must survive boundary crossing

A WorkPacket crosses at least five boundaries in a normal project. The ontology's job is that the packet's meaning is identical on both sides of every one.

```text
  HOMEOWNER ──▶ RECORD ──▶ PACKET ──▶ ORCHESTRATOR ──▶ CHANNELS ──▶ OUTCOME RECORD
   (capture)   (events)  (validated)   (gates/route)  (store/vendor/   (preserved)
                                                        cell/labor/
                                                        finance)
```

**Homeowner → Record.** Capture (scan, measurement, photo, material confirmation) enters the owner-held record as events with confidence metadata. Nothing downstream may exceed the confidence of the capture it derives from (§8, `CAPTURE_CONFIDENCE_LOW`).

**Record → Packet.** A packet is composed *from* the record: capture references, MaterialSpecs drawn from the ontology, labor requirements drawn from the tier registry. The packet is immutable per version; revision creates a new version. The packet never contains the full home record — only what the scope requires (§14).

**Packet → Orchestrator.** The orchestrator validates the packet against the pinned ontology version: every MaterialSpec resolves to a node; every use-class is permitted; every labor line names a defined tier; every fabrication operation fits at least one MachineEnvelope. Failures become structured refusals (§8), preserved to the record.

**Orchestrator → Store / Vendor / Fabrication / Labor / Finance.** Each channel receives the packet (or a decomposed scope of it) through an adapter that translates ontology terms *outward* into that channel's local vocabulary — SKUs for a store, RFQ line items for a vendor, CAM parameters for a cell, a scoped task order for an installer, an escrow instruction for finance. Translation is one-way at the boundary: channel vocabulary never leaks into the packet.

**Channel → Outcome record.** Execution reports, milestones, transport legs, scrap reports, warranty terms, and as-built deltas return through the same adapters, translated *back* into ontology terms, and are preserved on the owner record bound to the exact packet version that was executed.

The test for every design decision in this document: **if a packet crosses a boundary and any party would reasonably interpret a field differently than the party before it, the ontology is incomplete at that point.**

---

## 3. Domain vocabulary

| Term | Definition |
|---|---|
| **Home** | The root aggregate of the owner-held record: one physical property, one owner of record, an event archive, and a set of activated verticals. The home is where ground truth (capture) originates. |
| **Project** | A unit of intent within one vertical, moving through the linear stage machine `research → design → quote → purchase → fulfillment → archived`. One project may decompose into multiple fulfillment scopes; it remains one record entry. |
| **Vertical** | A row of the matrix: a home-improvement domain (Woodwork, Windows, Doors, Siding, Roofing, plus open slots). Verticals share the same stages and packet shape; they differ in ontology content and channel mix. |
| **Stage** | A column of the matrix: Research, Design/Configure, Quote/Shop, Purchase, Fulfillment. Stage transitions are gate-checked; gates read the record only. |
| **WorkPacket** | The immutable, versioned, validated unit of work that crosses boundaries. Contains capture references, MaterialSpecs, labor requirements, machine requirements, finish specification, and validation state. The packet is the contract. |
| **MaterialSpec** | A packet line describing required material in ontology terms: node reference, quantity, unit, use-class, tolerance and substitution policy. Never a SKU. |
| **MaterialClass** | The stratum a material node belongs to (raw, ingredient, component, vendor product, finished good, site interface, service input — §4). Class determines where the line can be fulfilled and what refusals apply. |
| **SKU mapping** | A channel-scoped, time-stamped binding `material node → (SKU, price, stock)`. Fulfillment data, never identity (§7). |
| **LaborTier** | A defined, certifiable scope of work authority (§5). Routing data: a labor line names a tier; a channel proves certification for that tier or is ineligible. |
| **Skill** | A named, assessable capability within a tier (e.g., `mode3.fixturing`, `flashing.integration`). Tiers are composed of skills; certifications attest skills. |
| **Certification** | An attestation, by a recognized certifying body (including workforce-education partners), that a person or channel holds named skills at a tier. Stored in the capability registry; expirable; auditable. |
| **MachineEnvelope** | The declared, bounded capability of a fabrication resource: dimensional limits, operation types, modes, tolerance model, and refusal boundary (§6). A safety and routing boundary, not a marketing claim. |
| **ChannelCapability** | The registry entry describing what one channel can actually do: machine envelopes held, tiers certified, service scopes offered, location, and release-policy compliance. |
| **RefusalReason** | A structured, coded, preserved outcome of validation or routing stating why a packet (or line) cannot proceed as specified (§8). Refusals are data, not errors. |
| **OutcomeMetric** | A named, instrumented variable computed from record events at project close (atom-miles, first-fit, scrap fraction, etc. — §15). |
| **ExecutionReport** | A channel's structured return after performing work against a packet version: operations performed, materials consumed, deviations, scrap, transport legs, time. Translated to ontology terms at the adapter and preserved to the record. |

---

## 4. Material ontology

Materials are classified into seven strata. The stratum determines where a line appears in the packet, who can fulfill it, and which refusals can fire on it. This section defines *what a material is and what it requires*; the physical question of whether a given cell can execute the work belongs to the MachineEnvelope layer (§6), which this document references but does not duplicate.

| MaterialClass | Definition | Examples | Where it appears in the WorkPacket | Routing / refusal effect |
|---|---|---|---|---|
| **Raw material** | Stock as it exists in channel inventory, before any project-specific operation. The atoms whose travel the system minimizes. | 3/4″ cabinet-grade birch plywood, 48×96 sheet; 2×4×8 SPF; 1×4 primed pine; hardwood edge banding | `bom[]` line with `class:"raw"`, `routable:"cell"` (typically), fabrication ops attached | Must resolve to SKU coverage at quoting (`MATERIAL_UNAVAILABLE`); use-class checked against node (`MATERIAL_UNSUITABLE`); dimensions feed envelope checks. |
| **Ingredient** | Consumed in processing or finishing; present in the product but not enumerable as a part. | Paint, stain, adhesive, wood filler, sealant | `bom[]` line with `class:"ingredient"`; quantity in coverage units (gal, oz, lf) | Substitution policy usually permissive within spec (sheen, base); environmental/use-class constraints can refuse (interior-only coating on exterior assembly). |
| **Component** | A part produced by operations on raw material to a project-specific spec; carries its own dimensions and operations. | Scribed side panel; shelf; nailer; profiled stile; extension jamb cut to depth | `bom[]` line with `class:"component"`, parent link to its raw input, `fabrication[]` ops | Each operation must fit an eligible MachineEnvelope (`ENVELOPE_EXCEEDED`); tolerance model applies; this is the stratum the fabrication proof lives in. |
| **Vendor product** | A manufactured unit specified by performance attributes and procured, not fabricated, within the system. | Insulated glazing unit; complete window unit (U-factor/SHGC-specified); pre-hung door slab; hinge set | `bom[]` line with `class:"vendor_product"`, `routable:"vendor"`, performance spec instead of fabrication ops | Routed to vendor adapters via RFQ; equivalence governed by performance spec + substitution policy (`SUBSTITUTION_REQUIRES_OWNER` when out of policy); never fabricated in-cell. |
| **Finished good** | What the project delivers to the owner: the labeled, released, warrantable result. | Painted alcove built-in; installed and flashed window opening | The packet's top-level subject; `deliverable` block; what the Outcome binds to | Closure requires owner verification; warranty and as-built attach here; finished goods never route — their scopes do. |
| **Site interface** | The existing condition of the home that the work must meet: the boundary between new work and the building as found. | Alcove walls and floor (out-of-square measured); rough opening; existing WRB/sheathing condition; header above opening | `siteInterfaces[]` block with capture references and confidence; constraints on adjacent lines | The highest-leverage refusal source: low capture confidence (`CAPTURE_CONFIDENCE_LOW`), unresolved conditions (`SITE_CONDITION_UNRESOLVED`), or structural findings (`SAFETY_REVIEW_REQUIRED`, `PERMIT_REQUIRED`). |
| **Service input** | Non-material inputs a scope requires to execute: access, disposal, utilities, finance instruments. | Haul-away/disposal; site access window; escrow instrument; permit filing | `serviceInputs[]` block; referenced by labor and fulfillment scopes | Missing service inputs refuse at routing (`RELEASE_POLICY_UNSATISFIED` when a channel cannot meet escrow/verification terms); disposal legs count in atom-movement metrics. |

Structural rules:

1. **Composition is explicit.** A component line references the raw line(s) it consumes (`consumes: [lineId]`). A finished good's deliverable block references its components and vendor products. This is what lets a store adapter compute a pick-list, a cell compute nesting, and the metrics layer compute scrap against known inputs.
2. **Nodes are versioned, never deleted.** Packets cite `ontologyVersion`; a deprecated node remains resolvable forever for archived packets.
3. **Material attributes can carry regulated properties — and the system preserves them.** A material node is not only an identity; it carries the attributes that determine fitness for use, including regulated ones. Engineered wood panels are the example most homeowners never see clearly: particleboard, MDF, and some hardwood plywood may use resin systems that can emit formaldehyde, and covered composite wood products are regulated in the U.S. under EPA TSCA Title VI and California's CARB composite-wood rules (ATCM Phase 2), which define compliance classes and lower-emitting resin categories including NAF and ULEF. A normal project loses this — the sheet is bought under a SKU, cut into parts, painted, installed, and later remembered only as "the built-in" or "the shelf," its resin category and compliance class separated from the finished thing the moment the receipt is gone. The system's contribution is not a health claim. It is that a `MaterialSpec` can carry a binder/emission class (`none` · `naf` · `ulef` · `standard_uf` · `unknown`) the same way it carries grade, thickness, or use-class — specified before fabrication, validated before release, and preserved in the outcome record.
4. **A specified attribute is an enforceable constraint, not a label.** Where an owner or use-class requires a material attribute, a conflicting line refuses rather than proceeding silently. The same `MATERIAL_UNSUITABLE` machinery that stops an interior-grade sheet in an exterior assembly (§8) reads node attributes — use-class, movement risk, binder/emission class — and refuses a violating line, explained to the owner and written to the record. Material science is encoded as enforcement, not advice.
5. **The attribute model is open to new material classes.** As lower-emission, bio-based, fiber- or cellulose-based, and other non-traditional materials mature, each can enter as a versioned node (rule 2) carrying its own attributes — emission class, structural performance, use-class, environmental behavior, refusal boundary — through the same path as any existing material, with no schema change. Where a class offers a measured advantage for a component, the design layer can surface it for owner selection. The system carries and records the choice; it does not assert the material's performance.

---

## 5. Labor ontology

Labor is modeled as **tiers of defined work authority composed of named skills**, not as job titles. A packet's labor line names a tier; the capability registry proves which channels hold it. Tier codes used here map onto the registry codes in `docs/ARCHITECTURE.md` (T0–T4) as noted.

| Role (code) | Definition | Example actions | Required skill attributes | How the tier is enforced |
|---|---|---|---|---|
| **Operator** (`OP`, maps T1) | Runs governed packets on bounded machinery. Certified *on the packet workflow*, not required to author CAD/CAM. | Load sheet stock; initiate stencil-mode cycle; apply component labels; stage release | `packet.read`, `machine.operate.bounded`, `label.release`, safety-envelope training | Any `routable:"cell"` line requires a channel with `OP` certification on the relevant MachineEnvelope; absent → `LABOR_TIER_UNAVAILABLE`. |
| **Material-sensing operator** (`OP-MS`, maps T1+skill) | An Operator additionally certified to confirm material truth at the Confirm step: species, grade, moisture/movement suitability, defect rejection. | Reject cupped sheet for a long panel; approve short-span use of warped dimensional stock; confirm grade against spec | `OP` skills + `material.confirm`, `species.grade.id`, `movement.assessment` | Packets with `materialConfirmation.required:true` route only to channels listing `OP-MS`; the confirmation event is recorded with the confirmer's certification ID. |
| **Cell steward** (`CS`, maps T2) | Owns the cell's setup integrity: tooling changeover, mode-3 fixturing, calibration, and **refusal authority** — may halt a packet on observed grounds the system did not anticipate. | Install edge-profile head; fixture carrier plate for mode-3; halt run on observed delamination; file a steward refusal with reason | `CS` includes `OP-MS` skills + `tooling.changeover`, `mode3.fixturing`, `calibration.verify`, `refusal.authority` | Lines with `fabrication.mode:3` or custom tool heads require `CS`; steward refusals enter the record as first-class `RefusalReason` events. |
| **Installer** (`INST`, maps T3) | Performs site work joining fabricated/vendor goods to site interfaces within standard scopes. | Set and shim insert window; scribe and fasten built-in; case opening | `site.measure.verify`, `fastening.systems`, `scribe.fit`, scope-specific modules | Labor lines `task:"install.*"` require a channel whose `service_scopes` include the named scope with `INST` certification. |
| **Specialized installer** (`INST-S`, maps T3+) | Installer certified for scopes with elevated water-, structural-, or system-integration risk. | Full-frame window replacement; WRB/flashing integration; pan flashing; ledger work | `INST` + scope specializations (`flashing.integration`, `wrb.tie_in`, `fullframe.window`) | Scopes flagged `riskClass:"elevated"` require `INST-S`; an `INST`-only channel is ineligible — not down-rated, ineligible. |
| **Inspector / verifier** (`VER`, maps T3/T4 by scope) | Independently verifies executed work against the packet: fit, flashing continuity, operation, code items where applicable. May be the AHJ inspector when permits apply. | Verify reveal tolerances; water-test flashing; confirm tempered glazing where required; record as-built deltas | `verification.method` per scope; independence from executing channel; AHJ credential where `PERMIT_REQUIRED` | Owner-verification milestones may name a required `VER` scope; closure blocks until the verification event posts. |
| **Service provider** (`SVC`) | Performs non-craft service inputs: delivery, haul-away, scheduling, financing operations. | Deliver staged package; remove old sash for recycling; execute escrow release on verified close | Scope-specific (`transport.record`, `disposal.manifest`, `escrow.instrument`) | Service inputs route only to channels with the named `SVC` scope; transport legs must be reported (feeds atom-movement metrics). |
| **Owner agent** (`OA`, maps T0) | The homeowner (or their delegate) acting within the project: capture assistance, approvals, label-driven assembly, final verification. | Approve substitution; assemble labeled kit per instructions; sign owner verification | None enforced; instructions document is a mandatory packet output for any `OA` task | `OA` tasks never block routing; owner approvals (`SUBSTITUTION_REQUIRES_OWNER`, release, verification) are events only the owner identity can write. |

### 5.1 Why this supports workforce development without deskilling

The tier model encodes the workforce thesis from the institutional briefs rather than contradicting it. The bounded machine does not absorb the worker's judgment; it *relocates* it to the points the machine cannot reach — material truth (`OP-MS`), setup integrity and anticipation of the unanticipated (`CS` refusal authority), site interface craft (`INST`/`INST-S`), and independent verification (`VER`). Each of those judgment points is a **named, certifiable, registry-recorded skill** — which means a community-college certificate has a direct, machine-readable destination (`channel_capabilities.certified_tiers`), advancement is a visible path (`OP → OP-MS → CS`, `INST → INST-S`), and the refusal corpus (§8, §15) shows, with data, which human judgments the system depends on most. Workers are not interchangeable labor inputs in this model; they are enforced preconditions for routing.

---

## 6. MachineEnvelope ontology

A MachineEnvelope is the declared, bounded capability of a fabrication resource. **It is a safety and routing boundary, not a marketing claim**: the envelope exists so that the orchestrator can prove, before any atoms move, that an operation is inside a resource's safe, certified competence — and refuse it otherwise. Envelopes are conservative by design; widening one is a governed change supported by evidence, not a sales decision.

| Envelope concept | Definition |
|---|---|
| **Dimensional cell** | Bounded processor for dimensional lumber (patent: manipulating-rotor machine). Declares stock cross-sections accepted, length handling (including oversize with auxiliary support), end-operation set (miter, compound miter, drill, rout), and station flags. |
| **Sheet cell** | Bounded processor for sheet goods (patent: servo sheet machine). Declares sheet sizes accepted (4×8 standard; 4×10/4×12 by special entry), modes (`manual`, `stencil`, `fixed_sheet`), tool heads (`saw`, `router`, `drill`, `edge_profile`), and station flags (`secondary_ops`, `prefinish`, `label`). |
| **Manual station** | Human-executed work area with defined scope (secondary ops: deburr, sand, sever stencil attach points; assembly bench). Bounded by tier, not servo limits — its "envelope" is the certification of the people staffing it. |
| **Vendor factory** | An external manufacturing capability modeled only by its product interface: accepted performance specs, options, lead-time class. The system does not model vendor internals; it models what can be ordered and verified. |
| **Machine capability** | One (operationType × mode × toolHead) entry a resource declares, with its tolerance class. The unit of matching between a fabrication op and a resource. |
| **Operation type** | Ontology-defined operation vocabulary: `crosscut`, `rip`, `miter`, `drill`, `rout.stencil`, `rout.profile`, `edge.profile`, `drill.pattern`, `finish.spray`. CAM codes map to these; these never map to CAM codes. |
| **Tolerance model** | Declared achievable tolerance per capability (e.g., `±1/32″` mode-2 stencil; `±1/64″` mode-3 fixed-sheet). Packet lines declare *required* tolerance; matching requires `required ⊇ achievable`. Tolerance is matched, never assumed. |
| **Refusal boundary** | The explicit statement of what the envelope will not do, including conditions that trigger steward review (material classes excluded, operations excluded, dimension limits, mode restrictions). The refusal boundary is published with the envelope so that "the machine refused" is always explainable. |

Matching rule used by the orchestrator:

```text
op_fits(op, envelope) :=
      op.type ∈ envelope.operationTypes
  ∧   op.mode ∈ envelope.modes              (where applicable)
  ∧   op.dims ⊆ envelope.dimensionLimits
  ∧   op.requiredTolerance ≥ envelope.toleranceClass(op.type, op.mode)
  ∧   op.materialClass ∉ envelope.refusalBoundary.excludedMaterials
```

Any failed conjunct produces `ENVELOPE_EXCEEDED` with the failed conjunct named in the refusal message. Explainability is a requirement, not a courtesy.

---

## 7. SKU and channel mapping

**The ontology is the primary truth. A SKU is a channel-specific fulfillment mapping.**

Rules:

1. **Packets reference nodes, never SKUs.** A MaterialSpec names a material node and constraints. The orchestrator resolves nodes to SKUs *per channel, at quote time*, via the `sku_mappings` registry. Resolution results (SKU, price, stock, timestamp) attach to the **quote**, not the packet.
2. **No silent SKU lock-in.** A WorkPacket must not become bound to one retailer's SKU unless the owner explicitly chooses that binding (e.g., "match my existing cabinet line"). Owner-chosen bindings are recorded as a constraint on the MaterialSpec (`binding: {channelId, sku, ownerApprovedEvent}`) and are visible in routing explanations — they narrow eligibility, and the owner sees that they do.
3. **Equivalence is spec-level.** Two SKUs are substitutable iff both satisfy the same MaterialSpec (node, grade, use-class, dimensional basis, performance attributes) **and** the line's substitution policy permits it. Substitution policies: `exact` (no substitution), `spec_equivalent` (any SKU satisfying the spec), `owner_approval` (equivalent candidates surfaced; owner approves — `SUBSTITUTION_REQUIRES_OWNER` fires if a channel cannot fulfill without it).
4. **Staleness degrades, never misprices.** SKU mappings carry `as_of`; stale mappings reduce a channel's quote confidence and are flagged in the quote, rather than being silently treated as live inventory.
5. **Coverage is scored, not assumed.** `sku_coverage` (fraction of BOM lines resolvable at a channel) is computed per scope; below the policy threshold the channel either declines the scope or quotes with explicit special-order lines.

---

## 8. Refusal taxonomy

A refusal is a structured, preserved statement that a packet (or line) cannot proceed *as specified*. Refusals are versioned onto the packet, explained to the owner in plain terms, and retained permanently — the refusal corpus is one of the system's most valuable datasets (§15).

| Refusal code | Meaning | Likely stage | Owner-facing explanation (template) | System action | Why the refusal is useful |
|---|---|---|---|---|---|
| `MATERIAL_UNAVAILABLE` | No eligible channel can resolve a required MaterialSpec to in-stock supply within policy. | Quote | "The specified {material} isn't available through your eligible channels right now. Options: wait, widen radius, or review equivalents." | Quote scope blocked; equivalents (if policy permits) surfaced; re-poll scheduled. | Reveals real supply gaps by region and node; prevents quotes that can't be fulfilled. |
| `MATERIAL_UNSUITABLE` | Specified material's attributes — use-class, movement risk, or binder/emission class — conflict with the application or with an owner-set constraint (e.g., interior-grade sheet in exterior assembly; movement risk for span/environment; a `standard_uf` panel where the project requires `naf`/`ulef`). | Design | "{Material} isn't suitable for {use}: {reason}. A suitable alternative is {node}." | Line refused at validation; packet version preserved; suggested nodes attached. | Stops fit-for-purpose failures before atoms move; encodes material science as enforcement. |
| `LABOR_TIER_UNAVAILABLE` | No eligible channel holds the required tier/scope certification within the routing radius. | Quote | "This work needs a certified {tier} and none is available within {radius}. Options: widen radius, split scope, or schedule later." | Scope blocked; capability gap logged to registry analytics. | Direct, quantified workforce-demand signal — which certifications the region lacks. |
| `ENVELOPE_EXCEEDED` | A fabrication op falls outside every eligible MachineEnvelope (dimension, operation, mode, tolerance, or excluded material). | Design / Quote | "{Component} exceeds what bounded local cells can safely make ({limit}). It can be routed to a special-order fabricator instead." | Line re-marked `special_order` (owner confirms) or spec revised; refusal names the failed limit. | Keeps bounded machines bounded — the safety envelope holds; routes oversize work honestly. |
| `CAPTURE_CONFIDENCE_LOW` | The capture a line depends on is below the confidence policy for the vertical (stale, unverified, or low-precision). | Design | "The measurement of {site interface} isn't precise/recent enough to fabricate against. Re-capture is needed first." | Packet validation blocked for dependent lines; re-capture task created. | Enforces 'data travels first' honestly — no fabrication against uncertain ground truth. |
| `SITE_CONDITION_UNRESOLVED` | Capture revealed a condition that must be resolved before the scope is well-defined (rot, out-of-tolerance opening, unknown substrate). | Design / Fulfillment | "Capture found {condition} at {location}. The scope can't be finalized until it's assessed." | Dependent scope held; assessment task (often `VER` or `INST-S`) routed first. | Converts on-site surprises into pre-routing findings; protects first-fit and the schedule. |
| `SUBSTITUTION_REQUIRES_OWNER` | A channel can fulfill only with a spec-equivalent substitute, and the line's policy requires owner approval. | Quote | "{Channel} can supply {alternative} instead of {specified}. Both meet the spec. Approve to proceed with this channel." | Quote returned in `conditional` state; owner approval event required to accept. | Keeps the owner in control of substitutions without blocking commerce; approval is auditable. |
| `SAFETY_REVIEW_REQUIRED` | A finding or scope triggers human safety review before routing (structural implication, hazardous material indicator, steward halt). | Any | "This project includes {finding}, which requires a qualified safety review before work can proceed." | Routing suspended for the scope; review task created for `VER`/licensed reviewer; outcome recorded. | Names risk early instead of discovering it mid-fulfillment; steward refusal authority lands here. |
| `PERMIT_REQUIRED` | The scope falls under permitting/inspection jurisdiction (structural alteration, egress change, code-triggered replacement rules). | Design / Purchase | "This work requires a permit/inspection in your jurisdiction. The record will track filing and inspection as project steps." | Permit service input added; fulfillment milestones extended with inspection gates; `VER` (AHJ) bound to closure. | Regulated scope is declared at design time, on the record — not discovered at demo. |
| `RELEASE_POLICY_UNSATISFIED` | A channel cannot satisfy the owner's release policy (escrow terms, verification requirement, data-handling terms). | Quote / Purchase | "{Channel} can't meet the release terms on this project ({term}), so it isn't eligible." | Channel excluded from the scope; exclusion reason preserved. | Makes governance terms enforceable market conditions, not aspirations. |

Refusal record shape (all codes share it):

```jsonc
{
  "code": "ENVELOPE_EXCEEDED",
  "packetId": "pkt_…", "packetVersion": 2, "lineRef": "bom.3",
  "message": "edge.profile on 124in panel exceeds sheet-cell X limit (96in).",
  "ownerExplanation": "The top panel is longer than local cells can safely profile…",
  "raisedBy": "system:orchestrator.validate",      // or "steward:cert_…"
  "raisedAt": "2026-06-04T15:21:08Z",
  "suggestedActions": ["split_component", "route_special_order"]
}
```

---

## 9. WorkPacket schema extensions

TypeScript-style definitions for review. These are reference contract shapes, not a claim that a separate shipped schema package is included in this public package.

```ts
/** Ontology references are always (nodeId, ontologyVersion)-stable. */
type NodeRef = string;            // e.g. "mat.sheet.plywood.cabinet.0750"
type TierCode = "OP" | "OP-MS" | "CS" | "INST" | "INST-S" | "VER" | "SVC" | "OA";

interface MaterialSpec {
  lineId: string;
  class: "raw" | "ingredient" | "component" | "vendor_product"
       | "finished_good" | "site_interface" | "service_input";
  node: NodeRef;
  qty: number;
  unit: "sheet" | "bf" | "lf" | "ea" | "sqft" | "gal" | "oz";
  useClass: "interior" | "exterior" | "structural" | "wet";
  emissionClass?: "none" | "naf" | "ulef" | "standard_uf" | "unknown"; // §4 rule 3; enforced via MATERIAL_UNSUITABLE
  consumes?: string[];            // lineIds of inputs (components consume raws)
  fabrication?: FabricationOp[];  // component lines only
  performance?: Record<string, number | string>; // vendor_product lines
  tolerance?: { dim: string; plusMinusIn: number }[];
  substitution: "exact" | "spec_equivalent" | "owner_approval";
  binding?: { channelId: string; sku: string; ownerApprovedEvent: string }; // §7.2
  routable: "cell" | "vendor" | "special_order" | "site";
}

interface FabricationOp {
  type: "crosscut" | "rip" | "miter" | "drill" | "rout.stencil"
      | "rout.profile" | "edge.profile" | "drill.pattern" | "finish.spray";
  mode?: 1 | 2 | 3;               // sheet-cell modes where applicable
  params: Record<string, number | string>;
  requiredToleranceIn: number;
}

interface LaborRequirement {
  lineId: string;
  task: string;                   // "fabricate" | "confirm.material" | "install.window.fullframe" | ...
  tier: TierCode;
  scope?: string;                 // service/install scope key, e.g. "install.window.fullframe"
  riskClass: "standard" | "elevated" | "regulated";
  estHours?: number;
  verificationRequired?: { tier: "VER"; method: string };
}

interface MachineRequirement {
  forLine: string;                // MaterialSpec.lineId
  ops: FabricationOp[];
  envelopeClass: "dimensional_cell" | "sheet_cell" | "manual_station" | "vendor_factory";
}

interface ChannelCapability {
  channelId: string;
  envelopes: { envelopeId: string; certifiedTiers: TierCode[] }[];
  serviceScopes: string[];        // "install.window.fullframe", "transport.record", ...
  location: { lat: number; lng: number };
  releasePolicyCompliance: { escrow: boolean; ownerVerification: boolean; dataTerms: string };
}

interface RefusalReason {
  code: "MATERIAL_UNAVAILABLE" | "MATERIAL_UNSUITABLE" | "LABOR_TIER_UNAVAILABLE"
      | "ENVELOPE_EXCEEDED" | "CAPTURE_CONFIDENCE_LOW" | "SITE_CONDITION_UNRESOLVED"
      | "SUBSTITUTION_REQUIRES_OWNER" | "SAFETY_REVIEW_REQUIRED"
      | "PERMIT_REQUIRED" | "RELEASE_POLICY_UNSATISFIED";
  packetId: string; packetVersion: number; lineRef?: string;
  message: string; ownerExplanation: string;
  raisedBy: string; raisedAt: string;
  suggestedActions: string[];
}

interface OutcomeMetric {
  name: "atom_miles" | "site_visits" | "first_fit" | "scrap_fraction"
      | "local_value_share" | "callback_rate" | "time_to_resolved_scope_days"
      | "refusal_count" | "lead_time_days";
  value: number | boolean;
  basis: "measured" | "channel_reported" | "derived";
  sourceEvents: string[];         // event ids — every metric is auditable
}
```

---

## 10. Database extensions

SQL-style definitions extending the v2 schema in `docs/ARCHITECTURE.md`. Kept deliberately plain.

```sql
CREATE TABLE material_classes (
  code text PRIMARY KEY,            -- 'raw','ingredient','component','vendor_product',
                                    -- 'finished_good','site_interface','service_input'
  description text NOT NULL
);

CREATE TABLE material_specs (       -- ontology nodes (versioned, never deleted)
  id text NOT NULL,                 -- 'mat.sheet.plywood.cabinet.0750'
  ontology_version text NOT NULL,
  class text NOT NULL REFERENCES material_classes(code),
  name text NOT NULL,
  grade text,
  use_classes text[] NOT NULL DEFAULT '{}',
  dimensional_basis jsonb,
  performance jsonb,                -- vendor_product attributes (U-factor, SHGC, ...)
  movement_coeffs jsonb,
  sustainability jsonb,
  deprecated_at timestamptz,
  PRIMARY KEY (id, ontology_version)
);

CREATE TABLE sku_mappings (         -- channel fulfillment mapping; never identity
  channel_id text NOT NULL,
  material_node_id text NOT NULL,
  ontology_version text NOT NULL,
  sku text NOT NULL,
  price_cents bigint NOT NULL,
  stock_qty int,
  as_of timestamptz NOT NULL,
  PRIMARY KEY (channel_id, material_node_id, ontology_version)
);

CREATE TABLE labor_tiers (
  code text PRIMARY KEY,            -- 'OP','OP-MS','CS','INST','INST-S','VER','SVC','OA'
  name text NOT NULL,
  description text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  regulated boolean NOT NULL DEFAULT false
);

CREATE TABLE machine_envelopes (
  id text PRIMARY KEY,              -- 'cell.sheet.v1'
  envelope_class text NOT NULL,     -- 'dimensional_cell','sheet_cell','manual_station','vendor_factory'
  dimension_limits jsonb NOT NULL,
  operation_types text[] NOT NULL,
  modes text[] NOT NULL DEFAULT '{}',
  tolerance_model jsonb NOT NULL,   -- {"rout.stencil:2": 0.03125, "edge.profile:3": 0.015625}
  refusal_boundary jsonb NOT NULL,  -- excluded materials/ops; steward-review triggers
  station_flags text[] NOT NULL DEFAULT '{}'
);

CREATE TABLE channel_capabilities (
  channel_id text NOT NULL,
  envelope_id text REFERENCES machine_envelopes(id),
  certified_tiers text[] NOT NULL DEFAULT '{}',
  service_scopes text[] NOT NULL DEFAULT '{}',
  location point,
  release_policy jsonb NOT NULL,    -- escrow / owner-verification / data terms
  PRIMARY KEY (channel_id, envelope_id)
);

CREATE TABLE routing_evaluations (  -- explainability: every eligibility decision kept
  id uuid PRIMARY KEY,
  packet_id uuid NOT NULL, packet_version int NOT NULL,
  scope text NOT NULL,
  channel_id text NOT NULL,
  eligible boolean NOT NULL,
  reasons jsonb NOT NULL,           -- per-conjunct pass/fail (§6 matching rule, tiers, SKU coverage, policy)
  evaluated_at timestamptz NOT NULL
);

CREATE TABLE project_metrics (      -- OutcomeMetric rows at close (+ interim snapshots)
  project_id uuid NOT NULL,
  name text NOT NULL,
  value numeric,
  value_bool boolean,
  basis text NOT NULL,              -- 'measured','channel_reported','derived'
  source_events bigint[] NOT NULL DEFAULT '{}',
  computed_at timestamptz NOT NULL,
  PRIMARY KEY (project_id, name, computed_at)
);

CREATE TABLE atom_movements (       -- every material transport leg, ground truth
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL,
  fulfillment_id uuid,
  leg text NOT NULL,                -- 'stock_to_cell','cell_to_home','vendor_to_home',
                                    -- 'installer_to_site','disposal'
  miles numeric NOT NULL,
  mode text NOT NULL,               -- 'owner_pickup','box_truck','ltl_freight','service_vehicle'
  reported_by text NOT NULL,        -- channel id or 'owner'
  recorded_at timestamptz NOT NULL
);
```

---

## 11. Woodwork proof case — Sarah's alcove built-in

**Project:** painted alcove built-in, three fixed shelves, scribed sides. **Why it is the fabrication proof:** every BOM line is fabricable within bounded local cells; the packet exercises capture confidence, material confirmation (`OP-MS`), mode-2 and mode-3 operations, steward involvement (`CS`), and owner assembly (`OA`).

**MaterialSpecs (summary):** raw — 3 sheets 3/4″ cabinet-grade birch plywood; 40 lf birch edge banding; ingredients — 1 gal interior acrylic paint, adhesive; components — 2 scribed side panels, 3 shelves, 2 nailers, 1 top panel with profiled front edge (mode 3); site interface — alcove walls/floor (scan, verified, walls out of square 3/8″ over height); finished good — the built-in.

**Labor requirements:** `OP` fabricate (mode-2 stencil runs); `OP-MS` material confirmation (sheet flatness for the 88″ sides); `CS` mode-3 fixturing for the edge profile; `OA` assembly per labeled instructions; owner verification at close.

**Machine requirements:** sheet cell — `rout.stencil` mode 2 (±1/32″), `edge.profile` mode 3 (±1/64″), `drill.pattern` for shelf-pin holes; dimensional cell — crosscut nailers; stations — `secondary_ops` (sever stencil attach points, sand), `prefinish` (spray), `label`.

**Eligible routing:** store production cell 6 mi (full envelope, OP/OP-MS/CS certified, SKU coverage 1.0); independent fab shop 14 mi (no `prefinish` station — quotes with finish as separate line or `OA` task); vendor network (eligible but high atom-miles; quoted for comparison).

**Possible refusals (this packet's realistic set):** `CAPTURE_CONFIDENCE_LOW` if the scan predates policy or lacks floor-plane verification; `MATERIAL_UNSUITABLE` if solid-wood panel were specified at this width for fixed cross-grain attachment (movement risk); `ENVELOPE_EXCEEDED` if the top panel exceeded the cell's mode-3 X-limit; `MATERIAL_UNAVAILABLE` if cabinet-grade stock is out at all in-radius channels; steward `SAFETY_REVIEW_REQUIRED` on observed delamination mid-run.

**Outcome metrics targeted:** `first_fit` (scribed sides meet out-of-square walls without site rework), `scrap_fraction` (nesting against validated dims), `atom_miles` (single owner-pickup leg), `site_visits` (target: 1 — install/assembly day), `local_value_share`.

### Reference example — Woodwork WorkPacket

Full annotated example: [`WORKPACKET_EXAMPLES.md` — WorkPacket Examples §1 (Woodwork)](WORKPACKET_EXAMPLES.md) (machine-readable JSON included inline).


---

## 12. Windows proof case — homeowner window replacement

**Project:** replace one failing 36×60 double-hung unit. Capture reveals deteriorated sill flashing — the project becomes a **full-frame** replacement, not an insert. **Why it is the orchestration proof:** the packet mixes a vendor product (the unit), site-fabricable trim components, a flashing system, elevated-risk install labor, a permit consideration, finance/warranty records, and multi-channel decomposition — the governed record coordinating actors no single channel controls.

**Vendor product:** window unit specified by performance, not brand — `vnd.window.dh.36x60` with `performance: {uFactor ≤ 0.30, shgc ≤ 0.40, glazing: "dual.lowE.argon", cladding: "exterior_clad"}`. Substitution policy `owner_approval`: equivalent units from different manufacturers may be quoted; the owner approves the substitution explicitly.

**Flashing system:** `vendor_product` lines for pan flashing and flashing tape specified as a *system* (`systemCompatibility: "wrb.tie_in.classA"`) — components must be mutually compatible, which is a spec-level constraint, not a brand lock.

**Trim components:** interior extension jambs and casing are `component` lines, `routable:"cell"` — fabricated locally from primed pine to the captured wall depth (5 9/16″). This is the inversion inside one project: the manufactured unit travels because it must; the trim does not, because it needn't.

**Insert vs full-frame as a labor-tier decision:** insert replacement is `install.window.insert`, `riskClass:"standard"`, tier `INST`. Full-frame replacement integrates WRB and flashing: `install.window.fullframe`, `riskClass:"elevated"`, tier `INST-S`. The capture finding (`SITE_CONDITION_UNRESOLVED` → assessment → resolved as full-frame) is what flipped the scope — recorded, explained, and priced before purchase rather than discovered on site.

**Routing:** vendor scope → vendor adapter (RFQ on performance spec); trim scope → local cell (`OP`); install scope → tiered service provider with `INST-S` + `install.window.fullframe`; verification → independent `VER` (water-test method) bound to closure; finance → escrow instrument held until owner verification; warranty → vendor warranty terms preserved to the outcome.

**Possible refusals:** `SITE_CONDITION_UNRESOLVED` (the sill finding, already exercised); `LABOR_TIER_UNAVAILABLE` if no `INST-S` channel is in radius; `SUBSTITUTION_REQUIRES_OWNER` on an equivalent unit; `PERMIT_REQUIRED` where jurisdiction treats full-frame replacement as permitted work (checked at design; this example's jurisdiction: not required, recorded as checked); `RELEASE_POLICY_UNSATISFIED` if an installer declines escrow-on-verification terms; `MATERIAL_UNSUITABLE` if interior-rated tape were specified for the exterior tie-in.

**Outcome metrics targeted:** `site_visits` (target 2: assessment+capture, install day), `first_fit`, `callback_rate` (water intrusion is the classic callback; the `VER` water-test is the countermeasure), `atom_miles` split by scope (vendor freight vs local trim), `time_to_resolved_scope_days` (capture → full-frame decision).

### Reference example — Windows WorkPacket

Full annotated example: [`WORKPACKET_EXAMPLES.md` — WorkPacket Examples §2 (Windows)](WORKPACKET_EXAMPLES.md) (machine-readable JSON included inline).


---

## 13. Outcome examples

### Reference example — Woodwork Outcome

Full annotated example: [`WORKPACKET_EXAMPLES.md` — WorkPacket Examples §3 (Woodwork Outcome)](WORKPACKET_EXAMPLES.md) (machine-readable JSON included inline).


### Reference example — Windows Outcome

Full annotated example: [`WORKPACKET_EXAMPLES.md` — WorkPacket Examples §4 (Windows Outcome)](WORKPACKET_EXAMPLES.md) (machine-readable JSON included inline).


---

## 14. Governance notes

**Owner-controlled release.** Nothing routes without the owner's release action at each commercial gate (quote request, quote acceptance, order, dispatch). Release policies (escrow terms, verification requirements, data terms) are owner-set per project and enforced as eligibility conditions (`RELEASE_POLICY_UNSATISFIED`), not preferences.

**Capability-scoped channel access.** Channel actors receive project-scoped capability tokens minted by the owner's release. A token grants read of the packet scope routed to that channel and write of the event types that scope legitimately produces (quote, milestone, transport leg, scrap report, execution report) — nothing else.

**Immutable packet versions.** Packets are never edited; revision creates a new version. Refusals attach to the version that earned them and are preserved.

**Quote ↔ exact packet version.** Every quote binds `packetVersion`. If the packet revises after quoting, prior quotes are marked stale and cannot be accepted against the new version.

**Fulfillment ↔ exact packet version.** Dispatch binds the fulfillment (and every decomposed child) to the quoted version. A channel executing anything other than the bound version is executing outside its grant.

**Outcome ↔ final packet version.** The outcome record cites the executed version, the as-built deltas against it, and the verification events that closed it — the complete, auditable chain from capture to warranty.

**No channel receives the full home record by default.** Channels see packets (scoped), never homes. Cross-project context (e.g., "match the casing profile from the 2025 project") enters a packet as an ontology-termed constraint placed there by the owner, not as record access granted to a vendor.

---

## 15. Pilot measurement notes

The ontology is what makes these variables *measurable rather than asserted*: because packets, legs, refusals, and reports all use stable vocabulary, every metric below is computable from record events with named sources. None is presented as a validated result; the pilot's purpose is to produce the distributions.

| Variable | Definition (computation) | What the ontology contributes |
|---|---|---|
| **Atom miles** | Σ `atom_movements.miles` per project, splittable by scope and mode | Legs are typed (`stock_to_cell`, `vendor_to_home`, …) so local vs freight travel is separable |
| **Site visits** | Count of distinct on-site labor/service events per project | Labor scopes distinguish assessment, install, callback — visits are classified, not just counted |
| **First-fit rate** | Fraction of projects whose owner-verification (or `VER`) event closes without a rework flag | Verification methods are named per scope; "fit" has a defined test |
| **Scrap fraction** | Channel-reported offcut mass ÷ input mass per fabrication scope | `consumes` links give known inputs; scrap is reported against them |
| **Local value share** | Σ spend to channels within `routing_radius_km` ÷ total spend | Channel locations and scope-level orders make the split exact |
| **Callback rate** | Post-close service events per project within a window, by cause class | Outcome service notes and warranty scopes classify causes |
| **Time to resolved scope** | Days from first capture to the packet version that validated clean | `SITE_CONDITION_UNRESOLVED` resolution events mark the endpoint |
| **Refusal frequency** | Refusals per packet version, by code, vertical, and region | The taxonomy (§8) makes refusals aggregable and comparable |
| **Workforce training signals** | Distribution of tier demand vs `LABOR_TIER_UNAVAILABLE` refusals; frequency of `OP-MS`/`CS` judgment events per packet | Tier and skill codes turn workforce demand into registry-queryable data for education partners |

Reporting discipline: every metric row carries `basis` (`measured` / `channel_reported` / `derived`) and `sourceEvents`, so reviewers can distinguish instrument readings from partner attestations, and audit either.

---

## 16. Closing statement

The ontology exists so governed data can travel first — meaningfully and safely — before atoms move. The packet is the contract. The ontology is the language that lets the contract survive each boundary crossing: from the homeowner's capture, through validation and routing, across stores, cells, vendors, installers, and finance, and back into the record the owner keeps. Every table, tier, envelope, and refusal code in this document serves that single requirement.
