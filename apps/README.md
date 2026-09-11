# Application

**Status:** tree transferred
**Source:** `GeorgePlattDemo/grok-file` `build/app-foundation-0.1`
**Pin:** `4595b4785a2686486e477ce2e70fb3f476285a8d`
**Disposition:** ADMIT AS-IS

`apps/stb/` is the accepted application. It was copied as a tree. It was not rewritten in chat.

## Launch

```text
cd apps/stb
npm ci --no-audit --no-fund
npx playwright install chromium
npm start
```

Fixed origin: `http://localhost:4317`

```text
STB_STORE_ZERO_ROOT=<clean scan-to-build-store at b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d> npm start
```

Suites: `test:unit`, `test:browser`, `test:boundaries`, and with the Store pin `test:store` / `test:vertical`.

## Standing instruction

[`../work/capability-bridge/TRIAL-PROTOCOL.md`](../work/capability-bridge/TRIAL-PROTOCOL.md)

Log: [`../work/capability-bridge/TRIAL-LOG.md`](../work/capability-bridge/TRIAL-LOG.md)

## What this copy is not

- not Store 1
- not commissioned iron
- not a semantic redesign of Build 8
