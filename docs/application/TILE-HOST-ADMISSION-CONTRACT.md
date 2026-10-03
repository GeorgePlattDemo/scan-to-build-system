# Tile/host and definition/Store admission contract

**Owner:** System. **Status:** in use for every tile: Start your own, Playhouse, Window Seat, Alcove and Outdoor. The shared tile host in `apps/stb/public-build/system-build-current.html` loads the deployed copy (`apps/stb/public-build/shared/`, byte for byte) and draws each one's nav from its validated `STB-TILE-HOST-0.1` message; their Store inquiries go through `admit()` then `inquire()`. Window Seat runs in its own frame: its page loads the same deployed copy, posts `{ type: 'STB_TILE_HOST', message }` from that frame, and the host asks it for a trail target (Idea, a step, or a declared fork option) with `STB_TILE_HOST_GO`. Outdoor runs in its own frame the same way (no Idea intake yet, so it opens on Intent); its page asks the Store through `admit()` then `inquire()` in its profile's two scopes, `OUTDOOR_OPTIONS` (the "From" and option prices, never the terms flow) and `OUTDOOR_COMMITTED` (this exact table). Alcove's page lives in the base build (`system-build-base-8d8a9dd.html`): it loads the same deployed copy and sends every inquiry through `admit()` then `inquire()`, with `stb-alcove-store-bridge.js` as the transport inside `inquire()`; Alcove's tile code in the shell builds its message from that admission, the fresh answer and the terms flow's gates. Start your own's page is the shell's Start your own page (its Intent and bench screens, in `three-frames.html`) and its proof pages: its tile code in the shell admits the bench's revision on every change and, on confirm, asks the Store through `admit()` then `inquire()`, with `stb-user-defined-board-runtime-bridge.js` as the transport inside `inquire()`; it builds its message the same way Alcove's does (no Idea intake yet, so it opens on Intent).
**Executable half:** [`apps/stb/shared/tile-host-admission-contract.mjs`](../../apps/stb/shared/tile-host-admission-contract.mjs).
**Check:** [`apps/stb/test/trail/tile-host-admission-contract.test.mjs`](../../apps/stb/test/trail/tile-host-admission-contract.test.mjs), beside the trail tests; current authority on the five tiles against the pinned Store: [`apps/stb/test/integration/answer-authority.test.mjs`](../../apps/stb/test/integration/answer-authority.test.mjs).
Terms used here (job-definition revision, Store inquiry, admissible, The Store answers) are defined once in [definitions](../definitions/README.md).

Two interfaces. They are separate: neither reads the other's data.

## 1. Tile → host (`STB-TILE-HOST-0.1`)

What a tile tells the shell it is embedded in. Exactly these fields, and no others:

| Field | Meaning |
|---|---|
| `interface` | `STB-TILE-HOST-0.1` |
| `tileId` | A tile declared in `stb-trail-contract.js` |
| `stage` | `Idea` or one of the six trail steps |
| `usableSteps` | The steps this tile can use now, in trail order. The current step, if any, is one of them |
| `navigationRequest` | `null` or `{ target }`: `Idea`, `Project Library`, or a usable step. A request for an inert step is invalid |
| `presentationFork` | Optional. Only where the trail contract declares a fork, only on that line. Today: Window Seat, Idea line, `Intent` or `One full scroll`. Presentation only |

The host draws one nav line from it: inert steps disabled, never hidden and never a silent no-op.

**A usable step does not authorize a Store inquiry.** The message carries no definition, request or admission evidence (any such field makes it invalid), and interface 2 takes no tile-host input.

## 2. Definition → Store (`STB-DEFINITION-STORE-0.1`)

From one job-definition revision and one inquiry scope:

| Field | Meaning |
|---|---|
| `definitionRevisionId` | The revision being asked about |
| `inquiryScope` | A scope the tile's admission profile declares (for example `OUTDOOR_OPTIONS` or `OUTDOOR_COMMITTED`) |
| `admission` | `{ result: ADMITTED | BLOCKED, reason, blocking[] }`. Each blocking entry names the fact and its owner (`USER`, `PROJECT`, `RULE`, …) |
| `request` | Only when admitted: request type, scope, revision id, profile version, the scope's declared facts, and open Store-owned demands |

Rules:

- **Admission checks what the profile declares.** Each tile has an admission profile: per inquiry scope, the required facts and their owners. Admission reads those requirements against the revision. Rows or facts a tile happened to emit neither add to nor stand in for them. A tile with no profile, or an undeclared scope, fails closed. The 0.1 profiles are the contract shape, not a claim that every row of `admitPublicStoreRequest` has been ported.
- **A missing required fact blocks before Store** and names the owner. Missing, unresolved, candidate and invalid all block. A required fact owned by `STORE` (for example Alcove hardware selection) does not block: it travels as an open demand for Store to resolve.
- **Admission never checks Store capability.** A complete request outside the envelope still reaches Store. The Store's refusal is the result, and Your call stays inert (trail rule 5).
- **The request is bounded.** The job record may hold source material (photos, sketches), earlier retained requests, saved answers and facts outside the scope. The request carries none of them.

## Reopening a job record

Reopening restores history whole: source material, revisions, retained requests and saved Store answers. It then recalculates what is available from the current revision's admission. It does not restore saved usable steps or a saved stage that is no longer usable.

A saved Store answer comes back as history, never as current authority, even when it names the current revision. Your call needs a fresh answer.

## Current authority

A Store answer authorizes nothing unless it is the fresh answer for this exact revision and this inquiry scope. `inquire()` stamps every answer with the `definitionRevisionId` and the `inquiryScope` it answers, and `authority: CURRENT`. `isCurrentAnswer({ admission, answer })` is the one test: the admission of the revision on screen now is admitted, and the answer is `CURRENT` and names that same revision and that same scope. A saved answer (`HISTORY`), an answer for another revision or another scope (for example Outdoor's `OUTDOOR_OPTIONS` answer against `OUTDOOR_COMMITTED`), an answer from before the definition changed, and an answer missing either stamp all fail it. Every tile holds its answer against the revision on its page now, not only the one it last asked about, and gates Your call and its terms flow through this test.

## Available steps

Intent and The bench are always usable. The Store answers is usable when the current revision is admitted. Your call is usable only with an answer `isCurrentAnswer()` accepts for that admission that is inside the envelope; a refusal is current but leaves Your call inert. We cut it and Pick up & build stay with the gates in `stb-terms-flow.js`.

## What this replaces, later

The current admission path is `admitPublicStoreRequest` in `apps/stb/public-build/stb-public-admission.mjs`, called from `sendJob` in `apps/stb/public-build/stb-store-client.js`. Each tile branch builds its own responsibility rows and then takes `requiredIds = rows.map(item => item.id)`, so the `SYSTEM_ADMISSION_COVERAGE_GAP` check compares the rows with themselves and cannot fire. Window Seat and Outdoor blockers come from the tile page's own `conditions()`. That path stays in place until a separate change moves `sendJob` onto this contract. Start your own, Playhouse, Window Seat, Alcove and Outdoor (both its scopes) are off it already: each transport inside `inquire()` calls `sendAdmittedJob`, which sends only the request `admit()` admitted and does not call `admitPublicStoreRequest`.

## Open before adoption

- **Profiles are first declarations,** enough for the contract tests. They are not yet a port of every row in the current path (for example generator consistency). Window Seat's profile (0.3) declares what its page already requires before it asks: overall width, overall height and depth (USER), every defined board, each with an id and a length and width above 0 (PROJECT), every knob added by hand with what it needs, screws included, and every kept ask described (USER; kept asks travel only as a count, never sent). Alcove's profile (0.3) declares what its page already sends with every definition: the unit's width, height and depth fitted to the opening (USER), material, parent responsibilities and component programs (PROJECT), and the pilot spot demand, on or off (USER); hardware selection stays STORE-owned and travels as an open demand. 0.3 checks those facts field by field, only for the fields the page emits: material species and form text and nominal thickness and width above 0; both the upright and shelf parents present, each with operations; every component program with its ids and a length and width above 0, both parents covered; and, with spotting on, mode `SPOT_ON_LOCATION`, a tool above 0 and a list of features. With spotting off, nothing more is asked. Outdoor's profile (0.3) keeps its two scopes: `OUTDOOR_OPTIONS` needs only the requested work; `OUTDOOR_COMMITTED` needs the chosen plan (USER), the requested work (PROJECT) and, added because each blocking condition on its bench is one of these, every spot hole and decorative cut tried on the bench, set (USER). 0.3 checks the requested work field by field in both scopes: every package has an id, and every part an id and a length above 0. Start your own's profile (0.2) declares what its bench already sends with every confirmed definition: material (PROJECT), the defined workpiece length and the parts (USER), the declared operations (PROJECT), the cut and datum meaning (RULE) and, added, the center spot demand, on or off (USER). Playhouse's profile (0.2) declares the fixed sheet its page sends, with a thickness, length and width each above 0 (PROJECT), and the arched opening's width, straight height and rise, each above 0 (USER); neither has an upper bound, because a sheet or opening the Store cannot cut is the Store's refusal. Its transport sends exactly the admitted sheet, or stops before the Store (`ADMITTED_SHEET_NOT_SENT`).
- **Tile messages today:** every tile sends `STB-TILE-HOST-0.1`.
