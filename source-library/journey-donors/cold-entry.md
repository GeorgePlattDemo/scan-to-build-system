# COLD entry

**entryContext:** `COLD`  
**Status:** controlling for this repository. Informative to M1 (COLD is not the M1 fixture path).  
**Actor:** first-time user with an idea or need. No holder-controlled project yet.

This path exists so a person can find out whether Scan-to-Build can even consider their need. It is not a general-purpose custom design service. If the visit would only work by inventing joinery, proportion, finish, or a one-off millwork piece, the path must refuse.

## Actor

A first-time visitor. They may be a homeowner, a renter with no authority, or someone browsing for a later project. They have not been identified as a returning holder. They have no contractor job in hand.

Competency assumed: none. The path must explain itself before it asks for dimensions.

## Opening condition

No existing `ProjectInstance`. No prior `OutcomeRecord`. No store relationship. The visitor has a purpose (“a shelf in this alcove”, “something for this wall”) and little else.

## Information already available

- Public explanation of what Scan-to-Build is and is not.
- The published set of bounded project classes (orientation set below).
- Declared limitations of the virtual store test module (no live stock, no price, simulation only).
- Standing safety rule: No Blood on Wood. No live machine motion.

Nothing about the visitor’s home is available. Nothing may be inferred from the device, location, or browsing.

## Information the actor must provide

| Field | Why |
| --- | --- |
| Declared need in their own language | Becomes a `DeclaredRecord` in the core. This package does not redefine that object. |
| Permission for disclosed use of what they type or upload | Holder-controlled from the first write. Withdrawal must be possible. |
| Selected project class | Bounds the request. Selection is not design. |
| Measurements for that class, with unit | Become `Observation` records. Dimensional results require a unit. |
| Requested material class and stock form | Become a `MaterialSpec` (class and form, not SKU). |
| Optional quantity | Silence or zero does not confer accept. |

They do not provide a CAD model, a joinery choice, or a finish recipe. Asking for those is a smell that the path has left COLD.

## Allowed records

Conceptual front-door records that hand off to activated or defined core objects:

| Front-door fact | Governed object (do not redefine) | Activation |
| --- | --- | --- |
| Stated need | `DeclaredRecord` | M1 schema exists |
| New project | `ProjectInstance` | M1 schema exists |
| Measurement | `Observation` | M1 schema exists |
| Material class + form | `MaterialSpec` | M1 schema exists, narrowly active |
| Bounded request | `WorkPacket` (draft) | M1 schema exists; does not authorize motion |
| Evaluation | `GateResult`, node `JobEvaluationResult` | M1 / reference-node |
| Simulated run | `SimulationAuthorization`, then `OutcomeRecord` | M1; simulation only |

COLD may create a local draft so the visitor is not forced to open an account. A local draft is not a holder identity system. It is not M1 identity.

## Unavailable assumptions

- That the visitor owns the wall.
- That the opening is square, plumb, or load-bearing as hoped.
- That a material class is in stock.
- That a named wood (oak, cherry, maple) can be substituted if unavailable.
- That phone photos are measurements.
- That this is furniture design.
- That a successful simulation is a cut ticket.
- That structural span has been evaluated. On the shelf class it remains `STRUCTURAL_SPAN_NOT_EVALUATED` unless a later rule exists.

## First user-facing action

**Orient, then declare.** Before parameters, the visitor must be able to read:

**This is.** A way to declare a bounded component — a published class, your measurements, a material class — and to learn whether a simulated yard can consider it.

**This is not.** Custom furniture. Nobody here picks joinery, proportion, or finish as a design service. A request outside the envelope is refused by name. That refusal is the boundary working.

**You own** the declared need, the numbers, and the material class.

**Simulation only.** No sale, reservation, or live machine. No Blood on Wood is in force.

**Privacy.** What you supply is user-provided information under your permission. There is no covert profile. Save-draft, if offered, stays on the device unless you later become a holder with an explicit record.

Only after that orientation: **Start**. Starting writes a `DeclaredRecord` (or a conceptual draft that will become one) with kind `interest` or `intent` as the visitor chooses. It does not write a `WorkPacket`.

## Possible next actions

1. Choose a published class.
2. Enter parameters and units. No silent unit conversion.
3. Choose a material class and stock form.
4. Review what the system can determine versus what remains unresolved.
5. Submit to the common core.
6. Receive INFORM, DEFER, or REFUSE.
7. If sealed accept on a simulation-eligible sheet path, request simulation.
8. Export an `OutcomeRecord` if one exists.
9. Stop. Abandon is a valid terminal.
10. Visit the in-store channel for clarification (see [in-store-channel.md](../architecture/in-store-channel.md)).

There is no “keep designing until it works” loop that mutates class, size, or species behind the visitor’s back.

## Bounded project classes (orientation set)

Selecting a class does not select a machine.

| Class | Stock form | What the user is declaring | What they are not declaring |
| --- | --- | --- | --- |
| `interior.fit_to_opening.shelving` | sheet | Fit-to-opening shelf blanks | Cabinetry, adjustable hardware design, structural adequacy |
| `interior.cleat.blocking` | dimensional | Cleat / blocking from dimensional stock | Framing engineering, hanging systems as a product |
| `interior.panel.blank` | sheet | A rectangular panel blank | Shaped parts, furniture panels as a collection |

Unknown class → REFUSE `PROJECT_CLASS_UNSUPPORTED`. Do not open a blank CAD canvas.

## What the system can determine

- Whether the declared class is in the node’s consideration set.
- Whether required observations with units are present.
- Whether the requested form matches a declared offering form.
- Whether requested dimensions exceed a current simulated stock statement or a station envelope.
- Whether requested operations are on the assigned family’s allowlist.
- Whether mixed form has been requested.
- Whether the command is a live-motion command (always refuse).

## What remains unresolved on a correct COLD visit

- Structural span / deflection (`STRUCTURAL_SPAN_NOT_EVALUATED` on the shelf class).
- Capture verification, unless a later gate says otherwise.
- Dimensional M1 envelope (not activated).
- Price, lead time, first-fit, code compliance, safe installation.
- Whether the visitor has authority over the place (COLD does not prove ownership).

A COLD path that hides these unresolved items has failed.

## Handoff to the common core

COLD → same sequence as every path:

declared need → `ProjectInstance` → observations → `MaterialSpec` → draft `WorkPacket` → store evaluation → gates → INFORM / DEFER / REFUSE → optional simulation → `OutcomeRecord`.

See [entry-to-store-handoff.md](../architecture/entry-to-store-handoff.md).

Entry context must be recorded as `COLD`. It does not bypass provenance, verification, consent, gate, packet, or authorization requirements.

## Store interaction

The visitor sees **declared** offerings and limitations, clearly labeled simulated. A `MaterialAvailabilityCard`-style notice, if shown, is informative. It never gates. FIA or any forest-sector volume figure is not supply.

Unavailable hardwood: named DEFER or REFUSE. No invented alternative.

## Machine-capability interaction

Sheet class → sheet-stock family only. Dimensional class → dimensional-stock family only. Mixed → `MIXED_FORM_NOT_SUPPORTED`.

Dimensional jobs may be understandable and still stop at `DIMENSIONAL_M1_ENVELOPE_NOT_ACTIVATED`. That is a correct outcome, not a defect in the front door.

## INFORM / DEFER / REFUSE

| Outcome | Conditions (COLD) |
| --- | --- |
| INFORM | Visitor has not yet selected a class; measurements missing; they asked “what is this?”; they need the not-furniture explanation; they should visit in-store for matching; price was requested (price is not offered). |
| DEFER | Handled class but stock evidence missing or stale; quantity requested without quantity evidence; dimensional envelope not activated; capture present but verification unresolved and the packet is not being released to production. |
| REFUSE | Custom furniture / open design; unsupported class; unsupported material class; form mismatch; envelope exceeded; mixed form; live-motion or “send to machine”; unit missing on a dimensional result; silent conversion requested; visitor asks the system to certify structure or code. |

## Demand as architecture (COLD interactions)

| Interaction | Stated need | Class | Requested | Supplied | Still missing | Stop | Outcome | Learnable later | Must not retain without a rule |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Welcome | Unknown | None | Orientation | Attention | Need, class, numbers | After explanation | INFORM | That first-time users need the not-furniture sentence | Device fingerprint as identity |
| Class pick | “A shelf” | shelving | Class | Class | Opening dimensions | If they pick “custom cabinet” | REFUSE or INFORM | Demand for unpublished classes | Inferred taste profile |
| Parameters | Fit this opening | shelving | L/W/D + unit | Numbers or skip | Any omitted dimension | Missing unit | INFORM / REFUSE | Common omitted fields | Background location |
| Material | “Cherry shelves” | shelving | Material class | Cherry + sheet | Stock statement | Cherry unavailable | REFUSE or DEFER | Recurring unavailable class | Substitution without asking |
| Submit | Make-path intent | shelving | Evaluation | Complete or not | Unresolved list | Envelope / mixed / live | per gates | Refusal codes that confuse | Covert retry tracking |
| Simulate | See a simulated outcome | shelving | Simulation | Sealed accept | Dimensional path | I0, forged JSON | REFUSE live; FORGED_AUTHORIZATION on pasted JSON | Handle-expiry confusion | Copied auth as if it were a credential |

## Unresolved information

Always visible: the unresolved list on the packet and on any `OutcomeRecord`. COLD must not “clean up” the screen by dropping `STRUCTURAL_SPAN_NOT_EVALUATED`.

## Owner of the next action

| Stop | Next-action owner |
| --- | --- |
| Missing class or numbers | Visitor |
| Missing unit | Visitor |
| Stale or missing stock statement | Store test-module (simulated) |
| Dimensional envelope not activated | Governed-reference maintainers |
| Authority over the place unknown | Visitor; may become PLACE later, or in-store |
| Live cut requested | Nobody. REFUSE. |

## What is recorded for future improvement

With permission: declared need text, selected class, missing-field codes, INFORM/DEFER/REFUSE code, unresolved codes. These are recorded inquiries.

## What is explicitly not recorded

- Keystrokes that never became a declared need.
- “Customers like you.”
- Inferred household size, income, or furniture style.
- Exact GPS of the phone.
- Cross-session identity without an explicit holder record.
- Aggregated demand as a public statistic.

An improvement registry is a future mechanism. Do not activate it here.

## Acceptance sketch (documentation, not a runtime test)

A first-time user reads that this is not furniture, picks the shelf class, enters three dimensions with units, picks a synthetic sheet material class, submits, sees a named refusal or a simulated outcome, can export JSON if an outcome exists, and is never asked to design joinery. No account is required for that sketch.
