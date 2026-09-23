<!-- transferred as-is from GeorgePlattDemo/grok-file@4595b4785a2686486e477ce2e70fb3f476285a8d -->
<!-- standing trial protocol: ../../work/capability-bridge/TRIAL-PROTOCOL.md -->

# Scan-to-Build (`apps/stb`)

<a href="https://georgeplattdemo.github.io/scan-to-build-review/working-app.html"><kbd>← BACK TO WORKING APP</kbd></a>

Local application subtree.

Checkpoints complete here:

- Build 0: durable local foundation
- Build 1: locked front door and common routing
- Build 2: Page 1 project start/resume and project identity
- Build 3A: durable original evidence custody
- Build 3B: Page 2 intake hub and safe source viewing
- Build 3C: explicit observation mapping and correction history
- Build 4A: bounded Board definition kind/version, occurrence and definition identity
- Build 4B: shared Board part summary and length-only schematic
- Build 5A: exact Store source gate and bounded wrapper
- Build 5B: durable Store client and correlation history
- Build 5C: actual pinned Store verification
- Build 6A: shared Store answer and budgetary Q presentation
- Build 6B: automatic Store question, Page 5, and Board rejoin
- Build 7A: exact definition review, unresolved acknowledgment, and truthful result
- Build 7B: inert owner-record archive, export/import/reopen, and Page 8 continuity
- Build 8: integrated first-vertical acceptance against the pinned Stage-2 Store

The bounded first application vertical is implemented and accepted against the pinned Stage-2 Store reference. It remains a reference/local application build, not a live commercial or physical fabrication service. Browsing does not create a project. There is no cloud custody, governed authority, or physical execution. A complete committed Board revision automatically asks Store Zero once as an evaluation, not an order. Board compact and Page 5 present the returned answer and budgetary Q. Missing Q is never shown as zero. “Current” means the answer applies to this exact revision; it is not a live refresh or commercial commitment. Definition review records `DefinitionReviewRecorded` or `UnresolvedDefinitionAcknowledged`. Neither is commercial submission, Store commercial acceptance, reservation, payment, governed authorization, or physical execution. Owner archive export/import preserves history as an inert snapshot. Imported Store answers and reviews remain historical. A new local Store question and a new local review are required before anything is current. Order, payment, fulfillment, and physical execution paths remain absent. Support is not fabrication authorization.

Cross-layer application terminology is controlled by [`../../docs/architecture/STB-SEMANTIC-BOUNDARIES-0.1.md`](../../docs/architecture/STB-SEMANTIC-BOUNDARIES-0.1.md).

## Runtime

Pinned for this checkpoint:

- Node `22.23.2` (see `.node-version`)
- npm `10.9.8` (lockfile created with this npm)
- native ESM, `node:http`, and `node:test`
- Playwright `@playwright/test@1.63.0`
- Chromium headless shell revision `1243` (Playwright 1.63 browser binary)
- PDF.js `pdfjs-dist@4.10.38` vendored locally at `browser/vendor/pdfjs/` (no CDN)

## Origin

Fixed development origin: `http://localhost:4317`

The static host binds loopback only (`127.0.0.1` and `::1`). If port `4317` is occupied, startup fails visibly and does not choose another port.

Changing scheme, host, or port would change the browser storage origin.

## Commands

From `apps/stb/`:

```text
npm ci --no-audit --no-fund
npx playwright install chromium
npm start
STB_STORE_ZERO_ROOT=<exact-clean-s2.2-checkout> npm start
npm run test:unit
npm run test:browser
npm run test:boundaries
STB_STORE_ZERO_ROOT=<exact-clean-s2.2-checkout> npm run test:store
STB_STORE_ZERO_ROOT=<exact-clean-s2.2-checkout> npm run test:vertical
```

`npx playwright install chromium` is required only when the Playwright 1.63 Chromium headless shell is not already provisioned for this environment.

`npm run test:store` exercises the exact S2.2 Store pin through the bounded wrapper. It fails closed if `STB_STORE_ZERO_ROOT` is absent, dirty, at the wrong commit, or missing required modules. It does not skip.

`npm run test:vertical` is the Build 8 whole-path suite. It drives the actual local host, IndexedDB, browser, bounded Store wrapper, and pinned Store evaluation. It fails closed if `STB_STORE_ZERO_ROOT` is absent. It does not use mock Store transport on the success path.

Build 8 acceptance counts at this closeout:

- `npm run test:unit` — 58 pass, 0 fail
- `npm run test:browser` — 137 pass, 0 fail
- `npm run test:boundaries` — 6 pass, 0 fail
- `STB_STORE_ZERO_ROOT=<pin> npm run test:store` — 22 pass, 0 fail
- `STB_STORE_ZERO_ROOT=<pin> npm run test:vertical` — 6 pass, 0 fail

`test:vertical` proves NEW USER, RETURNING USER, and PROFESSIONAL converge on one Board architecture; 45 in then 46 in against the real pinned Store; review binding; truthful Result; close/reopen versus inert import; keyboard and narrow-viewport operation; and the absence of commercial or physical authority.

Exact Store pin for this candidate branch: `0224e99f96dc65759bd7d3761d99e0708ad23e4a` (`GeorgePlattDemo/scan-to-build-store`, Store PR #9). Repin to the promoted Store main SHA before this System branch is merged.

Build 8 application commits on `build/app-foundation-0.1`:

- `7cd786944e81cd44d1ec8a90701e35454f7f822d` Record import collision dialog
- `cab7d7e6140db0b350c3ea8efcaadfc7eebf3ec6` integrated first-vertical acceptance
- this closeout commit (HEAD after `Build 8 close first bounded vertical`)

## Entry

Fixed landing copy and three actor orientations (`NEW USER`, `RETURNING USER`, `PROFESSIONAL`) rejoin one Begin shell at `/begin`. Actor context is session/view state only.

Page 1 can deliberately start a mapped Alcove shelf blanks reference, start an unclassified own project, or resume a saved incomplete project. Browsing without that selection still creates no project. The mapped class retains its GR source pin (`18949f163718a937f072f4be3a654bb303e53160`) as an inert candidate/reference with unresolved Store path; it is not executable or authoritative. Own start carries no mapped class provenance.

Own start opens the Page 2 intake hub. Mapped start continues in its bounded-question context over the same evidence architecture. Replacement inquiry (M2-16/I01) remains deferred beyond this Board identity slice.

Domain `projectId`, candidate revision, and event IDs are independent opaque UUIDs. `localRecordId` is the local storage namespace, not the domain project identity. Evidence IDs are independent opaque UUIDs; SHA-256 is content identity only.

## Page 2

Seven intake cards with locked names. Actor context changes card order only.

Active now: PICK A BOARD (bounded finished-length definition, one shared projection), MEASUREMENTS (typed original), SKETCH / PHOTO (JPEG/PNG display), DRAWING / PDF (local PDF.js display), TAKEOFF / CUT LIST (raw text retention).

Planned: SCAN A SPACE and CAD / BIM / STRUCTURED FILE. Opaque original retention and manual exits are allowed. Native capture/extraction is not available.

JPEG, PNG, and PDF display from retained bytes. Viewing or selecting a source does not create an observation. PDF.js is display-only: no embedded JavaScript, forms, annotation layer, or automatic external navigation.

Manual measurements and takeoff rows become immutable observations with independent IDs. Missing or unsupported units stay unresolved. A correction creates a new observation that supersedes the old one; the old record remains inspectable. Mapping into the candidate is an explicit act and uses the single candidate mutation path. Detaching a source from the active candidate keeps the historical attachment. Unclassified needs create no parts.

Pick a Board consumes an explicit finished-length mapping and produces one packaged projection. Accepted finite inch lengths are 24 through 60 inclusive, quantity 1 ea, square CROSSCUT. Invalid demand is retained and is not clamped. Changing 45 in to 46 in keeps the same occurrenceId and creates a new definition revision. Manual 60 in and the CUT-001 documentary 60.000 in reference remain distinct provenance. The SVG and part summary read the same projection. Width, thickness, offering, price and supportability stay Store-owned and are not fabricated.

## Storage / limits

Local database name at this origin: `stb-app-v1`.

Object stores: `projects`, `records`, `blobs`, `drafts`.

Repository operations are scoped to `localRecordId`. Domain `projectId` values are not unique storage keys. Immutable records are insert-only. Blob bytes are keyed by SHA-256 and hashed before the write transaction. Project head updates use compare-and-swap inside one IndexedDB readwrite transaction. Unapplied drafts are stored separately from durable records.

Changing scheme, host, or port changes the browser storage origin. Records at `http://localhost:4317` are not visible at another origin and are not thereby deleted.

First-build packaging limits: 20 MiB per original source; 100 MiB unique evidence bytes per project; 20 MiB aggregate record JSON; 10,000 records per archive; 160 MiB serialized archive.

Owner archive format `stb-owner-archive` version 1 is one UTF-8 JSON file with suffix `.stb.json`. Top-level fields are `manifest`, `project`, `records`, and `evidenceBlobs`. Export uses one IndexedDB readonly transaction so later commits are excluded. Missing original bytes produce an explicit incomplete export; bytes are never invented. Import is atomic: a fresh `localRecordId` namespace preserves domain `projectId` and history. The same `archiveId` reopens the existing imported copy. A colliding `projectId` offers Open existing or Import separate copy; histories are not merged. Imported records are stamped `imported: true` at the record top level. Nested historical Store/review/physical claims stay inspectable and do not become current authority. Unknown class versions remain inspectable; editing and derivation are disabled. Local IndexedDB is “saved on this device,” not cloud synchronization or permanent hosted custody.

Store presentation reads durable Store records; it does not calculate Store prices, stock, or envelope results in the browser.

## Store

Exact Store pin for this candidate branch: `0224e99f96dc65759bd7d3761d99e0708ad23e4a` (`GeorgePlattDemo/scan-to-build-store`, Store PR #9).

Supply a clean checkout of that pin through `STB_STORE_ZERO_ROOT`. The path is not hardcoded. At startup the wrapper verifies:

- the checkout exists
- `HEAD` is exactly `c51f5f27af9a77bc7581c5d42c56f0a1ed0b650a`
- required modules and catalog/observation files exist
- the checkout is clean
- `findSku`, `offerMaterial`, `evaluateJob`, and `estimateJob` can be loaded from that checkout

A failed source gate leaves the local browser/evidence host usable. Store endpoints return an adapter/service diagnostic. The wrapper does not copy Store source into the app, does not substitute another commit, and does not fabricate fallback catalog data.

Protocol: `stb-store-zero-http/1`

Bounded endpoints:

- `POST /api/store-zero/offering` (`OFFERING_LOOKUP`)
- `POST /api/store-zero/job` (`BOARD_SQUARE_V1`, `USER_DEFINED_BOARD_V1`, or `ALCOVE_INSERT_V1`)

`BOARD_SQUARE_V1` remains the accepted square-Board path. `USER_DEFINED_BOARD_V1` is a separate bounded request for an already-defined 24–60 in Board workpiece with explicit operation meaning carried at the application/Store boundary. It does not redefine the project to the Store SKU. For the current Start Your Own X-brace proof, Store Zero supplies a 72 in raw SKU while the identified project workpiece remains 60 in. The integration accounts for one raw-stock preparation cut plus the three defined saw/miter cycles. The requested centered spot remains `SPOT_ON_LOCATION` with unresolved tooling and is not silently priced as a generic 0.75 in drilled hole. Store Zero still owns the Stage-2 modeled BudgetaryEstimate for the resolved encoded operations; while unresolved operation conditions remain, the application presents that value as partial rather than as a complete commercial total.

`ALCOVE_INSERT_V1` is the bounded Store boundary for Sarah's solid-board Alcove path. The project carries material class/species, project-derived parent demand, kept lengths, quantities, component finished length/width, required operations, optional shelf-spot demand, hardware demand, and unresolved project conditions. It does not nominate Store board SKUs or calculate Store prices. A component may carry `MILL_LONGITUDINAL_PROFILE` geometry (`pathLengthIn`, finished-width `yIn`, and `totalDepthIn`), so depth can change actual Store work rather than only board count. At 14 in depth the third 1x6 shelf strip is a residual-width component and therefore asks Store for longitudinal milling; at 11 in depth two full 5.5 in strips require no longitudinal mill. Store returns current species-specific SKUs, stock state, selling price, declared D-001 capability/refusal, modeled cut/mill component travel, machine service, Q when complete, calculation identity, and a fresh evaluation receipt. Pine and Poplar currently declare the longitudinal-mill operation; Oak and Cherry do not, so the same 14 in geometry can legitimately refuse by species while an 11 in cut-only configuration can proceed if stock is sufficient. Shelf-elevation `FROM_BASE` face spotting still fails closed because the Stage-2 spot envelope has not yet declared that location rule. A finished 72 in upright against a declared 72 in parent also fails the present reference-cut material-capacity model rather than silently growing the parent.

This branch intentionally does not repurpose the older `alcove-shelf-blanks` System class, which is a separate sheet/blank reference experiment. Sarah's current Alcove remains a separate Store request contract so existing project semantics are not silently rewritten.

The Store checkout is never statically served. Browser modules do not import Store implementation, the pricing engine, or the envelope. Support is evaluated before estimate. Raw Store evaluation and estimate remain separate. Transport and adapter errors are not Store dispositions.

A complete committed Board revision schedules one BOARD_SQUARE_V1 evaluation after candidate persistence. Rerender, navigation, and reopen reuse that request. Changing 45 in to 46 in creates a new revision and therefore a new question. Unapplied edit-buffer values are not asked. Page 5 (`/project?id=&view=store`) is the existing Ask Store Zero page. Board compact and Page 5 consume the same presentation of offering, fixture stock, capability, budgetary Q, and inspectable basis. Q is a budgetary estimate copied from the Store total, not a quote. “Current” means revision applicability. Modeled time is not physical machine time. Retry creates a new attempt on the same request. Compact presentation identifies the answer as a Stage-2 reference evaluation; no order is placed.

## Review and result

Page 6 (`/project?id=&view=confirm`) is “Review your definition.” Page 7 (`/project?id=&view=result`) is “Follow the result.” Navigation labels remain Review and Result. They are existing primary pages, not new pathnames.

A complete supported review is available only for a valid current Board projection with no unapplied edit buffer, a current Store answer of exactly `SUPPORTABLE`, and a complete scoped budgetary estimate. That action is “Confirm this definition” and appends an immutable `DefinitionReviewRecorded` snapshot. The snapshot binds the actual Store request/attempt/response/estimate identities, not projection placeholders. `projection.request.complete` is not the review predicate.

When that predicate is not satisfied, “Save unresolved definition” may append `UnresolvedDefinitionAcknowledged`. The intended definition remains retained. Unresolved acknowledgment is not support, verification, authorization, or fabrication readiness.

Review actions use unique `actionId` receipts. The same action identity is idempotent. A later deliberate review uses a new action identity and creates another immutable record. Prior reviews stay inspectable as history. Applicability is lost when the review digest no longer matches current consequential bindings (candidate, definition, evidence/mapping, Store request/response/estimate, disclosures, unresolved set). Arrival time does not confer currentness. The digest (`review-digest/v1`) is identity/comparison evidence only.

Inline Board review and full Page 6 use the same handlers. Unapplied consequential edits disable review until Apply.

Page 7 states “Definition retained; no physical fabrication recorded.” Store evaluation, review records, and physical outcome remain distinct. No fabricated, in-production, pickup-ready, reserved, ordered, paid, or delivered claim is inferred from `SUPPORTABLE`, Q, or review. CUT-001 remains a documentary reference. Lowering and physical outcome stay unavailable.

## Owner record

Page 8 (`/project?id=&view=record`) is “Keep your project record.” The navigation label remains Record. It is an existing primary page, not a new pathname.

The page shows project identity, current versus historical interpretation, retained original sources, Store and review history, and chronological events without truncating storage. “Save/export record” generates a validated owner archive and requests a download. Reopen of a local project preserves identity. Import from Begin or Page 8 restores history into a new local namespace. Replacement inquiry (P8-03) is not a first-vertical screen.
