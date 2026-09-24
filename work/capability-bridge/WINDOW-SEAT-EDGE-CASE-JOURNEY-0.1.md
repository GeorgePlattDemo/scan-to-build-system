# Window-seat edge case — stop, review, revise, preserve

**Status:** candidate experience / architecture bridge  
**Purpose:** preserve the useful window-seat story without promoting a historical demo into current production authority.  
**Current shared definitions/governance:** `GeorgePlattDemo/3d-solutions-program`.  
**Historical governed source:** `GeorgePlattDemo/scan-to-build-governed-reference@18949f163718a937f072f4be3a654bb303e53160`.  
**Historical donor:** the earlier Sarah / alcove-window-seat demonstration retained in the source library.  

**This document is not structural approval, code approval, a commercial offer, production release, machine commissioning, or evidence that a physical cell ran this job.**

## Current implementation boundary

The current candidate application does **not** yet register a live window-seat project class, execute the Project B gate set, route qualified human review, or issue a dual-stream production packet. This document is the ordered experience/architecture bridge that a later implementation may test against.

The current app may demonstrate the common intake pieces that such a project would use — retained source evidence, entered observations, versioned candidate work, mapped project configuration, Review, and owner-record concepts — but it shall not present the historical window-seat outcome as something this build can presently execute.

## Why this example belongs near the front

The simple Board example proves that one bounded requirement can stay attached to its basis. The picnic-table candidate proves that a second project class can reuse a configurator without inventing Store, structural, or machine authority.

The window-seat edge case proves something different and more important: **Scan-to-Build has to know when an ordinary project word changes the questions that must be answered.**

A person can begin with ordinary language — “I want a bench here” or “make this a window seat” — and then add a sketch and a drawing with numbers. The system should preserve all three. It should not silently turn the word `seat` into an engineering conclusion. It should recognize that intended human use activates questions that a shelf does not have: seating load, span/deflection, anchorage, window operation/access, and any applicable human review.

That makes this a useful product demonstration, not an appendix curiosity.

> **The door can be wide because the gate is explicit.**

## The human story, in order

### 1. Start with intent

The owner says what she wants in her own words.

Example: “I want a bench / seat in this window alcove, with storage and shelving around it.”

That statement is preserved as the original declared need. `bench`, `seat`, `storage`, and `shelving` are useful signals. They are **not** permission for software to invent dimensions, load assumptions, a product class, or a buildable design.

**Record:** original intent, actor, time, source, and any later correction.  
**Authority created:** none beyond the owner saying what she wants.

### 2. Keep the sketch

The owner supplies a sketch or photograph. Keep the original source.

The sketch may help identify features or questions, but viewing or interpreting it does not make its geometry controlling. Anything extracted from it is recorded separately with provenance and uncertainty.

**Record:** original sketch/photo plus any explicit observations derived from it.  
**Authority created:** none merely because software or a person read it.

### 3. Add the drawing with numbers

A drawing arrives with dimensions. Preserve the drawing exactly as received. Record issuer, author when known, date/revision, scale or document type when known, extraction method, and the individual dimensions that are actually taken from it.

A number on a drawing is evidence. It is not automatically an as-built measurement and it is not automatically verified at the site.

**Record:** drawing revision, extracted/entered observations, units, source locations, and verification status.  
**Authority created:** none beyond the stated observation status.

### 4. Let use change the questions — not the owner’s words

Once intended human seating is part of the candidate, the seating family becomes relevant. The historical Governed Reference Project B model requires more than opening geometry. It activates, as applicable:

- human seating load;
- seat span / deflection;
- substrate and anchorage;
- window operation;
- window access / egress review trigger;
- conditional glazing, HVAC, electrical or other observed obstructions;
- shelf-span questions where shelving is also present.

The owner’s original words remain intact. A class or configuration hypothesis may be accepted, rejected, or revised without rewriting the original declaration.

### 5. Configure only from known inputs

The candidate can now show what it believes the configuration is, which inputs support it, which dimensions are derived, and what remains unknown.

Observed site constraints and owner-selected configuration parameters stay separate. Hidden fit allowances are not acceptable. A derived envelope is labeled as derived.

**Rule:** source → observation → candidate configuration is a traceable chain. No hop silently becomes more authoritative than its basis.

### 6. Run the gates and allow a real STOP

This is where the window-seat example earns its place.

The gate runner does not ask, “Can we make the screen green?” It asks which required conditions are passed, failed, unresolved, or inapplicable for this exact version.

Important Project B gates include:

- `G-GEOM-COMPLETE` — are the required geometric observations present with units?
- `G-CAPTURE-VERIFY` / `G-OBS-CONFLICT` — are required observations verified, and are conflicting observations exposed rather than silently resolved?
- `G-SPAN-SEAT` — is there an applicable seat span / deflection basis?
- `G-LOAD-SEAT` — is the seating load path present when seating is required?
- `G-ANCHOR` — is the substrate known well enough for the intended fastening method?
- `G-WIN-OP` — does the configured work preserve the required window operation?
- `G-EGRESS` — does the configured seat envelope intersect the fixture-declared window access zone?
- `G-AUTH-TYPE` — is the person closing a review condition actually authorized for that condition?
- `G-I0` — if a safety-relevant condition is failed or unresolved, the aggregate gate does not pass by default.

A refusal is not lost work. It is a durable result attached to the exact project version.

### 7. The edge case stops where it should

The governed `FIX.B-SEAT-STOP.v1` fixture deliberately demonstrates a configured seat envelope that intersects the declared window access zone. The controlling result is `EGRESS_REVIEW_REQUIRED`.

In ordinary language:

**The first version gets far enough to reveal a real concern, and then it stops.**

It does not say “code violation.” It does not say the declared zone is legally required in every jurisdiction. It does not invent code compliance. It records that this configuration needs the appropriate review before the make path may continue.

The stop remains in history even if the project is later revised.

### 8. Route the question to the right human

A generic admin cannot clear the concern.

The current governed authority model separates owner, verifier, applicability reviewer, design approver, capability holder, operator, cell steward, installer, and licensed/regulated authority where a real license or jurisdiction requires one.

Human review is therefore not a magic `APPROVE` button. The review record should say:

- what exact question was reviewed;
- which project/configuration version was reviewed;
- what evidence the reviewer relied on;
- the reviewer’s authority type and, where applicable, the real credential/jurisdiction basis;
- the result and limitations;
- which unresolved conditions remain;
- which later gates must rerun if the configuration changes.

No person is allowed to clear a gate outside that person’s recorded authority merely because the project needs to move forward.

### 9. Change the project instead of changing the answer

If the configuration causes the problem, revise the configuration.

The governed PASS fixture requires a **new configuration version** and a new `ConfiguredSeatEnvelope`. The prior stopped version is not overwritten. In the synthetic fixture, the revised envelope no longer intersects the same declared window access zone.

That gives the public story a very simple sentence:

> **The first version stopped for a reason. The revised version did not erase the stop. It answered it.**

### 10. Re-run the dependent gates

A changed configuration does not inherit the earlier gate result.

The affected geometry, seating, anchorage, window/access, material, capability, packet, and authorization checks run again against the new version as required. The governed plan specifically says the Project B PASS fixture cannot be treated as complete until the seat-load / seat-span / anchorage blocker (`BLK-U07`) is closed.

A non-intersecting fixture envelope proves only **no fixture-declared intersection**. It is not a general code-compliance finding.

### 11. Only then move toward capability and execution

This is the point where the historical demonstration and the current governed system must be kept visibly separate.

The historical Sarah demonstration portrayed the resolved alcove/window-seat definition as a dual-stream fabrication package for dimensional and sheet work. That is a valuable **story and capability donor**: it shows why a mixed job can be decomposed into bounded work while preserving one project identity.

The historical governed v0.2 reference is deliberately stricter. It is simulation-only and does **not** make production `execution_authorized` reachable. A current project must not be described as physically approved, production released, machine ready, or run merely because the old demonstration depicted a dual-stream packet.

The future full chain remains:

**confirmed definition → Store/capability resolution → commercial conditions → production release → machine/cell admission → local readiness → local Cycle Start → physical execution → inspection → staging/handoff → owner record**

Each arrow keeps its own authority.

### 12. Preserve the outcome — including the stops

The owner record should make the complete chronology inspectable:

**intent → sketch → drawing → observations → candidate configuration → gate results → refusal/STOP → human review → revised configuration → rerun gates → later Store/capability/commercial/release/execution/inspection evidence if those events actually occur**

Missing later events stay missing. Historical/demo execution must not be rewritten as a present physical outcome.

## The replacement-component payoff

A durable record becomes useful long after the original project is finished.

If a seat component is damaged years later, the useful question is not “Can somebody measure the broken board and make something close?” The record can identify the exact component occurrence and the definition revision that produced it, along with the material identity actually used, its dimensions/features, the project version it belonged to, the inspection/outcome evidence, and any later supersession.

A replacement request can therefore begin from the preserved component basis rather than from a new guess.

That still does **not** mean “press reprint.” Current material availability, Store capability, safety, applicable rules, and production authority must be evaluated again. A material may no longer exist; a machine envelope may have changed; a rule may have changed; the owner may want a different finish.

The durable-record promise is stronger and more honest:

> **Years later, replacement can start from the exact component record — not from somebody re-measuring the broken part and guessing.**

And:

> **Reproducible definition is not automatic authorization. The current gates still run.**

## What the public demonstration should show

This edge case should be a featured guided example rather than a buried appendix. A cold reader should be able to follow four visible moments:

**WHAT SHE WANTED**  
intent + sketch + drawing with numbers

**WHY IT STOPPED**  
seating use activated additional questions; the first configuration hit a declared access conflict and required human review

**WHAT CHANGED**  
a new configuration version answered the identified conflict; the old stopped version remained in the record; dependent gates reran

**WHAT THE RECORD KEPT**  
source evidence, versions, gate results, human review, changed geometry, and — only where actually supported — later capability/execution/outcome evidence

A technical reviewer can open the detailed gate and provenance records. The first explanation should remain understandable without reading the schemas.

## Sanitizing-pass invariants

A later language/presentation pass may simplify labels and remove architecture jargon, but it shall not collapse:

- intent, sketch, drawing, observations, and controlling definition into one thing;
- `seat` as intended use into structural approval;
- STOP into an error to hide;
- human review into generic approval;
- revised configuration into overwrite of the refused version;
- no fixture-declared intersection into code compliance;
- historical dual-stream demonstration into current production authority;
- reproducible replacement basis into automatic fabrication authorization.

The simple public meaning to preserve is:

**We keep what you gave us. We show what it means and what is still unknown. We stop when a real question is unresolved. The right person can review the right question. A change creates a new version. The gates run again. The record remembers the whole chain.**

**NO BLOOD ON WOOD.**
