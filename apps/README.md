# Application

`apps/stb/` contains the transferred application lineage plus the later development accepted into the current system baseline.

Do not use one SHA to describe both provenance and the accepted system state.

## Accepted transferred lineage

**Source:** `GeorgePlattDemo/grok-file` `build/app-foundation-0.1`  
**Source pin:** `4595b4785a2686486e477ce2e70fb3f476285a8d`  
**Repository admission:** merged PR #3  
**Disposition:** transferred application provenance

That pin remains provenance for the application originally copied into this repository. It is not the identity of the later promoted system baseline.

## Accepted system lineage

**Accepted source tree:** `1621d2ea146a248d200ecba59f4b87034a1b1cd5`  
**Promotion PR:** #12  
**Acceptance merge event:** `97416e85b7cba3dabded6f32e419f7851514026c`  
**Latest fully checked code ancestor recorded before promotion:** `dee4a307cf0866ac0985da92dfb5f74045ee90f9`

PR #10 and its ancestors are accepted ancestry, not a competing current candidate. PR #7 remains a separate parallel machine-safety/controller-simulation candidate.

See [`../STB-CURRENT-BASELINE.md`](../STB-CURRENT-BASELINE.md) before changing the app.

## Launch

```text
cd apps/stb
npm ci --no-audit --no-fund
npx playwright install chromium
npm start
```

Fixed accepted-app origin: `http://localhost:4317/`

Public working evaluation: `https://georgeplattdemo.github.io/scan-to-build-review/working-app.html`

The public page is an evaluation surface. The fixed local origin above is the accepted application runtime.

## Store paths

Store identity is path-specific.

### Transferred Stage-2 Store Zero path

```text
STB_STORE_ZERO_ROOT=<clean scan-to-build-store at c51f5f27af9a77bc7581c5d42c56f0a1ed0b650a> npm start
```

### Accepted published-job / canonical S-001 proof path

Use a clean exact Store checkout at:

`4402abeb6b0299a5b6db2eec85ed04c3b0236bcc`

with the published-job path / runner carried by the accepted application ancestry.

Do not silently substitute the published-job Store pin for the Stage-2 Store Zero pin or vice versa.

Historical Store pins are listed in [`../provenance/SOURCE-PINS.md`](../provenance/SOURCE-PINS.md).

## Accepted bounded software scope

The accepted application includes bounded software support for:

- D-001 / Board published-job evaluation;
- a separate `USER_DEFINED_BOARD_V1` Store request carrying an already-defined Board workpiece plus explicit operation semantics, raw-stock lineage, resolved saw/drill demand, and named unresolved conditions into the pinned Store integration without converting unresolved spots into holes;
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
- not evidence that every historical PR description remains current.

**NO BLOOD ON WOOD.**
