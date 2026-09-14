# Picnic Table Class Candidate 0.2

**Status:** candidate donor translation / not accepted engineering / not Store support / not machine capability / not production authority  
**Date:** 2026-09-13  
**Working branch:** `build/app-configurator-engine-0.1`

## Purpose

Use `stb-picnic-tables-0.1.html` as a donor for useful user-facing project vocabulary without importing its unsupported structural, Store, pricing, machine, shipping, or fulfillment claims into the current application.

The donor is useful because it demonstrates a project that is materially different from the alcove class: long dimensional members, repeated frames, a holder-selected overall length, a requested fulfillment scope, material preference, visible derived parts, and a review step. Those are valuable tests of the shared class/configurator architecture.

The donor is not controlling evidence for engineering, Store 1, Machine Build capability, or commerce.

## Source identity

- donor filename: `stb-picnic-tables-0.1.html`
- donor SHA-256: `0b945c7d6d548f9bab3bafac6ff86137522df8f7ccb15268870fbfbcc5d3d43f`
- sanitized candidate filename: `stb-picnic-tables-0.2-candidate.html`
- sanitized candidate SHA-256: `76dbb5639bb59f3dc60d519a0f9f93fc3f573dc4fb0b66bbf138d25f6790c938`
- donor status: provenance / research donor
- sanitized candidate status: workbench reference only

## Admit now

These ideas are useful and may enter the current candidate application as bounded, non-authoritative inputs or presentation:

1. **Picnic table as a second bounded class.** This tests reuse of the common configurator and class runner rather than creating a second application.
2. **Overall product length as a holder input.** The holder may state a requested length. The application may derive candidate geometry from that input without claiming structural adequacy.
3. **Requested scope as a holder request.** `complete-part-set` and `frame-kit` are useful demand vocabulary. They do not establish Store fulfillment or machine capability.
4. **Material preference as a holder preference.** Plain-language material preference may travel with the candidate. It is not material identity, grade, treatment category, SKU, availability, or price.
5. **Visible derivation and part occurrences.** The user should be able to see what changed when an input changes, while unresolved conditions remain visible.
6. **Review before confirmation.** The candidate should show the exact current version and preserve the distinction between definition review and order/payment/release/fabrication.
7. **Plain-language glossary / explanation.** Useful language can be retained later, after the behavior and authority boundaries are stable.

## Do not admit as current fact

The donor contains useful mechanics mixed with unsupported assertions. The following do **not** cross into current behavior as established facts:

- a 60 in maximum structural clear-span rule;
- automatic frame count as a structural approval;
- any anonymous or fictional `designer of record` declaration;
- adjustable-height geometry or the donor height-to-leg-length formula;
- separate-bench geometry as an accepted class definition;
- placeholder 2×6 material lines as Store inventory, Store offerings, or SKUs;
- placeholder material prices, mark-on, hardware amounts, cycle recovery, or calculated selling price as Store output;
- donor cycle time, crosscut count, angle-cut count, or `Cell D-001` claims as current machine capability;
- donor kerf and trim values as machine facts;
- generic `PT` as proof of ground-contact rating or any treatment/use category;
- statements about what is on “our rack,” what can be shipped, or what can be fulfilled;
- frame-kit availability as a Store or machine commitment.

## Structural handling

Current governance controls this point:

`STRUCTURAL_SPAN_NOT_EVALUATED`

The application may calculate geometric span. It may not silently turn that number into structural adequacy. No attributed structural rule is presently loaded for this picnic class.

If a future exact condition genuinely requires professional judgment, route that condition through the qualified-resolution model: named person, declared standing, exact question, exact answer, scope, `voidIf`, timestamp, and explicit `doesNotEstablish`. Resolution is not release.

## Candidate input extension

This pass may extend the existing synthetic picnic fixture with these candidate inputs:

| Input | Meaning | Authority |
| --- | --- | --- |
| `productLength` | holder-requested overall length | candidate geometry input only |
| `requestedScope` | `complete-part-set` or `frame-kit` | holder request only |
| `materialPreference` | plain-language material preference | holder preference only |

For this software-candidate pass only, the UI accepts product length from **60 through 216 in**. That is an application/demo input bound. It is **not** a structural limit, Store stock limit, machine envelope, shipping limit, or fulfillment promise. Out-of-range demand is not clamped.

The existing fixture geometry remains explicitly synthetic. Broadening the input range does not validate its geometry.

## Deliberately deferred

Defer until separately researched or supported:

- accepted attached-bench versus separate-bench class definitions;
- engineered frame-count / span rules;
- qualified structural resolution implementation;
- actual 2×6 Store catalog identity and inventory;
- material treatment/use categories;
- Store price and economic resolution;
- dimensional-machine support for the required feature set;
- angle/end-treatment details;
- drill diameters/depths and hardware schedule;
- frame-kit fulfillment semantics;
- shipping/pickup constraints;
- final customer copy and glossary language.

## Why this is worth admitting

This donor forces the application to separate three things that a simple configurator can easily collapse:

**what the holder wants** → **what geometry can be derived** → **what Store / engineering / machine evidence can actually support**

That is exactly the separation Scan-to-Build needs before more bounded project classes are added.

## Verification status

- donor inspection: complete for this bounded admission pass;
- sanitized HTML script syntax: checked;
- candidate picnic rule unit tests authored and locally exercised in isolation: 3 pass, 0 fail;
- repository-wide `npm run test:unit`: **NOT RUN**;
- repository-wide `npm run test:browser`: **NOT RUN**;
- repository-wide `npm run test:boundaries`: **NOT RUN**;
- Store/vertical suites: **NOT RUN**.

No repository-wide PASS is claimed until the normal application environment runs those suites.
