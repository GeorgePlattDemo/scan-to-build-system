# Canonical Operational Definitions

**Status:** current shared operational semantic authority.  
**Owner:** `GeorgePlattDemo/scan-to-build-system`.  
**Scope:** job/project meaning, application records, shared application ↔ Store interface terms, and executable definition contracts.

System owns what an identified job means. This does **not** make System the owner of Store facts, Store capability, Store economics, research conclusions, experimental machine results, or physical execution authority.

## Canonical sources

The operational definition layer already exists beneath the application:

1. [`apps/stb/shared/contracts.mjs`](../../apps/stb/shared/contracts.mjs) — durable application, project, Store-interface, review, record, and archive identifiers.
2. [`apps/stb/shared/definition-contract.mjs`](../../apps/stb/shared/definition-contract.mjs) — closed responsibility status / owner / boundary vocabulary and readiness evaluation.
3. The identified rule modules under [`apps/stb/shared/`](../../apps/stb/shared/) — project/class rules and bounded definition semantics.
4. [`docs/application/SEMANTIC-GUARDRAILS.md`](../application/SEMANTIC-GUARDRAILS.md) — human-readable distinctions that current application work must preserve.

This page is the ownership and navigation authority for shared operational definitions. The executable sources above describe current runtime behavior. If prose and executable behavior disagree, the mismatch is a System defect to reconcile deliberately; neither a Program document nor a Store-local definition silently rewrites System behavior.

## Ownership rule

- **System** owns shared operational definitions and semantic boundaries required to identify a job and carry it through the application / Store interface.
- **Store** may define narrower Store-local vocabulary and owns its catalog, stock, admitted capability, modeled work/time, economics, and answers. Store-local language must not redefine the shared job meaning.
- **3D Solutions Program** owns research, experiments, evidence, machine-development questions/findings, reviewed decisions/adoption records, partnership/economic/business work, and migration/retirement records. Program may propose a semantic change; adoption into operational meaning requires a deliberate System change.
- Historical Governed Reference and Grok material remain provenance unless a current owner deliberately admits a specific item.

## Protected distinctions

Current System behavior must preserve at least these distinctions:

- candidate definition ≠ WorkPacket;
- Store `SUPPORTABLE` ≠ fabrication authorization;
- Store evaluation ≠ commercial assent;
- `DefinitionReviewRecorded` ≠ purchase/payment/reservation/production authority;
- `UnresolvedDefinitionAcknowledged` ≠ support or resolution;
- `BudgetaryEstimate` / Q ≠ automatically a binding commercial quote;
- fixture stock ≠ live inventory;
- modeled cycle time ≠ measured production time;
- current/applicable ≠ automatically live/fresh;
- simulation ≠ physical execution;
- network presence ≠ permission for Cycle Start.

## Durable identifiers

Current wire names, enums, record types, selectors, and durable identifiers are compatibility surfaces. Do not rename them casually for prose improvement.

Where ordinary English is broader than the executable meaning, preserve the identifier and document the narrower scope.

## Adoption path

A research or machine-development proposal does not become operational capability by documentation alone.

**proposal / research → evidence → reviewed decision → versioned Store capability where applicable → tested System adoption**

The owning repository must change deliberately at each boundary. A new Program finding cannot silently widen a Store envelope, and a Store capability change cannot silently rewrite a System project definition.

## Donor vocabulary

Grok, Governed Reference, Review-era material, transfer staging, and other donor sources remain provenance.

Do not revive donor wording as current operational authority merely because it is older, more detailed, or still recoverable.
