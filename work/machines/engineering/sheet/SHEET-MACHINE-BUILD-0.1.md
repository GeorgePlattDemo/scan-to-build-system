# SHEET-MACHINE-BUILD-0.1 — First Bounded S-001 Research Candidate

**Status:** candidate engineering plan; no physical capability claimed  
**Research function:** centered internal routed opening with three straight sides and an arched top  
**Application class:** `S001_CENTERED_ARCHED_SHEET_V0`  
**Store request:** `SHEET_MODE2_ARCHED_APERTURE_V0`  
**Safety invariant:** **NO BLOOD ON WOOD**

## 1. Question

Can a deliberately narrow sheet-machine experiment take the same bounded project definition already carried by the application and Store reference path and produce one measured routed opening in sheet stock without the operator redrawing or re-entering the geometry at the machine?

This document does not answer that question in advance. It defines the first candidate experiment tightly enough that a positive, negative, or refused result can be recorded without silently expanding the machine.

## 2. Why this is a useful first function

The centered arched opening is a useful first candidate because it requires more than a straight panel-saw cut while remaining easy to inspect and explain:

- one known sheet;
- one centered bounded work field;
- three straight profile segments;
- one curved top segment;
- one router-class operation;
- retained tabs / attach points;
- simple secondary separation;
- no drilling;
- no general free-form CNC promise.

The application can already vary opening width, straight-side height, and arch rise and can preserve that definition through its Store/review/record chain. The physical experiment should consume that bounded definition rather than create a second drawing or machine-specific design step.

## 3. Demand-side reference envelope

The existing software/reference project currently describes:

| Fact | Current bounded reference |
| --- | --- |
| Parent sheet | 48 × 96 in |
| Reference material | nominal 1/2 in plywood |
| Working field | centered 48 × 36 in |
| Variable inputs | opening width; straight-side height; arch rise |
| Opening placement | centered on parent / centered field |
| Operation | `ROUTE_PROFILE` |
| Retention | retained tabs / attach points |
| Tab separation | downstream / selective secondary work |
| Drilling | not admitted |
| Label | required before leaving primary cell stream |

These values define the demand-side candidate. They do not prove that the first physical machine can accept the full 48 × 36 field.

## 4. First physical hypothesis

The physical hypothesis to test is intentionally narrower than a general sheet CNC:

> A supported and restrained sheet can maintain a declared reference while a router-class tool traces one bounded centered internal profile under local machine control.

The first physical envelope may be reduced after actual support, workholding, travel, tool, guard, and control geometry are known.

## 5. Required project-to-machine separation

The application/project owns:

- parent-sheet identity request;
- opening width;
- straight-side height;
- arch rise;
- project revision;
- part identity;
- requirement for a routed profile and retained tabs.

Store owns:

- offered material identity;
- reference/supportability answer;
- bounded capability/envelope identity;
- commercial/reference facts within its authority.

The machine site owns:

- actual installed axes and travel;
- workholding and reference establishment;
- tool identity and installed cutter;
- offsets and local coordinate transforms;
- feeds/speeds;
- tab placement implementation consistent with the accepted neutral requirement;
- local controller program;
- guards/interlocks;
- local Ready / Cycle Start;
- physical observations and measured result.

The application must not emit controller code or machine coordinates.

## 6. Candidate neutral operation

The minimum portable requirement should remain machine-neutral in form:

```text
LOAD          <accepted sheet offering>
ESTABLISH     sheet reference / workholding state
ROUTE_PROFILE centered arched internal opening
RETAIN_TABS   bounded retention requirement
RETRACT
RELEASE       only under local safe state
LABEL         project + part identity
```

The machine-local lowering layer decides how the accepted geometry becomes axis motion.

## 7. Geometry handed downstream

The project definition should provide sufficient part-relative geometry to reconstruct the opening without a second design step:

- parent dimensions;
- work-field identity;
- opening center/placement rule;
- opening width;
- straight-side height;
- arch rise;
- derived total opening height;
- curve class / derived circular-segment data where Store or the geometry owner provides it;
- requested retention/tab requirement.

The machine site may derive its own motion representation from this definition, but it must not change the project geometry silently.

## 8. Candidate physical architecture questions

The following remain unresolved and must be selected through engineering, not inferred from the application:

1. fixed sheet with moving X/Y tooling platform versus one-axis sheet motion plus one-axis tooling motion;
2. exact support frame and backing-plane geometry;
3. whether the first prototype follows the patent-corresponding Mode-2 relationship or intentionally narrows/diverges;
4. bottom/reference support method;
5. sheet clamping / yoke / carrier method;
6. router/spindle family and cutter;
7. usable tool travel after guards, tool body, workholding, and edge clearances;
8. through-cut sacrificial backing method;
9. position/reference sensing and invalidation events;
10. local controller and drive stack;
11. E-stop, guarding, access control, restart, and isolation architecture;
12. dust/chip control required for safe testing;
13. acceptable measured geometric error for the first test;
14. tab width/count/placement needed for safe retention in the actual material.

## 9. Drawing / preview rule

The user-facing drawing is a **derived inspection view of the project definition**.

It may show:

- full 48 × 96 parent sheet;
- centered 48 × 36 reference work field;
- opening width;
- straight-side height;
- arch rise;
- total opening height;
- derived curve/radius information;
- whether the requested profile is inside the published software/reference field.

It must not be labeled a toolpath, controller program, fabrication release, or commissioned-machine envelope.

For the first playful configurator, keep the controls constrained so the user can vary the three existing project inputs while remaining inside the current software/reference work field. A later engineering view may deliberately expose refused/out-of-envelope values for testing, but the simple project experience does not need to be a refusal simulator.

## 10. Sarah playhouse use case

Use one deliberately ordinary example to make the geometry understandable:

**Scenario:** Sarah has a small outdoor playhouse wall panel and wants a large arched window opening.

Canonical starting values remain the existing S-001 software/reference values:

- opening width: **36 in**;
- straight-side height: **24 in**;
- arch rise: **12 in**;
- total opening height: **36 in**;
- derived circular-segment radius in the accepted Store proof: **19.5 in**.

The scenario is presentation only. It does not create structural adequacy, child-safety, installation, weatherproofing, code, or finished-building claims.

## 11. Test sequence — planning level

Before powered cutting, the detailed physical test plan must establish safe mechanical/control conditions. Subject to that gate, the eventual evidence sequence should be capable of recording:

1. identify and inspect the parent sheet;
2. load and establish reference/workholding;
3. verify the active bounded job identity;
4. verify local machine state and operator readiness;
5. local Cycle Start;
6. execute the bounded profile under machine-local control;
7. stop/refuse on lost reference, interlock, axis/tool fault, or other invalidating condition;
8. inspect retained tabs / workpiece retention;
9. measure resulting opening geometry;
10. perform only the declared secondary separation work;
11. label the resulting part/package;
12. retain physical outcome evidence.

This sequence is not authorization to perform the powered test before the required engineering and safety work is complete.

## 12. Positive evidence target

A successful first experiment should be able to show, at minimum:

- exact project revision used;
- exact material used;
- exact machine/envelope version;
- reference/workholding established;
- local operator / local Cycle Start;
- completed profile without silent geometry change;
- measured opening width;
- measured straight-side height;
- measured arch/rise or equivalent curve verification;
- observed retained-tab condition;
- observed defects or deviations;
- secondary separation actually performed;
- labeled result;
- outcome record tied back to the project revision.

## 13. Refusal / failure cases

The first physical implementation must fail closed when any required physical condition is not established. Candidate refusal/failure classes include:

- material/form not supported;
- thickness not supported;
- profile outside the physically commissioned field;
- reference not established or lost;
- workholding insufficient/unverified;
- router/tooling unavailable or wrong;
- requested depth unsupported;
- drilling or another unadmitted operation requested;
- controller/job identity mismatch;
- stale or changed project revision;
- guard/interlock/E-stop condition not satisfied;
- axis/tool fault;
- loss of position validity;
- remote Cycle Start request.

The project definition should be retained even when the machine refuses it.

## 14. Store-visible capability, if later earned

A future physical S-001 capability declaration should expose only what Store needs, such as:

- supported sheet forms/material classes;
- actual usable field;
- supported route-profile class;
- supported thickness/depth range;
- retention/tab prerequisites;
- explicit unsupported operations;
- capability/envelope version;
- evidence/commissioning status.

Do not expose controller programs, machine coordinates, I/O, servo tuning, or local safety implementation as normal Store inputs.

## 15. Patent correspondence posture

Use `docs/patents/PATENT-ALIGNMENT-GATE.md` before adopting a physical architecture.

The existing Cell spine identifies correspondence to U.S. 10,768,609 Figs. 6–8 and the disclosed sheet-machine modes, including support/backing, lower rollers, sheet/yoke manipulation, tooling-platform motion, router use for curves, pressure/contact depth reference, and retained attach points for stencil-type work.

The first build may intentionally implement only a narrow subset. Record any narrowing or divergence explicitly.

Patent correspondence is not safety evidence, commissioning evidence, or a requirement to reproduce every disclosed embodiment.

## 16. Current non-claims

This plan does not establish:

- a commissioned S-001 machine;
- an installed router/spindle;
- a verified 48 × 36 physical work field;
- measured tab-retention strength;
- measured feeds/speeds or cycle time;
- a complete process price;
- controller-in-loop validation;
- physical production authority;
- remote Cycle Start;
- child-playhouse structural or safety suitability.

## 17. Unresolved register

Until physical engineering resolves them, retain at least:

- actual first frame/support architecture;
- motion split between sheet and tooling;
- actual workholding/reference chain;
- tool/spindle/cutter selection;
- sacrificial backing;
- physical usable field;
- depth control/reference;
- controller/drives/I/O;
- sensing and position invalidation;
- guard/interlock/E-stop architecture;
- dust/chip management;
- tab policy validated against real material;
- geometric acceptance tolerance;
- physical inspection method;
- commissioning authority and reviewer.

**NO BLOOD ON WOOD.**
