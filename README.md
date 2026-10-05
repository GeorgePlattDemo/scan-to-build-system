# Scan-to-Build System

**Your idea should reach the cut, mill, and drill.**

Define it once. Nobody downstream should have to redraw it.

<a href="https://georgeplattdemo.github.io/scan-to-build-system/system-build-current.html"><kbd>▶ OPEN THE APP</kbd></a>

3D Solutions LLC · Greensboro, North Carolina

## Make what you meant

A replacement brace. Shelves that fit an opening. A window seat that uses the space. The pieces for a picnic table. A panel with an arched opening.

The useful result is something you can build with. Scan-to-Build connects the person defining that result to the local Store that can supply the material and work.

Bring an idea, photo, sketch, scan, description, or prior work. Establish the project’s requirements at **Intent**, then work them on **the Bench**. The definition carries the dimensions, feature locations, and required operations forward to the Store. Cut, mill, and drill each have a place in that description: what the part must become, where the work belongs, and what material it needs.

The seam matters. Your idea should not lose its meaning when it leaves the screen and reaches the yard. The definition can travel to suitable local material before that material has to travel to distant processing.

## Start with the Bench

[Open the application](https://georgeplattdemo.github.io/scan-to-build-system/system-build-current.html) and choose **Start your own**. It opens on Intent, with the job’s wood, cuts, and spot operation together. Take that definition to the Bench and adjust the part length. Watch the angle and spot location follow the same job.

One meaningful change, with its consequences visible. The Store evaluates the resulting request and supplies its own answer.

The library offers five bounded project classes:

| Project | What you work on |
| --- | --- |
| **Start your own** | A user-defined board job with cuts and a bounded spot operation. |
| **Critical fit** | An alcove/shelf insert shaped by the opening it must fit. |
| **Space utilization** | A window-seat assembly that makes use of available space. |
| **Outdoor build** | A picnic-table project starting from a published plan. |
| **Playhouse arched window** | A sheet opening through the S-001 path, with retained tabs. |

Each keeps its own project facts while using the same journey.

## One trail from Intent to build

**Intent → The bench → The Store answers → Your call → We cut it → Pick up & build**

**Idea** is the unnumbered intake before those steps: the source material and context you bring. **Intent** establishes this job’s requirements and meaningful controls. **The Bench** changes their values and shows the resulting definition. **The Store answers** from its material, capability, modeled work, and economics. **Your call** records your decision; the later steps carry the job through the demonstrated yard and handoff sequence.

Known information travels with the job. A changed definition gets a fresh Store evaluation. The identified revision, its answer, your next decision, and the consequential record remain together.

The [trail contract](apps/stb/public-build/stb-trail-contract.js) declares the shared journey. Start your own opens on Intent with Idea one back control away; Window Seat can also offer a full-scroll presentation from its Idea line. [Shared definitions](docs/definitions/README.md#the-trail) explain the terms and rules.

## How the definition reaches the work

**System defines what the job means. Store determines what that yard can provide. Local machine engineering translates the accepted requirements for its equipment.**

The confirmed definition supplies the required result. Store adds identified material, supported operations, modeled work, and price. In the intended production chain, a registered local compiler translates the requirements and machine facts into ordered instructions and coordinates. The operator verifies the stock, loading, references, tooling, and readiness; inspection checks the parts against the same definition.

That is the connection this work investigates: the customer defines the result, and software carries it toward cut, mill, and drill without a second design entry.

The [**Project 1 digital manufacturing trail**](https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/docs/project-1-digital-trail/README.md) makes one such path inspectable. It reproduces the Store answer and generates explicit virtual commands and controller-oriented source from one identified definition. You can follow the information handoffs and reproduce the calculation.

## Three connected homes

| Repository | Contribution |
| --- | --- |
| [**Program**](https://github.com/GeorgePlattDemo/3d-solutions-program) | The economic opportunity, research, candidate engineering, and questions worth testing. |
| **System** | The working application, shared job meaning, definitions, and records that carry the project forward. |
| [**Store**](https://github.com/GeorgePlattDemo/scan-to-build-store) | Its catalog, capability, modeled work, economics, and answers for the requested job. |

System calls the Store at the exact version owned by [`STORE_PIN`](apps/stb/shared/contracts.mjs). The Store evaluates the request; the application presents that answer and preserves its identity. Details are in the [Store foundation](docs/store/CURRENT-STORE-FOUNDATION.md).

## What you can inspect today

The public application demonstrates the five project paths, Store requests and answers, versioned definitions, and shared simulated terms and yard events. The [verification register](docs/project/VERIFICATION-REGISTER.md) ties the individual software claims to their tests and exact versions; the [current-state record](docs/project/CURRENT-SYSTEM-STATE.md) explains publication and runtime ownership.

Store Zero is a modeled reference yard. Its prices are budgetary estimates, and machine time is modeled from indexing, tool motion, feeds, passes, and handling. Commercial and yard events are simulated. Physical D-001/S-001 production is not commissioned; the Project 1 controller source is uncompiled. The detailed records identify the remaining engineering and release requirements.

## Follow the part that interests you

| Question | Read |
| --- | --- |
| What has been proved, and under which versions? | [Verification register](docs/project/VERIFICATION-REGISTER.md) |
| What is published now? | [Current System state](docs/project/CURRENT-SYSTEM-STATE.md) |
| How do people enter and resume their work? | [Common entry](docs/application/COMMON-ENTRY-ARCHITECTURE.md) |
| What happens to photos, source material, and records? | [Information custody](docs/application/INFORMATION-CUSTODY-BOUNDARY.md) |
| What crosses between System and Store? | [Store foundation](docs/store/CURRENT-STORE-FOUNDATION.md) |
| How does one definition reach commands and a modeled price? | [Project 1 digital trail](https://github.com/GeorgePlattDemo/scan-to-build-store/blob/main/docs/project-1-digital-trail/README.md) |
| Why could this matter to a local business or community? | [3D Solutions Program](https://github.com/GeorgePlattDemo/3d-solutions-program) |

**NO BLOOD ON WOOD.**

<sub>Maintainers and agents: [START-HERE.md](START-HERE.md) · [Historical accepted baseline](STB-CURRENT-BASELINE.md) · [Branch and PR genealogy](docs/project/BRANCH-PR-GENEALOGY.md)</sub>
