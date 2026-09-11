# Scan-to-Build governed reference

Private / all-rights-reserved reference implementation of the Scan-to-Build M1 slice.

This repository is the third professional repository contemplated by STB-PLAN-0.2.5. It is not a product, not a marketing site, not a live machine controller, and not complete STB-REF-0.2.5 conformance.

## Current status

- Documentary baseline imported: STB-DOCUMENTARY-BASELINE-2026-09-04-r3 (STB-REF-0.2.5, STB-PLAN-0.2.5). Controlling hashes unchanged.
- Milestone implemented here: **M1 executable baseline (0.2.5-m1.3)** — PLACE-based built-in-shelving path plus default-deny live-motion refusal. The verified 0.2.5-m1.2 archive remains a historical checkpoint.
- Production authorization: **not issuable**.
- COLD and CONTRACTOR: documented, **not implemented**.
- Permitted claim: “A governed, inspectable, simulation-only path through the first bounded Project A slice.”
- That claim does **not** imply structural adequacy, fabrication eligibility, production readiness, code compliance, first-fit accuracy, safe installation, complete STB-REF-0.2.5 conformance, or patent-proven safety.

Background patents associated with the project (not runtime rules): U.S. Patent No. 9,720,401 and U.S. Patent No. 10,768,609. See `legal/patents/README.md`.

## What this is not

- Not a CNC or tandem-machine runtime.
- Not a pricing, SKU, inventory, or retail workflow engine.
- Not an OWL/RDF ontology.
- Not an institutional endorsement package.
- Not a grant narrative.

## I0 / simulation boundary

I0 — No blood on wood — is an invariant. A caller may request evaluation; a caller may not declare itself eligible. SimulationAuthorization is issued only from a policy-constructed decision bound to the actual GateResult set. Absent, inspect, validate, and run_gates commands never authorize or invoke the simulation adapter.

## M1 scope

Owner declaration → accepted Project A class → guided-manual observations → SITE.ORIGIN scalars → geometric shelf fit → one MaterialClass + one MaterialSpec → WorkPacket `stb.packet/0.2` → SimulationAuthorization → SimulatedExecutionEvent → ResolutionRecord path=`make` + OutcomeRecord.

Required labels on packet and outcome:

- `physicalFabricationEligible=false`
- `STRUCTURAL_SPAN_NOT_EVALUATED`

Companion negative fixture: FIX.I0-NEG-LIVE-MOTION.v1 → `REMOTE_LIVE_MOTION_COMMAND_REFUSED`.

## Canonical-document rule

Markdown is canonical. DOCX files in this tree are distribution counterparts imported from the r3 baseline. If Markdown and DOCX differ, Markdown controls.

Controlling documents:

- `specs/STB-REF-0.2.5.md`
- `plans/STB-PLAN-0.2.5.md`

Informative:

- `foundations/NC_Wood_Demand_as_Architecture_ss1-12_0.3.md`
- `docs/architecture/common-entry-contexts.md`
- `docs/architecture/demand-architecture-traceability.md`

## Builder reading order

1. This README
2. `STB-BUILD-M1.md`
3. `CHANGE-REGISTER.md`
4. `specs/STB-REF-0.2.5.md` §3.1.2, §5, §13, §19, §20, §26.1A–B
5. `plans/STB-PLAN-0.2.5.md` §5–7
6. `GOVERNANCE.md`, `LICENSE-STATUS.md`, `NOTICE.md`

## How to validate and test

Requires Node.js 20+.

```bash
npm ci --no-audit --no-fund
npm run build
npm run validate:schemas
npm test
npm run run:m1
npm run inspect:m1
npm run check:import-graph
npm run verify:fixtures
npm run verify:sources
```

No network is required after install. There is no production control export.

## Contribution and license status

No public reuse license is granted. Outside contributors are blocked until `legal/ownership-questions.md` is reviewed. See `LICENSE-STATUS.md` and ISS-M0-002.

## Next authorized step after M1 green

Do not start I-PUBLIC UI, offerings, Project B, drawing/spatial adapters, or kinematic simulation. Widening order is STB-PLAN-0.2.5 §6.2.
