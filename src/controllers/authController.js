import bcrypt from 'bcryptjs';
import { Teacher } from '../models/Teacher.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { signTeacherToken } from '../utils/authToken.js';
import { formatTeacher } from './teacherController.js';

const minimumPasswordLength = 6;

function formatAuthResponse(teacher) {
  return {
    token: signTeacherToken(teacher),
    teacher: formatTeacher(teacher)
  };
}

export const registerTeacher = asyncHandler(async (req, res) => {
  const { teacherId, email, password } = req.body;

  if (!teacherId || !email || !password) {
    res.status(400);
    throw new Error('teacherId, email, and password are required');
  }

  if (String(password).length < minimumPasswordLength) {
    res.status(400);
    throw new Error(`Password must be at least ${minimumPasswordLength} characters`);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingEmail = await Teacher.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (existingEmail) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const teacher = await Teacher.findOne({ externalId: Number(teacherId) }).select('+passwordHash');

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher ID not found in school records');
  }

  if (teacher.passwordHash) {
    res.status(409);
    throw new Error('This teacher is already registered');
  }

  teacher.email = normalizedEmail;
  teacher.passwordHash = await bcrypt.hash(String(password), 12);
  await teacher.save();

  res.status(201).json(formatAuthResponse(teacher));
});

export const loginTeacher = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('email and password are required');
  }

  const teacher = await Teacher.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');

  if (!teacher?.passwordHash) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(String(password), teacher.passwordHash);

  if (!passwordMatches) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json(formatAuthResponse(teacher));
});

export const getCurrentTeacher = asyncHandler(async (req, res) => {
  res.json({ teacher: formatTeacher(req.teacher) });
});
