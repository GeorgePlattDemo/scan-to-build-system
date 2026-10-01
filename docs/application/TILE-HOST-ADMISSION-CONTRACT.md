# Tile/host and definition/Store admission contract

**Owner:** System. **Status:** spec and tests only. Nothing in the app uses it yet; no page, iframe, Store call or Store answer changes.
**Executable half:** [`apps/stb/shared/tile-host-admission-contract.mjs`](../../apps/stb/shared/tile-host-admission-contract.mjs).
**Check:** [`apps/stb/test/trail/tile-host-admission-contract.test.mjs`](../../apps/stb/test/trail/tile-host-admission-contract.test.mjs), beside the trail tests.
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

- **Admission checks what the profile declares.** Each tile has an admission profile: per inquiry scope, the required facts and their owners. Admission reads those requirements against the revision. Rows or facts a tile happened to emit neither add to nor stand in for them. A tile with no profile, or an undeclared scope, fails closed.
- **A missing required fact blocks before Store** and names the owner. Missing, unresolved, candidate and invalid all block. A required fact owned by `STORE` (for example Alcove hardware selection) does not block: it travels as an open demand for Store to resolve.
- **Admission never checks Store capability.** A complete request outside the envelope still reaches Store. The Store's refusal is the result, and Your call stays inert (trail rule 5).
- **The request is bounded.** The job record may hold source material (photos, sketches), earlier retained requests, saved answers and facts outside the scope. The request carries none of them.

## Reopening a job record

Reopening restores history whole: source material, revisions, retained requests and saved Store answers. It then recalculates what is available from the current revision's admission. It does not restore saved usable steps or a saved stage that is no longer usable.

A saved Store answer comes back as history, never as current authority, even when it names the current revision. Your call needs a fresh answer.

## Available steps

Intent and The bench are always usable. The Store answers is usable when the current revision is admitted. Your call is usable only with a fresh, current answer for that exact revision inside the envelope. We cut it and Pick up & build stay with the gates in `stb-terms-flow.js`.

## What this replaces, later

The current admission path is `admitPublicStoreRequest` in `apps/stb/public-build/stb-public-admission.mjs`, called from `sendJob` in `apps/stb/public-build/stb-store-client.js`. Each tile branch builds its own responsibility rows and then takes `requiredIds = rows.map(item => item.id)`, so the `SYSTEM_ADMISSION_COVERAGE_GAP` check compares the rows with themselves and cannot fire. Window Seat and Outdoor blockers come from the tile page's own `conditions()`. That path stays in place until a separate change moves `sendJob` onto this contract.

## Open before adoption

- **Trail rule 8.** "Adding a tile means declaring it in the trail contract. Nothing else." An admission profile is a second declaration per tile. Either the profile moves into the tile's trail-contract entry, or rule 8 is amended. Until then a tile without a profile fails closed.
- **Profiles are first declarations,** enough for the contract tests. They are not yet a port of every row in the current path (for example Start your own spot demand, Window Seat screws, generator consistency).
- **Tile messages today** are per-tile types (`STB_SEAT_STATE`, `STB_OUTDOOR_STATE`, `STB_START_OWN_*`). Interface 1 is what they converge on; no page or iframe changes in this step.
