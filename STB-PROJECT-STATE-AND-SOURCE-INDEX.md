# Scan-to-Build Project State and Source Index

**Status:** reconciled project-order index  
**Repository:** `GeorgePlattDemo/scan-to-build-system`  
**Rule:** earlier material is source evidence until explicitly admitted; current-candidate evidence is not accepted/merged merely because it passes tests.

## 1. Start here

Use these documents before relying on any older planning, PR description, donor repository, or conversation history:

1. [`STB-CURRENT-BASELINE.md`](STB-CURRENT-BASELINE.md) — concise current baseline and candidate manifest.
2. [`docs/project/VERIFICATION-REGISTER.md`](docs/project/VERIFICATION-REGISTER.md) — exact proof map.
3. [`docs/project/BRANCH-PR-GENEALOGY.md`](docs/project/BRANCH-PR-GENEALOGY.md) — branch/PR order and disposition.
4. [`provenance/SOURCE-PINS.md`](provenance/SOURCE-PINS.md) — exact source identities by role/path.

The accepted application tree is in [`apps/stb/`](apps/stb/). Read [`apps/README.md`](apps/README.md) before using a Store pin or describing the app's status.

## 2. Project states

### ACCEPTED / MERGED

Current merged repository baseline:

`main@f4769bbf2daaf7e719b723478b7a24f3dfa1344a`

The accepted application tree entered this repository through merged PR #3. Its source lineage remains:

`GeorgePlattDemo/grok-file@4595b4785a2686486e477ce2e70fb3f476285a8d`

That source pin is provenance for the transferred application tree, not the identity of later system-repository candidate work.

### CURRENT CANDIDATE

`build/global-completion-path-0.1@b0caba518aa0e152fa107fe89267ab48ee81296f`

Latest code identity recorded with full App candidate checks passing:

`dee4a307cf0866ac0985da92dfb5f74045ee90f9`

The current candidate is descended through the open promotion chain:

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
```

The chain is current candidate history. It is not yet the merged repository baseline.

### REFERENCE / PARALLEL

PR #7 — `build/machine-controller-sim-safety-0.1@b23b2a95f71c89347bdf5c465369b7399b75e834`

This fail-closed machine-safety simulation is intentionally separate from the application promotion chain.

### SUPERSEDED

PR #4 — `build/sheet-mode2-storezero-0.1@0fc232e30843a67ed47c64c7a232c9980ff11e54`

Useful provenance; not the current S-001 source of truth.

### HISTORICAL / DO NOT BUILD FROM

PR #5 — failed recovery/recombination trial, closed without merge.

Earlier demos, donor branches, public exhibits, and historical repositories remain source evidence except where a current repository document specifically admits and pins them.

## 3. Exact current identities

| Subject | Identity | Role |
| --- | --- | --- |
| merged repository baseline | `scan-to-build-system/main@f4769bbf2daaf7e719b723478b7a24f3dfa1344a` | ACCEPTED / MERGED |
| transferred accepted app source | `grok-file/build/app-foundation-0.1@4595b4785a2686486e477ce2e70fb3f476285a8d` | accepted app provenance |
| current promotion base | `build/app-configurator-engine-0.1@8730c801d3cd2df193d8647b3de1e78fffeea62a` | frozen base of open promotion chain |
| current candidate branch | `build/global-completion-path-0.1@b0caba518aa0e152fa107fe89267ab48ee81296f` | CURRENT CANDIDATE |
| latest fully checked current-candidate code | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | code proof identity |
| Governed Reference | `scan-to-build-governed-reference/main@18949f163718a937f072f4be3a654bb303e53160` | governed reference |
| Stage-2 Store Zero | `scan-to-build-store@b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` | transferred accepted-app / Stage-2 path |
| current published-job / canonical S-001 Store | `scan-to-build-store@4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | current candidate exact Store proof path |
| parallel machine-safety candidate | `build/machine-controller-sim-safety-0.1@b23b2a95f71c89347bdf5c465369b7399b75e834` | PARALLEL CANDIDATE |

See [`provenance/SOURCE-PINS.md`](provenance/SOURCE-PINS.md) for historical/superseded pins and primary patent hashes.

## 4. Current candidate capability

### Application — CURRENT CANDIDATE

The current candidate includes bounded software paths for:

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

These are software-candidate facts. They do not establish physical production.

### D-001 — REFERENCE / SOFTWARE PATH

D-001 remains bounded and Store-evaluated. Modeled cell/economic behavior is not measured commissioned production.

### S-001 — CURRENT CANDIDATE APPLICATION PATH / REFERENCE MACHINE STATUS

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

The older PR #8 orientation statement of `6 in` left/right and `30 in` top/bottom is superseded by the PR #9 centered-field implementation/proof and the PR #10 retained result.

### Completion / handoff — CURRENT CANDIDATE

The candidate completion chain preserves Store refusal and requires explicit residual-work resolution, inspection, labeling, staging, pickup/delivery readiness, and closeout preparation before handoff readiness.

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

- **Application:** user interaction, evidence custody, configuration, revisions, Store-result presentation, review, records, completion/closeout state admitted in the candidate.
- **Store:** offerings, availability/inventory facts, bounded capability evaluation, Store economics, sourcing, and fulfillment facts.
- **Governed layer:** governed semantics, unresolved conditions, refusal, protected transitions, authorization boundaries, and governed provenance.
- **Machine / cell:** demonstrated physical capability, local operating limits, controls, readiness, and measured physical behavior.
- **Research:** questions, comparisons, evidence, and future possibilities.
- **Issued patents:** primary technical/patent-lineage sources; not present capability or safety evidence.

Words do not transfer authority between layers.

## 8. Protected distinctions

Preserve these distinctions:

- accepted baseline ≠ current candidate;
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
| `apps/stb/` | accepted transferred app lineage plus current candidate development |
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

The next pass is project order, not capability expansion:

1. review this reconciliation branch;
2. verify the front-door documents agree;
3. verify the candidate/parallel/superseded PR map remains accurate;
4. make an explicit promotion decision about the current candidate chain;
5. only then select the next real build from the reconciled baseline.

Potential later directions include Page-1/completion UX, machine/controller convergence, or another bounded project. None is automatically authorized by this index.

## 12. Safety

**NO BLOOD ON WOOD.**

Safety, refusal, unresolved conditions, human responsibility, and physical operating limits remain part of the architecture. A cleaner repository must not create a stronger capability claim than the evidence supports.
