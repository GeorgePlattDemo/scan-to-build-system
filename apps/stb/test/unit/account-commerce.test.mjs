import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CUSTOMER_ZERO,
  PROJECT_LIBRARY_SEED,
  ROUTES,
  screenFromPath,
} from '../../shared/contracts.mjs';

test('Customer Zero is an explicit synthetic account fixture', () => {
  assert.equal(CUSTOMER_ZERO.fixture, true);
  assert.equal(CUSTOMER_ZERO.name, 'Sarah Smith');
  assert.equal(CUSTOMER_ZERO.addressLine1, '123 Alcove Lane');
  assert.equal(CUSTOMER_ZERO.city, 'Greensboro');
  assert.equal(CUSTOMER_ZERO.region, 'NC');
});

test('anonymous project library seed contains no Customer Zero identity', () => {
  const serialized = JSON.stringify(PROJECT_LIBRARY_SEED);
  assert.doesNotMatch(serialized, /Sarah Smith|123 Alcove Lane|ACCT-000001|Greensboro/i);
  assert.equal(PROJECT_LIBRARY_SEED[0].classId, 'alcove-shelf-blanks');
  assert.deepEqual([...PROJECT_LIBRARY_SEED[0].workstreams], ['dimensional']);
});

test('account is a separate global route, not a project view', () => {
  assert.equal(ROUTES.account, '/account');
  assert.equal(screenFromPath('/account').name, 'account');
});
