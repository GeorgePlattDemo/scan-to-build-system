# Patent Alignment Gate

**Purpose:** keep the issued patents directly checkable against current Scan-to-Build work without turning the patents into a safety standard or forcing every prototype to reproduce every exemplary embodiment.

## 1. Required source hierarchy

When a current build touches patent subject matter, check:

1. the full issued PDF;
2. the issued claims relevant to the function;
3. the specification and figure(s) that describe the function or relationship;
4. existing project claim/correspondence maps only as secondary navigation.

If a current summary conflicts with the issued source, the issued source controls the patent statement.

## 2. Required relationship label

For each material feature, interface, operation or system relationship discussed in a build document, use one or more of these labels when patent correspondence is relevant:

- `CLAIM CORRESPONDENCE` — the current feature is being compared directly to language in an issued claim.
- `SPECIFICATION CORRESPONDENCE` — the feature corresponds to disclosure in the written description but is not being represented here as a claim element.
- `FIGURE CORRESPONDENCE` — the feature maps to a disclosed figure/component relationship.
- `BOUNDED IMPLEMENTATION CHOICE` — the current build implements a narrower or different practical version of disclosed functionality.
- `PROJECT EXTENSION` — current architecture/governance/research adds something not relied upon as patent disclosure.
- `NO PATENT DEPENDENCY` — the work is operational, safety, research, UI or infrastructure work that does not need a patent correspondence claim.

Do not use `CLAIM CORRESPONDENCE` as shorthand for a legal conclusion about infringement, validity, enforceability or claim coverage.

## 3. Build-document checklist

A substantive Application, Store, Machine or Cell build document should answer the applicable questions below.

### End-to-end chain

- Does the work preserve a legible path from user/project information through material/capability resolution toward bounded fabrication or refusal?
- If a layer is deliberately separated from the integrated patent description, is the handoff still explicit?

### Store / retail / material relationship

- Is Store material identity or availability kept distinct from project authority?
- Does the current implementation preserve the ability to connect resolved work to material/capability at a fulfillment location without pretending that reference Store data is live inventory?

### Dimensional machine

Where relevant, compare against the issued dimensional-machine disclosure and claims: support surface/frame, fence/reference, clamping, manipulating roller(s), stock movement, sawing, and any additional tooling-way functions being implemented.

### Sheet machine

Where relevant, compare against the issued sheet-machine disclosure and claims: support/backing structure, sheet rollers/reference, clamping/yoke assemblies, servo-controlled manipulation, guide-rail/tooling-platform relationships and selected tooling functions.

### Instructions / lowering / controller boundary

- Does current work preserve the concept that project/machining requirements become machine instructions somewhere in the end-to-end chain?
- If current architecture deliberately moves controller-specific generation to the machine site, is that documented as a current implementation choice rather than a denial that instruction generation/transmission exists in the patent lineage?

### Pricing / options / fulfillment

Where used, distinguish current budgetary/reference economics from the broader patent-described estimated-price/order/fulfillment concepts. Do not promote current reference Q to a commercial quote simply because pricing appears in the patent.

### Labels / assembly / additional components

If these features enter a current vertical, check the relevant issued disclosure rather than reconstructing their meaning from an early demo.

## 4. Divergence rule

A current build may intentionally differ from an exemplary patent embodiment.

When it does, record:

- what the issued source says;
- what the current build does;
- why the narrower/different choice is being made;
- whether the difference is temporary research scope, a deliberate architecture choice, or an unresolved question.

Do not silently convert `different` into `contradictory`, and do not silently convert `described in a patent` into `required in the current MVP`.

## 5. Capability and safety firewall

Patent correspondence does not establish:

- installed hardware;
- commissioned capability;
- machine readiness;
- measured tolerance or repeatability;
- guarding adequacy;
- safety category / PL / SIL;
- regulatory compliance;
- production authorization.

Those require their own evidence and competent engineering review.

## 6. Minimum section template

Use this in a current build document when applicable:

```text
## Patent correspondence

Primary source:
- US 9,720,401 B2: [claims / pages / figures]
- US 10,768,609 B2: [claims / pages / figures]

Relationship:
- [CLAIM CORRESPONDENCE | SPECIFICATION CORRESPONDENCE | FIGURE CORRESPONDENCE | BOUNDED IMPLEMENTATION CHOICE | PROJECT EXTENSION]

Current implementation:
- ...

Intentional differences / unresolved:
- ...

Capability effect:
- none until separately installed, tested and evidenced
```

## 7. Review question

Before accepting a major build change, ask:

> Can a cold reader open the issued patents and understand what came from the patents, what came from later engineering, and why the current implementation does not break the end-to-end lineage?

If not, the correspondence is not yet good enough.
