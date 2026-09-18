# Project-owned journey routing

**Status:** current human-visible routing protocol  
**Scope:** bounded projects in the Scan-to-Build human-visible application  
**Implementation target:** current promoted `scan-to-build-review` shell; accepted `apps/stb` runtime remains unchanged by this correction.

## Rule

**A bounded project owns its project state and project-specific content. The application shell owns the journey stages.**

A stage label such as `Store`, `Review`, `Request`, `Yard`, `Terms`, `Recap`, or `Record` does not identify an Alcove page. It identifies a journey stage that must render against the active project's own state.

The routing key is:

```text
active project
+ active revision
+ journey stage
```

not a copied family of project-specific transaction pages.

## Window Seat dual view

The Window Seat has two presentations of the same project/revision.

### Project view

The 0.7.3 long-form Window Seat remains one scrollable project artifact. It owns:

- capture/evidence;
- controlling measurements;
- configuration and three top-level modules;
- definition and stable part occurrences;
- material demand;
- Store request generation;
- Store Zero reference economics and capability answers;
- unresolved conditions;
- revision behavior.

The Project Library opens this view directly.

### Guided journey

A confirmed, unblocked Window Seat revision may hand the exact current project snapshot to the shell.

The shell then owns:

```text
Store
→ Review
→ Request
→ Yard
→ Terms
→ Recap
→ Record
```

Those stages are projections of the Window Seat project state. They are not a second Window Seat definition.

## Context invariants

1. `Back` and `Next` preserve active project identity.
2. Project Library is the explicit project-switch boundary.
3. Top navigation resolves inside the active project branch.
4. Window Seat Scan / Configure navigation returns to the long-form project at the corresponding section.
5. The Seat Store stage consumes the request and Store answer produced by the existing Window Seat 0.7.3 definition/adapter.
6. No Alcove dimensions, material state, price calculation, or transaction state may be substituted into the Window Seat branch.
7. A changed Window Seat definition creates a new revision in the Window Seat project. Guided stages observe that revision; they do not maintain an independent revision history.

## Store boundary

Store answers remain separate:

- definition;
- material requirement;
- Store material mapping;
- price evidence;
- availability;
- process capability;
- secondary-operation disposition;
- recovery basis;
- unpriced services;
- commercial authority;
- production authority.

A favorable Store answer does not establish order, payment, reservation, allocation, production release, machine readiness, Cycle Start, or physical fabrication.

## STOP / revision

A STOP remains attached to the version that produced it.

Resolution may lead to a new revision and rerun of dependent checks. The stopped version is not rewritten into a pass.

## Owner record

The record retains the active project identity, revision, stable component occurrences, material basis, Store evidence, and only those later outcomes that actually exist.

A later replacement request may begin from the exact recorded occurrence/revision/material basis. It does not authorize fabrication; current Store, safety, capability, commercial, production, and machine gates run again.

## Implementation boundary

This routing correction does not redesign:

- landing / three entry doors;
- Project Library/account behavior;
- Alcove definition/content;
- Window Seat dimensions/modules/visual logic;
- Window Seat Store math/economics;
- Store authority;
- machine authority;
- safety language.

**NO BLOOD ON WOOD.**
