import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardForRole, isSupportedRole, requiredRoleForPath } from './route-access.mjs';

test('maps each supported role to its intended dashboard', () => {
  assert.equal(dashboardForRole('student'), '/dashboard/student/chat');
  assert.equal(dashboardForRole('teacher'), '/dashboard/teacher/enrollment');
  assert.equal(dashboardForRole('admin'), '/dashboard/admin/teachers');
  assert.equal(dashboardForRole('parent'), '/dashboard/parent');
  assert.equal(dashboardForRole('unknown'), undefined);
});

test('recognizes only supported application roles', () => {
  for (const role of ['student', 'teacher', 'admin', 'parent']) assert.equal(isSupportedRole(role), true);
  assert.equal(isSupportedRole('owner'), false);
  assert.equal(isSupportedRole(undefined), false);
});

test('requires the right role for dashboard paths without matching lookalike prefixes', () => {
  assert.equal(requiredRoleForPath('/dashboard/admin/teachers'), 'admin');
  assert.equal(requiredRoleForPath('/dashboard/student/progress'), 'student');
  assert.equal(requiredRoleForPath('/dashboard/studentish'), undefined);
  assert.equal(requiredRoleForPath('/login'), undefined);
});
