# System Governance and Historical Reference Evidence

**Current operational authority:** `GeorgePlattDemo/scan-to-build-system` owns the shared operational definitions and application contracts used to identify and carry a job.  
**Program role:** `GeorgePlattDemo/3d-solutions-program` owns research, experiments, evidence, reviewed decisions/adoption records, partnership/economic/business work, and migration/retirement records.

This directory contains System-relevant implementation boundaries and historical Governed Reference evidence copied into System during earlier consolidation.

It is **not** a second operational authority and does not restore the retired Governed Reference.

## Current authority rule

Use **System** for:

- canonical shared operational definitions and semantic boundaries;
- common-entry/application architecture that affects current job meaning or routing;
- information custody and record semantics implemented by the application;
- current application behavior;
- current application contracts/adapters;
- application state and records;
- System-specific tests and executable boundaries.

Use **Program** for:

- research questions and experiments;
- experimental evidence and machine-development findings;
- reviewed decisions/adoption records;
- partnership, economic, and business-development work;
- donor migration/retirement records.

Use **Store** for Store-owned material, stock, admitted capability, modeled work/time, economics, fulfillment facts, answers, refusals, and deferrals.

A Program decision may explain why a System or Store change should occur; it does not silently perform that change.

## What is here

- [`adrs/`](adrs/) — short decision records the app still follows (fail-closed, fixture immutability, identifier policy, no silent unit conversion, no model on the safety path, and others).
- [`architecture/`](architecture/) — the architecture boundary, current simulation authority, fixture revision and the M1 metric limitation.
- [`corrections/`](corrections/) — recorded corrections.
- [`identifier-policy.md`](identifier-policy.md).

## Historical Governed Reference evidence

Source repository (plain-text provenance): `GeorgePlattDemo/scan-to-build-governed-reference@18949f163718a937f072f4be3a654bb303e53160`.

On 2026-09-28 the copied Governed Reference repository files (`source/`, `reference-node/`, `legal/`) and six custody/disclosure research notes were removed from System. They remain in the archived Governed Reference repository and in System's git history at `scan-to-build-system@48bc96a977fa`. The custody research substance is carried in Program `governance/information-custody-and-processing.md`; the copyright ownership questions moved to Program `governance/copyright-ownership-questions.md`.

Read what remains here as evidence of the identified historical implementation, not as a substitute for current System operational definitions, current Store contracts, or Program research and decision records.

## Current safety boundary

Historical M1 evidence remains simulation/reference evidence. It does not establish:

- commissioned physical production;
- machine safety certification;
- structural adequacy;
- code compliance;
- current Store capability;
- physical Cycle Start authority;
- production authorization.

**NO BLOOD ON WOOD.**
