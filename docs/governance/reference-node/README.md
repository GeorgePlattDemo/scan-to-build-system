# Bounded reference yard — Phase 2

New Phase 2 implementation on the governed M1 baseline. This is a synthetic, simulation-only reference module, not complete STB-REF conformance, a commercial service, inventory, quotation, reservation, structural evaluation or machine-safety certification.

## Ports and evidence

`evaluateNode(input)` validates finite plain JSON against strict declared contracts and evaluates current synthetic facts. Its frozen report and plan are inspectable. Its separate empty decision handle is usable only through the evaluator's private registry; copying the report or constructing an object cannot create an accepted handoff.

`requestReferenceSimulation({ decision, currentInput })` consumes that one-use handle. It compares canonical SHA-256 content identities covering the complete request, offering, stock, station, datum, packet, envelope, operation and context input, and checks validity and independent elapsed runtime. The digest identifies content; it is not a digital signature or evidence of the declaring party's identity. Callers cannot supply clocks, eligibility, authorization, operations or completion IDs at this port.

`runReferenceNode(input)` composes evaluation and handoff. It returns distinct request-evaluation evidence, plan, M1 gates, simulation eligibility, JSON authorization evidence, a boolean recording whether process-local adapter authority was issued, simulation event and simulation-only outcome. Usable execution capability is never returned. The M1 authority mechanism is documented in [current simulation authority](../architecture/current-simulation-authority.md).

## Two machines and material facts

The sheet and dimensional station identities are separate capability providers. Installation is a separate boolean from capability and from stock availability. The fixtures cover both stations, either station alone, and neither station. No routing depends on a capability tier or a companion-operation heuristic. Mixed requests defer before planning.

Only the original bounded shelf packet content, sheet offering, sheet stock, sheet station and exact two-operation sequence may reach M1. Request dimensions, quantity and material must match that packet. One sheet fixture is exercised under both supported installation configurations. Every otherwise acceptable dimensional request retains its reference-yard acceptance/plan but the handoff defers at `DIMENSIONAL_M1_ENVELOPE_NOT_ACTIVATED`. This phase does not activate a dimensional M1 envelope.

Synthetic Meadows pine 10, poplar 8, oak 6 and cherry 6 inch bands are declared example limits, not universal facts. Stock records state actual and usable dimensions, quantity/unit, availability, yard, source, environment, lifecycle and validity. A listed but unavailable stock record refuses. Unknown or missing stock/quantity evidence defers. Positive finite dimensions and quantities, actual-versus-usable consistency, exact operations, yard/cell ownership, installed station and station/version-specific datum evidence are enforced. There is no unit conversion or silent material substitution.

## Time and unresolved conditions

This module accepts fixture-environment facts only. For reproducible fixtures their evaluation clock is fixed at `2026-09-06T12:00:00.000Z`; validity-window cases are evaluated against that explicitly reported synthetic time. No public caller-supplied clock is accepted. The decision separately records actual runtime issuance time. Handoff rejects a backwards runtime clock, five seconds of elapsed time, or a selected fact's validity expiry advanced by that elapsed time. This does not purport to validate real current inventory. Live-fact and trusted-clock provider contracts remain absent.

All declared conditions remain in evaluation evidence. Unknown conditions block. Only the existing M1 structural residual may remain compatible with execution. The original fixture's unverified-capture condition receives the named fixture-only disposition in M1, whose rule, scope and observation IDs remain in the final inspector. It is not a claim of verified measurement.

## Inspector, runner and integrity

Run `npm run run:refnode` for the asserted case matrix. Run `npm run inspect:refnode` for all evidence layers or `npm run inspect:refnode -- --case SHEET-AUTHORIZED` for one expanded case. Invalid case names or arguments fail. Both commands assert every expected case result; blocked cases must show no adapter invocation, execution or outcome. Expiry probes intentionally wait just over five seconds; unit tests advance the runtime clock instead.

The inspector records actual observed stock/station/datum versions. `liveM1Envelope` is null until an actual M1 handoff observes an envelope. It never substitutes a decision's claimed identity as an observation. Evaluation events remain `evaluated`; only the internal current M1 result can create `NodeOutcomeRecord`, whose status is `simulated_only` and `physicalWorkOccurred` is false.

`fixtures/reference-node.v1/INTEGRITY.json` covers every governed file recursively except itself. The existing two M1 integrity checks remain intact. New tests prove that extra, missing, changed and unlisted fixture data fail, and that a runner expectation mismatch exits nonzero. All typed fixtures and emitted records validate through the additive schema dispatcher. Eleven new record types and one public input schema use the existing schema-identifier convention; unused Candidate.2 service, project-class and handling contracts are not activated.

## Limitations

- Fixture facts are assertions, not authenticated declarations, actual inventory or installed real equipment.
- The sheet path is one exact original M1 packet; there is no general packet generator, nesting, material optimization or arbitrary-job authorization.
- Dimensional and mixed M1 execution remain inactive; no mixed planning or automatic routing exists.
- Simulation reports bounded operation identifiers; it does not execute kinematics, machining, physical cutting, finishing, labeling or assembly.
- Structural adequacy and physical capture verification remain unestablished. No collision, cycle-time, tolerance, material-condition or operator-competence assurance exists.
- Capabilities are process-local, one-use and short-lived; no persistence, cross-process authority, remote attestation, cryptographic signature, or protection from a compromised runtime is claimed.
- Pricing, reservation, orders, payment, lead time, special merchants, delivery, consumer CAD and contractor applications are absent. COLD and CONTRACTOR stay informative/inactive.
- No four-level machine experiment, virtual controller, G-code, postprocessor, controller connection, live motion, production issuer or dimensional-envelope activation is included.
- Patent traceability describes technical correspondence only and does not activate a contract or establish any legal or implementation conclusion about a claim.

## Permitted claim

A governed, inspectable, simulation-only reference-yard flow in which one bounded sheet-stock fixture may reach the existing M1 simulation path, while dimensional, mixed, unavailable, stale, malformed, mismatched, unresolved, forged, or unauthorized paths stop with explicit evidence.
