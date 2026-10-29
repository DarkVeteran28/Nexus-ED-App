import test from 'node:test';
import assert from 'node:assert/strict';
import { findUserByEmail, isRemovableDemoAdmin, isReusableDemoAdmin, normalizeEmail } from './demo-admin-helpers.mjs';

test('normalizes demo email for a case-insensitive match', () => {
  assert.equal(normalizeEmail('  DEMO@EXAMPLE.EDU '), 'demo@example.edu');
  assert.equal(findUserByEmail([{ email: 'Demo@Example.edu' }], 'demo@example.edu').email, 'Demo@Example.edu');
});

test('reuses only an account carrying both demo admin markers', () => {
  assert.equal(isReusableDemoAdmin({ app_metadata: { role: 'admin', demo_account: true } }), true);
  assert.equal(isReusableDemoAdmin({ app_metadata: { role: 'admin' } }), false);
  assert.equal(isReusableDemoAdmin({ app_metadata: { role: 'student', demo_account: true } }), false);
});

test('removal guard rejects ordinary and non-admin accounts', () => {
  assert.equal(isRemovableDemoAdmin({ app_metadata: { role: 'admin', demo_account: true } }), true);
  assert.equal(isRemovableDemoAdmin({ app_metadata: { role: 'admin', demo_account: false } }), false);
  assert.equal(isRemovableDemoAdmin({ app_metadata: { role: 'parent', demo_account: true } }), false);
});
