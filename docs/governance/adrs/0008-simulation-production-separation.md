---
id: ADR-0008
title: Simulation and production authorization are separate types
status: accepted
compelledBy: I0
---

SimulationAuthorization shall not be convertible into ProductionExecutionAuthorization. Production issuance is unreachable in v0.2. Both type separation and package absence of an issuer are required.
