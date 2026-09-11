# Continuous Engineering & Capability Evolution

**How a bounded fabrication cell learns without overclaiming.**

Document: `docs/CONTINUOUS_ENGINEERING.md`
Status: Public technology demonstration · simulation only
Posture: No live machine control · no commissioned equipment · no production-readiness claim
Read with: [Operational Roadmap](./OPERATIONAL_ROADMAP.md) ·
[Machine Function & Kinematic Ontology](./MACHINE_FUNCTION_KINEMATIC_ONTOLOGY.md)

> This document describes MachineEnvelope reasoning, refusal preservation and
> classification, and simulation-only execution reporting. It does not describe real
> machine operation, commissioned equipment, measured tolerance or scrap, safety
> certification, or production readiness. Any physical pilot requires independent
> engineering, safety, and regulatory review first.

## The core claim

The system does not claim one machine does everything. It claims a bounded machine
**declares what it can do, refuses what it cannot, preserves why it refused, and creates
evidence for what should evolve next.** Refusals are engineering evidence, not failure —
a refusal is the system declining to lie.

That distinction is what makes the machine governable. An honest bounded machine can
learn, because every refusal measures the gap between real project demand and current
capability. A vague general-purpose machine that accepts everything produces no
disciplined evidence about its own boundary.

## 1. The cell is a bounded MachineEnvelope

A fabrication cell is represented by a MachineEnvelope that declares its operation types
and modes, dimensional limits, the material classes it can safely handle, the tolerance
classes it can repeatably hold, tooling and calibration state, guard/e-stop readiness,
role/certification requirements, and safety gates. A packet operation either fits that
envelope or it does not — and "does not" produces a refusal, not a workaround.

The envelope is a capability contract, not a sales claim. It is not a promise that the
cell can be stretched by operator courage or software optimism. This is the opposite of
selling a cell as general-purpose: a general claim invites disappointment; a bounded
envelope creates evidence.

## 2. Limited capability is not a weakness

A cell that says *"I can crosscut and drill sheet goods to a 1/16-inch class, prefinish,
label, and hand off for install — and I cannot hold a 0.02-inch tolerance on this
material"* is more useful than one that accepts everything and silently underdelivers.
In Sarah's journey the contour cell refuses v1's tight 0.02-inch crosscut tolerance and
accepts v2's relaxed 1/16-inch tolerance. That refusal is not the cell failing; it is the
cell being honest about its class, which lets the packet be revised into work the cell can
actually hold. Limited-but-honest beats general-but-vague because a legible boundary can
be improved, while a hidden one only produces rework.

## 3. The boundary is physical, and the envelope encodes it

A compact local cell lives under real constraints — footprint, reach, infeed/outfeed,
stock length, sheet size, clamp geometry, tool clearance, material-handling path, operator
clearance. The envelope exists to encode them. Sarah's alcove components (~46 × 88 in)
fit within the demo sheet envelope's 48 × 96 in limit; a larger panel is refused on
dimension — which doesn't mean the project is impossible, only that the compact cell is
the wrong channel for that scope (it can be revised, decomposed, or routed to a
special-order fabricator).

Three properties of that boundary are time- and condition-varying, and each is a refusal
trigger rather than a silent quality loss:

- **Tolerance is a class, not a wish.** Each operation has an achievable tolerance class;
  a packet demanding tighter is refused (`ENVELOPE_EXCEEDED`). In the prototype these are
  demo values; in a real cell they would be measured against material, tool, fixture,
  calibration, and operator conditions before becoming envelope values.
- **Calibration drifts.** A machine that held a tolerance last month may not today —
  fixtures loosen, tools dull, sensors drift. The envelope treats calibration as
  time-varying; a cell past its window is refused (`CALIBRATION_STALE`, as the distant
  vendor cell is in Sarah's routing). Drift becomes a preserved maintenance signal, not an
  invisible defect.
- **Fixtures, tools, and sensors can be missing.** A geometrically capable cell still
  can't run an operation it lacks the tool, fixture, or sensor for; absence produces a
  refusal (`TOOL_REGISTRY_MISSING`) rather than improvisation. A recurring tool-gap refusal
  is among the most actionable evolution signals — it names exactly what to add.

The tension between compactness and capability is the point of the envelope, not a flaw in
it. A cell small enough to fit in a store or regional shop cannot honestly be treated as
an unlimited factory; the system is credible only when it lets compactness stay compact.

## 4. Material handling is part of the job

What a cell can *cut* and what it can safely *handle* are different questions. A cell may
support an operation in principle yet be wrong for a material it cannot load, clamp,
support, move, finish, or remove safely. A packet should be refused or decomposed when the
material exceeds handling limits, is unstable in the fixture, needs a tool the cell lacks,
or can be fabricated locally but not safely installed by the same channel. Material
handling is where machine capability, labor skill, and site reality meet — the envelope is
not honest unless it includes that meeting point.

## 5. Safety gates are not capability questions

Some refusals are safety boundaries, not capability limits: guard and e-stop
confirmation, LOTO, operator-clear state, PPE, dust collection, controller handshake, and
role certification. The prototype refuses any remote live-motion command unconditionally
and refuses execution when safety prerequisites are unmet; production readiness is never
asserted. **A safety refusal is never a capability-addition candidate.** The cell does not
earn the right to do more by being asked to bypass a safety gate, and the evolution logic
enforces that exclusion structurally.

## 6. Operators and stewards are sensors, not just labor

Automation moves judgment to named gates; it does not erase it. The workforce model names
operator tiers, a material-sensing operator, a cell steward, an installer, a verifier, and
an owner agent — several with refusal authority. Operators see what machines do not: stock
that looks wrong though the SKU is right, warp or moisture concern, tool sound or
vibration, a fixture that seats suspect, a site condition a prior capture missed. A
steward's refusal is as much engineering evidence as a machine's, and the system preserves
both.

One genuine consequence for workforce design: a bounded cell **compresses execution skill
and elevates judgment skill.** A trained operator can perform repeatable cuts, drilling,
labeling, and prefinish that would otherwise demand higher craft execution — but the
system still needs skilled judgment at the gates: confirming material behavior, setting
fixtures, recognizing unsafe conditions, interpreting refusals, and verifying fit. Craft
is not eliminated; it is restructured and moved into envelope design, stewardship, and
exception review.

## 7. Refusal analytics: the corpus is the roadmap

Because every refusal is preserved with a stable code and classification, the refusal
corpus is analyzable. The prototype's capability-evolution view classifies it into healthy
refusals, capability gaps, and safety holds, counts refusals by code, and surfaces
evidence-driven capability-addition candidates. The question *"what should the next cell do
differently?"* is answered from what the current cell actually refused and why — derived
from implementation data, not guessed.

**Healthy vs capability gap is load-bearing.** A healthy refusal (owner approval needed,
low capture, unresolved site, emission conflict, permit required) means governance worked
and should not produce a machine-expansion candidate — it needs owner action, better
capture, or a different path. A capability gap (tolerance beyond the envelope, missing
fixture or tool, unsupported material form, dimensional limit exceeded) may justify future
engineering work. A safety hold is neither — it must stay a boundary. Conflating these
would make governance look like friction and safety look like a market opportunity.

## 8. When capability should be added — and when it must not

A capability is added only when refusal evidence supports it: the refusal is classified as
a capability gap (not healthy, not safety); it recurs or is severe enough to justify
review; the failed operation, material class, tolerance class, and required tool/fixture
are characterized; the safety-review path is known; and the addition can be tested in a
later stage without weakening existing gates. The prototype proposes candidates only from
capability-gap evidence — the machine roadmap is written by implementation data, not
ambition.

Some boundaries must never become candidates: remote live-motion refusal, guard or
interlock failure, unverified e-stop, LOTO, operator-not-clear, uncertified role on
restricted work, missing controller handshake, production-readiness-not-established. A
future cell may improve guard design, telemetry, or ergonomics, but it may not treat the
safety refusal itself as something to bypass. **The first rule of continuous engineering
is that safety boundaries survive the engineering loop.**

## 9. The loop

```
bounded cell ── declares ──▶ MachineEnvelope (honest capability contract)
      │ runs packets (simulated)
      ▼
packet ops fit ── or ── refuse ── classify ──▶ healthy        → governance working, no change
                                              capability_gap → candidate evidence for next model
                                              safety_hold    → never an expansion candidate
      │
      ▼
capability candidates ──▶ engineering review ──▶ bench / pilot validation ──▶ measured envelope update
```

The next machine model is specified by what the current bounded cell honestly could not
do, characterized by real refusal evidence, with safety boundaries held fixed. **The cell
earns its next capability by producing the evidence that justifies it** — not by
overbuilding, not by bypassing safety, not by hiding failures.

## 10. What this is, and is not

**Is:** MachineEnvelope reasoning; refusal preservation and classification; capability-gap
analysis; safety-hold exclusion; the skill-compression/judgment-elevation framing;
material-handling discipline; evidence-driven capability evolution; simulation-only
execution reporting.

**Is not:** real machine control; commissioned equipment; safety certification or OSHA
compliance assertion; measured tolerance, scrap, or environmental performance; a
production-readiness claim. The line between machine reasoning and live machine control is
kept bright on purpose.

---

*A bounded machine becomes credible when it refuses. The refusal tells the owner the
truth, tells the operator where judgment is required, tells the engineer where the envelope
ends, and tells the next machine what evidence would justify change. The first cell does
not need to do everything — it needs to do what it can safely and repeatably, refuse the
rest, preserve why, and return the result to the owner-held record. From that record,
capability can evolve by learning from the boundary.*
