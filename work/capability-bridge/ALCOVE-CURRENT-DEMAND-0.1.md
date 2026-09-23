# Alcove Current Demand — fail-first freeze 0.1

**Status:** workbench characterization only · current visible Alcove remains unchanged  
**Owner of this characterization:** Capability Bridge  
**Physical authority:** none  
**Store authority:** none created here  
**Promotion state:** NOT YET VISIBLE

## Trial

```
PART:
Current visible Alcove dimensional-lumber definition

CLAIM:
The current Alcove can submit complete physical finished-part demand to Store without relying on its legacy local pricing/operation assumptions.

AGAINST:
Current promoted Review Alcove + current definition contract + candidate whole-parent Store seam

OWNER:
Application / Bridge

EVIDENCE:
REFERENCE + IMPLEMENTED test characterization
```

## Exact source freeze

Human-facing source:

- repository: `GeorgePlattDemo/scan-to-build-review`
- commit: `d99285cbc4e05a3f8123301c33f66e2f184ae2e4`
- file: `system-build-base-8d8a9dd.html`

Current promoted System baseline at the start of this trial:

- repository: `GeorgePlattDemo/scan-to-build-system`
- commit: `59a9c0326c1afea7af3767e1ed89bf6465a4b809`

Candidate Store seam already proven separately:

- repository: `GeorgePlattDemo/scan-to-build-store`
- branch: `build/alcove-whole-parent-0.1`
- current characterized head: `2cb41231f7facecd3f212fb5d4efe572a96354ae`
- promoted Store main has **not** been changed by this work.

## Facts the current visible Alcove actually carries

The current page carries these project/configuration facts:

| Fact | Current value | Provenance |
| --- | ---: | --- |
| Unit height | 72 in | visible Configure default |
| Unit width | 45.5 in | visible Configure default |
| Unit depth | 14 in | visible Configure default |
| Side-member class thickness used by span derivation | 0.75 in each | visible definition |
| Interior span | 44 in | `45.5 - 0.75 - 0.75` |
| Shelf count | 5 | visible Configure default |
| Shelf elevations | 12, 24, 36, 45, 65 in | visible definition |
| Material | pine default; poplar/cherry/oak selectable | visible Configure |
| Pieces across at 14-in depth | 3 | current `ceil(depth / 5.5)` rule |
| 96-in parent count | 10 | current `ceil(piecesAcross / 2) * shelfCount` rule |
| 72-in parent count | 4 | current visible fixed material demand |
| Hardware pack | 1 | current visible material demand |
| Optional face spot | 3/16 in `SPOT_ON_LOCATION` at each shelf elevation on LEFT_UPRIGHT and RIGHT_UPRIGHT target roles | current pilot demand |

These facts may be preserved as evidence of the current definition. They do **not** turn the legacy local Store clone into authority.

## Facts the current visible Alcove does not yet carry

The current page does not identify enough finished-part geometry to submit the complete project cold to Store.

### Definition blockers

1. **Side/upright occurrence definition**
   - The page carries four 72-in parents and target-role names `LEFT_UPRIGHT` / `RIGHT_UPRIGHT`.
   - It does not identify the finished side/upright part occurrences or bind those target roles to specific identified part occurrences.
   - Pilot OFF does not need spot binding, but the project still needs identified finished side/member demand rather than anonymous parent counts.

2. **Finished shelf-member length**
   - The Store surface expressly says ordered cut length is not set on this page.
   - The 44-in interior span is real, but this characterization does not silently convert it into an ordered shelf-member cut length.

3. **Finished shelf-member width set**
   - At 14-in depth the current rule says three pieces across.
   - The page does not define the three finished widths.
   - A plausible `5.5 + 5.5 + 3.0` split is therefore **not adopted here**.

4. **Pilot target occurrence binding — pilot ON only**
   - The page defines datum-relative spot locations and target roles.
   - It does not bind each target role to an identified physical upright occurrence.

Until those facts are resolved by the owning project/class rule, Store must not guess them.

## Store-owned work that is deliberately not a definition blocker

After finished-part geometry exists, Store may own:

- offered SKU selection;
- parent-stock allocation;
- cut/mill/spot operation mapping;
- operation ordering;
- retained-control / travel evaluation;
- modeled machine time;
- machine-service economics;
- complete Store `Q`;
- fresh reconciliation for a confirmed version.

The application must not precompute these merely to make Alcove pass.

## Historical donors do not fill the gap

The preserved historical public-demo donor contains clues such as four structural sides, 72-in side stock, 96-in shelf stock, old crosscut/taper/dado descriptions, and species-based cycle minutes.

Those are donor/provenance facts only.

They do not control this current Alcove because:

- current source-map rules prohibit historical ancestors from supplying current application semantics, Store behavior, material facts, or machine capability;
- the donor corrected a 1.2-degree floor slope with a taper, while the current visible Alcove expressly records that slope without correcting it;
- the donor embeds the rejected `$35 setup + $100/hour` economics and fixed species minutes.

No donor-derived taper, dado, width split, cycle time, or price is adopted by this characterization.

## Expected fail-first result

```
RESULT: UNRESOLVED
SIDE: BRIDGE-GAP
AMEND: bridge
NOTE:
Current Alcove has sufficient configuration evidence to preserve the user's choices
and sufficient Store evidence to prove a reusable whole-parent face-spot seam, but
it does not yet emit identified finished side/member and shelf-member geometry.
Do not ask Store to invent that geometry. Do not restore donor economics.
```

## Acceptance for the next bridge repair

A bridge repair may proceed only when it can produce, from current project truth:

- identified finished side/upright part occurrences;
- identified finished shelf-member occurrences;
- finished length for each shelf member;
- finished width for each shelf member;
- stable pilot target occurrence binding when pilot is ON;
- no Store SKU nomination by the configurator;
- no Store price, cycle time, capability answer, or stock allocation calculated in the application.

If a required class rule is not present in current authority, the correct output remains `UNRESOLVED`.

**NO BLOOD ON WOOD.**
