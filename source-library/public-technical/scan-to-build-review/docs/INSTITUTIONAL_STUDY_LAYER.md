# Institutional Study Layer

**One governed homeowner project as a shared research, workforce, and public-interest substrate.**

Document: `docs/INSTITUTIONAL_STUDY_LAYER.md`
Status: Public technology demonstration · simulation only
Posture: No live machine control · no production deployment · **no university endorsement claimed**
Read with: [Operational Roadmap](./OPERATIONAL_ROADMAP.md) ·
[Continuous Engineering](./CONTINUOUS_ENGINEERING.md) ·
[Future Research & IP Review Areas](./FUTURE_RESEARCH_AND_IP_REVIEW_AREAS.md)

> This document explains the study value of a governed homeowner-project record. It asserts
> no university relationship, endorsement, funded program, measured result, environmental
> claim, safety certification, or legal/IP conclusion. Each item is a study surface or
> measurement opportunity, subject to independent review.

## The thesis

A single home-improvement project normally disappears into fragments: the homeowner keeps
photos and emails, the vendor a CRM record, the installer field notes, the financier a
transaction, the manufacturer a product ID. No one studies the same complete object.

This architecture changes the object of study. Sarah's alcove built-in is not only a
built-in; it is one auditable, owner-held event stream with pinned ontology versions,
preserved refusals, basis-labeled metrics, a role map, a custody ledger, and an outcome
archive. That makes one real project legible to engineering, materials, manufacturing,
robotics, AI, workforce, sustainability, finance, data governance, and policy **at once,
without any of them taking custody from the homeowner.** The institutional contribution is
not that the prototype proves any one of those claims — it is the shared governed substrate
on which they can be tested against the same record.

That matters now because the questions around AI-in-workflow, smart manufacturing, local
production, workforce, sustainability, and data custody are converging and cannot be
answered well through disconnected demos. They need a shared object. This supplies one — and
where AI is used, it is bounded by the record, ontology, MachineEnvelope, consent, and
safety gates, which is a more serious research posture than an unbounded assistant.

## Institutional fit, stated carefully

The work is translation-shaped: it connects a homeowner's practical need, a local material
and labor market, a bounded manufacturing problem, a machine and safety problem, a
workforce-training problem, a data-custody problem, and a public-interest problem. That fits
an applied engineering, land-grant, workforce, and technology-transfer environment — not as
a finished product to endorse, but as a governed artifact to inspect, criticize, measure,
and improve.

On geography: this document claims **no partnership, endorsement, adoption, or pilot.** It
says only that a region where wood products, manufacturing memory, market proximity,
workforce need, and applied-research capacity already overlap — North Carolina is one such
place — is a *credible place to study* the model, because the first anchor vertical is
wood-based, fit-critical, home-scale fabrication and those ingredients already exist there.
The prototype does not answer whether they can be connected through a governed record and
bounded packet; it makes the question concrete. That is system fit, not a claim of
relationship.

## The Sarah project as shared substrate

Sarah's alcove is the recurring study object precisely because it is modest. A small
project can still carry homeowner intent, capture confidence, a site condition, a material
constraint, an emission-class conflict, a material comparison, a packet revision, a
machine-envelope fit test, cell routing, a labor-role map, consent, a simulated execution,
an outcome archive, and an export. It is small enough to inspect and layered enough to
study — the correct first object.

## Discipline-by-discipline study surfaces

Each lane below separates **what the repo demonstrates** (checkable against the code) from
**what could be measured** and **what remains to validate** (open work).

**Engineering.** *Problem:* build specifications rarely survive the project; tolerances,
refusals, and machine limits vanish at install. *Demonstrates:* a MachineEnvelope with
operation types, limits, tolerance classes, and safety readiness; Sarah's packet routes to
one eligible and two refused cells with reasons. *Could measure:* tolerance-holding
distributions per operation, calibration drift, refusal rates by code, rework prevented by
early refusal. *Remains:* all physical values — execution is simulation only.

**Materials and wood products.** *Problem:* material choice is driven by price and vendor
framing; suitability, emissions context, finish behavior, movement, and substitution rules
are inconsistently recorded. *Demonstrates:* Sarah's v1 standard-MDF panel conflicts with
her low-emission requirement and is refused; a compliant NAF/ULEF panel passes in v2;
comparison is a modeled surface, not a hidden answer. *Could measure:* real emission
testing, finish performance by substrate, movement and stability by species, sheet yield,
offcut reuse, service-life outcomes. *Remains:* no environmental or health claim; emission
class is a regulatory-context attribute; all comparative values are modeled unless measured.

**Construction management and site interface.** *Problem:* site conditions (out-of-square
walls, floor slope) are discovered late and absorbed informally. *Demonstrates:* v1 refuses
an unresolved site condition; v2 passes only after capture confidence improves (0.62 → 0.94)
and the condition is resolved. *Could measure:* rework rates with and without site-condition
gates, capture-confidence thresholds that predict fit, callback reduction. *Remains:* the
confidence floor is a demo parameter; real thresholds need field data.

**Advanced manufacturing.** *Problem:* capability is described in sales terms, not
machine-checkable contracts. *Demonstrates:* the MachineEnvelope as a declared contract —
what the cell can do, cannot do, and why a packet is accepted or refused. *Could measure:*
achievable tolerance per operation and material, setup repeatability, nesting yield,
throughput under bounded scopes. *Remains:* no commissioned equipment; this is reasoning,
not physical manufacturing.

**Robotics, autonomous control, cyber-physical systems.** *Problem:* "automation" framed as
autonomy blurs who holds authority and where safety lives. *Demonstrates:* simulation-only
execution; remote live-motion always refused; explicit envelope, safety-state, and
production-readiness boundaries. *Could measure:* handoff integrity between packet and local
controller, refusal coverage against real controller states, response to interlock and
tool-state failures. *Remains:* no real controller; a bench or pilot setup needs independent
safety review.

**AI and bounded agentic workflow.** *Problem:* in high-stakes physical workflows, AI
helpfulness becomes dangerous if it can override record truth, consent, material
constraints, machine limits, or safety gates. *Demonstrates:* hard boundaries — the
owner-held record is the authority, the ontology defines valid meaning, the packet pins
versions, refusals are preserved, consent is packet-scoped, the envelope controls routing,
live motion is refused, modeled values stay labeled. AI may assist *inside* that frame
(explaining options, drafting packet fields, classifying refusals, comparing materials,
mapping vendor terms to ontology, supporting training) but cannot become the authority,
rewrite the record, convert modeled values into measured claims, expand an envelope by
inference, or route around a safety hold. *Could measure:* whether AI explanations match
underlying refusal logic; whether owners understand refusals; whether stewards override less
when reasons are clear. *Remains:* formal assurance of these boundaries at scale is open;
the prototype demonstrates the pattern, it does not prove it cannot fail. This is a more
useful AI study surface than an unbounded assistant because it asks where AI can help when
the system already knows what AI may not do.

**Data science, governance, and security.** *Problem:* home-project data is scattered,
unversioned, and overexposed because each vendor runs its own intake. *Demonstrates:* an
append-only event store with pinned versions and a round-tripping export (19/19 events in
the canonical run); a custody ledger rendered from the stream (private vs shared, with whom,
scope, revocable, data kind), defaulting to packet-only. *Could measure:* minimum-necessary
data by vertical, scope creep in vendor requests, revocation behavior, reconstruction
fidelity, re-identification risk in aggregates. *Remains:* real-scale storage, encryption,
access control, revocation enforcement, and multi-tenant governance are open.

**Workforce development and human-centered automation.** *Problem:* pathways begin with
broad job titles, not the specific operations a job requires. *Demonstrates:* the packet
maps operations to roles (operator tiers, material-sensing operator, cell steward,
installer, verifier, owner agent) with explicit *does / may not* and refusal authority; the
cell compresses execution skill and elevates judgment skill rather than deskilling. *Could
measure:* which operations recur by vertical, skill gaps by refusal code, certifications by
packet type, advancement pathways from operator to steward, where judgment remains
indispensable. *Remains:* the role registry is a fixture; real certification frameworks and
training partners require institutional review.

**Sustainability and circularity.** *Problem:* sustainability claims are hard to verify and
rarely tied to one owner-held record. *Demonstrates:* modeled atom-miles, local share, and
scrap fraction carried through routing and outcome, all basis-labeled; refusals can prevent
bad material choices and low-confidence cuts. *Could measure:* actual transport legs, scrap,
offcut reuse, first-fit rate, callback rate, local value share, repair-vs-replacement
decisions. *Remains:* **no measured environmental performance is claimed** — the prototype
defines where measurements attach, nothing more.

**Finance, public programs, and policy.** *Problem:* financing, rebates, and programs depend
on after-the-fact, vendor-held documentation. *Demonstrates:* packet release policy (owner
verification, packet-only terms) and an outcome archive preserving what was done, against
which version, with basis-labeled metrics and refusals — a documented, owner-held trail.
*Could measure:* verification cost, dispute frequency, documentation completeness, audit
quality, and (for policy) adoption barriers, equity effects, and whether owner-held records
reduce dependency on repeat vendor intake. *Remains:* no real money, program, or financial
institution is connected; any such rail requires legal, regulatory, and privacy review, and
nothing here is a policy recommendation.

## A possible study program, stated carefully

A plausible, non-committal sequence — no phase beyond the first is claimed to be underway:

- **A — Repository and documentation review.** Determine whether the system's claims match
  its mechanics, identify overclaiming risk, and decide whether deeper study is warranted.
- **B — Simulation study.** Exercise packet, refusal, routing, custody, export, and
  capability-evolution logic against Sarah's project and synthetic projects; identify which
  measurements a physical pilot would need.
- **C — Bench / dry-run validation.** Test MachineEnvelope reasoning, guard/e-stop state,
  tool and calibration state, packet handoff, and refusal preservation without production
  cutting — the boundary between cloud reasoning and local control.
- **D — Materials and workforce modules.** Connect material properties and local-species
  behavior to packet fields, and workforce training to the role registry.
- **E — Supervised physical pilot, only if justified** by prior review, safety work, and
  institutional approval — where modeled values are replaced by measured ones.

## What this is, and is not

**Is:** a study-value analysis; a cross-disciplinary research map; an institutional review
surface; a workforce map; a responsible-AI boundary model; a guide to what could be measured
later.

**Is not:** a university partnership or endorsement claim; a grant proposal; a deployment
plan; a measured-performance report; a safety certification; a legal, patentability, or
commercialization conclusion; an environmental-performance claim; a claim that AI should
control machines or that automation eliminates skill.

---

*The study value is not that the system promises everything — it is that it refuses to
collapse everything into one claim. A home project becomes a record; the record produces a
packet; the ontology governs meaning; the envelope declares what a cell can do; refusals
preserve what it cannot; the role map names the human judgment that remains; the custody
ledger shows what the owner shares; the outcome returns to the record; the export stays
portable. That structure makes one project visible from many angles without taking it away
from the homeowner. It is small enough to inspect and large enough to matter.*
