# Agent instructions — scan-to-build-system

You are working in `GeorgePlattDemo/scan-to-build-system`.

Read [`START-HERE.md`](START-HERE.md) first. Then the capability-bridge bench. Then the trial protocol.

## Rules

## Ownership

- System: application source, operational job meaning, application behavior, application tests, release composition.
- Store (`scan-to-build-store`): catalog, machine envelope, material resolution, modeled time, economics.
- Program (`3d-solutions-program`): research, experimental machine development, decisions, business planning.
- Review (`scan-to-build-review`): frozen public demonstration. Read only. No agent writes to it.

- This repository is the working surface. Other repos are pins and donors.
- Current names only: User 1, Store 1, Machine Build *n* written in full, Board, alcove class, fixture, pin.
- Review-era exhibit names do not belong in current files.
- Language gate: owning layer + evidence class + no authority smuggled across a wall.
- New part against the app = trial protocol + one log row. Assign `APP-CONSTRAINT`, `PART-DEFECT`, `BRIDGE-GAP`, `STORE-PIN`, or `SAFETY`.
- Frozen Review rule: `GeorgePlattDemo/scan-to-build-review` is the preserved public demonstration and is frozen. Do not modify it. **OPEN SYSTEM BUILD** shows that frozen demonstration, not current System work. A user-facing change is made and verified in System (its tests and the local app). Until a publication route is separately decided, report such changes as `NOT YET PUBLIC`.
- Do not emit G-code, remote Cycle Start, or physical-fabrication claims from software results.
- Do not create extra repositories or extra app folders to “try something.”
- Patent steps: open `work/capability-bridge/PATENTS.md` and the issued PDFs. Summaries lose.
- Pins and checkpoints are tags, not branches. One branch per task; delete it after merge.

## Preferred write targets

- Bench text: `work/capability-bridge/`
- App code: `apps/stb/` only after a trial row says `AMEND: app`
- Physical program: `work/machines/`
- Provenance: `provenance/`

If a file is missing, say so. Do not invent a second baseline.
