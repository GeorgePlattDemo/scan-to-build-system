import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ACTOR_DEMO_ACCOUNT_IDS,
  CUSTOMER_ZERO,
  DEMO_ACCOUNTS,
  PROJECT_LIBRARY_SEED,
  ROUTES,
  screenFromPath,
} from '../../shared/contracts.mjs';

test('Customer Zero is User 1 and three synthetic account fixtures seed all three doors', () => {
  assert.equal(DEMO_ACCOUNTS.length, 3);
  assert.equal(CUSTOMER_ZERO, DEMO_ACCOUNTS[0]);
  assert.equal(CUSTOMER_ZERO.fixture, true);
  assert.equal(CUSTOMER_ZERO.name, 'Sarah');
  assert.equal(CUSTOMER_ZERO.addressLine1, '123 Alcove Lane');
  assert.equal(CUSTOMER_ZERO.city, 'Greensboro');
  assert.equal(CUSTOMER_ZERO.region, 'NC');
  assert.deepEqual([...CUSTOMER_ZERO.tags], ['INDIVIDUAL']);
  assert.deepEqual(ACTOR_DEMO_ACCOUNT_IDS, {
    new: 'ACCT-000001',
    returning: 'ACCT-000002',
    professional: 'ACCT-000003',
  });
  assert.deepEqual([...DEMO_ACCOUNTS[2].tags], ['PROFESSIONAL', 'CONTRACTOR']);
});

test('anonymous project library seed contains no Customer Zero identity', () => {
  const serialized = JSON.stringify(PROJECT_LIBRARY_SEED);
  assert.doesNotMatch(serialized, /Sarah|123 Alcove Lane|ACCT-000001|Greensboro/i);
  assert.equal(PROJECT_LIBRARY_SEED[0].classId, 'alcove-shelf-blanks');
  assert.deepEqual([...PROJECT_LIBRARY_SEED[0].workstreams], ['dimensional']);
});

test('account is a separate global route, not a project view', () => {
  assert.equal(ROUTES.account, '/account');
  assert.equal(screenFromPath('/account').name, 'account');
});
