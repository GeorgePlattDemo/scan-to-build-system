# Current System state

**Purpose:** current operational/documentary entry point. This is not a promotion event and does not replace historical proof records.  
**System main inspected:** `scan-to-build-system@be3089473f75507e75e64a1a86ba8317c75bd8a2`

**Runtime Store source inspected:** `scan-to-build-store@9c62d9d6f7775deef83d47196d32c9b5174a352c`

**Checked:** 2026-10-07 (UTC; 2026-10-06 in America/New_York)

This is a dated inspection record, not a moving main-SHA authority. It was re-inspected because the publication gate it describes changed after the previous inspection (`#191`), so the body and the stamp had drifted apart. The previous inspection was at `scan-to-build-system@1265de3de00935d821b18734f2f3492712566bc0` (checked 2026-10-05 UTC); the earlier documentation reconciliation at `scan-to-build-system@494c50048cf68dc32651bfd6c44ed2fb6d02410f` (2026-09-30) remains historical context.

## What is published

- **System is the current public application owner.**
- `.github/workflows/publish-system-build.yml` publishes `apps/stb/public-build/` from System `main` to GitHub Pages only after at least one qualifying pinned-Store integration job (`playhouse-candidate` in `.github/workflows/playhouse-candidate-integration.yml`) has passed for that exact SHA, that SHA is still the head of `main`, and the public-build tests pass. If no qualifying successful integration job exists for that SHA, publication is denied. Additional failed, skipped, cancelled, or in-progress runs for the same SHA do not block publication when another qualifying run has passed; the gate is `.github/scripts/require-integration-proof.mjs`.
- `scan-to-build-review` is frozen history and is not touched by that publication workflow.
- The older public-build custody and reconciliation documents remain useful provenance. Their transfer/migration instructions are historical, not open work instructions.

## Current public trail and recorded verification

- The five tiles are Start your own, Critical fit, Space utilization, Outdoor build, and Playhouse arched window. Their six steps are **Intent → The bench → The Store answers → Your call → We cut it → Pick up & build**. Idea is unnumbered intake, not a step.
- The trail contract declares two presentation exceptions, with no operational rule exemptions: Window Seat may offer **Intent | One full scroll** on its Idea line; Start your own opens on **Intent**, with Idea one back control away.
- The verification register contains separately scoped current public-build rows. Historical proof identities remain historical; their pins are not rewritten to the current runtime pin.
- At the inspected System main, the recorded [App baseline](https://github.com/GeorgePlattDemo/scan-to-build-system/actions/runs/37549672937), [D-001 Travel Integration](https://github.com/GeorgePlattDemo/scan-to-build-system/actions/runs/37549673033), [Playhouse candidate Store integration](https://github.com/GeorgePlattDemo/scan-to-build-system/actions/runs/37549673047) (including five-tile suites), and [Publish OPEN SYSTEM BUILD](https://github.com/GeorgePlattDemo/scan-to-build-system/actions/runs/37550152671) runs completed successfully. The byte-for-byte comparison of the published site against main, made at the previous inspection, was not repeated in this pass. These observations establish recorded CI/publication state, not a new interactive five-tile or physical-production proof.

## Since the previous inspection

What a visitor to Start your own (Job 1) will now notice:

- **The wood is stated on Intent.** The handoff frame reads “2×4 SPF” from the start; ITEM LOOKUP can state treated SYP. The bench has no wood chooser; it carries the stated wood (`#194`).
- **ADD opens the full list.** On Intent, ADD shows one display-only list of everything a job could ask for — operations, trim profiles, drafting tools, special order, and what the yard sets for itself. Every box is disabled; only the wood and Job 1's three tools are ticked. A typed tool is still added as before (`#195`).
- **The Dev/Rev rails are short.** Every rail is now a bold header and plain lines (`#193`).

Copy and documentation followed in `#196`–`#199`. None of this moves the Store pin, adds a Store call before confirm, or changes what the Store answers.

## Current Store source

- The authoritative current Store pin is `STORE_PIN` in [`apps/stb/shared/contracts.mjs`](../../apps/stb/shared/contracts.mjs).
- At the inspected System main above, that pin is `9c62d9d6f7775deef83d47196d32c9b5174a352c`.
- Historical evidence keeps the exact Store pin on which that evidence was proved. Do not rewrite an old proof row to the current pin.
- Editing documentation does not move the Store pin, repoint Railway, or change a Store evaluator.

## What is modeled or simulated

- Store Zero is a fictional reference lumberyard with declared fixture stock, capabilities, and economics.
- Store prices shown by the reference path are budgetary estimates, not binding quotes.
- Machine time is modeled/reference time, not measured commissioned production time.
- Post-Store commercial and yard events in the public demonstration are simulated.
- No commissioned D-001 or S-001 physical production, controller-in-loop execution, physical-release authority, live payment, reservation, or binding quotation is established by the current software evidence.
- A Store `SUPPORTABLE` answer is not machine authorization or a claim that physical fabrication occurred.

## Where to inspect current claims

- **Current publication source:** [`apps/stb/public-build/`](../../apps/stb/public-build/)
- **Publication mechanism:** [`.github/workflows/publish-system-build.yml`](../../.github/workflows/publish-system-build.yml)
- **Current Store pin authority:** [`apps/stb/shared/contracts.mjs`](../../apps/stb/shared/contracts.mjs)
- **Claim-to-proof record:** [`VERIFICATION-REGISTER.md`](VERIFICATION-REGISTER.md)
- **Historical accepted baseline and promotion record:** [`../../STB-CURRENT-BASELINE.md`](../../STB-CURRENT-BASELINE.md)
- **Branch / PR ancestry:** [`BRANCH-PR-GENEALOGY.md`](BRANCH-PR-GENEALOGY.md)

## Preservation rule

Current operational facts come from their owning current source. Historical acceptance and verification records remain bound to the exact identities they originally proved. A clearer current-state account is not authorization to redesign the application, alter project truth, repin Store, change Railway, change Store economics or capability, or rewrite historical evidence.

**NO BLOOD ON WOOD.**
