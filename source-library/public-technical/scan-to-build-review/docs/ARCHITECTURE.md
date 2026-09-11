# Homeowner Project Record — Production Architecture (v2)
### Operationalizing the owner-held home digital twin · Scan-to-Build ecosystem

**Companion to `home-twin-app.html`.** The HTML file is a working MVP whose internal layers (Schema → DB → Repositories → API → Orchestrator → UI) are deliberately structured to preserve the intended service seams of the production system described here. A production implementation would keep the same domain boundaries where practical, but replacing the in-browser layer with server, persistence, authentication, security review, integrations, deployment, and operational controls would require ordinary engineering work and may revise transport details.

**Patent basis:** US 9,720,401 · US 10,768,609 — integrated consumer project ordering and fabrication: capture → define → confirm → fabricate → label & release, executed on bounded tandem machinery inside existing retail footprints.

The system implements four governance invariants, and every design decision in this document is downstream of them:

1. **Homeowner controlled** — the homeowner controls the record; no actor replaces the owner as record holder.
2. **Standardized capture** — one governed work-packet shape crosses every vendor boundary.
3. **Intelligent routing** — the orchestration layer routes packets to channels, never the reverse; routing is explainable.
4. **Outcome preservation** — every completed project enriches the record that informs the next one.

This v2 extends v1 with the economic thesis made explicit (§1), a domain-driven design model (§2), a Material & Labor Ontology (§7), machine/SKU integration points (§8), and economic/sustainability instrumentation (§9) — integrated throughout the schema, API, orchestrator, file structure, and roadmap rather than appended.

---

## 1. The Inversion: data travels so atoms don't

Every other section of this document is mechanism. This section is the reason.

### 1.1 The traditional model — atoms travel, information fragments

In conventional home improvement, physical material makes the long, expensive, error-accumulating journey while information stays trapped at each hop. Raw stock moves to a centralized factory; finished goods move through distribution to retail or direct freight; the product arrives at a home whose actual conditions were never part of the manufacturing loop. Measurements are taken by hand, re-entered by a salesperson, re-interpreted by a fabricator, and re-verified (or not) by an installer. Each handoff is a lossy copy. The failure modes are familiar and structural: ill-fitting components, return freight, job-site rework, offcut waste, and lead times dominated not by machining minutes but by transport legs and queue time between disconnected actors. The information asymmetry between actors — who knows the real dimensions, the real stock, the real price — is itself a market position; the v1 deck calls this **information arbitrage**, and the traditional model manufactures it at every hop.

### 1.2 The inverted model — governed data travels, atoms move once

Scan-to-Build inverts the flow. Precise, verified condition data is captured **once, at the home** (the scan; the opening measurement; the material confirmation), versioned into a governed work packet, and routed — at the speed and cost of data — to the *nearest set of atoms already capable of becoming the product*: sheet stock and dimensional lumber already sitting in a local store or fabrication cell, vendor-supplied units only where the bounded envelope requires them. The atoms move **once, a short distance, already correct**, because the design was fully resolved before a tool touched material. The patent's stencil and fixed-sheet modes are this principle in hardware: cutting happens only after the packet is validated, so waste is refused at the source rather than discovered at the job site.

Each invariant is a load-bearing part of the inversion:

| Invariant | Role in the inversion |
|---|---|
| Homeowner controlled | The home is where ground truth lives. Owner-held capture means the highest-fidelity data is generated at the point atoms must ultimately fit — and persists across vendors instead of being re-measured per transaction. |
| Standardized capture | Data can only substitute for atom travel if every actor reads the same shape. The packet is the unit of travel; the ontology (§7) is its vocabulary. |
| Intelligent routing | Minimizing atom travel is a routing objective, not a slogan: the orchestrator scores channels on capability *and* proximity, and quotes carry an atom-miles estimate (§9). |
| Outcome preservation | The as-built record means the *next* project starts from verified data — the inversion compounds. A re-measured home is the traditional model reasserting itself. |

Event sourcing is the inversion's substrate: the record *is* the thing that travels and persists. A packet routed to a fabrication cell, a milestone webhook from an installer, an escrow release — all are events in one owner-held stream, which is why the export file is simultaneously a backup, a vendor-independence guarantee, and the dataset that measures whether the inversion is actually delivering (§9.2).

### 1.3 Quantified framing — design targets, instrumented, not asserted

The honest way to quantify the inversion is to state the model, label the assumptions, and instrument the metrics so every real project measures itself. Illustrative comparison for a custom built-in (the Woodwork anchor case), with parameters clearly marked as **model assumptions** pending pilot data:

| Dimension | Traditional (remote manufacture / custom shop) | Inverted (local governed cell) | Basis |
|---|---|---|---|
| Lead time, capture → install | 2–6 weeks typical (quote cycles, factory queue, freight) | Days (packet validates in minutes; machining is minutes–hours; pickup or single local leg) | Model assumption; instrumented as `lead_time_days` per project |
| Material transport (atom-miles) | Multi-leg: mill → factory → DC → site, hundreds–thousands of miles for the finished good | Final leg < ~25 mi (stock already staged locally); upstream legs unchanged but shared across all store inventory | Instrumented via `transport_legs` (§4) |
| Fit-driven rework | Each re-measure/re-entry hop is an error source; returns and shimming are normalized | Design resolved against capture before cutting; target **first-fit rate** as the headline KPI | Instrumented as `first_fit` on owner-verification milestone |
| Offcut / scrap | Cut decisions made before final dimensions are certain | Nesting against a validated packet; patent notes short components can consume warped stock unusable for long spans | Instrumented as `scrap_fraction` reported by cell |
| Local value share | Margin concentrates at remote manufacture and freight | Fabrication labor, machine time, and material markup stay within the routing radius | Instrumented as `% spend within radius_km` |
| Emissions (derived) | Freight legs × mode factors dominate | Atom-miles reduction flows directly into the derived figure | Computed: Σ(leg_miles × mode_factor_gCO₂e) |

These are **claims about architecture, verified per project by the event store** — not marketing numbers. §9 defines the measurement model; the pilot's job is to fill the table with real distributions.

---

## 2. Domain-driven design model

### 2.1 Domain classification

**Core domain** — the thing that must be built in-house and is the source of differentiation: the **Governed Project Record and its Orchestration** — owner-held event-sourced record, packet lifecycle with refusal logic, gate-checked stage machine, explainable routing. This is where the four invariants live and where no off-the-shelf system suffices.

**Supporting subdomains:** the **Material & Labor Ontology** (reference model, slowly changing, institutionally curated — a natural fit for university/standards stewardship per the NC A&T transfer posture); **Channel Integration** (adapters per store/fab/vendor/service partner); **Capability & Certification Registry** (which channel can do what, with whom).

**Generic subdomains** — buy or use commodity patterns: identity/auth, payments & escrow rails, blob storage, notifications.

### 2.2 Bounded contexts and context map

```
                                ┌──────────────────────────┐
                                │   ONTOLOGY CONTEXT       │
                                │ materials · skills ·     │
                                │ machine capability model │
                                └──────┬────────────┬──────┘
                Published Language ────┤            ├──── Published Language
                                       ▼            ▼
 ┌──────────────────┐  upstream  ┌────────────────────┐  ACL  ┌──────────────────┐
 │  RECORD CONTEXT  │───────────▶│ ORCHESTRATION CTX  │──────▶│  CHANNEL CONTEXT  │
 │ Home · Project · │  (events)  │ gates · refusals · │ per-  │ adapters · jobs · │
 │ WorkPacket ·     │◀───────────│ routing · quote    │adapter│ webhooks · SKUs   │
 │ Outcome (archive)│  (results) │ solicitation       │       │ (anti-corruption) │
 └────────┬─────────┘            └─────────┬──────────┘       └──────────────────┘
          │                                 │
          │ conformist                      │ conformist
          ▼                                 ▼
 ┌──────────────────┐            ┌────────────────────┐
 │ SETTLEMENT CTX   │            │ DOCUMENT CONTEXT   │
 │ Order · Escrow   │            │ scans · labels ·   │
 │ (payment rail)   │            │ instructions (S3)  │
 └──────────────────┘            └────────────────────┘
```

Relationships, precisely: the **Ontology Context publishes a versioned Published Language** that Record, Orchestration, and Channel contexts consume read-only — no context may mutate the vocabulary it validates against. The **Record Context is upstream** of Orchestration: orchestration reads projections and writes results back only as events. Every external party sits behind an **anti-corruption layer** in the Channel Context: a vendor's quote format, a store's SKU scheme, an installer's milestone vocabulary are translated at the adapter and never leak inward. Settlement and Documents are **conformist** consumers of record events. This map is why "no actor replaces the owner as record holder" is structurally true rather than policy: nothing outside the Record Context can write to the record except through events the orchestrator validates.

### 2.3 Aggregates, entities, value objects

| Aggregate root | Context | Key invariants enforced at the boundary | Principal value objects |
|---|---|---|---|
| **Home** | Record | Single owner of record; verticals activate but never delete history | `Address`, `RoutingRadius` |
| **Project** | Record | Linear stage machine (`research → … → archived`); transitions only through gates; one active fulfillment | `Stage`, `Goal` |
| **WorkPacket** | Record | Immutable versions; spec validates against ontology; refusals are versioned, not discarded; BOM lines reference ontology nodes; labor lines reference skill tiers | `SpecSummary`, `DimensionalEnvelope(w,h,d)`, `MaterialSpec`, `FinishSpec`, `CaptureReference`, `BomLine`, `LaborLine`, `RefusalReason` (taxonomy code + message) |
| **QuoteSolicitation** | Orchestration | Fan-out targets only eligible channels; at most one accepted quote; quotes bind to a packet *version* | `QuoteTerms(price:Money, leadDays, atomMilesEst, localShareEst)` |
| **Order** | Settlement | Escrow `held → released | refunded`; release requires owner-verification event | `Money` (integer cents), `EscrowState` |
| **FulfillmentJob** | Channel | Milestone monotonicity; closure only by owner verification; decomposed sub-jobs reconcile to one project | `Milestone`, `ChannelRef` |
| **Outcome** | Record | Immutable; binds final packet version, channel, warranty, as-built deltas, measured metrics | `AsBuiltRecord`, `Warranty`, `OutcomeMetrics(atomMiles, scrapFraction, firstFit, leadTimeDays)` |
| **MaterialNode / SkillTier / MachineProfile** | Ontology | Versioned reference data; deprecation, never deletion (packets cite versions) | `MaterialClass`, `Grade`, `MovementCoefficients`, `SustainabilityAttrs`, `TierCode`, `CapabilityEnvelope` |

Modeling decisions worth defending. *WorkPacket lives in the Record context, not Orchestration*: the packet is owner property — the thing the owner can export and take elsewhere — so its lifecycle belongs to the record; orchestration only reads it and appends results. *Refusals are value objects on the packet version, not errors*: "earlier refusal of unsuitable stock" is a stated value of the system, so a refusal is preserved data with a taxonomy code (§7.4), queryable forever.

### 2.4 Ubiquitous language (excerpt)

**Capture** (verified condition data from the home) · **Packet** (versioned, validated, routable unit of work) · **Refusal** (gate outcome preserved to the record) · **Envelope** (bounded machine/safety capability) · **Cell** (bounded local fabrication unit, patent machinery) · **Cell steward** (T2 labor tier, certified on the governed packet, not a CAD/CAM author) · **Decomposition** (splitting packet lines by routability) · **Atom-miles** (Σ material transport legs for a project) · **First fit** (installed without rework at owner verification) · **Grout layer** (informal name for the persistent owner record that binds projects, vendors, and outcomes together across time).

---

## 3. System architecture

```
                        ┌──────────────────────────────────────────────┐
                        │            HOMEOWNER (record owner)          │
                        │   Web app · mobile app · export file (JSON)  │
                        └──────────────────────┬───────────────────────┘
                                               │ HTTPS / OAuth2 + PKCE
                        ┌──────────────────────▼───────────────────────┐
                        │                 API GATEWAY                  │
                        │   authn/z · rate limiting · audit ingress    │
                        └───┬──────────────┬──────────────┬─────────┬──┘
            ┌───────────────▼──┐  ┌────────▼────────┐  ┌──▼─────────────┐ ┌▼──────────────┐
            │  RECORD SERVICE  │  │  ORCHESTRATOR   │  │ CHANNEL GATEWAY│ │ ONTOLOGY SVC  │
            │ projects/research│  │ state machine · │  │ vendor adapters│ │ materials ·   │
            │ packets/outcomes │  │ gates · refusal │  │ store/fab/vend │ │ skills ·      │
            │ (system of record│  │ logic · routing │  │ delivery/svc   │ │ machine       │
            │  = event store)  │  │ · decomposition │  │ webhooks · SKU │ │ capabilities  │
            └───────┬──────────┘  └────────┬────────┘  └──┬─────────────┘ └┬──────────────┘
                    │                      │              │                │ (read-mostly,
            ┌───────▼──────────────────────▼──────────────▼────────────────▼─ versioned)
            │  PostgreSQL (event store + projections + ontology)  ·  Redis            │
            │  S3-compatible blob store (scans, docs, label sets, instructions)       │
            │  Outbox → message bus (NATS/Kafka) for channel fanout                   │
            └──────────────────────────────────────────────────────────────────────────┘
```

**Core pattern: event sourcing with projections.** The append-only `events` table is the canonical record — exactly what the MVP's event log models. Projections (`projects`, `packets`, `quotes`, …) are rebuildable read models. This is not architectural fashion; it is the *product*: "outcome preservation" and "archive" are first-class requirements, and an event-sourced record is the only design where the archive cannot drift from the truth. It also makes the owner-export trivially complete: export = the event stream plus current projections, which is precisely the JSON file the MVP downloads. (v2 addition: the event stream is also the **measurement apparatus** for the inversion — §9.)

**Why four services, not a monolith or twelve microservices.** The Record Service is the system of record and must be boring, durable, and owner-scoped. The Orchestrator holds all business state transitions (stage gates, refusal logic, quote routing, packet decomposition) so rules live in one place and are testable without I/O. The Channel Gateway isolates every external party behind an adapter interface — a new vendor, lumberyard, or tiered service provider is a new adapter, never a schema change. The Ontology Service (v2) serves versioned reference data with aggressive caching; it changes on curation cadence, not transaction cadence, and is the natural seam for institutional stewardship. Start as one deployable with four modules (modular monolith); split along these seams only when load demands it.

**The matrix is the API's shape.** Verticals × stages is not just the UI: it is the addressing scheme. Every resource is reachable as `home → vertical → project → stage artifacts`, which keeps authorization trivially hierarchical (owner owns home, owns everything beneath) and makes per-cell rendering a single indexed query.

---

## 4. Database schema (PostgreSQL)

v1 tables preserved; v2 additions marked. Packets remain immutable rows (revision = new version); money is integer cents; ontology rows are versioned and deprecated, never deleted, because packets cite them.

```sql
-- Identity & tenancy ----------------------------------------------------
-- users: identity is a generic subdomain (§2.1); the users table is provided
-- by the identity system and referenced here, not defined by this schema.
CREATE TABLE homes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      uuid NOT NULL REFERENCES users(id),
  address       text NOT NULL,
  routing_radius_km int NOT NULL DEFAULT 40,            -- v2: locality objective
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE verticals (              -- seeded; rows 1..7 of the matrix
  id            text PRIMARY KEY,     -- 'woodwork','windows','doors',...
  position      smallint NOT NULL,
  name          text NOT NULL,
  kind          text NOT NULL CHECK (kind IN ('anchor','proof','planned','open'))
);

-- Canonical record: append-only event store ------------------------------
CREATE TABLE events (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  home_id       uuid NOT NULL REFERENCES homes(id),
  project_id    uuid,
  actor         text NOT NULL,        -- 'owner' | 'channel:stores' | 'system'
  type          text NOT NULL,
  payload       jsonb NOT NULL,
  occurred_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX events_home_time ON events (home_id, occurred_at DESC);
CREATE INDEX events_project   ON events (project_id, occurred_at);
-- Production note: a per-stream sequence column with a UNIQUE (project_id,
-- sequence) constraint would provide optimistic-concurrency control on
-- concurrent appends; omitted here for schema clarity, required before pilot.

-- Projections ----------------------------------------------------------
CREATE TABLE projects (
  id uuid PRIMARY KEY,
  home_id uuid NOT NULL REFERENCES homes(id),
  vertical_id text NOT NULL REFERENCES verticals(id),
  title text NOT NULL, goal text,
  status text NOT NULL DEFAULT 'research'
    CHECK (status IN ('research','design','quote','purchase','fulfillment','archived')),
  created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE INDEX projects_matrix ON projects (home_id, vertical_id, status);

CREATE TABLE research_items (
  id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id),
  kind text NOT NULL, title text NOT NULL, url text, note text,
  shared boolean NOT NULL DEFAULT false, added_at timestamptz NOT NULL
);

-- ===================== v2: MATERIAL & LABOR ONTOLOGY =====================
CREATE TABLE material_nodes (
  id            text PRIMARY KEY,       -- 'mat.sheet.plywood.cabinet.0750'
  class         text NOT NULL CHECK (class IN
                  ('raw','component','assembly','finished_good','consumable')),
  parent_id     text REFERENCES material_nodes(id),   -- composition hierarchy
  name          text NOT NULL,
  species_or_kind text,                 -- 'birch', 'vinyl-clad', 'acrylic latex'
  grade         text,                   -- 'cabinet','CDX','select','clear'
  dimensional_basis jsonb,              -- {"thickness_in":0.75,"sheet":"48x96"}
  use_classes   text[] NOT NULL DEFAULT '{}',  -- {'interior','exterior','structural'}
  movement_coeffs jsonb,                -- tangential/radial %, for confirm-step truth
  sustainability jsonb,                 -- {"fsc":true,"regional_radius_km":120,...}
  ontology_version text NOT NULL,
  deprecated_at timestamptz             -- never DELETE; packets cite versions
);

CREATE TABLE skill_tiers (
  code          text PRIMARY KEY,       -- 'T0'..'T4'
  name          text NOT NULL,          -- see §7.2
  description   text NOT NULL,
  regulated     boolean NOT NULL DEFAULT false
);

CREATE TABLE machine_profiles (         -- the patent machinery, modeled
  id            text PRIMARY KEY,       -- 'cell.sheet.v1','cell.dimensional.v1'
  name          text NOT NULL,
  envelope      jsonb NOT NULL,         -- {"max_w_in":96,"max_h_in":120,"max_d_in":30,...}
  modes         text[] NOT NULL,        -- {'manual','stencil','fixed_sheet'}
  tool_heads    text[] NOT NULL,        -- {'saw','router','drill','edge_profile'}
  stations      text[] NOT NULL DEFAULT '{}'  -- {'secondary_ops','prefinish','label'}
);

CREATE TABLE channel_capabilities (     -- what each channel can actually do
  channel_id    text NOT NULL,
  machine_profile_id text REFERENCES machine_profiles(id),
  certified_tiers text[] NOT NULL DEFAULT '{}',  -- e.g. {'T1','T2'}
  service_scopes text[] NOT NULL DEFAULT '{}',   -- {'install.window','deliver',...}
  location      point,                  -- for atom-miles & radius routing
  PRIMARY KEY (channel_id, machine_profile_id)
);

CREATE TABLE channel_skus (             -- ontology node ↔ channel commercial reality
  channel_id    text NOT NULL,
  material_node_id text NOT NULL REFERENCES material_nodes(id),
  sku           text NOT NULL,
  price_cents   bigint NOT NULL,
  stock_qty     int,
  as_of         timestamptz NOT NULL,
  PRIMARY KEY (channel_id, material_node_id)
);

-- ===================== packets: extended =====================
CREATE TABLE work_packets (
  id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id),
  version int NOT NULL, schema_version text NOT NULL DEFAULT 'packet/v2',
  spec jsonb NOT NULL,
  ontology_version text NOT NULL,                 -- v2: vocabulary pin
  validation_ok boolean NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (project_id, version)
);

CREATE TABLE packet_bom_lines (                   -- v2
  id uuid PRIMARY KEY,
  packet_id uuid NOT NULL REFERENCES work_packets(id),
  material_node_id text NOT NULL REFERENCES material_nodes(id),
  qty numeric NOT NULL, unit text NOT NULL,       -- 'sheet','bf','ea','sqft'
  use_class text NOT NULL,                        -- validated ⊆ node.use_classes
  fabrication jsonb,                              -- ops: [{op:'stencil',mode:2},...]
  routable text NOT NULL CHECK (routable IN ('cell','vendor','special_order'))
);

CREATE TABLE packet_labor_lines (                 -- v2
  id uuid PRIMARY KEY,
  packet_id uuid NOT NULL REFERENCES work_packets(id),
  task text NOT NULL,                             -- 'fabricate','prefinish','install.window'
  required_tier text NOT NULL REFERENCES skill_tiers(code),
  est_hours numeric
);

CREATE TABLE packet_refusals (                    -- v2: refusals as preserved data
  id uuid PRIMARY KEY,
  packet_id uuid NOT NULL REFERENCES work_packets(id),
  code text NOT NULL,                             -- taxonomy, §7.4
  message text NOT NULL,
  line_ref uuid                                   -- nullable: packet- vs line-level
);

-- ===================== commerce (v1 preserved, v2 fields noted) ============
CREATE TABLE quotes (
  id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id),
  packet_version int NOT NULL, channel_id text NOT NULL,
  price_cents bigint NOT NULL, lead_days int NOT NULL, note text,
  atom_miles_est numeric,                         -- v2
  local_share_est numeric,                        -- v2: 0..1
  sku_coverage numeric,                           -- v2: fraction of BOM resolvable
  status text NOT NULL DEFAULT 'returned'
    CHECK (status IN ('returned','accepted','declined','expired')),
  returned_at timestamptz NOT NULL
);

CREATE TABLE orders (
  id uuid PRIMARY KEY, project_id uuid NOT NULL UNIQUE REFERENCES projects(id),
  quote_id uuid NOT NULL REFERENCES quotes(id),
  amount_cents bigint NOT NULL,
  escrow_status text NOT NULL DEFAULT 'held'
    CHECK (escrow_status IN ('held','released','refunded')),
  placed_at timestamptz NOT NULL
);

CREATE TABLE fulfillments (
  id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id),
  order_id uuid NOT NULL REFERENCES orders(id), channel_id text NOT NULL,
  parent_fulfillment_id uuid REFERENCES fulfillments(id),  -- v2: decomposition
  scope text NOT NULL DEFAULT 'full',             -- v2: 'full'|'lines'|'labor'
  milestone_index smallint NOT NULL DEFAULT 0,
  milestone_log jsonb NOT NULL DEFAULT '[]', started_at timestamptz NOT NULL
);

CREATE TABLE transport_legs (                     -- v2: atom-miles ground truth
  id uuid PRIMARY KEY,
  fulfillment_id uuid NOT NULL REFERENCES fulfillments(id),
  leg text NOT NULL,                              -- 'stock_to_cell','cell_to_home',...
  miles numeric NOT NULL,
  mode text NOT NULL,                             -- 'pickup','box_truck','ltl_freight'
  recorded_at timestamptz NOT NULL
);

CREATE TABLE outcomes (
  id uuid PRIMARY KEY, project_id uuid NOT NULL UNIQUE REFERENCES projects(id),
  warranty_years int NOT NULL DEFAULT 0, service_note text,
  final_packet_version int, channel_id text, amount_cents bigint,
  as_built jsonb,                                 -- v2: deltas vs packet spec
  metrics jsonb,                                  -- v2: {atom_miles, scrap_fraction,
                                                  --      first_fit, lead_time_days,
                                                  --      local_share}
  archived_at timestamptz NOT NULL
);

CREATE TABLE documents (
  id uuid PRIMARY KEY, project_id uuid REFERENCES projects(id),
  kind text NOT NULL,             -- 'scan','instructions','warranty','label_set'
  s3_key text NOT NULL, sha256 text NOT NULL, created_at timestamptz NOT NULL
);

CREATE TABLE outbox (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  aggregate text NOT NULL, payload jsonb NOT NULL,
  dispatched_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
```

Notes that matter (v1 preserved): immutable packet versions make "the packet that was quoted" auditable forever; `projects_matrix` makes the entire grid render one indexed query per home; the outbox table guarantees that "packet routed to channel" and "event written to record" commit atomically. v2 additions: `ontology_version` pins each packet to the vocabulary it validated against; `packet_refusals` makes refusal a queryable corpus (the dataset that improves the envelope); `transport_legs` turns atom-miles from rhetoric into rows.

---

## 5. API surface (REST, versioned at `/v1`)

The MVP's `api.*` methods preserve the intended service seams for these endpoints. A production implementation would keep the same domain boundaries where practical, but replacing the in-browser layer with server, persistence, authentication, security review, integrations, deployment, and operational controls would require ordinary engineering work and may revise transport details.

```
Auth: OAuth2 + PKCE. Every token is owner-scoped; channel actors get
      project-scoped grants issued by the owner (capability tokens).

-- v1 surface (preserved) --
GET    /v1/homes/:homeId/matrix                  → full grid projection (one query)
POST   /v1/homes/:homeId/projects                → create
GET    /v1/projects/:id                          → project + stage artifacts
POST   /v1/projects/:id/research                 → archive item
POST   /v1/research/:id/share                    → mint share link
POST   /v1/projects/:id/packets                  → validate + version
                                                   422 with refusal taxonomy on failure
GET    /v1/projects/:id/packets                  → version history
POST   /v1/projects/:id/quotes:request           → fan out to eligible channels
POST   /v1/quotes/:id/accept                     → accept (declines siblings)
POST   /v1/projects/:id/orders                   → place order, escrow held
POST   /v1/projects/:id/fulfillment:dispatch     → route packet
POST   /v1/fulfillments/:id/milestones           → advance (also via channel webhook)
POST   /v1/projects/:id/close                    → verify, release escrow, archive outcome
POST   /v1/projects/:id/advance                  → stage transition; 409 + gate reason
GET    /v1/homes/:homeId/events?cursor=          → the archive (paginated)
GET    /v1/homes/:homeId/export                  → canonical owner file (hometwin JSON)
POST   /v1/homes/:homeId/import                  → restore from owner file

-- v2 surface: ontology --
GET    /v1/ontology/materials?class=&use_class=  → versioned material nodes
GET    /v1/ontology/materials/:id                → node + composition children
GET    /v1/ontology/skills                       → tier definitions T0–T4
GET    /v1/ontology/machines                     → machine capability profiles
GET    /v1/ontology/version                      → current published version

-- v2 surface: capability, SKU, decomposition --
GET    /v1/channels/:id/capabilities             → profiles + certified tiers + scopes
POST   /v1/channels/:id/skus:resolve             → BOM lines → {sku, price, stock}[]
POST   /v1/packets/:id/decompose                 → split lines by routability
                                                   → [{scope, channelClass, lines[]}]
GET    /v1/homes/:homeId/metrics                 → atom-miles, local share, first-fit,
                                                   scrap, lead-time (per project + rollup)

-- Channel-side (Channel Gateway, anti-corruption boundary) --
POST   /v1/channels/:channelId/webhooks/quote        ← vendor returns a quote
POST   /v1/channels/:channelId/webhooks/milestone    ← fabricator/installer progress
POST   /v1/channels/:channelId/webhooks/transport    ← leg recorded (atom-miles)
POST   /v1/channels/:channelId/webhooks/scrap        ← cell reports offcut fraction
```

Error contract (preserved, extended): gate and refusal failures are *data*, not exceptions — `409 { gate: { ok:false, reason } }` and `422 { validation: { ok:false, refusals: [{code, message, lineRef}] } }` — because the UI's job is to show the owner exactly what the envelope refused and why, line by line where applicable.

---

## 6. Orchestrator: state machine, gates, routing, decomposition

The stage machine is linear by design (`research → design → quote → purchase → fulfillment → archived`) because the matrix columns are linear; branching lives *inside* stages (multiple quotes, multiple milestones, multiple sub-fulfillments after decomposition), never between them. Each transition has a gate that inspects only the record: research requires at least one archived item; design requires a packet whose validation passed; quote requires an accepted quote; purchase requires an escrowed order; fulfillment closes only by the owner-verification milestone. Gates read projections, never call channels — the rules are pure functions, which is why the MVP proved the whole lifecycle in a Node smoke test with zero mocks.

**v2: ontology-enforced validation.** `validateSpec` is now a pipeline: (1) structural — dimensions present, summary non-trivial, capture reference attached; (2) envelope — `DimensionalEnvelope ⊆ machine_profiles.envelope` for every BOM line marked `routable='cell'`; (3) ontology — every `material_node_id` exists at the pinned `ontology_version`, every line's `use_class ∈ node.use_classes` (interior-grade plywood specified for an exterior assembly is a refusal, not a warning); (4) material truth — confirmation status set at the Confirm step (the operator "sensing material truth" from the workforce brief); (5) labor — every `packet_labor_lines.required_tier` is satisfiable by at least one channel's `certified_tiers`, and `regulated=true` tiers force `routable='special_order'` (the system *names* regulated scope early rather than discovering it on site).

**v2: eligibility and routing.** A channel is eligible for a packet (or a decomposed scope) iff:

```
eligible(channel, scope) :=
      envelope_ok(channel.machine_profiles, scope.cell_lines)
  ∧   scope.required_tiers ⊆ channel.certified_tiers ∪ channel.service_scopes
  ∧   sku_coverage(channel, scope.bom) ≥ coverage_threshold
  ∧   distance(channel.location, home) ≤ home.routing_radius_km   (soft: scored, not hard)
```

Quote scoring is explainable and surfaced to the owner: price, lead time, **atom-miles estimate** (distance × legs implied by the channel class), **local-share estimate**, SKU coverage. The orchestrator never hides the trade — a cheaper remote quote with high atom-miles appears alongside the local cell, and the owner decides. Intelligent routing means *informed*, not paternalistic.

**v2: packet decomposition.** Real projects mix routabilities (the Windows worked example, §7.5.2). `decompose(packet)` partitions BOM and labor lines into scopes — `cell` (locally fabricable), `vendor` (manufactured units), `special_order` (regulated or beyond-envelope), `labor` (install tasks by tier) — each becoming a child `fulfillments` row under one parent. The project closes only when all children reach owner verification; escrow releases on owner verification of the parent; per-child proportional release is a settlement-context extension beyond the current tri-state model (§4). Decomposition is computed, never hand-assembled: routability is a function of the ontology plus capability registry, so the split is reproducible and auditable.

Refusal logic remains the safety envelope made executable, now with a taxonomy (§7.4). A refused packet is still *versioned and archived* — refusals are part of the record because earlier refusal of unsuitable stock is a stated value of the system, and the refusal corpus is the feedback layer the workforce brief describes (operators noticing what the bounded system did not anticipate).

---

## 7. Material & Labor Ontology

The ontology is the vocabulary that makes "standardized capture" a contract instead of a JSON blob. It is small, curated, versioned, and consumed read-only by every other context. Design rule: model only what gates, routing, or pricing actually consume — this is a working ontology, not a taxonomy exercise.

### 7.1 Material strata

| Class | Definition | Woodwork examples | Windows examples |
|---|---|---|---|
| `raw` | Stock as it exists in channel inventory; the atoms that should not travel far | 3/4″ cabinet-grade birch plywood (48×96 sheet); 2×4×8 SPF; hardwood edge banding | Primed pine jamb stock; exterior sealant; flashing tape |
| `component` | A machined or manufactured part with its own spec | Scribed side panel; shelf; nailer; profiled face frame stile | IGU (insulated glazing unit); sash; extension jamb |
| `assembly` | Components joined into a functional unit | Carcase; drawer box | Operable window unit (vendor-assembled) |
| `finished_good` | What the project delivers, labeled and released | Alcove built-in, painted | Installed three-lite bay with warranty |
| `consumable` | Used in fabrication/finish, not in the product BOM proper | Saw blades, sandpaper, masking | Shims, fasteners, low-expansion foam |

Each `material_node` carries the attributes the gates consume: `use_classes` (interior/exterior/structural — grade mismatch is refusal code `GRADE_MISMATCH`), `dimensional_basis` (sheet vs dimensional, feeding envelope checks and nesting), `movement_coeffs` (the Confirm step's "wood species, movement, sustainable options" made machine-checkable: a packet specifying a wide solid-wood panel in an unconditioned space can be flagged for the operator's judgment), and `sustainability` attributes (certification, regional sourcing radius) that feed local-share and emissions estimates rather than sitting as marketing metadata.

Composition is a hierarchy (`parent_id`): the alcove `finished_good` decomposes to `assembly` → `component` → `raw` lines, which is exactly what `skus:resolve` walks to turn a packet into a store pick-list — the patent's "operator retrieves appropriate materials from stock" step, computed.

### 7.2 Labor tiers

Tiers come directly from the workforce brief's progression (operator → cell steward → process improver) extended at both ends, and they are routing data, not HR titles:

| Tier | Name | Scope | Enforcement |
|---|---|---|---|
| **T0** | Owner / consumer assembly | Label-driven kit assembly per printed instructions (the patent's labels + instruction sheets) | Tasks marked T0 never block routing; instructions document is mandatory output |
| **T1** | Cell operator | Runs the governed packet on bounded machinery; loads stock, executes, labels, releases. Certified *on the packet*, not on CAD/CAM | Channel must list `T1 ∈ certified_tiers` for any `routable='cell'` line |
| **T2** | Cell steward | Tooling setup and changeover, mode-3 fixturing, **refusal authority on material truth** (rejects unsuitable stock at Confirm) | Packets with `fabrication.mode=3` or material-confirmation flags require T2 |
| **T3** | Trade specialist | Installation crafts: window setting, flashing, finish carpentry, scribing on site | `install.*` labor lines require T3 in `service_scopes`; routed to tiered service providers |
| **T4** | Licensed / regulated | Structural alteration, electrical, anything code-gated | `regulated=true`: forces `special_order` routing and is **named in the packet at design time** — governance question raised early, per the briefs |

This is the workforce architecture operationalized: the cell steward role is "a worker certified on the governed packet rather than required to author CAD/CAM" (transfer brief, verbatim intent), and the tier registry is the natural integration point for community-college certification pathways — a GTCC certificate becomes a row in `channel_capabilities.certified_tiers`.

### 7.3 Enforcement in the work packet

A `packet/v2` spec is structurally:

```jsonc
{
  "summary": "Alcove built-in, three fixed shelves, scribed sides, painted finish.",
  "envelope": { "w_in": 46.25, "h_in": 88, "d_in": 11.5 },
  "capture":  { "kind": "scan", "ref": "doc:scan/A-128", "verified": true },
  "ontologyVersion": "2026.05",
  "bom": [
    { "node": "mat.sheet.plywood.cabinet.0750", "qty": 3, "unit": "sheet",
      "useClass": "interior", "routable": "cell",
      "fabrication": [ {"op":"stencil","mode":2}, {"op":"edge_profile","mode":3} ] },
    { "node": "mat.edge.banding.birch", "qty": 40, "unit": "lf",
      "useClass": "interior", "routable": "cell" },
    { "node": "mat.finish.acrylic.interior", "qty": 1, "unit": "gal",
      "useClass": "interior", "routable": "cell" }
  ],
  "labor": [
    { "task": "fabricate",  "tier": "T1", "estHours": 2.5 },
    { "task": "prefinish",  "tier": "T1", "estHours": 1.0 },
    { "task": "mode3_edge", "tier": "T2", "estHours": 0.5 },
    { "task": "assemble",   "tier": "T0" }
  ],
  "finish": { "kind": "painted", "color": "white" }
}
```

Validation walks every line against the pinned ontology version; any failure becomes a `packet_refusals` row with a taxonomy code and (where applicable) a `line_ref`. The packet that crosses a vendor boundary is therefore *provably well-formed in a shared vocabulary* — which is the entire mechanism by which data substitutes for atom travel.

### 7.4 Refusal taxonomy

`ENVELOPE_EXCEEDED` (dimension outside machine profile — route to special-order merchant) · `MATERIAL_UNVERIFIED` (Confirm step not completed; operator judgment required) · `GRADE_MISMATCH` (use-class not permitted for node, e.g., interior grade specified for exterior assembly) · `MOVEMENT_RISK` (species/width/environment combination flagged for T2 review) · `TIER_UNAVAILABLE` (no eligible channel holds the required certification in radius) · `REGULATED_SCOPE` (T4 work detected; named at design time) · `SKU_UNRESOLVED` (BOM line has no channel SKU coverage above threshold) · `CAPTURE_STALE` (capture older than policy for the vertical — re-verify before routing).

Codes are stable identifiers: the refusal corpus is queryable across the fleet, and the distribution of codes per vertical is the empirical input for widening (or tightening) the envelope — the operator-as-sensor feedback loop from the GTCC brief, with data.

### 7.5 Worked examples

**7.5.1 Woodwork — alcove built-in (anchor vertical, single-scope in its base branch).** A decision worth defending: in the proof harness, the alcove's cabinet-door branch deliberately imports the decomposition mechanism — a `vendor_product` line spawning a child fulfillment — even though decomposition properly belongs to the Windows class (§7.5.2), so the anchor project exercises the multi-scope machinery where every reviewer will actually see it. The base open-shelves branch remains genuinely single-scope, as described here. Capture: 3D scan of the alcove, verified. Packet as in §7.3. Validation: all lines `routable='cell'`, envelope within `cell.sheet.v1` and `cell.dimensional.v1`, T1/T2 available at the local store's production cell. Routing: single scope, three quotes (store cell, local fab shop, vendor network); the store cell wins on price *and* atom-miles (final leg = owner pickup, ~6 mi). Fabrication: mode-2 stencil for panels, mode-3 fixed-sheet for the profiled edges (T2 sets fixturing), prefinish station sprays, label maker prints component labels + assembly instructions (T0 task). Outcome archives the as-built (actual scribe deltas), `first_fit=true`, `scrap_fraction` reported by the cell, atom-miles from one `transport_legs` row.

**7.5.2 Windows — three-lite bay replacement (twin proof, decomposed).** Capture: laser-verified rough opening. The BOM mixes routabilities, and decomposition does the work v1 hand-waved: the **IGU/sash assemblies** are `routable='vendor'` (manufactured units, outside any cell envelope) → vendor adapter; the **extension jambs and interior casing** are `routable='cell'` (dimensional stock, well inside envelope) → local cell, T1; **flashing and setting** is a `labor` scope requiring T3 → tiered service provider; and if the capture had revealed a sagging header, the structural line would have carried `REGULATED_SCOPE` and routed T4 — named at design, not discovered at demo. One parent fulfillment, three children; escrow releases on the parent's owner verification; the outcome preserves the unit's warranty, the installer's service scope, and the financing trail in one record. This is the cross-domain proof: cost, warranty, regulated risk, and multi-channel routing in a single governed project.

---

## 8. Machine & SKU integration points

**Machine capability profiles** model the patent machinery as routing data. `cell.dimensional.v1` (manipulating-rotor dimensional processor: end ops, drilling, miter stations; dimensional stock to nominal 12″ widths, oversize with auxiliary support) and `cell.sheet.v1` (servo sheet processor: modes manual/stencil/fixed-sheet; tool heads saw/router/drill/edge-profile; 4×8 standard, 4×10/4×12 special-order entry) — plus station flags for `secondary_ops`, `prefinish`, and `label`. A BOM line's `fabrication` ops must be a subset of some eligible profile's `tool_heads × modes`; a custom edge contour (the patent's slotted-collet tool, FIG. 8) is modeled as a tool-head *instance* a channel registers, so "local fabrication of a custom cutter included in the quote" is a capability row, not a special case. Capability profiles are also the **staged-adoption story** from the patent: a store that has only converted its legacy panel saw registers `cell.sheet.v1` without `prefinish`, and routing simply prices the finish task elsewhere or as T0.

**SKU resolution** (`channel_skus`) binds ontology nodes to each channel's commercial reality — SKU, price, stock, freshness. At quote time the orchestrator computes `sku_coverage` per channel per scope; below threshold, the channel is ineligible for that scope (or quotes with an explicit special-order surcharge line). This is where the patent's "operator gathers stock from inventory" meets data: the pick-list is the BOM resolved to SKUs and aisle stock, the labels and instruction sheet are `documents` rows generated from the same packet, and warped short stock consumption (patent §benefit) is a nesting preference flag on the cell adapter. Inventory webhooks keep `stock_qty/as_of` honest; stale SKU data degrades a channel's score rather than silently misquoting.

**Adapters** (Channel Context, anti-corruption): `store.ts` (production cell: packet → CAM job + pick-list + label set; webhooks: milestone, scrap, transport), `localfab.ts` (same contract, independent shop), `vendor.ts` (manufactured units: packet lines → vendor RFQ; quote webhook), `service.ts` (T3/T4 labor scopes: scheduling + milestone webhooks), `delivery.ts` (transport legs as first-class events). Every adapter translates inward to packet vocabulary and outward to the partner's; nothing else in the system knows a partner's formats exist.

---

## 9. Economic & sustainability implications

### 9.1 Where the value moves

The inversion relocates margin and reduces deadweight. Freight and re-measurement rework — costs that benefit no one — shrink structurally; fabrication labor (T1/T2), machine time, and material markup move *inside* the routing radius, which is the "local value capture" commitment of the workforce brief expressed as cash-flow geography. Waste falls at the source: designs resolved before cutting, nesting against validated packets, and short-offcut consumption of stock otherwise scrapped for warp. The retail partner gains a profit center on existing floor space (the patent's explicit framing); the homeowner gains compounding value in the record itself — each preserved outcome lowers the information cost of the next project, which is the only network effect in home improvement that the *owner* captures rather than a platform.

### 9.2 Measurement model — the event store as instrument

Every claim in §1.3 reduces to events the system already emits. Per project, computed at close and stored in `outcomes.metrics`:

```
atom_miles      = Σ transport_legs.miles                       (per fulfillment tree)
emissions_gCO2e = Σ (leg.miles × mode_factor[leg.mode])        (published factor table)
scrap_fraction  = cell-reported offcut mass / input mass        (scrap webhook)
first_fit       = owner-verification milestone w/o rework flag
lead_time_days  = close.archived_at − packet.v1.created_at
local_share     = Σ spend within home.routing_radius_km / total spend
```

Rollups per home, per vertical, per channel, per region are read models over the same events (`GET /v1/homes/:id/metrics`). For an institutional pilot this is the deliverable that matters: not asserted percentages but **a fleet that measures its own thesis**, with the refusal corpus (§7.4) and the metrics table forming the empirical basis for envelope tuning, curriculum design (which T2 judgments fire most), and sustainability reporting that survives audit. Mode factors and any baseline comparisons against the traditional model are published with their sources and marked as model parameters until pilot distributions replace them.

### 9.3 Incentive alignment

Escrow held until owner verification aligns channels with first-fit rather than first-ship. Explainable quote scoring (price *and* atom-miles *and* local share, side by side) lets the owner price externalities without the platform imposing them. Certification rows give workers portable, named standing in the routing function — the tier registry is a labor-market signal, not just an ACL.

---

## 10. Market context

US home improvement spending runs in the **$500–600B/yr** range (homeowner improvements plus maintenance/repair; estimates vary by scope across JCHS/HIRI-style trackers), against a housing stock whose median age keeps rising — structurally more repair, retrofit, and fit-to-existing-conditions work, which is precisely the work the inversion serves. Three relevant currents, stated without hype: (1) **skilled-trades scarcity** makes labor-tier routing and bounded, certifiable cell roles economically interesting rather than merely humane — T1/T2 pathways expand effective capacity; (2) **big-box retail** is already moving from shelf sales toward services and fulfillment orchestration, so the production-cell-as-profit-center thesis lands inside an existing strategic motion rather than against it; (3) **digital-twin and BIM standardization** (ISO 19650 processes, IFC/openBIM exchange) has matured for commercial construction but has no consumer-grade, owner-held analogue. The positioning is deliberately *below* BIM's complexity and *beside* its standards: the work packet is a constrained, governed exchange object for residential scope, and the roadmap includes an **IFC-mapped export** of as-built records so the owner's twin can feed professional toolchains without ever requiring the owner to operate one. The defensible position is not the scan or the machine alone — it is the governed record that no commercial actor has an incentive to build neutrally, which is the public-interest argument of the transfer brief in market terms.

---

## 11. Caching, performance, scaling

Read path first (v1 preserved): the matrix view is the hot query, served from a per-home Redis hash (`matrix:{homeId}`) invalidated by event type. Event-log pagination is keyset, never OFFSET. Blobs go straight to S3 with presigned URLs. **v2:** the ontology is the most cacheable surface in the system — versioned, immutable per version — so it ships as a CDN-cached snapshot per `ontology_version` and is embedded in client bundles for offline packet drafting; `channel_skus` is the only fast-moving channel data and is cached with short TTL keyed `(channel, node)`. Write path: every command is one transaction (projection update + event insert + outbox insert); quote fanout, webhook ingestion, and SKU refresh are the async paths. Scale-out order when needed: read replicas → split channel gateway (spikiest, least-trusted traffic) → partition `events` by `home_id` hash. Because every query is home-scoped, the system shards naturally on the owner — the governance model *is* the partition key. Front-end notes from v1 stand: full re-render of a ~40-cell grid is trivially fast; production React adds TanStack Query, optimistic stage advances, and per-cell memoization keyed `(verticalId, stage, projectStatusHash)`.

---

## 12. Target production file structure

```
hometwin/
├── apps/
│   ├── web/                          # React (Vite) — the matrix UI
│   │   └── src/
│   │       ├── features/
│   │       │   ├── matrix/           # MatrixGrid, Cell, VerticalRow
│   │       │   ├── workspace/        # per-stage drawers (Research…Fulfillment)
│   │       │   ├── packet/           # v2: BOM editor, labor plan, refusal display
│   │       │   ├── orchestration/    # channel rail, event log, decomposition view
│   │       │   ├── metrics/          # v2: atom-miles / local-share / first-fit
│   │       │   └── record/           # export/import, archive views
│   │       ├── api/                  # typed client (generated from OpenAPI)
│   │       ├── state/                # TanStack Query + optimistic updates
│   │       └── design/               # tokens.css (the palette in the MVP)
│   └── mobile/                       # later; same generated API client
├── services/
│   ├── record/
│   │   └── src/{domain,events,repo,http}/
│   ├── orchestrator/
│   │   └── src/{stateMachine,gates,validation,routing,decompose,scoring}.ts
│   ├── channels/
│   │   └── src/{adapters/{store,localfab,vendor,service,delivery}.ts,
│   │            capabilities.ts, skus.ts, webhooks/, outbox/}
│   └── ontology/                     # v2: read-mostly reference service
│       └── src/{nodes,tiers,machines,publish}.ts
├── packages/
│   ├── schema/                       # zod schemas — packet/v2 is THE contract
│   │   ├── workPacket.ts
│   │   └── refusals.ts               # taxonomy codes, stable identifiers
│   ├── ontology/                     # v2: published-language types + snapshots
│   ├── api-contract/                 # OpenAPI → generated clients
│   └── shared/                       # ids, Money, Dimension, AtomMiles
├── db/migrations/
├── infra/
└── docs/ARCHITECTURE.md              # this file
```

In a production implementation, the single most important shared package would be `packages/schema/workPacket.ts` — versioned, validated identically on client, server, and channel boundary, never owned by any one service — joined by `packages/ontology`, the published language every context conforms to.

---

## 13. Codebase lineage and review (preserved from v1)

The originating 4,900-line deck (`index.html`) is a presentation artifact: display-only matrix, hardcoded modal content, no data layer. Structural risks if extended as-is: state scattered across DOM classes, duplicated overlay plumbing, copy drift between matrix modals and narrative screens. The MVP refactors along clean-architecture seams while keeping the visual identity (Inter/JetBrains Mono, paper/stone palette, `#001489` brand blue, the peach spine and lavender header lifted from the source image): domain logic has zero DOM references; the DOM is a pure function of state; the UI talks only to `api.*`. The deck can later become a read-only projection of the real record — one data source, two surfaces. Multi-agent pass (condensed): *Architect* — event-sourced record, matrix as addressing scheme; *Engineer* — strict layering, automated lifecycle test (create → research gate → packet refusal → re-validation → 3-channel quoting → escrow → 5 milestones → outcome archival → export/import round-trip, all passing); *Reviewer* — fixed render/focus coupling, XSS via `esc()` on all interpolation, money-as-integer-cents in production schema; *Optimizer* — capped event retention, single-query cell render, lazy drawer mount, zero third-party JS. v2 review additions: ontology pinning prevents vocabulary drift under packets; decomposition reconciliation (children → parent) is the new invariant requiring property-based tests; SKU staleness must degrade scoring, never silently misprice.

---

## 14. UI component contract (production React)

`<MatrixGrid homeId>` renders the seven-row grid from the single matrix projection; `<MatrixCell vertical stage projects onOpen>` is presentation-only and owns chip/live-dot rules; `<StageWorkspace project stage>` composes `<ResearchArchive>`, `<PacketEditor onValidate>` (v2: BOM line editor with ontology typeahead, labor-plan rows, inline refusal badges per line), `<QuoteBoard onAccept>` (v2: atom-miles and local-share columns beside price), `<EscrowCard>`, `<MilestoneTrack onAdvance>` (v2: decomposition tree of child fulfillments), `<OutcomeForm onClose>` (v2: as-built deltas + metrics summary). Every workspace component takes data + callbacks only, declares loading and empty states, and the whole surface is keyboard-operable: cells are focusable buttons, the drawer is a labeled dialog dismissed by Escape, reduced-motion preferences disable all transitions.

---

## 15. Roadmap

Sequenced so nothing in the current UI changes for any step — which remains the point of the layering.

1. **Persistence behind the same API** — Postgres + §4 schema; event store first, projections second.
2. **Ontology seed, two verticals deep** — Woodwork and Windows nodes/tiers/machine profiles sufficient for §7.5; published as `ontology/2026.xx`; institutional curation handoff defined (the natural university stewardship seam).
3. **Identity + capability tokens** — owner OAuth; project-scoped channel grants.
4. **Capability & SKU registry** — `channel_capabilities`, `channel_skus`, inventory webhooks; eligibility scoring live.
5. **Channel webhook path** — a store production cell posts milestones, scrap, and transport legs into the owner's record; first real `outcomes.metrics`.
6. **Packet decomposition** — multi-scope fulfillment with parent reconciliation; Windows-class projects end-to-end.
7. **Documents** — scans, label sets, instruction sheets as content-addressed S3 objects on the record.
8. **Metrics surfaces** — per-home and per-region rollups; refusal-corpus analytics feeding envelope and curriculum review.
9. **IFC-mapped export** — as-built outcomes exportable toward professional BIM toolchains; the owner's twin as a first-class citizen of the built-environment data ecosystem.
10. **The second home** — multi-home owners; then the second region.
