# Application Source and Authority Pointers

This file separates **current authority** from **historical application provenance**.

A source pin preserves identity. It does not make the pinned donor current.

## Current implementation

- repository: `GeorgePlattDemo/scan-to-build-system`
- application subtree: [`apps/stb/`](../../apps/stb/)
- application status: [`apps/stb/README.md`](../../apps/stb/README.md)
- accepted/current-state records: [`../../STB-CURRENT-BASELINE.md`](../../STB-CURRENT-BASELINE.md) and [`../project/CURRENT-STATE.md`](../project/CURRENT-STATE.md)

**Disposition:** current executable application owner.

## Shared operational definitions

- repository: `GeorgePlattDemo/scan-to-build-system`
- canonical definition index: `docs/definitions/README.md`
- executable contracts/rules: `apps/stb/shared/`
- application semantic guardrails: `docs/application/SEMANTIC-GUARDRAILS.md`

**Disposition:** current shared operational semantic owner.

## Common entry architecture

- current owner: `GeorgePlattDemo/scan-to-build-system`
- current rule: `docs/application/COMMON-ENTRY-ARCHITECTURE.md`
- implementation/tests: `apps/stb/` and current browser/application test suites
- historical lineage: Governed Reference `docs/architecture/common-entry-contexts.md` at `18949f163718a937f072f4be3a654bb303e53160`

**Disposition:** current System operational architecture. Historical `COLD` / `PLACE` / `CONTRACTOR` labels remain provenance; current product-facing labels may differ without creating a second truth model.

## Information custody

- current operational owner: `GeorgePlattDemo/scan-to-build-system`
- current rule: `docs/application/INFORMATION-CUSTODY-BOUNDARY.md`
- implementation/evidence: `apps/stb/` local evidence/record/archive behavior and tests
- historical lineage: Governed Reference custody/disclosure/external-processing notes
- broader secondary-use / aggregation / participant / provider-policy questions: Program `governance/information-custody-and-processing.md`

**Disposition:** System owns current application custody and any future operational disclosure interface. Program retains broader research/policy questions and decision rationale.

## Program research / decision / migration record

- repository: `GeorgePlattDemo/3d-solutions-program`
- authority/destination register: `governance/authority.md`
- reviewed Governed Reference rulings and research provenance: Program governance/research records
- donor migration/retirement records: `migration/`

**Disposition:** current Program record owner, not the operational definition owner.

Program documents may supply research basis, evidence, and reviewed adoption decisions. A conflict with current operational behavior requires a deliberate System change and tests.

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

Use them only as explicitly identified lineage or recovery evidence. Current System operational definitions/code, current Store contracts/facts, and Program research/evidence/decision records control their own subjects.

## Machine / Cell donor material

Historical Grok Cell/Atlas documents remain research/provenance unless a current Program/System/Store record has explicitly admitted the relevant question or requirement.

Current unresolved machine-site research is recorded in Program at `research/machine-site-convergence.md`.

No donor machine document establishes commissioned capability, controller acceptance, or production authority.

## Preservation rule

Do not erase historical source pins merely because a donor is archived.

Do remove or correct wording that makes a historical donor appear to be the current application or governance authority.
