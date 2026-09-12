# Current Store Foundation

**Current Store owner source:** `GeorgePlattDemo/scan-to-build-store`  
**Current Stage-2 pin consumed by the accepted app:** `ca6a6e01179f1e099d57d819ffdaccc0ee8a5aee`

This page records the Store boundary used by current post-app work. It does not replace the Store source documents.

## Store question

Given a governed project requirement, what can this Store actually provide, make, simulate, defer, or refuse?

The Store resolves a project requirement against material, stock, declared capability, economics and fulfillment without changing the meaning of the originating project.

## Ownership

### Governed layer owns

- canonical project/record semantics;
- authority/authorization rules;
- unresolved-condition handling;
- governed gates/refusal behavior;
- WorkPacket meaning;
- provenance/integrity;
- simulation versus production authority.

### Store owns

- material offerings;
- stock/availability facts;
- machine/process capability declarations;
- project-to-capability evaluation;
- bounded machine-neutral translation;
- Store economics;
- Store-side simulation/fulfillment results;
- execution-boundary information needed for routing/fulfillment.

### Application owns

- entry/journeys;
- evidence/capture/configuration interaction;
- user-facing presentation;
- resume/continuity;
- presentation of Store results.

### Machine / Cell owns

- installed physical mechanism;
- commissioned local geometry and station map;
- local lowering;
- controller programs/state;
- machine-local references;
- real-time motion/interlocks/stopping;
- observed physical cycle behavior.

## Never collapse

```text
project requirement
  ≠ material offering
  ≠ stock availability
  ≠ machine capability
  ≠ authorization
  ≠ physical execution
```

## Store → machine membrane

Store may transmit or expose a bounded work description and capability relationship. The commissioned machine/cell owns how that work becomes local motion.

The current Store README states that fixed-tool geometry, station locations, tool identity, machine references and controlled motion relationships belong in commissioned machine configuration; the job supplies finished dimensions, part-relative features, required operations and part identity.

That is the operating firewall for Store 1.

## Local control firewall

Keep separate:

- local manual/jog;
- local automatic execution;
- network communication.

Network presence is not motion authority. Loss of network must not become the real-time safety/stopping mechanism.

`POSITION_VALID` is machine-local reference validity. It is not readiness, authorization or proof of part conformance.

## Current Stage-2 Store meanings

Stage-2 Store Zero uses the aggregate job dispositions:

- `SUPPORTABLE`
- `UNRESOLVED`
- `REFUSED`
- `UNAVAILABLE`

Line stock status may include:

- `ON_HAND_SUFFICIENT`
- `ON_HAND_SHORT`
- `NOT_ON_HAND`

Q / `BudgetaryEstimate` remains a budgetary result, not a commercial quote.

Fixture stock is not live physical inventory. Modeled cycle time is not measured machine time.

## Store 1 expansion rule

New Store 1 content should answer real bounded questions from User 1 / project definitions. It should not become a dump of every possible SKU or machine detail.

For each added material/SKU/source path, preserve:

- identity;
- material/form;
- source/basis;
- availability/freshness meaning;
- capability needed;
- economics basis;
- special-order option where relevant;
- fulfillment meaning;
- explicit unavailable/unresolved/refused paths.

For each added capability, Store gets only the bounded declaration it needs. Detailed mechanics stay under `work/machines/engineering/`.
