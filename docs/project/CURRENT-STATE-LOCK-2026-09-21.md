# Current-State Lock — 2026-09-21

**Purpose:** freeze the exact working identities and preservation boundaries for the Start Your Own targeted integration repair before any implementation change.

## Frozen starting identities

- System working repository: `GeorgePlattDemo/scan-to-build-system`
- System branch at start: `main`
- System starting head: `80429d6151a96e43ac588203fac1d17deb474817`
- Review human-visible repository: `GeorgePlattDemo/scan-to-build-review`
- Review promoted starting head: `fb2c1fc2667a2251cd3486949b2dfbcb10865724`
- Store Zero Stage-2 source consumed by the current user-defined Board path: `GeorgePlattDemo/scan-to-build-store@c51f5f27af9a77bc7581c5d42c56f0a1ed0b650a`
- Published-job / canonical S-001 Store proof remains separate at `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc`.

The accepted 2026-09-13 application source tree and merge event remain historical acceptance identities. They are not rewritten by this post-acceptance working-state lock.

## Protected reference paths

During this repair:

- Alcove is **PROTECTED / VERIFICATION-ONLY**.
- Window Seat is **PROTECTED / VERIFICATION-ONLY**.
- Outdoor remains its own project and is not to be reduced or replaced.
- Sheet / S-001 remains its own project and retains its path-specific Store proof identity.
- Start Your Own is the targeted repair surface.
- Shared System infrastructure may change only where a confirmed current Start Your Own/shared defect actually belongs.
- Store may change only where the confirmed remedy belongs to Store authority.
- Review may be changed only for the validated human-visible Start Your Own integration and final promotion surface; unrelated Review cleanup is out of scope.

A pre-existing issue in an unaffected project is to be reported, not opportunistically repaired. A regression caused by this repair must be backed out or repaired at the shared seam; it is not permission to rewrite Alcove or Window Seat.

## Current-state classification

### CONFIRMED CURRENT

1. The promoted Start Your Own route is host-confirmed; the child page not owning the Confirm script does **not** establish a broken handoff.
2. The current visible route carries a 60 in defined workpiece and separately maps Store procurement to current Store Zero material.
3. The 60 in internal part sequence is already checked against the 24 in retained-control rule in current software.
4. The visible Start Your Own route currently mixes two Store representations:
   - current `STBStoreHandoffContract` / Store Zero `c51f5f27...` for material and economics;
   - legacy `STBUserDefinedBoardStore` / `582afd22...` for capability/preview.
   This is a current authority split and is repairable.
5. The current user-defined Board wire carries counts and angle but drops richer operation meaning before Store evaluation, including cut-plane/presentation and the distinction between a center spot and a drilled hole.
6. The current adapter maps `drillCycles` to generic holes with a 0.75 in reference depth. The current Start Your Own definition describes a centered spot with unresolved tooling, so that conversion is not a complete physical definition.
7. Store Zero `c51f5f27...` intentionally applies `STB-STORE-ZERO-PRICE-1` / version `0.2.2` to explicit Board-sequence modeling. Its output is a Stage-2 `BudgetaryEstimate`, not a commercial quote.
8. Current System source documents disagree on the active Stage-2 Store pin: `apps/README.md` and current code use `c51f5f27...`, while `START-HERE.md`, `STB-CURRENT-BASELINE.md`, and `provenance/SOURCE-PINS.md` still describe `b40cdc60...` as current for that path.

### DISPROVED CURRENT

- “Confirm does nothing” on the exact promoted hosted route.
- “The Store is never asked” as a description of the exact promoted hosted route.
- “The 27.625 in remainder is only arithmetic with no software check” for the 60 in internal workpiece sequence.

### HISTORICAL / NON-CURRENT UNLESS EXPLICITLY CONSUMED

- Older standalone Start Your Own confirmation mechanisms.
- Legacy Store stock-selection behavior that prefers 192 in stock.
- Older Store pins and partial-economics narratives not consumed by the frozen current route.

## Evidence hierarchy for this repair

When sources disagree:

1. **What code runs:** exact current System/Review entry point, imports, event handlers, and runtime dependencies at the frozen starting identities.
2. **Store answers:** exact Store implementation and pin consumed by that route.
3. **Project meaning:** current project-specific definition/contract and controlling accepted documentation.
4. **Tests:** current governing regression tests; historical fixtures are evidence, not automatic authority.

Do not revive an older behavior merely because it is more complete or easier to understand. Do not replace a newer behavior merely because an older test expected something different.

## Change discipline

- Only CONFIRMED CURRENT defects authorize code changes.
- Prefer the smallest local edit.
- Do not reconstruct mature HTML/JS from memory or from another version.
- Do not perform unrelated cleanup, consolidation, renaming, refactoring, formatting, or modernization.
- Preserve unrelated bytes wherever practical.
- Checkpoint each logical repair separately.
- Do not merge or repoint the promoted build until the affected tests and protected-reference regressions are clean.

**NO BLOOD ON WOOD.**
