# CHANGELOG

## 0.2.5-m1.3 (2026-09-05)

Consolidation pass. Frozen r3 documentary hashes were not rewritten.

- Clarified public-repo lineage and the original behavioral sequence.
- Documented G-I0 as a subset aggregate; complete policy still controls issuance.
- Injected evaluation clock; fixture path keeps the explicit fixture clock.
- Added byte-identity fixture INTEGRITY.json and verification script.
- Documented metric non-conversion.
- Added informative custody, exposure, external-processing, planned-mechanism, and aggregate-stewardship notes.
- Added ADRs 0010–0020.

## 0.2.5-m1.2 (2026-09-04)

Sealing pass. Documentary r3 hashes were not rewritten.

- SimulationAuthorization is issued only from a policy-constructed `SimulationEligibilityDecision`.
- Caller-supplied prerequisite lists and fabricated eligibility objects cannot authorize.
- Absent/inspect/validate/run_gates commands evaluate only; they do not invoke the adapter.
- Simulation adapter rejects authorizations that lack schema, bindings, or decision token.
- Added sealing adversarial tests. Total suite 85.

## 0.2.5-m1.1 (2026-09-04)

Hardening pass on the M1 implementation candidate. Documentary r3 hashes were not rewritten.

- Regenerated `package-lock.json` so `npm ci` matches `package.json`.
- Restored a strict TypeScript build for implementation sources.
- Fail-closed orchestration: blocking gates prevent SimulationAuthorization and SimulatedExecutionEvent.
- SimulationAuthorization issued only from a validated proof object.
- Default-deny command boundary; bounded simulation operation vocabulary.
- Inspector displays observation identity, station, method, actor, and selected-derived flags.
- Patent PDFs removed from the repository; bibliographic pins retained.
- Adversarial blocking-path tests added.

Prior 0.2.5-m1 evidence remains below and in `FINAL-VALIDATION-REPORT.md` history notes.

## 0.2.5-m1 (2026-09-04)

- Imported STB-DOCUMENTARY-BASELINE-2026-09-04-r3 without alteration of controlling hashes.
- Implemented M1 schemas, gates, fixtures, tests, inspector read-model, and simulation adapter.
- No production issuer. No live motion path.

This changelog does not replace the r3 documentary changelog stored under `docs/documentary-baseline-2026-09-04-r3/CHANGELOG.md`.
