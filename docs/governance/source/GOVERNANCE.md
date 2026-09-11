# Governance

Repository name: `scan-to-build-governed-reference`.
Namespace: `stb`. Package prefix intended: `@stb/`.

## Authority of documents

STB-REF-0.2.5 controls domain semantics. STB-PLAN-0.2.5 controls activation sequence. STB-BUILD-M1 controls this slice’s file actions. Demand as Architecture 0.3, Common Entry Contexts, and the traceability map are informative.

## Roles

Owner-admin; maintainer; core implementer; reviewer. A generic admin role shall not close I0 gates.

## Rules

- I0 and I1 are not discretionary.
- Planned objects do not become requirements by appearing in a register.
- Fixture files are immutable after release. Corrections create a new fixture id.
- ProductionExecutionAuthorization shall not have a runtime issuer in 0.2.x.
- Transfer intent: prefer an organization account if one can be created; until then the creating owner remains admin (U-01 open).
