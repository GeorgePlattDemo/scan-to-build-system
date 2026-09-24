# Application Source and Authority Pointers

This file separates **current authority** from **historical application provenance**.

A source pin preserves identity. It does not make the pinned donor current.

## Current implementation

- repository: `GeorgePlattDemo/scan-to-build-system`
- application subtree: [`apps/stb/`](../../apps/stb/)
- application status: [`apps/stb/README.md`](../../apps/stb/README.md)
- accepted/current-state records: [`../../STB-CURRENT-BASELINE.md`](../../STB-CURRENT-BASELINE.md) and [`../project/CURRENT-STATE.md`](../project/CURRENT-STATE.md)

**Disposition:** current executable application owner.

## Shared definitions and governance

- repository: `GeorgePlattDemo/3d-solutions-program`
- canonical vocabulary: `governance/definitions.md`
- authority register: `governance/authority.md`
- enduring Governed Reference rulings: `governance/governed-reference-rulings.md`
- common-entry architecture: `governance/common-entry-architecture.md`

**Disposition:** current shared semantic/governance owner.

These Program documents do not silently change System runtime behavior. A conflict requires a deliberate System change and tests.

## Current intake surface

The current reconciled intake work surface is:

[`../../work/user-intake/README.md`](../../work/user-intake/README.md)

Historical entry/intake source:

- donor: `GeorgePlattDemo/grok-file`
- branch: `plan/app-entry-intake-contract-0.1`
- pin: `2d80b5a7b0e7687c425e100bfa0ff3a833166d42`

**Disposition:** provenance / donor history. Do not restore its stale Store dependency as current.

## Historical transferred application source

- donor: `GeorgePlattDemo/grok-file`
- branch: `build/app-foundation-0.1`
- pin: `4595b4785a2686486e477ce2e70fb3f476285a8d`
- historical subtree: `apps/stb/`

**Disposition:** transferred application provenance. The current app is the System copy and its accepted descendants.

## Historical roadmap and build documents

The following Grok documents are planning/build ancestry, not current controlling instructions:

- `plan/app-master-roadmap-0.1@985db87a707bd454d7c58419e2cf4d884f00cded`
- `docs/app/STB-APP-BUILD-0.1.md`
- `docs/app/STB-APP-SOURCE-MAP-0.1.md`
- `docs/app/STB-APP-STABILIZATION-0.1.md`
- `docs/app/STB-APP-STRUCTURE-0.1.md`
- Sarah/front-door prototypes

Use them only as explicitly identified lineage or recovery evidence. Current System code, current Store contracts, and Program definitions/governance control their own subjects.

## Machine / Cell donor material

Historical Grok Cell/Atlas documents remain research/provenance unless a current Program/System/Store record has explicitly admitted the relevant question or requirement.

Current unresolved machine-site research is recorded in Program at `research/machine-site-convergence.md`.

No donor machine document establishes commissioned capability, controller acceptance, or production authority.

## Preservation rule

Do not erase historical source pins merely because a donor is archived.

Do remove or correct wording that makes a historical donor appear to be the current application or governance authority.
