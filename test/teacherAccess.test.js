import assert from 'node:assert/strict';
import test from 'node:test';
import { canTeachAssignment } from '../src/utils/teacherAccess.js';

const teacher = {
  assignments: [
    {
      class: 8,
      division: 'A',
      subjects: ['Mathematics', 'Science']
    },
    {
      class: 12,
      division: 'B',
      subjects: ['Physics']
    }
  ]
};

test('allows only assigned class, division, and subject combinations', () => {
  assert.equal(canTeachAssignment(teacher, 8, 'A', 'Mathematics'), true);
  assert.equal(canTeachAssignment(teacher, 8, 'a', 'science'), true);
  assert.equal(canTeachAssignment(teacher, 8, 'B', 'Mathematics'), false);
  assert.equal(canTeachAssignment(teacher, 8, 'A', 'English'), false);
  assert.equal(canTeachAssignment(teacher, 12, 'A', 'Physics'), false);
});
