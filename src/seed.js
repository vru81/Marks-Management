import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Mark } from './models/Mark.js';
import { Student } from './models/Student.js';
import { Teacher } from './models/Teacher.js';
import { students, teacherApiData, teachers } from './data/seedData.js';

let exitCode = 0;

try {
  await connectDB();

  await Promise.all([Teacher.deleteMany({}), Student.deleteMany({}), Mark.deleteMany({})]);

  const createdTeachers = await Teacher.insertMany(teachers);
  const createdStudents = await Student.insertMany(students);

  await mongoose.connection.collection('marks-management').replaceOne(
    { type: 'teachers' },
    {
      type: 'teachers',
      ...teacherApiData,
      updatedAt: new Date()
    },
    { upsert: true }
  );

  console.log(`Seeded ${createdTeachers.length} teachers`);
  console.log(`Seeded ${createdStudents.length} students`);
  console.log('Seeded marks-management teacher API document');
} catch (error) {
  console.error(error.message);
  exitCode = 1;
} finally {
  await mongoose.connection.close();
}

if (exitCode) {
  process.exit(exitCode);
}
