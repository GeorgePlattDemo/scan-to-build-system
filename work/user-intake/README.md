# User Intake Work Surface

**Status:** stable post-app working surface  
**Owner:** Application  
**Current downstream Store pin:** `c51f5f27af9a77bc7581c5d42c56f0a1ed0b650a`

This folder is the working bucket for the demand side of Scan-to-Build: how a person brings what they know into the application and reaches an attributable project definition.

It is derived from the useful locked principles in `STB-ENTRY-INTAKE-CONTRACT-0.1.md`, reconciled with the later accepted application and semantic-boundary cleanup. The historical contract itself is retained by exact source pointer because its embedded Store pin predates the Store pin consumed by the accepted app.

## Intake chain

```text
whatever information the person already has
        ↓
bounded intake method
        ↓
retained source evidence
        ↓
attributable observations
        ↓
visible candidate representation
        ↓
user review / correction / unresolved state
        ↓
project revision
```

A parser, renderer, scan, photograph, drawing, PDF, takeoff, model, hash, or recognized dimension is evidence-processing. None is an authority promotion.

## Front door

Three user-facing starts rejoin one application:

- **NEW USER**
- **RETURNING USER**
- **PROFESSIONAL**

They are orientation/routing views, not separate engines or truth models.

## Page 1 working rule

Two ways forward:

1. a pre-mapped bounded project/class when one actually exists; or
2. **Start Your Own Project** — bring what you already have.

Start Your Own is not unrestricted CAD, a general furniture-design service, or a chatbot-mediated definition path.

## Intake hub

The stable intake bucket recognizes these functional paths:

- PICK A BOARD
- MEASUREMENTS
- SCAN A SPACE
- SKETCH / PHOTO
- DRAWING / PDF
- TAKEOFF / CUT LIST
- CAD / BIM / STRUCTURED FILE

Current accepted app behavior controls which are active versus planned. A card name does not imply that its adapter exists.

All paths converge into the same evidence/observation/project-definition architecture.

## Current accepted behavior

At the accepted application pin, active intake includes:

- PICK A BOARD;
- MEASUREMENTS;
- SKETCH / PHOTO;
- DRAWING / PDF;
- TAKEOFF / CUT LIST.

SCAN A SPACE and CAD / BIM / STRUCTURED FILE remain planned.

The current app retains original evidence, supports bounded source viewing, records observations separately from files, and preserves correction history. Viewing or selecting a source does not create an observation automatically.

## Off-the-shelf adapter rule

Use commodity tools to acquire, parse, or display commodity formats where appropriate. Scan-to-Build owns the boundary that turns source evidence into attributable observations and bounded project definition.

Useful existing candidate classes identified in prior current planning include browser forms, native image/SVG display, PDF.js, three.js, maintained DXF parsers, That Open `web-ifc`, Apple RoomPlan, ARCore Depth, Autodesk Platform Services, Procore, and Bluebeam Studio.

These are candidates or future adapters, not present-tense dependencies unless the accepted application actually contains them.

No adapter owns verification, Store material identity, capability, price, governed authority, or fabrication instructions.

## No chatbot on the definition path

A conversational assistant may later explain an existing field, unresolved state, refusal, or available intake method.

It must not independently establish dimensions, site geometry, material identity, configuration, Store inventory, price, capability, authorization, safety state, or fabrication instructions.

## Current protected distinctions

- evidence ≠ observation;
- observation ≠ verification;
- rendered geometry ≠ fabrication truth;
- recognized text ≠ controlling dimension;
- user review ≠ commercial submission;
- user review ≠ governed authorization;
- Store answer ≠ project authority;
- successful import ≠ capability;
- hash ≠ authenticity or calibration.

## User 1

New post-baseline work uses **User 1** rather than the historical Sarah persona.

Sarah remains a donor/prototype source only. No missing current requirement is to be filled from Sarah by default.

## Sources

Primary current sources are indexed in `../../docs/application/CONTROLLING-SOURCE-POINTERS.md`.

Most relevant:

- accepted application README and implementation at `4595b4785a2686486e477ce2e70fb3f476285a8d`;
- `STB-SEMANTIC-BOUNDARIES-0.1.md` at that accepted app pin;
- frozen application roadmap at `985db87a707bd454d7c58419e2cf4d884f00cded`;
- entry/intake contract at `2d80b5a7b0e7687c425e100bfa0ff3a833166d42`, **ADMIT AFTER REWRITE** because its embedded Store pin is stale relative to the accepted app.

**NO BLOOD ON WOOD.**
