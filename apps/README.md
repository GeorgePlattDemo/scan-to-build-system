# Application load

**Status:** load plan  
**Accepted source:** `GeorgePlattDemo/grok-file` branch `build/app-foundation-0.1`  
**Pin:** `4595b4785a2686486e477ce2e70fb3f476285a8d`  
**Disposition:** ADMIT AS-IS when copied  
**Not done in this commit:** byte-exact tree copy

The accepted application is a Node + browser tree with tests and a vendored PDF.js worker (~1.4 MiB). It must be copied as a tree, not retyped through chat.

## What “loaded” means

`apps/stb/` in this repository is the same files as that pin, plus:

- this README;
- the trial protocol pointer below.

No semantic redesign during copy. Language already accepted on that branch stays until a later trial says `AMEND: app`.

## Copy command (local, once)

From a machine that can see both repositories:

```text
git clone git@github.com:GeorgePlattDemo/scan-to-build-system.git
cd scan-to-build-system
git fetch git@github.com:GeorgePlattDemo/grok-file.git 4595b4785a2686486e477ce2e70fb3f476285a8d
git checkout 4595b4785a2686486e477ce2e70fb3f476285a8d -- apps/stb
```

Commit that tree with provenance:

```text
Transfer accepted application tree from grok-file@4595b478
```

Do not edit files in that same commit except to add a one-line pointer in `apps/stb/README.md` to `../capability-bridge` wait: the pointer belongs in this file and in `apps/stb/README.md` as a short “read trial protocol first” line after the copy.

## Launch (after copy)

From `apps/stb/`:

```text
npm ci --no-audit --no-fund
npx playwright install chromium
npm start
```

Origin is fixed: `http://localhost:4317`.

Store suites need a clean Stage-2 checkout:

```text
STB_STORE_ZERO_ROOT=<scan-to-build-store at b40cdc60> npm start
```

## Standing instruction

Before changing the app to accept a new part, follow:

[`../work/capability-bridge/TRIAL-PROTOCOL.md`](../work/capability-bridge/TRIAL-PROTOCOL.md)

Record the result in:

[`../work/capability-bridge/TRIAL-LOG.md`](../work/capability-bridge/TRIAL-LOG.md)
