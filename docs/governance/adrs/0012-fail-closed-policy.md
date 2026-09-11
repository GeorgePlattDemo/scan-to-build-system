# ADR-0012 Fail-closed gate-to-authorization policy

Status: accepted

Context: Calculating a failed gate is not control.

Decision: Only a policy-constructed SimulationEligibilityDecision plus an explicit simulation command may issue SimulationAuthorization.

Consequences: Inspect/validate/run_gates never invoke the adapter.

Does not establish: distributed trust.

Affected: packages/policy, packages/authority, packages/engine
