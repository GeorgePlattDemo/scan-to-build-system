# Application Intake + Authority Pass 0.1

**Status:** candidate implementation note  
**Branch:** `build/app-intake-authority-0.1`  
**Base:** `main@f4769bbf2daaf7e719b723478b7a24f3dfa1344a`  
**Owner:** Application  
**Purpose:** make the current intake, definition, Store, review, result, and owner-record boundaries legible in one working application without claiming capabilities that do not exist.

## Why this pass exists

The accepted application already contains real intake and record machinery: original evidence retention, observations separate from source files, correction history, candidate revisions, Board definition, Store evaluation, review, result, and owner archive.

What it lacked was the complete narrative seam connecting those pieces for a cold reader:

```text
whatever the person already has
        ↓
source retained
        ↓
observations / candidate inputs with basis
        ↓
conflicts / unknowns / unresolved conditions
        ↓
ask only for the next missing thing
        ↓
project definition
        ↓
review / confirm
        ↓
Store answer
        ↓
commercial / release / local-cell boundaries
        ↓
quality / fulfillment
        ↓
owner record
```

This pass deliberately gets broad enough to expose the entire spine before a later language-policing pass.

## Working rule

**Receive broadly; commit narrowly.**

Broad intake does not imply broad downstream capability.

A person may arrive with a sentence, measurements, photos, a scan, a sketch, PDF, drawing, takeoff, cut list, CAD/BIM/structured file, a previous project, or several of those together. The application should preserve what it receives, distinguish what it can actually use, expose what remains unresolved, and avoid silently promoting any source into controlling project truth.

## Two separate axes

Do not overload one status word to mean both provenance and authority.

### How we got it

Examples:

- SOURCE
- ENTERED OBSERVATION
- EXTRACTED CANDIDATE
- DERIVED

### What authority it has

Examples:

- RETAINED
- UNRESOLVED
- USED IN CANDIDATE
- USER-REVIEWED / USER-CONFIRMED

Reading or rendering a value does not make it controlling. Using it in a candidate still does not make a parser, Store, or downstream actor the project authority.

## Conflict rule

When sources disagree, preserve both and surface the conflict.

Do not:

- choose the newer-looking number automatically;
- treat one file type as inherently superior;
- round or normalize away the disagreement;
- let AI/model extraction decide which source controls.

A conflict is a question for the appropriate owner to resolve.

## General configurator direction

The configurator should behave as a gap-closing workbench, not a universal questionnaire.

A user with little information may be asked several questions. A professional with a clean takeoff should be asked only for the missing or conflicting fields. Bounded projects remain accelerators through the same definition process rather than separate truth systems.

The current candidate branch adds a working narrative prompt for the next visible gap. It is guidance only; it does not create new governed requirements.

## Human-in-the-loop direction

Some unresolved conditions belong neither to the holder nor to a deterministic rule. They may require bounded professional judgment.

The candidate application now exposes the intended distinction:

```text
HOLDER | RULE | QUALIFIED PERSON
```

Qualified resolution is a loop, not a ninth stage.

The detailed draft mechanism is in:

`../capability-bridge/QUALIFIED-RESOLUTION-0.1.md`

Current application work is narrative only. Routing, declared standing, persistence, blocking behavior, expiry, and validated resolution objects are not yet implemented.

## Eight-stage downstream responsibility map

The narrative baseline keeps this sequence visible:

```text
YOU
→ STORE
→ COMMERCIAL
→ PRODUCTION RELEASE
→ LOCAL CELL
→ QUALITY
→ FULFILLMENT
→ OWNER RECORD
```

The map is not a claim that all later stages are implemented. It is a responsibility boundary for the eventual system.

The project originates with the holder. Downstream authority gets narrower, not broader.

## Protected non-equivalences

At minimum:

- Confirmation ≠ order
- Order ≠ payment
- Payment ≠ material allocation
- Material allocation ≠ production release
- Production release ≠ machine readiness
- Machine readiness ≠ Cycle Start
- Store support ≠ Cycle Start
- Machine completion ≠ inspection
- Inspection ≠ staging
- Staging ≠ pickup
- Qualified resolution ≠ production release

## What this pass may be loose about

A later Astra/language pass is expected to tighten:

- page labels;
- repetition;
- tone;
- whether a concept belongs on one screen or another;
- naming of provisional UI sections;
- wording around consumer versus professional entry;
- stale or duplicate explanation.

## What this pass may not be loose about

Do not defer these to copy-editing:

- source / observation / candidate / confirmation distinctions;
- project authority;
- Store authority;
- qualified-person scope;
- production release;
- machine readiness;
- Cycle Start;
- physical outcome truth;
- no silent conversion;
- no silent conflict resolution;
- no fabrication claim from software results.

## Current implementation strategy

To avoid destabilizing accepted domain logic before the broader narrative is reviewed, the first code checkpoint adds a browser narrative layer over existing implemented screens rather than rewriting domain records.

That layer:

- expands the landing proposition;
- explains the common open-door intake contract;
- distinguishes provenance from authority;
- surfaces a working next-question prompt from current visible gaps;
- states Store boundaries;
- states confirmation boundaries;
- shows the qualified-person loop as planned/not implemented;
- shows the eight-stage responsibility map;
- shows the protected non-equivalences;
- reinforces the owner record as reconciliation rather than fabricated outcome truth.

Future work should decide which of those narrative elements graduate into first-class domain/UI objects and which remain explanation.

## Verification status

The new narrative module and modified application entry module were syntax-checked with Node in the working session.

The repository's automated application suites were **NOT RUN** in this connector-only session. CI status checks were absent for the first narrative wiring commit. Runtime/browser verification remains required before promotion.

**NO BLOOD ON WOOD.**
