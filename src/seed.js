import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { Student } from './models/Student.js';
import { Teacher } from './models/Teacher.js';
import { students, teacherApiData, teachers } from './data/seedData.js';

let exitCode = 0;

try {
  await connectDB();

  const teacherOperations = teachers.map((teacher) => ({
    updateOne: {
      filter: { externalId: teacher.externalId },
      update: {
        $set: {
          name: teacher.name,
          classTeacherOf: teacher.classTeacherOf,
          assignments: teacher.assignments
        },
        $setOnInsert: {
          externalId: teacher.externalId
        }
      },
      upsert: true
    }
  }));

  const studentOperations = students.map((student) => ({
    updateOne: {
      filter: {
        class: student.class,
        division: student.division,
        rollNumber: student.rollNumber
      },
      update: {
        $set: { name: student.name },
        $setOnInsert: {
          class: student.class,
          division: student.division,
          rollNumber: student.rollNumber
        }
      },
      upsert: true
    }
  }));

  const [teacherResult, studentResult] = await Promise.all([
    Teacher.bulkWrite(teacherOperations),
    Student.bulkWrite(studentOperations)
  ]);

  await mongoose.connection.collection('marks-management').replaceOne(
    { type: 'teachers' },
    {
      type: 'teachers',
      ...teacherApiData,
      updatedAt: new Date()
    },
    { upsert: true }
  );

  console.log(`Teachers added: ${teacherResult.upsertedCount}, updated: ${teacherResult.modifiedCount}`);
  console.log(`Students added: ${studentResult.upsertedCount}, updated: ${studentResult.modifiedCount}`);
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
