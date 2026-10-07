# Controller-in-the-Loop Safety Architecture 0.1

**Owner:** Machine  
**Status:** CANDIDATE ENGINEERING + implemented virtual safety kernel  
**Controller target:** LinuxCNC — SELECTED FOR PROTOTYPE, not yet controller-in-loop validated  
**Machines:** D-001 dimensional; S-001 sheet  
**Physical execution authority:** absent  
**Safety invariant:** **NO BLOOD ON WOOD**

## 1. Purpose

Bring the D-001 and S-001 virtual machines as close as practical to the physical-control boundary so the Scan-to-Build circuit can expose real implementation conflicts before physical machinery is permitted to move.

The intended final virtual chain is:

```text
Application definition
    ↓
Store evaluation / declared envelope
    ↓
machine-neutral operations
    ↓
registered machine-site postprocessor
    ↓
real controller language
    ↓
real controller interpreter / controller configuration
    ↓
modeled safety I/O + machine I/O
    ↓
virtual machine motion and tool state
    ↓
trace + elapsed time + modeled outcome
```

The current implementation in `../simulator/` establishes the safety-state kernel and machine-specific start permissives. It does not yet establish the postprocessor, LinuxCNC configuration, or controller execution portion of that chain.

## 2. Existing architecture preserved

This work does not move controller language upstream.

Application continues to own project/part meaning. Store continues to own offering and capability evaluation. Machine-site lowering remains the only location allowed to select a controller dialect and generate controller-specific instructions.

The safety kernel therefore accepts modeled machine/controller state only. It does not accept a Store instruction that says `ignore_guard`, `force_start`, `cycle_start`, or any equivalent authority escalation.

There is no supported aggregate input called `safetyPermissive` that can be set true by a caller. The permissive is derived from independent states.

## 3. Safety gate

Virtual Cycle Start requires all of the following modeled conditions:

```text
E-STOP A healthy
AND E-STOP B healthy
AND E-STOP channels agree

AND guard A closed
AND guard B closed
AND guard channels agree

AND guard-lock A engaged
AND guard-lock B engaged
AND guard-lock channels agree

AND safety-relay A healthy
AND safety-relay B healthy
AND safety-relay channels agree

AND workholding confirmed
AND machine homed
AND position valid
AND tool state valid
AND controller ready
AND controller program validated
AND drive fault clear

AND machine-specific material-control gate true
AND physical I/O isolated
AND no safety bypass detected
AND no remote start request

AND reset accepted
AND two-hand start sequence valid
```

For D-001 the machine-specific material-control gate is `stockControlConfirmed`.

For S-001 it is `sheetRetentionConfirmed`.

## 4. Fail-closed classes

### 4.1 Latched safety fault

Any of the following produces `SAFETY_FAULT_RESET_REQUIRED`:

- disagreement in redundant E-stop, guard, guard-lock, or safety-relay channels;
- `bypassDetected == true`;
- `remoteStartRequest == true`;
- `physicalIoIsolated == false`.

Virtual motion is false while faulted.

### 4.2 E-stop

An unhealthy E-stop chain produces `ESTOPPED_RESET_REQUIRED`.

Restoring the E-stop channels does not restart the virtual machine. A deliberate reset and a new two-hand start sequence are required.

### 4.3 Safe stop

Loss of an ordinary run permissive during `RUNNING` produces `SAFE_STOPPED_RESET_REQUIRED`.

Examples include:

- guard opens;
- guard lock is lost;
- workholding is lost;
- position becomes invalid;
- homing becomes invalid;
- tool state becomes invalid;
- controller readiness is lost;
- program validation is lost;
- drive fault becomes active;
- D-001 stock control is lost;
- S-001 sheet retention is lost.

Re-establishing the condition does not resume motion.

## 5. Two-hand cycle initiation

The virtual operator station uses two independent start channels.

**CANDIDATE ENGINEERING parameter:** the current simulation default is a `500 ms` concurrence window.

The simulation enforces:

- both buttons released before reset/arming;
- independent rising edges;
- second edge within the concurrence window;
- no single-channel start;
- no permanently tied-down channel;
- no repeat cycle until both channels are released;
- no remote substitute for either channel.

This is a design-feasibility model. It is not a declaration that a future physical two-hand control is sufficient safeguarding for either machine, and it is not a PL/SIL/safety-category claim.

## 6. No jury rigging rule

The simulation is intentionally hostile to bypasses.

The following are not warnings; they change executable state and block virtual motion:

```text
channel disagreement
bypass indication
remote start request
physical I/O present in the simulation path
held-button anti-tie-down violation
late two-hand concurrence
missing workholding/material control
invalid position or home state
controller/program not ready
```

A caller cannot override the derived safety decision by setting a single positive Boolean.

## 7. Audit record

Each transition records:

```text
sequence
timestampMs
machineId
event type
beforeState
afterState
reasonCodes
changed inputs or start-channel detail
```

The surrounding future controller-in-loop record should additionally bind:

```text
job/revision identity
Store commit + envelope identity/version
machine configuration identity/version
tooling/workholding/datum binding digests
postprocessor identity/version
controller identity/version/dialect
controller-program hash
controller acceptance result
safety event trace
motion/tool event trace
simulated elapsed time
modeled outcome digest
physicalExecutionAuthorized: false
```

The purpose is reproducibility: a reviewer should be able to identify exactly why a gate opened, why it stayed closed, and which version of every relevant model participated.

## 8. LinuxCNC prototype selection

**SELECTED FOR PROTOTYPE, NOT COMMISSIONED FACT.**

LinuxCNC is the current controller-in-the-loop target because its official documentation provides simulator configurations that require no machine hardware, and HAL provides explicit signals/components for connecting controller state and modeled I/O.

Sources:

- LinuxCNC simulator configurations: https://linuxcnc.org/docs/html/nb/getting-started/running-linuxcnc.html
- LinuxCNC HAL tutorial: https://linuxcnc.org/docs/html/hal/tutorial.html

Before this project may say `CONTROLLER_IN_LOOP_VALIDATED`, a later build slice must at minimum:

1. pin an exact LinuxCNC version;
2. define separate D-001 and S-001 simulation configurations;
3. bind the safety kernel semantics into the controller/HAL simulation or replace the kernel with an equivalently tested HAL implementation;
4. pin the controller dialect and registered postprocessor version;
5. execute real controller-language programs through the real interpreter/controller configuration;
6. prove required failures block or stop the virtual cycle;
7. capture interpreter/controller acceptance and runtime traces;
8. keep all physical output adapters absent or positively isolated.

Until those tests pass, the truthful status is:

```text
SAFETY_KERNEL_IMPLEMENTED
CONTROLLER_TARGET_SELECTED_FOR_PROTOTYPE
CONTROLLER_IN_LOOP_VALIDATED = false
PHYSICAL_COMMISSIONED = false
PHYSICAL_EXECUTION_AUTHORIZED = false
```

## 9. Current verification

The current Node test suite attacks the implemented safety kernel for both machine profiles.

Expected passing behaviors include:

- deliberate reset required before first cycle;
- valid independent two-hand start succeeds;
- single-button start fails;
- concurrence timeout fails;
- tie-down fails;
- guard opening stops;
- guard reclosure does not restart;
- E-stop stops and latches reset requirement;
- redundant-channel disagreement faults;
- bypass attempt faults;
- remote-start attempt faults;
- physical-I/O-isolation loss faults;
- D-001 stock-control loss stops;
- S-001 sheet-retention loss stops;
- completed cycle cannot repeat until both start channels are released and deliberately actuated again.

## 10. Physical-machine boundary

This architecture is deliberately realistic enough to expose controller, sequencing, state, envelope and integration feasibility.

It does not model every physical hazard or every law of physics. In particular it does not by itself establish structural stiffness, cutter forces, blade/tool failure, friction, sheet buckling, dust/chip behavior, real stopping distance, sensor failure modes, workholding strength, guarding geometry, or operator reach.

Those conditions require separate physical engineering, hazard analysis, validation and commissioning.

The simulation may earn virtual evidence. It may never manufacture physical evidence.
