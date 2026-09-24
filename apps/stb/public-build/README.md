# Current visible build — exact preservation checkpoint

This directory is a **byte-for-byte import** of the current human-visible Scan-to-Build composition from:

`GeorgePlattDemo/scan-to-build-review@7b26dfc45c9832271840d134426e096787156a04`

It exists to solve an ownership problem before solving an architecture problem.

At the time of import, the public Review build contains application behavior that does not yet exist in the canonical System application tree. Rebuilding or simplifying that behavior during transfer would make it impossible to tell whether anything was lost.

Therefore this checkpoint follows four rules:

1. **Copy first.** Listed source files are byte-identical to the pinned Review commit.
2. **Do not redesign during custody transfer.** No project truth, Store logic, navigation, actor handoff, pricing, capability, or safety boundary is intentionally changed here.
3. **This is not a second application architecture.** `apps/stb/` remains the System application owner. This directory is the exact visible-build checkpoint that must be reconciled into that owner.
4. **Review remains untouched.** Public publication is not repointed by this import.

See `SOURCE-MANIFEST.json` for exact source blob identities.

## Known source limitation

The imported Window Seat file references `elevation-windowseat.png`, but that file is absent from the pinned Review source itself. The preservation import records the absence rather than inventing a replacement.

## Next reconciliation

The next pass should compare this checkpoint with the existing System application and classify each difference as:

- current behavior to admit into System;
- presentation-only behavior that belongs to Review;
- duplicate;
- superseded;
- historical/provenance only.

Only after that reconciliation should the public Review surface be made presentation-only.

**NO BLOOD ON WOOD.**
