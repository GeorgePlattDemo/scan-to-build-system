# Information Custody Boundary

**Status:** current System application custody rule.  
**Owner:** `GeorgePlattDemo/scan-to-build-system`.  
**Scope:** current project/evidence/record custody and the operational boundary any later disclosure or external-processing feature must preserve.  
**Source lineage:** current System application behavior plus still-valid Governed Reference custody/disclosure principles. Broader research, secondary-use, aggregation, participant, provider-policy, and commercial-sensitivity questions remain in `GeorgePlattDemo/3d-solutions-program/governance/information-custody-and-processing.md`.

This document does **not** add cloud custody, consent machinery, model processing, research reuse, aggregation, or a new external service.

## Current implemented custody

The current application is a local/reference application.

Current System behavior records that:

- project and evidence records are stored at the browser origin on the user's device;
- local storage is not represented as cloud synchronization or permanent hosted custody;
- original source bytes are retained where accepted by the bounded evidence path and current size limits;
- source identity, observations, corrections, project revisions, Store attempts/answers, reviews, and record history remain distinguishable;
- missing original bytes are named as missing; export does not invent them;
- archive export/import preserves history without making imported Store answers, reviews, or physical claims current;
- unknown class versions may remain inspectable while editing/derivation stays disabled;
- a content hash is content identity evidence only; it is not verification, authorship, authority, or physical truth.

The implementation details, limits, and accepted behavior remain controlled by `apps/stb/` and its tests. This document does not silently widen them.

## Source is not interpretation

What a person supplied must remain distinguishable from what the application later mapped, derived, interpreted, or corrected.

A supplied drawing, PDF, photo, measurement, takeoff, text statement, or other source does not become verified geometry or a fabrication instruction merely because it was retained or displayed.

An interpretation or inference must not silently become:

- the person's original declaration;
- a verified observation;
- a Store fact;
- a permission;
- an authorization;
- a physical result.

A correction creates a later attributable state; it does not erase the earlier source/history.

## Custody is not authority

Possessing, storing, exporting, importing, or displaying a record does not create authority that the record did not already contain.

In particular:

- owner archive ≠ production packet;
- imported historical Store answer ≠ current Store answer;
- imported review ≠ current review;
- stored source ≠ verified source;
- hash match ≠ physical correspondence;
- record custody ≠ material custody;
- project custody ≠ Store capability;
- application state ≠ machine readiness or Cycle Start.

## Disclosure boundary

This cleanup does not activate an external disclosure path.

If a later System feature intentionally sends project information outside the holder-controlled application boundary, that feature must be separately designed and tested. At minimum it must identify, before disclosure:

1. the bounded purpose;
2. the minimum information required for that purpose;
3. the intended recipient or processor;
4. the source/holder of the information;
5. the applicable permission/authority basis;
6. known retention/reuse treatment and unresolved terms.

A larger payload is not automatically a better payload.

## External processing boundary

A language model or other external processor, if later introduced, is a processor of disclosed information. It is not the source of project, Store, safety, or physical authority.

Any later external-processing implementation must preserve separate identity for:

- source evidence;
- disclosed input;
- processor output;
- derived result;
- observation;
- Store answer;
- review/decision;
- authorization.

A processor result must not silently promote itself into a stronger state.

No model/processor path may become a substitute for a non-waivable safety gate, Store-owned fact, machine readiness determination, or physical execution authority merely because it returns a confident or structured answer.

## Secondary use is not implied

Current project custody does not itself grant a separate research, training, aggregation, marketing, publication, or unrelated profiling use.

Any future secondary-use mechanism is a separate product/policy/implementation decision and must not be inferred from current project use.

Broader questions about voluntary aggregation, participant contributions, commercial sensitivity, research use, provider terms, and stewardship remain Program research/policy questions until a specific owner deliberately adopts an implementation.

## Change rule

A proposed custody/disclosure change must state:

1. what information crosses which boundary;
2. what current System record/source semantics it relies on;
3. what new persistence, disclosure, processor, or retention behavior is introduced;
4. what authority it explicitly does **not** create;
5. what negative cases prevent silent promotion or data invention;
6. what tests prove existing owner-record and evidence custody remain intact.

**NO BLOOD ON WOOD.**
