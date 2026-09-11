# Scan-to-Build System

**Current working repository for the Scan-to-Build application, Store, machine/cell development, architecture, definitions, research, and verified project state.**

3D Solutions LLC · Greensboro, North Carolina  
U.S. Patents 9,720,401 B2 and 10,768,609 B2

**Private working repository**

---

## Purpose

This repository is the current working surface for Scan-to-Build.

It begins with the accepted Scan-to-Build application baseline and moves forward from there.

Earlier repositories, demonstrations, prototypes, planning documents, research, and implementation experiments remain valuable source material, but they are not automatically current.

Legacy material enters this repository only after it has been checked against the current:

- architecture;
- terminology;
- ownership boundaries;
- information flow;
- demonstrated capability;
- safety and authority model.

Useful earlier work should not be lost.

Obsolete, misleading, contradictory, or demonstrably false material should not become part of the current baseline merely because it existed before.

---

## Current system

Scan-to-Build is an information-to-fabrication system under active development.

The current system separates several responsibilities.

### User application

The application owns the user-facing path, including:

- project entry;
- project identity;
- evidence custody;
- observations and corrections;
- bounded configuration;
- revision history;
- presentation of Store results;
- user review;
- truthful result presentation;
- owner-held project records;
- export, import, and reopening.

The current application has a tested first bounded vertical.

Additional project classes and capabilities will be added through this architecture rather than through separate demonstration applications.

### Store

The Store resolves project requirements against available material, inventory, capability, economics, and fulfillment paths.

The first working Store environment will be developed here as **Store 1**.

Store 1 will grow beyond the existing reference fixtures to include:

- a broader SKU and inventory model;
- supported local-stock paths;
- unavailable and unresolved paths;
- special-order capability;
- material and capability resolution;
- budgetary economic information;
- fulfillment information.

A Store answer does not by itself authorize physical fabrication.

### Machine and cell development

Physical machine development remains a separate engineering track.

The present direction is to establish:

- a dimensional-processing machine with additional bounded capability;
- a sheet-processing machine with limited automated capability;
- a two-machine research cell capable of performing a defined useful task.

The final task, process envelope, and machine architecture are not being assumed in advance.

The purpose of the research cell is to create enough real capability to begin learning from measured operation, constraints, refusals, material behavior, workflow, labor, and economics.

Physical capability must be demonstrated before it is claimed.

### Governed boundaries

Governance, Store evaluation, user review, machine capability, simulation, and physical execution are separate facts.

The system must not silently convert one into another.

Unresolved conditions remain unresolved until evidence supports their resolution.

---

## Working rule for earlier material

Previous Scan-to-Build repositories are source evidence.

They include valuable:

- architecture;
- research;
- terminology;
- demonstrations;
- diagrams;
- use cases;
- machine concepts;
- Store concepts;
- owner-record concepts;
- institutional material;
- public explanations;
- unfinished ideas.

They also contain terminology and assumptions that evolved during the project.

Before legacy material becomes part of this repository it should receive one of four dispositions:

- **ADMIT AS-IS** — current, accurate, and compatible with the present system.
- **ADMIT AFTER REWRITE** — useful content remains, but terminology, flow, scope, or authority must be corrected.
- **ARCHIVE ONLY** — useful for provenance or future reference but not part of the current baseline.
- **REJECT FROM CURRENT BASELINE** — false, misleading, incompatible, or superseded material that must not guide current work.

Age alone does not determine disposition.

Newer does not automatically mean correct.

Useful unfinished thinking should remain recoverable even when it is not adopted.

---

## Source authority

Authority is subject-specific.

A document does not become authoritative for the entire system merely because it is current.

The working model is:

- **Application** — user experience, evidence handling, configuration, review, records, and application state.
- **Store** — offerings, inventory facts, capability evaluation, economics, sourcing, and fulfillment facts.
- **Governed core** — governed meaning, unresolved conditions, refusal, authorization boundaries, provenance, and protected transitions.
- **Machine / cell** — demonstrated physical process capability, local machine limits, controls, and measured operation.
- **Research** — questions, observations, comparisons, evidence, and future possibilities.

These boundaries may become more precise as the system develops.

They should not become less precise for convenience.

---

## Current versus planned

This repository must distinguish clearly between:

- **IMPLEMENTED**
- **REFERENCE / SIMULATION**
- **DOCUMENTED**
- **RESEARCH**
- **PLANNED**
- **NOT CLAIMED**

Planned capability should never be written in the present tense.

Reference or simulated behavior should never be presented as physical production evidence.

Modeled economics are not automatically commercial quotations.

Modeled machine time is not measured production time.

User review is not fabrication authorization.

A favorable Store evaluation is not physical execution.

---

## Patent foundation

Scan-to-Build develops from the technical foundation described in:

- U.S. Patent 9,720,401 B2
- U.S. Patent 10,768,609 B2

Existing project mappings connect the issued patent material to the developing architecture.

The full issued patents will be retained as primary archival sources.

This repository does not use informal summaries as substitutes for the issued patent documents themselves.

---

## Repository direction

The intended working structure is approximately:

```text
/
├── README.md
├── STB-PROJECT-STATE-AND-SOURCE-INDEX.md
│
├── docs/
│   ├── project/
│   ├── architecture/
│   ├── definitions/
│   ├── application/
│   ├── store/
│   ├── machine/
│   ├── cell/
│   ├── research/
│   └── future/
│
├── apps/
│   └── stb/
│
├── store/
│
├── machine/
│
├── scenarios/
│
└── provenance/
```

The structure may change as the consolidation is completed.

The important requirement is that the repository remain understandable from its front door and that every current document have a clear role.

---

## Project state

This repository is being established after completion of the first accepted application build.

The immediate work is:

1. establish the clean post-application documentation baseline;
2. reconcile useful legacy material into current language and definitions;
3. establish the complete project source index;
4. bring the accepted application into this working surface;
5. define and expand Store 1;
6. define the first post-baseline user/project path;
7. continue dimensional-machine development;
8. develop the initial sheet-machine capability;
9. establish a bounded two-machine research cell;
10. use evidence from the working system to determine what should come next.

The repository should evolve from evidence, not from the need to make the project appear complete.

---

## Safety

**NO BLOOD ON WOOD.**

Safety, refusal, unresolved conditions, human responsibility, and physical operating limits are part of the architecture.

They are not presentation language to be removed when inconvenient.

No software result, project status, Store answer, or research objective overrides demonstrated physical safety requirements.

---

## Provenance

Material admitted from an earlier repository should retain enough information to identify:

- source repository;
- source branch;
- source path;
- source commit;
- original role;
- current disposition;
- any substantive transformation made during admission.

The previous project corpus will be preserved separately as the historical archive.

This repository is the working system.
