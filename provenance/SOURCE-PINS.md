# Source Pins

This register records exact source identities and their current role. A pin is an identity, not a blanket endorsement of every statement made elsewhere at that point in project history.

For current project status, read [`../STB-CURRENT-BASELINE.md`](../STB-CURRENT-BASELINE.md).

## Accepted / merged foundation

| Subject | Repository | Branch / source | Pin | Current role |
| --- | --- | --- | --- | --- |
| Accepted promoted source tree | `GeorgePlattDemo/scan-to-build-system` | promotion source / PR #11 head | `1621d2ea146a248d200ecba59f4b87034a1b1cd5` | ACCEPTED SOURCE TREE |
| Promotion acceptance event | same | PR #12 normal merge to `main` | `97416e85b7cba3dabded6f32e419f7851514026c` | ACCEPTANCE / INTEGRATION MERGE |
| Prior merged system baseline | same | historical `main` starting point | `f4769bbf2daaf7e719b723478b7a24f3dfa1344a` | HISTORICAL ACCEPTED STARTING BASELINE |
| Transferred accepted application source | `GeorgePlattDemo/grok-file` | `build/app-foundation-0.1` | `4595b4785a2686486e477ce2e70fb3f476285a8d` | Provenance for accepted app tree transferred by PR #3 |
| Frozen application roadmap | `GeorgePlattDemo/grok-file` | `plan/app-master-roadmap-0.1` | `985db87a707bd454d7c58419e2cf4d884f00cded` | Historical controlling roadmap for transferred application build |
| Entry/intake contract | `GeorgePlattDemo/grok-file` | `plan/app-entry-intake-contract-0.1` | `2d80b5a7b0e7687c425e100bfa0ff3a833166d42` | Source contract; subject to current repository corrections |
| Governed Reference | `GeorgePlattDemo/scan-to-build-governed-reference` | `main` | `18949f163718a937f072f4be3a654bb303e53160` | Governed reference identity |
| Stage-2 Store Zero — accepted 2026-09-13 identity | `GeorgePlattDemo/scan-to-build-store` | `stage-2-store-zero-reference` | `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` | ACCEPTED BASELINE HISTORY; superseded for the current post-acceptance Stage-2 working path |
| Stage-2 Store Zero — current post-acceptance working path | `GeorgePlattDemo/scan-to-build-store` | `main` | `ab8a4c5d470c310f27fef82683611622ab976168` | Current `USER_DEFINED_BOARD_V1` material/capability/economics source · D-001 envelope 0.3 · pricing engine 0.2.3 |
| Store documentary foundation | `GeorgePlattDemo/scan-to-build-store` | `main` | `3620b35369d70cf49733bbb0b62c0f3d9969b738` | Store boundary/background source |

## Accepted application ancestry / proof identities

| Subject | Repository | Branch / source | Pin | Current role |
| --- | --- | --- | --- | --- |
| Frozen application promotion base | `GeorgePlattDemo/scan-to-build-system` | `build/app-configurator-engine-0.1` | `8730c801d3cd2df193d8647b3de1e78fffeea62a` | ACCEPTED ANCESTRY BASE |
| PR #6 operational jobs | same | `build/app-operational-jobs-0.1` | `17b950d6a4901b682ca5843e4df3e5d2af2985be` | ACCEPTED ANCESTRY |
| PR #8 durable jobs prep | same | `build/app-durable-jobs-0.1` | `62bf1ab1caf975ef7ca8cdc6d35c03d81bb08e79` | ACCEPTED ANCESTRY; contains superseded S-001 orientation statement |
| PR #9 canonical S-001 | same | `build/s001-canonical-configurator-0.1` | `1fe12d6e564045e6136750906b4e2206cf2e3898` | ACCEPTED ANCESTRY / CURRENT-TRUTH CORRECTION |
| PR #10 completion / durable S-001 | same | `build/global-completion-path-0.1` | `b0caba518aa0e152fa107fe89267ab48ee81296f` | ACCEPTED ANCESTRY |
| PR #10 latest fully checked code head | same | PR #10 ancestry | `dee4a307cf0866ac0985da92dfb5f74045ee90f9` | Exact code identity recorded with full App candidate checks passing |
| Published-job / canonical S-001 Store proof | `GeorgePlattDemo/scan-to-build-store` | functional Store candidate used by accepted PR #9/#10 path | `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` | ACCEPTED exact Store proof pin for published-job/S-001 path |

## Historical / superseded Store identities

| Subject | Pin | Current role |
| --- | --- | --- |
| Prior User 1 Stage-2 Store working pin | `c51f5f27af9a77bc7581c5d42c56f0a1ed0b650a` | SUPERSEDED by current User 1 Store authority `ab8a4c5d470c310f27fef82683611622ab976168` |
| PR #4 sheet Store path | `49d22ce40482a7c2e0169ac1e6df48e0f8384a6d` | SUPERSEDED candidate history |
| PR #6 combined published-job Store candidate | `096e99d645d745b1670185f46c75de75f9e59661` | ACCEPTED ancestry; superseded for current S-001 proof |

Do not replace the Stage-2 Store pin with the published-job pin globally. The Store identity is path-specific.

Current repair lock: [`../docs/project/CURRENT-STATE-LOCK-2026-09-21.md`](../docs/project/CURRENT-STATE-LOCK-2026-09-21.md).

## Parallel candidate identity

| Subject | Repository | Branch | Pin | Current role |
| --- | --- | --- | --- | --- |
| Machine fail-closed safety kernel | `GeorgePlattDemo/scan-to-build-system` | `build/machine-controller-sim-safety-0.1` | `b23b2a95f71c89347bdf5c465369b7399b75e834` | PARALLEL CANDIDATE; not accepted application ancestry |

## Primary patent sources

| Subject | Repository path | Identity | Current role |
| --- | --- | --- | --- |
| U.S. Patent 9,720,401 B2 | `docs/patents/source/US9720401B2.pdf` | SHA-256 `d6ff401ee0a60720c0d8b9819a0f828e15036deee1882da06dab7282da0311a4` | Primary issued patent source |
| U.S. Patent 10,768,609 B2 | `docs/patents/source/US10768609B2.pdf` | SHA-256 `3fd23f9dab7419098162836af25257d2736771bf27196824ad972b479a02b092` | Primary issued patent source / continuation |

## Pin discipline

- A historical pin remains useful evidence for that exact state.
- A later descendant does not silently rewrite the historical record, but it controls where it expressly corrects an earlier claim.
- Acceptance of the application source tree does not accept PR #7 or broaden any physical authority.
- Store support at an exact pin does not create physical execution authority.
- Reference or simulation identity does not establish commissioning.

**NO BLOOD ON WOOD.**
