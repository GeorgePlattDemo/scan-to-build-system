import test from 'node:test';
import assert from 'node:assert/strict';
import { VirtualSafetyInterlock, SAFETY_STATES } from './safety-interlock.mjs';

function healthy(controller, machineId, t = 0) {
  const common = {
    estopChannelAHealthy: true,
    estopChannelBHealthy: true,
    guardChannelAClosed: true,
    guardChannelBClosed: true,
    guardLockChannelAEngaged: true,
    guardLockChannelBEngaged: true,
    safetyRelayChannelAHealthy: true,
    safetyRelayChannelBHealthy: true,
    workholdingConfirmed: true,
    machineHomed: true,
    positionValid: true,
    toolStateValid: true,
    controllerReady: true,
    programValidated: true,
    driveFaultClear: true,
    physicalIoIsolated: true,
    bypassDetected: false,
    remoteStartRequest: false,
  };
  const profile = machineId === 'D-001'
    ? { stockControlConfirmed: true }
    : { sheetRetentionConfirmed: true };
  const now = t + 1;
  controller.setInputs({ ...common, ...profile }, now);
  return now;
}

function freshHealthy(machineId = 'D-001') {
  const c = new VirtualSafetyInterlock({ machineId, concurrenceWindowMs: 500 });
  let now = healthy(c, machineId);
  c.reset(++now);
  return { c, now };
}

function twoHandStart(c, now, delta = 100) {
  c.setInput('leftStart', true, ++now);
  now += delta;
  c.setInput('rightStart', true, now);
  return now;
}

test('healthy machine is still blocked until deliberate reset', () => {
  const c = new VirtualSafetyInterlock({ machineId: 'D-001' });
  const now = healthy(c, 'D-001');
  const s = c.getSnapshot();
  assert.equal(s.baseSafetyPermissive, true);
  assert.equal(s.resetRequired, true);
  assert.equal(s.virtualCycleStartPermitted, false);
  assert.equal(s.state, SAFETY_STATES.BLOCKED);
  assert.equal(s.physicalExecutionAuthorized, false);
  assert.ok(now > 0);
});

test('valid independent two-hand action starts a virtual cycle', () => {
  const { c } = freshHealthy('D-001');
  twoHandStart(c, 1000, 120);
  const s = c.getSnapshot();
  assert.equal(s.state, SAFETY_STATES.RUNNING);
  assert.equal(s.virtualMotionPermitted, true);
  assert.equal(s.physicalExecutionAuthorized, false);
});

test('one start button alone never starts the cycle', () => {
  const { c } = freshHealthy('D-001');
  c.setInput('leftStart', true, 1000);
  const s = c.getSnapshot();
  assert.notEqual(s.state, SAFETY_STATES.RUNNING);
  assert.equal(s.virtualMotionPermitted, false);
});

test('late second start channel blocks and requires both buttons released', () => {
  const { c } = freshHealthy('D-001');
  c.setInput('leftStart', true, 1000);
  c.setInput('rightStart', true, 1600);
  let s = c.getSnapshot();
  assert.notEqual(s.state, SAFETY_STATES.RUNNING);
  assert.equal(s.twoHandRearmRequired, true);
  assert.ok(s.events.at(-1).reasonCodes.includes('TWO_HAND_CONCURRENCE_TIMEOUT'));

  c.setInput('leftStart', false, 1700);
  c.setInput('rightStart', false, 1701);
  s = c.getSnapshot();
  assert.equal(s.twoHandRearmRequired, false);
  assert.equal(s.state, SAFETY_STATES.READY);
});

test('held start channel prevents reset and anti-tie-down bypass', () => {
  const c = new VirtualSafetyInterlock({ machineId: 'D-001' });
  let now = healthy(c, 'D-001');
  c.setInput('leftStart', true, ++now);
  const event = c.reset(++now);
  assert.equal(event.type, 'RESET_DENIED');
  assert.ok(event.reasonCodes.includes('TWO_HAND_RELEASE_REQUIRED'));
  assert.equal(c.getSnapshot().resetRequired, true);
});

test('guard opening during run causes safe stop and no automatic restart on reclose', () => {
  const { c } = freshHealthy('D-001');
  let now = twoHandStart(c, 1000, 100);
  assert.equal(c.getSnapshot().state, SAFETY_STATES.RUNNING);

  c.setInputs({ guardChannelAClosed: false, guardChannelBClosed: false }, ++now);
  assert.equal(c.getSnapshot().state, SAFETY_STATES.STOPPED);
  assert.equal(c.getSnapshot().resetRequired, true);

  c.setInputs({ guardChannelAClosed: true, guardChannelBClosed: true }, ++now);
  assert.notEqual(c.getSnapshot().state, SAFETY_STATES.RUNNING);
  assert.equal(c.getSnapshot().virtualMotionPermitted, false);
});

test('estop during run latches estopped state and requires reset', () => {
  const { c } = freshHealthy('D-001');
  let now = twoHandStart(c, 1000, 100);
  c.setInputs({ estopChannelAHealthy: false, estopChannelBHealthy: false }, ++now);
  const s = c.getSnapshot();
  assert.equal(s.state, SAFETY_STATES.ESTOPPED);
  assert.equal(s.resetRequired, true);
  assert.equal(s.virtualMotionPermitted, false);
});

test('disagreement in redundant guard channels is a latched safety fault', () => {
  const { c } = freshHealthy('D-001');
  c.setInput('guardChannelAClosed', false, 2000);
  const s = c.getSnapshot();
  assert.equal(s.state, SAFETY_STATES.FAULTED);
  assert.ok(s.blockingReasons.includes('GUARD_CHANNEL_DISAGREEMENT'));
});

test('detected safety bypass faults closed', () => {
  const { c } = freshHealthy('D-001');
  c.setInput('bypassDetected', true, 2000);
  const s = c.getSnapshot();
  assert.equal(s.state, SAFETY_STATES.FAULTED);
  assert.ok(s.blockingReasons.includes('SAFETY_BYPASS_DETECTED'));
  assert.equal(s.virtualMotionPermitted, false);
});

test('remote cycle-start request is rejected as a safety fault', () => {
  const { c } = freshHealthy('D-001');
  c.setInput('remoteStartRequest', true, 2000);
  const s = c.getSnapshot();
  assert.equal(s.state, SAFETY_STATES.FAULTED);
  assert.ok(s.blockingReasons.includes('REMOTE_START_REQUEST_REJECTED'));
});

test('simulator refuses to arm if physical I/O isolation is lost', () => {
  const { c } = freshHealthy('D-001');
  c.setInput('physicalIoIsolated', false, 2000);
  const s = c.getSnapshot();
  assert.equal(s.state, SAFETY_STATES.FAULTED);
  assert.ok(s.blockingReasons.includes('PHYSICAL_IO_NOT_ISOLATED'));
  assert.equal(s.physicalExecutionAuthorized, false);
});

test('loss of dimensional stock control during run causes safe stop', () => {
  const { c } = freshHealthy('D-001');
  let now = twoHandStart(c, 1000, 100);
  c.setInput('stockControlConfirmed', false, ++now);
  const s = c.getSnapshot();
  assert.equal(s.state, SAFETY_STATES.STOPPED);
  assert.ok(s.blockingReasons.includes('D001_STOCK_CONTROL_NOT_CONFIRMED'));
});

test('sheet machine has an independent sheet-retention permissive', () => {
  const { c } = freshHealthy('S-001');
  let now = twoHandStart(c, 1000, 100);
  assert.equal(c.getSnapshot().state, SAFETY_STATES.RUNNING);
  c.setInput('sheetRetentionConfirmed', false, ++now);
  const s = c.getSnapshot();
  assert.equal(s.state, SAFETY_STATES.STOPPED);
  assert.ok(s.blockingReasons.includes('S001_SHEET_RETENTION_NOT_CONFIRMED'));
});

test('cycle completion cannot self-repeat; fresh two-hand release/repress is required', () => {
  const { c } = freshHealthy('D-001');
  let now = twoHandStart(c, 1000, 100);
  c.completeVirtualCycle(++now);
  let s = c.getSnapshot();
  assert.equal(s.virtualMotionPermitted, false);
  assert.equal(s.twoHandRearmRequired, true);

  c.setInput('leftStart', false, ++now);
  c.setInput('rightStart', false, ++now);
  s = c.getSnapshot();
  assert.equal(s.state, SAFETY_STATES.READY);
  assert.equal(s.virtualCycleStartPermitted, true);
});
