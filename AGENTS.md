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

The live app reaches the hosted Store on Railway at one pinned Store version. Railway rebuilds from System `main` (`Dockerfile.store-zero`), and at startup fetches exactly the Store commit in `STORE_PIN`; its deploy log names it. That path works. **Do not change it, "tidy" it, upgrade it, or re-point it — not as part of any other task, and not because a newer Store commit exists.** Only the owner changes it, deliberately, in a change that does nothing else.

Hands off, unless the owner has asked for exactly this change:

- `STORE_PIN` in `apps/stb/shared/contracts.mjs` (currently `9c62d9d6f7775deef83d47196d32c9b5174a352c`)
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

1. **Idea is the intake, before the steps, not a step.** Photos, builder’s diagrams, cut lists, sketches, previous work, and any later intake all land on Idea and end at Intent; they do not each become a step. **Intent is step 1 for every tile.** This job, and only this job, gets its permissible controls and requirements there so the definition can pass or fail. The bench turns those controls and revises their values; it does not make a new control. The Store answers the definition. The six steps, in order, are **Intent → The bench → The Store answers → Your call → We cut it → Pick up & build.**
2. The top nav appears only inside a live project. The tile name and "← Project Library" come first. On Idea, no numbered step is current and no step bar is shown. From Intent onward, Idea appears only as an unnumbered back control followed by the six ordered steps, with exactly one current numbered step. One nav line is authoritative: no second step bar or "STEP n OF 6 · page n of 7" line on the page. Every enabled control opens this tile's own page for that state; never another tile's page and never a button that does nothing.
3. A step you cannot use yet is shown inert (disabled), never a silent no-op.
4. "The Store answers" is always a fresh answer from the live hosted Store for the current definition. No cached answer, no browser copy of Store logic. A changed definition is asked again.
5. Within the envelope: priced → your call → paid (simulated) → cut → pick up and record. Past the envelope: the Store refuses, steps 4–6 stay inert, and the refusal is the result. Both are passes.
6. One post-Store terms flow for every tile: Store answer → simulated offer → accept or decline → simulated pay → allocate → release → cut → stage → ready → custody. `apps/stb/public-build/stb-terms-flow.js` owns the event meanings, order and gates. Projects may vary presentation; they may not redefine that sequence. A Store budgetary answer is not itself a quote or commercial offer.
7. Layout may vary; operational rules may not. Window Seat (Space utilization) has the one stated presentation exception: on its **Idea** line it may offer the fork **Intent | One full scroll**. That fork lives on the Idea line only. Both ways are the same job and definition and must obey the same Intent, bench, Store-answer, revision, and shared terms rules.
8. Adding a tile means declaring it in the trail contract and giving it one admission profile. Shared code does not branch on that tile. Nothing else.
9. The guest is the user. No demo-account names on project pages.

Shared behavior does not branch on tile identity. A registry may name a tile. An exception is contract data with an owner, not a branch.

The scoreboard is a ratchet: known violations are listed and may not grow; a fixed tile must be removed from the known list so it stays fixed.

Rules 1–3 and 9, and the trail-contract half of rule 8, are checked by the trail scoreboard. The admission-profile half of rule 8 is checked by apps/stb/test/trail/tile-host-admission-contract.test.mjs. The no-branch half is checked by apps/stb/test/trail/shell-tile-branches.test.mjs. Rules 4–6 are checked for every tile against the real pinned Store by `apps/stb/test/integration/trail-terms.test.mjs`. Rule 6's one post-Store terms flow is `apps/stb/public-build/stb-terms-flow.js`: every tile uses it; none keeps its own commerce state machine.

## Preferred write targets

- Bench text: `work/capability-bridge/`
- App code: `apps/stb/` only after a trial row says `AMEND: app`
- Physical program: Program repository, `research/machine-development/`
- Provenance: `provenance/`

If a file is missing, say so. Do not invent a second baseline.
