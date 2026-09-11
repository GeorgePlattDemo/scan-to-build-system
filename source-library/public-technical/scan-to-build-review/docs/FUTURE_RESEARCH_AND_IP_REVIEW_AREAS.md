# Future Research & IP Review Areas

**Review surfaces for counsel and technical/institutional reviewers.**

Document: `docs/FUTURE_RESEARCH_AND_IP_REVIEW_AREAS.md`
Status: Public technology demonstration · research/IP review posture
Posture: **Not legal advice · not patent advice.** No patentability, validity,
freedom-to-operate, or commercialization conclusion is asserted.
Read with: [Operational Roadmap](./OPERATIONAL_ROADMAP.md) ·
[Continuous Engineering](./CONTINUOUS_ENGINEERING.md) ·
[Institutional Study Layer](./INSTITUTIONAL_STUDY_LAYER.md)

> **This document is not a legal or patent opinion.** It is not a claim-construction,
> validity, infringement, freedom-to-operate, or prosecution position, and it does not
> assert that any future claim will issue or that any mechanism is novel or protectable.
> It identifies preserved mechanisms that *may warrant review* by qualified counsel and
> technical/institutional reviewers. Every item below is a question to examine, not a
> conclusion.

## 1. Purpose and posture

The package contains two issued U.S. patents in the project's lineage — **US 9,720,401**
(issued 2017) and **US 10,768,609** (issued 2020) — directed to consumer home-project
ordering and fabrication, and a later public technology demonstration that adds a governed
operating layer around that lineage: owner-held record, WorkPacket, published ontology,
MachineEnvelope validation, refusal preservation, packet-scoped consent, outcome archive,
export, simulation boundary, and evidence-driven capability evolution.

This document **does not interpret the scope of the issued patents.** Any forward-looking
review begins with qualified counsel examining the issued patents directly; their mention
here is context for where a review would start, not a characterization of what they cover.
The role of this note is narrow: to preserve the technical mechanisms the demonstration
built so a reviewer can find them, and to flag where review may be warranted.

## 2. Preserved mechanisms

The demonstration preserves these mechanisms for review (each is described in the
roadmap, ontology, and engineering documents):

- **Owner-held Homeowner Project Record** — the home as a persistent, exportable event
  stream the homeowner holds; project events write back into it rather than scattering
  across vendor systems.
- **WorkPacket** — a versioned, validated, owner-authorized scope of work carrying intent,
  capture confidence, material/labor/machine requirements, release policy, and validation
  status.
- **Published Material & Labor Ontology** — materials, labor tiers, certifications, SKUs,
  channels, machine capabilities, refusal codes, and outcome metrics in a shared language
  that vendor vocabulary maps into rather than replaces.
- **MachineEnvelope** — a declared capability contract (operation types, dimensional
  limits, tolerance class, handling, tooling, calibration, safety readiness, roles).
- **Refusal preservation and classification** — refusals as version-bound events, sorted
  into healthy / capability_gap / safety_hold, controlling revision, routing, outcome, and
  evolution evidence.
- **Cell routing** — validated packets matched to declared capability, showing eligible
  and refused cells with reasons.
- **Workforce role map** — packet operations mapped to roles, certifications, and refusal
  authority.
- **Packet-scoped consent and custody rail** — what is private vs shared, with whom, at
  what scope, whether revocable; packet-only by default.
- **Simulation-only execution and the local-controller boundary** — the orchestrator
  validates, routes, simulates, explains, and archives but does not command live motion;
  remote live-motion command is refused.
- **Outcome archive and basis-labeled metrics** — outcomes, refusals, and metrics (labeled
  modeled / measured / derived / channel-reported / owner-verified / unknown) return to
  the owner-held record.
- **Bounded AI assistance** — AI may explain, draft, classify, compare, and train, but
  only inside the authority of the record, ontology, packet, envelope, consent, and safety
  gates.

## 3. Areas that may warrant review

Each area names a preserved mechanism and the question a reviewer might examine. **None is
asserted as patentable, novel, compliant, or free to operate.** The recurring boundary
applies throughout: review would need to determine whether the mechanism differs
materially from ordinary work orders, BOMs, CAD files, rules engines, job tickets, or
routing slips, and how it relates to the issued patents — a determination for counsel, not
for this document.

1. **WorkPacket as a governed fabrication object** — a validated packet gating whether
   fabrication instructions, routing, or fulfillment may proceed. *Review:* whether
   enforced packet validity differs materially from an ordinary work order.
2. **MachineEnvelope validation before instruction release** — physical instructions
   blocked, revised, or routed based on declared capability, calibration, tooling, safety,
   and role state. *Review:* the simulation-only boundary; no real controller or measured
   tolerance exists.
3. **Refusal-preserving validation** — the ordered relationship among packet version,
   validation gate, refusal event, routing consequence, and outcome record. *Review:*
   whether preserved, behavior-controlling refusals differ from ordinary logs.
4. **Refusal-driven capability evolution** — classified refusal evidence informing how
   bounded cells should evolve, with safety holds excluded. *Review:* relationship to
   ordinary engineering-change and manufacturing-intelligence practice. No autonomous or
   self-expanding equipment is claimed.
5. **Ontology-enforced material and labor constraints** — invalid substitutions or machine
   mismatches refused before fabrication. *Review:* a vocabulary alone is not the surface;
   enforcement (whether validation changes downstream behavior) is.
6. **Owner-held outcome archive** — outcome events affecting later validation, warranty,
   service history, or routing. *Review:* no legal evidentiary status is asserted.
7. **Packet-scoped consent and custody rail** — owner-controlled, scoped, revocable
   sharing tied to physical fulfillment. *Review:* the prototype proves no production
   security architecture or real revocation enforcement.
8. **Safety-gated local-controller boundary** — remote systems generate validated
   envelopes or simulations while local controller and safety states determine whether
   motion may occur. *Review:* no live controller, safety certification, or production
   operation is asserted.
9. **AI-assisted packet generation bounded by validation gates** — model output
   constrained by packet structure, unable to release instructions or routing without
   validation. *Review:* no AI inventorship, autonomous control, or claim eligibility is
   asserted.
10. **Basis-labeled modeled-vs-measured metrics** — routing, reporting, or release logic
    depending on whether an event is modeled or measured. *Review:* no measured
    environmental or performance result is claimed.
11. **Packet-backed finance / escrow / rebate / public-program evidence rails** — a
    validated packet plus preserved outcome as structured evidence. *Review:* no real
    financing, program, or regulatory integration exists; separate eligibility and
    regulatory concerns apply.
12. **Regional micro-manufacturing and workforce gating** — packets routed to bounded
    local cells based on envelope, role/certification, availability, calibration, and
    refusal history. *Review:* the registry is a fixture; no real network is claimed.
13. **Wood-material governance** — wood represented by class, species/engineered node,
    grade, use class, emission class, movement risk, finish compatibility, and handling.
    *Review:* no claim that wood is environmentally superior or that any material
    performance has been measured.
14. **Safety-gated generated depictions** — generated diagrams or simulations constrained
    by declared machine states and development stage so nothing implies unsupported
    capability. *Review:* a depiction does not prove a machine exists, is safe, or is
    production-ready.
15. **Portable review record as stewardship infrastructure** — patents, documents, code,
    tests, UI, and build log organized for inspection without narration. *Review:*
    portability is not a legal transfer, license, or institutional acceptance.

## 4. Institution-agnostic and portable

The package is institution-agnostic and can be reviewed by a university, technology-
transfer office, public research program, manufacturing-extension organization,
commercialization partner, or qualified technical/legal reviewer. The architecture mirrors
that posture: the owner-held record requires no central owner above the homeowner, the
WorkPacket travels without surrendering the record, the ontology lets different parties map
into shared meaning, and the export lets the record move. The review record does not depend
on one meeting, one reviewer, or the inventor's narration — the proof is organized to be
inspected wherever a qualified steward has the capacity and diligence to carry it
responsibly. Portability is part of the governance design, not pressure.

---

*The issued patents are the foundation; the demonstration preserves an operating layer
built in their lineage. This document declares no conclusion about scope, novelty,
validity, freedom to operate, production readiness, safety, environmental performance,
institutional acceptance, or commercialization. It preserves the technical/IP review
surface in a form qualified reviewers can examine — that is its only role.*
