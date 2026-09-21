# Scan-to-Build Current Baseline

**Purpose:** one dry project-order manifest for the repository.  
**Scope:** status and source-of-truth only; this file does not promote capability or authorize execution.  
**Rule:** acceptance is an explicit repository event; test success alone does not create physical, Store, machine, controller, or commercial authority.

## Working repository

`GeorgePlattDemo/scan-to-build-system`

## Accepted repository baseline

Acceptance date: **2026-09-13**

Accepted source tree:

`1621d2ea146a248d200ecba59f4b87034a1b1cd5`

Promotion PR:

`#12 — Promote reconciled Scan-to-Build candidate baseline`

Integration merge commit:

`97416e85b7cba3dabded6f32e419f7851514026c`

That merge commit is the acceptance event. The accepted source tree preserves the application ancestry that had been reviewed through PR #6 → PR #8 → PR #9 → PR #10 → PR #11. PR #7 was explicitly excluded and remains parallel.

Do not require this document to equal the instantaneous tip of `main`. The immutable facts above identify the accepted source tree and the merge event that admitted it.

## Accepted application source lineage

The application tree originally admitted to this repository came from:

- repository: `GeorgePlattDemo/grok-file`
- branch: `build/app-foundation-0.1`
- source pin: `4595b4785a2686486e477ce2e70fb3f476285a8d`

That pin remains provenance for the transferred accepted application. It is not the identity of the later system-repository development now accepted through promotion PR #12.

## Accepted promoted application tree

The promoted application development was reviewed through:

- frozen promotion base: `build/app-configurator-engine-0.1@8730c801d3cd2df193d8647b3de1e78fffeea62a`
- PR #6: `17b950d6a4901b682ca5843e4df3e5d2af2985be`
- PR #8: `62bf1ab1caf975ef7ca8cdc6d35c03d81bb08e79`
- PR #9: `1fe12d6e564045e6136750906b4e2206cf2e3898`
- PR #10 branch head: `b0caba518aa0e152fa107fe89267ab48ee81296f`
- PR #10 latest code head with full App candidate checks recorded as passing: `dee4a307cf0866ac0985da92dfb5f74045ee90f9`
- PR #11 reconciliation source / accepted source tree: `1621d2ea146a248d200ecba59f4b87034a1b1cd5`

These identities remain provenance. They are not competing current baselines.

## Store pins by path

| Path / role | Store pin | Status |
| --- | --- | --- |
| 2026-09-13 transferred accepted-app / Stage-2 Store Zero identity | `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` | ACCEPTED BASELINE HISTORY; SUPERSEDED FOR CURRENT STAGE-2 WORKING PATH |
| current post-acceptance Stage-2 / `USER_DEFINED_BOARD_V1` path | `c51f5f27af9a77bc7581c5d42c56f0a1ed0b650a` | CURRENT WORKING STORE PIN |
| PR #4 sheet Store path | `49d22ce40482a7c2e0169ac1e6df48e0f8384a6d` | SUPERSEDED CANDIDATE HISTORY |
| PR #6 combined published-job candidate | `096e99d645d745b1670185f46c75de75f9e59661` | ACCEPTED ANCESTRY; SUPERSEDED FOR CURRENT S-001 PROOF |
| published-job / canonical S-001 proof path accepted with the promoted tree | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | ACCEPTED EXACT STORE PROOF PIN |

Do not substitute one pin for another because the jobs have similar names. The path determines the pin.

The post-acceptance working-state lock for the current Start Your Own repair is [`docs/project/CURRENT-STATE-LOCK-2026-09-21.md`](docs/project/CURRENT-STATE-LOCK-2026-09-21.md). That lock does not rewrite the immutable 2026-09-13 acceptance identities above; it records later working truth separately.

## Current bounded capability status

### Application

**ACCEPTED SOFTWARE BASELINE**

The accepted promoted tree includes the bounded application chain through durable S-001 custody and global completion/closeout semantics. It preserves revision identity, Store request/response history, review, result/record, export/import/reopen, stale/imported retry refusal, and completion-state authority boundaries.

### D-001

**REFERENCE / SOFTWARE PATH; NOT PHYSICAL PRODUCTION**

The dimensional path remains bounded and Store-evaluated. Modeled or reference machine behavior is not measured commissioned production.

### S-001

**ACCEPTED APPLICATION PATH + REFERENCE STORE/MACHINE STATUS**

Canonical project: `S001_CENTERED_ARCHED_SHEET_V0`.

Current accepted software truth:

- parent sheet: `96 in` horizontal × `48 in` vertical;
- centered Store-owned work field: `48 in` horizontal × `36 in` vertical;
- reserved parent-sheet margins: `24 in` left/right and `6 in` top/bottom;
- canonical opening margins within field: `6 in` left/right and `0 in` top/bottom;
- Store derives the arch radius;
- retained-tab removal remains downstream selective work;
- S-001 drilling is not admitted this round;
- physical retention strength remains not measured;
- physical execution authority remains false.

The older `6 in` left/right and `30 in` top/bottom statement in PR #8 is superseded by the centered-field correction proved in PR #9 and retained through the accepted source tree.

### Completion / handoff

**ACCEPTED SOFTWARE BASELINE**

The promoted tree includes the bounded completion contract, mandatory labeling point, cell-steward promotion authority, inspection/staging/readiness/custody requirements, and closeout identity binding. Store refusal remains dominant.

### Machine safety/controller simulation

**PARALLEL CANDIDATE — PR #7**

The fail-closed safety kernel is intentionally separate from the accepted application promotion ancestry.

- branch: `build/machine-controller-sim-safety-0.1`
- pin: `b23b2a95f71c89347bdf5c465369b7399b75e834`
- controller target: selected for prototype;
- controller-in-loop validated: **false**;
- physical commissioned: **false**;
- physical execution authorized: **false**.

## Accepted ancestry and parallel work

### ACCEPTED PROMOTION ANCESTRY

```text
main starting baseline @ f4769bbf...
        ↓
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
PR #11 / accepted source tree @ 1621d2ea...
        ↓
PR #12 normal merge acceptance event @ 97416e85...
```

The ancestral PRs remain historical proof. They do not present separate current application baselines.

### PARALLEL CANDIDATE

- PR #7 — `build/machine-controller-sim-safety-0.1@b23b2a95f71c89347bdf5c465369b7399b75e834`.

Do not retarget or treat PR #7 as though it were part of the accepted application promotion ancestry.

### SUPERSEDED / HISTORICAL

- PR #4 — sheet Store candidate; superseded / reference history.
- PR #5 — failed recovery/recombination trial; historical / do not build from.

## Physical / commercial boundary

The current repository does **not** establish:

- commissioned physical production;
- controller-in-loop validation;
- physical Cycle Start authority;
- measured S-001 tab-retention physics;
- live commercial inventory, payment, reservation, or binding quotation merely from Store support;
- authority to turn Store refusal into customer choice or production approval.

## Next authorized change

The application baseline is now accepted. Select any next product, Store, machine/controller, or bounded-project work as a new explicit change from this accepted state.

Do not treat PR #7 or any historical branch as silently accepted merely because the application baseline has been promoted.

**NO BLOOD ON WOOD.**
