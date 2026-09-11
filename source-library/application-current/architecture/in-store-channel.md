# In-store channel

**Status:** controlling for this repository.  
**Runtime:** candidate channel, not implemented in this pass.  
**Rule:** extra capability is allowed; a bypass is not.

The virtual store may support an assisted in-store channel that the three remote entry paths do not have. A person at the yard, with staff present, can capture richer information and get direct clarification. That person still enters the same governed core.

## Why the channel exists

Remote COLD, PLACE, and CONTRACTOR paths are information-poor by design. They collect a declared need, a bounded class, and whatever the actor can supply from a phone, a tape, or a file. They cannot honestly claim color match, species confirmation against rack stock, or a staff-witnessed measurement.

The in-store channel exists so those gaps can be closed **in the presence of the stock and the staff**, not so the store can skip gates because someone walked in.

This channel is **consistent with** the patent disclosures’ retail-footprint setting: capture and confirmation happen where the material already sits. This package does not claim that any in-store implementation practices those claims.

## Actor

| Role | Who | Authority in this channel |
| --- | --- | --- |
| Visitor | Homeowner, project owner, or contractor physically present | Declares need, presents or withholds holder records, consents to disclosed use |
| Staff assistant | Yard or cell steward, not a CAD author | Helps capture, clarifies class and stock form, confirms what is on the rack as a declared observation, cannot close a safety gate |
| Holder of record | The person who controls the home or project record | Remains the holder. Staff do not become the holder by assisting. |
| Operator | Named only if a later production cell exists | Out of scope. Simulation only. |

Staff assistance is a competency, not an override. Missing competency is recorded. It does not become implied authority.

## What this channel may do that remote paths may not

| Capability | Remote paths | In-store |
| --- | --- | --- |
| Staff-assisted class selection | Self-serve from published classes | Staff may explain the bounded class and refuse open design in person |
| Richer scanning | Phone photo or typed dimensions | Candidate: staff-guided scan, repeat measurements, opening photographs bound to a feature of interest |
| Color or material matching | Material class only; no match claim | Candidate: visual match against declared rack stock, recorded as an observation with procedure and limitation |
| Direct clarification | Static INFORM text | Spoken explanation that must still land as structured fields |
| Witnessed measurement | Actor-asserted | Staff-attested procedure; still not automatic verification |
| Seeing the actual board or sheet | Not available | May observe declared stock; may not treat that sighting as a reservation |

Every one of those extras writes **user-provided or staff-provided information** with provenance. None of them writes eligibility.

## Same core, no bypass

The in-store channel is an **entry context overlay**, not a fourth governed core.

```
IN_STORE capture / clarification
        │
        ▼
same objects: DeclaredRecord, Observation, ProjectInstance,
MaterialSpec, WorkPacket
        │
        ▼
same store evaluation and same M1 gates
        │
        ▼
INFORM / DEFER / REFUSE
        │
        ▼
SimulationAuthorization only from the actual GateResult set
```

Non-bypass rules:

1. Staff cannot mark a gate passed.
2. Staff cannot issue `SimulationAuthorization` or any production authority.
3. Staff cannot silently substitute species, grade, thickness, width, or machine family.
4. A richer scan is an `Observation` (or a candidate capture set). It is not a closed `G-CAPTURE-VERIFY` unless the governed rule says so. In M1, verification may remain unresolved.
5. Color match is a recorded observation with a limitation. It is not a finish specification, a stain formula, or a durability claim.
6. “The board is right there” is not stock availability in the governed sense until a current `StockSnapshot` (or its conceptual equivalent) says so.
7. Live demonstration of a physical saw is out of scope. I0 remains in force on the floor and in software: no software command initiates machine motion.

If a staff member would have to “just cut it” to finish the visit, the software path is REFUSE or DEFER. The channel has done its job.

## Opening condition

A visitor is physically present at the simulated yard. They may arrive:

- cold, with an idea and no record;
- returning, with a holder-controlled project, including a stalled one;
- as a contractor, with a job, a plan sheet, or a takeoff line.

The channel does not reset those identities. A contractor in the store is still CONTRACTOR. A returning homeowner is still PLACE. A first-time walk-in is still COLD, with in-store assistance available.

## Information already available

- Published project classes and their limitations.
- Declared material offerings and stock bands of the test module.
- Declared machine-family capabilities and station envelopes.
- Standing refusal conditions of the node.
- Any holder record the visitor presents and permits.

## Information the actor must provide

- Declared need in owner or contractor language.
- Permission for disclosed use of measurements, photos, and any presented record.
- Which project class is being requested.
- Whether this visit resumes a prior project or starts a new one.
- For PLACE or CONTRACTOR: proof of holder or permitted access. Staff must not open another person’s record because the visitor knows an address.

## Allowed records

Same as the remote paths, plus candidate in-store capture records:

- staff-attested measurement procedure;
- rack-match observation with limitation;
- visit note that is holder-visible.

Staff notes are holder-controlled once accepted. They are not a private yard CRM.

## Unavailable assumptions

- That physical presence implies consent to retain photos.
- That a color match is a chemical or species confirmation.
- That staff opinion is structural review.
- That a board on the rack is reserved.
- That a dimensional family can be used because the sheet machine is busy, or the reverse.
- That an in-store accept is production-ready.

## First user-facing action

Orient: this is bounded components against declared stock, not custom furniture. Then capture the declared need. Do not start by opening a design surface.

## Possible next actions

- Select a published class.
- Resume a presented PLACE or CONTRACTOR record.
- Capture measurements with staff assistance.
- Attempt a material match against declared offerings.
- Submit to the same evaluator.
- Leave with an INFORM, DEFER, or REFUSE outcome and a holder-visible record of the visit.
- Schedule nothing automatically. Notices require express permission.

## Store and machine-capability interaction

Identical to [entry-to-store-handoff.md](entry-to-store-handoff.md). The in-store channel may **display** declared offerings and envelopes more richly. It may not evaluate them by a different rule.

Unavailable hardwood: recorded refusal or deferral. Staff may show what *is* declared. Staff may not invent an equivalent.

Sheet versus dimensional: the stock the visitor is holding in their hands does not change the family. A 1x8 is dimensional stock. A 4x8 panel is sheet stock. Mixing them in one job remains `MIXED_FORM_NOT_SUPPORTED` until a later activation says otherwise.

## INFORM / DEFER / REFUSE

| Outcome | In-store examples |
| --- | --- |
| INFORM | Explain what a bounded class is; list missing measurements; explain why a color match is not a species certificate; point to a remote resume of a PLACE project. |
| DEFER | Class is handled but the current stock statement is missing or stale; dimensional envelope is not activated; capture is present but not yet verified; owner permission for a contractor job is incomplete. |
| REFUSE | Open custom design; live-motion request; unsupported class; unavailable material with no declared alternative requested by the visitor; envelope exceeded; mixed form; another holder’s record; structural or code opinion requested as if the system could give one. |

## Unresolved information

Typical unresolved items after an in-store visit:

- `STRUCTURAL_SPAN_NOT_EVALUATED`
- capture not yet verified
- dimensional M1 envelope not activated
- stock snapshot stale
- owner permission incomplete on a contractor-brought job
- color-match limitation (match is visual only)

Unresolved items stay on the record. They are not hidden because staff “looked at it.”

## Owner of the next action

| Situation | Next-action owner |
| --- | --- |
| Missing measurement the visitor can still take | Visitor, optionally with staff |
| Missing owner permission | Holder, not the contractor and not staff |
| Stale stock statement | Store test-module operator (simulated); not the visitor |
| Dimensional envelope not activated | Governed-reference maintainers; not this front door |
| Visitor wants a cut today | Nobody in this system. REFUSE live fabrication. |

## Recorded for future improvement

With permission, a visit may record:

- the declared need;
- the class requested;
- missing fields;
- refusal or deferral codes;
- that staff assistance was used;
- that a visual match was attempted and limited.

## Explicitly not recorded

- Casual browsing of the rack with no declared need.
- Staff side comments about the visitor.
- Continuous in-store camera streams.
- Other visitors’ projects.
- Payment card data.
- Any aggregate “people who asked for cherry then bought pine” profile.

An improvement registry remains a future mechanism with separate ownership, permission, retention, and suppression rules. Do not activate it here.

## Stopping rule

If the in-store channel would require a different evaluator, a staff override flag, a live saw, or a silent material swap to be useful, stop. The channel is then trying to be a bypass, and it is out of bounds.
