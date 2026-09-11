# Scan-to-Build semantic boundaries (application)

**Status:** controlling for application-level cross-layer terminology upon adoption in this correction commit.  
**Does not own:** Store runtime semantics, Governed Reference semantics, commercial law, or physical execution.  
**Pre-reconciliation application baseline:** `b663d242daa8385ef16af29b89ade6df71971596` on `GeorgePlattDemo/grok-file` branch `build/app-foundation-0.1`. That SHA is the closed Build 6 checkpoint this document reconciles; it is not this document’s containing commit.

**Pins named by this document:**

| Owner | Identity | Pin |
| --- | --- | --- |
| Application (pre-reconciliation) | `GeorgePlattDemo/grok-file` | `b663d242daa8385ef16af29b89ade6df71971596` |
| Frozen roadmap | `docs/app/STB-APP-MASTER-ROADMAP-0.1.md` | `985db87a707bd454d7c58419e2cf4d884f00cded` |
| Store | `GeorgePlattDemo/scan-to-build-store` | `b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d` |
| Governed Reference | `GeorgePlattDemo/scan-to-build-governed-reference` | `18949f163718a937f072f4be3a654bb303e53160` |

This pass does not require a new governed checkout. Application references remain pinned at the GR SHA above.

Build 6 remains closed. This document does not authorize commerce, reservation, payment, fulfillment, governed authorization, machine readiness, or Cycle Start.

---

## 1. Purpose, ownership, and precedence

Words describe authority within their owning layer. Words do not transfer authority between layers.

- Store runtime semantics remain Store-owned.
- Governed semantics remain Governed Reference-owned.
- Historical sources remain provenance unless a specific current interpretation is explicitly superseded.
- Application transport, persistence, and presentation are distinct from commercial, fulfillment, and physical states.

The frozen roadmap remains the build-sequence and page-contract source. Where its English uses “confirm,” “offer,” “quote,” or “current,” this document supplies the application interpretation. It does not rewrite the roadmap file.

If Store or governed owner text conflicts with application presentation, the owner text continues to govern that owner’s records. Application copy must not relabel owner enums or invent a commercial or physical state.

---

## 2. Definition review (future semantic names)

These names are adopted for future Build 7 records. This pass does not introduce runtime types, schemas, handlers, or migrations.

**DefinitionReviewRecorded**  
Records that the user affirmed an exact definition and acknowledged the displayed Store information, disclosures, and unresolved conditions. Those are distinguishable propositions within one review record. A separate workflow or extra click is not required merely to distinguish them.

**UnresolvedDefinitionAcknowledged**  
Records that the user acknowledged an incomplete, refused, unavailable, or otherwise unresolved disclosed state without presenting a complete supported review.

Neither event is:

- commercial submission
- purchase
- Store commercial acceptance
- payment, reservation, or order
- governed authorization
- production authorization
- machine readiness
- Cycle Start

A complete supported review may continue to require a current `SUPPORTABLE` Store answer plus complete scoped budgetary information. That gate does not mean a person’s intended definition disappears when Store support is unavailable. Unresolved acknowledgment remains available.

---

## 3. Exact roadmap reconciliation

Frozen-roadmap wording is preserved in `docs/app/STB-APP-MASTER-ROADMAP-0.1.md` at `985db87a707bd454d7c58419e2cf4d884f00cded`. Application interpretation of those references:

| Roadmap locus | Roadmap wording | Application interpretation |
| --- | --- | --- |
| §§20.3, 21.2; FAQ item 3 | Page 6 “Confirm the definition that travels”; navigation “Confirm” | Page title: **Review your definition**. Navigation: **Review**. |
| §21.4 | Shared inline Board review / “Confirm definition” inside the Board child | Same review record as Page 6; not a second confirmation authority. |
| §22.2 | “Confirm the definition that travels”; principal action “Confirm definition”; “Save unresolved definition” | Future action: **Confirm this definition** → `DefinitionReviewRecorded`. Future unresolved action: **Save unresolved definition** → `UnresolvedDefinitionAcknowledged`. |
| §§22.3–22.4 | Downstream review/history | Historical review records remain inspectable; they confer no new authority. |
| §23.2 | Review / Confirmation; `CONFIRM_DEFINITION` / `ACKNOWLEDGE_UNRESOLVED` | Application review actions. Not commercial assent. Preserve exact-snapshot, unique `actionId`, idempotency, disclosure set, invalidation, and unresolved-acknowledgment behavior. |
| §23.4 | Review applicability | Current means exact current bindings under existing selector rules. Changed candidate, Store answer/basis, disclosures, pending replacement, or import context makes a prior review historical. |
| §§25.3, 25.5 | Build 7/8 “confirm” wording and P6–P8 cases | Build 7 implements the review named here. Build 8’s actor path “confirm” means that review, then 46, new answer/review, close/reopen, export/import. |

Roadmap “confirmation” means the defined application review, not commercial assent, Store acceptance, or fabrication authorization.

---

## 4. Store evaluation and economics

The application presents Store economics. It does not determine them. Browser code does not run `evaluateJob` or `estimateJob`.

| Term | Meaning in this application | Must not be treated as |
| --- | --- | --- |
| Evaluation request | A bounded question (`OFFERING_LOOKUP` or `BOARD_SQUARE_V1`) associated with an exact candidate revision | Purchase, order, or commercial submission |
| Evaluation result | The Store-owned response for that question | Application-invented support or price |
| `SUPPORTABLE` | Favorable result under the exact implemented Stage-2 checks and supplied scope | Comprehensive physical approval, machine authorization, or “all limits checked” |
| `UNRESOLVED` / `REFUSED` / `UNAVAILABLE` | Exact Store-owned aggregate/job dispositions; line stock/capability/price reasons remain distinct | Application diagnostics (`APP_*`) or each other |
| Material offering | Store-attributed material/product listing | Automatically established legal offer |
| Fixture stock | Declared reference information (`asOf` / fixture clock) | Live count, reservation, or allocation the application subtracts |
| `BudgetaryEstimate` / `Q` / `BUDGETARY_ESTIMATE` | Store-issued budgetary result copied from returned totals | Quotation, payable commercial total, tax/freight-inclusive price, or proof of support |
| Modeled cycle | Calculated reference duration (`T_job_min` and cycle model identity) | Measured production time or promised completion |
| Cell recovery / service rate | Monetary economic input in the returned estimate | Modeled duration, or a claim of actual shop cost |
| Mark-on | Preserve the current reference-price calculation owned by Store | Margin or actual profitability |

Missing `Q` is never displayed as `$0`. Application receipt time does not become Store source time.

---

## 5. Applicability and freshness

**Current Store answer** means the answer is applicable to the exact candidate revision, request, and highest issued attempt under existing `currentStoreAnswer()` and correlation rules.

It does not automatically mean:

- newly queried
- live inventory
- commercially binding price
- reserved stock
- continuing commercial commitment

Application receipt time does not renew Store source time. Reopening a retained answer does not refresh it. Retry is explicit and creates a new attempt on the existing request.

---

## 6. Projection versus actual request

`browser/domain/derive.mjs` retains projection-local `request` and Store placeholders. In the current Board slice, `projection.payload.request.complete` is `false` by derivation design. That flag is not a verdict that the post-Build-6 application lacks an actual Store request.

Build 6 asks Store Zero through the bounded client after a complete committed Board revision. Future review must bind the actual linked request, response, estimate, and projection records. Do not rewrite historical projections. Do not use the placeholder completeness flag as the entire review predicate.

---

## 7. Commercial horizon — definitions only

The following are future commercial-horizon terms, not current runtime objects:

- Store commercial policy and terms
- Commercial submission
- Submission receipt
- Store commercial decision
- Revised terms / proposal
- Payment authorization and capture
- Payment failure or unknown payment status
- Commercial order
- Store fulfillment planning

**TERMS / JURISDICTION DEPENDENT — DO NOT HARDWIRE LEGAL CONCLUSION.**

Do not assume that receipt equals acceptance, that every changed term is legally a counteroffer, that payment establishes acceptance, or that an application event determines contract formation.

Store commercial policy may differ between Stores. It cannot override technical refusal, governed requirements, Cell limits, or local safety.

---

## 8. Protected governed and local meanings

Do not rename, collapse, or satisfy these from Store or commercial status:

- Material confirmation and its responsible authority
- Reference-node evaluation acceptance (`accept` / `defer` / `refuse` in their owning context)
- `SimulationAuthorization`
- `ProductionExecutionAuthorization`
- `simulation-release-eligible`
- Cell / local readiness
- Cycle Start
- Simulated versus physical outcome
- Staged versus ready for handoff versus completed handoff

The pinned governed version does not issue production execution authorization. Commercial status cannot satisfy governed or local prerequisites. Stage-2 `SUPPORTABLE` is not governed reference-node `accept`.

---

## 9. Owner-source discrepancies (recorded; owner files unchanged)

1. Store `DEFINITIONS.md` defines noncommercial **Store accept** as support for an applicable next governed step. Application commercial decisions, when they exist, must use qualified commercial terminology. Do not present Stage-2 `SUPPORTABLE` as Store accept or as governed accept.
2. Store `DEFINITIONS.md` categorically defines **Quote** as a commercial offer. Application interpretation must leave legal characterization dependent on terms and jurisdiction. Application `Q` / `BudgetaryEstimate` is not automatically that Quote.
3. Store `STORE-ZERO.md` says current readiness requires Store confirmation. Distinguish Store reporting from establishment of machine-local readiness. A retained Store answer does not make a Cell ready.

Protect the governed reference-node accept value. Do not rename it. Do not equate it with Stage-2 `SUPPORTABLE`.

---

## 10. Protected identifiers

Do not rename for English improvement:

- Store enums and wire protocol names (`SUPPORTABLE`, `UNRESOLVED`, `REFUSED`, `UNAVAILABLE`, `stb-store-zero-http/1`, request types/scopes)
- `BudgetaryEstimate`, `BUDGETARY_ESTIMATE`, `Q`, `MARK_ON`
- `currentStoreAnswer()` and its selection rules
- Observation-mapping `status: 'accepted'`
- `verifyPreparedBlob`
- `attempt-enqueued`, `enqueuedAt`, and attempt completion fields
- Adapter `ready` / host `storeReady`
- Governed types, statuses, roles, or authority functions

Scoped meanings belong in this document when a cross-layer ambiguity appears. Durable-record names stay.

---

## 11. Maintenance

Add another concise definition only when implementation exposes a material cross-layer ambiguity. State its meaning, owner, and relevant exclusions.

Preserve already clear controlling definitions. This page is not a general glossary, ontology, or duplicate of owner specifications.
