# Published-job operational trial

The accepted application currently keeps two exact Store relationships separate on purpose.

- `STB_STORE_ZERO_ROOT` is the established application Store checkout. It must satisfy `STORE_PIN = b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` and serves the accepted Board / Stage-2 path.
- `STB_STORE_PUBLISHED_JOBS_ROOT` is the accepted published-job / canonical S-001 checkout. It must satisfy `PUBLISHED_JOB_STORE_PIN = 4402abeb6b0299a5b6db2eec85ed04c3b0236bcc` and serves the rectangular-sheet and centered arched S-001 trial path.

Do not point both variables at whichever Store checkout happens to be available. A pin mismatch is a refusal condition, not something to work around.

With the exact published-job checkout mounted, run all three bounded published-job trials from `apps/stb` with:

```sh
npm run trial:published-jobs
```

The published-job root lets the browser ask the isolated `/api/published-job` endpoint about the named bounded jobs. If that checkout is absent, wrong, or dirty, the endpoint returns an unavailable diagnostic and the browser states that no Store answer was invented.

## Reconciliation candidate — not yet an accepted pin

Store reconciliation work has produced one candidate that contains the established Stage-2/Board lineage, D-001, rectangular-sheet S-001, the canonical centered arched S-001 correction, and the reconciled named-job register:

`GeorgePlattDemo/scan-to-build-store@c0a34c180dfd39960f1c90d773f7954e4bd73a1b`

This candidate is **not** an accepted System pin merely because it is newer.

Validation performed on 2026-09-14:

- all eight Store candidate test files passed on `stabilize/store-reconciliation-0.1`;
- a System CI trial ephemerally replaced both Store pins with `c0a34c180dfd39960f1c90d773f7954e4bd73a1b`;
- the System Store source-gate suite passed against that exact clean checkout;
- all three bounded published-job trials passed against that same checkout;
- the trial left the Store checkout clean;
- no production System pin was changed by the trial.

Promotion of the reconciled Store candidate is a separate source-of-truth decision and should happen only after the stabilization line is reviewed as a whole.

The published-job trial does not create an order, reserve material, issue a controller program or toolpath, authorize Cycle Start, or authorize physical fabrication. It is an application-to-Store evaluation trial only.
