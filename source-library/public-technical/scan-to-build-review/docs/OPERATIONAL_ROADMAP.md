# Operational Roadmap

**Scan-to-Build / Home as a Twin — the operating spine, shown by the public proof harness.**

Document: `docs/OPERATIONAL_ROADMAP.md`
Status: Public technology demonstration · single-file proof harness · reviewer UI
Posture: Simulation only · no live machine control · no production deployment
Source of truth: **the public review artifacts in this package.** Code-shaped examples below are
review contracts and implementation targets; they do not assert that a shipped implementation
source tree is included in this public package unless that source is separately present.

> This document does not claim production readiness, live machine control, measured
> environmental performance, regulatory compliance, safety certification, university
> endorsement, or any legal/IP conclusion. Modeled values are labeled modeled.

## Where this sits

Three companion documents define the foundation and are not re-proven here:
[Architecture](./ARCHITECTURE.md), [Material & Labor Ontology](./MATERIAL_AND_LABOR_ONTOLOGY.md),
and [Machine Function & Kinematic Ontology](./MACHINE_FUNCTION_KINEMATIC_ONTOLOGY.md). This
roadmap begins after those exist and answers one question: **given an owner-held record, a
published ontology, and a bounded machine-behavior layer, what does the operating spine now
do?** The demonstrated answer is a single sequence —

> owner-held record -> governed WorkPacket -> validation / refusal -> bounded routing -> owner
> consent -> simulation-only execution report -> preserved outcome -> portable export.

— and the rest of this document shows the machinery that runs it.

## 1. The recurring example: Sarah's alcove

Sarah wants a painted built-in for an out-of-square alcove. In the conventional model her
intent enters a sales funnel: she hands measurements and contact details to vendors, gets
opaque quotes, and ends up owning the object but no structured record of what was specified,
refused, changed, or paid. The next project starts from zero.

The prototype demonstrates a different order. Sarah begins with an owner-held record; her
intent becomes a versioned WorkPacket, validated against the published ontology; where it
cannot be satisfied honestly the system refuses and preserves the refusal as data; eligible
and refused cells are both shown, with reasons; consent is packet-scoped; execution is
simulation only — the cloud never drives a machine — and the outcome returns to her record,
which exports in full. The claim is narrow and checkable: **the operating spine is coherent
and runs end to end.**

## 2. The grid is the architecture

The record is a grid — verticals (rows) against the five actions every project moves through
(Research -> Design/Configure -> Quote/Shop -> Purchase -> Fulfillment). A cell is an
addressable work surface, not a marketing tile. Every artifact belongs to
`home -> vertical -> project -> stage`, which keeps custody, authorization, routing, and
export legible. The homeowner owns the home record and everything beneath it; vendors, stores,
fabricators, installers, and financiers contribute to it but never replace the homeowner as
holder.

## 3. The inversion: governed data travels before atoms

The conventional pipeline moves atoms first and data incidentally — measure, quote, order,
install, records fragmented across vendors. The inversion: **the record comes first, and the
governed packet travels before any atoms move.** The home is an append-only event stream the
homeowner holds; intent, capture, validation, routing, consent, execution reporting, and
outcome are all events on it. Most waste in the conventional model is information waste —
remeasuring, requoting, re-explaining, losing project knowledge at close — and when
information is fragmented, each actor uses its fragment as leverage. The WorkPacket reduces
that arbitrage by being the common object of work: the same governed packet routes to a store,
cell, vendor, installer, finance rail, or reviewer without changing meaning. Local
vocabularies (SKUs, labor titles, machine codes) map to the ontology rather than becoming the
truth.

Two patents in the project's lineage frame the same split the code preserves — a Definition
Layer (US 9,720,401, resolving *what is to be made* before anything is cut) and an Execution
Layer (US 10,768,609, the bounded handoff to fabrication). These are cited as context for the
invention logic, **not** as legal conclusions about scope or coverage; the repository
implements the operational discipline they imply — definition before execution, bounded
handoff — as running software.

## 4. Old model vs this model

| Question | Conventional | This model |
|---|---|---|
| Who holds the record | Seller / vendor / platform CRM | The homeowner (event stream) |
| When data travels | After intent becomes a vendor transaction | Before atoms move, under owner consent |
| The specification | Quote lines, vendor forms, notes | Immutable, versioned WorkPacket |
| What governs meaning | Vendor vocabulary | Published ontology |
| When something can't be done | Silent substitution or quiet drop | Structured refusal, preserved as data |
| Machine capability | Sales claim or shop judgment | MachineEnvelope with limits, tolerance, safety readiness |
| Consent | Broad transaction-level sharing | Packet-only, scoped, revocable |
| Execution here | Physical work | Simulation-only report; no live control |
| What returns | Object, invoice, warranty fragments | Outcome event, preserved refusals, basis-labeled metrics, exportable record |
| Next project | Start over | The record accumulates |

## 5. Layer map and version pins

The record is upstream of orchestration; the ontology is published language; vendor SKUs,
labor titles, and machine codes are mappings to it, not the truth.

```
┌─────────────────────────────────────────────┐
│  Reviewer UI / proof harness                  │  <- reads governed envelopes only
└───────────────┬─────────────────────────────┘
                │ HTTP (JSON)
┌───────────────▼─────────────────────────────┐
│  API envelope                                 │  <- transport shape only, no business logic
└───────────────┬─────────────────────────────┘
                │ calls the façade
┌───────────────▼─────────────────────────────┐
│  Orchestrator façade                          │  <- proposes; never the authority
│    validate · route · execute(sim) · archive │
└───────────────┬─────────────────────────────┘
                │ reads / appends events
┌───────────────▼─────────────────────────────┐
│  Owner-held event store                       │  <- the authority
└───────────────┬─────────────────────────────┘
                │ governed by
┌───────────────▼─────────────────────────────┐
│  Ontology + schemas                           │  <- published language
└─────────────────────────────────────────────┘
```

Every WorkPacket pins the vocabulary it validated against, so a packet is reconstructable
forever. In implementation, nodes are deprecated rather than deleted:

```ts
export const ONTOLOGY_VERSION         = "ontology/2026.06"         as const;
export const MFKO_VERSION             = "mfko/1.2"                 as const; // machine-function ontology
export const MACHINE_ENVELOPE_VERSION = "machineEnvelope/1.1-demo" as const;
export const PACKET_SCHEMA_VERSION    = "packet/v2"               as const;
```

## 6. The WorkPacket contract

A WorkPacket is the unit of governed work — not a quote, SKU list, or drawing, but a
versioned, validated, **immutable** scope drawn from the owner-held record and expressed in
the ontology. A revision is a new version; refusals attach to the version that earned them and
are preserved. This is the review-contract shape used by the package:

```ts
export const WorkPacket = z.object({
  id:              z.string(),
  projectId:       z.string(),
  version:         z.number().int().positive(),
  schemaVersion:   z.literal(PACKET_SCHEMA_VERSION).default(PACKET_SCHEMA_VERSION),
  spec:            WorkPacketSpec,
  ontologyVersion: z.string(),
  validationOk:    z.boolean(),
  refusals:        z.array(RefusalReason).default([]),   // preserved on THIS exact version
  createdAt:       z.string(),
}).strict();
```

The owner authors and revises the `spec`. Note `summary` must be >= 6 chars (thin summaries
cannot route), `captures` must be non-empty (nothing is guessed), and `releasePolicy` defaults
to escrow + owner-verification + `packet_only` — the sharing terms travel *with* the work:

```ts
export const WorkPacketSpec = z.object({
  summary:         z.string().min(6),
  envelope:        DimensionalEnvelope,                  // wIn / hIn / dIn, all positive
  captures:        z.array(CaptureReference).min(1),
  siteInterfaces:  z.array(SiteInterface).default([]),   // the highest-leverage refusal source
  bom:             z.array(MaterialSpec).min(1),          // lines reference ontology nodes
  labor:           z.array(LaborRequirement).default([]),
  finish:          FinishSpec.optional(),
  ontologyVersion: z.string(),
  releasePolicy:   z.object({
    escrow:                    z.boolean().default(true),
    ownerVerificationRequired: z.boolean().default(true),
    dataTerms:                 z.enum(["packet_only", "packet_plus_context"]).default("packet_only"),
  }).default({ escrow: true, ownerVerificationRequired: true, dataTerms: "packet_only" }),
}).strict();
```

The `CaptureReference.confidence` field (0..1) drives `CAPTURE_CONFIDENCE_LOW`; the
`SiteInterface.resolved` flag drives `SITE_CONDITION_UNRESOLVED`. Validation returns refusals
as data, it does not throw:

```ts
export type ValidationResult = { ok: boolean; refusals: RefusalReason[] };
```

## 7. Refusal preservation — the refusal is a record, not an error

A refusal is a structured, preserved statement that a packet or line cannot proceed as
specified. Refusals are **data, not exceptions**: versioned onto the packet, explained to the
owner in plain terms, and retained permanently — the refusal corpus is the empirical input to
envelope tuning and curriculum design. The codes are presented as a single stable enum, grouped by source:

```ts
export const RefusalCode = z.enum([
  // capture / site
  "CAPTURE_CONFIDENCE_LOW", "SITE_CONDITION_UNRESOLVED",
  // material
  "MATERIAL_UNAVAILABLE", "MATERIAL_UNSUITABLE", "EMISSION_CLASS_CONFLICT",
  "SUBSTITUTION_REQUIRES_OWNER",
  // labor
  "LABOR_TIER_UNAVAILABLE", "ROLE_NOT_CERTIFIED",
  // machine envelope
  "ENVELOPE_EXCEEDED", "TOOL_REGISTRY_MISSING", "CALIBRATION_STALE",
  // safety / controller
  "OPERATOR_NOT_CLEAR", "CONTROLLER_HANDSHAKE_MISSING",
  "REMOTE_LIVE_MOTION_COMMAND_REFUSED", "GUARD_NOT_CONFIRMED",
  "PRODUCTION_READINESS_NOT_ESTABLISHED",
  // governance / regulatory
  "SAFETY_REVIEW_REQUIRED", "PERMIT_REQUIRED", "RELEASE_POLICY_UNSATISFIED",
]);
```

Every refusal carries the same shape, and `ownerExplanation` is required and never blank — the
system must always be able to tell the owner *why* in plain language:

```ts
export const RefusalReason = z.object({
  code:             RefusalCode,
  packetId:         z.string(),
  packetVersion:    z.number().int().positive(),
  lineRef:          z.string().nullable().default(null),    // packet-level vs line-level
  message:          z.string(),                             // technical, for engineers
  ownerExplanation: z.string().min(1),                      // plain-language, REQUIRED
  raisedBy:         z.string(),                             // 'system:orchestrator.validate' | 'steward:…' | 'system:safety'
  raisedAt:         z.string(),
  suggestedActions: z.array(z.string()).default([]),
  classification:   z.enum(["healthy", "capability_gap", "safety_hold"]).default("healthy"),
}).strict();
```

The `classification` is load-bearing and drives the continuous-engineering loop:

- **healthy** — the bounded system worked as designed (owner approval needed, low capture,
  unresolved site, emission conflict). Not a reason to expand capability.
- **capability_gap** — the cell genuinely lacks a capability the envelope might evolve to
  cover. Candidate evidence (see [Continuous Engineering](./CONTINUOUS_ENGINEERING.md)).
- **safety_hold** — a boundary that must not be bypassed. **Never** a capability-addition
  candidate.

A real refusal from Sarah's v1 packet, as it appears in the record:

```json
{
  "code": "EMISSION_CLASS_CONFLICT",
  "packetId": "pkt_alcove",
  "packetVersion": 1,
  "lineRef": "bom:panel",
  "message": "bom line 'panel' resolves to emissionClass=standard_uf; project constraint requires naf|ulef",
  "ownerExplanation": "The panel you selected is standard MDF. Your project requires a low-emission (NAF) panel, so this can't proceed until the panel is changed.",
  "raisedBy": "system:orchestrator.validate",
  "raisedAt": "2026-06-12T18:41:07.220Z",
  "suggestedActions": ["Choose a NAF or ULEF panel in the material comparison step"],
  "classification": "healthy"
}
```

## 8. The API envelope — every response states its own basis

The API envelope is transport only; it duplicates no business logic and calls the façade for
all state. What it *adds* is a consistent envelope that preserves the governance lens the spine
already produces, so no caller can mistake a modeled estimate for a measured result or a
simulated run for live control:

```ts
export interface ApiEnvelope<T> {
  ok: true;
  simulation: true;                                         // always present, always true
  data: T;
  governance?: GovernanceLens;
  basis?: "modeled" | "measured" | "derived" | "mixed" | "n/a";
  disclosure?: "owner_private" | "packet_only" | "modeled_public" | "aggregate";
  notice?: string;
}

export interface GovernanceLens {
  knows?: string; unknown?: string; modeled?: string; verified?: string;
  refused?: string; shared?: string; private?: string; returnedToRecord?: string;
}
```

A refusal is **not** an error — it returns HTTP 200 with `refused: true`. Malformed input is a
structured 4xx instead, never a stack trace:

```ts
export interface ApiRefusalResponse {
  ok: false;
  refused: true;
  simulation: true;
  refusals: ApiRefusal[];
  governance?: GovernanceLens;
}
```

The full route surface:

```
GET  /api/health
GET  /api/record/sarah               GET  /api/events/sarah
POST /api/packets                    POST /api/packets/:id/validate
GET  /api/materials                  POST /api/materials/compare
GET  /api/cells                      POST /api/cells/route
POST /api/execution-envelope         POST /api/execution-report
POST /api/outcomes/archive           GET  /api/export/sarah
POST /api/safety/live-motion         <- ALWAYS refuses (the boundary, proven on the wire)
GET  /api/workforce/sarah   GET  /api/custody/sarah   GET  /api/evolution/sarah
```

`POST /api/safety/live-motion` is on the surface *on purpose*: it returns
`REMOTE_LIVE_MOTION_COMMAND_REFUSED` (classification `safety_hold`) with or without a packet
reference. The boundary is not asserted in prose — it is a route that refuses.

## 9. The orchestrator façade

The spine is a façade over the record. It **proposes**; the record is
the authority. Every governed action is written back as an event with a custody annotation,
and no spine method commands live motion. Core moves: `createPacketVersion` (immutable,
validating), `compareMaterials`, `route`, `grantConsent`, `fabricate` (build simulation-only
envelope + simulate), `archive`, `export`, plus the derived views `workforceRoleMap`,
`custodyLedger`, and `capabilityEvolution`. The safety gates in `fabricate` cannot be bypassed
from above — an unresolved packet yields `PRODUCTION_READINESS_NOT_ESTABLISHED`, and the
live-motion path refuses unconditionally.

## 10. Sarah's journey, end to end

The Sarah proof sequence walks the same path and exposes the governance lens at each step
(*knows · unknown · modeled · verified · refused · shared · private · returned to record*).

1. **Baseline record** — exists before any vendor or cut; the root everything attaches to.
2. **Intent** — painted built-in, three fixed shelves, scribed to an out-of-square alcove,
   with a low-emission (NAF) panel constraint.
3. **Capture** — first measurement low-confidence (`confidence: 0.62`, `verified: false`).
4. **WorkPacket v1 — refuses.** `CAPTURE_CONFIDENCE_LOW`, `SITE_CONDITION_UNRESOLVED`, and
   `EMISSION_CLASS_CONFLICT` (standard-MDF panel against the NAF constraint). `validationOk:
   false`; v1 is preserved with its refusals attached, not erased.
5. **Material comparison** — a modeled tradeoff surface (carbon / VOC / logistics, all
   `basis: "modeled"`), options not a single answer.
6. **Owner selects** a NAF/ULEF panel that meets the constraint; the choice is recorded.
7. **WorkPacket v2 — passes.** Verified capture (`confidence: 0.94`), resolved site condition,
   compliant panel; `validationOk: true`, zero refusals. v1's refusals remain in the record.
   The loop — *fail -> refusal explains -> resolve -> revalidate* — is the central mechanic.
8. **Cell routing** — one cell eligible; two refused (`ROLE_NOT_CERTIFIED`,
   `CALIBRATION_STALE`). Price, atom-miles, local share are `modeled`.
9. **Workforce roles** — operations map to named roles, several with refusal authority.
10. **Owner consent** — `dataTerms: packet_only`, scoped, revocable; the full record stays
    private.
11. **Execution envelope** — `controllerPolicy: simulationOnly`,
    `productionReadinessEstablished: false`.
12. **Simulated report** — `executionMode: "simulation"`. Scrap fraction and transport legs
    modeled; cycle time a scenario parameter; no physical cut occurs.
13. **Outcome archive** — returns to the record with basis-labeled metrics and every preserved
    refusal.
14. **Owner export** — the full record exports and round-trips: **19/19 events reconstructed
    via import** in the canonical run.

## 11. Routing, custody, and outcome

**Routing is governed capability matching, not "Uber for machines."** A cell is eligible only
if its MachineEnvelope supports the required operation types, modes, tolerance class,
dimensional limits, and material class, with calibration and tooling current and required
roles certified. If any condition fails the cell is refused with the failed condition named.
In Sarah's run three cells are evaluated — a near store cell (eligible), a regional shop
(refused, `ROLE_NOT_CERTIFIED`), and a distant vendor (refused, `CALIBRATION_STALE`). The
reviewer gets the reason, not just the answer.

**Custody is rendered from the event stream, not asserted separately.** For each event the
record knows whether it is private or shared, with whom, at what scope, whether revocable, and
the data kind (`individual / aggregated / de-identified / none`). The default is packet-only —
a routed channel receives only what the scoped work requires, and channel-shared events are
revocable. The packet leaves the record without replacing it.

**The outcome is a new layer of the record, not its end.** The archive preserves the packet
version executed, the simulated report, operations, materials, deviations, transport legs,
preserved refusals, and metric basis labels. The export is the canonical portability mechanism
(schema `hometwin/v2`) — the record itself, round-tripping via import, with no extra channel
data folded in. That is the difference between *data access* (viewing information held
elsewhere) and *record custody* (carrying the record).

## 12. What is real, what is not

**Real in the prototype:** a runnable, typed orchestrator spine with an append-only owner-held
event store; immutable versioned WorkPackets with structured validation; a refusal engine with
stable codes, required owner explanations, and classifications, preserved across revision and
into the outcome; a published ontology with vendor SKUs/codes mapped to it; MachineEnvelope
matching producing eligible-and-refused results with reasons; modeled material and routing
surfaces, labeled; a safety-gated, simulation-only execution path that refuses remote live
motion and never asserts production readiness; outcome archive with basis-labeled metrics and a
portable export that round-trips; a reviewer UI/proof harness over the governed envelope;
and visible verification checks that exercise the interaction order, custody rules, refusal
logic, routing boundaries, export/import path, and simulation-only execution posture.

**Not claimed:** execution is simulation only — no controller handshake, motion, or production
readiness; cycle time and scrap are scenario parameters. Modeled values (atom-miles,
carbon/VOC/logistics, price, local share, scrap fraction) are demo models, not measured
results, and imply no health or environmental-performance claim. Registries (cells, SKUs,
roles) are fixtures. The demo is single-tenant (Sarah's home). No real supplier, financing,
rebate, or public-program rail is connected.

## 13. What must be validated before any real deployment

Independent safety review and certification of any physical cell (guard/e-stop, calibration
discipline, local-controller motion authority); replacement of modeled logistics/carbon/VOC/
scrap with measured pilot data before any environmental or efficiency claim; regulatory and
permitting examination per jurisdiction; security, privacy, and data-governance review of the
owner-held record and sharing/consent mechanics at scale; real supplier, cell, and workforce
integration replacing the fixtures; independent review of any financing, rebate, or public-
program rail before it touches real money; and legal/IP review by qualified counsel before any
conclusion about scope, protectability, or commercial claims. Until those are done, this
remains a review artifact, not a deployed product.

## 14. Staged pilot path

Each gate is about evidence, not optimism. **Stage 0 — Simulation (now):** owner-held record,
governed packets, refusal preservation, MachineEnvelope reasoning, simulation-only execution
reporting; no physical motion. **Stage 1 — Bench / dry-run:** validate envelope reasoning and
controller-handoff discipline against a non-cutting bench; confirm refusals fire on real
calibration/tool/guard states. **Stage 2 — Supervised physical pilot:** a bounded cell,
supervised, with measured tolerance/scrap/cycle data replacing modeled values; safety review
and local-controller authority are prerequisites. **Stage 3 — Broader operation:** only after
staged evidence, independent safety review, and institutional/regulatory examination outside
this prototype's scope. No stage past 0 is claimed.

## 15. Companion documents

[Continuous Engineering](./CONTINUOUS_ENGINEERING.md) — how bounded cells evolve from the
preserved refusal corpus, without overbuilding or bypassing safety.
[Institutional Study Layer](./INSTITUTIONAL_STUDY_LAYER.md) — how one governed project becomes
a shared study surface across disciplines without taking custody from the owner.
[Future Research & IP Review Areas](./FUTURE_RESEARCH_AND_IP_REVIEW_AREAS.md) — review surfaces
for counsel and technical/institutional reviewers; not legal advice.

---

*This roadmap shows the minimum operating spine demonstrated by the completed public review
artifacts. The homeowner keeps the record; the packet carries only the governed scope; the
ontology preserves meaning across parties; the MachineEnvelope keeps capability bounded;
refusals are preserved rather than hidden; execution stays simulation-only until a physical
stage is independently validated; outcomes return to the record; the export remains portable.
The claim is not that every future capability exists — it is that the order of authority is
correct, executable, and reviewable inside the package.*
