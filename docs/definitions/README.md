# Definitions and Language Discipline

Shared cross-repository definitions now live in the public Program repository:

`GeorgePlattDemo/3d-solutions-program/governance/definitions.md`

That Program page is the semantic arbiter for words shared by Program, System, and Store.

This System directory is therefore **not** a competing glossary. Keep only System-local implementation terminology, durable wire identifiers, adapters, and notes required to explain executable behavior.

## Admission rule for terminology

A local term is justified here only when at least one of these is true:

1. it is an executable System identifier or record type;
2. it is narrower than the Program term and needed to explain System behavior;
3. compatibility requires a durable identifier whose ordinary-English wording could mislead;
4. a current System test/adapter depends on the exact vocabulary.

If a term is shared across Program/System/Store, define it in Program and point to it from System.

## Protected distinctions

Current System behavior must preserve Program's semantic boundaries, including:

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

Current wire names, enums, record types, selectors, and durable identifiers should not be casually renamed for prose improvement.

Where a durable identifier has a narrower meaning than ordinary English, preserve compatibility and document the scoped meaning.

## Donor vocabulary

Grok, Governed Reference, Sarah/demo material, and other donor sources remain provenance.

Do not use donor wording to fill a current definition gap when Program already owns the shared term.
