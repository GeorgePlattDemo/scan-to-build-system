const COMMON_BOOLEAN_INPUTS = Object.freeze([
  'estopChannelAHealthy',
  'estopChannelBHealthy',
  'guardChannelAClosed',
  'guardChannelBClosed',
  'guardLockChannelAEngaged',
  'guardLockChannelBEngaged',
  'safetyRelayChannelAHealthy',
  'safetyRelayChannelBHealthy',
  'workholdingConfirmed',
  'machineHomed',
  'positionValid',
  'toolStateValid',
  'controllerReady',
  'programValidated',
  'driveFaultClear',
  'physicalIoIsolated',
  'bypassDetected',
  'remoteStartRequest',
  'leftStart',
  'rightStart',
]);

export const MACHINE_SAFETY_PROFILES = Object.freeze({
  'D-001': Object.freeze({
    machineId: 'D-001',
    requiredMachineInput: 'stockControlConfirmed',
    requiredMachineReason: 'D001_STOCK_CONTROL_NOT_CONFIRMED',
  }),
  'S-001': Object.freeze({
    machineId: 'S-001',
    requiredMachineInput: 'sheetRetentionConfirmed',
    requiredMachineReason: 'S001_SHEET_RETENTION_NOT_CONFIRMED',
  }),
});

const STATES = Object.freeze({
  BLOCKED: 'BLOCKED',
  READY: 'READY_FOR_TWO_HAND_START',
  RUNNING: 'RUNNING',
  STOPPED: 'SAFE_STOPPED_RESET_REQUIRED',
  ESTOPPED: 'ESTOPPED_RESET_REQUIRED',
  FAULTED: 'SAFETY_FAULT_RESET_REQUIRED',
});

function defaultInputs(profile) {
  const inputs = Object.fromEntries(COMMON_BOOLEAN_INPUTS.map((name) => [name, false]));
  inputs[profile.requiredMachineInput] = false;
  return inputs;
}

function unique(values) {
  return [...new Set(values)];
}

export class VirtualSafetyInterlock {
  constructor({ machineId, concurrenceWindowMs = 500 } = {}) {
    const profile = MACHINE_SAFETY_PROFILES[machineId];
    if (!profile) throw new Error(`Unsupported machineId: ${machineId}`);
    if (!Number.isFinite(concurrenceWindowMs) || concurrenceWindowMs <= 0) {
      throw new Error('concurrenceWindowMs must be a positive finite number');
    }

    this.profile = profile;
    this.concurrenceWindowMs = concurrenceWindowMs;
    this.inputs = defaultInputs(profile);
    this.state = STATES.BLOCKED;
    this.resetRequired = true;
    this.sequence = 0;
    this.events = [];
    this.firstStartEdge = null;
    this.twoHandRearmRequired = true;
  }

  _log(nowMs, type, beforeState, reasonCodes = [], detail = {}) {
    const event = Object.freeze({
      sequence: ++this.sequence,
      timestampMs: nowMs,
      machineId: this.profile.machineId,
      type,
      beforeState,
      afterState: this.state,
      reasonCodes: unique(reasonCodes),
      ...detail,
    });
    this.events.push(event);
    return event;
  }

  _channelFaultReasons() {
    const reasons = [];
    if (this.inputs.estopChannelAHealthy !== this.inputs.estopChannelBHealthy) {
      reasons.push('ESTOP_CHANNEL_DISAGREEMENT');
    }
    if (this.inputs.guardChannelAClosed !== this.inputs.guardChannelBClosed) {
      reasons.push('GUARD_CHANNEL_DISAGREEMENT');
    }
    if (this.inputs.guardLockChannelAEngaged !== this.inputs.guardLockChannelBEngaged) {
      reasons.push('GUARD_LOCK_CHANNEL_DISAGREEMENT');
    }
    if (this.inputs.safetyRelayChannelAHealthy !== this.inputs.safetyRelayChannelBHealthy) {
      reasons.push('SAFETY_RELAY_CHANNEL_DISAGREEMENT');
    }
    return reasons;
  }

  _hardFaultReasons() {
    const reasons = this._channelFaultReasons();
    if (this.inputs.bypassDetected) reasons.push('SAFETY_BYPASS_DETECTED');
    if (this.inputs.remoteStartRequest) reasons.push('REMOTE_START_REQUEST_REJECTED');
    if (!this.inputs.physicalIoIsolated) reasons.push('PHYSICAL_IO_NOT_ISOLATED');
    return reasons;
  }

  _estopReasons() {
    const reasons = [];
    if (!this.inputs.estopChannelAHealthy || !this.inputs.estopChannelBHealthy) {
      reasons.push('ESTOP_CHAIN_NOT_HEALTHY');
    }
    return reasons;
  }

  _permissiveReasons() {
    const reasons = [];
    if (!this.inputs.guardChannelAClosed || !this.inputs.guardChannelBClosed) {
      reasons.push('GUARD_NOT_CLOSED');
    }
    if (!this.inputs.guardLockChannelAEngaged || !this.inputs.guardLockChannelBEngaged) {
      reasons.push('GUARD_LOCK_NOT_ENGAGED');
    }
    if (!this.inputs.safetyRelayChannelAHealthy || !this.inputs.safetyRelayChannelBHealthy) {
      reasons.push('SAFETY_RELAY_NOT_HEALTHY');
    }
    if (!this.inputs.workholdingConfirmed) reasons.push('WORKHOLDING_NOT_CONFIRMED');
    if (!this.inputs.machineHomed) reasons.push('MACHINE_NOT_HOMED');
    if (!this.inputs.positionValid) reasons.push('POSITION_NOT_VALID');
    if (!this.inputs.toolStateValid) reasons.push('TOOL_STATE_NOT_VALID');
    if (!this.inputs.controllerReady) reasons.push('CONTROLLER_NOT_READY');
    if (!this.inputs.programValidated) reasons.push('PROGRAM_NOT_VALIDATED');
    if (!this.inputs.driveFaultClear) reasons.push('DRIVE_FAULT_ACTIVE');
    if (!this.inputs[this.profile.requiredMachineInput]) {
      reasons.push(this.profile.requiredMachineReason);
    }
    return reasons;
  }

  _baseBlockingReasons() {
    return unique([
      ...this._hardFaultReasons(),
      ...this._estopReasons(),
      ...this._permissiveReasons(),
    ]);
  }

  _isBasePermissive() {
    return this._baseBlockingReasons().length === 0;
  }

  _applySafetyConsequences(nowMs, source) {
    const beforeState = this.state;
    const hardFaults = this._hardFaultReasons();
    const estopReasons = this._estopReasons();
    const permissiveReasons = this._permissiveReasons();

    if (hardFaults.length) {
      this.state = STATES.FAULTED;
      this.resetRequired = true;
      this.twoHandRearmRequired = true;
      this.firstStartEdge = null;
      return this._log(nowMs, 'SAFETY_FAULT', beforeState, hardFaults, { source });
    }

    if (estopReasons.length) {
      this.state = STATES.ESTOPPED;
      this.resetRequired = true;
      this.twoHandRearmRequired = true;
      this.firstStartEdge = null;
      return this._log(nowMs, 'ESTOP', beforeState, estopReasons, { source });
    }

    if (permissiveReasons.length) {
      if (beforeState === STATES.RUNNING) {
        this.state = STATES.STOPPED;
        this.resetRequired = true;
        this.twoHandRearmRequired = true;
        this.firstStartEdge = null;
        return this._log(nowMs, 'SAFE_STOP', beforeState, permissiveReasons, { source });
      }
      if (![STATES.STOPPED, STATES.ESTOPPED, STATES.FAULTED].includes(beforeState)) {
        this.state = STATES.BLOCKED;
      }
    } else if (!this.resetRequired && !this.twoHandRearmRequired && beforeState !== STATES.RUNNING) {
      this.state = STATES.READY;
    }

    return null;
  }

  setInput(name, value, nowMs) {
    return this.setInputs({ [name]: value }, nowMs);
  }

  setInputs(patch, nowMs) {
    if (!Number.isFinite(nowMs)) throw new Error('nowMs must be finite');
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
      throw new Error('patch must be an object');
    }

    const changes = [];
    for (const [name, value] of Object.entries(patch)) {
      if (!(name in this.inputs)) throw new Error(`Unknown safety input: ${name}`);
      if (typeof value !== 'boolean') throw new Error(`${name} must be boolean`);
      if (this.inputs[name] !== value) {
        changes.push({ name, previousValue: this.inputs[name], value });
      }
    }
    if (!changes.length) return null;

    const beforeState = this.state;
    for (const change of changes) this.inputs[change.name] = change.value;

    for (const change of changes) {
      if (change.name === 'leftStart' || change.name === 'rightStart') {
        this._handleStartInputEdge(change.name, change.previousValue, change.value, nowMs);
      }
    }

    const source = `inputs:${changes.map((change) => change.name).join(',')}`;
    const consequence = this._applySafetyConsequences(nowMs, source);
    if (consequence) return consequence;

    if (changes.some((change) => change.name !== 'leftStart' && change.name !== 'rightStart')) {
      return this._log(nowMs, 'INPUTS_CHANGED', beforeState, [], {
        changes: changes.map((change) => Object.freeze({ ...change })),
      });
    }
    return null;
  }

  _handleStartInputEdge(name, previousValue, value, nowMs) {
    const beforeState = this.state;

    if (!value && previousValue) {
      if (!this.inputs.leftStart && !this.inputs.rightStart) {
        this.firstStartEdge = null;
        this.twoHandRearmRequired = false;
        if (!this.resetRequired && this._isBasePermissive() && this.state !== STATES.RUNNING) {
          this.state = STATES.READY;
        }
        this._log(nowMs, 'TWO_HAND_RELEASED', beforeState, []);
      }
      return;
    }

    if (!value || previousValue) return;

    if (this.resetRequired) {
      this._log(nowMs, 'START_BLOCKED', beforeState, ['RESET_REQUIRED'], { startInput: name });
      return;
    }

    if (this.twoHandRearmRequired) {
      this._log(nowMs, 'START_BLOCKED', beforeState, ['TWO_HAND_RELEASE_REQUIRED'], { startInput: name });
      return;
    }

    const baseReasons = this._baseBlockingReasons();
    if (baseReasons.length) {
      this.state = STATES.BLOCKED;
      this._log(nowMs, 'START_BLOCKED', beforeState, baseReasons, { startInput: name });
      return;
    }

    if (!this.firstStartEdge) {
      this.firstStartEdge = { name, timestampMs: nowMs };
      this._log(nowMs, 'TWO_HAND_FIRST_EDGE', beforeState, [], { startInput: name });
      return;
    }

    if (this.firstStartEdge.name === name) {
      this._log(nowMs, 'START_BLOCKED', beforeState, ['TWO_HAND_INDEPENDENT_EDGE_REQUIRED'], { startInput: name });
      return;
    }

    const deltaMs = nowMs - this.firstStartEdge.timestampMs;
    if (deltaMs < 0 || deltaMs > this.concurrenceWindowMs) {
      this.firstStartEdge = null;
      this.twoHandRearmRequired = true;
      this.state = STATES.BLOCKED;
      this._log(nowMs, 'START_BLOCKED', beforeState, ['TWO_HAND_CONCURRENCE_TIMEOUT'], {
        startInput: name,
        deltaMs,
        concurrenceWindowMs: this.concurrenceWindowMs,
      });
      return;
    }

    if (!(this.inputs.leftStart && this.inputs.rightStart)) {
      this._log(nowMs, 'START_BLOCKED', beforeState, ['TWO_HAND_BOTH_CHANNELS_NOT_ACTIVE']);
      return;
    }

    this.firstStartEdge = null;
    this.twoHandRearmRequired = true;
    this.state = STATES.RUNNING;
    this._log(nowMs, 'VIRTUAL_CYCLE_STARTED', beforeState, [], { deltaMs });
  }

  reset(nowMs) {
    if (!Number.isFinite(nowMs)) throw new Error('nowMs must be finite');
    const beforeState = this.state;
    const reasons = unique([
      ...this._hardFaultReasons(),
      ...this._estopReasons(),
    ]);

    if (this.inputs.leftStart || this.inputs.rightStart) {
      reasons.push('TWO_HAND_RELEASE_REQUIRED');
    }

    if (reasons.length) {
      this.resetRequired = true;
      this.twoHandRearmRequired = true;
      return this._log(nowMs, 'RESET_DENIED', beforeState, reasons);
    }

    this.resetRequired = false;
    this.firstStartEdge = null;
    this.twoHandRearmRequired = false;
    const baseReasons = this._permissiveReasons();
    this.state = baseReasons.length ? STATES.BLOCKED : STATES.READY;
    return this._log(nowMs, 'RESET_ACCEPTED', beforeState, baseReasons);
  }

  completeVirtualCycle(nowMs) {
    if (!Number.isFinite(nowMs)) throw new Error('nowMs must be finite');
    const beforeState = this.state;
    if (this.state !== STATES.RUNNING) {
      return this._log(nowMs, 'CYCLE_COMPLETE_REJECTED', beforeState, ['NOT_RUNNING']);
    }
    this.state = STATES.BLOCKED;
    this.resetRequired = false;
    this.twoHandRearmRequired = true;
    this.firstStartEdge = null;
    return this._log(nowMs, 'VIRTUAL_CYCLE_COMPLETED', beforeState, ['TWO_HAND_RELEASE_REQUIRED']);
  }

  getSnapshot() {
    const blockingReasons = this._baseBlockingReasons();
    return Object.freeze({
      machineId: this.profile.machineId,
      state: this.state,
      resetRequired: this.resetRequired,
      twoHandRearmRequired: this.twoHandRearmRequired,
      concurrenceWindowMs: this.concurrenceWindowMs,
      baseSafetyPermissive: blockingReasons.length === 0,
      virtualCycleStartPermitted:
        this.state === STATES.READY &&
        !this.resetRequired &&
        !this.twoHandRearmRequired &&
        blockingReasons.length === 0 &&
        !this.inputs.leftStart &&
        !this.inputs.rightStart,
      virtualMotionPermitted: this.state === STATES.RUNNING,
      physicalExecutionAuthorized: false,
      physicalIoIsolated: this.inputs.physicalIoIsolated,
      blockingReasons,
      inputs: Object.freeze({ ...this.inputs }),
      events: Object.freeze([...this.events]),
    });
  }
}

export { STATES as SAFETY_STATES };
