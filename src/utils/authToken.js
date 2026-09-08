import jwt from 'jsonwebtoken';

export function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }

  return jwtSecret;
}

export function signTeacherToken(teacher) {
  return jwt.sign(
    {
      teacherId: teacher._id.toString(),
      externalId: teacher.externalId
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}
