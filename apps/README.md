# Application

`apps/stb/` contains the accepted transferred application tree plus later candidate development in this repository.

Do not use one SHA to describe both facts.

## Accepted transferred lineage

**Source:** `GeorgePlattDemo/grok-file` `build/app-foundation-0.1`  
**Source pin:** `4595b4785a2686486e477ce2e70fb3f476285a8d`  
**Repository admission:** merged PR #3  
**Disposition:** accepted transferred application provenance

The accepted tree was copied into this repository. That source pin remains provenance for the transferred application baseline.

## Current candidate lineage

**Promotion base:** `build/app-configurator-engine-0.1@8730c801d3cd2df193d8647b3de1e78fffeea62a`  
**Current candidate:** `build/global-completion-path-0.1@b0caba518aa0e152fa107fe89267ab48ee81296f`  
**Latest fully checked code head recorded in PR #10:** `dee4a307cf0866ac0985da92dfb5f74045ee90f9`

This candidate is not accepted/merged merely because its checks pass.

See [`../STB-CURRENT-BASELINE.md`](../STB-CURRENT-BASELINE.md) before changing the app.

## Launch

```text
cd apps/stb
npm ci --no-audit --no-fund
npx playwright install chromium
npm start
```

Fixed origin: `http://localhost:4317`

## Store paths

Store identity is path-specific.

### Transferred accepted-app / Stage-2 Store Zero path

```text
STB_STORE_ZERO_ROOT=<clean scan-to-build-store at b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d> npm start
```

### Current published-job / canonical S-001 candidate path

Use a clean exact Store checkout at:

`4402abeb6b0299a5b6db2eec85ed04c3b0236bcc`

with the published-job path / runner as documented by the current candidate.

Do not silently substitute the published-job Store pin for the Stage-2 Store Zero pin or vice versa.

Historical candidate Store pins are listed in [`../provenance/SOURCE-PINS.md`](../provenance/SOURCE-PINS.md).

## Current candidate scope

The current candidate includes bounded software support for:

- D-001 / Board published-job evaluation;
- rectangular sheet published-job evaluation;
- canonical centered S-001 arched project;
- durable S-001 Store request/attempt/response/review/result/record custody;
- export/import/reopen history;
- stale/imported retry refusal;
- response quarantine / authority checks;
- bounded completion and closeout semantics.

These facts do not establish commissioned physical fabrication or controller-in-loop validation.

## Tests / evidence

Suites include `test:unit`, `test:browser`, `test:boundaries`, and Store-backed checks where the exact external Store checkout is required.

Current claim/proof mapping: [`../docs/project/VERIFICATION-REGISTER.md`](../docs/project/VERIFICATION-REGISTER.md).

Standing trial instruction: [`../work/capability-bridge/TRIAL-PROTOCOL.md`](../work/capability-bridge/TRIAL-PROTOCOL.md)  
Trial log: [`../work/capability-bridge/TRIAL-LOG.md`](../work/capability-bridge/TRIAL-LOG.md)

## What this application is not

- not a live commercial ordering/payment system;
- not commissioned D-001 or S-001 iron;
- not controller-in-loop validated;
- not physical execution authority;
- not authority to convert Store refusal into production approval;
- not evidence that every open PR description remains current.

**NO BLOOD ON WOOD.**
