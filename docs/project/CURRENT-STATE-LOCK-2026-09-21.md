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


## Post-repair outcome

The sections above remain the frozen **before-state** for this repair. They are not rewritten retroactively.

Current repaired working truth:

- Store Zero Stage-2 authority for `USER_DEFINED_BOARD_V1`: `GeorgePlattDemo/scan-to-build-store@ab8a4c5d470c310f27fef82683611622ab976168`.
- D-001 Stage-2 envelope: `D001-STAGE2-ENVELOPE-0.3`.
- Store pricing engine: `STB-STORE-ZERO-PRICE-1 / 0.2.3`.
- User 1 project truth begins with one **60 in defined workpiece**. A returned 72 in Store SKU may be a material/pricing reference; it does not redefine the project and does not create an automatic 72→60 preparation cut.
- The defined User 1 production sequence remains three saw cuts: establish the 30° face-miter datum, cut part 1, cut part 2. With 0.125 in kerf the final retained remainder is 27.625 in, leaving 3.625 in above the 24 in retained-control minimum.
- D-001 declares a downstroke, single-plane face-miter envelope from 0° through 45° inclusive. 30° and 45° are SUPPORTABLE when the rest of the demand fits; 46° is REFUSED by Store. The application does not own that machine limit.
- The center mark is `SPOT_ON_LOCATION` using the declared fixed 3/16 in spot/pilot operation. It is not silently converted to a generic finished hole and does not require invented drill depth.
- `UNRESOLVED` is reserved for genuinely missing facts needed to evaluate the demand. A defined demand inside the declared machine/cell envelope returns SUPPORTABLE; a defined demand outside it returns REFUSED.
- SUPPORTABLE remains a Store/capability answer only. The machine is not commissioned here, physical execution remains unauthorized, and Cycle Start remains false.

Protected paths remain unchanged in meaning: Alcove and Window Seat are verification-only, Outdoor remains separate, and S-001 retains its own Store identity.

**NO BLOOD ON WOOD.**


## 2026-09-22 dimensional travel-standard checkpoint

This section is a later checkpoint. It does not rewrite the frozen 2026-09-21 before-state above.

### Exact Store authority for this candidate

- Store repository: `GeorgePlattDemo/scan-to-build-store`
- Store branch used to develop the repair: `build/d001-travel-standard-0.1`
- Exact tested Store SHA: `f8373520a726090ed91eff82e5e720f4a9634615`
- Acceptance workflow run: `35752240345` — **SUCCESS**
- Governing document: `DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md`
- Governing evaluator: `evaluateDimensionalTravelJob()`
- Pricing engine identity: `STB-STORE-ZERO-PRICE-1 / 0.3.0`
- Travel model: `STB-D001-DIMENSIONAL-TRAVEL-0.1 / 0.1.0`

### User 1 acceptance fixture

The first Start Your Own proof is one 60 in defined SPF 2x4 workpiece with:
- two 16 in identified parts;
- 30° single-plane face-miter condition;
- three derived saw operations: one Datum-C reference cut plus two part cutoffs;
- two identified 3/16 `SPOT_ON_LOCATION` features at part-relative X = 8.000 in, centered on the wide face;
- 27.625 in final retained remainder;
- no unresolved Store facts for the accepted fixture.

On the exact Store SHA above, the governing evaluator returns:
- Store material reference: `STB-ZERO-SPF-2X4-72-001`;
- material: **$3.13**;
- modeled D-001 occupied time: **1.4128 min**;
- modeled machine service: **$5.89**;
- Stage-2 budgetary `Q`: **$9.02**;
- calculation input hash: `caa7c91f1296c243a5abb05ed35a0c55b5b1f5d4dab32efd64cd2656d75f3036`;
- calculation result hash: `15a8835dd50771136020190db7f5dbed1bd35b78930bf338be63bea8427353c2`.

These economics are **DECLARED_STAGE2_MODEL**, measured=false, commissioned=false. They are an explicit modeled Store Zero scenario, not measured commercial machine economics.

### Governing application rule

For this candidate:

1. Project/configurator owns the identified part definition and part-relative feature coordinates.
2. System transports that demand to Store.
3. System does **not** calculate machine motion, cycle time, Store rate, refusal, stock selection, machine service, or Q.
4. Store returns the complete dimensional answer and calculation identity.
5. Confirmation performs a second Store evaluation using the same request payload/evaluator.
6. PASS A and PASS B must return the same input and result hashes for unchanged governing inputs.
7. Any mismatch fails closed as `STORE_CALCULATION_DIVERGENCE`.
8. Missing Store-owned authority is never replaced by a UI fallback, assistant guess, project-specific formula, or weakened test.

### Migration boundary

User 1 is the first complete dimensional project under this standard.

Alcove, Window Seat, Picnic, and other dimensional project wrappers do **not** inherit User 1's geometry or economics by name. Each must emit its own identified physical demand through the same governing Store evaluator before it can regain a complete dimensional Q.

Material/capability facts may remain preserved during migration. A material-only subtotal is not a complete Q.

**No shortcuts. No surrogate Store. No second pricing engine.**
