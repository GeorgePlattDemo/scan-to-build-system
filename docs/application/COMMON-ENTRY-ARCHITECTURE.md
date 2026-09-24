# Common Entry Architecture

**Status:** canonical System application architecture rule.  
**Owner:** `GeorgePlattDemo/scan-to-build-system`.  
**Source lineage:** Governed Reference `18949f163718a937f072f4be3a654bb303e53160`, `docs/architecture/common-entry-contexts.md` (STB-ENTRY-0.3.0), reconciled through Program and rehomed to System after the September 24, 2026 ownership freeze.  
**Implementation relationship:** current routes, actor/session behavior, intake modules, records, and tests remain in `apps/stb/`; this document states the architectural rule they must preserve.  
**Does not:** create new routes or enums, activate unsupported schemas/classes, change Store authority, or authorize physical work.

## Controlling idea

Scan-to-Build has **multiple legitimate starting conditions and one shared system truth model**.

A person may arrive with:

- an idea, need, or incomplete want;
- an existing home/project/record to continue;
- a job, plan, takeoff, drawing, or other professional source.

Those starts may need different orientation, vocabulary, evidence requests, permissions, and source-handling. They do **not** become separate products, ontologies, Store systems, fabrication pipelines, safety policies, or competing definitions of truth.

Current product-facing labels may differ from the historical Governed Reference labels. Historical `COLD`, `PLACE`, and `CONTRACTOR` remain provenance. Current System may present labels such as NEW USER, RETURNING USER, and PROFESSIONAL. The durable rule is the convergence, not the old enum.

## Layers that must remain distinct

1. **Common entry surface** — lets the person choose the starting condition that best matches what they have.
2. **Context-appropriate opening** — asks only the information appropriate to that start.
3. **Source/evidence custody** — preserves what the person actually supplied and its provenance.
4. **Definition path** — structures what is known, selected, derived, unresolved, or Store-owned.
5. **Store boundary** — asks Store only the bounded questions Store owns.
6. **Governed resolution** — preserves support, defer, refusal, unresolved conditions, review, and later authority boundaries.
7. **Outcome/record** — returns attributable results to the durable record.

The common entry path does not give the opening context permission to redefine later layers.

## Context is routing, not authority

Selecting an entry context does not establish:

- verification;
- material identity;
- structural adequacy;
- commercial status;
- Store support;
- machine capability;
- professional qualification;
- fabrication authorization;
- physical readiness;
- execution authority.

A context label is also not permanent personal identity. A project may move from an early/incomplete starting condition into a continuing project record without creating a second project truth.

## Preserve the original source

The first job of intake is not to reinterpret the source until it fits a known project.

The system should retain:

- what was supplied;
- who supplied it;
- source identity/version when available;
- units and declared values;
- what can be reliably established from it;
- what remains unresolved;
- later corrections separately from the original source.

A drawing, PDF, scan, photo, measurement, takeoff, or ordinary-language statement is evidence/input. None is automatically an authorized cut or verified fabrication definition.

## Different openings may ask different questions

A first-time person should not have to pretend they already possess a professional job package.

A returning holder should not have to discard existing project/record context simply to re-enter the system.

A professional may bring structured material, but professional form does not exempt that material from source, definition, Store, or authority checks.

The application should therefore avoid both errors:

- three decorative headings over the same mandatory form; and
- three separate engines that silently diverge in rules or authority.

## One convergence

All supported entry paths converge on the same broad sequence:

```
source / declared need
        ↓
evidence and observations
        ↓
bounded definition / configuration
        ↓
material and Store-owned resolution
        ↓
visible unresolved conditions / refusals
        ↓
identified review and later authority boundaries
        ↓
outcome / owner record
```

Implementation names and pages may change. The semantic order must not be silently inverted to make an unsupported job appear complete.

## Privacy and dignity

Entry is not covert lead capture.

The system should ask for the minimum information required for the present purpose and preserve the distinction between:

- what the person declared;
- what the system inferred;
- what a source established;
- what Store answered;
- what remains unresolved.

A person receiving a grounded refusal or deciding not to proceed has still completed a legitimate interaction.

## Hostile or unsuitable input

Broad intake does not mean unrestricted trust.

Imported content must not be allowed to:

- promote authority;
- execute code or machine commands;
- override Store or safety boundaries;
- erase provenance;
- silently populate missing consequential values;
- transform an unsupported project into a supported class by relabeling it.

## Change rule

New entry contexts may be added only when a real different starting condition requires them. A new label should not be created merely for marketing or navigation.

A proposed entry change must state:

1. what new information condition it handles;
2. what questions differ at the opening;
3. what source/evidence rules differ;
4. where it rejoins the common path;
5. which shared rules remain unchanged;
6. what tests prove it did not create a second truth model.

**NO BLOOD ON WOOD.**
