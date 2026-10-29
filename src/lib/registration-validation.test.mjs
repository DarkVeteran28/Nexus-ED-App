import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistrationDetails } from './registration-validation.mjs';

const validStudent = {
  role: 'student', email: 'STUDENT@SCHOOL.EDU', password: 'a-safe-password-123',
  fullName: 'Jordan Demo', registrationCode: 'x'.repeat(32), rollNumber: '27',
};

test('normalizes valid registration details', () => {
  const result = validateRegistrationDetails(validStudent);
  assert.equal(result.value.email, 'student@school.edu');
  assert.equal(result.value.rollNumber, 27);
});

test('rejects unsupported roles and malformed credentials', () => {
  assert.match(validateRegistrationDetails({ ...validStudent, role: 'admin' }).error, /supported account role/);
  assert.match(validateRegistrationDetails({ ...validStudent, email: 'bad' }).error, /valid email/);
  assert.match(validateRegistrationDetails({ ...validStudent, password: 'short' }).error, /12 and 128/);
  assert.match(validateRegistrationDetails({ ...validStudent, registrationCode: 'tiny' }).error, /school-issued/);
});

test('requires positive whole roll numbers only for student and parent registration', () => {
  assert.match(validateRegistrationDetails({ ...validStudent, rollNumber: '0' }).error, /roll number/);
  assert.match(validateRegistrationDetails({ ...validStudent, role: 'teacher', rollNumber: '' }).value.role, /teacher/);
});
