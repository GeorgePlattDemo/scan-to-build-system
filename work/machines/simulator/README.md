# Machine Controller Simulation — Safety Kernel 0.1

**Owning layer:** Machine  
**Implementation status:** IMPLEMENTED simulation safety kernel  
**Physical status:** NOT CLAIMED  
**Physical execution authority:** false  
**Safety invariant:** **NO BLOOD ON WOOD**

This folder is the first executable machine-site safety layer for the D-001 dimensional and S-001 sheet virtual machines.

It is intentionally downstream of Application and Store. It does not change Store envelopes, create Store capability, generate physical Cycle Start, or authorize real I/O.

## What is implemented now

`safety-interlock.mjs` implements a deterministic, fail-closed virtual safety state machine with separate D-001 and S-001 profiles.

A virtual cycle cannot enter `RUNNING` unless all required modeled permissives are true and the two-hand start sequence is valid.

The safety kernel models:

- redundant E-stop channels;
- redundant guard-closed channels;
- redundant guard-lock channels;
- redundant safety-relay health channels;
- workholding confirmation;
- controller readiness;
- program validation;
- homing;
- position validity;
- tool-state validity;
- drive-fault-clear state;
- D-001 stock-control confirmation;
- S-001 sheet-retention confirmation;
- virtual/physical I/O isolation;
- explicit safety-bypass detection;
- explicit rejection of remote Cycle Start;
- two independent start channels with a bounded concurrence window;
- anti-tie-down / release-before-repeat behavior;
- reset-after-stop behavior;
- no automatic restart when a guard is reclosed or an E-stop is restored.

All state transitions are recorded in an append-only event sequence exposed by `getSnapshot()`.

## Two-hand start

The default concurrence window is `500 ms`.

That number is a **CANDIDATE ENGINEERING simulation parameter**, not a claim of standards conformity and not a physical safety-device specification.

The simulator requires:

1. both start channels released before arming;
2. one independent rising edge on each channel;
3. the second rising edge within the configured concurrence window;
4. every other safety and machine-readiness permissive true at the moment of start;
5. release of both buttons before another cycle can be initiated.

A held button, late second press, missing second press, remote start request, or bypass indication cannot produce virtual motion.

## D-001 and S-001 machine-specific gates

D-001 additionally requires:

```text
stockControlConfirmed == true
```

S-001 additionally requires:

```text
sheetRetentionConfirmed == true
```

These are simulated machine-state gates. They do not claim that physical restraint has been designed, measured, or commissioned.

## Physical I/O isolation

The simulator has a hard condition:

```text
physicalIoIsolated == true
```

If that condition becomes false, the safety state becomes `SAFETY_FAULT_RESET_REQUIRED` and virtual motion is disabled.

There is no physical-output adapter in this implementation.

## Run the tests

From the repository root:

```text
node --test work/machines/simulator/safety-interlock.test.mjs
```

The test suite intentionally attacks the safety chain. It includes:

- healthy-but-not-reset block;
- valid two-hand start;
- one-button start refusal;
- concurrence timeout;
- anti-tie-down;
- guard opening during cycle;
- E-stop during cycle;
- redundant-channel disagreement;
- safety-bypass detection;
- remote-start rejection;
- physical-I/O-isolation loss;
- D-001 stock-control loss;
- S-001 sheet-retention loss;
- release-before-repeat after a completed cycle.

A refusal or stop is a passing result when that is the declared safety behavior.

## Controller-in-the-loop target

**SELECTED FOR PROTOTYPE:** LinuxCNC is the current controller-in-the-loop research target because its simulator configurations can run without machine hardware and its HAL separates controller logic and I/O bindings.

This repository does **not yet claim** that this JavaScript safety kernel has been bound to LinuxCNC HAL or that a LinuxCNC controller program has executed through D-001 or S-001. That requires a separately tested machine-site integration slice.

Official LinuxCNC references used for the selection:

- https://linuxcnc.org/docs/html/nb/getting-started/running-linuxcnc.html
- https://linuxcnc.org/docs/html/hal/tutorial.html

The exact LinuxCNC version, machine INI, HAL graph, interpreter target, and registered postprocessor version must be pinned before `CONTROLLER_IN_LOOP_VALIDATED` can be claimed.

## What this does not establish

This implementation does not establish:

- safety-category, PL, SIL, or standards conformity;
- physical guard design or adequacy;
- measured stopping time or stopping distance;
- physical E-stop architecture;
- actual workholding strength;
- real sensor diagnostic coverage;
- installed controller hardware;
- commissioned D-001 or S-001 machinery;
- authority for physical motion.

Those remain physical engineering and commissioning work.
