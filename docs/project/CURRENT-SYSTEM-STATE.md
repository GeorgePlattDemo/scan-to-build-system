# Current System state

**Purpose:** current operational/documentary entry point. This is not a promotion event and does not replace historical proof records.  
**Documentation reconciliation baseline:** `scan-to-build-system@494c50048cf68dc32651bfd6c44ed2fb6d02410f`  
**Store source inspected with that baseline:** `scan-to-build-store@9c62d9d6f7775deef83d47196d32c9b5174a352c`  
**Checked:** 2026-09-30

## What is published

- **System is the current public application owner.**
- `.github/workflows/publish-system-build.yml` publishes `apps/stb/public-build/` from System `main` to GitHub Pages only after the pinned-Store integration job (`playhouse-candidate` in `.github/workflows/playhouse-candidate-integration.yml`) has passed for that exact commit and the public-build tests pass. A failed, skipped, cancelled or missing integration job denies publication; the gate is `.github/scripts/require-integration-proof.mjs`.
- `scan-to-build-review` is frozen history and is not touched by that publication workflow.
- The older public-build custody and reconciliation documents remain useful provenance. Their transfer/migration instructions are historical, not open work instructions.

## Current Store source

- The authoritative current Store pin is `STORE_PIN` in [`apps/stb/shared/contracts.mjs`](../../apps/stb/shared/contracts.mjs).
- At the documentation reconciliation baseline above, that pin is `9c62d9d6f7775deef83d47196d32c9b5174a352c`.
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
