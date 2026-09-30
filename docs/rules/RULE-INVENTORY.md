# Shared Rule Inventory

**Status:** inventory only. Not a Rulebook, not a registry, and not a new source of runtime authority.

**System snapshot read:** `3eb137694b5ffeccfbbbd668d0d991e0421e3fcb`.

This file records shared rules that are already visible in the current System tree. Proposed IDs below are navigation labels for this inventory only. They are not canonical identifiers and do not create new rules.

Store-owned limits, prices, economics, catalog facts, and machine envelopes are intentionally not copied here.

Enforcement labels are descriptive of what was found in the current tree:

- `runtime-gated` — a current runtime path rejects or prevents the contrary state.
- `tested` — the rule is asserted by a current test, but this inventory does not claim one shared runtime gate.
- `stated` — current source wording exists, but no implementation/test is identified here.
- `gap` — the intended shared rule is visible, but a shared enforcement point was not found in this pass.

---

## PROP-TRAIL-ONE-PATH

- **Proposed ID:** `PROP-TRAIL-ONE-PATH`
- **Rule in current-source words:** “One trail, same steps, same order: **Your idea → The bench → The Store answers → Your call → We cut it → Pick up & build.**”
- **Owner:** System
- **Source file:** [`AGENTS.md`](../../AGENTS.md), Trail rule 1; same trail meaning is also stated in [`docs/definitions/README.md`](../definitions/README.md).
- **Implementation file:** [`apps/stb/public-build/stb-trail-contract.js`](../../apps/stb/public-build/stb-trail-contract.js)
- **Test file:** [`apps/stb/test/trail/trail-rules.test.mjs`](../../apps/stb/test/trail/trail-rules.test.mjs)
- **Shared or project-specific:** shared
- **Enforcement:** `tested` — the trail scoreboard checks every declared tile against the shared contract.
- **Duplicate or contradiction:** duplicate wording exists in `AGENTS.md` and System definitions; no contradiction observed in this pass.

## PROP-DEFINITION-BEFORE-STORE

- **Proposed ID:** `PROP-DEFINITION-BEFORE-STORE`
- **Rule in current-source words:** `storeSubmissionReadiness()` checks `DEFINITION` blockers first and returns `DEFINITION_BLOCKED` before a Store submission can be ready.
- **Owner:** System
- **Source file:** [`apps/stb/shared/definition-contract.mjs`](../../apps/stb/shared/definition-contract.mjs)
- **Implementation file:** [`apps/stb/shared/definition-contract.mjs`](../../apps/stb/shared/definition-contract.mjs), `storeSubmissionReadiness()`
- **Test file:** [`apps/stb/test/unit/definition-contract.test.mjs`](../../apps/stb/test/unit/definition-contract.test.mjs)
- **Shared or project-specific:** shared intent; project entry paths remain project-specific
- **Enforcement:** `gap` — the shared readiness function is defined and unit-tested, but current System code search found no runtime consumer outside that module and its unit test.
- **Duplicate or contradiction:** no contradictory shared rule observed. Runtime Store entry is presently exercised through project-specific paths rather than this shared readiness function.

## PROP-FRESH-STORE-EVALUATION

- **Proposed ID:** `PROP-FRESH-STORE-EVALUATION`
- **Rule in current-source words:** “The Store answers” is always a fresh answer from the live hosted Store for the current definition. No cached answer, no browser copy of Store logic. A changed definition is asked again.
- **Owner:** System
- **Source file:** [`AGENTS.md`](../../AGENTS.md), Trail rule 4
- **Implementation file:** [`apps/stb/public-build/stb-store-client.js`](../../apps/stb/public-build/stb-store-client.js); server/shared correlation also exists in [`apps/stb/shared/store-wire.mjs`](../../apps/stb/shared/store-wire.mjs) and [`apps/stb/server/store-adapter.mjs`](../../apps/stb/server/store-adapter.mjs).
- **Test file:** [`apps/stb/test/integration/trail-terms.test.mjs`](../../apps/stb/test/integration/trail-terms.test.mjs); Store-path checks also appear under `apps/stb/test/store/`.
- **Shared or project-specific:** shared
- **Enforcement:** `runtime-gated` — the shared browser client rejects correlation, Store-pin, or fresh-receipt mismatch instead of returning the answer as current.
- **Duplicate or contradiction:** freshness/correlation is checked at more than one System boundary; the checks observed are aligned, not contradictory.

## PROP-REFUSAL-STOPS-PROGRESSION

- **Proposed ID:** `PROP-REFUSAL-STOPS-PROGRESSION`
- **Rule in current-source words:** “Past the envelope: the Store refuses, steps 4–6 stay inert, and the refusal is the result.”
- **Owner:** System for progression; the refusal fact itself remains Store-owned
- **Source file:** [`AGENTS.md`](../../AGENTS.md), Trail rule 5
- **Implementation file:** [`apps/stb/public-build/stb-terms-flow.js`](../../apps/stb/public-build/stb-terms-flow.js), where only `SUPPORTABLE` can accept and any other Store status remains `REFUSED_BY_STORE`.
- **Test file:** [`apps/stb/test/integration/trail-terms.test.mjs`](../../apps/stb/test/integration/trail-terms.test.mjs)
- **Shared or project-specific:** shared
- **Enforcement:** `runtime-gated` — the shared terms flow cannot create an offer/acceptance from a non-`SUPPORTABLE` Store answer.
- **Duplicate or contradiction:** no contradiction observed. Project-specific refusal reasons differ, but the shared progression rule is the same.

## PROP-NO-LOCAL-STORE-ANSWER

- **Proposed ID:** `PROP-NO-LOCAL-STORE-ANSWER`
- **Rule in current-source words:** “System does not own Store facts or calculate a substitute Store answer.”
- **Owner:** System boundary rule; Store owns the answer and its facts
- **Source file:** [`README.md`](../../README.md), “The Store boundary”
- **Implementation file:** [`apps/stb/server/store-adapter.mjs`](../../apps/stb/server/store-adapter.mjs) and [`apps/stb/public-build/stb-store-client.js`](../../apps/stb/public-build/stb-store-client.js)
- **Test file:** [`apps/stb/test/store/alcove.test.mjs`](../../apps/stb/test/store/alcove.test.mjs); related Store-path tests cover other request types.
- **Shared or project-specific:** shared boundary; request shaping is project/request-type specific
- **Enforcement:** `runtime-gated` — Store evaluator failure or missing Store capability is preserved as unresolved/unavailable/refused; the adapter states that no local fallback is used.
- **Duplicate or contradiction:** the no-local-fallback rule appears in the adapter, app documentation, and build-guide text; no contradiction observed in this pass.

## PROP-SIMULATED-COMMERCE-AND-YARD

- **Proposed ID:** `PROP-SIMULATED-COMMERCE-AND-YARD`
- **Rule in current-source words:** one post-Store flow is “Store answer → simulated offer → accept or decline → simulated pay → allocate → release → cut → stage → ready → custody.” A Store budgetary answer is not itself a quote or commercial offer.
- **Owner:** System
- **Source file:** [`AGENTS.md`](../../AGENTS.md), Trail rule 6
- **Implementation file:** [`apps/stb/public-build/stb-terms-flow.js`](../../apps/stb/public-build/stb-terms-flow.js)
- **Test file:** [`apps/stb/test/integration/trail-terms.test.mjs`](../../apps/stb/test/integration/trail-terms.test.mjs)
- **Shared or project-specific:** shared
- **Enforcement:** `tested` — the integration test asserts the one thirteen-event sequence, simulated offer/payment wording, decline behavior, and handoff receipt for every tile. This row does not claim a physical commerce or yard integration exists.
- **Duplicate or contradiction:** no contradiction observed. Presentation varies by project; event meaning/order is shared.

## PROP-NO-PHYSICAL-RELEASE

- **Proposed ID:** `PROP-NO-PHYSICAL-RELEASE`
- **Rule in current-source words:** “`PHYSICAL_RELEASE_ISSUABLE` is `false`: the software cannot issue physical release.”
- **Owner:** System
- **Source file:** [`docs/definitions/README.md`](../definitions/README.md), `Boundary`
- **Implementation file:** [`apps/stb/shared/definition-contract.mjs`](../../apps/stb/shared/definition-contract.mjs), where `PHYSICAL_RELEASE_ISSUABLE = false` and `physicalReleaseReadiness()` always returns `PRODUCTION_AUTHORIZATION_NOT_ISSUABLE`.
- **Test file:** [`apps/stb/test/unit/definition-contract.test.mjs`](../../apps/stb/test/unit/definition-contract.test.mjs)
- **Shared or project-specific:** shared
- **Enforcement:** `tested` — the contract and unit tests make physical release unconditionally unavailable; current code search found no separate runtime consumer of `physicalReleaseReadiness()`.
- **Duplicate or contradiction:** aligned with `AGENTS.md` (“Do not emit G-code, remote Cycle Start, or physical-fabrication claims from software results”) and the simulated terms flow; no contradiction observed.

## PROP-OWNER-RECORD-NOT-PRODUCTION

- **Proposed ID:** `PROP-OWNER-RECORD-NOT-PRODUCTION`
- **Rule in current-source words:** “This is an owner-controlled local record, not a production packet.”
- **Owner:** System
- **Source file:** [`apps/stb/shared/contracts.mjs`](../../apps/stb/shared/contracts.mjs), `COPY.recordOwnerArchive`
- **Implementation file:** [`apps/stb/shared/archive-format.mjs`](../../apps/stb/shared/archive-format.mjs) and [`apps/stb/browser/data/archive.mjs`](../../apps/stb/browser/data/archive.mjs)
- **Test file:** [`apps/stb/test/unit/archive-format.test.mjs`](../../apps/stb/test/unit/archive-format.test.mjs)
- **Shared or project-specific:** shared
- **Enforcement:** `runtime-gated` — archive import runs the shared validator; active authorization/schema fields and forbidden execution-like top-level fields are rejected rather than promoted into current authority.
- **Duplicate or contradiction:** no contradiction observed. System definitions separately describe the owner archive as the project/revision/Store-answer/record archive, not physical outcome proof.

---

## Inventory boundary

This pass does not decide which proposed IDs should survive, does not turn repeated wording into a Rulebook, and does not create a machine-readable rule registry.

Project-specific gaps can be reviewed after this inventory is read cold. They are not filled here.