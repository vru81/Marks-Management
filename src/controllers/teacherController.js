import mongoose from 'mongoose';
import { Teacher } from '../models/Teacher.js';
import { Student } from '../models/Student.js';
import { teacherApiData } from '../data/seedData.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { canTeachAssignment, normalizeDivision } from '../utils/teacherAccess.js';

export function formatTeacher(teacher) {
  return {
    _id: teacher._id,
    id: teacher.externalId,
    name: teacher.name,
    classTeacherOf: teacher.classTeacherOf,
    assignments: teacher.assignments
  };
}

export const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().sort({ externalId: 1 });
  res.json({ teachers: teachers.map(formatTeacher) });
});

export const getTeacherApiData = asyncHandler(async (req, res) => {
  const data = await mongoose.connection.collection('marks-management').findOne(
    { type: 'teachers' },
    { projection: { _id: 0, type: 0, updatedAt: 0 } }
  );

  res.json(data || teacherApiData);
});

export const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.teacherId);

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.json({ teacher: formatTeacher(teacher) });
});

export const getTeacherAssignments = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.teacherId).select('name assignments classTeacherOf');

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.json({
    teacherId: teacher._id,
    name: teacher.name,
    classTeacherOf: teacher.classTeacherOf,
    assignments: teacher.assignments
  });
});

export const getMyAssignments = asyncHandler(async (req, res) => {
  res.json({ teacher: formatTeacher(req.teacher) });
});

export const getAssignableStudents = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { class: classNumber, division, subject } = req.query;

  if (!classNumber || !division || !subject) {
    res.status(400);
    throw new Error('class, division, and subject query params are required');
  }

  const teacher = await Teacher.findById(teacherId);

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  if (!canTeachAssignment(teacher, classNumber, division, subject)) {
    res.status(403);
    throw new Error('Teacher is not assigned to this class, division, and subject');
  }

  const students = await Student.find({
    class: Number(classNumber),
    division: normalizeDivision(division)
  }).sort({ rollNumber: 1 });

  res.json({ students });
});

export const getMyAssignableStudents = asyncHandler(async (req, res) => {
  const { class: classNumber, division, subject } = req.query;

  if (!classNumber || !division || !subject) {
    res.status(400);
    throw new Error('class, division, and subject query params are required');
  }

  if (!canTeachAssignment(req.teacher, classNumber, division, subject)) {
    res.status(403);
    throw new Error('Teacher is not assigned to this class, division, and subject');
  }

  const students = await Student.find({
    class: Number(classNumber),
    division: normalizeDivision(division)
  }).sort({ rollNumber: 1 });

  res.json({ students });
});
