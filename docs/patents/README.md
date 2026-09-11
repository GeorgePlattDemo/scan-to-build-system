# Issued Patent Sources

**Status:** primary source area  
**Role:** direct technical and patent-lineage source for Scan-to-Build  
**Not:** a safety standard, commissioning record, production claim, or legal opinion

The full issued grants belong in this repository so future work can be checked against the source instead of relying on memory, paraphrase, an old demo, or a secondary mapping.

## Primary sources

Expected repository copies:

- `source/US9720401B2.pdf` — U.S. Patent 9,720,401 B2, *Method and System for Consumer Home Projects Ordering and Fabrication*, issued August 1, 2017.
- `source/US10768609B2.pdf` — U.S. Patent 10,768,609 B2, same title, issued September 8, 2020; continuation of the application that became U.S. 9,720,401 B2.

See `SOURCE-MANIFEST.md` for source identity and checksums.

## How these sources are used

For patent-related questions, use this order:

1. **Issued claims** for the actual claim language.
2. **Specification** for disclosed functions, relationships, examples and alternatives.
3. **Figures** for disclosed mechanical/system correspondence.
4. Current project mappings only as navigation aids.
5. Old demos and summaries never override the issued grants.

A figure or exemplary embodiment is not automatically a required implementation. Conversely, a current build must not silently rewrite the patent lineage merely because a newer architecture uses cleaner terminology.

## Technical lineage that should remain visible

The grants directly connect several parts that later Scan-to-Build work deliberately separates into bounded owners:

- a consumer/user interface for project inquiry and selection;
- project definition/design choices and machine instructions;
- project/material and estimated-price information;
- a retail/store setting holding material and fulfillment context;
- a tandem machine concept covering both sheet stock and dimensional lumber;
- machine-specific processing of dimensional stock and sheet stock;
- operator/material/tooling participation;
- labeling, assembly information, additional components, finishing and pickup/package concepts.

The current Application / Store / Governed / Machine separation may be more explicit than the patent language. That is an architectural refinement, not permission to lose the end-to-end lineage.

## Machine correspondence

The issued material includes direct dimensional-machine disclosure around a support surface/table, fence/reference, clamping, servo-controlled manipulating roller(s), and sawing, with additional disclosed tooling ways/functions in dependent material and the specification.

The issued material also includes direct sheet-machine disclosure around a support/backing structure, sheet support rollers, clamping/yoke assemblies, servo-controlled manipulation, guide rails and a movable tooling platform capable of receiving tooling.

Those are sources to check against when engineering. They are **not evidence that a present machine has been built, commissioned, guarded, measured, or made safe**.

## Current-build rule

Every substantial current build document that touches patented subject matter should contain a short **Patent correspondence** section using `PATENT-ALIGNMENT-GATE.md`.

The purpose is to answer:

> What issued source does this work correspond to, what is merely an exemplary embodiment, what are we implementing differently, and is that difference intentional and documented?

It is acceptable for a bounded research build to implement only a small fraction of the disclosed possibility space. The correspondence must simply remain legible.

**NO BLOOD ON WOOD.**
