# Trial Protocol

**Status:** current standing instruction  
**Use:** every time a new part, offering, class, or machine model is tried against the accepted application

This is the pre-instruction. Do not re-argue it in chat. Follow it, then write one row in [`TRIAL-LOG.md`](TRIAL-LOG.md).

This is ordinary gated integration: name the claim, run the existing product, assign the failure to a side. It is not a personality test and not permission to widen the envelope so a demo can pass.

## Before the trial

State all of the following in one block:

```text
PART:     <what is being tried>
CLAIM:    <one sentence of expected behavior>
AGAINST:  accepted system baseline in STB-CURRENT-BASELINE.md + current capability-bridge files
OWNER:    Application | Store | Governed | Machine | Research
EVIDENCE: IMPLEMENTED | REFERENCE | DOCUMENTED | PLANNED | NOT CLAIMED
```

The accepted application source tree is recorded in [`../../STB-CURRENT-BASELINE.md`](../../STB-CURRENT-BASELINE.md). The older `GeorgePlattDemo/grok-file@4595b478...` identity is transferred-app provenance, not the current accepted system identity.

If the claim needs a patent relationship, open [`PATENTS.md`](PATENTS.md) first.

## Run

1. Keep the accepted Board vertical intact. Do not edit it to make the new part look better.
2. Put the new part through the same path a user would use: enter → define → Store question → review → result.
3. Also run the automated suites that already exist from `apps/stb/`:
   - `npm run test:unit`
   - `npm run test:browser`
   - `npm run test:boundaries`
   - Store-backed suites only when the exact clean Store checkout required by that path is mounted. Current exact identities are maintained in [`../../provenance/SOURCE-PINS.md`](../../provenance/SOURCE-PINS.md); do not treat the Stage-2 Store Zero pin and the published-job/S-001 proof pin as interchangeable.
4. A refuse can be a pass. If the claim was “this must stop,” and it stopped, that is success.

## Report

```text
RESULT:   PASS | FAIL | UNRESOLVED
SIDE:     APP-CONSTRAINT | PART-DEFECT | BRIDGE-GAP | STORE-PIN | SAFETY
AMEND:    none | app | part | bridge | store surface | stop
NOTE:     <one factual sentence>
```

### Side meanings

| Side | Meaning |
| --- | --- |
| `APP-CONSTRAINT` | The app refused or limited the part under a current rule. The rule may be correct. Amend the app only if the constraint is wrong for the current architecture. |
| `PART-DEFECT` | The new model, offering, class, or instruction packet is wrong or incomplete. |
| `BRIDGE-GAP` | App and part both look locally consistent, but the connecting surface (neutral ops, Store publication, evidence class) is missing. |
| `STORE-PIN` | Failure is the required Store fixture or pin checkout, not the app and not the new part. |
| `SAFETY` | Stop. Do not amend to proceed. **NO BLOOD ON WOOD.** |

## What must not happen

- Silent envelope widening so the trial “works.”
- Treating `SUPPORTABLE` as a cut, review as an order, or simulation as fabrication.
- Amending both sides in the same pass “to be safe.”
- Logging a pass without saying which claim passed.

## After the trial

Append one row to [`TRIAL-LOG.md`](TRIAL-LOG.md).
Change only the owning file named in `AMEND`.
If `AMEND` is `none`, leave the app alone.
