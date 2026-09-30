# Scan-to-Build System

**Define it once. Nobody downstream should have to redraw it.**

<a href="https://georgeplattdemo.github.io/scan-to-build-system/system-build-current.html"><kbd>▶ OPEN THE APP</kbd></a>

3D Solutions LLC · Greensboro, North Carolina

---

## What this is

This is the working app — the digital proof that a bounded wood project can be defined once and carried all the way to a yard and back without anyone rebuilding it.

Today, a custom wood project gets reinterpreted at every step. Someone measures the space. Someone else redraws it. The counter turns it into a material list. The shop turns it into something a machine understands. Every handoff is a chance to lose what the customer actually meant.

Here, the project is defined once — finished parts, dimensions and required operations — in terms that survive the trip to the yard intact. Where the yard's machine supports the work, the machine's own setup turns those requirements into motion locally:

```
what you want → what you measured → the parts, defined → the yard's answer → your decision → the parts, made → pickup → your record
```

## One job, start to finish

A picnic-table bench needs an X-brace. In the app that becomes a definition: two parts, 16 inches each, 30° ends, a spot marked at the center of each. The job goes to the Store on a 60-inch 2×4. The Store checks its own stock, checks that its machine can hold the board through every cut — there must always be at least 24 inches to grip — and answers: it fits, with about 27⅝ inches left over, and here's the budgetary price.

Nobody retyped the numbers. Nobody redrew the brace. If the job didn't fit, the Store would have said no and said why, and the app would have shown you that no.

## What works today

Proven in the app's own tests — each claim is tied to an exact version in the [verification register](docs/project/VERIFICATION-REGISTER.md):

- A project leaves this app, a separately hosted Store evaluates it, and the answer comes back and is kept with the exact project version it answered.
- The whole chain — request, answer, your review, the record — survives exporting, importing and reopening the project.
- An old answer can't be resent as a new one. A fresh question always gets a fresh evaluation.
- If the Store refuses a job, nothing later in the app can turn that into a yes.
- Answers that come back malformed, or claiming authority they don't have, are quarantined rather than shown as real.
- Board jobs, cut packages and alcove inserts are answered live by the hosted Store; a sheet-goods job (an arched playhouse window) runs through the same path against its own Store version.

What's modeled rather than real: the yard is fictional, prices are budgetary estimates, and machine time is calculated, not measured. Payment and the yard queue are simulated. No machine runs.

## Try it

Open the app, choose **New user**, then **Later**, and pick a project from the library:

| Project | What it tests |
| --- | --- |
| **Start your own** | One board, your own cuts. The simplest case. |
| **Outdoor build** | A picnic table from real published plans, turned into a cut list. |
| **Critical fit** | A shelf insert that has to fit an exact opening. |
| **Space utilization** | A window seat with two towers — a bigger assembly. |
| **Playhouse arched window** | Sheet goods instead of boards. |

The tabs across the top follow the job: bring what you have, scan, configure, the Store's answer, review, request, yard, record. A dev guide in the right-hand rail says what each screen is trying to do.

## Where this fits

This repository sits under the [3D Solutions Program](https://github.com/GeorgePlattDemo/3d-solutions-program), which asks the bigger question, and next to the [Scan-to-Build Store](https://github.com/GeorgePlattDemo/scan-to-build-store), which owns the yard's side.

The line between them is the whole point: System carries your project, and the Store answers it. System never makes up a Store answer, a price or a refusal. If it did, nothing would really have crossed from you to the yard.

In the issued patents, this is the customer-facing half: the interface where a person chooses and sizes a project, the project definition that drives the machine, and the record that comes back. The app currently works against Stage 2 of the [Store's stages](https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/STB-STORE-CELL-STAGES-0.1.md) — a reference yard and a declared reference cell.

## Where the support lives

| If you want to know… | Read | Why it's the evidence |
| --- | --- | --- |
| What's actually proven, and what isn't? | [Verification register](docs/project/VERIFICATION-REGISTER.md) | Every claim tied to a test and an exact version |
| How do new, returning and professional users end up on the same path? | [Common entry](docs/application/COMMON-ENTRY-ARCHITECTURE.md) | Three ways in, one project |
| What happens to my measurements, scans and files? | [Information custody](docs/application/INFORMATION-CUSTODY-BOUNDARY.md) | What's kept, what's shared, what stays yours |
| What exactly crosses to the Store? | [Store foundation](docs/store/CURRENT-STORE-FOUNDATION.md) | The request, the answer, and why every question is fresh |
| What does a word mean? | [Definitions](docs/definitions/README.md) | The one authority for shared meaning across Program, System and Store, backed by code in [`apps/stb/shared/`](apps/stb/shared/) |
| What is current, published, modeled, and historical? | [Current System state](docs/project/CURRENT-SYSTEM-STATE.md) | Current publication source, Store-pin owner, simulation/commissioning limits, and pointers to historical records |
| What do the patents disclose? | [Patent sources](docs/patents/README.md) | The issued grants and how this work maps to them |

## The fine print

This is a working software proof, not a store. Nothing here is a live inventory, a binding quote, a payment, or permission to run a machine. A passing test proves what that test checks, and nothing more.

**NO BLOOD ON WOOD.**

<sub>Maintainers and agents: start at [`START-HERE.md`](START-HERE.md). Accepted baseline, pins and genealogy: [`STB-CURRENT-BASELINE.md`](STB-CURRENT-BASELINE.md) · [`docs/project/BRANCH-PR-GENEALOGY.md`](docs/project/BRANCH-PR-GENEALOGY.md) · [`AGENTS.md`](AGENTS.md) · [`apps/README.md`](apps/README.md)</sub>
