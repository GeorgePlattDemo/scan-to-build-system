# STB-APP-STABILIZATION-0.1

Pass 1 — application source baseline and documentation stabilization  
Date: 2026-09-09  
Primary branch: `GeorgePlattDemo/grok-file` / `wip/app-build-0.1-stabilization`

## VERIFIED BASELINE

The source map is the exact starting-source register, not a moving-head selector. Checkpoint 1: `4111192a2cf18a9451f53fec352a52230c5c3c0b`. Its nearest-reference additions are recorded in correction G-01 below.

All repositories are under `GeorgePlattDemo`.

| Repository | Branch | Verified starting SHA | Files read for this review | Authority role |
| --- | --- | --- | --- | --- |
| scan-to-build-governed-reference | main | `18949f163718a937f072f4be3a654bb303e53160` | `README.md`; `STB-BUILD-M1.md`; relevant provisions of `specs/STB-REF-0.2.5.md`, `plans/STB-PLAN-0.2.5.md`, and `docs/architecture/common-entry-contexts.md`; `docs/reference-node/README.md`; `packages/reference-node/src/types.ts`; `docs/architecture/current-simulation-authority.md`; `fixtures/reference-node.v1/context.json` | Governs semantics, gates, authority and current M1 limits; common-entry note is informative. Read-only. |
| scan-to-build-store | main | `3620b35369d70cf49733bbb0b62c0f3d9969b738` | `README.md`; `DEFINITIONS.md`; application-relevant provisions of `STORE-ZERO.md`, `CAPTURE-TO-WORKPACKET.md`, `STORE-JOB-001.md`; `STORE-ASSET-TO-IMPLEMENTATION-MAP.md` | Owns Store offerings, stock, capability projection, translation, disposition and fulfillment within governed limits. |
| grok-file | wip/cell-spine-0.1 | `f0c3e08682810d7a3c03c211dc76f8ece756313e` | `docs/cell/STB-CELL-0.1.md`, including ownership, control, lowering, app interfaces, candidate-object placement, conformity tab and unresolved decisions | Descriptive Cell reference. Candidate objects are not adopted Store/governed contracts. Source branch untouched. |
| grok-file | wip/app-build-0.1-stabilization | `261f643ea27994a8367e971e78c763875f4b524e` | `docs/app/STB-APP-BUILD-0.1.md`; inherited Cell document | Existing application build contract, subordinate to owners and the current Pass-1 instruction. |
| grok-file | prototype/sarah-alcove-tour | `b52570fe48db3af09825b826b739aca72db32c22` | `prototypes/sarah-alcove-guided-tour.html`: orientation, fixture/provenance constants, state changes, checks, candidate export, display-only simulation and self-check definitions | Implementation ancestor only. Read-only. |
| Scan-to-Build | main | `ea17feeac299fc359c6776f85019b242ffffc085` | `index.html`: experience structure, configuration/BOM, constraint display, navigation, packet and fabrication claims | Experience-only. Read-only. |

**Drift:** none in the expected starting heads, required-file presence or specified ancestry. Each pinned source was readable. Application start was exactly one commit ahead of the Cell pin, zero behind; only the existing build contract was added. The inherited Cell blob matched `e1864c2d3b7ad92293144e0fcacab4025d842878`. No branch was recreated or repinned.

The five source branches outside the application working branch were rechecked after corrections and still matched their pins. The Store corrections below are an unmerged documentation overlay, not a replacement controlling Store pin. The Cell source branch remains pinned; its correction is confined to the application branch copy.

Complete tree listings showed no `AGENTS.md` at the reviewed pins. No mining-pile documents, unrelated repositories, general web research, implementation libraries or tool survey were used. Patent assertions were treated as descriptive source material, not independently researched or accepted as safety authority.

## CONSISTENT

- **Authority and evidence:** REF §§5, 12–13 and 21, Store Capture §§1, 6–8, 17 and 20–25, and App §§12–14 distinguish supplied evidence, candidate interpretation, calculated geometry and verified information. Confirmation alone is not verification; a parsed file or content hash cannot establish fabrication truth.
- **Three entries, one core:** App §§10–11 agree with common-entry §§2–4. COLD and CONTRACTOR remain unactivated; PLACE is the current M1 reference path. A display model or historical tour does not activate domain handoffs.
- **Evaluation, plan and outcome:** current reference-node types distinguish `NodeEvaluationResult`, `NodePlan` and `NodeOutcomeRecord`. Acceptance may yield a plan without simulation. `NodeOutcomeRecord` requires an actual M1 simulation result, is `simulated_only`, and carries `physicalWorkOccurred=false`; it is not physical Store closeout or an alias for every governed `OutcomeRecord`.
- **Exact current simulation:** the reference request is `3 ea`, with `44.75 × 11.00 × 0.75 in` blanks derived from the `46.25 in` opening and two `0.75 in` supports. Its operations are exactly `simulate_crosscut` then `simulate_shelf_blank`. The recovered tour uses the same values. Changed geometry, provenance, material or operations cannot borrow that fixture's disposition.
- **Different examples remain different:** Store Job 001 uses a `45.500 in` opening, a `0.125 in` fit allowance, `43.875 in` finished length, five shelves, and dimensional stock. It is not the three-blank sheet fixture. No values, identifiers or material forms were merged.
- **Store ownership:** Store Zero §§8–11, 16–18, 23–28 and Job 001 §§1–3, 7 preserve projected answers, freshness, material/stock/capability distinctions, Store translation and local lowering. The app does not allocate stock, invent a quote, or own the Store database.
- **Machine boundary:** Job 001 §§3–5, 10–12 and Cell §§4–6, 10–14 agree that job geometry is part-relative; station/tool truth and lowering are machine-local. `POSITION_VALID` is a local reference condition, not readiness, authorization or part conformance. Neither network presence nor a label establishes execution authority.
- **Production closed:** REF §§3.3, 4.1, 6.25, 19 and 26.1A, current authority documentation, App §§13 and 18, and Cell §14 preserve the closed production path. Required `physicalFabricationEligible=false` and structural unresolved labels remain in force.

## CORRECTIONS MADE

| ID / class | Repository and branch | File(s) | Checkpoint SHA | Source basis and why safe |
| --- | --- | --- | --- | --- |
| G-01 / Green | grok-file / wip/app-build-0.1-stabilization | `docs/app/STB-APP-BUILD-0.1.md`; `docs/app/STB-APP-SOURCE-MAP-0.1.md` | `9bf31b1752d81b30283a122ce961c783b1ccc50e` | Replaced automatic review-to-build instructions with the authorized documentation → later planning separation. Added current fixture/authority references; clarified intended scope versus governed activation. Aligned the consequence chain with the supplied Pass-1 direction and Store-owned neutral translation (Job 001 §§3, 7). Added the two directly consulted authority/fixture files to the map. No class, gate or API was invented. |
| G-02 / Green | grok-file / wip/app-build-0.1-stabilization | `docs/cell/STB-CELL-0.1.md` | `e95c15093eb27c7000814d5c0d22fc4842aff4df` | Corrected the D-001 source pointer from Store Zero's existing saw baseline to Job 001 §3; replaced “live ops” wording with described synthetic operations in C-13 and the adoption decisions. Cell's own status, Store Zero §18 and Job 001 §§3, 21 already settle the meaning. Three lines changed; no capability expanded. |
| G-03 / Green | scan-to-build-store / docs/app-build-0.1-stabilization | `CAPTURE-TO-WORKPACKET.md` | `1ca33b8dc6f822bab2eda9a4bf7a1dfa9e76070e` | §25's “creates … dimensional evidence” became collection of supplied evidence and presentation of reconciliation. Same document §§1, 7 and 25, plus REF §§5 and 21, already prohibit invented physical truth. One diagram line changed. |
| Y-01 / Yellow | scan-to-build-store / docs/app-build-0.1-stabilization | `DEFINITIONS.md` | `f39a2e7cd482003d1f90d8bbdd543d4513578101` | Added two operational definitions: machine-neutral operation sequence and machine configuration. These concepts already govern Job 001 §§3 and 7 and README “Fixed Tool Geometry,” but lacked explicit entries at the translation boundary. Each addition cites its basis and distinguishes part requirements from machine coordinates. Explicitly does not adopt candidate Cell record types. Isolated synthesis commit; six added lines. |

The Store branch was created only after the corrections were demonstrated, directly from `3620b35369d70cf49733bbb0b62c0f3d9969b738`. It has not been merged.

## DEMONSTRATED DISCREPANCIES NOT CORRECTED

| ID | Source and conflicting/missing source | Owning layer | Application consequence | Smallest required disposition |
| --- | --- | --- | --- | --- |
| D-01 | Public `index.html` claims a patented safety envelope, gate-to-motion progression, controller-ready packet instructions and removal of the postprocessor; conflicts with REF §§4.1, 19, Store Job 001 §3 and Cell §6. | Historical experience source; current meanings belong to Governed/Store/Cell. | Copying the execution story would collapse authority and lowering boundaries. | Exclude those claims and code paths from reuse. Public source remains read-only. |
| D-02 | Public `index.html` identifies `PNC-196` as sheet stock in its controller excerpt, while its own BOM and Store Job 001 §2 use that SKU for dimensional 1×6×96 stock. | Historical prototype / Store material mapping. | Mixed stock identities cannot seed application material truth. | Do not carry that mapping or example controller excerpt forward. Use the owning source for each separately identified example. |
| D-03 | Tour `checks()` and `makePacket()` use conceptual COLD, mark PLACE inactive locally, and export a nonconformant candidate document; governed common-entry §10 and current M1 use PLACE. The tour itself declares no activated domain handoff. | Historical implementation; Governed owns active entry/packet contracts. | Its routing, local checks and export shape cannot become current domain contracts. | Preserve orientation/display behavior only; plan any actual handoff against the governed source. No historical code repair. |
| D-04 | Tour `SOURCES` and material-screen text refer to the recovered governed branch; current node sources are on pinned main. The embedded README, types and context blob SHAs match the current pinned tree. | Application provenance. | Old branch labels would misstate the current source location if reused. | Retain historical provenance in the ancestor; new provenance uses this source map. No unavailable-source assumption carried forward. |
| D-05 | App's product-derived Picnic Table direction has no defined project module in REF §10 or activated fixture in the current reference-node scope; REF §19.1 requires capture references on a make path. | Governed project-class/rule ownership; App defines the proposed experience. | A product-only configuration cannot be asserted to be a valid WorkPacket or eligible simulation by analogy to shelving. | Park R-01 below; do not invent observations, a new gate, or a capture exemption. |

## APP-BLOCKING ITEMS

None that must be settled **before the next bounded application-planning pass**. Ownership and current stops are identifiable. That pass may plan candidate configuration and display behavior while explicitly retaining the unresolved items below.

This does not mean that arbitrary User 1 inputs, the Picnic Table, new entry handoffs, Store commerce or remote simulation are ready for implementation or authorization.

## NON-BLOCKING UNRESOLVED ITEMS

Red items are parked; none is silently decided here.

| ID | Exact question and directly checked sources | Owning layer / next decision owner | Why unresolved and application consequence | Blocks next planning pass? |
| --- | --- | --- | --- | --- |
| R-01 | What governed evidence, class rules and gates would support a product-derived Picnic Table make path, including load/structural and hardware requirements? App §§8–9, 19–21; REF §§10–13, 19.1; reference-node limitations. | Governed domain/rule owner, with App planner defining the bounded proposal and appropriate engineering review where needed. | Existing modules are shelving and window seat; no Picnic Table fixture or capture disposition exists. Plan parameter/part consequences without declaring a governed make path or structural adequacy. | No; blocks activation and any claimed governed Picnic Table execution. |
| R-02 | How will a later application invoke the current runtime without treating JSON authorization as transportable authority, and what permits changed configurations? Current simulation-authority note; reference-node README; App §4.4. | Governed runtime/authority owner; App integration planner. | Current proof and adapter capability are process-local, one-use and short-lived; the node only hands off the exact sheet fixture. Deployment/invocation contract and widened fixture authority are not supplied. Do not design a new issuer or replay exports. | No; must be resolved before the affected integration or wider simulation. |
| R-03 | Which Store query/response contracts will be deliberately adopted for the first app, and how will they relate to existing reference-node records? Store Zero §§8–11, 21–24; Store README development rule; reference-node types; Cell §10. | Store owner, with App planner. | Store has documentation, not an adopted app API. Cell call families are candidate; similarly named Store and reference-node concepts are not automatically interchangeable. Plan the smallest question set; leave unsupported commerce, pricing and writes unavailable. | No; blocks claiming a working Store integration until specified and authorized. |
| R-04 | What exact deployed operation envelope and local configuration would support angled cuts, drilling, milling or contour work for future classes? App §17; Store Zero §18; Job 001 §§3, 21; Cell §§7–8, 15 and Appendix E. | Store capability owner and Cell/controls/commissioning owners. | No commissioned machine is established; miter/compound correspondence, S-001 and named candidate audit objects do not establish installed capability. Envelopes, sensing, tolerances, workholding and interlocks remain unresolved. Geometry alone cannot mark a class buildable. | No; blocks capability claims, construction/commissioning and physical execution. |

Further bounded planning work, without treating it as a semantic defect: select the minimum reusable class abstraction, native rendering scope, future evidence-adapter seams and durable part identity required by the two reference classes. Do not freeze a generalized schema here. Pricing remains absent unless an authoritative or explicitly identified fixture source is supplied. Capture verification, structural adequacy and installation remain unresolved wherever the current sources say so.

## PRIOR WORK TO PRESERVE

- **Recovered tour:** common landing; NEW USER orientation; user/system responsibilities; visible stop reasons; returning/professional planned explanations; persistent `NO BLOOD ON WOOD`; inspectable declarations, units, provenance and unresolved conditions.
- **Recovered tour implementation patterns:** `change()` / `val()` invalidate confirmation and candidate output; `canonical()` separates fixture selection from matching manual numbers; `checks()` exposes missing units, unavailable/incompatible material and wrong-machine negatives; `recordNeed()` retains unsupported demand; `reset()` clears local state; file hashing is explicitly metadata/identity only; print/export and self-check visibility are useful patterns. These are source-inspected behaviors, not a claim that tests ran in Pass 1.
- **Public experience:** staged progression, persistent progress display, bounded parameter controls, visual geometry feedback, visible BOM consequences, review tables and part/assembly relationship presentation. Preserve their interaction purpose; reconnect meaning and results to the proper owners in a later build.
- New application UI, identifiers, fixtures, comments, tests, filenames and exports use **User 1**. Historical source paths and provenance retain their original names.

## PRIOR WORK NOT TO CARRY FORWARD

- `Manufacturing Execution Packet`, patent-as-safety/authorization claims, controller-ready WorkPacket content, direct app-to-machine implications, and bypass of Store translation or commissioned lowering.
- Public `computePacket()` inventory/cycle-time/price heuristics as authoritative Store facts; its `isBuildable()` rules as governed gates; unrestricted `nextStep()` / `jumpToStep()` progression as permission to cross a stop.
- Tour hard-coded ranges as engineering limits, local candidate `gateResults` as an executed governed GateResult set, candidate JSON as `stb.packet/0.2` conformance, or its documented fixture illustration as a new simulation event.
- Historical Sarah identity in new application work; historical COLD-only local routing as the current M1 entry contract; synthetic stock/station records as real inventory/equipment.
- Candidate Cell names as adopted records, copied authorization JSON as usable authority, or “no design step” interpreted to prohibit bounded configuration. No open-ended CAD service is authorized.

## FIRST-MACHINE PLANNING STATUS

Adequate for planning when the documented statuses remain explicit:

| Capability description | Current meaning |
| --- | --- |
| Anticipated first-machine family in App §17 | Planning expectation: a useful bounded subset; full compound-miter is not assumed. |
| Store Zero original square-crosscut service | Synthetic existing-yard baseline; limits/readiness still require Store declarations. |
| D-001 in Store Job 001 / Cell spine | Synthetic added-machine narrative; corrected Cell wording does not claim installation or commissioning. |
| Current reference-node stations | Declared synthetic fixture capability. Only the exact sheet request can reach current M1 simulation. |
| Commissioned Cell | Required future local machine truth; not established by these documents. |
| Miter/compound, S-001, wider contours and other unsupported operations | Correspondence or planning material pending owning-layer adoption and capability evidence; no inferred pass. |

The job carries part truth; the machine carries cell truth. Store acceptance, `POSITION_VALID`, simulation, a completed-cycle description and a label remain distinct.

## INPUT / RENDERING PLANNING STATUS

Adequate for bounded planning. App §12 and Store Capture §§2, 17–18 support native configurable geometry and future external evidence inputs without requiring general CAD. REF §§12–13 preserve scalar dimensions, named datums, provenance and unverified extracted observations; raw meshes/point clouds are evidence rather than fabrication geometry.

Model-inferred candidates must remain inferred; rendering, parsing or user confirmation cannot perform governed verification. Native derivations remain attributable to inputs and rules, and consequential changes invalidate dependent records/authority. Any makeable component claim still depends on governed resolution and Store supply/capability. No rendering, CAD, PDF or DXF library was selected.

## IMPLEMENTATION READINESS

Document-only scope was checked through branch comparisons and exact-content review. Before this report, the application diff contained only the new source map and changes to the existing App/Cell Markdown files; the Store diff contained only the two Markdown corrections above, with the exact pinned Store merge base. This report is the remaining new file. Runtime code, schemas, adapters, routes, services, controllers and authorization issuers were not changed. No runtime verification suite or historical prototype self-check was run; this is not a new implementation-conformance claim. No merge or branch deletion was performed.

The next single bounded pass should produce an application plan for User 1 Alcove and a deliberately thinner Picnic Table test of shared application structure: minimal shared class responsibilities, native geometry presentation, evidence/Store/runtime boundaries, supported versus stopped paths, and acceptance criteria. Retain R-01–R-04; propose any necessary activation to its owner. Do not begin coding or decide machine engineering in that planning pass.

**NO BLOOD ON WOOD**

`READY_FOR_APP_PLANNING`

The source tree is coherent enough to plan the shortest bounded application through the established owners. This disposition grants neither application implementation nor production execution.
