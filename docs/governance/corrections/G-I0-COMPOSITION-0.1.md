# G-I0 composition note (0.1)

Status: implementation clarification. Does not replace STB-REF-0.2.5.

STB-REF-0.2.5 remains the frozen controlling specification at its recorded hash. This note records the implemented composition used by the M1 executable baseline.

## What G-I0 evaluates

G-I0 aggregates exactly:

- G-LIVE
- G-EXEC-PRE
- G-SIM-SEP

It enforces the non-waivable invariant I0 — NO BLOOD ON WOOD — for live motion, production readiness, and production-authorization presence.

## What G-I0 does not evaluate

G-I0 does not evaluate geometry completeness, datum validity, shelf fit, consent, packet binding, or authority-type matching. Those remain distinct gates.

Missing geometry is not redefined as a machine-safety fact in order to make G-I0 universal.

## What authorizes simulation

Neither G-I0 alone nor a passed WorkPacket authorizes simulation.

Issuance requires:

1. the complete required M1 gate set;
2. the single eligibility policy;
3. a policy-constructed SimulationEligibilityDecision;
4. an explicit simulation command (`request_simulation` or `simulate`).

Empty or incomplete M1 input cannot reach authorization.
