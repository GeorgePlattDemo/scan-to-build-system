# Reviewing the M1 executable baseline

## Purpose

Review is used to locate defects, unsupported claims, ambiguous contracts,
unsafe authority paths, and missing evidence. It is not an endorsement request.
The repository owner retains disposition authority, and no reviewer may promote
an assertion, close an I0 or I1 gate, or authorize physical execution by
commenting or approving a pull request.

## Baseline and scope

The review baseline is M1 `0.2.5-m1.3`. Its permitted claim is:

> A governed, inspectable, simulation-only path through the first bounded
> Project A slice.

Review against the implemented scope and its stated limitations. Record larger
proposals separately; do not characterize an intentionally inactive module as a
failed implementation.

## Review lanes

| Lane | Principal questions |
| --- | --- |
| Domain architecture | Do types, states, handoffs, and controlling documents agree? |
| Wood science and materials | Are material statements sourced, bounded, and suitable for the stated application? |
| Capture and geometry | Are methods, units, datums, uncertainty, and verification status preserved? |
| Software contracts | Do schemas, fixtures, tests, and runtime behavior agree deterministically? |
| Authority and safety | Can any caller bypass refusal, promote status, issue production authority, or invoke live motion? |
| Fabrication and installation | Are shop, site, operator, and installer responsibilities explicit and unresolved work preserved? |
| Information custody | Are disclosure, consent, retention, external processing, and aggregation boundaries explicit? |

Reviewers should identify the lane or state that a finding crosses lanes.

## Finding standard

A review finding should contain:

1. exact file, object, fixture, gate, or section;
2. observed condition;
3. expected condition and its authority or evidence;
4. consequence if unchanged;
5. reproducible example when safe to disclose;
6. proposed disposition, if known;
7. classification: blocking, material, minor, question, or out of scope.

Distinguish fact, calculation, interpretation, recommendation, and preference.
If a source or rule is missing, say so. Do not invent a value to complete a
test. Conflicting reviews remain visible until disposition is recorded.

## Safety-sensitive findings

Follow `SECURITY.md`. Do not place exploit instructions or live-motion details
in an issue. A withheld safety finding may be recorded by identifier and status
without publishing its sensitive content.

## Disposition

The repository owner records one disposition: accept, accept with modification,
defer with named dependency, reject with reason, duplicate, or out of scope.
Corrections to released fixtures create a new fixture identifier; released
fixture bytes are not silently replaced.
