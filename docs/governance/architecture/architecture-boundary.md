# Architectural boundary check

Command: `npm run check:import-graph` (which also runs `scripts/check-boundaries.ts`).

## What the check proves

- TypeScript sources under `packages/`, `apps/`, `capture-adapters/`, and `src/` do not contain a static `export function issueProductionExecutionAuthorization` symbol.
- `issueSimulationAuthorization` is exported only from `packages/authority`.
- Active sources do not construct `type: "SimulationAuthorization"` object literals outside `packages/authority` and type declarations.
- `runSimulation(` is referenced only from `packages/engine` and `packages/sim-adapter`.
- Those sources do not statically import Node network, child_process, serial, or HTTP-client modules listed in the checker.
- `eval(`, `new Function(`, and non-literal `import(` are not present in scanned active roots.
- `packages/engine` statically imports authority, gates, policy, and sim-adapter.
- Inactive module directory names are not imported from production source.

## What the check does not prove

- Absence of `import(variable)` constructed by string concatenation that evades the regex.
- Safety of files added outside the scanned roots.
- Absence of native addons or later compiled artifacts.
- Machine safety, legal authority, distributed trust, or complete STB-REF conformance.
- Defeat of a hostile process that mutates memory in the same runtime.

This is an in-process governed reference implementation. The eligibility integrity token is a deterministic digest used to detect in-process field mutation. It is not a signature, credential, or hostile-process security boundary.
