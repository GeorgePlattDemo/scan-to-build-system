# Definitions and Language Discipline

This directory is the future home of current Scan-to-Build definitions.

It is intentionally small at foundation time. The project recently completed substantial application-language reconciliation. This repository should preserve that cleanup rather than reconstruct an older vocabulary from demonstrations or prototypes.

## Admission rule for terminology

A legacy term is not adopted merely because it appears repeatedly in earlier material.

Before an older term or definition becomes current, determine:

1. what layer owns the concept;
2. whether the current system still uses the concept;
3. whether its meaning changed;
4. whether the old wording transfers authority incorrectly;
5. whether a durable identifier must remain unchanged even when explanatory language improves.

## Protected distinctions already established

- candidate definition ≠ canonical governed WorkPacket;
- Store `SUPPORTABLE` ≠ governed reference-node `accept`;
- Store evaluation ≠ commercial submission;
- Store evaluation ≠ fabrication authorization;
- `DefinitionReviewRecorded` ≠ purchase, Store commercial acceptance, payment, reservation, governed authorization, machine readiness, or Cycle Start;
- `UnresolvedDefinitionAcknowledged` ≠ support or resolution;
- `BudgetaryEstimate` / Q ≠ commercial quotation or payable total;
- fixture stock ≠ live inventory, reservation, or allocation;
- modeled cycle time ≠ measured production time;
- application receipt time ≠ Store source time;
- current/applicable ≠ live or commercially fresh;
- simulation ≠ physical execution;
- network presence ≠ permission for remote Cycle Start.

## Durable identifiers

Current wire names, enums, record types, selectors, and governed identifiers should not be casually renamed for prose improvement. Where a durable identifier has a narrower or different meaning than ordinary English, explanatory text should define the scope rather than mutate the identifier.

## Sarah / early-demo caution

Early Sarah and research-demo material predates important language and ownership cleanup.

Treat its terms as donor vocabulary only. Recover useful behavior or explanation after reconciliation; do not use early Sarah wording to fill a current definition gap.

## Next work

Add definitions only when a real cross-layer ambiguity or implementation need requires them. This is not a decorative glossary and should not duplicate owner specifications.
