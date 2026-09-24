# Scan-to-Build Project State and Source Index

**Status:** accepted project-order index  
**Repository:** `GeorgePlattDemo/scan-to-build-system`  
**Rule:** earlier material is source evidence until explicitly admitted; acceptance does not broaden physical, Store, machine, controller, or commercial authority.

## 1. Start here

Use these documents before relying on any older planning, PR description, donor repository, or conversation history:

1. [`STB-CURRENT-BASELINE.md`](STB-CURRENT-BASELINE.md) — concise accepted source tree and promotion manifest.
2. [`docs/project/VERIFICATION-REGISTER.md`](docs/project/VERIFICATION-REGISTER.md) — exact proof map.
3. [`docs/project/BRANCH-PR-GENEALOGY.md`](docs/project/BRANCH-PR-GENEALOGY.md) — accepted ancestry, parallel work, superseded work, and historical work.
4. [`provenance/SOURCE-PINS.md`](provenance/SOURCE-PINS.md) — exact source identities by role/path.

The accepted application tree is in [`apps/stb/`](apps/stb/). Read [`apps/README.md`](apps/README.md) before using a Store pin or describing the app's status.

## 2. Project states

### ACCEPTED / MERGED

Accepted source tree:

`1621d2ea146a248d200ecba59f4b87034a1b1cd5`

Acceptance event:

PR #12 normal merge commit `97416e85b7cba3dabded6f32e419f7851514026c`

Acceptance date: **2026-09-13**.

The original transferred application source lineage remains:

`GeorgePlattDemo/grok-file@4595b4785a2686486e477ce2e70fb3f476285a8d`

That source pin is provenance for the transferred application tree, not a competing current baseline.

### ACCEPTED ANCESTRY

```text
build/app-configurator-engine-0.1 @ 8730c801...
        ↓
PR #6 @ 17b950d6...
        ↓
PR #8 @ 62bf1ab1...
        ↓
PR #9 @ 1fe12d6e...
        ↓
PR #10 @ b0caba51...
        ↓
PR #11 / accepted source @ 1621d2ea...
        ↓
PR #12 normal merge @ 97416e85...
```

PR #10 is accepted ancestry, not the current candidate.

### REFERENCE / PARALLEL

PR #7 — `build/machine-controller-sim-safety-0.1@b23b2a95f71c89347bdf5c465369b7399b75e834`

This fail-closed machine-safety simulation remains intentionally separate from the accepted application ancestry.

### SUPERSEDED

PR #4 — `build/sheet-mode2-storezero-0.1@0fc232e30843a67ed47c64c7a232c9980ff11e54`

Useful provenance; not the accepted S-001 source of truth.

### HISTORICAL / DO NOT BUILD FROM

PR #5 — failed recovery/recombination trial, closed without merge.

Earlier demos, donor branches, public exhibits, and historical repositories remain source evidence except where a current repository document specifically admits and pins them.

## 3. Exact current identities

| Subject | Identity | Role |
| --- | --- | --- |
| accepted source tree | `scan-to-build-system@1621d2ea146a248d200ecba59f4b87034a1b1cd5` | ACCEPTED SOURCE TREE |
| promotion acceptance merge | `scan-to-build-system/main@97416e85b7cba3dabded6f32e419f7851514026c` | ACCEPTANCE EVENT |
| prior merged starting baseline | `scan-to-build-system/main@f4769bbf2daaf7e719b723478b7a24f3dfa1344a` | HISTORICAL ACCEPTED START |
| transferred accepted app source | `grok-file/build/app-foundation-0.1@4595b4785a2686486e477ce2e70fb3f476285a8d` | accepted app provenance |
| accepted promotion base | `build/app-configurator-engine-0.1@8730c801d3cd2df193d8647b3de1e78fffeea62a` | accepted ancestry base |
| PR #10 branch head | `build/global-completion-path-0.1@b0caba518aa0e152fa107fe89267ab48ee81296f` | accepted ancestry |
| latest fully checked code in accepted ancestry | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | code proof identity |
| System canonical shared operational definitions | `scan-to-build-system/main` → `docs/definitions/README.md` + `apps/stb/shared/` | CURRENT SHARED OPERATIONAL SEMANTIC OWNER |
| Program research/evidence/decisions/migration | `3d-solutions-program/main` | CURRENT PROGRAM RECORD OWNER |
| Governed Reference | `scan-to-build-governed-reference/main@18949f163718a937f072f4be3a654bb303e53160` | HISTORICAL GOVERNANCE / REFERENCE PROVENANCE |
| Stage-2 Store Zero | `scan-to-build-store@b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` | transferred accepted-app / Stage-2 path |
| accepted published-job / canonical S-001 Store | `scan-to-build-store@4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | accepted exact Store proof path |
| parallel machine-safety candidate | `build/machine-controller-sim-safety-0.1@b23b2a95f71c89347bdf5c465369b7399b75e834` | PARALLEL CANDIDATE |

See [`provenance/SOURCE-PINS.md`](provenance/SOURCE-PINS.md) for historical/superseded pins and primary patent hashes.

## 4. Accepted bounded software capability

### Application — ACCEPTED SOFTWARE BASELINE

The accepted tree includes bounded software paths for:

- project identity and durable local custody;
- evidence/observation/revision handling;
- Store request, attempt, response, review, result, and record custody;
- D-001 / Board published-job evaluation;
- rectangular sheet published-job evaluation;
- canonical centered S-001 configuration;
- exact Store-backed canonical S-001 evaluation;
- durable S-001 archive/export/import/reopen behavior;
- stale/imported Store retry refusal;
- response identity/authority quarantine;
- bounded completion plan, labeling, handoff, custody, and closeout semantics.

These are software facts. They do not establish physical production.

### D-001 — REFERENCE / SOFTWARE PATH

D-001 remains bounded and Store-evaluated. Modeled cell/economic behavior is not measured commissioned production.

### S-001 — ACCEPTED APPLICATION PATH / REFERENCE MACHINE STATUS

Canonical project: `S001_CENTERED_ARCHED_SHEET_V0`.

Current geometry and status:

- parent sheet: `96 in` horizontal × `48 in` vertical;
- Store-owned centered work field: `48 in` horizontal × `36 in` vertical;
- reserved parent-sheet margins: `24 in` left/right and `6 in` top/bottom;
- canonical opening margins inside field: `6 in` left/right and `0 in` top/bottom;
- Store derives radius;
- current tab policy remains Store-owned;
- tab-retention strength is not measured;
- retained-tab removal is selective downstream work;
- S-001 drilling is not admitted this round;
- physical/controller authority remains false.

The older PR #8 orientation statement of `6 in` left/right and `30 in` top/bottom is superseded by the PR #9 centered-field implementation/proof and retained through the accepted source tree.

### Completion / handoff — ACCEPTED SOFTWARE BASELINE

The accepted completion chain preserves Store refusal and requires explicit residual-work resolution, inspection, labeling, staging, pickup/delivery readiness, and closeout preparation before handoff readiness.

Operator authority remains STOP / REPORT only. Cell-steward authority is distinct from customer choice and machine/controller authority.

## 5. Verification evidence

Use [`docs/project/VERIFICATION-REGISTER.md`](docs/project/VERIFICATION-REGISTER.md) rather than inferring proof from prose.

Current evidence includes:

- exact code identities;
- exact Store identities;
- Store-backed published-job trials;
- current S-001 geometry proof;
- durable archive round trips;
- stale/imported retry refusal;
- response/authority firewall tests;
- completion hardening tests;
- proof/trial hashes;
- a separate fail-closed machine-safety simulation test record.

Evidence remains bounded by its exact pins and claim.

## 6. Physical / commercial non-claims

Current project documents do not establish:

- live yard inventory;
- commercial quotation, payment, reservation, or order acceptance merely from Store support;
- production authorization;
- commissioned D-001 physical production;
- commissioned S-001 physical production;
- controller-in-loop validation;
- physical Cycle Start authority;
- measured S-001 tab-retention physics;
- measured production performance where only modeled behavior exists.

## 7. Authority by layer

- **Application:** user interaction, evidence custody, configuration, revisions, Store-result presentation, review, records, completion/closeout state admitted in the accepted software baseline.
- **Store:** offerings, availability/inventory facts, bounded capability evaluation, Store economics, sourcing, and fulfillment facts.
- **Program:** research, experiments, evidence, reviewed decisions/adoption records, partnership/economic/business work, and migration/retirement records. Program does not silently alter runtime behavior.
- **System:** canonical shared operational definitions plus application-specific protected transitions, records, adapters and tests.
- **Machine / cell:** demonstrated physical capability, local operating limits, controls, readiness, and measured physical behavior.
- **Research:** questions, comparisons, evidence, and future possibilities.
- **Issued patents:** primary technical/patent-lineage sources; not present capability or safety evidence.

Words do not transfer authority between layers.

## 8. Protected distinctions

Preserve these distinctions:

- accepted software baseline ≠ physical production;
- candidate definition ≠ canonical governed WorkPacket;
- Store `SUPPORTABLE` ≠ physical execution;
- Store evaluation ≠ fabrication authorization;
- user review ≠ order/payment/Store commercial acceptance/governed execution authority;
- budgetary estimate ≠ binding commercial quotation;
- fixture/reference stock ≠ live yard inventory;
- modeled cycle time ≠ measured production time;
- simulation ≠ physical execution;
- controller target selected ≠ controller-in-loop validated;
- reference safety kernel ≠ commissioned physical safety system;
- patent correspondence ≠ installed capability;
- candidate component ≠ commissioned machine fact.

## 9. Current stable work surfaces

| Work surface | Role |
| --- | --- |
| `apps/stb/` | accepted transferred lineage plus accepted promoted application development |
| `work/capability-bridge/` | daily evidence/trial bench |
| `work/user-intake/` | user/project intake work |
| `work/store/` | Store expansion/research work |
| `work/machines/` | machine research, engineering, simulation, and evidence |
| `work/cell/` | bounded cell convergence/research |
| `docs/project/` | current state, verification, source authority, branch/PR order |
| `docs/patents/` | issued patent sources and patent-alignment discipline |
| `provenance/` | exact pins, admission history, source disposition |
| `source-library/` | donor/source material not automatically current |

Folders are durable subject ownership. Branches are bounded change sets, not permanent filing cabinets.

## 10. Legacy admission rule

Every pre-baseline artifact considered for current use receives one of four outcomes:

- `ADMIT AS-IS`
- `ADMIT AFTER REWRITE`
- `ARCHIVE ONLY`
- `REJECT FROM CURRENT BASELINE`

The same discipline applies to historical PR statements. Preserve them as evidence, but do not let superseded statements remain unlabeled current truth.

## 11. Next bounded work

The application baseline is accepted. Select the next real build from that state rather than from open ancestral PRs.

Potential later directions include Page-1/completion UX, machine/controller convergence, Store work, or another bounded project. None is automatically authorized by this index.

PR #7 remains a separate integration decision.

## 12. Safety

**NO BLOOD ON WOOD.**

Safety, refusal, unresolved conditions, human responsibility, and physical operating limits remain part of the architecture. Repository acceptance must not create a stronger capability claim than the evidence supports.
