# ADR-0017 Bounded simulation adapter

Status: accepted

Context: Simulation must not be confused with physical work.

Decision: Finite simulation operations only, requiring a validated SimulationAuthorization.

Consequences: Live command vocabulary is refused.

Does not establish: machine safety certification.

Affected: packages/sim-adapter, packages/commands
