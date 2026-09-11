# STB-BUILD-M1

Build document for milestone M1 of `scan-to-build-governed-reference`.

Status: implementation document for the first vertical slice. Does not amend STB-REF-0.2.5 domain semantics.

## 1. Purpose

Turn STB-REF-0.2.5 §3.1.2 and STB-PLAN-0.2.5 §6.1 / §7.1 into repository actions: files, schemas, gates, fixtures, tests, and definitions of done.

## 2. Activation discipline

Map the whole. Activate only what the two M1 fixtures plus the I0 unreachable-issuer invariant require.

Do not build the full ontology first. Planned modules stay in MODULE-INVENTORY.md and TERMS-REGISTER with status `planned`, `conceptual`, `historical`, or `quarantined`.

## 3. Identifier and units freeze for M1 fixtures

U-03 working freeze (fixture-only, recorded, not a closed legal decision): record ids match `^[A-Za-z0-9._:-]{8,128}$` and use `stb:{type}:{token}`.

U-04 working freeze: named unit table `in|mm|ft|m|kg|lb|sheet|ea|bf|lf|gal`. M1 site observations use `in`.

## 4. Files created for M1

### Schemas (`schemas/jsonschema`)

common, assertion-status, declared-record, class-hypothesis, project-template, project-instance, feature-of-interest, observation, observation-set, geometry, material-class, material-spec, application-rule, human-authority, machine-envelope, work-packet, gate-result, gate-definition, refusal-record, simulation-authorization, production-execution-authorization (schema only), execution-event, resolution-record, outcome-record, event.

### Packages

- `packages/model` — types + Ajv 2020-12 validation
- `packages/status` — status-profile materializer
- `packages/commands` — default-deny command classification
- `packages/policy` — constructs the only SimulationEligibilityDecision; callers cannot declare eligibility
- `packages/gates` — pure M1 gates
- `packages/authority` — SimulationAuthorization issuer from proof; production issuer absent
- `packages/sim-adapter` — bounded simulation events only
- `packages/engine` — fail-closed slice runner
- `capture-adapters/guided-manual` — unit enforcement
- `apps/inspector` — read-only provenance view

### Fixtures

- `fixtures/A-SHELF-SIM-PASS-MIN/` — FIX.A-SHELF-SIM-PASS-MIN.v1
- `fixtures/I0-NEG-LIVE-MOTION/` — FIX.I0-NEG-LIVE-MOTION.v1

### Tests

- `tests/unit/gates.test.ts`
- `tests/unit/status-model.test.ts`
- `tests/unit/units.test.ts`
- `tests/conformance/fixtures.test.ts`
- `tests/conformance/inspector.test.ts`
- `tests/negative/i0.test.ts`
- `tests/negative/import-graph.test.ts`
- `tests/adversarial/blocking-paths.test.ts`
- `tests/adversarial/sealing.test.ts`

## 5. Geometric fit rule

APP-RULE.SHELF-SPAN.GEOM.v1:

`shelfSpan_in <= openingClearWidth_in - sum(supportThickness_in)`

Fixture values: opening 46.25 in; supports 0.75 + 0.75 in; span 44.75 in → pass.

Structural span: no modulus, no handbook table. Record `STRUCTURAL_SPAN_NOT_EVALUATED`.

If geometric inputs are missing: G-SPAN-SHELF geometric condition is unresolved / G-GEOM-COMPLETE fails. Fallback is not an invented deflection number.

## 6. Commands

```bash
npm ci --no-audit --no-fund
npm run build
npm run validate:schemas
npm test
npm run run:m1
npm run inspect:m1
npm run check:import-graph
```

Definition of done (M1 milestone conformance, not complete-version conformance):

1. Every M1 schema compiles.
2. Canonical MIN fixture validates.
3. G-SPAN-SHELF geometric condition passes.
4. Packet and outcome carry physicalFabricationEligible=false and STRUCTURAL_SPAN_NOT_EVALUATED.
5. SimulationAuthorization binds packet version + envelope version.
6. SimulatedExecutionEvent is labeled simulation and does not set production readiness.
7. Live-motion command yields REMOTE_LIVE_MOTION_COMMAND_REFUSED.
8. Import graph has no production issuer.
9. Inspector read-model shows owner text, units, unresolved labels, and simulation markers.

## 7. Stop condition

Do not implement G-EGRESS, offerings, EvidenceCards, Project B, drawing/spatial capture, or production motion symbols.
