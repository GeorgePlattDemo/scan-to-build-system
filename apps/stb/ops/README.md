# Published-job operational trial

This branch keeps two Store relationships separate on purpose.

- `STB_STORE_ZERO_ROOT` is the existing application Store checkout. It must satisfy the application's current `STORE_PIN` and continues to serve the accepted Board path.
- `STB_STORE_PUBLISHED_JOBS_ROOT` is the isolated published-job candidate checkout. It must be a clean checkout of `GeorgePlattDemo/scan-to-build-store` at `096e99d645d745b1670185f46c75de75f9e59661`.

Do not point both variables at whichever Store checkout happens to be available. A pin mismatch is a refusal condition, not something to work around.

With the candidate checkout mounted, run all three bounded published-job trials from `apps/stb` with:

```sh
npm run trial:published-jobs
```

The same candidate root lets the browser ask the isolated `/api/published-job` endpoint about the rectangular stencil and arched-opening reference jobs. If that checkout is absent, wrong, or dirty, the endpoint returns an unavailable diagnostic and the browser states that no Store answer was invented.

The published-job trial does not create an order, reserve material, issue a controller program or toolpath, authorize Cycle Start, or authorize physical fabrication. It is an application-to-Store evaluation trial only.
