# Current M1 simulation authority — Phase 2 correction

New Phase 2 implementation. JSON SimulationAuthorization remains inspectable evidence. It is never adapter-entry authority. Public evidence-policy APIs retained for baseline compatibility cannot supply current evaluation proof.

The engine evaluates finite plain input through schema validation, status materialization, the complete existing gate set and policy. A private WeakMap holds one-use evaluation proof. The authority package consumes that proof and issues an empty frozen process-local object. A separate private WeakMap binds that capability to the complete canonical input, evaluated context, packet and project content and versions, envelope content and version, exact operation list, unresolved conditions and authorization evidence. Caller fields and methods cannot replace registry state. No caller-supplied constructor or factory can insert an eligibility assertion into either registry. Arrays must be dense, have their standard prototype, and contain only indexed values and the native length property. Extra array properties, holes and custom prototypes are refused before canonical binding because JSON serialization would discard or reinterpret them.

The adapter consumes the capability once, compares bound content and checks an independent runtime clock. Both proof and capability expire at the next microtask, with an additional five-second runtime bound. Neither is returned in runM1Slice output. JSON round trips do not retain usable authority. This is an in-process integrity boundary, not a cryptographic signature, process isolation, or production authority.

The exact existing two-operation simulation sequence is `simulate_crosscut`, `simulate_shelf_blank`. The WorkPacket names its shelf-blank result; the existing envelope supplies the bounded crosscut preparation operation. Other operation lists stop. The reference-yard handoff must separately prove alignment to the unchanged bounded packet, material, geometry, quantity and envelope.

## Unresolved-condition reconciliation

The evaluator collects declared unresolved arrays, packet validation, input gate/evidence records, current gate conditions and policy conditions. Unknown codes remain in output and prevent issuance. Undeclared public input fields are rejected. Conditions cannot be cleared by omitting them from a later gate list.

`M1-FIXTURE-CAPTURE-SIMULATION-SCOPE` is a new, explicitly bounded disposition rule for the original synthetic shelf fixture. It requires the original fixture packet identity, fixture-environment observations, complete geometric evidence and a passed datum gate. Its evidence IDs and scope remain visible in `unresolvedEvidence`; the original code remains in `declaredUnresolved` and in unchanged source records. It permits use of represented dimensions in simulation only. It does not claim capture was verified, resolve physical measurement uncertainty, or provide production authority. Outside that scope `CAPTURE_NOT_YET_VERIFIED` blocks.

The only permitted residual is `STRUCTURAL_SPAN_NOT_EVALUATED`, under the existing complete-gate and geometric-fit policy. Structural adequacy is not established.

## Evidence

`tests/adversarial/current-execution.test.ts` covers record replay, copies, reconstructed authority, caller methods, substitution, same-ID content changes, changed operations, expiry, one-use consumption and unresolved injection. The original tests and fixture bytes are retained. This correction is an intentional extraction of assessment code into `packages/engine/src/evaluation.ts`, not a staging replacement.
