# Integration closure and next capability milestone — 2026-09-22

Status: **UNPROMOTED CANDIDATE DOCUMENTATION**

This record closes documentation gaps for the current bounded integration candidate. It does not merge, deploy, repoint the visible application, create physical execution authority, or broaden any Store envelope.

## Exact closure baselines

| Layer | Candidate | Main at closure start | Relationship |
| --- | --- | --- | --- |
| Store | `7303793620d0ceda509810a661d11e6c31c7d59f` | `ab8a4c5d470c310f27fef82683611622ab976168` | candidate 10 commits ahead |
| System | `44969e60298ffefb5a32d068a659aa9fc293ad99` | `228e005d565ab918c5c3be52efc0bf3e99d2f5d7` | candidate 19 commits ahead |
| Review | `01df76657f878155c5a3e9d14e914001a9aa3c8c` | `740b510a9688c60e20af93179979dc83fe6b602f` | candidate 75 commits ahead |

These are candidate identities, not promotion identities.

## Active configurator / Store map

| Project | Definition owner | Applicable Store / economics authority | Bounded endpoint |
| --- | --- | --- | --- |
| Start Your Own / User 1 | hosted Start Your Own definition; 60 in workpiece remains project truth | Store candidate `730379…`; `D001-STAGE2-ENVELOPE-0.4`; pricing engine 0.2.4 | Store evaluation + partial budgetary economics; depth-defined spot unresolved |
| Window Seat 0.7.4 | Window Seat native definition / occurrence model | catalog `4402abeb…`; capability + recovery `f88ec61c…`; Stage-2 provenance `b40cdc60…` | live reference evaluation, confirmed-revision answer, retained record |
| S-001 / Playhouse | S-001 definition | published-job Store `4402abeb…`; exact generated runtime | arched-opening answer; material-only reference economics; additional work separate/unresolved |
| Outdoor | Outdoor definition | catalog `4402abeb…`; capability doctrine `f88ec61c…`; no class-scoped recovery model | capability/reference answer; economics unresolved |
| Alcove | Alcove native/frozen definition | native/frozen project reference; shared handoff may carry but not reprice | native journey and project-native reference economics |

The Store interaction convention is shared; Store authority is not universal. `USER_DEFINED_BOARD_V1` is not a universal project path.

## User 1 invariant

Retain one 60 in defined workpiece, two 16 in members, parallel face-miter ends, three modeled saw cuts at the reference nonzero angle, one centered spot per part at 8 in, a 27.625 in modeled sequence remainder, and the 24 in retained-control minimum.

A 72 in Store catalog/pricing reference is procurement evidence only. It is not project geometry and does not authorize a 72 → 60 preparation cut.

## Fixed spot status

`SPOT_ON_LOCATION/0.2` declares a 0.1875 in tool diameter and 0.1875 in full-diameter penetration below the defined entry surface. The selected tool record does not declare point angle or axial point length.

Therefore `SPOT_TOOL_POINT_GEOMETRY_REQUIRED` and `SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED` remain legitimate. Total tip penetration and complete spot economics remain unresolved.

The missing fact must come from an authorized selected-tool record or owner-approved tooling source declaring the actual point geometry. A typical bit or assumed point angle is not a substitute.

## Revision / response ordering

The currently reviewed User 1 and Window Seat reference-evaluation routes are synchronous in-browser reference evaluations. They enforce project and definition/revision identity, but they do not contain a genuine network response race.

This closure therefore proves identity mismatch detection and cross-project isolation. A delayed-old-response concurrency test belongs only at a future Store boundary that actually introduces asynchronous transport. No asynchronous machinery is to be invented merely to claim such a test.

## Closure working heads after verification hardening

These are the reviewable unpromoted **verification heads**. The System branch may contain later documentation-only record commits after its verification head; no System application code was changed in this closure pass.

- Store: `7303793620d0ceda509810a661d11e6c31c7d59f` — unchanged from the reviewed Store candidate; no closure-only Store commit was manufactured.
- System verification head: `b9ab8e38114dbdfc6ee8a733aa96881e7d14d30e` — closure documentation + `START-HERE.md` source-identity correction; no application code change.
- Review verification head: `56f9741d7d86637652344ab10f433eb77443a0df` — verification hardening only: exact-source Window Seat parity, S-001 edit/recompute coverage, cross-project isolation, pinned browser-test environment, cause-specific fault checks.

Post-closure ref verification confirmed all three `main` refs remained exactly at their starting identities: Store `ab8a4c5d470c310f27fef82683611622ab976168`, System `228e005d565ab918c5c3be52efc0bf3e99d2f5d7`, Review `740b510a9688c60e20af93179979dc83fe6b602f`. No promoted public link, deployment target, or physical authority was changed.

## Deferred Window Seat projection issue

Read-only inspection during the new edit/revision test exposed a narrow UI projection issue in frozen Window Seat `0.7.4`:

- after a revision has been confirmed and the user returns to Guided Configure;
- a consequential new edit correctly advances the underlying revision;
- the live definition and Store reference recompute;
- the prior held Store answer is correctly marked historical underneath;
- but the Guided Configure review projection is not automatically rerendered while Guided mode remains active, so the old confirmed-button projection can remain visible until that projection is explicitly refreshed.

This is **not** being patched silently in `0.7.4`. Existing preservation tests intentionally freeze the `0.7.4` artifact and its cache identity. If corrected, it should be an explicit Window Seat `0.7.5` change with:

1. a single local projection-refresh correction;
2. a new artifact/cache identity;
3. the relevant preservation locks intentionally advanced;
4. a browser test covering confirm → return to Configure → edit → reconfirm;
5. no Store model, project geometry, actor order, or authority change.

The current closure tests therefore exercise supported pre-confirm edits/recompute/confirmation without mutating frozen `0.7.4`.

## 72-inch regression audit

The closure pass rechecked the old 72-inch regression explicitly.

Current project-boundary result:

- the hosted Start Your Own artifact `three-frames.html` contains no 72-inch User 1 project value;
- the visible System shell contains no 72-inch User 1 workpiece value;
- System independent acceptance requires `definedWorkpieceLengthIn === 60`;
- the same acceptance requires `rawStockLengthIn === undefined`;
- the same acceptance requires `preparation === undefined`;
- therefore the current User 1 definition does not contain a 72 → 60 preparation operation.

Remaining 72-inch references are not all defects:

1. Store catalog rows may legitimately contain 72-inch stock as procurement evidence.
2. The D-001 Stage-2 fixture still declares a 72-inch base/station geometry and expressly states that this is not required stock length or project workpiece length.
3. The generated full Store browser bundle still carries older helper/reference functions such as `estimateCut001` that use a 72-inch Store SKU with a 60-inch kept length. That helper is not the hosted User 1 project definition path.

Do not delete catalog/fixture facts merely to remove the number 72. If the older `estimateCut001` helper is to be retired, do that as a separate Store cleanup only after proving no surviving proof, generator, or regression fixture depends on it. The current closure does not rewrite the generated Store source merely for cosmetic removal.

## Verification evidence and limit

The closure pass directly verified:

- all modified Review JavaScript test files parse successfully;
- the Review acceptance workflow retains the intended branch trigger, both acceptance/fault jobs, exact Node `22.23.2`, Playwright `1.63.0`, the clean unmodified control run, cross-project browser isolation, and cause-specific injected-fault markers;
- Store, System, and Review `main` remained exactly at their starting commit identities;
- the Store repair branch remained exactly at `7303793620d0ceda509810a661d11e6c31c7d59f`.

The available repository connector does not expose push-triggered GitHub Actions runs, and no PR was created solely to manufacture a retrievable run. Therefore these static/direct checks are not to be described as a retrieved green CI run. Promotion remains contingent on reviewing the actual branch Actions result or running the equivalent acceptance suite in an environment that can execute it.

## Promotion checklist — not executed here

1. **Store:** integrate the reviewed Store candidate and record the resulting Store commit.
2. **System:** repin only the paths that genuinely consume that Store identity; run exact-pinned integration/acceptance.
3. **Review:** regenerate Store browser packages from the resulting exact sources; run browser acceptance and project isolation.
4. **Primary link:** after Review is actually promoted, verify System's OPEN SYSTEM BUILD points to that exact visible Review identity.
5. Record merge method. A squash merge changes commit identity even when the tree is equivalent; downstream pins must name the resulting commit.

## Existing component inventory for cold intake

| Capability | Classification | Boundary |
| --- | --- | --- |
| Evidence custody | **REUSABLE** | Preserve source separately from observations; extend formats without promoting source content to fabrication truth. |
| Observations | **REUSABLE** | Immutable observations/corrections can carry entered or extracted facts; extend source-location metadata. |
| Candidate definitions | **REUSABLE · REQUIRES EXTENSION** | Current candidate revisions and bounded definitions are real; general multi-part work needs a reusable definition rather than a project-name branch. |
| Part occurrences | **REUSABLE · REQUIRES EXTENSION** | Stable occurrence identity exists in mature paths; general intake needs it before a project-specific page exists. |
| Derivation | **REUSABLE · REQUIRES EXTENSION** | Deterministic derivation exists for admitted classes; extend vocabularies, not a free-form guesser. |
| Definition validation | **REUSABLE · REQUIRES EXTENSION** | Existing definition contract, unresolved states, and fail-closed gates are reusable; add multi-part/operation geometry validation without relaxing them. |
| Store coordination | **REUSABLE · REQUIRES EXTENSION** | Exact-pinned adapters and class-specific authorities are reusable; dispatch by declared demand/capability, not one universal Board path. |
| Archive / owner record | **REUSABLE** | Existing revision and retained-answer custody is the spine; add source/extraction lineage without overwriting history. |
| Completion contracts | **REUSABLE LATER** | Downstream completion authority is not part of cold-intake success. |
| General PDF/plan extraction into controlling facts | **ABSENT AS GENERAL CAPABILITY** | Display/manual evidence handling does not establish trusted automatic extraction. |
| Reusable clarification controller | **PARTIAL · REQUIRES EXTENSION** | Current projects ask bounded questions; no shared missing-fact controller is yet proven for unfamiliar plans. |
| Frozen-code unfamiliar-plan acceptance | **NOT IMPLEMENTED** | This is the next proof milestone, not a current claim. |

## Next capability milestone

### 1. Reusable bounded multi-part definition
**Owner:** application domain.  
**Inputs:** evidence-linked observations, part relationships, quantities, dimensions, datums, material requirements.  
**Outputs:** versioned candidate definition with stable occurrence IDs and unresolved fields preserved.  
**Reuse:** candidate-revision, definition-contract, and existing occurrence patterns.  
**Acceptance:** two fixture projects can be represented/revised/reopened without project-name-specific code.  
**Excludes:** Store substitution, pricing, controller output, structural claims, inferred dimensions.

### 2. Explicit operation geometry and material requirements
**Owner:** definition / derivation.  
**Inputs:** occurrences, datums, features, material requirements, operation intent.  
**Outputs:** operation demands with explicit references/parameters/unresolved conditions.  
**Reuse:** existing Board, spot, miter, edge-mill, and S-001 semantics.  
**Acceptance:** incomplete operation geometry defers/refuses precisely; supported geometry travels without project-specific reinterpretation.  
**Excludes:** controller dialect, toolpaths, physical release.

### 3. Coordinated material selection and feasible sequencing
**Owner:** Store.  
**Inputs:** material + operation demand and applicable Store authority.  
**Outputs:** explicit material resolution, capability dispositions, modeled sequence/economics where authoritative, unresolved conditions otherwise.  
**Reuse:** material resolvers, Stage-2 envelope, published-job/S-001 evaluators, exact-pinned adapters.  
**Acceptance:** Store never changes finished geometry to fit stock or borrows another project's economics; one multi-part job may contain mixed dispositions.  
**Excludes:** allocation, commercial offer, payment, release, execution.

### 4. Source preservation and evidence-linked extraction
**Owner:** intake / evidence.  
**Inputs:** source bytes, page/location references, parser/extractor output, corrections.  
**Outputs:** immutable source plus attributable candidate observations with basis/status/correction lineage.  
**Reuse:** evidence custody, observations, correction history, PDF/display facilities.  
**Acceptance:** every extracted fact traces to a source location; ambiguity stays unresolved; parser replacement does not change the domain contract.  
**Excludes:** silent vision/OCR dimension authority and automatic fabrication truth.

### 5. Reusable clarification / configuration controls
**Owner:** application interaction.  
**Inputs:** validation reasons/unresolved fields and source-linked candidate facts.  
**Outputs:** user answers as observations/choices and a revised candidate definition.  
**Reuse:** bounded project controls and revision discipline.  
**Acceptance:** the same controller resolves missing facts for two different fixture projects without project-name branches.  
**Excludes:** “helpful” geometry/material/operation defaults.

### 6. Frozen-code unfamiliar-plan acceptance
**Owner:** acceptance.  
**Inputs:** an unfamiliar public plan chosen only after code freeze.  
**Outputs:** source → observations → bounded definition → clarification → Store answer → retained record, or truthful refusal/defer.  
**Reuse:** all prior milestone components.  
**Acceptance:** a plan such as a picnic table can enter cold without adding a picnic-table-specific page, adapter, price, or success branch. Any post-selection defect fix invalidates and restarts the acceptance.  
**Excludes:** commercial transaction and physical execution. Success is not required; truthful refusal is valid.

### 7. Later commercial and execution simulation
Only after frozen-code unfamiliar-plan acceptance is credible should payment/offer simulations or expanded execution simulation be considered. Those remain separate authority layers.

## Non-negotiable boundaries

No physical execution authorization; no live-machine commands; no fabricated allocation; no invented payment/acceptance; modeled ≠ measured economics; READY ≠ custody; Store support ≠ production release; refusal/defer is valid output; no project-specific workaround may be added to make the unfamiliar-plan milestone pass.

**NO BLOOD ON WOOD.**
