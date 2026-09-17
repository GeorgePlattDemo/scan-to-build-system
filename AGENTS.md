# Agent instructions — scan-to-build-system

You are working in `GeorgePlattDemo/scan-to-build-system`.

Read [`START-HERE.md`](START-HERE.md) first. Then the capability-bridge bench. Then the trial protocol.

## Rules

- This repository is the working surface. Other repos are pins and donors.
- Current names only: User 1, Store 1, Machine Build *n* written in full, Board, alcove class, fixture, pin.
- Review-era exhibit names do not belong in current files.
- Language gate: owning layer + evidence class + no authority smuggled across a wall.
- New part against the app = trial protocol + one log row. Assign `APP-CONSTRAINT`, `PART-DEFECT`, `BRIDGE-GAP`, `STORE-PIN`, or `SAFETY`.
- Do not copy the public exhibit into the app.
- Human-visible checkpoint rule: a user-facing change is not complete at a branch commit. After verification, promote the exact checked review commit to `GeorgePlattDemo/scan-to-build-review` `main` and refresh this repository's `OPEN SYSTEM BUILD` README link/cache-buster to that same review commit. If it has not been promoted and repinned, say `NOT YET VISIBLE` and do not call the UI pass complete.
- Do not emit G-code, remote Cycle Start, or physical-fabrication claims from software results.
- Do not create extra repositories or extra app folders to “try something.”
- Patent steps: open `work/capability-bridge/PATENTS.md` and the issued PDFs. Summaries lose.

## Preferred write targets

- Bench text: `work/capability-bridge/`
- App code: `apps/stb/` only after a trial row says `AMEND: app`
- Physical program: `work/machines/`
- Provenance: `provenance/`

If a file is missing, say so. Do not invent a second baseline.
