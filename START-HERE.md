# Start here

This is the working **application** repository.

Repository roles are intentionally separate:

- **3D Solutions Program** — research, experiments, evidence, machine-development questions/findings, reviewed decisions/adoption records, partnerships/economic/business work, and migration/retirement records.
- **Scan-to-Build System** — application, canonical shared operational definitions, project-definition classes, records/custody, customer → Store → Yard journey, adapters/integration, and application tests.
- **Scan-to-Build Store** — Store-specific vocabulary, catalog/SKUs, material resolution, stock, admitted capability, modeled operations/time, economics, Store answers/refusals/deferrals, and Store-side tests.

Program investigates and records why. System defines what the job means. Store determines what this Store can provide for that job.

## First read

1. [`STB-CURRENT-BASELINE.md`](STB-CURRENT-BASELINE.md) — one answer for the accepted source tree, promotion event, Store pins, capability status, and parallel work.
2. [`docs/project/VERIFICATION-REGISTER.md`](docs/project/VERIFICATION-REGISTER.md) — what is actually proven, under which exact pins, and what remains not validated / not measured / not authorized.
3. [`docs/project/BRANCH-PR-GENEALOGY.md`](docs/project/BRANCH-PR-GENEALOGY.md) — accepted ancestry, parallel work, superseded work, and historical work.

Do not infer current status from PR chronology alone.

## Repository status

**Accepted source tree**

`1621d2ea146a248d200ecba59f4b87034a1b1cd5`

**Acceptance event**

PR #12, normal merge commit:

`97416e85b7cba3dabded6f32e419f7851514026c`

Accepted on **2026-09-13**.

Latest code head in the accepted ancestry recorded with full App candidate checks passing:

`dee4a307cf0866ac0985da92dfb5f74045ee90f9`

PR #10 is accepted ancestry, not a current application candidate. PR #7 remains the separate parallel machine-safety/controller-simulation candidate.

## Application

Tree: [`apps/stb/`](apps/stb/)

The transferred accepted application source lineage remains:

`GeorgePlattDemo/grok-file@4595b4785a2686486e477ce2e70fb3f476285a8d`

That is provenance for the transferred app. The later system-repository application development is accepted through source tree `1621d2ea146a248d200ecba59f4b87034a1b1cd5` and promotion PR #12.

Launch instructions and path-specific Store pins: [`apps/README.md`](apps/README.md).

## Current Store pin rule

Do not use one Store pin as a universal project constant.

- current tested Store source for dimensional `USER_DEFINED_BOARD_V1` and Alcove `ALCOVE_INSERT_V1`: `aa59dd92dde8db139081542f2102f035120fa097` (Store main, PR #13: spot drilling 3/16 in deep after the point, inset 1 1/2 in or 2 in) — this is the exact source consumed by current System code, the D-001 integration workflow, and the live hosted Store. Previous runtime pin `39a1b318063f62220c9c20c42200389098e0c687` is history.
- Live Store is the System pin; Review is historical. The frozen Review demo expects `39a1b318063f62220c9c20c42200389098e0c687`, so its live Store calls stop once the hosted Store runs this pin. To click the old demo, run that old Store SHA locally.
- accepted published-job / canonical S-001 proof path: `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc`
- 2026-09-13 accepted-baseline Stage-2 reference identity retained as provenance: `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d`

For the frozen current repair identities and old-versus-new classification, read [`docs/project/CURRENT-STATE-LOCK-2026-09-21.md`](docs/project/CURRENT-STATE-LOCK-2026-09-21.md).

Historical candidate pins and their roles are listed in [`STB-CURRENT-BASELINE.md`](STB-CURRENT-BASELINE.md).

## Daily evidence bench

1. Bench: [`work/capability-bridge/README.md`](work/capability-bridge/README.md)
2. Before changing the app or trying a new part: [`work/capability-bridge/TRIAL-PROTOCOL.md`](work/capability-bridge/TRIAL-PROTOCOL.md)
3. Log the row: [`work/capability-bridge/TRIAL-LOG.md`](work/capability-bridge/TRIAL-LOG.md)
4. Patents when the step touches disclosed relationships: [`work/capability-bridge/PATENTS.md`](work/capability-bridge/PATENTS.md)

Do not start in `grok-file`, a public exhibit, or a new demo folder.

## Current versus donor

| Need | Place |
| --- | --- |
| Accepted baseline / promotion status | `STB-CURRENT-BASELINE.md` |
| Verification evidence | `docs/project/VERIFICATION-REGISTER.md` |
| Branch / PR genealogy | `docs/project/BRANCH-PR-GENEALOGY.md` |
| App | `apps/stb/` |
| Trial protocol | `work/capability-bridge/TRIAL-PROTOCOL.md` |
| Dimensional / sheet / Store evidence surface | `work/capability-bridge/` |
| Current System machine interfaces / implementation evidence | `work/machines/` — retain only System-owned implementation material; broader research belongs in Program |
| Issued patents | `docs/patents/source/` |
| Atlas originals | `source-library/atlas-research/` (donor) |
| Detailed project/source index | `STB-PROJECT-STATE-AND-SOURCE-INDEX.md` |

## Do not

- Promote a parallel or historical candidate by wording alone.
- Invent a second app to try an idea.
- Reimplement Store-owned dimensional capability, travel/time, economics, refusal, or Q in the application/configurator. For a complete dimensional answer, call the exact pinned Store evaluator and preserve its calculation identity.
- Confirm a User-defined dimensional definition without a second Store evaluation and matching calculation identity. Unchanged governing inputs must return the same Store result or fail closed as `STORE_CALCULATION_DIVERGENCE`.
- Widen an envelope so a trial passes.
- Treat Store `SUPPORTABLE` as a physical cut.
- Treat simulated or reference machine behavior as commissioned production.
- Read a superseded PR statement as current merely because its branch remains recoverable.
- Delete historical repositories or branches until their required pins remain recoverable.

**NO BLOOD ON WOOD.**
