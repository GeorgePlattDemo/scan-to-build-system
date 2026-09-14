# Branch / PR Genealogy

**Purpose:** make the accepted development order explicit without rewriting Git history.  
**Scope:** repository acceptance state as of 2026-09-13.  
**Rule:** historical PR descriptions remain historical evidence; accepted descendants control only where they expressly correct earlier statements.

## Accepted application baseline

Accepted source tree:

```text
1621d2ea146a248d200ecba59f4b87034a1b1cd5
```

Accepted by promotion PR #12 using a normal merge commit:

```text
97416e85b7cba3dabded6f32e419f7851514026c
```

The acceptance merge preserved exact ancestry and did not include PR #7.

The original transferred application source provenance remains `GeorgePlattDemo/grok-file@4595b4785a2686486e477ce2e70fb3f476285a8d`.

## Accepted promotion ancestry

```text
main starting baseline
f4769bbf2daaf7e719b723478b7a24f3dfa1344a
        ↓
build/app-configurator-engine-0.1
8730c801d3cd2df193d8647b3de1e78fffeea62a
        ↓
PR #6 — build/app-operational-jobs-0.1
17b950d6a4901b682ca5843e4df3e5d2af2985be
        ↓
PR #8 — build/app-durable-jobs-0.1
62bf1ab1caf975ef7ca8cdc6d35c03d81bb08e79
        ↓
PR #9 — build/s001-canonical-configurator-0.1
1fe12d6e564045e6136750906b4e2206cf2e3898
        ↓
PR #10 — build/global-completion-path-0.1
b0caba518aa0e152fa107fe89267ab48ee81296f
        ↓
PR #11 — docs/baseline-reconciliation-0.1
1621d2ea146a248d200ecba59f4b87034a1b1cd5
        ↓
PR #12 — promote/current-baseline-0.1 → main
normal merge acceptance event 97416e85...
```

PRs #6, #8, #9, #10, and #11 are accepted ancestry and historical proof. They are not independent current application candidates after promotion.

## Ancestry interpretation

### PR #6 — operational published jobs

Introduced the bounded published-job path and a then-current combined Store candidate pin `096e99d645d745b1670185f46c75de75f9e59661`.

Current role: **ACCEPTED ANCESTRY**.

### PR #8 — durable-jobs preparation

Added bounded evidence/economics projection, provisional material handling, and the first canonical S-001 project description.

Current role: **ACCEPTED ANCESTRY WITH SUPERSEDED STATEMENT**.

Important historical correction:

- PR #8 described canonical parent-sheet margins as `6 in` left/right and `30 in` top/bottom.
- That orientation/margin statement is no longer current.

Do not edit PR #8 to erase the historical record. The later centered-field implementation/proof controls current truth.

### PR #9 — canonical S-001 configurator and exact Store proof

Established the centered `48 × 36 in` Store-owned work field on the `96 × 48 in` parent and proved the exact Store-backed result at `4402abeb6b0299a5b6db2eec85ed04c3b0236bcc`.

Current role: **ACCEPTED ANCESTRY / CURRENT-TRUTH CORRECTION**.

Current geometry:

- parent-sheet reserved margins: `24 in` left/right, `6 in` top/bottom;
- opening margins within work field: `6 in` left/right, `0 in` top/bottom.

### PR #10 — global completion path and durable S-001 custody

Carries the accepted software truth for completion, authority, labels, closeout, S-001 durable custody, response hardening, stale/imported retry refusal, and post-polish exact Store regression.

Current role: **ACCEPTED ANCESTRY**.

Latest code proof pin recorded in PR #10: `dee4a307cf0866ac0985da92dfb5f74045ee90f9`.

Branch head after documentation-only trial-log/status update: `b0caba518aa0e152fa107fe89267ab48ee81296f`.

### PR #11 — project-order reconciliation

Documentation-only reconciliation source accepted by PR #12.

Current role: **ACCEPTED SOURCE-TREE HEAD / HISTORICAL PR RECORD**.

## Parallel candidate

### PR #7 — machine controller simulation / fail-closed safety kernel

```text
base: build/app-operational-jobs-0.1 @ 17b950d6a4901b682ca5843e4df3e5d2af2985be
head: build/machine-controller-sim-safety-0.1 @ b23b2a95f71c89347bdf5c465369b7399b75e834
```

Current role: **PARALLEL CANDIDATE — OPEN / UNCHANGED**.

It is intentionally not part of the accepted application ancestry. It does not establish controller-in-loop validation, physical commissioning, or physical execution authority.

## Superseded work

### PR #4 — Mode-2 sheet capability through Store Zero

```text
historical base: main @ f4769bbf2daaf7e719b723478b7a24f3dfa1344a
head: build/sheet-mode2-storezero-0.1 @ 0fc232e30843a67ed47c64c7a232c9980ff11e54
```

Current role: **SUPERSEDED / REFERENCE HISTORY**.

Its sheet path and Store pin are useful provenance but do not describe the accepted canonical S-001 path.

## Historical / do not build from

### PR #5 — recovery recombination trial

Closed without merge after demonstrating that automatic history recombination was not safe.

Current role: **HISTORICAL / DO NOT BUILD FROM**.

Earlier public demos, donor repositories, and historical branches remain source evidence only unless separately admitted and pinned by current repository documents.

## Promotion discipline

Do not collapse these categories:

- **ACCEPTED / MERGED** — repository source tree actually admitted into `main` by an explicit acceptance event.
- **ACCEPTED ANCESTRY** — earlier PR/branch state preserved inside that accepted history.
- **PARALLEL CANDIDATE** — intentionally separate work requiring its own integration decision.
- **SUPERSEDED** — later accepted work contains or corrects its relevant current truth.
- **HISTORICAL / DO NOT BUILD FROM** — preserved evidence that must not guide implementation.

Green tests do not change a category by themselves. Promotion remains an explicit repository decision.

**NO BLOOD ON WOOD.**
