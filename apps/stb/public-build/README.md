> **CURRENT STATUS — SYSTEM PUBLICATION SOURCE.** `apps/stb/public-build/` is now the System-owned source published from System `main` by `.github/workflows/publish-system-build.yml`. `scan-to-build-review` is frozen history. The body below is preserved as the historical custody record from the original byte-for-byte import; its **Historical reconciliation plan** section is not an open instruction. See [`docs/project/CURRENT-SYSTEM-STATE.md`](../../../docs/project/CURRENT-SYSTEM-STATE.md).

# System public-build custody record

## Current publication source

This directory is the System-owned application source published from System main. [OPEN THE APP](https://georgeplattdemo.github.io/scan-to-build-system/system-build-current.html) is the current public entry. [Current System state](../../../docs/project/CURRENT-SYSTEM-STATE.md) records operation and limits.

[`SOURCE-MANIFEST.json`](SOURCE-MANIFEST.json) retains the original import identities and subsequent `systemEdits`. It is provenance for the evolving System source, not a claim that every current file still equals the original Review blob.

## Historical custody checkpoint — original Review import

At the custody checkpoint, this directory was a **byte-for-byte import** of the then-visible Scan-to-Build composition from:

`GeorgePlattDemo/scan-to-build-review@7b26dfc45c9832271840d134426e096787156a04`

It exists to solve an ownership problem before solving an architecture problem.

At the time of import, the public Review build contains application behavior that does not yet exist in the canonical System application tree. Rebuilding or simplifying that behavior during transfer would make it impossible to tell whether anything was lost.

Therefore this checkpoint follows four rules:

1. **Copy first.** Listed source files are byte-identical to the pinned Review commit.
2. **Do not redesign during custody transfer.** No project truth, Store logic, navigation, actor handoff, pricing, capability, or safety boundary is intentionally changed here.
3. **This is not a second application architecture.** `apps/stb/` remains the System application owner. This directory is the exact visible-build checkpoint that must be reconciled into that owner.
4. **Review remains untouched.** Public publication is not repointed by this import.

See `SOURCE-MANIFEST.json` for exact source blob identities.

## Historical source limitation at import

The imported Window Seat file references `elevation-windowseat.png`, but that file is absent from the pinned Review source itself. The preservation import records the absence rather than inventing a replacement.

## Historical reconciliation plan — not open work

The following plan records the import-era proposal. System now owns development and publication; Review is frozen and receives no further edits.

The import-era plan proposed that the next pass compare this checkpoint with the existing System application and classify each difference as:

- current behavior to admit into System;
- presentation-only behavior that belongs to Review;
- duplicate;
- superseded;
- historical/provenance only.

The plan proposed making the public Review surface presentation-only after reconciliation. That proposal does not override the subsequent Review freeze.

**NO BLOOD ON WOOD.**
