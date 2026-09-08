import jwt from 'jsonwebtoken';
import { Teacher } from '../models/Teacher.js';
import { asyncHandler } from './asyncHandler.js';
import { getJwtSecret } from '../utils/authToken.js';

export const protectTeacher = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(401);
    throw new Error('Login required');
  }

  let payload;

  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    res.status(401);
    throw new Error('Invalid or expired login');
  }

  const teacher = await Teacher.findById(payload.teacherId);

  if (!teacher) {
    res.status(401);
    throw new Error('Teacher account no longer exists');
  }

  req.teacher = teacher;
  next();
});

export function ensureOwnTeacherId(req, res, next) {
  if (req.teacher._id.toString() !== req.params.teacherId) {
    res.status(403);
    throw new Error('You can only access your own teacher data');
  }

  next();
}
