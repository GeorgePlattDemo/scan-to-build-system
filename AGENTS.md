# Agent instructions — scan-to-build-system

You are working in `GeorgePlattDemo/scan-to-build-system`.

Read [`START-HERE.md`](START-HERE.md) first. Then the capability-bridge bench. Then the trial protocol.

## Ownership

- System: application source, operational job meaning, application behavior, application tests, release composition.
- Store (`scan-to-build-store`): catalog, machine envelope, material resolution, modeled time, economics.
- Program (`3d-solutions-program`): research, experimental machine development, decisions, business planning.
- Review (`scan-to-build-review`): frozen public demonstration. Read only. No agent writes to it.
- Live Store is the System pin (`STORE_PIN` in `apps/stb/shared/contracts.mjs`); Review is historical. Never run a second hosted Store for Review.

## Protected path: System → Railway → Store — do not touch

The live app reaches the hosted Store on Railway at one pinned Store version. That path works. **Do not change it, "tidy" it, upgrade it, or re-point it — not as part of any other task, and not because a newer Store commit exists.** Only the owner changes it, deliberately, in a change that does nothing else.

Hands off, unless the owner has asked for exactly this change:

- `STORE_PIN` in `apps/stb/shared/contracts.mjs` (currently `fc3f555b8f1f329bcf2dd81fa26995230d12a527`)
- `apps/stb/public-build/stb-store-runtime.json` — the Railway `jobEndpoint` and `storePin`
- the Store `ref:` in `.github/workflows/d001-travel-integration.yml`
- `Dockerfile.store-zero` and the `start:hosted-store` script it runs
- any Railway service, environment variable, or deployment setting

A new commit on Store `main` does **not** mean the pin should move. README and documentation changes never touch these files. If a task seems to require touching them, stop and ask.

## Rules

- Definitions: every shared term is defined once, in [`docs/definitions/README.md`](docs/definitions/README.md). Add or change a term there, not in another file. Identifiers in code are compatibility surfaces; do not rename them for nicer prose.
- This repository is the working surface. Other repos are pins and donors.
- Current names only: User 1, Store 1, Machine Build *n* written in full, Board, alcove class, fixture, pin.
- Review-era exhibit names do not belong in current files.
- Language gate: owning layer + evidence class + no authority smuggled across a wall.
- New part against the app = trial protocol + one log row. Assign `APP-CONSTRAINT`, `PART-DEFECT`, `BRIDGE-GAP`, `STORE-PIN`, or `SAFETY`.
- One-place rule: **OPEN SYSTEM BUILD** (the README's ▶ OPEN THE APP button) is the one place to check the app. It shows `apps/stb/public-build/` from System `main`, published automatically after its tests pass. Make every user-facing change in System and check it there. Never make a change in one place and check it somewhere else. A user-facing change is not complete until it is visible through that button.
- Frozen Review rule: `GeorgePlattDemo/scan-to-build-review` is the frozen earlier demonstration. Do not modify it.
- Do not emit G-code, remote Cycle Start, or physical-fabrication claims from software results.
- Do not create extra repositories or extra app folders to “try something.”
- Patent steps: open `work/capability-bridge/PATENTS.md` and the issued PDFs. Summaries lose.
- Pins and checkpoints are tags, not branches. One branch per task; delete it after merge.

## Trail rules

Every project tile on the Shared Home follows one protocol. The machine-readable half is `apps/stb/public-build/stb-trail-contract.js`; the check is `apps/stb/test/trail/trail-rules.test.mjs` (the trail scoreboard).

1. One trail, same steps, same order: **Your idea → The bench → The Store answers → Your call → We cut it → Pick up & build.** Step 1 may span as many pages as capture needs (scan, photos, plans); the nav stays on step 1 throughout.
2. The top nav appears only inside a live project: "← Project Library" plus the current tile's six steps. Landing, the three doors and the Shared Home show no step nav. Every step opens this tile's own page for that step. Never another tile's page, never a button that does nothing.
3. A step you cannot use yet is shown inert (disabled), never a silent no-op.
4. "The Store answers" is always a fresh answer from the live hosted Store for the current definition. No cached answer, no browser copy of Store logic. A changed definition is asked again.
5. Within the envelope: priced → your call → paid (simulated) → cut → pick up and record. Past the envelope: the Store refuses, steps 4–6 stay inert, and the refusal is the result. Both are passes.
6. One commercial terms flow for every tile: offer, accept, pay, allocate, release, cut, stage, ready, custody. Alcove is the reference wording and order.
7. Layout may vary; rules may not. No tile is excepted. Window Seat (Space utilization) is the one fully worked example: it may show every detail in one scroll, but taken to the bench it runs the same six steps against the same live Store.
8. Adding a tile means declaring it in the trail contract. Nothing else.
9. The guest is the user. No demo-account names on project pages.

The scoreboard is a ratchet: known violations are listed and may not grow; a fixed tile must be removed from the known list so it stays fixed.

## Preferred write targets

- Bench text: `work/capability-bridge/`
- App code: `apps/stb/` only after a trial row says `AMEND: app`
- Physical program: Program repository, `research/machine-development/`
- Provenance: `provenance/`

If a file is missing, say so. Do not invent a second baseline.
