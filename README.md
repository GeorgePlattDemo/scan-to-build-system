# Scan-to-Build System

**Current working repository for the Scan-to-Build application, Store integration, machine/cell research, architecture, definitions, provenance, and verified project state.**

3D Solutions LLC · Greensboro, North Carolina  
U.S. Patents 9,720,401 B2 and 10,768,609 B2

**Private working repository**

## Open Scan-to-Build

<a href="https://georgeplattdemo.github.io/scan-to-build-review/system-build-current.html?v=55f824345f51b4932664b3c47978c9b22cd91577"><kbd>▶ OPEN SYSTEM BUILD</kbd></a>

**OPEN SYSTEM BUILD is the canonical human-visible current build.** A user-facing application change is not complete until it is visible through this button.

The prior exact public HTML is retained as a versioned recovery base for rollback and provenance. That retained file is not a second current build.

Where the visible build identifies reference, modeled, demonstration, planned, or unresolved behavior, those limits remain controlling. The visible build does not by itself establish live commerce or physical execution.

Application entry source: [`apps/stb/browser/index.html`](apps/stb/browser/index.html).  
Application operating notes: [`apps/README.md`](apps/README.md).

## Read order

Start with [`START-HERE.md`](START-HERE.md).

For project state, use these files in this order:

1. [`STB-CURRENT-BASELINE.md`](STB-CURRENT-BASELINE.md) — accepted source tree, promotion event, Store pins, capability status, and parallel work.
2. [`docs/project/VERIFICATION-REGISTER.md`](docs/project/VERIFICATION-REGISTER.md) — exact proof for current claims and explicit non-claims.
3. [`docs/project/BRANCH-PR-GENEALOGY.md`](docs/project/BRANCH-PR-GENEALOGY.md) — accepted ancestry, parallel work, superseded work, and historical work.
4. [`STB-PROJECT-STATE-AND-SOURCE-INDEX.md`](STB-PROJECT-STATE-AND-SOURCE-INDEX.md) — wider source and work-surface index.

Do not reconstruct current state from PR chronology, conversation history, or an old source pin when these files give a newer bounded answer.

---

## Project-order rule

The current application baseline was accepted on **2026-09-13**.

Accepted source tree:

`1621d2ea146a248d200ecba59f4b87034a1b1cd5`

Promotion PR #12 normal merge / acceptance event:

`97416e85b7cba3dabded6f32e419f7851514026c`

PR #10 is accepted ancestry, not a current application candidate. PR #7 remains a separate parallel machine-safety/controller-simulation candidate at `b23b2a95f71c89347bdf5c465369b7399b75e834`.

Acceptance does not establish physical production, controller-in-loop validation, live inventory, payment, reservation, or binding quotation.

---

## Purpose

This repository is the current working surface for Scan-to-Build.

Earlier repositories, demonstrations, prototypes, planning documents, research, and implementation experiments remain valuable source material, but they are not automatically current.

Legacy material enters the current system only after it has been checked against the current:

- architecture;
- terminology;
- ownership boundaries;
- information flow;
- demonstrated capability;
- safety and authority model;
- exact source/proof identity.

Useful earlier work should remain recoverable. Obsolete, contradictory, or demonstrably false material should not become current merely because it exists in project history.

---

## Current system responsibilities

### User application

The application owns the user-facing and owner-record path, including:

- project entry and identity;
- evidence custody;
- observations and corrections;
- bounded configuration;
- revision history;
- Store questions and bounded presentation of Store answers;
- review and unresolved acknowledgment;
- result/record custody;
- export, import, and reopening;
- accepted bounded completion and closeout semantics.

`apps/stb/` contains the transferred accepted application lineage and the later promoted development. Read [`apps/README.md`](apps/README.md) before using a source pin or Store pin.

### Store

The Store owns offerings, material/inventory facts, bounded capability evaluation, economics, sourcing, and fulfillment facts within the Store contract.

Store identity is path-specific. The transferred accepted-app Stage-2 path and the accepted published-job/S-001 proof path do not use the same Store pin.

A Store answer does not by itself authorize physical fabrication.

### Governed boundaries

Governance, Store evaluation, user review, machine capability, simulation, controller behavior, and physical execution are separate facts.

The system must not silently convert one into another.

Unresolved conditions remain unresolved until evidence supports their resolution.

### Machine and cell development

Machine/cell work is evidence-bounded.

Reference and simulated D-001/S-001 behavior is not commissioned physical production. The parallel fail-closed machine-safety kernel remains separate from the accepted application ancestry and does not establish controller-in-loop validation or physical execution authority.

Physical capability must be demonstrated before it is claimed.

Machine research and engineering live under [`work/machines/`](work/machines/).

---

## Current versus planned vocabulary

Use explicit status language:

- **ACCEPTED / MERGED**
- **PARALLEL CANDIDATE**
- **REFERENCE / SIMULATION**
- **DOCUMENTED**
- **RESEARCH**
- **PLANNED**
- **NOT ADMITTED**
- **NOT MEASURED**
- **NOT VALIDATED**
- **NOT CLAIMED**
- **NOT AUTHORIZED**

Planned capability should not be written in the present tense.

Reference or simulated behavior should not be presented as physical production evidence.

Modeled economics are not automatically commercial quotations.

Modeled machine time is not measured production time.

User review is not fabrication authorization.

A favorable Store evaluation is not physical execution.

---

## Source authority

Authority is subject-specific.

- **Application** — user interaction, evidence handling, configuration, revisions, Store-result presentation, review, records, and application state.
- **Store** — offerings, inventory/availability facts, Store capability evaluation, Store economics, sourcing, and fulfillment facts.
- **Governed layer** — governed meaning, unresolved conditions, refusal, protected transitions, authorization boundaries, and governed provenance.
- **Machine / cell** — demonstrated physical process capability, local operating limits, controls, readiness, and measured physical behavior.
- **Research** — questions, observations, comparisons, evidence, and future possibilities.
- **Issued patents** — primary sources for the disclosed technical/system relationships; not substitutes for current implementation, safety, commissioning, or legal analysis.

These boundaries may become more precise. They should not become less precise for convenience.

---

## Working rule for earlier material

Every pre-baseline artifact considered for current use should receive one of these dispositions:

- **ADMIT AS-IS** — current, accurate, and compatible.
- **ADMIT AFTER REWRITE** — useful content remains but terminology, flow, scope, status, or authority must be corrected.
- **ARCHIVE ONLY** — useful provenance or research, not current baseline.
- **REJECT FROM CURRENT BASELINE** — false, misleading, incompatible, or superseded material that must not guide current work.

Age alone does not determine disposition. Newer does not automatically mean correct.

Historical PRs follow the same principle: an older PR may remain useful history even when a later accepted descendant expressly corrects one of its statements.

---

## Patent foundation

The issued grants are retained directly in this repository:

- [`U.S. Patent 9,720,401 B2`](docs/patents/source/US9720401B2.pdf)
- [`U.S. Patent 10,768,609 B2`](docs/patents/source/US10768609B2.pdf)

Use [`docs/patents/PATENT-ALIGNMENT-GATE.md`](docs/patents/PATENT-ALIGNMENT-GATE.md) for current build work.

Claims, specification, and figures should be checked directly. Existing mappings are navigation aids, not substitutes for the issued grants.

Patent correspondence does not establish installed capability, commissioning, safety, production readiness, or a legal conclusion.

---

## Repository structure

```text
/
├── START-HERE.md
├── STB-CURRENT-BASELINE.md
├── STB-PROJECT-STATE-AND-SOURCE-INDEX.md
├── README.md
│
├── docs/
│   ├── project/
│   ├── definitions/
│   ├── governance/
│   ├── application/
│   ├── store/
│   ├── machine/
│   ├── cell/
│   └── patents/
│
├── provenance/
├── source-library/
│
├── work/
│   ├── capability-bridge/
│   ├── user-intake/
│   ├── store/
│   ├── machines/
│   └── cell/
│
└── apps/
    └── stb/
```

Folders are durable subject ownership. Branches and PRs are bounded change sets, not permanent filing cabinets.

---

## Current project direction

The baseline-promotion task is complete. Any next Page-1/completion UX, Store, machine/controller convergence, or bounded-project work should begin as a new bounded change from the accepted source tree.

PR #7 remains separate and requires its own integration decision.

---

## Safety

**NO BLOOD ON WOOD.**

Safety, refusal, unresolved conditions, human responsibility, and physical operating limits are part of the architecture.

No software result, patent correspondence, project status, Store answer, simulation result, or research objective overrides demonstrated physical safety requirements.

---

## Provenance

Material admitted from an earlier repository should retain enough information to identify:

- source repository;
- source branch/path;
- source commit or hash;
- original role;
- current disposition;
- substantive transformation made during admission.

Exact source identities are maintained in [`provenance/SOURCE-PINS.md`](provenance/SOURCE-PINS.md).

This repository is the working system. The historical corpus remains evidence, not an alternate current baseline.