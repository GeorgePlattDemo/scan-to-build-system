# STB Project Fork and Transaction Isolation Protocol 0.1

**Status:** controlling documentation candidate  
**Applies to:** copied projects, library templates, shared demonstration fixtures, returning-user forks, professional/job imports, Store transactions, completed-job packets, and Owner Records  
**Safety invariant:** **NO BLOOD ON WOOD**

---

## 1. Purpose

A person may begin from an existing Scan-to-Build project, library definition, demonstration fixture, or another permitted reusable source.

That reuse must not cause the donor project's active configuration, Store answer, BOM, price, order, machine packet, outcome, receipt, or Owner Record to leak into the new person's transaction.

The controlling rule is:

> **Copying a project copies a starting definition. It does not copy another customer's transaction.**

A fork therefore creates a new project identity and revision lineage before any consequential downstream record is issued.

---

## 2. Provenance may cross the fork; transaction authority may not

Permitted cross-fork references include explicit provenance such as:

- `parentProjectRef`;
- `templateRef`;
- `derivedFrom`;
- shared public/library definition identity;
- `DEMO_SHARED_FIXTURE` evidence references;
- source scan / drawing / evidence references where sharing is permitted;
- donor project revision used only to explain the starting point.

These references answer:

> Where did this starting point come from?

They do **not** answer:

> What did this new customer order?

The new customer's current project revision answers that question.

---

## 3. New owner / actor means new project transaction lineage

When Tom starts from Sarah's/reference Critical Fit project, the system shall create a Tom-owned project identity and revision lineage.

Example:

```text
parentProjectRef   CRITICAL-FIT-REFERENCE / SARAH-Rn
newProjectId       CF-TOM-001
newRevision        TOM-R001
accountId          DEMO-TOM-001
```

The parent revision remains provenance only.

Tom's transaction must not use Sarah's/reference active revision as its controlling project revision.

---

## 4. Inherited choices must be materialized and confirmed

A copied configurator may initially show values inherited from the donor/template.

Before the new revision is confirmed, every consequential inherited choice shall be materialized into the new project's own state.

For Tom's Critical Fit example, that includes values such as:

- unit height;
- unit width;
- unit depth;
- shelf quantity;
- shelf elevations;
- material choice;
- back choice;
- fit intent;
- other project-class choices that affect definition, BOM, Store support, operations, economics, or fulfillment.

If Tom changes only width and confirms all other displayed choices unchanged, those unchanged values become **Tom's confirmed values** in `TOM-R001`.

They are no longer active Sarah/reference transaction values merely because the numbers are identical.

---

# 5. Critical reconciliation gate — `G-FORK-RECONCILIATION`

**THIS IS A CRITICAL RECONCILIATION STEP.**

The gate exists to prevent donor/template state from leaking into a new customer's WorkPacket or transaction.

It shall run at minimum:

1. after `STB-F02 — Confirmed Project Definition` and before `STB-F03 — WorkPacket` is issued; and
2. again before `STB-F06 — Reference Offer` / `STB-F07 — Order` may bind commercial state.

The gate asks:

```text
G-FORK-RECONCILIATION

New projectId exists and belongs to the current actor/account?
NO → BLOCK
YES ↓

Current confirmed projectRevision belongs to that projectId?
NO → BLOCK
YES ↓

Every consequential inherited choice has been materialized into the new revision?
NO → BLOCK
YES ↓

Any changed input invalidated downstream derivations from the donor/previous revision?
NO → BLOCK
YES ↓

WorkPacket/BOM/parts derive from the current new revision?
NO → BLOCK — STALE_DERIVATION
YES ↓

Store request identifies the current new revision / WorkPacket?
NO → BLOCK — REVISION_MISMATCH
YES ↓

Price basis derives from that Store answer and current revision?
NO → BLOCK — STALE_PRICE_BASIS
YES ↓

Offer/order/payment/release/Operations Packet all bind the current new revision lineage?
NO → BLOCK — TRANSACTION_LINEAGE_MISMATCH
YES ↓

PASS
```

A pass means the new transaction is internally reconciled.

It does not create Store support, payment, production release, machine readiness, physical execution authority, or Cycle Start.

---

## 6. Mandatory invalidation after a configuration change

When a consequential configuration input changes, all dependent downstream artifacts from the prior/donor revision become stale for transaction purposes.

At minimum, reassess or regenerate as applicable:

```text
confirmed definition
→ derived geometry
→ part occurrences / BOM
→ material quantities
→ requested operations
→ WorkPacket
→ Store request
→ Store response
→ price basis
→ offer
→ order eligibility
→ Operations Packet
```

Existing historical records are retained. They are not silently edited into the new revision.

A stale record may remain visible as history or comparison, but shall carry a state such as:

- `SUPERSEDED`;
- `STALE_DERIVATION`;
- `HISTORICAL_REFERENCE`;
- `DONOR_PROVENANCE_ONLY`.

It shall not be presented as the current order fact.

---

## 7. Identical regenerated values are still newly derived facts

A valid regeneration may produce the same numerical result as the donor project.

Example:

Tom changes a width by 2 in, but the same stock count may still cover the job.

If Tom's regenerated BOM independently produces:

```text
10 × Pine 1×6×96
4 × Pine 1×6×72
1 × hardware pack
```

that BOM may be used for Tom **only because it was regenerated from Tom's current revision**, not because Sarah/reference previously used the same quantities.

The record should retain a basis such as:

```text
basis = CALCULATED_FROM_PROJECT_REVISION
projectRevision = TOM-R001
```

not:

```text
basis = COPIED_FROM_DONOR_ORDER
```

The same rule applies to Store dispositions, operation counts, price, machine time, fees, and receipt totals.

---

## 8. Evidence and configuration must remain distinct

Shared source evidence may legitimately contain dimensions that are the same for multiple demonstration users.

For example, Tom may reuse the same permitted demonstration scan with:

```text
opening width 45.500 in
room height   94.500 in
```

Those values remain source evidence because Tom is intentionally using the same source fixture.

They must be labeled as source/context facts.

Tom's **ordered definition** must separately identify his confirmed configuration, for example:

```text
unit width    43.500 in
unit height   72.000 in
unit depth    14.000 in
interior span 42.000 in
```

A receipt or order must never make the reader infer which dimensions are room/source evidence and which dimensions are the thing Tom ordered.

---

## 9. Record-specific isolation rules

### F01 — Evidence

May reference shared or donor evidence when permitted and explicitly classified.

### F02 — Confirmed Definition

Must belong to the current project/actor lineage. Donor configuration may appear only as provenance/comparison.

### F03 — WorkPacket

Must reference the current F02 revision. A donor WorkPacket cannot become the current WorkPacket.

### F04 — Store Evaluation

Must be a new request/attempt against the current WorkPacket/revision. A donor Store answer may be historical comparison only.

### F05 — Price Basis

Must be recalculated from the current revision / Store response. A donor total is not the new customer's price merely because the material quantities appear unchanged.

### F06/F07 — Offer / Order

Must bind the current account, current project revision, current WorkPacket, current Store answer, and current Price Basis.

### F08/F09 — Payment / Release

Must bind the new order. Donor payment or release state cannot cross the fork.

### F10 — Operations Packet

Must be regenerated from the current ordered revision and current Store-selected fulfillment facts.

### F11–F14 — Machine / Outcome / Inspection / Fulfillment

Must identify the new job/order/packet lineage. Donor machine outcomes are never proof of the new customer's execution.

### F15 — Owner Record

May cite the donor/template as provenance, but the chronology and outcomes belong to the new project/account.

---

## 10. Completed-job packet rule

A completed-job packet shall have a clearly identified section named substantially:

**WHAT THIS CUSTOMER ORDERED**

That section must contain only the current customer's confirmed ordered definition and its derived transaction facts.

Source-room dimensions, donor/template values, historical configurations, and shared evidence may appear in separate clearly labeled sections such as:

- `SOURCE EVIDENCE`;
- `STARTING TEMPLATE / PROVENANCE`;
- `REVISION HISTORY`.

They shall not be mixed into the ordered-definition table in a way that can be mistaken for the ordered product.

---

## 11. Receipt rule

A receipt is downstream of the order and therefore must be revision-isolated.

At minimum it shall bind:

```text
accountId
projectId
projectRevision
orderId
WorkPacketId
Store response / price basis
Operations PacketId
amount
fulfillment state
```

The dimensions/material/operations shown as `ordered` must come from that exact lineage.

A donor/template dimension may appear only as explicitly labeled provenance and shall never silently populate `what was ordered`.

---

## 12. Regression requirement

A project-fork regression test should deliberately:

1. instantiate a new account/project from an existing bounded project;
2. change one consequential input;
3. confirm the new revision;
4. assert that all dependent records identify the new project/revision;
5. assert that stale donor/previous-revision identities do not appear as controlling inputs downstream;
6. allow shared evidence references only where explicitly permitted;
7. confirm that identical regenerated numerical values retain the new revision as their basis.

Tom's Critical Fit 45.5 → 43.5 width change is the first reference test for this rule.

---

## 13. Fail-closed rule

If the system cannot prove that the downstream artifact was derived from the current customer's confirmed revision, it shall not guess.

Use:

```text
BLOCK — REVISION_MISMATCH
BLOCK — STALE_DERIVATION
BLOCK — STALE_PRICE_BASIS
BLOCK — TRANSACTION_LINEAGE_MISMATCH
```

or another explicit bounded equivalent.

The remedy is reconciliation/regeneration from the current revision, not manual transcription of donor values.

---

**Critical principle:**

> **Provenance may be inherited. Transaction truth must be regenerated.**

**NO BLOOD ON WOOD.**
